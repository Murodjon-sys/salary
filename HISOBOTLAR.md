# Hisobotlar Funksiyasi

## Umumiy Ma'lumot

"Hisobotlar" qismi har bir xodimning oylik va yillik ish faoliyatini batafsil ko'rish uchun mo'ljallangan.

## Xususiyatlar

### 1. Filial Bo'yicha Hisobotlar
- Har bir filial uchun alohida hisobotlar
- Sidebar'dan filial tanlash
- Avtomatik ma'lumotlar yangilanishi

### 2. Oy Tanlash
- Oxirgi 12 oy uchun hisobotlar
- Select/Option orqali oy tanlash
- Oylar o'zbek tilida: Yanvar, Fevral, Mart, ...

### 3. Umumiy Statistika (3ta Card)

#### Card 1: Jami Savdo
- Umumiy savdo summasi
- Chakana savdo (yashil rang)
- Optom savdo (ko'k rang)

#### Card 2: Jami Oyliklar
- Barcha xodimlarning oylik yig'indisi
- Necha kun ma'lumoti borligi

#### Card 3: Jami Jarimalar
- Bajarilmagan vazifalar uchun jarimalar
- Qizil rangda ko'rsatiladi

### 4. Xodimlar Hisoboti (Kartochkalar)

Har bir xodim uchun alohida kartochka:

```
📊 Xodim Kartochkasi:
├── Ism va Lavozim
├── Jami Oylik (yashil)
├── Savdo (chakana + optom)
├── Jarimalar (agar bo'lsa)
└── Necha kun ishlagan
```

## Qanday Ishlaydi

### 1. Hisobotlar Sahifasiga O'tish
```
Sidebar → Hisobotlar
```

### 2. Filial Tanlash
```
Sidebar → Navoiy Filial (masalan)
```

### 3. Oy Tanlash
```
Select → Oktabr 2024
```

### 4. Natija
- 3ta umumiy statistika card
- Barcha xodimlarning batafsil hisoboti
- Har bir xodim uchun:
  - Jami oylik
  - Chakana savdo
  - Optom savdo
  - Jarimalar
  - Ishlagan kunlar soni

## Texnik Ma'lumotlar

### Frontend
```typescript
// State
const [selectedMonth, setSelectedMonth] = useState<string>(
  new Date().toISOString().slice(0, 7)
); // YYYY-MM
const [monthlyReports, setMonthlyReports] = useState<any[]>([]);

// Ma'lumotlarni yuklash
const loadMonthlyReports = async (branchId: string, month: string) => {
  const [year, monthNum] = month.split('-');
  const startDate = `${year}-${monthNum}-01`;
  const lastDay = new Date(parseInt(year), parseInt(monthNum), 0).getDate();
  const endDate = `${year}-${monthNum}-${lastDay}`;
  
  const result = await api.getHistory(branchId, startDate, endDate, 100);
  // ...
};
```

### Backend
Mavjud `DailySalesHistory` collection'dan foydalaniladi:
- Sana oralig'i bo'yicha filter
- Xodimlar ma'lumotlari
- Savdo va oylik ma'lumotlari

### Ma'lumotlar Agregatsiyasi
```javascript
// Xodim bo'yicha yig'ish
employeeStats[employeeId] = {
  name: emp.name,
  position: emp.position,
  totalSalary: 0,        // Jami oylik
  totalRetailSales: 0,   // Jami chakana savdo
  totalWholesaleSales: 0, // Jami optom savdo
  totalPenalty: 0,       // Jami jarimalar
  daysWorked: 0          // Ishlagan kunlar
};
```

## Foydalanish Misoli

### Oktabr 2024 Hisoboti

**Navoiy Filial:**

**Umumiy Statistika:**
- Jami Savdo: 250,000,000 so'm
  - Chakana: 180,000,000 so'm
  - Optom: 70,000,000 so'm
- Jami Oyliklar: 15,000,000 so'm
- Jami Jarimalar: 850,000 so'm

**Xodimlar:**

1. **Alisher Valiyev** (Sotuvchi)
   - Jami Oylik: 5,500,000 so'm
   - Chakana: 60,000,000 so'm
   - Optom: 25,000,000 so'm
   - Jarimalar: 300,000 so'm
   - 28 kun ishlagan

2. **Bobur Karimov** (Manager)
   - Jami Oylik: 4,800,000 so'm
   - Chakana: 180,000,000 so'm
   - Optom: 70,000,000 so'm
   - Jarimalar: 0 so'm
   - 30 kun ishlagan

## Afzalliklari

✅ **Batafsil Ma'lumot** - Har bir xodim uchun to'liq hisobot
✅ **Oson Tahlil** - Vizual kartochkalar
✅ **Tez Qidiruv** - Oy bo'yicha filter
✅ **Qiyosiy Tahlil** - Xodimlarni solishtirish
✅ **Jarimalar Nazorati** - Kim qancha jarima olgan

## Kelajakda Qo'shilishi Mumkin

- Excel/PDF export
- Yillik hisobotlar
- Grafiklar va diagrammalar
- Xodimlarni solishtirish
- Eng yaxshi xodimlar reytingi
- Oylik o'sish statistikasi
