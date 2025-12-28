# 🚀 REGOS Token - 2 Daqiqada Olish

## Variant 1: REGOS Web Panel (Tavsiya)

```
1. https://regos.uz ga kiring
   ↓
2. Login/Parol kiriting
   ↓
3. Yuqori o'ng burchak → Profil → Sozlamalar
   ↓
4. "API" yoki "Интеграция" bo'limini toping
   ↓
5. "Yangi kalit yaratish" tugmasini bosing
   ↓
6. Token paydo bo'ladi → NUSXALANG!
   ↓
7. Tayyor! ✅
```

## Variant 2: REGOS Support (Agar panel'da API bo'lmasa)

```
Email: support@regos.uz

Mavzu: API Token So'rovi

Matn:
"Assalomu alaykum,
API token olishim kerak.
Kompaniya: [Nom]
Login: [Login]
Maqsad: Savdo ma'lumotlarini olish
Rahmat!"
```

## Token Qanday Ko'rinadi?

```bash
# Misol:
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkw...

# Yoki:
regos_api_key_1234567890abcdef1234567890
```

## Token ni Saqlash

```bash
# Linux/Mac
echo 'export REGOS_TOKEN="your_token_here"' >> ~/.bashrc
source ~/.bashrc

# Windows PowerShell
[System.Environment]::SetEnvironmentVariable('REGOS_TOKEN', 'your_token', 'User')

# .env faylda (Node.js)
echo 'REGOS_TOKEN=your_token_here' >> .env
```

## Test Qilish

```bash
# 1. Token ni o'rnating
export REGOS_TOKEN='your_token_here'

# 2. Test qiling
python3 test_regos_api.py

# 3. Yoki cURL bilan:
curl -H "Authorization: Bearer $REGOS_TOKEN" \
     https://api.regos.uz/v1/Department/List
```

## ✅ Muvaffaqiyatli Javob:

```json
{
  "success": true,
  "result": [...]
}
```

## ❌ Xato Javob:

```json
{
  "error": "Unauthorized"
}
```

→ Token noto'g'ri yoki muddati tugagan

---

## 🆘 Yordam Kerakmi?

1. REGOS saytiga kiring: https://regos.uz
2. Support bilan bog'laning: support@regos.uz
3. Telefon: REGOS saytidan toping

---

**Keyingi qadam:** Token oling va test qiling! 🎯
