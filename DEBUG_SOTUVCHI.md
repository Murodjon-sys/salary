# Sotuvchi Oylik Muammosi - Debug

## 📊 Ma'lumotlar (Rasmdan):

| Sotuvchi | Foiz | Chakana | Optom | Oylik | Status |
|----------|------|---------|-------|-------|--------|
| 1 | 1% | 10M | 20M | 240,000 | ✅ To'g'ri |
| 3 | 1% | 10M | 20M | 240,000 | ✅ To'g'ri |
| 4 | 1% | 10M | 20M | 200,000 | ❌ Noto'g'ri |
| Laziz | 1% | 10M | 20M | 240,000 | ✅ To'g'ri |
| 2 | 1% | 10M | 20M | 200,000 | ❌ Noto'g'ri |

## 🧮 Hisoblash:

### To'g'ri hisoblash:
```
Chakana: 10,000,000 × 1% = 100,000
Optom: 20,000,000 × 1% ÷ 2 = 100,000
Jami: 100,000 + 100,000 = 200,000

Agar vazifalar 100% bajarilgan:
Oylik: 200,000 × 100% = 200,000 ✅

Agar vazifalar 120% (bonus):
Oylik: 200,000 + 40,000 = 240,000 ✅
```

## 🔍 Ehtimoliy Sabablar:

### 1. Vazifalar Farqi:
- Sotuvchi 1, 3, Laziz: 4/4 vazifa bajarilgan + bonus?
- Sotuvchi 4, 2: 4/4 vazifa bajarilgan, lekin bonus yo'q?

### 2. Fixed Bonus:
- Sotuvchi 1, 3, Laziz: fixedBonus = 40,000
- Sotuvchi 4, 2: fixedBonus = 0

### 3. Vazifalar Soni:
- Sotuvchi 1, 3, Laziz: 4 ta vazifa
- Sotuvchi 4, 2: 5 ta vazifa, 4 tasi bajarilgan = 80%?

## 🎯 Tekshirish:

Browser Console'da (F12):
```javascript
// G'ijduvon filialiga o'ting
const gijduvon = branches.find(b => b.name === "G'ijduvon Filial");

// Barcha sotuvchilarni ko'rish
gijduvon.employees.filter(e => e.position === 'sotuvchi').forEach(emp => {
  console.log(emp.name, {
    dailySales: emp.dailySales,
    wholesaleSales: emp.wholesaleSales,
    percentage: emp.percentage,
    fixedBonus: emp.fixedBonus,
    dailyTasks: emp.dailyTasks,
    tasksCount: Object.keys(emp.dailyTasks || {}).length,
    completedTasks: Object.values(emp.dailyTasks || {}).filter(t => t).length
  });
});
```

## 💡 Yechim:

Agar muammo **fixedBonus** bo'lsa:
- Sotuvchi 4 va 2 ga ham 40,000 bonus qo'shish kerak

Agar muammo **vazifalar** bo'lsa:
- Vazifalar sonini tekshirish va tuzatish kerak
