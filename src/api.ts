const API_URL = '/api';

export type Employee = {
  id: string;
  name: string;
  position: string; // Har qanday lavozim (dinamik)
  percentage: number;
  dailyTasks?: Record<string, boolean>; // Dynamic object: { taskId: boolean }
  dailySales?: number; // Kunlik chakana savdo
  wholesaleSales?: number; // Kunlik optom savdo
  lastSalesDate?: string; // Oxirgi savdo kiritilgan sana (YYYY-MM-DD)
  fixedBonus?: number; // Standart oylik (bonus)
  personalBonus?: number; // Shaxsiy bonus (individual bonus)
  teamVolumeBonus?: number; // Jamoaviy abyom bonusi (team volume bonus)
};

export type Branch = {
  _id: string;
  name: string;
  totalSales: number;
  retailSales?: number; // Chakana savdo
  wholesaleSales?: number; // Optom savdo
  penaltyFund?: number; // Jarimalar jamg'armasi
  employees: Employee[];
};

export const api = {
  // Login
  async login(login: string, password: string) {
    const response = await fetch(`${API_URL}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ login, password })
    });
    return response.json();
  },

  // Barcha filiallarni olish
  async getBranches(): Promise<Branch[]> {
    const response = await fetch(`${API_URL}/branches`);
    return response.json();
  },

  // Filial savdosini yangilash
  async updateBranchSales(branchId: string, totalSales: number, retailSales?: number, wholesaleSales?: number) {
    const body: any = { totalSales };
    if (retailSales !== undefined) body.retailSales = retailSales;
    if (wholesaleSales !== undefined) body.wholesaleSales = wholesaleSales;
    
    const response = await fetch(`${API_URL}/branches/${branchId}/sales`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
    return response.json();
  },

  // Xodim qo'shish
  async addEmployee(branchId: string, employee: Omit<Employee, 'id'>) {
    const response = await fetch(`${API_URL}/employees`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...employee, branchId })
    });
    return response.json();
  },

  // Xodimni yangilash
  async updateEmployee(employeeId: string, employee: Omit<Employee, 'id'>) {
    const response = await fetch(`${API_URL}/employees/${employeeId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(employee)
    });
    return response.json();
  },

  // Xodimni o'chirish
  async deleteEmployee(employeeId: string) {
    const response = await fetch(`${API_URL}/employees/${employeeId}`, {
      method: 'DELETE'
    });
    return response.json();
  },

  // Xodim vazifalarini yangilash
  async updateEmployeeTasks(employeeId: string, dailyTasks: Employee['dailyTasks']) {
    const response = await fetch(`${API_URL}/employees/${employeeId}/tasks`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ dailyTasks })
    });
    return response.json();
  },

  // Boshlang'ich ma'lumotlarni yaratish
  async initData() {
    const response = await fetch(`${API_URL}/init`, {
      method: 'POST'
    });
    return response.json();
  },

  // Sotuvchilarning vazifalarini tuzatish
  async fixEmployeeTasks() {
    const response = await fetch(`${API_URL}/employees/fix-tasks`, {
      method: 'POST'
    });
    return response.json();
  },

  // Kunlik savdoni tarixga saqlash
  async saveDailyHistory(branchId: string, date?: string) {
    const response = await fetch(`${API_URL}/history/save-daily`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ branchId, date })
    });
    return response.json();
  },

  // Tarixni olish
  async getHistory(branchId: string, startDate?: string, endDate?: string, limit?: number) {
    let url = `${API_URL}/history/${branchId}?`;
    if (startDate) url += `startDate=${startDate}&`;
    if (endDate) url += `endDate=${endDate}&`;
    if (limit) url += `limit=${limit}`;
    
    const response = await fetch(url);
    return response.json();
  },

  // Tarixni o'chirish
  async deleteHistory(historyId: string) {
    const response = await fetch(`${API_URL}/history/${historyId}`, {
      method: 'DELETE'
    });
    return response.json();
  },

  // ============ VAZIFA SHABLONLARI ============
  
  // Barcha vazifa shablonlarini olish
  async getTaskTemplates(position?: string) {
    let url = `${API_URL}/task-templates`;
    if (position) url += `?position=${position}`;
    
    const response = await fetch(url);
    return response.json();
  },

  // Yangi vazifa shabloni qo'shish
  async addTaskTemplate(position: string, taskName: string, description?: string) {
    const response = await fetch(`${API_URL}/task-templates`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ position, taskName, description })
    });
    return response.json();
  },

  // Vazifa shablonini tahrirlash
  async updateTaskTemplate(templateId: string, taskName: string, description?: string) {
    const response = await fetch(`${API_URL}/task-templates/${templateId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ taskName, description })
    });
    return response.json();
  },

  // Vazifa shablonini o'chirish
  async deleteTaskTemplate(templateId: string) {
    const response = await fetch(`${API_URL}/task-templates/${templateId}`, {
      method: 'DELETE'
    });
    return response.json();
  },

  // Migration: Eski ma'lumotlarni yangilash
  async migrateSales() {
    const response = await fetch(`${API_URL}/migrate-sales`, {
      method: 'POST'
    });
    return response.json();
  },

  // ============ LAVOZIMLAR API ============
  
  // Barcha lavozimlarni olish
  async getPositions() {
    const response = await fetch(`${API_URL}/positions`);
    return response.json();
  },

  // Yangi lavozim qo'shish
  async addPosition(id: string, name: string, color: string) {
    const response = await fetch(`${API_URL}/positions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, name, color })
    });
    return response.json();
  },

  // Lavozimni o'chirish
  async deletePosition(id: string) {
    const response = await fetch(`${API_URL}/positions/${id}`, {
      method: 'DELETE'
    });
    return response.json();
  },

  // Sotuvchi bo'lmagan xodimlarning vazifalarini o'chirish
  async fixNonSellerTasks(branchId: string) {
    const response = await fetch(`${API_URL}/employees/fix-non-seller-tasks`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ branchId })
    });
    return response.json();
  },

  // Migration: Eski tarixlarga fixedBonus qo'shish
  async migrateHistoryFixedBonus() {
    const response = await fetch(`${API_URL}/migrate-history-fixedbonus`, {
      method: 'POST'
    });
    return response.json();
  },

  // ============ REGOS INTEGRATSIYA ============
  
  // REGOS dan kunlik savdoni sinxronizatsiya qilish
  async syncDailySalesFromRegos(date?: string) {
    const response = await fetch(`${API_URL}/regos/sync-daily-sales`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ date })
    });
    return response.json();
  },

  // JSON fayldan sinxronizatsiya (Python script yaratgan)
  async syncFromJsonFile(date?: string) {
    const response = await fetch(`${API_URL}/regos/sync-from-json`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ date })
    });
    return response.json();
  },

  // REGOS filiallarini mapping qilish
  async getRegosDepartmentsMapping() {
    const response = await fetch(`${API_URL}/regos/departments-mapping`);
    return response.json();
  }
};
