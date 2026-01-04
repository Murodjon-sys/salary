#!/usr/bin/env node

/**
 * Manual script to close today's data immediately
 * Use this to close data without waiting for 23:59
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { closeDailySalary } from './server/dailyClosingService.js';

dotenv.config();

// Schemas
const employeeSchema = new mongoose.Schema({
  name: { type: String, required: true },
  position: { type: String, required: true },
  percentage: { type: Number, required: true },
  branchId: { type: mongoose.Schema.Types.ObjectId, ref: 'Branch', required: true },
  dailyTasks: { type: mongoose.Schema.Types.Mixed, default: {} },
  dailySales: { type: Number, default: 0 },
  wholesaleSales: { type: Number, default: 0 },
  lastSalesDate: { type: String, default: null },
  fixedBonus: { type: Number, default: 0 },
  personalBonus: { type: Number, default: 0 },
  teamVolumeBonus: { type: Number, default: 0 },
  salesShareBonus: { type: Number, default: 0 },
  monthlyPlan: { type: Number, default: 500000000 },
  monthlyRetailSales: { type: Number, default: 0 },
  planBonus: { type: Number, default: 0 },
  isPresent: { type: Boolean, default: false }
});

const branchSchema = new mongoose.Schema({
  name: { type: String, required: true },
  totalSales: { type: Number, default: 0 },
  retailSales: { type: Number, default: 0 },
  wholesaleSales: { type: Number, default: 0 },
  penaltyFund: { type: Number, default: 0 },
  regosDepartmentId: { type: Number },
  lastSyncDate: { type: Date }
}, { timestamps: true });

const dailySalesHistorySchema = new mongoose.Schema({
  date: { type: String, required: true },
  branchId: { type: mongoose.Schema.Types.ObjectId, ref: 'Branch', required: true },
  totalSales: { type: Number, default: 0 },
  retailSales: { type: Number, default: 0 },
  wholesaleSales: { type: Number, default: 0 },
  penaltyAmount: { type: Number, default: 0 },
  employees: [{
    employeeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee' },
    name: { type: String },
    position: { type: String },
    percentage: { type: Number },
    dailySales: { type: Number },
    wholesaleSales: { type: Number },
    dailyTasks: { type: mongoose.Schema.Types.Mixed },
    salary: { type: Number },
    penaltyAmount: { type: Number, default: 0 },
    fixedBonus: { type: Number, default: 0 },
    personalBonus: { type: Number, default: 0 },
    teamVolumeBonus: { type: Number, default: 0 },
    salesShareBonus: { type: Number, default: 0 },
    planBonus: { type: Number, default: 0 },
    monthlyRetailSales: { type: Number, default: 0 },
    isPresent: { type: Boolean, default: false }
  }]
}, { timestamps: true });

const Employee = mongoose.model('Employee', employeeSchema);
const Branch = mongoose.model('Branch', branchSchema);
const DailySalesHistory = mongoose.model('DailySalesHistory', dailySalesHistorySchema);

async function main() {
  try {
    const today = new Date().toISOString().split('T')[0];
    
    console.log('='.repeat(60));
    console.log('QOLDA KUNLIK YOPISH');
    console.log('='.repeat(60));
    console.log(`Sana: ${today}`);
    console.log('');
    
    // Connect to MongoDB
    console.log('MongoDB ga ulanilmoqda...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✓ Ulandi');
    console.log('');
    
    // Check current data
    console.log('Hozirgi ma\'lumotlar:');
    const branches = await Branch.find();
    for (const branch of branches) {
      const employees = await Employee.find({ branchId: branch._id });
      const totalDailySales = employees.reduce((sum, emp) => sum + (emp.dailySales || 0), 0);
      console.log(`  ${branch.name}:`);
      console.log(`    - Jami savdo: ${branch.totalSales || 0}`);
      console.log(`    - Xodimlar: ${employees.length}`);
      console.log(`    - Xodimlar kunlik savdosi: ${totalDailySales}`);
    }
    console.log('');
    
    // Ask for confirmation
    console.log('Davom etishni xohlaysizmi? (Ctrl+C to cancel)');
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Execute closing
    console.log('Yopish jarayoni boshlanmoqda...');
    const models = { Branch, Employee, DailySalesHistory };
    const result = await closeDailySalary(models, today);
    
    console.log('');
    console.log('='.repeat(60));
    if (result.success) {
      console.log('✓ MUVAFFAQIYATLI YOPILDI');
      console.log(`  - Sana: ${result.date}`);
      console.log(`  - Filiallar: ${result.branchesProcessed}`);
      console.log(`  - Xodimlar: ${result.employeesProcessed}`);
      console.log(`  - Jami oylik: ${result.totalSalaryAmount.toFixed(2)}`);
      console.log(`  - Jami jarima: ${result.totalPenaltyAmount.toFixed(2)}`);
    } else {
      console.log('✗ XATOLIK');
      console.log(`  - Sabab: ${result.error}`);
    }
    console.log('='.repeat(60));
    
    await mongoose.disconnect();
    process.exit(result.success ? 0 : 1);
    
  } catch (error) {
    console.error('FATAL XATOLIK:', error);
    try {
      await mongoose.disconnect();
    } catch (e) {}
    process.exit(1);
  }
}

main();
