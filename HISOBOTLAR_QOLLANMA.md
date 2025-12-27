# Hisobotlar - Foydalanish Qo'llanmasi

## ✅ Hisobotlar Avtomatik Saqlanadi!

"Tarixga saqlash" tugmasini bosganda barcha ma'lumotlar avtomatik ravishda **Hisobotlar** qismiga ham saqlanadi.

## 📋 Qanday Ishlaydi

### 1. Ma'lumotlarni Saqlash

**Xodimlar sahifasida:**
```
1. Xodimlarning kunlik savdosini kiriting
2. Vazifalarni belgilang
3. "Tarixga saqlash" tugmasini bosing
4. ✅ Ma'lumotlar avtomatik saqlanadi
```

**Nima saqlanadi:**
- ✅ Har bir xodimning ismi va lavozimi
- ✅ Chakana savdo summasi
- ✅ Optom savdo summasi
- ✅ Hisoblangan oylik
- ✅ Jarimalar (agar bo'lsa)
- ✅ Kunlik vazifalar holati
- ✅ Sana

### 2. Hisobotlarni Ko'rish

**Hisobotlar sahifasiga o'tish:**
```
Sidebar → Hisobotlar
```

**Filial tanlash:**
```
Sidebar → Navoiy Filial (masalan)
```

**Oy tanlash:**
```
Select → Oktabr 2024
```

**Natija:**
- 3ta umumiy statistika card
- Barcha xodimlarning batafsil hisoboti

## 📊 Hisobotda Ko'rsatiladigan Ma'lumotlar

### Umumiy Statistika (3ta Card)

#### 1. Jami Savdo
```
Umumiy: 250,000,000 so'm
├── Chakana: 180,000,000 so'm
└── Optom: 70,000,000 so'm
```

#### 2. Jami Oyliklar
```
15,000,000 so'm
(28 kun ma'lumoti)
```

#### 3. Jami Jarimalar
```
850,000 so'm
(Bajarilmagan vazifalar uchun)
```

### Xodimlar Hisoboti

Har bir xodim uchun:

```
👤 Alisher Valiyev (Sotuvchi)

💰 Jami Oylik: 5,500,000 so'm

📦 Savdo:
   Chakana: 60,000,000 so'm
   Optom: 25,000,000 so'm

⚠️ Jarimalar: 300,000 so'm

📅 28 kun ishlagan
```

## 🔄 Qanday Hisoblash Ishlaydi

### Oylik Hisoblash

**Sotuvchi uchun:**
```javascript
// Chakana savdo (to'liq foiz)
Chakana Oylik = Chakana Savdo × Foiz / 100

// Optom savdo (yarim foiz)
Optom Oylik = Optom Savdo × Foiz / 100 / 2

// Jami asosiy oylik
Asosiy Oylik = Chakana Oylik + Optom Oylik

// Vazifalar foizi
Vazifalar Foizi = 100% - (Bajarilmagan × 10%)

// Yakuniy oylik
Yakuniy Oylik = Asosiy Oylik × Vazifalar Foizi / 100
```

**Boshqa xodimlar uchun:**
```javascript
// Filialning umumiy savdosidan
Chakana Oylik = Filial Chakana × Foiz / 100
Optom Oylik = Filial Optom × Foiz / 100 / 2

Jami Oylik = Chakana Oylik + Optom Oylik
```

### Jarima Hisoblash

```javascript
Jarima = Asosiy Oylik - Yakuniy Oylik
```

Faqat sotuvchilar uchun (vazifalar bo'lsa).

## 📅 Oylik Hisobotlar

### Oxirgi 12 Oy

Tizim oxirgi 12 oyning hisobotlarini ko'rsatadi:
- Dekabr 2024
- Noyabr 2024
- Oktabr 2024
- ...
- Yanvar 2024

### Agregatsiya

Tanlangan oy uchun:
- Barcha kunlarning ma'lumotlari yig'iladi
- Har bir xodim uchun jami hisoblanadi
- Ishlagan kunlar soni ko'rsatiladi

## 💡 Maslahatlar

### 1. Har Kuni Saqlang
```
✅ Har kuni "Tarixga saqlash" tugmasini bosing
✅ Ma'lumotlar avtomatik hisobotlarga qo'shiladi
✅ Oylik hisobotlar to'liq bo'ladi
```

### 2. Oylik Tekshirish
```
✅ Har oy oxirida hisobotlarni tekshiring
✅ Xodimlarning ish faoliyatini tahlil qiling
✅ Jarimalarni ko'rib chiqing
```

### 3. Qiyoslash
```
✅ Turli oylarni solishtiring
✅ Xodimlarni bir-biri bilan qiyoslang
✅ Eng yaxshi xodimlarni aniqlang
```

## ❓ Tez-tez So'raladigan Savollar

### Q: Hisobotlar qayerda saqlanadi?
**A:** MongoDB'da `DailySalesHistory` collection'da.

### Q: Eski ma'lumotlarni o'chirish mumkinmi?
**A:** Ha, "Tarix" qismida har bir yozuvni o'chirish mumkin.

### Q: Nima uchun ba'zi oylar bo'sh?
**A:** O'sha oyda "Tarixga saqlash" bosilmagan.

### Q: Xodim o'chirilsa, hisobotlar yo'qoladimi?
**A:** Yo'q, hisobotlar saqlanib qoladi.

### Q: Bir necha marta "Tarixga saqlash" bossa nima bo'ladi?
**A:** Oxirgi ma'lumot saqlanadi (yangilanadi).

## 🎯 Xulosa

1. **Tarixga saqlash** = Hisobotlarga saqlash
2. Har kuni saqlang
3. Oylik hisobotlarni tekshiring
4. Xodimlarni tahlil qiling
5. Jarimalarni nazorat qiling

**Hammasi avtomatik!** Siz faqat "Tarixga saqlash" tugmasini bosasiz, qolganini tizim o'zi bajaradi. 🚀
