# API To'liq Dokumentatsiyasi

## Base URL
```
Backend: http://localhost:3001/api
```

---

## 1. FILIALLAR (BRANCHES)

### 1.1. Barcha filiallarni olish
```http
GET /api/branches
```

**Response:**
```json
[
  {
    "_id": "694bc889497202fca34f6372",
    "name": "Asosiy Sklad",
    "totalSales": 100000000,
    "regosDepartmentId": 1,
    "lastSyncDate": "2024-12-24T10:00:00.000Z",
    "employees": [
      {
        "id": "694bc889497202fca34f6373",
        "name": "Muhammad Aka",
        "position": "manager",
        "percentage": 0.44,
        "dailyTasks": {
          "onTime": false,
          "polkaClean": false,
          "productCheck": false,
          "polkaCode": false
        }
      }
    ]
  }
]
```

**Ma'lumotlar:**
- `_id` - Filial ID (MongoDB)
- `name` - Filial nomi
- `totalSales` - Umumiy savdo (so'm)
- `regosDepartmentId` - Regos tizimidagi department ID
- `lastSyncDate` - Oxirgi sinxronizatsiya vaqti
- `employees` - Xodimlar ro'yxati

---

### 1.2. Filial savdosini yangilash
```http
PUT /api/branches/:id/sales
```

**Request Body:**
```json
{
  "totalSales": 100000000
}
```

**Response:**
```json
{
  "_id": "694bc889497202fca34f6372",
  "name": "Asosiy Sklad",
  "totalSales": 100000000
}
```

---

### 1.3. Filial savdosini Regos dan sinxronlash
```http
POST /api/branches/:id/sync-from-regos
```

**Request Body:**
```json
{
  "departmentId": 1,
  "date": "2024-12-24"
}
```

**Response:**
```json
{
  "ok": true,
  "branch": {
    "_id": "694bc889497202fca34f6372",
    "name": "Asosiy Sklad",
    "totalSales": 100000000,
    "lastSyncDate": "2024-12-24T10:00:00.000Z"
  },
  "salesData": {
    "result": {
      "total_sum": 100000000,
      "items": []
    }
  }
}
```

**Ma'lumotlar:**
- Regos API dan kunlik savdo summasi olinadi
- Filial `totalSales` avtomatik yangilanadi
- `lastSyncDate` yangilanadi

---

## 2. XODIMLAR (EMPLOYEES)

### 2.1. Xodim qo'shish
```http
POST /api/employees
```

**Request Body:**
```json
{
  "name": "Laziz",
  "position": "sotuvchi",
  "percentage": 1.4,
  "branchId": "694bc889497202fca34f6372"
}
```

**Response:**
```json
{
  "id": "694bc889497202fca34f6374",
  "name": "Laziz",
  "position": "sotuvchi",
  "percentage": 1.4
}
```

**Lavozimlar (position):**
- `ishchi` - Ishchi
- `manager` - Manager
- `kassir` - Kassir
- `shofir` - Shofir
- `sotuvchi` - Sotuvchi (4ta kunlik vazifa bilan)
- `taminotchi` - Ta'minotchi

---

### 2.2. Xodimni tahrirlash
```http
PUT /api/employees/:id
```

**Request Body:**
```json
{
  "name": "Laziz",
  "position": "sotuvchi",
  "percentage": 1.4,
  "dailyTasks": {
    "onTime": true,
    "polkaClean": true,
    "productCheck": true,
    "polkaCode": true
  }
}
```

**Response:**
```json
{
  "id": "694bc889497202fca34f6374",
  "name": "Laziz",
  "position": "sotuvchi",
  "percentage": 1.4,
  "dailyTasks": {
    "onTime": true,
    "polkaClean": true,
    "productCheck": true,
    "polkaCode": true
  }
}
```

---

### 2.3. Xodimni o'chirish
```http
DELETE /api/employees/:id
```

**Response:**
```json
{
  "message": "O'chirildi"
}
```

---

### 2.4. Xodim kunlik vazifalarini yangilash (Faqat sotuvchilar uchun)
```http
PUT /api/employees/:id/tasks
```

**Request Body:**
```json
{
  "dailyTasks": {
    "onTime": true,
    "polkaClean": true,
    "productCheck": false,
    "polkaCode": true
  }
}
```

**Response:**
```json
{
  "id": "694bc889497202fca34f6374",
  "dailyTasks": {
    "onTime": true,
    "polkaClean": true,
    "productCheck": false,
    "polkaCode": true
  }
}
```

**Kunlik vazifalar:**
1. `onTime` - Ishga o'z vaqtida kelish
2. `polkaClean` - Polka tozaligi nazorati
3. `productCheck` - Mahsulot kam kelgan bilishi
4. `polkaCode` - Polka terish va kod yopish

**Oylik hisoblash:**
- Barcha vazifalar bajarilsa: `totalSales × 1.4%`
- Biror vazifa bajarilmasa: `totalSales × 1.0%`

---

## 3. REGOS API INTEGRATSIYASI

### 3.1. Regos dan kunlik savdoni olish
```http
POST /api/regos/sync-sales
```

**Request Body:**
```json
{
  "date": "2024-12-24"
}
```

**Response:**
```json
{
  "ok": true,
  "date": "2024-12-24",
  "sales": {
    "result": {
      "total_sum": 100000000,
      "items": [
        {
          "item_name": "Coca-Cola",
          "quantity": 100,
          "sum": 500000
        }
      ]
    }
  }
}
```

**Ma'lumotlar:**
- Regos API dan kunlik savdo ma'lumotlari olinadi
- `total_sum` - Jami savdo summasi
- `items` - Sotilgan mahsulotlar ro'yxati

---

### 3.2. Regos dan filiallarni olish
```http
GET /api/regos/departments
```

**Response:**
```json
{
  "ok": true,
  "departments": [
    {
      "id": 1,
      "name": "Asosiy Sklad",
      "last_update": 1671689500
    },
    {
      "id": 2,
      "name": "G'ijduvon Filial",
      "last_update": 1671689500
    }
  ]
}
```

**Ma'lumotlar:**
- Regos tizimidagi barcha filiallar (departments)
- Har bir filialning ID va nomi

---

## 4. OYLIK HISOBLASH ALGORITMI

### Oddiy xodimlar (ishchi, manager, kassir, shofir, ta'minotchi):
```
Oylik = totalSales × percentage ÷ 100
```

**Misol:**
- Savdo: 100,000,000 so'm
- Foiz: 0.44%
- Oylik: 100,000,000 × 0.44 ÷ 100 = **440,000 so'm**

---

### Sotuvchilar (4ta kunlik vazifa bilan):
```
Agar barcha vazifalar bajarilsa:
  Oylik = totalSales × 1.4% ÷ 100

Aks holda:
  Oylik = totalSales × 1.0% ÷ 100
```

**Misol 1 (Barcha vazifalar bajarilgan):**
- Savdo: 100,000,000 so'm
- Foiz: 1.4%
- Oylik: 100,000,000 × 1.4 ÷ 100 = **1,400,000 so'm**

**Misol 2 (Biror vazifa bajarilmagan):**
- Savdo: 100,000,000 so'm
- Foiz: 1.0% (avtomatik tushadi)
- Oylik: 100,000,000 × 1.0 ÷ 100 = **1,000,000 so'm**

---

## 5. XATO KODLARI

| Kod | Ma'nosi |
|-----|---------|
| 200 | Muvaffaqiyatli |
| 201 | Yaratildi |
| 400 | Noto'g'ri so'rov |
| 404 | Topilmadi |
| 500 | Server xatosi |

---

## 6. REGOS API SOZLASH

`.env` faylida:
```env
REGOS_API_URL=https://api.regos.uz/v1
REGOS_API_KEY=sizning_api_kalitingiz
REGOS_COMPANY_ID=sizning_kompaniya_id
```

**API kalitini olish:**
1. https://apps.regos.uz/ ga kiring
2. Integrations > API ga o'ting
3. API kalit yarating
4. Kalitni `.env` fayliga qo'ying

---

## 7. ISHLATISH MISOLLARI

### Frontend dan API chaqirish:
```javascript
// Filiallarni olish
const branches = await api.getBranches();

// Xodim qo'shish
await api.addEmployee(branchId, {
  name: "Laziz",
  position: "sotuvchi",
  percentage: 1.4
});

// Vazifalarni yangilash
await api.updateEmployeeTasks(employeeId, {
  onTime: true,
  polkaClean: true,
  productCheck: true,
  polkaCode: true
});
```

### cURL orqali test qilish:
```bash
# Filiallarni olish
curl http://localhost:3001/api/branches

# Xodim qo'shish
curl -X POST http://localhost:3001/api/employees \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Laziz",
    "position": "sotuvchi",
    "percentage": 1.4,
    "branchId": "694bc889497202fca34f6372"
  }'

# Regos dan savdoni sinxronlash
curl -X POST http://localhost:3001/api/branches/694bc889497202fca34f6372/sync-from-regos \
  -H "Content-Type: application/json" \
  -d '{
    "departmentId": 1,
    "date": "2024-12-24"
  }'
```

---

## 8. MA'LUMOTLAR OQIMI

```
1. Regos API → Backend
   - Kunlik savdo ma'lumotlari
   - Filiallar ro'yxati

2. Backend → MongoDB
   - Filiallar
   - Xodimlar
   - Savdo tarixi

3. Frontend → Backend → MongoDB
   - Xodim qo'shish/tahrirlash
   - Vazifalarni yangilash
   - Oylik hisoblash

4. Frontend ← Backend ← MongoDB
   - Filiallar va xodimlar ro'yxati
   - Hisoblangan oyliklar
   - Statistika
```

---

## 9. XAVFSIZLIK

- API kalitlar `.env` faylida saqlanadi
- `.gitignore` da `.env` qo'shilgan
- MongoDB ulanish ma'lumotlari yashirin
- CORS sozlangan

---

## 10. QULAYLIKLAR

✅ Avtomatik oylik hisoblash
✅ Regos bilan integratsiya
✅ Kunlik vazifalar nazorati
✅ Real-time yangilanishlar
✅ MongoDB da xavfsiz saqlash
✅ Loader yo'q (tez ishlash)
✅ Minimalist dizayn
