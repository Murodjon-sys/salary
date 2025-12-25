# Regos API Integratsiyasi

## Sozlash

1. `.env` faylida Regos API kalitlarini to'ldiring:
```env
REGOS_API_URL=https://api.regos.uz/v1
REGOS_API_KEY=sizning_api_kalitingiz
REGOS_COMPANY_ID=sizning_kompaniya_id
```

2. Regos API kalitini olish:
   - https://apps.regos.uz/ ga kiring
   - Integrations > API ga o'ting
   - API kalit yarating

## Qanday ishlaydi

### 1. Kunlik savdo ma'lumotlarini olish
```bash
POST /api/regos/sync-sales
{
  "date": "2024-12-24"
}
```

### 2. Filiallarni Regos dan olish
```bash
GET /api/regos/departments
```

### 3. Filial savdosini Regos dan yangilash
```bash
POST /api/branches/:id/sync-from-regos
{
  "departmentId": 1,
  "date": "2024-12-24"
}
```

## Xususiyatlar

- ✅ Regos dan kunlik savdo ma'lumotlarini avtomatik olish
- ✅ Filial bo'yicha savdo hisoboti
- ✅ Xodimlar oyligini avtomatik hisoblash
- ✅ MongoDB da ma'lumotlarni saqlash

## Xodimlar boshqaruvi

Xodimlar ma'lumotlari bizning tizimimizda saqlanadi:
- Ism
- Lavozim (ishchi, manager, kassir, shofir, sotuvchi, ta'minotchi)
- Foiz (savdodan qancha % oladi)
- Kunlik vazifalar (faqat sotuvchilar uchun)

Regos dan faqat savdo ma'lumotlari olinadi va xodimlar oyligini hisoblash uchun ishlatiladi.

## Misol

1. Regos dan bugungi savdoni oling
2. Filialga biriktiring
3. Xodimlar avtomatik oylik oladi (savdo * foiz / 100)
