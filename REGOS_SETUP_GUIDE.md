# REGOS Kunlik Savdo Ma'lumotlarini Avtomatik Olish Tizimi

## 📋 Tizim Haqida

Bu tizim har kuni avtomatik ravishda REGOS API dan savdo ma'lumotlarini olib, JSON formatda saqlaydi.

## 🚀 Tezkor O'rnatish

### 1. Fayllarni Serverga Yuklash

```bash
# Fayllarni serverga yuklang (scp yoki git orqali)
scp regos_daily_sales.py install_regos_cron.sh user@your-server:/home/user/
```

### 2. O'rnatish Scriptini Ishga Tushirish

```bash
# Scriptga ruxsat berish
chmod +x install_regos_cron.sh

# O'rnatishni boshlash
./install_regos_cron.sh
```

Script avtomatik ravishda:
- ✅ Python va kutubxonalarni tekshiradi
- ✅ Kerakli papkalarni yaratadi
- ✅ Script faylini joylashtiradi
- ✅ Token ni sozlaydi
- ✅ Cron job qo'shadi

## 🔧 Qo'lda O'rnatish

Agar avtomatik o'rnatish ishlamasa:

### 1. Python va Kutubxonalarni O'rnatish

```bash
# Ubuntu/Debian
sudo apt update
sudo apt install python3 python3-pip -y

# CentOS/RHEL
sudo yum install python3 python3-pip -y

# requests kutubxonasi
pip3 install requests
```

### 2. Papkalarni Yaratish

```bash
sudo mkdir -p /opt/reports
sudo chmod 755 /opt/reports
```

### 3. Script Faylini Joylashtirish

```bash
sudo cp regos_daily_sales.py /opt/reports/
sudo chmod +x /opt/reports/regos_daily_sales.py
```

### 4. REGOS Token ni Sozlash

```bash
# .bashrc ga qo'shish (doimiy)
echo "export REGOS_TOKEN='your_actual_token_here'" >> ~/.bashrc
source ~/.bashrc

# Yoki faqat hozirgi sessiya uchun
export REGOS_TOKEN='your_actual_token_here'
```

### 5. Cron Job Qo'shish

```bash
# Crontab ni ochish
crontab -e

# Quyidagi qatorni qo'shing:
59 23 * * * export REGOS_TOKEN='your_token' && /usr/bin/python3 /opt/reports/regos_daily_sales.py >> /opt/reports/cron.log 2>&1
```

**Cron Tushuntirish:**
- `59 23 * * *` - Har kuni 23:59 da
- `export REGOS_TOKEN` - Token ni o'rnatish
- `/usr/bin/python3` - Python3 yo'li
- `>> /opt/reports/cron.log` - Loglarni faylga yozish
- `2>&1` - Xatolarni ham logga yozish

## 🧪 Test Qilish

### 1. Qo'lda Ishga Tushirish

```bash
# Token ni export qiling
export REGOS_TOKEN='your_token_here'

# Scriptni ishga tushiring
python3 /opt/reports/regos_daily_sales.py
```

### 2. Natijalarni Ko'rish

```bash
# Yaratilgan fayllarni ko'rish
ls -lh /opt/reports/

# Bugungi faylni ko'rish
cat /opt/reports/sales_$(date +%Y-%m-%d).json

# Loglarni ko'rish
cat /opt/reports/cron.log

# Real-time log monitoring
tail -f /opt/reports/cron.log
```

### 3. Cron Job Tekshiruvi

```bash
# Cron joblarni ko'rish
crontab -l

# Cron service statusini tekshirish
sudo systemctl status cron     # Ubuntu/Debian
sudo systemctl status crond    # CentOS/RHEL
```

## 📊 Natija Fayl Formati

Yaratilgan fayl: `/opt/reports/sales_2024-12-28.json`

```json
{
  "status": "success",
  "date": "2024-12-28",
  "result": [
    {
      "item_id": 123,
      "item_name": "Mahsulot nomi",
      "quantity": 10,
      "total_amount": 1500000
    }
  ]
}
```

