# Sotuvchilar uchun Bonus Tizimi

## Qo'shilgan Yangi Funksiyalar

### 1. Shaxsiy Bonus (Individual Bonus)
- Har bir sotuvchiga alohida beriladi
- Sotuvchining shaxsiy yutuqlari uchun
- Oylik pul miqdoriga qo'shiladi
- MongoDB'da saqlanadi

### 2. Jamoaviy Abyom Bonusi (Team Volume Bonus)
- Jamoa natijasi uchun beriladi
- Barcha sotuvchilar uchun umumiy abyom
- Oylik pul miqdoriga qo'shiladi
- MongoDB'da saqlanadi

## Texnik O'zgarishlar

### Frontend (src/App.tsx)
1. **Yangi State'lar:**
   - `personalBonusInput` - Shaxsiy bonus input qiymati
   - `teamVolumeBonusInput` - Jamoaviy abyom bonusi input qiymati

2. **Modal Oyna:**
   - "Kunlik Savdo" modaliga 2ta yangi input qo'shildi
   - Har bir input o'z rangiga ega (indigo va teal)
   - Real-time hisoblash ko'rsatiladi

3. **Hisoblash:**
   - `calculateSalary()` funksiyasida yangi bonuslar qo'shiladi
   - `calculatePenalty()` funksiyasida bonuslar hisobga olinadi

### Backend (server/index.js)
1. **Employee Schema:**
   ```javascript
   personalBonus: { type: Number, default: 0 }
   teamVolumeBonus: { type: Number, default: 0 }
   ```

2. **DailySalesHistory Schema:**
   - Tarixga saqlanayotgan ma'lumotlarga yangi bonuslar qo'shildi

3. **API Endpoints:**
   - `PUT /api/employees/:id` - Yangi bonuslarni yangilash
   - `GET /api/branches` - Yangi bonuslarni qaytarish
   - `POST /api/history/save-daily` - Tarixga yangi bonuslar bilan saqlash

### API Types (src/api.ts)
```typescript
export type Employee = {
  // ... boshqa maydonlar
  personalBonus?: number;
  teamVolumeBonus?: number;
}
```

## Foydalanish

1. Sotuvchini tanlang
2. "Kunlik Savdo" tugmasini bosing
3. Modal oynada 5ta input ko'rinadi:
   - Chakana Savdo (to'liq foiz)
   - Optom Savdo (yarim foiz)
   - Standart Oylik
   - **Shaxsiy Bonus** (yangi)
   - **Jamoaviy Abyom Bonusi** (yangi)
4. Kerakli qiymatlarni kiriting
5. "Saqlash" tugmasini bosing

## Hisoblash Formulasi

```
Jami Oylik = (Chakana Savdo × Foiz) + 
             (Optom Savdo × Foiz ÷ 2) + 
             Standart Oylik + 
             Shaxsiy Bonus + 
             Jamoaviy Abyom Bonusi
```

Vazifalar foizi qo'llanilgandan keyin:
```
Final Oylik = (Asosiy Oylik × Vazifalar Foizi) + 
              Standart Oylik + 
              Shaxsiy Bonus + 
              Jamoaviy Abyom Bonusi
```

## Ma'lumotlar Bazasi

Barcha bonuslar MongoDB'da saqlanadi:
- Kunlik ma'lumotlar: `employees` collection
- Tarixiy ma'lumotlar: `dailySalesHistory` collection

Tarixga saqlagandan keyin barcha bonuslar 0 ga qaytariladi (keyingi kun uchun).
