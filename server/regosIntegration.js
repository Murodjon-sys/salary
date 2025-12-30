// REGOS API Integration Service
// Bu service REGOS API dan savdo malumotlarini olib, MongoDB ga yozadi

import fetch from 'node-fetch';

const REGOS_API_URL = process.env.REGOS_API_URL || 'https://api.regos.uz/v1';
const REGOS_API_KEY = process.env.REGOS_API_KEY;

export async function getDailySalesFromRegos(date) {
  try {
    const dateFrom = `${date} 00:00:00`;
    const dateTo = `${date} 23:59:59`;
    const response = await fetch(`${REGOS_API_URL}/Sale/Get`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${REGOS_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        date_from: dateFrom,
        date_to: dateTo,
        stock_id: 1
      })
    });
    
    if (!response.ok) {
      throw new Error(`REGOS API xatosi: ${response.status}`);
    }
    
    const data = await response.json();
    return data;
    
  } catch (error) {
    throw error;
  }
}

export async function getDepartmentsFromRegos() {
  try {
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
    return data.result || [];
    
  } catch (error) {
    throw error;
  }
}

export async function getSalesByDepartment(departmentId, dateFrom, dateTo) {
  try {
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
    throw error;
  }
}

export function processRegosSalesData(regosData) {
  if (!regosData || !regosData.result) {
    return {
      totalSales: 0,
      retailSales: 0,
      wholesaleSales: 0,
      salesByDepartment: []
    };
  }
  
  const salesByDepartment = {};
  let totalRetail = 0;
  let totalWholesale = 0;
  
  regosData.result.forEach(sale => {
    const deptId = sale.department_id;
    const amount = sale.total_amount || 0;
    const saleType = sale.sale_type || 'retail';
    
    if (!salesByDepartment[deptId]) {
      salesByDepartment[deptId] = {
        departmentId: deptId,
        departmentName: sale.department_name,
        retailSales: 0,
        wholesaleSales: 0,
        totalSales: 0
      };
    }
    
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

export async function syncToMongoDB(Branch, processedData, date) {
  try {
    for (const deptData of processedData.salesByDepartment) {
      const branch = await Branch.findOne({ 
        name: { $regex: deptData.departmentName, $options: 'i' }
      });
      
      if (branch) {
        await Branch.findByIdAndUpdate(branch._id, {
          $inc: {
            totalSales: deptData.totalSales,
            retailSales: deptData.retailSales,
            wholesaleSales: deptData.wholesaleSales
          }
        });
      }
    }
    return {
      success: true,
      date: date,
      totalSales: processedData.totalSales,
      branchesUpdated: processedData.salesByDepartment.length
    };
    
  } catch (error) {
    throw error;
  }
}

export const regosService = {
  getDailySales: getDailySalesFromRegos,
  getDepartments: getDepartmentsFromRegos,
  getSalesByDepartment: getSalesByDepartment,
  processData: processRegosSalesData,
  syncToMongoDB: syncToMongoDB
};
