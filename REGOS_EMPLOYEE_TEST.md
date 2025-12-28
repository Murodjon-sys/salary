# REGOS API - Xodimlar Ma'lumotini Test Qilish

## 🎯 Maqsad

REGOS API dan quyidagi ma'lumotlarni olish mumkinmi tekshirish:
1. **Xodim ismi** (Sotuvchi, Kassir, va boshqalar)
2. **Lavozim** (Position/Role)
3. **Kunlik savdo** (Har bir xodim uchun)
4. **Chakana va Optom savdo** (Alohida)

## 🚀 Tezkor Test

### 1. Test Scriptini Ishga Tushirish

```bash
# Token ni o'rnating
export REGOS_TOKEN='your_regos_api_token_here'

# Test scriptini ishga tushiring
python3 test_regos_employees.py
```

### 2. Natijalarni Tahlil Qilish

Script quyidagi testlarni bajaradi:

#### ✅ Test 1: Sale/Get - Savdo Ma'lumotlari
```json
{
  "result": [
    {
      "id": 12345,
      "date": "2024-12-28T15:30:00",
      "department_id": 1,
      "department_name": "Navoiy Filial",
      "cashier": "Kassir Ismi",        // ← Xodim ma'lumoti
      "employee_id": 101,               // ← Xodim ID
      "employee_name": "Sotuvchi Ismi", // ← Xodim ismi
      "position": "Sotuvchi",           // ← Lavozim
      "total_amount": 500000,
      "sale_type": "retail"             // ← Chakana/Optom
    }
  ]
}
```

**Agar bu maydonlar bo'lsa:**
- ✅ `cashier` yoki `employee_name` → Xodim ismi bor
- ✅ `position` yoki `role` → Lavozim bor
- ✅ `sale_type` → Chakana/Optom farqlash mumkin

#### ✅ Test 2: Employee/List - Xodimlar Ro'yxati
```json
{
  "result": [
    {
      "id": 101,
      "name": "Sotuvchi Ismi",
      "position": "Sotuvchi",
      "department_id": 1,
      "active": true
    }
  ]
}
```

**Agar bu endpoint ishlasa:**
- ✅ Barcha xodimlarni olish mumkin
- ✅ Lavozimlarni sinxronizatsiya qilish mumkin

#### ✅ Test 3: Sale/GetByEmployee - Xodim Bo'yicha Savdo
```json
{
  "result": {
    "employee_id": 101,
    "employee_name": "Sotuvchi Ismi",
    "total_sales": 5000000,
    "retail_sales": 3000000,
    "wholesale_sales": 2000000
  }
}
```

**Agar bu endpoint ishlasa:**
- ✅ Har bir xodimning savdosini alohida olish mumkin
- ✅ To'liq integratsiya qilish mumkin

## 📊 Mumkin Bo'lgan Stsenariylar

### Stsenariy 1: To'liq Ma'lumot Bor ✅

**REGOS API qaytaradi:**
- Xodim ismi ✅
- Lavozim ✅
- Kunlik savdo ✅
- Chakana/Optom ✅

**Sizning tizimga integratsiya:**
```javascript
// REGOS dan
{
  employee_name: "Zikrillo",
  position: "Sotuvchi",
  retail_sales: 3000000,
  wholesale_sales: 2000000
}

// Sizning MongoDB ga
{
  name: "Zikrillo",
  position: "sotuvchi",
  dailySales: 3000000,
  wholesaleSales: 2000000
}
```

### Stsenariy 2: Faqat Filial Ma'lumoti ⚠️

**REGOS API qaytaradi:**
- Filial nomi ✅
- Jami savdo ✅
- Xodim ma'lumoti ❌

**Sizning tizimga integratsiya:**
```javascript
// REGOS dan
{
  department_name: "Navoiy Filial",
  total_sales: 10000000,
  retail_sales: 6000000,
  wholesale_sales: 4000000
}

// Sizning MongoDB ga (faqat filial)
{
  branchName: "Navoiy Filial",
  totalSales: 10000000,
  retailSales: 6000000,
  wholesaleSales: 4000000
}

// Xodimlar uchun qo'lda kiritish kerak
```

### Stsenariy 3: Xodim ID Bor, Ism Yo'q ⚠️

**REGOS API qaytaradi:**
- Xodim ID ✅
- Xodim ismi ❌

**Yechim:**
1. `Employee/List` dan xodimlar ro'yxatini oling
2. ID bo'yicha mapping qiling
3. Ismlarni sinxronizatsiya qiling

## 🔧 Qo'lda Test Qilish

### cURL orqali

```bash
# Token
TOKEN="your_token_here"

# Test 1: Savdo ma'lumotlari
curl -X POST https://api.regos.uz/v1/Sale/Get \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "date_from": "2024-12-28 00:00:00",
    "date_to": "2024-12-28 23:59:59",
    "stock_id": 1
  }' | python3 -m json.tool

# Test 2: Xodimlar ro'yxati
curl -X GET https://api.regos.uz/v1/Employee/List \
  -H "Authorization: Bearer $TOKEN" | python3 -m json.tool

# Test 3: Filiallar
curl -X GET https://api.regos.uz/v1/Department/List \
  -H "Authorization: Bearer $TOKEN" | python3 -m json.tool
```

### Postman orqali

1. **Yangi Request yarating**
2. **Method:** POST
3. **URL:** `https://api.regos.uz/v1/Sale/Get`
4. **Headers:**
   - `Authorization: Bearer your_token_here`
   - `Content-Type: application/json`
5. **Body (raw JSON):**
```json
{
  "date_from": "2024-12-28 00:00:00",
  "date_to": "2024-12-28 23:59:59",
  "stock_id": 1,
  "group_by_item": true
}
```
6. **Send** bosing va javobni tahlil qiling

## 📋 Natijalarni Tahlil Qilish

### Agar Xodim Ma'lumoti Bor Bo'lsa:

```bash
# Test natijasida ko'ring:
✅ Xodim maydonlari topildi: ['cashier', 'employee_name']
✅ Savdo turi maydonlari: ['sale_type']
```

**Keyingi qadam:**
1. `server/regosIntegration.js` ni yangilang
2. Xodim ma'lumotlarini mapping qiling
3. Avtomatik sinxronizatsiya sozlang

### Agar Xodim Ma'lumoti Yo'q Bo'lsa:

```bash
# Test natijasida ko'ring:
⚠️  Xodim maydonlari topilmadi
⚠️  Faqat filial bo'yicha jami savdoni olish mumkin
```

**Yechimlar:**
1. REGOS support bilan bog'laning
2. Xodim ma'lumotlarini qo'lda kiriting
3. Faqat filial bo'yicha integratsiya qiling

## 💡 REGOS Support bilan Bog'lanish

Agar test natijasi aniq bo'lmasa:

**Email:** support@regos.uz

**Savol:**
```
Assalomu alaykum,

Men REGOS API orqali quyidagi ma'lumotlarni olishim kerak:
1. Xodim ismi (sotuvchi, kassir)
2. Lavozim
3. Har bir xodimning kunlik savdosi
4. Chakana va optom savdo alohida

Qaysi endpoint'lardan foydalanishim kerak?
API dokumentatsiyasini yuboring.

Rahmat!
```

## 🎯 Xulosa

Test scriptini ishga tushiring va natijaga qarab:

1. **To'liq ma'lumot bor** → To'liq integratsiya qiling
2. **Qisman ma'lumot** → Mapping strategiyasini tanlang
3. **Ma'lumot yo'q** → REGOS support bilan bog'laning

---

**Keyingi qadam:** Test natijalarini yuboring, men sizga aniq yechim beraman! 🚀
