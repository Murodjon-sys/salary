# REGOS API Integratsiyasi - To'liq Qo'llanma

## 📊 REGOS API dan Keladigan Ma'lumotlar

### 1. Sale/Get Endpoint Javobi

```json
{
  "success": true,
  "result": [
    {
      "id": 12345,
      "date": "2024-12-28T15:30:00",
      "department_id": 1,
      "department_name": "Navoiy Filial",
      "item_id": 101,
      "item_name": "Mahsulot 1",
      "quantity": 10,
      "price": 50000,
      "total_amount": 500000,
      "sale_type": "retail", // yoki "wholesale"
      "cashier": "Kassir1",
      "payment_type": "cash" // yoki "card", "transfer"
    },
    {
      "id": 12346,
      "date": "2024-12-28T16:45:00",
      "department_id": 2,
      "department_name": "G'ijduvon Filial",
      "item_id": 102,
      "item_name": "Mahsulot 2",
      "quantity": 5,
      "price": 100000,
      "total_amount": 500000,
      "sale_type": "wholesale",
      "cashier": "Kassir2",
      "payment_type": "card"
    }
  ],
  "total_count": 2,
  "total_amount": 1000000
}
```

## 🔗 Sizning Tizimga Integratsiya

### Qanday Ma'lumotlar Kerak?

Sizning oylik hisoblash tizimingiz uchun:

1. **Filial bo'yicha jami savdo** (retailSales, wholesaleSales)
2. **Sotuvchilar bo'yicha savdo** (agar REGOS'da sotuvchi ma'lumoti bo'lsa)
3. **Sana bo'yicha savdo tarixi**

### Integratsiya Variantlari

#### Variant 1: Avtomatik Sinxronizatsiya (Tavsiya etiladi)

Har kuni avtomatik ravishda REGOS'dan ma'lumot olib, sizning tizimingizga yozadi.

#### Variant 2: Qo'lda Sinxronizatsiya

Admin panel orqali tugma bosib, ma'lumotlarni oladi.

#### Variant 3: Real-time Webhook

REGOS har bir savdodan keyin sizning serveringizga webhook yuboradi (agar REGOS qo'llab-quvvatlasa).

## 📝 Sizning Tizimga Mos Integratsiya

Sizning tizimingizda:
- **Branch** (Filial) - totalSales, retailSales, wholesaleSales
- **Employee** (Xodim) - dailySales, wholesaleSales
- **DailySalesHistory** (Tarix)

REGOS'dan kelgan ma'lumotlarni quyidagicha mapping qilish kerak:

```javascript
// REGOS ma'lumoti
{
  department_id: 1,
  department_name: "Navoiy Filial",
  total_amount: 5000000,
  sale_type: "retail"
}

// Sizning tizimingizga
{
  branchId: "mongodb_id",
  retailSales: 5000000,  // agar sale_type === "retail"
  wholesaleSales: 0
}
```

## 🚀 Amaliy Integratsiya Kodi

Men sizga 3 xil yechim tayyorladim:

1. **regos_sync_service.js** - Node.js backend service
2. **regos_webhook_handler.js** - Webhook qabul qilish
3. **regos_manual_sync.js** - Qo'lda sinxronizatsiya

Qaysi variantni xohlaysiz?

## 💡 Tavsiyalar

### Eng Yaxshi Yondashuv:

1. **Har kuni 23:59 da** Python script REGOS'dan ma'lumot oladi
2. **00:01 da** Node.js service JSON faylni o'qiydi va bazaga yozadi
3. **Admin panel'da** qo'lda sinxronizatsiya tugmasi bo'ladi (zarurat uchun)

### Afzalliklari:

- ✅ Avtomatik ishlaydi
- ✅ Xatolik bo'lsa, qayta urinish mumkin
- ✅ Tarix saqlanadi (JSON fayllar)
- ✅ Admin nazorat qilishi mumkin

## 🔧 Keyingi Qadamlar

1. REGOS API dokumentatsiyasini ko'ring
2. Qaysi ma'lumotlar kerakligini aniqlang
3. Mapping strategiyasini tanlang
4. Test muhitda sinab ko'ring
5. Production'ga deploy qiling

---

**Savol:** Qaysi integratsiya variantini xohlaysiz?

A) Avtomatik sinxronizatsiya (Python → JSON → Node.js → MongoDB)
B) To'g'ridan-to'g'ri (Python → MongoDB)
C) Webhook (REGOS → Node.js → MongoDB)
D) Qo'lda (Admin panel tugmasi)

Javobingizga qarab, to'liq kod yozib beraman! 🚀
