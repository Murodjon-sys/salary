# REGOS API Token Olish Qo'llanmasi

## 🔑 Token Qayerdan Olish Mumkin?

### Variant 1: REGOS Web Panel (Eng Oson)

1. **REGOS tizimiga kiring:**
   - URL: https://regos.uz yoki https://app.regos.uz
   - Login va parol bilan kiring

2. **Sozlamalar bo'limiga o'ting:**
   - Yuqori o'ng burchakda profil → **Sozlamalar**
   - Yoki: **Настройки** / **Settings**

3. **API bo'limini toping:**
   - **API Kalitlar** / **API Keys** / **Интеграция**
   - **Разработчикам** / **Developers**

4. **Yangi token yarating:**
   - **Yangi kalit yaratish** / **Create New Key**
   - Nom bering: "Oylik Hisoblash Tizimi"
   - **Saqlash** / **Save**

5. **Token ni nusxalang:**
   ```
   Token: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```
   ⚠️ **MUHIM:** Token faqat bir marta ko'rsatiladi! Darhol nusxalang!

---

### Variant 2: REGOS Support Orqali

Agar web panelda API bo'limi bo'lmasa:

**1. Email yuborish:**

```
Kimga: support@regos.uz
Mavzu: API Token So'rovi

Assalomu alaykum,

Men REGOS API bilan integratsiya qilmoqchiman.
API token olishim kerak.

Kompaniya: [Sizning kompaniya nomingiz]
Login: [Sizning login]
Telefon: [Telefon raqam]

Maqsad: Oylik hisoblash tizimi uchun kunlik savdo ma'lumotlarini olish

Rahmat!
```

**2. Telegram orqali:**
- REGOS support bot: @regos_support_bot (agar mavjud bo'lsa)
- Yoki REGOS manager bilan bog'laning

**3. Telefon orqali:**
- REGOS support: +998 XX XXX XX XX (REGOS saytidan toping)

---

### Variant 3: REGOS Hisob Qaydnomangizda

Ba'zi hollarda token allaqachon mavjud:

1. **REGOS tizimiga kiring**
2. **Profil → Hisob ma'lumotlari**
3. **API Token** yoki **Интеграция** bo'limini qidiring
4. Agar ko'rsatilgan bo'lsa, nusxalang

---

## 🔍 Token Qanday Ko'rinadi?

REGOS API token odatda quyidagi formatda bo'ladi:

```bash
# JWT format (eng keng tarqalgan)
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c

# Yoki oddiy string
regos_api_key_1234567890abcdef

# Yoki UUID format
550e8400-e29b-41d4-a716-446655440000
```

**Uzunlik:** Odatda 100-500 belgi

---

## 🧪 Token To'g'riligini Tekshirish

Token olgandan keyin darhol tekshiring:

### 1. cURL orqali:

```bash
# Token ni o'rnating
TOKEN="your_token_here"

# Test so'rovi
curl -X GET https://api.regos.uz/v1/Department/List \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json"
```

**Kutilgan javob:**
```json
{
  "success": true,
  "result": [...]
}
```

**Agar xato bo'lsa:**
```json
{
  "error": "Unauthorized",
  "message": "Invalid token"
}
```

### 2. Python script orqali:

```bash
# Token ni o'rnating
export REGOS_TOKEN='your_token_here'

# Test qiling
python3 test_regos_api.py
```

---

## 📝 Token ni Saqlash

### Linux/Mac (.bashrc yoki .zshrc):

```bash
# ~/.bashrc faylini oching
nano ~/.bashrc

# Oxiriga qo'shing:
export REGOS_TOKEN='your_actual_token_here'
export REGOS_API_URL='https://api.regos.uz/v1'
export REGOS_COMPANY_ID='your_company_id'

# Saqlang va yangilang
source ~/.bashrc
```

### Windows (Environment Variables):

```powershell
# PowerShell
[System.Environment]::SetEnvironmentVariable('REGOS_TOKEN', 'your_token_here', 'User')

# Yoki CMD
setx REGOS_TOKEN "your_token_here"
```

### .env Faylda (Node.js):

```bash
# .env fayl yarating
nano .env

# Qo'shing:
REGOS_API_URL=https://api.regos.uz/v1
REGOS_API_KEY=your_token_here
REGOS_COMPANY_ID=your_company_id
REGOS_TOKEN=your_token_here
```

⚠️ **MUHIM:** `.env` faylni `.gitignore` ga qo'shing!

```bash
echo ".env" >> .gitignore
```

---

## 🔐 Xavfsizlik

### ✅ To'g'ri:
- Token ni environment variable sifatida saqlang
- `.env` faylni git'ga commit qilmang
- Token ni faqat server'da saqlang
- Har 3-6 oyda token ni yangilang

### ❌ Noto'g'ri:
- Token ni kodga hardcode qilmang
- Token ni GitHub'ga yuklmang
- Token ni screenshot qilmang
- Token ni email orqali yubormang

---

## 🆘 Muammolar va Yechimlar

### 1. "Token topilmadi"

**Sabab:** REGOS hisobingizda API faollashtirilmagan

**Yechim:**
- REGOS support bilan bog'laning
- API xizmatini faollashtiring
- Premium/Pro rejaga o'ting (agar kerak bo'lsa)

### 2. "Token muddati tugagan"

**Sabab:** Token vaqti cheklangan

**Yechim:**
- REGOS panelda yangi token yarating
- Yoki support'dan yangi token so'rang

### 3. "Ruxsat yo'q (403 Forbidden)"

**Sabab:** Token'da kerakli ruxsatlar yo'q

**Yechim:**
- Token yaratishda barcha ruxsatlarni belgilang:
  - ✅ Read Sales (Savdolarni o'qish)
  - ✅ Read Employees (Xodimlarni o'qish)
  - ✅ Read Departments (Filiallarni o'qish)

---

## 📞 REGOS Support Ma'lumotlari

**Rasmiy sayt:** https://regos.uz

**Support email:** support@regos.uz

**Telegram:** @regos_support (agar mavjud bo'lsa)

**Telefon:** REGOS saytidan toping

**Ish vaqti:** Dushanba-Juma, 9:00-18:00

---

## 🎯 Keyingi Qadamlar

1. ✅ REGOS panelga kiring
2. ✅ API token oling
3. ✅ Token ni saqlang
4. ✅ Test qiling:
   ```bash
   export REGOS_TOKEN='your_token'
   python3 test_regos_api.py
   ```
5. ✅ Natijani menga yuboring!

---

## 💡 Maslahat

Agar REGOS panelda API bo'limi topilmasa:

1. **REGOS versiyasini tekshiring** - eski versiyalarda API bo'lmasligi mumkin
2. **Tarifni tekshiring** - ba'zi tariflarda API mavjud emas
3. **Support bilan bog'laning** - ular sizga yordam beradi

---

**Savol:** Token oldingizmi? Test natijasini yuboring! 🚀
