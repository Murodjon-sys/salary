# 🚀 REGOS Integratsiya - BOSHLASH

## ⚡ 1 DAQIQADA ISHGA TUSHIRISH

### 1️⃣ Token ni O'rnating

```bash
# Token ni qo'ying (REGOS dan olgan tokeningiz)
export REGOS_TOKEN='your_actual_token_here'

# MongoDB URI (agar kerak bo'lsa)
export MONGODB_URI='mongodb+srv://user:pass@cluster.mongodb.net/salary-management'
```

### 2️⃣ Python Kutubxonalarini O'rnating

```bash
pip3 install requests pymongo
```

### 3️⃣ Ishga Tushiring!

```bash
# Bugungi kun uchun
python3 regos_auto_sync.py

# Ma'lum sana uchun
python3 regos_auto_sync.py 2024-12-28
```

## 📊 Natija

Script avtomatik:
1. ✅ REGOS API dan ma'lumot oladi
2. ✅ Xodimlarni aniqlaydi
3. ✅ Lavozimlarni aniqlaydi
4. ✅ Chakana va optom savdoni ajratadi
5. ✅ Natijani ekranga chiqaradi
6. ✅ JSON faylga saqlaydi
7. ✅ MongoDB ga yozadi (so'rasangiz)

### Ekran Natijasi:

```
================================================================================
                    🚀 REGOS AVTOMATIK SINXRONIZATSIYA                    
================================================================================

✅ Token topildi (245 belgi)
ℹ️  Sana: 2024-12-28

================================================================================
                        📡 REGOS API dan ma'lumot olish                        
================================================================================

ℹ️  REGOS API: https://api.regos.uz/v1/Sale/Get
ℹ️  Sana: 2024-12-28
✅ Ma'lumotlar olindi: 156 ta yozuv

================================================================================
                          ⚙️  Ma'lumotlarni qayta ishlash                          
================================================================================

================================================================================
                                📊 NATIJALAR                                
================================================================================

Xodim               Lavozim         Chakana         Optom           Jami           
────────────────────────────────────────────────────────────────────────────────
Zikrillo            Sotuvchi        3,500,000       1,200,000       4,700,000
Botir               Kassir          2,800,000         500,000       3,300,000
Shexruz             Sotuvchi        4,200,000       2,100,000       6,300,000
────────────────────────────────────────────────────────────────────────────────
JAMI                               10,500,000       3,800,000      14,300,000

✅ JSON fayl saqlandi: regos_employees_2024-12-28.json

================================================================================
                        💾 MongoDB ga sinxronizatsiya                        
================================================================================

MongoDB ga yozishni xohlaysizmi? (y/n): y
ℹ️  MongoDB ga ulanildi
✅ Yangilandi: Zikrillo - 4,700,000 so'm
✅ Yangilandi: Botir - 3,300,000 so'm
✅ Yangilandi: Shexruz - 6,300,000 so'm
✅ MongoDB ga muvaffaqiyatli yozildi!

================================================================================
                            ✅ JARAYON YAKUNLANDI                            
================================================================================
```

## 📁 Yaratilgan Fayllar

```
regos_employees_2024-12-28.json
```

**Fayl tarkibi:**
```json
{
  "date": "2024-12-28",
  "timestamp": "2024-12-28T15:30:45",
  "employees": [
    {
      "employee_id": 101,
      "name": "Zikrillo",
      "position": "Sotuvchi",
      "retail_sales": 3500000,
      "wholesale_sales": 1200000,
      "total_sales": 4700000
    }
  ],
  "summary": {
    "total_employees": 3,
    "total_retail_sales": 10500000,
    "total_wholesale_sales": 3800000,
    "total_sales": 14300000
  }
}
```

## 🔧 Sozlamalar

### .env Fayl Yaratish (Ixtiyoriy)

```bash
# .env fayl yarating
cat > .env << EOF
REGOS_TOKEN=your_token_here
REGOS_API_URL=https://api.regos.uz/v1
MONGODB_URI=mongodb://localhost:27017/salary-management
EOF

# .env ni yuklash
export $(cat .env | xargs)
```

## 🤖 Avtomatik Ishga Tushirish (Cron)

```bash
# Har kuni 00:05 da
crontab -e

# Qo'shing:
5 0 * * * export REGOS_TOKEN='your_token' && cd /path/to/project && python3 regos_auto_sync.py >> /var/log/regos-sync.log 2>&1
```

## 🧪 Test Qilish

### 1. Token Tekshiruvi

```bash
# Token to'g'riligini tekshiring
python3 test_regos_api.py
```

### 2. Xodimlar Ma'lumotini Tekshirish

```bash
# Qanday ma'lumotlar kelishini ko'ring
python3 test_regos_employees.py
```

### 3. To'liq Test

```bash
# Bugungi kun uchun test
python3 regos_auto_sync.py

# Natijani ko'ring
cat regos_employees_$(date +%Y-%m-%d).json | python3 -m json.tool
```

## ❓ Muammolar

### "REGOS_TOKEN topilmadi"

```bash
# Token ni o'rnating
export REGOS_TOKEN='your_token_here'

# Tekshiring
echo $REGOS_TOKEN
```

### "Xodim ma'lumotlari topilmadi"

Bu REGOS API javobida xodim maydonlari yo'q degani.

**Yechim:**
1. `test_regos_employees.py` ni ishga tushiring
2. Natijani menga yuboring
3. Men sizga maxsus mapping yozaman

### "MongoDB ga ulanishda xatolik"

```bash
# MongoDB URI ni tekshiring
echo $MONGODB_URI

# Yoki to'g'ridan-to'g'ri kiriting
export MONGODB_URI='mongodb://localhost:27017/salary-management'
```

## 📞 Yordam

Muammo bo'lsa:
1. Test scriptlarini ishga tushiring
2. Natijani screenshot qiling
3. Menga yuboring
4. Men sizga yordam beraman!

---

## 🎯 Keyingi Qadam

**TOKEN OLING VA ISHGA TUSHIRING:**

```bash
export REGOS_TOKEN='your_token_here'
python3 regos_auto_sync.py
```

**Natijani menga yuboring!** 🚀
