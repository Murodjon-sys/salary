# Xodimlar Ma'lumotlarini Kiritish

## Regos API Haqida

⚠️ **Muhim:** Regos API da xodimlar (employees/staff) uchun to'g'ridan-to'g'ri endpoint yo'q. 

Regos tizimida faqat quyidagilar mavjud:
- ✅ Savdo ma'lumotlari (Sales)
- ✅ Mahsulotlar (Items)
- ✅ Filiallar (Departments)
- ✅ Mijozlar (Clients)
- ❌ Xodimlar (Employees) - YO'Q

## Bizning Yechim

Xodimlar ma'lumotlarini **bizning tizimimizda** saqlaymiz va boshqaramiz:

### 1. Qo'lda kiritish (UI orqali)
- Har bir xodimni "Xodim Qo'shish" tugmasi orqali qo'shing
- Ism, lavozim va foizni kiriting
- Sotuvchilar uchun kunlik vazifalarni belgilang

### 2. JSON orqali import qilish

**Endpoint:**
```http
POST /api/employees/import
```

**Request Body:**
```json
{
  "branchId": "694bc889497202fca34f6372",
  "employees": [
    {
      "name": "Muhammad Aka",
      "position": "manager",
      "percentage": 0.44
    },
    {
      "name": "Sherzod",
      "position": "kassir",
      "percentage": 0.22
    },
    {
      "name": "Laziz",
      "position": "sotuvchi",
      "percentage": 1.4
    },
    {
      "name": "Akbar Aka",
      "position": "shofir",
      "percentage": 0.14
    },
    {
      "name": "Rustam",
      "position": "taminotchi",
      "percentage": 0.5
    }
  ]
}
```

**Response:**
```json
{
  "ok": true,
  "count": 5,
  "employees": [
    {
      "id": "694bc889497202fca34f6373",
      "name": "Muhammad Aka",
      "position": "manager",
      "percentage": 0.44
    }
  ]
}
```

### 3. Excel/CSV dan import (Kelajakda)

Excel fayldan xodimlarni import qilish funksiyasi qo'shiladi.

---

## Xodimlar Ma'lumotlari Formati

### Majburiy maydonlar:
- `name` - Xodim ismi (string)
- `position` - Lavozim (string)
- `percentage` - Foiz (number)

### Lavozimlar:
- `ishchi` - Ishchi
- `manager` - Manager
- `kassir` - Kassir
- `shofir` - Shofir
- `sotuvchi` - Sotuvchi (4ta kunlik vazifa bilan)
- `taminotchi` - Ta'minotchi

### Foiz misollar:
- Manager: 0.44% (100M savdodan 440,000 so'm)
- Kassir: 0.22% (100M savdodan 220,000 so'm)
- Sotuvchi: 1.4% (100M savdodan 1,400,000 so'm)
- Shofir: 0.14% (100M savdodan 140,000 so'm)

---

## Regos dan Olinadigan Ma'lumotlar

### ✅ Kunlik savdo
```http
POST /api/regos/sync-sales
{
  "date": "2024-12-24"
}
```

**Olinadi:**
- Jami savdo summasi
- Sotilgan mahsulotlar
- Filial bo'yicha savdo

### ✅ Filiallar
```http
GET /api/regos/departments
```

**Olinadi:**
- Filiallar ro'yxati
- Har bir filialning ID va nomi

---

## To'liq Jarayon

### 1. Xodimlarni kiriting (bir marta)
```bash
# Qo'lda yoki JSON orqali
POST /api/employees/import
```

### 2. Kunlik savdoni Regos dan oling
```bash
POST /api/regos/sync-sales
{
  "date": "2024-12-24"
}
```

### 3. Filialga savdoni biriktiring
```bash
POST /api/branches/:id/sync-from-regos
{
  "departmentId": 1,
  "date": "2024-12-24"
}
```

### 4. Oyliklar avtomatik hisoblanadi
```
Xodim oyligi = Savdo × Foiz ÷ 100
```

---

## Misol: Bir kunlik ish jarayoni

**Ertalab (9:00):**
1. Regos dan kechagi savdoni oling
2. Har bir filialga savdoni biriktiring

**Kunlik (har soat):**
1. Sotuvchilar vazifalarini belgilang
2. Oyliklar avtomatik yangilanadi

**Kechqurun (18:00):**
1. Bugungi savdoni Regos dan oling
2. Xodimlar oyligini ko'ring

---

## Xavfsizlik

- Xodimlar ma'lumotlari MongoDB da xavfsiz saqlanadi
- Faqat sizning tizimingizda ko'rinadi
- Regos ga yuborilmaydi
- Parol va shaxsiy ma'lumotlar yo'q

---

## Qo'shimcha Imkoniyatlar

### Export qilish
```http
GET /api/employees/export/:branchId
```

Barcha xodimlarni JSON formatda yuklab olish.

### Backup
MongoDB dan avtomatik backup olinadi.

### Hisobotlar
- Kunlik oyliklar
- Oylik jami
- Filial bo'yicha statistika

---

## Savol-Javoblar

**Q: Regos da xodimlar ma'lumotlari bormi?**
A: Yo'q, Regos API da xodimlar uchun endpoint yo'q.

**Q: Xodimlarni qayerda saqlash kerak?**
A: Bizning tizimimizda (MongoDB).

**Q: Regos dan nima olinadi?**
A: Faqat kunlik savdo ma'lumotlari.

**Q: Oylik qanday hisoblanadi?**
A: Avtomatik: Savdo × Foiz ÷ 100

**Q: Ma'lumotlar xavfsizmi?**
A: Ha, MongoDB da shifrlangan holda saqlanadi.
