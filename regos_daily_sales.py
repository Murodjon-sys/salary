#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
REGOS API - Kunlik Savdo Ma'lumotlarini Avtomatik Olish
Author: DevOps Team
Description: Har kuni REGOS API dan savdo ma'lumotlarini oladi va JSON formatda saqlaydi
"""

import os
import sys
import json
import requests
from datetime import datetime, timedelta
import logging
from pathlib import Path

# ==================== KONFIGURATSIYA ====================

# API sozlamalari
REGOS_API_URL = "https://api.regos.uz/v1/Sale/Get"
REGOS_TOKEN = os.getenv("REGOS_TOKEN")

# Fayl yo'llari
REPORTS_DIR = "/opt/reports"
LOG_FILE = f"{REPORTS_DIR}/cron.log"

# API parametrlari
STOCK_ID = 1
GROUP_BY_ITEM = True

# ==================== LOGGING SOZLASH ====================

def setup_logging():
    """Logging tizimini sozlash"""
    # Reports papkasini yaratish (agar yo'q bo'lsa)
    Path(REPORTS_DIR).mkdir(parents=True, exist_ok=True)
    
    # Logging formati
    logging.basicConfig(
        level=logging.INFO,
        format='%(asctime)s [%(levelname)s] %(message)s',
        datefmt='%Y-%m-%d %H:%M:%S',
        handlers=[
            logging.FileHandler(LOG_FILE, encoding='utf-8'),
            logging.StreamHandler(sys.stdout)
        ]
    )
    return logging.getLogger(__name__)

# ==================== ASOSIY FUNKSIYALAR ====================

def get_today_date_range():
    """
    Bugungi kun uchun sana oralig'ini qaytaradi
    Returns: (date_from, date_to) tuple
    """
    today = datetime.now()
    date_from = today.replace(hour=0, minute=0, second=0, microsecond=0)
    date_to = today.replace(hour=23, minute=59, second=59, microsecond=0)
    
    return (
        date_from.strftime("%Y-%m-%d %H:%M:%S"),
        date_to.strftime("%Y-%m-%d %H:%M:%S")
    )

def fetch_sales_data(logger):
    """
    REGOS API dan savdo ma'lumotlarini olish
    Returns: dict yoki None (xatolik bo'lsa)
    """
    # Token tekshiruvi
    if not REGOS_TOKEN:
        logger.error("❌ REGOS_TOKEN o'zgaruvchisi topilmadi!")
        logger.error("   export REGOS_TOKEN='your_token_here' buyrug'ini bajaring")
        return None
    
    # Sana oralig'ini olish
    date_from, date_to = get_today_date_range()
    
    logger.info(f"📅 Sana oralig'i: {date_from} - {date_to}")
    
    # API so'rovi uchun ma'lumotlar
    headers = {
        "Authorization": f"Bearer {REGOS_TOKEN}",
        "Content-Type": "application/json",
        "Accept": "application/json"
    }
    
    payload = {
        "date_from": date_from,
        "date_to": date_to,
        "stock_id": STOCK_ID,
        "group_by_item": GROUP_BY_ITEM
    }
    
    logger.info(f"🔄 REGOS API ga so'rov yuborilmoqda...")
    logger.info(f"   URL: {REGOS_API_URL}")
    logger.info(f"   Parametrlar: stock_id={STOCK_ID}, group_by_item={GROUP_BY_ITEM}")
    
    try:
        # API so'rovi
        response = requests.post(
            REGOS_API_URL,
            headers=headers,
            json=payload,
            timeout=30  # 30 soniya timeout
        )
        
        # Status kod tekshiruvi
        logger.info(f"📡 HTTP Status: {response.status_code}")
        
        if response.status_code == 200:
            logger.info("✅ Ma'lumotlar muvaffaqiyatli olindi")
            return response.json()
        elif response.status_code == 401:
            logger.error("❌ Autentifikatsiya xatosi (401 Unauthorized)")
            logger.error("   Token noto'g'ri yoki muddati o'tgan")
            return None
        elif response.status_code == 404:
            logger.error("❌ Endpoint topilmadi (404 Not Found)")
            logger.error("   API URL to'g'riligini tekshiring")
            return None
        else:
            logger.error(f"❌ Kutilmagan xatolik: {response.status_code}")
            logger.error(f"   Javob: {response.text[:200]}")
            return None
            
    except requests.exceptions.Timeout:
        logger.error("❌ So'rov vaqti tugadi (Timeout)")
        return None
    except requests.exceptions.ConnectionError:
        logger.error("❌ Internetga ulanishda xatolik")
        return None
    except requests.exceptions.RequestException as e:
        logger.error(f"❌ So'rov xatosi: {str(e)}")
        return None
    except Exception as e:
        logger.error(f"❌ Kutilmagan xatolik: {str(e)}")
        return None

def save_to_json(data, logger):
    """
    Ma'lumotlarni JSON faylga saqlash
    Args:
        data: Saqlanadigan ma'lumotlar
        logger: Logger obyekti
    Returns: bool (muvaffaqiyatli/muvaffaqiyatsiz)
    """
    # Fayl nomini yaratish
    today = datetime.now().strftime("%Y-%m-%d")
    filename = f"sales_{today}.json"
    filepath = os.path.join(REPORTS_DIR, filename)
    
    try:
        # JSON faylga yozish (chiroyli indent bilan)
        with open(filepath, 'w', encoding='utf-8') as f:
            json.dump(data, f, ensure_ascii=False, indent=2)
        
        # Fayl hajmini olish
        file_size = os.path.getsize(filepath)
        file_size_kb = file_size / 1024
        
        logger.info(f"💾 Fayl saqlandi: {filepath}")
        logger.info(f"   Hajm: {file_size_kb:.2f} KB")
        
        # Ma'lumotlar statistikasi
        if isinstance(data, dict):
            if 'result' in data and isinstance(data['result'], list):
                logger.info(f"   Yozuvlar soni: {len(data['result'])}")
            elif 'data' in data and isinstance(data['data'], list):
                logger.info(f"   Yozuvlar soni: {len(data['data'])}")
        
        return True
        
    except IOError as e:
        logger.error(f"❌ Faylga yozishda xatolik: {str(e)}")
        return False
    except Exception as e:
        logger.error(f"❌ Kutilmagan xatolik: {str(e)}")
        return False

def main():
    """Asosiy funksiya"""
    # Logging sozlash
    logger = setup_logging()
    
    logger.info("=" * 60)
    logger.info("🚀 REGOS Kunlik Savdo Ma'lumotlarini Olish - BOSHLANDI")
    logger.info("=" * 60)
    
    # API dan ma'lumotlarni olish
    sales_data = fetch_sales_data(logger)
    
    if sales_data is None:
        logger.error("❌ Ma'lumotlarni olishda xatolik yuz berdi")
        logger.info("=" * 60)
        sys.exit(1)
    
    # Bo'sh javob tekshiruvi
    if not sales_data or (isinstance(sales_data, dict) and not sales_data.get('result') and not sales_data.get('data')):
        logger.warning("⚠️  API javobi bo'sh, lekin fayl saqlanadi")
        sales_data = {
            "status": "empty",
            "message": "Bugun uchun savdo ma'lumotlari topilmadi",
            "date": datetime.now().strftime("%Y-%m-%d"),
            "result": []
        }
    
    # JSON faylga saqlash
    success = save_to_json(sales_data, logger)
    
    if success:
        logger.info("✅ Jarayon muvaffaqiyatli yakunlandi")
        logger.info("=" * 60)
        sys.exit(0)
    else:
        logger.error("❌ Jarayon xato bilan yakunlandi")
        logger.info("=" * 60)
        sys.exit(1)

# ==================== SCRIPT ISHGA TUSHISHI ====================

if __name__ == "__main__":
    main()
