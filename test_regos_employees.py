#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
REGOS API - Xodimlar va Savdo Ma'lumotlarini Test Qilish
Bu script REGOS API dan qanday ma'lumotlar olish mumkinligini tekshiradi
"""

import os
import sys
import json
import requests
from datetime import datetime

# Ranglar
GREEN = '\033[92m'
RED = '\033[91m'
YELLOW = '\033[93m'
BLUE = '\033[94m'
CYAN = '\033[96m'
RESET = '\033[0m'

def print_header(text):
    print(f"\n{BLUE}{'=' * 70}{RESET}")
    print(f"{BLUE}{text:^70}{RESET}")
    print(f"{BLUE}{'=' * 70}{RESET}\n")

def print_section(text):
    print(f"\n{CYAN}{'─' * 70}{RESET}")
    print(f"{CYAN}{text}{RESET}")
    print(f"{CYAN}{'─' * 70}{RESET}")

def print_success(text):
    print(f"{GREEN}✅ {text}{RESET}")

def print_error(text):
    print(f"{RED}❌ {text}{RESET}")

def print_warning(text):
    print(f"{YELLOW}⚠️  {text}{RESET}")

def print_info(text):
    print(f"ℹ️  {text}")

def print_json(data, max_items=5):
    """JSON ma'lumotni chiroyli ko'rinishda chiqarish"""
    if isinstance(data, list):
        print(f"📊 Jami: {len(data)} ta yozuv")
        print(f"🔍 Birinchi {min(max_items, len(data))} ta yozuv:\n")
        for i, item in enumerate(data[:max_items], 1):
            print(f"{i}. {json.dumps(item, ensure_ascii=False, indent=2)}")
            print()
    else:
        print(json.dumps(data, ensure_ascii=False, indent=2))

# ==================== TEST FUNKSIYALARI ====================

def test_sale_get(token):
    """
    Test 1: Sale/Get endpoint - Savdo ma'lumotlari
    Bu endpoint xodim ma'lumotlarini qaytaradimi?
    """
    print_section("TEST 1: Sale/Get - Savdo Ma'lumotlari")
    
    url = "https://api.regos.uz/v1/Sale/Get"
    
    today = datetime.now()
    date_from = today.replace(hour=0, minute=0, second=0).strftime("%Y-%m-%d %H:%M:%S")
    date_to = today.replace(hour=23, minute=59, second=59).strftime("%Y-%m-%d %H:%M:%S")
    
    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json"
    }
    
    payload = {
        "date_from": date_from,
        "date_to": date_to,
        "stock_id": 1,
        "group_by_item": True
    }
    
    print_info(f"So'rov: {url}")
    print_info(f"Sana: {date_from} - {date_to}")
    
    try:
        response = requests.post(url, headers=headers, json=payload, timeout=30)
        
        if response.status_code == 200:
            data = response.json()
            print_success("Ma'lumotlar olindi!")
            
            # Javob strukturasini tahlil qilish
            print("\n📋 Javob strukturasi:")
            if isinstance(data, dict):
                print(f"   Kalitlar: {list(data.keys())}")
                
                if 'result' in data and isinstance(data['result'], list) and len(data['result']) > 0:
                    print(f"\n🔍 Birinchi yozuv maydonlari:")
                    first_item = data['result'][0]
                    for key, value in first_item.items():
                        print(f"   • {key}: {value} ({type(value).__name__})")
                    
                    # Xodim ma'lumotlari bormi?
                    employee_fields = ['employee', 'cashier', 'seller', 'user', 'staff', 'worker']
                    found_employee_fields = [f for f in employee_fields if f in first_item]
                    
                    if found_employee_fields:
                        print_success(f"\n✅ Xodim maydonlari topildi: {found_employee_fields}")
                    else:
                        print_warning("\n⚠️  Xodim maydonlari topilmadi")
                        print_info("Mavjud maydonlar: " + ", ".join(first_item.keys()))
                    
                    # Savdo turi bormi?
                    sale_type_fields = ['sale_type', 'type', 'category', 'retail', 'wholesale']
                    found_type_fields = [f for f in sale_type_fields if f in first_item]
                    
                    if found_type_fields:
                        print_success(f"✅ Savdo turi maydonlari: {found_type_fields}")
                    else:
                        print_warning("⚠️  Savdo turi maydoni topilmadi")
                    
                    # To'liq ma'lumotni ko'rsatish
                    print_json(data['result'], max_items=3)
                    
            return data
        else:
            print_error(f"Xatolik: {response.status_code}")
            print_info(f"Javob: {response.text[:300]}")
            return None
            
    except Exception as e:
        print_error(f"Xatolik: {str(e)}")
        return None

def test_employee_list(token):
    """
    Test 2: Employee/List endpoint - Xodimlar ro'yxati
    """
    print_section("TEST 2: Employee/List - Xodimlar Ro'yxati")
    
    url = "https://api.regos.uz/v1/Employee/List"
    
    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json"
    }
    
    print_info(f"So'rov: {url}")
    
    try:
        response = requests.get(url, headers=headers, timeout=30)
        
        if response.status_code == 200:
            data = response.json()
            print_success("Xodimlar ro'yxati olindi!")
            
            if 'result' in data and isinstance(data['result'], list):
                print(f"\n📊 Jami xodimlar: {len(data['result'])}")
                
                if len(data['result']) > 0:
                    print("\n🔍 Birinchi xodim ma'lumotlari:")
                    first_employee = data['result'][0]
                    for key, value in first_employee.items():
                        print(f"   • {key}: {value}")
                    
                    print_json(data['result'], max_items=3)
            
            return data
        elif response.status_code == 404:
            print_warning("Endpoint topilmadi (404)")
            print_info("Bu endpoint mavjud emas yoki boshqa nom bilan chaqiriladi")
            return None
        else:
            print_error(f"Xatolik: {response.status_code}")
            return None
            
    except Exception as e:
        print_error(f"Xatolik: {str(e)}")
        return None

def test_user_list(token):
    """
    Test 3: User/List endpoint - Foydalanuvchilar ro'yxati
    """
    print_section("TEST 3: User/List - Foydalanuvchilar Ro'yxati")
    
    url = "https://api.regos.uz/v1/User/List"
    
    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json"
    }
    
    print_info(f"So'rov: {url}")
    
    try:
        response = requests.get(url, headers=headers, timeout=30)
        
        if response.status_code == 200:
            data = response.json()
            print_success("Foydalanuvchilar ro'yxati olindi!")
            print_json(data.get('result', []), max_items=3)
            return data
        elif response.status_code == 404:
            print_warning("Endpoint topilmadi (404)")
            return None
        else:
            print_error(f"Xatolik: {response.status_code}")
            return None
            
    except Exception as e:
        print_error(f"Xatolik: {str(e)}")
        return None

def test_sale_by_employee(token):
    """
    Test 4: Sale/GetByEmployee - Xodim bo'yicha savdo
    """
    print_section("TEST 4: Sale/GetByEmployee - Xodim Bo'yicha Savdo")
    
    url = "https://api.regos.uz/v1/Sale/GetByEmployee"
    
    today = datetime.now()
    date_from = today.replace(hour=0, minute=0, second=0).strftime("%Y-%m-%d %H:%M:%S")
    date_to = today.replace(hour=23, minute=59, second=59).strftime("%Y-%m-%d %H:%M:%S")
    
    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json"
    }
    
    payload = {
        "date_from": date_from,
        "date_to": date_to,
        "employee_id": 1  # Test uchun
    }
    
    print_info(f"So'rov: {url}")
    
    try:
        response = requests.post(url, headers=headers, json=payload, timeout=30)
        
        if response.status_code == 200:
            data = response.json()
            print_success("Xodim savdosi olindi!")
            print_json(data, max_items=3)
            return data
        elif response.status_code == 404:
            print_warning("Endpoint topilmadi (404)")
            return None
        else:
            print_error(f"Xatolik: {response.status_code}")
            return None
            
    except Exception as e:
        print_error(f"Xatolik: {str(e)}")
        return None

def test_api_docs(token):
    """
    Test 5: API dokumentatsiyasini tekshirish
    """
    print_section("TEST 5: API Dokumentatsiya")
    
    docs_urls = [
        "https://api.regos.uz/docs",
        "https://api.regos.uz/swagger",
        "https://api.regos.uz/v1/docs",
        "https://api.regos.uz/api-docs"
    ]
    
    for url in docs_urls:
        print_info(f"Tekshirilmoqda: {url}")
        try:
            response = requests.get(url, timeout=10)
            if response.status_code == 200:
                print_success(f"Dokumentatsiya topildi: {url}")
                print_info("Brauzerda oching va barcha endpoint'larni ko'ring")
                return url
        except:
            pass
    
    print_warning("API dokumentatsiya topilmadi")
    print_info("REGOS support bilan bog'laning va API dokumentatsiyasini so'rang")
    return None

# ==================== ASOSIY DASTUR ====================

def main():
    print_header("🧪 REGOS API - Xodimlar va Savdo Test Dasturi")
    
    # Token olish
    token = os.getenv("REGOS_TOKEN")
    if not token:
        print_error("REGOS_TOKEN topilmadi!")
        print_info("export REGOS_TOKEN='your_token_here'")
        sys.exit(1)
    
    print_success(f"Token topildi (uzunlik: {len(token)} belgi)")
    
    # Testlarni bajarish
    results = {}
    
    # Test 1: Savdo ma'lumotlari
    results['sale_get'] = test_sale_get(token)
    
    # Test 2: Xodimlar ro'yxati
    results['employee_list'] = test_employee_list(token)
    
    # Test 3: Foydalanuvchilar
    results['user_list'] = test_user_list(token)
    
    # Test 4: Xodim bo'yicha savdo
    results['sale_by_employee'] = test_sale_by_employee(token)
    
    # Test 5: API dokumentatsiya
    docs_url = test_api_docs(token)
    
    # Natijalar
    print_header("📊 TEST NATIJALARI")
    
    print("\n✅ Muvaffaqiyatli testlar:")
    for test_name, result in results.items():
        if result:
            print(f"   • {test_name}")
    
    print("\n❌ Muvaffaqiyatsiz testlar:")
    for test_name, result in results.items():
        if not result:
            print(f"   • {test_name}")
    
    # Tavsiyalar
    print_header("💡 TAVSIYALAR")
    
    if results['sale_get']:
        print_success("Sale/Get endpoint ishlayapti")
        print_info("Bu endpoint orqali savdo ma'lumotlarini olish mumkin")
        
        # Xodim ma'lumotlari bormi?
        sale_data = results['sale_get']
        if sale_data and 'result' in sale_data and len(sale_data['result']) > 0:
            first_item = sale_data['result'][0]
            employee_fields = ['employee', 'cashier', 'seller', 'user', 'staff']
            has_employee = any(f in first_item for f in employee_fields)
            
            if has_employee:
                print_success("✅ Xodim ma'lumotlari mavjud!")
                print_info("Sizning tizimingizga to'liq integratsiya qilish mumkin")
            else:
                print_warning("⚠️  Xodim ma'lumotlari yo'q")
                print_info("Faqat filial bo'yicha jami savdoni olish mumkin")
    
    if results['employee_list']:
        print_success("Employee/List endpoint ishlayapti")
        print_info("Xodimlar ro'yxatini olish va sinxronizatsiya qilish mumkin")
    
    if docs_url:
        print_success(f"API dokumentatsiya: {docs_url}")
        print_info("Barcha mavjud endpoint'larni ko'ring")
    else:
        print_warning("API dokumentatsiya topilmadi")
        print_info("REGOS support: support@regos.uz")
    
    print("\n" + "=" * 70)
    print("Test yakunlandi!")
    print("=" * 70 + "\n")

if __name__ == "__main__":
    main()
