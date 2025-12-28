/**
 * REGOS API Integratsiya Service
 * 
 * Bu service REGOS API dan savdo ma'lumotlarini olib,
 * sizning MongoDB bazangizga sinxronlashtiradi
 */

import fetch from 'node-fetch';
import fs from 'fs/promises';
import path from 'path';

// ==================== KONFIGURATSIYA ====================

const REGOS_API_URL = process.env.REGOS_API_URL || 'https://api.regos.uz/v1';
const REGOS_API_KEY = process.env.REGOS_API_KEY;
const REGOS_COMPANY_ID = process.env.REGOS_COMPANY_ID;

// ==================== REGOS API FUNKSIYALARI ====================

/**
 * REGOS API dan kunlik savdo ma'lumotlarini olish
 * @param {string} date - Sana (YYYY-MM-DD)
 * @returns {Promise<Object>} Savdo ma'lumotlari
 */
export async function getDailySalesFromRegos(date) {
  try {
    const dateFrom = `${date} 00:00:00`;
    const dateTo = `${date} 23:59:59`;
    
    console.log(`📡 REGOS API: Savdo ma'lumotlari so'ralmoqda (${date})`);
    
    const response = await fetch(`${REGOS_API_URL}/Sale/Get`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${REGOS_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        date_from: dateFrom,
        date_to: dateTo,
        company_id: REGOS_COMPANY_ID,
        group_by_department: true // Filial bo'yicha guruhlash
      })
    });
    
    if (!response.ok) {
      throw new Error(`REGOS API xatosi: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    console.log(`✅ REGOS API: ${data.result?.length || 0} ta yozuv olindi`);
    
    return data;
    
  } catch (error) {
    console.error('❌ REGOS API xatosi:', error.message);
    throw error;
  }
}

/**
 * REGOS dan filiallar ro'yxatini olish
 * @returns {Promise<Array>} Filiallar ro'yxati
 */
export async function getDepartmentsFromRegos() {
  try {
    console.log('📡 REGOS API: Filiallar ro'yxati so'ralmoqda');
    
    const response = await fetch(`${REGOS_API_URL}/Department/List`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${REGOS_API_KEY}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      throw new Error(`REGOS API xatosi: ${response.status}`);
    }
    
    const data = await response.json();
    console.log(`✅ REGOS API: ${data.result?.length || 0} ta filial topildi`);
    
    return data.result || [];
    
  } catch (error) {
    console.error('❌ REGOS API xatosi:', error.message);
    throw error;
  }
}

/**
 * REGOS dan filial bo'yicha savdoni olish
 * @param {number} departmentId - Filial ID
 * @param {string} dateFrom - Boshlanish sanasi
 * @param {string} dateTo - Tugash sanasi
 * @returns {Promise<Object>} Savdo ma'lumotlari
 */
export async function getSalesByDepartment(departmentId, dateFrom, dateTo) {
  try {
    console.log(`📡 REGOS API: Filial #${departmentId} savdosi so'ralmoqda`);
    
    const response = await fetch(`${REGOS_API_URL}/Sale/GetByDepartment`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${REGOS_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        department_id: departmentId,
        date_from: dateFrom,
        date_to: dateTo
      })
    });
    
    if (!response.ok) {
      throw new Error(`REGOS API xatosi: ${response.status}`);
    }
    
    const data = await response.json();
    return data;
    
  } catch (error) {
    console.error('❌ REGOS API xatosi:', error.message);
    throw error;
  }
}

// ==================== MA'LUMOTLARNI QAYTA ISHLASH ====================

/**
 * REGOS ma'lumotlarini sizning tizimingiz formatiga o'tkazish
 * @param {Object} regosData - REGOS dan kelgan ma'lumot
 * @returns {Object} Qayta ishlangan ma'lumot
 */
