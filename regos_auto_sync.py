#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
REGOS API - Avtomatik Xodimlar va Savdo Sinxronizatsiyasi
Faqat token qo'ying va ishga tushiring!
"""

import os
import sys
import json
import requests
from datetime import datetime
import pymongo
from typing import Dict, List, Optional

# ==================== KONFIGURATSIYA ====================

# REGOS API
REGOS_API_URL = os.getenv("REGOS_API_URL", "https://api.regos.uz/v1")
REGOS_TOKEN = os.getenv("REGOS_TOKEN")

# MongoDB
MONGODB_URI = os.getenv("MONGODB_URI", "mongodb://localhost:27017/salary-management")

# Ranglar
GREEN = '\033[92m'
RED = '\033[91m'
YELLOW = '\033[93m'
BLUE = '\033[94m'
CYAN = '\033[96m'
RESET = '\033[0m'

# ==================== HELPER FUNKSIYALAR ====================

def log_success(msg):
    print(f"{GREEN}✅ {msg}{RESET}")

def log_error(msg):
    print(f"{RED}❌ {msg}{RESET}")

def log_warning(msg):
    print(f"{YELLOW}⚠️  {msg}{RESET}")

def log_info(msg):
    print(f"{BLUE}ℹ️  {msg}{RESET}")

def log_header(msg):
    print(f"\n{CYAN}{'=' * 70}{RESET}")
    print(f"{CYAN}{msg:^70}{RESET}")
    print(f"{CYAN}{'=' * 70}{RESET}\n")

# ==================== REGOS API FUNKSIYALARI ====================

def get_regos_sales_data(date: str) -> Optional[Dict]:
    """REGOS dan savdo ma'lumotlarini olish"""
    try:
        url = f"{REGOS_API_URL}/Sale/Get"
        
        headers = {
            "Authorization": f"Bearer {REGOS_TOKEN}",
            "Content-Type": "application/json"
        }
        
        payload = {
            "date_from": f"{date} 00:00:00",
            "date_to": f"{date} 23:59:59",
            "stock_id": 1,
            "group_by_item": False  # Xodim bo'yicha guruhlash
        }
        
        log_info(f"REGOS API: {url}")
        log_info(f"Sana: {date}")
        
        response = requests.post(url, headers=headers, json=payload, timeout=30)
        
        if response.status_code == 200:
            data = response.json()
            log_success(f"Ma'lumotlar olindi: {len(data.get('result', []))} ta yozuv")
            return data
        else:
            log_error(f"HTTP {response.status_code}: {response.text[:200]}")
            return None
            
    except Exception as e:
        log_error(f"Xatolik: {str(e)}")
        return None

def get_regos_employees() -> Optional[List]:
    """REGOS dan xodimlar ro'yxatini olish"""
    try:
        url = f"{REGOS_API_URL}/Employee/List"
        
        headers = {
            "Authorization": f"Bearer {REGOS_TOKEN}",
            "Content-Type": "application/json"
        }
        
        log_info(f"Xodimlar ro'yxati so'ralmoqda...")
        
        response = requests.get(url, headers=headers, timeout=30)
        
        if response.status_code == 200:
            data = response.json()
            employees = data.get('result', [])
            log_success(f"Xodimlar olindi: {len(employees)} ta")
            return employees
        elif response.status_code == 404:
            log_warning("Employee/List endpoint topilmadi")
            return None
        else:
            log_error(f"HTTP {response.status_code}")
            return None
            
    except Exception as e:
        log_error(f"Xatolik: {str(e)}")
        return None

# ==================== MA'LUMOTLARNI QAYTA ISHLASH ====================

def process_sales_data(sales_data: Dict) -> Dict:
    """
    REGOS ma'lumotlarini qayta ishlash
    Xodim bo'yicha savdoni guruhlash
    """
    if not sales_data or 'result' not in sales_data:
        return {}
    
    employees_sales = {}
    
    for sale in sales_data['result']:
        # Xodim ma'lumotlarini olish (turli maydon nomlari bo'lishi mumkin)
        employee_id = sale.get('employee_id') or sale.get('cashier_id') or sale.get('user_id')
        employee_name = sale.get('employee_name') or sale.get('cashier') or sale.get('seller') or sale.get('user_name')
        position = sale.get('position') or sale.get('role') or 'sotuvchi'
        
        # Savdo ma'lumotlari
        amount = sale.get('total_amount', 0) or sale.get('amount', 0)
        sale_type = sale.get('sale_type', 'retail')
        
        # Agar xodim ma'lumoti bo'lmasa, o'tkazib yuboramiz
        if not employee_name:
            continue
        
        # Xodim ID sifatida nom yoki ID ishlatamiz
        emp_key = str(employee_id) if employee_id else employee_name
        
        # Xodim uchun ma'lumot yaratish
        if emp_key not in employees_sales:
            employees_sales[emp_key] = {
                'employee_id': employee_id,
                'name': employee_name,
                'position': position,
                'retail_sales': 0,
                'wholesale_sales': 0,
                'total_sales': 0
            }
        
        # Savdo turini aniqlash
        if sale_type in ['wholesale', 'optom', 'opt']:
            employees_sales[emp_key]['wholesale_sales'] += amount
        else:
            employees_sales[emp_key]['retail_sales'] += amount
        
        employees_sales[emp_key]['total_sales'] += amount
    
    return employees_sales

# ==================== MONGODB GA YOZISH ====================