## 🔍 Muammolarni Hal Qilish

### 1. Token Xatosi (401 Unauthorized)

```bash
# Token to'g'riligini tekshiring
echo $REGOS_TOKEN

# Agar bo'sh bo'lsa, qayta o'rnating
export REGOS_TOKEN='your_token_here'
```

### 2. Cron Ishlamayapti

```bash
# Cron service ishga tushiring
sudo systemctl start cron      # Ubuntu/Debian
sudo systemctl start crond     # CentOS/RHEL

# Cron loglarini ko'ring
sudo tail -f /var/log/syslog   # Ubuntu/Debian
sudo tail -f /var/log/cron     # CentOS/RHEL
```

### 3. Python Kutubxonasi Topilmadi

```bash
# requests ni qayta o'rnating
pip3 install --upgrade requests

# Yoki sudo bilan
sudo pip3 install requests
```

### 4. Ruxsat Xatolari

```bash
# Script fayliga ruxsat bering
sudo chmod +x /opt/reports/regos_daily_sales.py

# Reports papkasiga ruxsat
sudo chmod 755 /opt/reports
```

## 📝 Cron Vaqtlarini O'zgartirish

```bash
# Har kuni 23:59 da (default)
59 23 * * *

# Har kuni 00:01 da (tunda)
1 0 * * *

# Har kuni 12:00 da (tushda)
0 12 * * *

# Har soatda
0 * * * *

# Har 6 soatda
0 */6 * * *
```

## 🔐 Xavfsizlik

1. **Token ni himoyalash:**
   ```bash
   # .bashrc faylini faqat o'zingiz o'qiy olasiz
   chmod 600 ~/.bashrc
   ```

2. **Log fayllarini himoyalash:**
   ```bash
   sudo chmod 600 /opt/reports/cron.log
   ```

3. **Token ni environment variable sifatida saqlash:**
   - ✅ To'g'ri: `export REGOS_TOKEN='...'`
   - ❌ Noto'g'ri: Kodda hardcode qilish

## 📞 Yordam

Agar muammo yuzaga kelsa:

1. **Loglarni tekshiring:**
   ```bash
   tail -100 /opt/reports/cron.log
   ```

2. **Qo'lda test qiling:**
   ```bash
   python3 /opt/reports/regos_daily_sales.py
   ```

3. **Cron loglarini ko'ring:**
   ```bash
   sudo grep CRON /var/log/syslog | tail -20
   ```

## 📦 Fayl Strukturasi

```
/opt/reports/
├── regos_daily_sales.py      # Asosiy script
├── cron.log                   # Cron loglari
├── sales_2024-12-28.json      # Bugungi savdo
├── sales_2024-12-27.json      # Kechagi savdo
└── sales_2024-12-26.json      # Oldingi kunlar
```

## 🎯 Xususiyatlar

- ✅ Avtomatik sana aniqlash
- ✅ Xatoliklarni batafsil logging
- ✅ Bo'sh javoblarni qayta ishlash
- ✅ HTTP status tekshiruvi
- ✅ Timeout bilan himoyalangan
- ✅ Chiroyli JSON formatlash
- ✅ Fayl hajmi statistikasi
- ✅ UTF-8 encoding qo'llab-quvvatlash

## 📈 Monitoring

Tizimni monitoring qilish uchun:

```bash
# Oxirgi 10 ta faylni ko'rish
ls -lt /opt/reports/sales_*.json | head -10

# Bugungi fayl mavjudligini tekshirish
test -f /opt/reports/sales_$(date +%Y-%m-%d).json && echo "✅ Bugungi fayl mavjud" || echo "❌ Bugungi fayl yo'q"

# Oxirgi cron ishga tushgan vaqtni ko'rish
tail -1 /opt/reports/cron.log
```

---

**Muallif:** DevOps Team  
**Versiya:** 1.0  
**Sana:** 2024-12-28
