# Lavozim Qo'shish Funksiyasi

## Xususiyatlar

### 1. Dinamik Lavozimlar Tizimi
- Standart lavozimlar: Ishchi, Manager, Kassir, Shofir, Sotuvchi, Ta'minotchi
- Yangi lavozimlar qo'shish imkoniyati
- Har bir lavozim uchun rang tanlash (4ta rang: Ko'k, Yashil, Qizil, Binafsha)
- **MongoDB'da saqlash** - Barcha foydalanuvchilar uchun umumiy

### 2. Lavozim Qo'shish Tugmasi
Tugma faqat **Xodimlar sahifasida** mavjud:
- "Tarixga saqlash" tugmasining oldida joylashgan
- Faqat admin foydalanuvchilar uchun ko'rinadi

### 3. Lavozim Qo'shish Modal Oynasi
- **Lavozim nomi** - Masalan: "Do'kon Mudiri"
- **Rang tanlash** - 4ta rang:
  - Ko'k (bg-blue-500)
  - Yashil (bg-green-500)
  - Qizil (bg-red-500)
  - Binafsha (bg-purple-500)
- **Ko'rinish** - Qo'shishdan oldin ko'rish imkoniyati

### 4. Avtomatik Integratsiya
Yangi lavozim qo'shilgandan keyin:
- MongoDB'da saqlanadi
- Barcha foydalanuvchilar uchun ko'rinadi
- Xodim qo'shish modalida avtomatik ko'rinadi
- Xodimni tahrirlash modalida avtomatik ko'rinadi
- Xodimlar jadvalida to'g'ri rang bilan ko'rsatiladi
- Kunlik ishlar sahifasida ishlatilishi mumkin

## Foydalanish

### Lavozim Qo'shish
1. **Xodimlar sahifasiga** o'ting
2. "Lavozim qo'shish" tugmasini bosing (Tarixga saqlash oldida)
3. Lavozim nomini kiriting (masalan: "Do'kon Mudiri")
4. Rangni tanlang (4ta variant)
5. Ko'rinishni tekshiring
6. "Qo'shish" tugmasini bosing
7. Lavozim MongoDB'da saqlanadi ✅

### Xodim Qo'shish (Yangi Lavozim Bilan)
1. Xodimlar jadvalidagi "Xodim qo'shish" tugmasini bosing
2. Ism kiriting
3. Lavozimni tanlang (standart + qo'shilgan lavozimlar)
4. Foizni kiriting
5. "Qo'shish" tugmasini bosing
6. Xodim muvaffaqiyatli qo'shiladi ✅

## Texnik Ma'lumotlar

### Frontend (TypeScript)
```typescript
// Employee type - har qanday lavozim qabul qiladi
export type Employee = {
  id: string;
  name: string;
  position: string; // Dinamik
  percentage: number;
  // ...
};

// API funksiyalari
api.getPositions() // Barcha lavozimlarni olish
api.addPosition(id, name, color) // Yangi lavozim qo'shish
api.deletePosition(id) // Lavozimni o'chirish
```

### Backend (MongoDB)
```javascript
// Position schema
const positionSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  color: { type: String, required: true },
  isDefault: { type: Boolean, default: false }
}, { timestamps: true });

// Employee schema - enum o'chirildi
const employeeSchema = new mongoose.Schema({
  name: { type: String, required: true },
  position: { type: String, required: true }, // Dinamik
  percentage: { type: Number, required: true },
  // ...
});
```

### API Endpoints
```
GET    /api/positions          - Barcha lavozimlarni olish
POST   /api/positions          - Yangi lavozim qo'shish
DELETE /api/positions/:id      - Lavozimni o'chirish
```

### Ma'lumotlar Bazasi
- Collection: `positions`
- Standart lavozimlar avtomatik yaratiladi (isDefault: true)
- Custom lavozimlar (isDefault: false)
- Standart lavozimlarni o'chirish mumkin emas

## Muhim O'zgarishlar
- ✅ Employee type'ida position enum o'chirildi (string qilindi)
- ✅ Backend schema'da position enum o'chirildi
- ✅ TaskTemplate schema'da position enum o'chirildi
- ✅ Rang tanlash 4ta rangga qisqartirildi
- ✅ Yangi lavozim bilan xodim qo'shish to'liq ishlaydi
- ✅ **localStorage o'rniga MongoDB ishlatiladi**
- ✅ Position model va API endpoint'lar qo'shildi
- ✅ Barcha foydalanuvchilar uchun umumiy lavozimlar

## Xavfsizlik
- Standart lavozimlarni o'chirish mumkin emas
- Lavozimda xodimlar bo'lsa, o'chirish mumkin emas
- Dublikat lavozimlar qo'shish mumkin emas
- Barcha operatsiyalar MongoDB'da saqlanadi

## Kelajakda Qo'shilishi Mumkin
- Lavozimlarni tahrirlash
- Lavozimlar tartibini o'zgartirish
- Lavozimlar uchun maxsus foiz belgilash
- Lavozimlar uchun maxsus vazifalar
- Lavozimlar statistikasi