def sync_to_mongodb(employees_data: Dict, date: str) -> bool:
    """MongoDB ga xodimlar va savdo ma'lumotlarini yozish"""
    try:
        # MongoDB ga ulanish
        client = pymongo.MongoClient(MONGODB_URI)
        db = client.get_default_database()
        
        log_info("MongoDB ga ulanildi")
        
        # Har bir xodim uchun
        for emp_key, emp_data in employees_data.items():
            # Xodimni topish (ism bo'yicha)
            employee = db.employees.find_one({
                'name': {'$regex': emp_data['name'], '$options': 'i'}
            })
            
            if employee:
                # Mavjud xodimni yangilash
                db.employees.update_one(
                    {'_id': employee['_id']},
                    {
                        '$set': {
                            'dailySales': emp_data['retail_sales'],
                            'wholesaleSales': emp_data['wholesale_sales'],
                            'lastSalesDate': date
                        }
                    }
                )
                log_success(f"Yangilandi: {emp_data['name']} - {emp_data['total_sales']:,} so'm")
            else:
                log_warning(f"Topilmadi: {emp_data['name']} (MongoDB da yo'q)")
        
        client.close()
        return True
        
    except Exception as e:
        log_error(f"MongoDB xatosi: {str(e)}")
        return False

# ==================== NATIJALARNI CHIQARISH ====================

def print_summary(employees_data: Dict):
    """Natijalarni chiroyli ko'rinishda chiqarish"""
    log_header("📊 NATIJALAR")
    
    if not employees_data:
        log_warning("Ma'lumot topilmadi")
        return
    
    print(f"{'Xodim':<20} {'Lavozim':<15} {'Chakana':<15} {'Optom':<15} {'Jami':<15}")
    print("─" * 80)
    
    total_retail = 0
    total_wholesale = 0
    
    for emp_data in employees_data.values():
        name = emp_data['name'][:18]
        position = emp_data['position'][:13]
        retail = emp_data['retail_sales']
        wholesale = emp_data['wholesale_sales']
        total = emp_data['total_sales']
        
        print(f"{name:<20} {position:<15} {retail:>13,} {wholesale:>13,} {total:>13,}")
        
        total_retail += retail
        total_wholesale += wholesale
    
    print("─" * 80)
    print(f"{'JAMI':<20} {'':<15} {total_retail:>13,} {total_wholesale:>13,} {total_retail + total_wholesale:>13,}")
    print()

def save_to_json(employees_data: Dict, date: str):
    """Natijalarni JSON faylga saqlash"""
    try:
        filename = f"regos_employees_{date}.json"
        
        output = {
            'date': date,
            'timestamp': datetime.now().isoformat(),
            'employees': list(employees_data.values()),
            'summary': {
                'total_employees': len(employees_data),
                'total_retail_sales': sum(e['retail_sales'] for e in employees_data.values()),
                'total_wholesale_sales': sum(e['wholesale_sales'] for e in employees_data.values()),
                'total_sales': sum(e['total_sales'] for e in employees_data.values())
            }
        }
        
        with open(filename, 'w', encoding='utf-8') as f:
            json.dump(output, f, ensure_ascii=False, indent=2)
        
        log_success(f"JSON fayl saqlandi: {filename}")
        
    except Exception as e:
        log_error(f"JSON saqlashda xatolik: {str(e)}")

# ==================== ASOSIY FUNKSIYA ====================

def main():
    log_header("🚀 REGOS AVTOMATIK SINXRONIZATSIYA")
    
    # 1. Token tekshiruvi
    if not REGOS_TOKEN:
        log_error("REGOS_TOKEN topilmadi!")
        log_info("export REGOS_TOKEN='your_token_here'")
        sys.exit(1)
    
    log_success(f"Token topildi ({len(REGOS_TOKEN)} belgi)")
    
    # 2. Sana
    date = sys.argv[1] if len(sys.argv) > 1 else datetime.now().strftime("%Y-%m-%d")
    log_info(f"Sana: {date}")
    
    # 3. REGOS dan ma'lumot olish
    log_header("📡 REGOS API dan ma'lumot olish")
    sales_data = get_regos_sales_data(date)
    
    if not sales_data:
        log_error("Ma'lumot olinmadi!")
        sys.exit(1)
    
    # 4. Ma'lumotlarni qayta ishlash
    log_header("⚙️  Ma'lumotlarni qayta ishlash")
    employees_data = process_sales_data(sales_data)
    
    if not employees_data:
        log_warning("Xodim ma'lumotlari topilmadi!")
        log_info("REGOS API javobida xodim maydonlari yo'q")
        log_info("test_regos_employees.py scriptini ishga tushiring")
        sys.exit(1)
    
    # 5. Natijalarni ko'rsatish
    print_summary(employees_data)
    
    # 6. JSON ga saqlash
    save_to_json(employees_data, date)
    
    # 7. MongoDB ga yozish
    log_header("💾 MongoDB ga sinxronizatsiya")
    
    sync_choice = input("MongoDB ga yozishni xohlaysizmi? (y/n): ").lower()
    
    if sync_choice == 'y':
        success = sync_to_mongodb(employees_data, date)
        if success:
            log_success("MongoDB ga muvaffaqiyatli yozildi!")
        else:
            log_error("MongoDB ga yozishda xatolik")
    else:
        log_info("MongoDB ga yozish o'tkazib yuborildi")
    
    log_header("✅ JARAYON YAKUNLANDI")

if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        print("\n\n❌ Foydalanuvchi tomonidan to'xtatildi")
        sys.exit(0)
    except Exception as e:
        log_error(f"Kutilmagan xatolik: {str(e)}")
        sys.exit(1)