export function processRegosSalesData(regosData) {
  if (!regosData || !regosData.result) {
    return {
      totalSales: 0,
      retailSales: 0,
      wholesaleSales: 0,
      salesByDepartment: {}
    };
  }
  
  const salesByDepartment = {};
  let totalRetail = 0;
  let totalWholesale = 0;
  
  // Har bir savdoni qayta ishlash
  regosData.result.forEach(sale => {
    const deptId = sale.department_id;
    const amount = sale.total_amount || 0;
    const saleType = sale.sale_type || 'retail';
    
    // Filial bo'yicha guruhlash
    if (!salesByDepartment[deptId]) {
      salesByDepartment[deptId] = {
        departmentId: deptId,
        departmentName: sale.department_name,
        retailSales: 0,
        wholesaleSales: 0,
        totalSales: 0
      };
    }
    
    // Savdo turini aniqlash
    if (saleType === 'wholesale' || saleType === 'optom') {
      salesByDepartment[deptId].wholesaleSales += amount;
      totalWholesale += amount;
    } else {
      salesByDepartment[deptId].retailSales += amount;
      totalRetail += amount;
    }
    
    salesByDepartment[deptId].totalSales += amount;
  });
  
  return {
    totalSales: totalRetail + totalWholesale,
    retailSales: totalRetail,
    wholesaleSales: totalWholesale,
    salesByDepartment: Object.values(salesByDepartment)
  };
}

// ==================== MONGODB GA SINXRONIZATSIYA ====================

/**
 * REGOS ma'lumotlarini MongoDB ga yozish
 * @param {Object} Branch - Mongoose Branch model
 * @param {Object} processedData - Qayta ishlangan ma'lumot
 * @param {string} date - Sana
 */
export async function syncToMongoDB(Branch, processedData, date) {
  try {
    console.log('💾 MongoDB ga sinxronizatsiya boshlanmoqda...');
    
    // Har bir filial uchun
    for (const deptData of processedData.salesByDepartment) {
      // Filial nomiga qarab MongoDB'dan topish
      const branch = await Branch.findOne({ 
        name: { $regex: deptData.departmentName, $options: 'i' }
      });
      
      if (branch) {
        // Mavjud savdoga qo'shish (yig'indi)
        await Branch.findByIdAndUpdate(branch._id, {
          $inc: {
            totalSales: deptData.totalSales,
            retailSales: deptData.retailSales,
            wholesaleSales: deptData.wholesaleSales
          }
        });
        
        console.log(`  ✅ ${branch.name}: +${deptData.totalSales.toLocaleString()} so'm`);
      } else {
        console.log(`  ⚠️  Filial topilmadi: ${deptData.departmentName}`);
      }
    }
    
    console.log('✅ Sinxronizatsiya muvaffaqiyatli yakunlandi');
    
    return {
      success: true,
      date: date,
      totalSales: processedData.totalSales,
      branchesUpdated: processedData.salesByDepartment.length
    };
    
  } catch (error) {
    console.error('❌ MongoDB sinxronizatsiya xatosi:', error.message);
    throw error;
  }
}

// ==================== JSON FAYLDAN O'QISH ====================

/**
 * Python script tomonidan yaratilgan JSON faylni o'qish
 * @param {string} date - Sana (YYYY-MM-DD)
 * @returns {Promise<Object>} JSON ma'lumoti
 */
export async function readSalesJsonFile(date) {
  try {
    const filename = `sales_${date}.json`;
    const filepath = path.join('/opt/reports', filename);
    
    console.log(`📄 JSON fayl o'qilmoqda: ${filepath}`);
    
    const fileContent = await fs.readFile(filepath, 'utf-8');
    const data = JSON.parse(fileContent);
    
    console.log(`✅ JSON fayl o'qildi`);
    return data;
    
  } catch (error) {
    if (error.code === 'ENOENT') {
      console.log(`⚠️  Fayl topilmadi: ${date}`);
      return null;
    }
    throw error;
  }
}

// ==================== EXPORT ====================

export const regosService = {
  getDailySales: getDailySalesFromRegos,
  getDepartments: getDepartmentsFromRegos,
  getSalesByDepartment: getSalesByDepartment,
  processData: processRegosSalesData,
  syncToMongoDB: syncToMongoDB,
  readJsonFile: readSalesJsonFile
};
