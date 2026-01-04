#!/usr/bin/env node

/**
 * CRON Job Script for Daily Salary Closing
 * This script is executed by Linux CRON at 23:59 every day
 * 
 * Usage: node server/cronJob.js [date]
 * Example: node server/cronJob.js 2026-01-03
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { closeDailySalary } from './dailyClosingService.js';

// Load environment variables
dotenv.config();

// MongoDB Schemas (same as in index.js)
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

// Create indexes for better performance
dailySalesHistorySchema.index({ date: 1, branchId: 1 }, { unique: true });
dailySalesHistorySchema.index({ date: -1 });

const Employee = mongoose.model('Employee', employeeSchema);
const Branch = mongoose.model('Branch', branchSchema);
const DailySalesHistory = mongoose.model('DailySalesHistory', dailySalesHistorySchema);

/**
 * Main execution function
 */
async function main() {
  try {
    // Get target date from command line argument or use current date
    const targetDate = process.argv[2] || new Date().toISOString().split('T')[0];
    
    console.log('='.repeat(60));
    console.log('DAILY SALARY CLOSING - CRON JOB');
    console.log('='.repeat(60));
    console.log(`Start Time: ${new Date().toISOString()}`);
    console.log(`Target Date: ${targetDate}`);
    console.log('='.repeat(60));
    
    // Connect to MongoDB
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✓ Connected to MongoDB');
    
    // Execute daily closing
    const models = { Branch, Employee, DailySalesHistory };
    const result = await closeDailySalary(models, targetDate);
    
    // Log results
    console.log('='.repeat(60));
    if (result.success) {
      console.log('✓ DAILY CLOSING COMPLETED SUCCESSFULLY');
      console.log(`  - Date: ${result.date}`);
      console.log(`  - Branches Processed: ${result.branchesProcessed}`);
      console.log(`  - Employees Processed: ${result.employeesProcessed}`);
      console.log(`  - Total Salary Amount: ${result.totalSalaryAmount.toFixed(2)}`);
      console.log(`  - Total Penalty Amount: ${result.totalPenaltyAmount.toFixed(2)}`);
    } else {
      console.error('✗ DAILY CLOSING FAILED');
      console.error(`  - Error: ${result.error}`);
      process.exit(1);
    }
    console.log('='.repeat(60));
    
    // Disconnect from MongoDB
    await mongoose.disconnect();
    console.log('✓ Disconnected from MongoDB');
    
    process.exit(0);
    
  } catch (error) {
    console.error('='.repeat(60));
    console.error('✗ FATAL ERROR');
    console.error(error);
    console.error('='.repeat(60));
    
    // Disconnect from MongoDB
    try {
      await mongoose.disconnect();
    } catch (e) {
      // Ignore disconnect errors
    }
    
    process.exit(1);
  }
}

// Execute main function
main();
