# Oylik Plan Avtomatik Saqlash Tizimi

## Qanday Ishlaydi?

Tizim har oyning oxirgi kunini avtomatik aniqlaydi va oylik planni tarixga saqlaydi.

### Avtomatik Tekshirish

1. **Har daqiqa tekshirish**: Server har daqiqada soat 23:00 ekanligini tekshiradi
2. **Oyning oxirgi kunini aniqlash**: Agar ertaga yangi oy boshlansa (bugun oyning oxirgi kuni), saqlash jarayoni boshlanadi
3. **Barcha filiallar uchun**: Har bir filial (Asosiy Skladdan tashqari) uchun oylik plan saqlanadi

### Saqlash Jarayoni

Har oyning oxirgi kuni soat 23:00 da:

1. **Ma'lumotlarni yig'ish**:
   - Har bir sotuvchining oylik plani (default: 500,000,000 so'm)
   - Oylik chakana savdo (monthlyRetailSales)
   - Plan bajarilganmi? (savdo >= plan)
   - Bonus miqdori (1,000,000 so'm agar plan bajarilgan bo'lsa)

2. **Tarixga saqlash**:
   - MonthlyPlanHistory kolleksiyasiga yozuv qo'shiladi
   - Format: YYYY-MM (masalan: 2024-12)
   - Har bir sotuvchining to'liq ma'lumotlari saqlanadi

3. **Reset qilish**:
   - `planBonus` yangilanadi (agar plan bajarilgan bo'lsa 1,000,000)
   - `monthlyRetailSales` 0 ga qaytariladi (keyingi oy uchun)

### Misol

**31-Dekabr, 2024, soat 23:00:**
```
🎯 Bugun oyning oxirgi kuni! Oylik planni saqlash boshlandi...
  ✅ Gijduvon: Saqlandi (8 sotuvchi)
  ✅ Navoi: Saqlandi (6 sotuvchi)

🎉 Oylik plan saqlash yakunlandi:
   📊 Filiallar: 2
   ✅ Plan bajarganlar: 5
   💰 Jami bonus: 5,000,000 so'm
   📅 Oy: 2024-12
```

## Qo'lda Saqlash (Test uchun)

Admin foydalanuvchilar "Oylik Plan" sahifasida "Tarixga Saqlash" tugmasini bosib, istalgan vaqtda oylik planni saqlashi mumkin.

**Diqqat**: Bu faqat test uchun. Tizim avtomatik ravishda har oyning oxirgi kunida saqlaydi.

## API Endpoint

### POST `/api/monthly-plan/auto-save-now`

Qo'lda saqlash uchun endpoint (test va admin uchun).

**Response:**
```json
{
  "ok": true,
  "message": "Oylik plan saqlash jarayoni bajarildi"
}
```

## Texnik Tafsilotlar

### Oyning Oxirgi Kunini Aniqlash

```javascript
const today = new Date();
const tomorrow = new Date(today);
tomorrow.setDate(tomorrow.getDate() + 1);

// Agar ertaga yangi oy boshlansa (bugun oyning oxirgi kuni)
if (tomorrow.getDate() === 1) {
  // Saqlash jarayoni
}
```

Bu usul barcha oylar uchun ishlaydi:
- 28-Fevral (kabisa yili bo'lmasa)
- 29-Fevral (kabisa yilida)
- 30-Aprel, Iyun, Sentyabr, Noyabr
- 31-Yanvar, Mart, May, Iyul, Avgust, Oktyabr, Dekabr

### Server Ishga Tushganda

Server ishga tushganda ham bir marta tekshirish amalga oshiriladi. Agar bugun oyning oxirgi kuni bo'lsa va hali saqlanmagan bo'lsa, avtomatik saqlanadi.

## Xavfsizlik

- Faqat admin foydalanuvchilar qo'lda saqlash tugmasini ko'radi
- Avtomatik saqlash server tomonida amalga oshiriladi
- Har bir oy uchun faqat bir marta saqlanadi (mavjud yozuv yangilanadi)

## Monitoring

Server konsolida quyidagi loglar ko'rsatiladi:
- `📅 Oylik plan avtomatik saqlash tizimi ishga tushdi` - Server ishga tushganda
- `🎯 Bugun oyning oxirgi kuni!` - Oyning oxirgi kunida
- `✅ [Filial nomi]: Saqlandi` - Har bir filial uchun
- `🎉 Oylik plan saqlash yakunlandi` - Jarayon tugaganda
- `❌ Oylik planni saqlashda xato` - Xato yuz berganda
