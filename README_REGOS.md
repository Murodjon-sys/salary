# 🚀 REGOS Kunlik Savdo - Tezkor Qo'llanma

## ⚡ 3 Daqiqada O'rnatish

```bash
# 1. Fayllarni yuklab oling
git clone <repository> # yoki scp orqali yuklang

# 2. O'rnatish scriptini ishga tushiring
chmod +x install_regos_cron.sh
./install_regos_cron.sh

# 3. Token kiriting (so'ralganda)
# Token: your_regos_api_token_here

# 4. Tayyor! ✅
```

## 🧪 Test Qilish

```bash
# 1. Token ni o'rnating
export REGOS_TOKEN='your_token_here'

# 2. Test scriptini ishga tushiring
python3 test_regos_api.py

# 3. Asosiy scriptni test qiling
python3 regos_daily_sales.py

# 4. Natijani ko'ring
ls -lh /opt/reports/
cat /opt/reports/sales_$(date +%Y-%m-%d).json
```

## 📋 Cron Sozlamalari

```bash
# Cron jobni ko'rish
crontab -l

# Cron job (default: har kuni 23:59)
59 23 * * * export REGOS_TOKEN='token' && python3 /opt/reports/regos_daily_sales.py >> /opt/reports/cron.log 2>&1

# Loglarni kuzatish
tail -f /opt/reports/cron.log
```

## 📁 Fayl Strukturasi

```
/opt/reports/
├── regos_daily_sales.py       # Asosiy script
├── cron.log                    # Loglar
└── sales_YYYY-MM-DD.json       # Kunlik savdo ma'lumotlari
```

## 🔧 Muammolarni Hal Qilish

### Token xatosi (401)
```bash
# Token ni tekshiring
echo $REGOS_TOKEN

# Qayta o'rnating
export REGOS_TOKEN='correct_token_here'
```

### Cron ishlamayapti
```bash
# Cron service ni tekshiring
sudo systemctl status cron

# Qo'lda test qiling
python3 /opt/reports/regos_daily_sales.py
```

### Ruxsat xatolari
```bash
# Script ga ruxsat
sudo chmod +x /opt/reports/regos_daily_sales.py

# Papka ruxsati
sudo chmod 755 /opt/reports
```

## 📞 Yordam

Batafsil qo'llanma: `REGOS_SETUP_GUIDE.md`

---

**Tezkor Komandalar:**

```bash
# Bugungi faylni ko'rish
cat /opt/reports/sales_$(date +%Y-%m-%d).json | python3 -m json.tool

# Oxirgi 10 ta logni ko'rish
tail -10 /opt/reports/cron.log

# Barcha savdo fayllarini ko'rish
ls -lh /opt/reports/sales_*.json

# Cron jobni o'chirish
crontab -e  # keyin qatorni o'chiring
```
