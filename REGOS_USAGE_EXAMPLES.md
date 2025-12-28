# REGOS Integratsiya - Foydalanish Misollari

## 🎯 Integratsiya Variantlari

### Variant 1: Avtomatik Sinxronizatsiya (Tavsiya etiladi)

**Qanday ishlaydi:**
1. Python script har kuni 23:59 da REGOS'dan ma'lumot oladi → JSON fayl yaratadi
2. Node.js cron har kuni 00:05 da JSON faylni o'qiydi → MongoDB ga yozadi

**Sozlash:**

```bash
# 1. Python cron (allaqachon sozlangan)
59 23 * * * python3 /opt/reports/regos_daily_sales.py

# 2. Node.js cron qo'shish
crontab -e

# Quyidagi qatorni qo'shing:
5 0 * * * curl -X POST http://localhost:3010/api/regos/sync-from-json >> /opt/reports/node-sync.log 2>&1
```

### Variant 2: To'g'ridan-to'g'ri REGOS API

**Qanday ishlaydi:**
Node.js to'g'ridan-to'g'ri REGOS API ga murojaat qiladi

**Sozlash:**

```bash
# Cron qo'shish
5 0 * * * curl -X POST http://localhost:3010/api/regos/sync-daily-sales >> /opt/reports/regos-sync.log 2>&1
```

### Variant 3: Qo'lda Sinxronizatsiya

**Admin panel orqali:**

```javascript
// Browser console'da test qilish
fetch('/api/regos/sync-daily-sales', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ date: '2024-12-28' })
})
.then(r => r.json())
.then(console.log)
```

## 📊 API Endpoint'lar

### 1. Kunlik Savdoni Sinxronizatsiya

```bash
# Bugungi kun uchun
curl -X POST http://localhost:3010/api/regos/sync-daily-sales \
  -H "Content-Type: application/json"

# Ma'lum sana uchun
curl -X POST http://localhost:3010/api/regos/sync-daily-sales \
  -H "Content-Type: application/json" \
  -d '{"date": "2024-12-28"}'
```

**Javob:**
```json
{
  "ok": true,
  "message": "REGOS dan sinxronizatsiya muvaffaqiyatli",
  "success": true,
  "date": "2024-12-28",
  "totalSales": 15000000,
  "branchesUpdated": 3
}
```

### 2. JSON Fayldan Sinxronizatsiya

```bash
curl -X POST http://localhost:3010/api/regos/sync-from-json \
  -H "Content-Type: application/json" \
  -d '{"date": "2024-12-28"}'
```

### 3. Filiallar Mapping

```bash
curl http://localhost:3010/api/regos/departments-mapping
```

**Javob:**
```json
{
  "ok": true,
  "mapping": [
    {
      "regosId": 1,
      "regosName": "Navoiy Filial",
      "localBranchId": "67890abc...",
      "localBranchName": "Navoiy Filial",
      "matched": true
    },
    {
      "regosId": 2,
      "regosName": "Gijduvon",
      "localBranchId": "12345def...",
      "localBranchName": "G'ijduvon Filial",
      "matched": true
    }
  ],
  "unmatchedCount": 0
}
```

## 🔧 Sozlash

### 1. .env Faylga Qo'shish

```bash
# REGOS API sozlamalari
REGOS_API_URL=https://api.regos.uz/v1
REGOS_API_KEY=your_api_key_here
REGOS_COMPANY_ID=your_company_id
```

### 2. Node.js Paketlarni O'rnatish

```bash
cd server
npm install node-fetch
```

### 3. Filiallar Mapping

Agar REGOS'dagi filial nomlari sizning bazangizdagi nomlardan farq qilsa:

```javascript
// server/regosIntegration.js da mapping qo'shish
const BRANCH_MAPPING = {
  'Navoiy': 'Navoiy Filial',
  'Gijduvon': "G'ijduvon Filial",
  'Sklad': 'Asosiy Sklad'
};
```

## 🧪 Test Qilish

### 1. REGOS API Ulanishini Test

```bash
# Test script
node server/test-regos.js
```

### 2. Sinxronizatsiyani Test

```bash
# Bugungi kun uchun
curl -X POST http://localhost:3010/api/regos/sync-daily-sales

# Natijani ko'rish
curl http://localhost:3010/api/branches
```

### 3. Loglarni Ko'rish

```bash
# Node.js server loglari
tail -f /opt/reports/node-sync.log

# Python script loglari
tail -f /opt/reports/cron.log
```

## 📈 Monitoring

### Kunlik Sinxronizatsiya Tekshiruvi

```bash
#!/bin/bash
# check-sync.sh

DATE=$(date +%Y-%m-%d)

# JSON fayl mavjudmi?
if [ -f "/opt/reports/sales_$DATE.json" ]; then
    echo "✅ JSON fayl mavjud"
else
    echo "❌ JSON fayl yo'q"
fi

# MongoDB da bugungi savdo bormi?
# (MongoDB query orqali tekshirish)
```

### Xatoliklarni Monitoring

```bash
# Oxirgi xatoliklarni ko'rish
grep "ERROR\|❌" /opt/reports/*.log | tail -20
```

## 🔄 Ma'lumotlar Oqimi

```
┌─────────────┐
│   REGOS     │
│     API     │
└──────┬──────┘
       │
       │ (23:59 - Python)
       ▼
┌─────────────┐
│    JSON     │
│    Fayl     │
└──────┬──────┘
       │
       │ (00:05 - Node.js)
       ▼
┌─────────────┐
│   MongoDB   │
│   (Branch)  │
└─────────────┘
```

## 💡 Best Practices

### 1. Xatoliklarni Qayta Ishlash

```javascript
// Agar sinxronizatsiya muvaffaqiyatsiz bo'lsa, 5 daqiqadan keyin qayta urinish
*/5 * * * * curl -X POST http://localhost:3010/api/regos/sync-from-json || true
```

### 2. Backup

```bash
# Har kuni sinxronizatsiyadan oldin backup
0 23 * * * mongodump --db salary-management --out /backup/$(date +\%Y-\%m-\%d)
```

### 3. Notification

```javascript
// Telegram yoki email orqali xabar yuborish
if (result.ok) {
  sendTelegramMessage(`✅ Sinxronizatsiya muvaffaqiyatli: ${result.totalSales}`);
} else {
  sendTelegramMessage(`❌ Xatolik: ${result.error}`);
}
```

## 🐛 Muammolarni Hal Qilish

### 1. "REGOS API xatosi: 401"

```bash
# Token to'g'riligini tekshiring
echo $REGOS_API_KEY

# Yangi token oling va .env ga qo'shing
```

### 2. "JSON fayl topilmadi"

```bash
# Python script ishlaganini tekshiring
ls -lh /opt/reports/sales_*.json

# Qo'lda ishga tushiring
python3 /opt/reports/regos_daily_sales.py
```

### 3. "Filial topilmadi"

```bash
# Mapping'ni tekshiring
curl http://localhost:3010/api/regos/departments-mapping

# Filial nomlarini to'g'rilang
```

## 📞 Yordam

Qo'shimcha savol bo'lsa:
- REGOS API dokumentatsiyasi: https://api.regos.uz/docs
- Telegram: @your_support
- Email: support@example.com

---

**Oxirgi yangilanish:** 2024-12-28
