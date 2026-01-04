/**
 * Daily Salary Closing Service
 * Automatically closes daily salary data at 23:59 every day
 * - Saves data to history
 * - Resets daily data
 * - Uses transactions for safety
 * - Idempotent (can run multiple times safely)
 */

import mongoose from 'mongoose';

/**
 * Main function to close daily salary data
 * @param {Object} models - MongoDB models (Branch, Employee, DailySalesHistory)
 * @param {String} targetDate - Date to close (YYYY-MM-DD format)
 * @returns {Object} - Result with success status and details
 */
export async function closeDailySalary(models, targetDate = null) {
  const { Branch, Employee, DailySalesHistory } = models;
  
  // Use current date if not specified
  const closeDate = targetDate || new Date().toISOString().split('T')[0];
  
  console.log(`[${new Date().toISOString()}] Starting daily salary closing for date: ${closeDate}`);
  
  // Start a session for transaction
  const session = await mongoose.startSession();
  
  try {
    // Start transaction
    await session.startTransaction();
    
    // Get all branches
    const branches = await Branch.find().session(session);
    
    let totalBranchesProcessed = 0;
    let totalEmployeesProcessed = 0;
    let totalSalaryAmount = 0;
    let totalPenaltyAmount = 0;
    
    for (const branch of branches) {
      // Get all employees for this branch
      const employees = await Employee.find({ branchId: branch._id }).session(session);
      
      if (employees.length === 0) {
        console.log(`[${branch.name}] No employees found, skipping...`);
        continue;
      }
      
      // Check if already closed for this date
      const existingHistory = await DailySalesHistory.findOne({
        date: closeDate,
        branchId: branch._id
      }).session(session);
      
      if (existingHistory) {
        console.log(`[${branch.name}] Already closed for ${closeDate}, skipping...`);
        continue;
      }
      
      // Calculate salary for each employee
      let branchTotalPenalty = 0;
      const employeesData = [];
      
      for (const emp of employees) {
        let salary = 0;
        let penaltyAmount = 0;
        
        // Calculate salary based on position
        if (emp.position === 'sotuvchi' && (emp.dailySales || emp.wholesaleSales)) {
          // Seller: calculate from daily sales
          const retailSalary = (emp.dailySales || 0) * emp.percentage / 100;
          const wholesaleSalary = (emp.wholesaleSales || 0) * emp.percentage / 100 / 2;
          const baseSalary = retailSalary + wholesaleSalary;
          
          // Apply task completion percentage
          if (emp.dailyTasks && Object.keys(emp.dailyTasks).length > 0) {
            const completedTasks = Object.values(emp.dailyTasks).filter(task => task === true).length;
            const totalTasks = Object.keys(emp.dailyTasks).length;
            const incompleteTasks = totalTasks - completedTasks;
            const taskPercentage = 100 - (incompleteTasks * 10);
            salary = (baseSalary * taskPercentage) / 100;
            
            // Calculate penalty
            penaltyAmount = baseSalary - salary;
            branchTotalPenalty += penaltyAmount;
          } else {
            salary = baseSalary;
          }
          
          // Add bonuses
          salary += (emp.fixedBonus || 0);
          salary += (emp.personalBonus || 0);
          salary += (emp.teamVolumeBonus || 0);
          salary += (emp.salesShareBonus || 0);
          salary += (emp.planBonus || 0);
        } else {
          // Other employees: calculate from branch sales
          const retailSalary = (branch.retailSales || 0) * emp.percentage / 100;
          const wholesaleSalary = (branch.wholesaleSales || 0) * emp.percentage / 100 / 2;
          const baseSalary = retailSalary + wholesaleSalary;
          
          // Apply task completion percentage
          if (emp.dailyTasks && Object.keys(emp.dailyTasks).length > 0) {
            const completedTasks = Object.values(emp.dailyTasks).filter(task => task === true).length;
            const totalTasks = Object.keys(emp.dailyTasks).length;
            const incompleteTasks = totalTasks - completedTasks;
            const taskPercentage = 100 - (incompleteTasks * 10);
            salary = (baseSalary * taskPercentage) / 100;
            
            // Calculate penalty
            penaltyAmount = baseSalary - salary;
            branchTotalPenalty += penaltyAmount;
          } else {
            salary = baseSalary;
          }
          
          // Add bonuses
          salary += (emp.fixedBonus || 0);
          salary += (emp.personalBonus || 0);
          salary += (emp.teamVolumeBonus || 0);
          salary += (emp.salesShareBonus || 0);
          salary += (emp.planBonus || 0);
        }
        
        // Add to employees data
        employeesData.push({
          employeeId: emp._id,
          name: emp.name,
          position: emp.position,
          percentage: emp.percentage,
          dailySales: emp.dailySales || 0,
          wholesaleSales: emp.wholesaleSales || 0,
          dailyTasks: emp.dailyTasks || {},
          salary: salary,
          penaltyAmount: penaltyAmount,
          fixedBonus: emp.fixedBonus || 0,
          personalBonus: emp.personalBonus || 0,
          teamVolumeBonus: emp.teamVolumeBonus || 0,
          salesShareBonus: emp.salesShareBonus || 0,
          planBonus: emp.planBonus || 0,
          monthlyRetailSales: emp.monthlyRetailSales || 0,
          isPresent: emp.isPresent || false
        });
        
        totalSalaryAmount += salary;
        totalEmployeesProcessed++;
      }
      
      // Save to history
      const historyRecord = new DailySalesHistory({
        date: closeDate,
        branchId: branch._id,
        totalSales: branch.totalSales || 0,
        retailSales: branch.retailSales || 0,
        wholesaleSales: branch.wholesaleSales || 0,
        penaltyAmount: branchTotalPenalty,
        employees: employeesData
      });
      
      await historyRecord.save({ session });
      
      // Update penalty fund
      await Branch.findByIdAndUpdate(
        branch._id,
        { $inc: { penaltyFund: branchTotalPenalty } },
        { session }
      );
      
      // Reset daily data for all employees
      for (const emp of employees) {
        // Reset tasks to false
        const resetTasks = {};
        if (emp.dailyTasks && typeof emp.dailyTasks === 'object') {
          for (const taskId in emp.dailyTasks) {
            resetTasks[taskId] = false;
          }
        }
        
        // For sellers, fixedBonus should be 0
        const fixedBonusToSave = emp.position === 'sotuvchi' ? 0 : (emp.fixedBonus || 0);
        
        await Employee.findByIdAndUpdate(
          emp._id,
          {
            dailySales: 0,
            wholesaleSales: 0,
            lastSalesDate: null,
            fixedBonus: fixedBonusToSave,
            personalBonus: 0,
            teamVolumeBonus: 0,
            salesShareBonus: 0,
            dailyTasks: resetTasks,
            isPresent: false
          },
          { session }
        );
      }
      
      // Reset branch sales
      await Branch.findByIdAndUpdate(
        branch._id,
        {
          totalSales: 0,
          retailSales: 0,
          wholesaleSales: 0
        },
        { session }
      );
      
      totalBranchesProcessed++;
      totalPenaltyAmount += branchTotalPenalty;
      
      console.log(`[${branch.name}] Processed ${employees.length} employees, Total Salary: ${totalSalaryAmount.toFixed(2)}, Penalty: ${branchTotalPenalty.toFixed(2)}`);
    }
    
    // Commit transaction
    await session.commitTransaction();
    
    const result = {
      success: true,
      date: closeDate,
      branchesProcessed: totalBranchesProcessed,
      employeesProcessed: totalEmployeesProcessed,
      totalSalaryAmount: totalSalaryAmount,
      totalPenaltyAmount: totalPenaltyAmount,
      timestamp: new Date().toISOString()
    };
    
    console.log(`[${new Date().toISOString()}] Daily closing completed successfully:`, result);
    
    return result;
    
  } catch (error) {
    // Rollback transaction on error
    await session.abortTransaction();
    
    console.error(`[${new Date().toISOString()}] Error during daily closing:`, error);
    
    return {
      success: false,
      error: error.message,
      date: closeDate,
      timestamp: new Date().toISOString()
    };
    
  } finally {
    // End session
    await session.endSession();
  }
}

/**
 * Check if a date has already been closed
 * @param {Object} DailySalesHistory - MongoDB model
 * @param {String} branchId - Branch ID
 * @param {String} date - Date to check (YYYY-MM-DD)
 * @returns {Boolean} - True if already closed
 */
export async function isDateClosed(DailySalesHistory, branchId, date) {
  const existing = await DailySalesHistory.findOne({
    date: date,
    branchId: branchId
  });
  
  return !!existing;
}

/**
 * Get closing history for a date range
 * @param {Object} DailySalesHistory - MongoDB model
 * @param {String} startDate - Start date (YYYY-MM-DD)
 * @param {String} endDate - End date (YYYY-MM-DD)
 * @returns {Array} - History records
 */
export async function getClosingHistory(DailySalesHistory, startDate, endDate) {
  return await DailySalesHistory.find({
    date: { $gte: startDate, $lte: endDate }
  }).sort({ date: -1 });
}
