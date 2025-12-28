#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
REGOS API Test Script
Bu script REGOS API ni test qilish uchun ishlatiladi
"""

import os
import sys
import json
import requests
from datetime import datetime

# Ranglar (terminal uchun)
GREEN = '\033[92m'
RED = '\033[91m'
YELLOW = '\033[93m'
BLUE = '\033[94m'
RESET = '\033[0m'

def print_header(text):
    print(f"\n{BLUE}{'=' * 60}{RESET}")
    print(f"{BLUE}{text}{RESET}")
    print(f"{BLUE}{'=' * 60}{RESET}\n")

def print_success(text):
    print(f"{GREEN}✅ {text}{RESET}")

def print_error(text):
    print(f"{RED}❌ {text}{RESET}")

def print_warning(text):
    print(f"{YELLOW}⚠️  {text}{RESET}")

def print_info(text):
    print(f"{BLUE}ℹ️  {text}{RESET}")

def test_environment():
    """Environment o'zgaruvchilarini tekshirish"""
    print_header("1. Environment Tekshiruvi")
    
    token = os.getenv("REGOS_TOKEN")
    if token:
        print_success(f"REGOS_TOKEN topildi (uzunlik: {len(token)} belgi)")
        return token
    else:
        print_error("REGOS_TOKEN topilmadi!")
        print_info("Token ni o'rnatish:")
        print_info("  export REGOS_TOKEN='your_token_here'")
        return None

def test_api_connection(token):
    """API ga ulanishni tekshirish"""
    print_header("2. API Ulanish Tekshiruvi")
    
    url = "https://api.regos.uz/v1/Sale/Get"
    
    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json"
    }
    
    # Bugungi kun uchun
    today = datetime.now()
    date_from = today.replace(hour=0, minute=0, second=0).strftime("%Y-%m-%d %H:%M:%S")
    date_to = today.replace(hour=23, minute=59, second=59).strftime("%Y-%m-%d %H:%M:%S")
    
    payload = {
        "date_from": date_from,
        "date_to": date_to,
        "stock_id": 1,
        "group_by_item": True
    }
    
    print_info(f"URL: {url}")
    print_info(f"Sana: {date_from} - {date_to}")
    print_info("So'rov yuborilmoqda...")
    
    try:
        response = requests.post(url, headers=headers, json=payload, timeout=30)
        
        print_info(f"HTTP Status: {response.status_code}")
        
        if response.status_code == 200:
            print_success("API javob berdi!")
            
            # JSON ni parse qilish
            try:
                data = response.json()
                print_success("JSON muvaffaqiyatli parse qilindi")
                
                # Ma'lumotlar statistikasi
                if isinstance(data, dict):
                    print_info(f"Javob kalitlari: {list(data.keys())}")
                    
                    if 'result' in data:
                        result_count = len(data['result']) if isinstance(data['result'], list) else 0
                        print_info(f"Natijalar soni: {result_count}")
                    
                    if 'data' in data:
                        data_count = len(data['data']) if isinstance(data['data'], list) else 0
                        print_info(f"Ma'lumotlar soni: {data_count}")
                
                # JSON ni chiroyli ko'rinishda chiqarish
                print("\n" + "─" * 60)
                print("API Javobi (birinchi 500 belgi):")
                print("─" * 60)
                json_str = json.dumps(data, ensure_ascii=False, indent=2)
                print(json_str[:500])
                if len(json_str) > 500:
                    print("...")
                print("─" * 60)
                
                return True
                
            except json.JSONDecodeError:
                print_error("JSON parse qilishda xatolik")
                print_info(f"Javob: {response.text[:200]}")
                return False
                
        elif response.status_code == 401:
            print_error("Autentifikatsiya xatosi (401)")
            print_warning("Token noto'g'ri yoki muddati o'tgan")
            return False
        elif response.status_code == 404:
            print_error("Endpoint topilmadi (404)")
            print_warning("API URL to'g'riligini tekshiring")
            return False
        else:
            print_error(f"Kutilmagan status: {response.status_code}")
            print_info(f"Javob: {response.text[:200]}")
            return False
            
    except requests.exceptions.Timeout:
        print_error("So'rov vaqti tugadi (Timeout)")
        return False
    except requests.exceptions.ConnectionError:
        print_error("Internetga ulanishda xatolik")
        return False
    except Exception as e:
        print_error(f"Xatolik: {str(e)}")
        return False

def test_file_permissions():
    """Fayl ruxsatlarini tekshirish"""
    print_header("3. Fayl Ruxsatlari Tekshiruvi")
    
    reports_dir = "/opt/reports"
    
    # Papka mavjudligini tekshirish
    if os.path.exists(reports_dir):
        print_success(f"Papka mavjud: {reports_dir}")
        
        # Yozish ruxsatini tekshirish
        if os.access(reports_dir, os.W_OK):
            print_success("Yozish ruxsati bor")
        else:
            print_error("Yozish ruxsati yo'q")
            print_info("Ruxsat berish: sudo chmod 755 /opt/reports")
    else:
        print_warning(f"Papka mavjud emas: {reports_dir}")
        print_info("Yaratish: sudo mkdir -p /opt/reports")

def test_python_packages():
    """Python kutubxonalarini tekshirish"""
    print_header("4. Python Kutubxonalari Tekshiruvi")
    
    # Python versiyasi
    print_info(f"Python versiyasi: {sys.version.split()[0]}")
    
    # requests kutubxonasi
    try:
        import requests
        print_success(f"requests kutubxonasi: v{requests.__version__}")
    except ImportError:
        print_error("requests kutubxonasi topilmadi")
        print_info("O'rnatish: pip3 install requests")

def main():
    """Asosiy test funksiyasi"""
    print_header("🧪 REGOS API Test Dasturi")
    
    # 1. Environment tekshiruvi
    token = test_environment()
    if not token:
        print_error("\nTest to'xtatildi: Token topilmadi")
        sys.exit(1)
    
    # 2. Python kutubxonalari
    test_python_packages()
    
    # 3. Fayl ruxsatlari
    test_file_permissions()
    
    # 4. API ulanish
    api_success = test_api_connection(token)
    
    # Natija
    print_header("📊 Test Natijalari")
    
    if api_success:
        print_success("Barcha testlar muvaffaqiyatli o'tdi!")
        print_info("\nKeyingi qadam:")
        print_info("  python3 regos_daily_sales.py")
        sys.exit(0)
    else:
        print_error("Ba'zi testlar muvaffaqiyatsiz tugadi")
        print_info("\nMuammolarni hal qiling va qayta urinib ko'ring")
        sys.exit(1)

if __name__ == "__main__":
    main()
