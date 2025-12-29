# Bonuslarni Saqlash - Test Qo'llanma

## Bonuslar MongoDB'ga Saqlanishi

Kunlik Savdo modal oynasida bonuslarni kiritib "Saqlash" tugmasini bosganda, **barcha ma'lumotlar MongoDB'ga saqlanadi**.

## Test Qilish

### 1. Bonuslarni Kiritish

1. Sotuvchini tanlang
2. "Kunlik Savdo" tugmasini bosing
3. Quyidagi ma'lumotlarni kiriting:
   - **Chakana Savdo**: 10,000,000
   - **Optom Savdo**: 5,000,000
   - **Standart Oylik**: 100,000
   - **Shaxsiy Bonus**: 50,000
   - **Jamoaviy Abyom Bonusi**: 75,000
4. "Saqlash" tugmasini bosing

### 2. Console Log'larni Tekshirish

#### Frontend (Browser Console)
```javascript
💰 Saving bonuses: {
  fixedBonus: 100000,
  personalBonus: 50000,
  teamVolumeBonus: 75000,
  retailSales: 10000000,
  wholesaleSales: 5000000
}

📤 Sending to server: {
  name: "Zikrillo",
  position: "sotuvchi",
  percentage: 1.4,
  dailySales: 10000000,
  wholesaleSales: 5000000,
  fixedBonus: 100000,
  personalBonus: 50000,
  teamVolumeBonus: 75000
}
```

#### Backend (Server Console)
```javascript
🔄 Updating employee 67abc123...: {
  name: "Zikrillo",
  fixedBonus: 100000,
  personalBonus: 50000,
  teamVolumeBonus: 75000
}

  ✅ Setting fixedBonus to 100000
  ✅ Setting personalBonus to 50000
  ✅ Setting teamVolumeBonus to 75000

💾 Saving to MongoDB: {
  name: "Zikrillo",
  position: "sotuvchi",
  percentage: 1.4,
  dailyTasks: {...},
  dailySales: 10000000,
  wholesaleSales: 5000000,
  fixedBonus: 100000,
  personalBonus: 50000,
  teamVolumeBonus: 75000,
  lastSalesDate: "2025-12-29"
}

✅ Saved successfully! Employee bonuses: {
  fixedBonus: 100000,
  personalBonus: 50000,
  teamVolumeBonus: 75000
}
```

### 3. MongoDB'da Tekshirish

MongoDB Compass yoki mongosh orqali:

```javascript
db.employees.findOne({ name: "Zikrillo" })
```

Natija:
```json
{
  "_id": ObjectId("67abc123..."),
  "name": "Zikrillo",
  "position": "sotuvchi",
  "percentage": 1.4,
  "branchId": ObjectId("..."),
  "dailySales": 10000000,
  "wholesaleSales": 5000000,
  "fixedBonus": 100000,
  "personalBonus": 50000,
  "teamVolumeBonus": 75000,
  "lastSalesDate": "2025-12-29",
  "dailyTasks": {...}
}
```

### 4. Sahifani Yangilash

1. Sahifani yangilang (F5)
2. Sotuvchini tanlang
3. "Kunlik Savdo" tugmasini bosing
4. ✅ **Barcha bonuslar saqlanib qolgan bo'lishi kerak**

## Ma'lumotlar Oqimi

```
┌─────────────────┐
│  Modal Oyna     │
│  (Frontend)     │
└────────┬────────┘
         │ Saqlash tugmasi
         ▼
┌─────────────────┐
│ updateDailySales│
│  (Frontend)     │
└────────┬────────┘
         │ api.updateEmployee()
         ▼
┌─────────────────┐
│  PUT /api/      │
│  employees/:id  │
│  (Backend)      │
└────────┬────────┘
         │ Employee.findByIdAndUpdate()
         ▼
┌─────────────────┐
│   MongoDB       │
│   (Database)    │
└─────────────────┘
```

## Saqlanadigan Ma'lumotlar

| Maydon | Turi | Misol | Saqlanadi? |
|--------|------|-------|------------|
| dailySales | Number | 10000000 | ✅ Ha |
| wholesaleSales | Number | 5000000 | ✅ Ha |
| fixedBonus | Number | 100000 | ✅ Ha |
| personalBonus | Number | 50000 | ✅ Ha |
| teamVolumeBonus | Number | 75000 | ✅ Ha |
| lastSalesDate | String | "2025-12-29" | ✅ Ha |

## Xatoliklarni Tekshirish

### Agar bonuslar saqlanmasa:

1. **Browser Console'ni tekshiring**
   - F12 tugmasini bosing
   - Console tab'ini oching
   - "💰 Saving bonuses" log'ini qidiring

2. **Server Console'ni tekshiring**
   - Terminal'da server log'larini ko'ring
   - "✅ Saved successfully" xabarini qidiring

3. **Network Tab'ni tekshiring**
   - F12 → Network tab
   - "employees" so'rovini toping
   - Request Payload'ni tekshiring

4. **MongoDB'ni tekshiring**
   - MongoDB Compass'da employees collection'ni oching
   - Xodimni toping va bonuslarni tekshiring

## Agar Muammo Bo'lsa

### Console'da xato ko'rsatilsa:
```javascript
❌ Savdoni saqlashda xato yuz berdi
```

**Yechim:**
1. Server ishlab turganini tekshiring
2. MongoDB ulanganini tekshiring
3. .env faylida MONGODB_URI to'g'ri ekanini tekshiring

### Bonuslar 0 ko'rsatilsa:

**Sabab:** Tarixga saqlagandan keyin bonuslar 0 ga qaytarilgan

**Yechim:** Bu muammo tuzatilgan! Endi faqat kunlik savdo 0 ga qaytariladi, bonuslar saqlanadi.

## Xulosa

✅ Barcha bonuslar MongoDB'ga saqlanadi
✅ Console log'lar orqali kuzatish mumkin
✅ Sahifani yangilagandan keyin ham bonuslar saqlanib qoladi
✅ Tarixga saqlagandan keyin ham bonuslar o'chib ketmaydi
