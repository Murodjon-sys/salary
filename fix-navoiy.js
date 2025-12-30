// Navoiy filialining sotuvchi 3 va 8 ni tuzatish
import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const employeeSchema = new mongoose.Schema({
  name: String,
  position: String,
  percentage: Number,
  branchId: mongoose.Schema.Types.ObjectId,
  dailyTasks: Object,
  dailySales: { type: Number, default: 0 },
  wholesaleSales: { type: Number, default: 0 },
  lastSalesDate: String,
  fixedBonus: { type: Number, default: 0 },
  personalBonus: { type: Number, default: 0 },
  teamVolumeBonus: { type: Number, default: 0 },
  salesShareBonus: { type: Number, default: 0 },
  monthlyPlan: { type: Number, default: 500000000 },
  monthlyRetailSales: { type: Number, default: 0 },
  planBonus: { type: Number, default: 0 }
});

const Employee = mongoose.model('Employee', employeeSchema);

async function fixNavoiy() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB ga ulandi');

    // Sotuvchi 3 ni tuzatish
    const seller3 = await Employee.findById('694cfeefb36b3b8051f8c869');
    if (seller3) {
      console.log(`\n📊 Sotuvchi 3 (${seller3.name}) - OLDIN:`);
      console.log(`   monthlyRetailSales: ${seller3.monthlyRetailSales}`);
      console.log(`   salesShareBonus: ${seller3.salesShareBonus}`);
      
      // To'g'ri qiymatlarni hisoblash
      const correctSalesShareBonus = (seller3.dailySales || 0) * 0.5 / 100;
      
      seller3.salesShareBonus = correctSalesShareBonus;
      await seller3.save();
      
      console.log(`\n✅ Sotuvchi 3 - KEYIN:`);
      console.log(`   monthlyRetailSales: ${seller3.monthlyRetailSales}`);
      console.log(`   salesShareBonus: ${seller3.salesShareBonus}`);
    }

    // Sotuvchi 8 ni tuzatish
    const seller8 = await Employee.findById('694cff2fb36b3b8051f8c887');
    if (seller8) {
      console.log(`\n📊 Sotuvchi 8 (${seller8.name}) - OLDIN:`);
      console.log(`   monthlyRetailSales: ${seller8.monthlyRetailSales}`);
      console.log(`   salesShareBonus: ${seller8.salesShareBonus}`);
      
      // To'g'ri qiymatlarni hisoblash
      const correctMonthlyRetailSales = 20000000; // 20M ga o'zgartirish
      const correctSalesShareBonus = (seller8.dailySales || 0) * 0.5 / 100;
      
      seller8.monthlyRetailSales = correctMonthlyRetailSales;
      seller8.salesShareBonus = correctSalesShareBonus;
      await seller8.save();
      
      console.log(`\n✅ Sotuvchi 8 - KEYIN:`);
      console.log(`   monthlyRetailSales: ${seller8.monthlyRetailSales}`);
      console.log(`   salesShareBonus: ${seller8.salesShareBonus}`);
    }

    console.log('\n🎉 Navoiy filiali tuzatildi!');
    await mongoose.disconnect();
  } catch (error) {
    console.error('❌ Xato:', error);
    process.exit(1);
  }
}

fixNavoiy();
