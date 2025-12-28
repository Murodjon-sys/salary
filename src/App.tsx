import { useState, useEffect } from "react";
import { api, type Branch, type Employee } from "./api";

// Standart lavozimlar
const defaultPositions = [
  { id: "ishchi", name: "Ishchi", color: "bg-gray-100 text-gray-800 border-2 border-gray-300" },
  { id: "manager", name: "Manager", color: "bg-gray-900 text-white shadow-md" },
  { id: "kassir", name: "Kassir", color: "bg-white text-gray-900 border-2 border-gray-900" },
  { id: "shofir", name: "Shofir", color: "bg-gradient-to-r from-[#F87819] to-[#ff8c3a] text-white shadow-md" },
  { id: "sotuvchi", name: "Sotuvchi", color: "bg-white text-[#F87819] border-2 border-[#F87819]" },
  { id: "taminotchi", name: "Ta'minotchi", color: "bg-gray-700 text-white shadow-md" },
];

// Eski positionColors (backward compatibility uchun)
const positionColors: Record<string, string> = {};
defaultPositions.forEach(pos => {
  positionColors[pos.id] = pos.color;
});

export default function App() {
  const [branches, setBranches] = useState<Branch[]>([]);
  const [activeBranch, setActiveBranch] = useState(0);
  const [activeView, setActiveView] = useState<"branches" | "history" | "penalties" | "tasks" | "reports">("branches");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [userRole, setUserRole] = useState<'admin' | 'manager' | 'gijduvon_manager'>('admin');
  const [allowedBranchId, setAllowedBranchId] = useState<string | null>(null); // Manager uchun ruxsat berilgan filial
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showSuccessNotification, setShowSuccessNotification] = useState(false);
  const [loginInput, setLoginInput] = useState("");
  const [passwordInput, setPasswordInput] = useState("");
  const [loginError, setLoginError] = useState("");
  const [showAddEmployee, setShowAddEmployee] = useState(false);
  const [showEditEmployee, setShowEditEmployee] = useState(false);
  const [showTasksModal, setShowTasksModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showSalesModal, setShowSalesModal] = useState(false);
  const [showBonusModal, setShowBonusModal] = useState(false);
  const [bonusInput, setBonusInput] = useState("");
  const [showAddTaskModal, setShowAddTaskModal] = useState(false);
  const [showEditTaskModal, setShowEditTaskModal] = useState(false);
  const [showDeleteTaskConfirm, setShowDeleteTaskConfirm] = useState(false);
  
  // Lavozimlar uchun state
  const [positions, setPositions] = useState<Array<{id: string, name: string, color: string}>>(defaultPositions);
  const [showAddPosition, setShowAddPosition] = useState(false);
  const [newPositionName, setNewPositionName] = useState("");
  const [newPositionColor, setNewPositionColor] = useState("bg-blue-500 text-white shadow-md");
  
  // Hisobotlar uchun state
  const [selectedMonth, setSelectedMonth] = useState<string>(new Date().toISOString().slice(0, 7)); // YYYY-MM
  const [monthlyReports, setMonthlyReports] = useState<any[]>([]);

  const [taskTemplates, setTaskTemplates] = useState<any[]>([]);
  const [selectedPosition, setSelectedPosition] = useState<string>("sotuvchi");
  const [newTaskName, setNewTaskName] = useState("");
  const [editingTask, setEditingTask] = useState<any>(null);
  const [taskToDelete, setTaskToDelete] = useState<any>(null);
  const [employeeToDelete, setEmployeeToDelete] = useState<string | null>(null);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [selectedHistoryRecord, setSelectedHistoryRecord] = useState<any | null>(null);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [showSaveSuccessModal, setShowSaveSuccessModal] = useState(false);
  const [showSaveConfirmModal, setShowSaveConfirmModal] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showSaveErrorModal, setShowSaveErrorModal] = useState(false);
  const [showDeleteHistoryConfirm, setShowDeleteHistoryConfirm] = useState(false);
  const [historyToDelete, setHistoryToDelete] = useState<any | null>(null);
  const [savedDate, setSavedDate] = useState<string>("");
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [showFixTasksModal, setShowFixTasksModal] = useState(false);
  const [showFixTasksSuccessModal, setShowFixTasksSuccessModal] = useState(false);
  const [showNoIssuesModal, setShowNoIssuesModal] = useState(false);
  const [fixedTasksCount, setFixedTasksCount] = useState(0);
  const [newEmployee, setNewEmployee] = useState<Omit<Employee, "id">>({
    name: "",
    position: "ishchi" as any,
    percentage: 0,
  });
  const [salesInput, setSalesInput] = useState("");
  const [percentageInput, setPercentageInput] = useState("");
  const [editPercentageInput, setEditPercentageInput] = useState("");
  const [dailySalesInput, setDailySalesInput] = useState("");
  const [wholesaleSalesInput, setWholesaleSalesInput] = useState("");
  const [loading, setLoading] = useState(true);

  // Lavozimlarni serverdan yuklash
  useEffect(() => {
    loadPositions();
  }, []);

  const loadPositions = async () => {
    try {
      const result = await api.getPositions();
      if (result.ok) {
        setPositions(result.positions);
        // positionColors'ni yangilaymiz
        result.positions.forEach((pos: any) => {
          positionColors[pos.id] = pos.color;
        });
      }
    } catch (error) {
      console.error('Lavozimlarni yuklashda xato:', error);
      // Xato bo'lsa, standart lavozimlarni ishlatamiz
      setPositions(defaultPositions);
    }
  };

  // Lavozim qo'shish
  const addPosition = async () => {
    if (!newPositionName.trim()) return;
    
    const newPositionId = newPositionName.toLowerCase().replace(/\s+/g, '_');
    
    try {
      const result = await api.addPosition(newPositionId, newPositionName, newPositionColor);
      
      if (result.ok) {
        // Lavozimlarni qayta yuklaymiz
        await loadPositions();
        
        // Reset
        setNewPositionName("");
        setNewPositionColor("bg-blue-500 text-white shadow-md");
        setShowAddPosition(false);
      } else {
        alert(result.error || 'Lavozim qo\'shishda xato yuz berdi');
      }
    } catch (error) {
      console.error('Lavozim qo\'shishda xato:', error);
      alert('Lavozim qo\'shishda xato yuz berdi');
    }
  };

  // Ma'lumotlarni yuklash
  useEffect(() => {
    loadBranches();
    // Bir martalik: eski savdo ma'lumotlarini yangilash
    migrateSales();
  }, []);

  // Hisobotlar sahifasiga o'tganda ma'lumotlarni yuklash
  useEffect(() => {
    if (activeView === "reports" && currentBranch) {
      loadMonthlyReports(currentBranch._id, selectedMonth);
    }
  }, [activeView]);

  // Oy o'zgarganda ma'lumotlarni yuklash
  useEffect(() => {
    if (activeView === "reports" && currentBranch) {
      loadMonthlyReports(currentBranch._id, selectedMonth);
    }
  }, [selectedMonth]);

  const migrateSales = async () => {
    try {
      const result = await api.migrateSales();
      if (result.ok && result.updated > 0) {
        // Ma'lumotlarni qayta yuklaymiz
        await loadBranches(false);
      }
    } catch (error) {
      console.error('Migration xato:', error);
    }
  };

  const handleLogin = async () => {
    try {
      setLoginError("");
      const result = await api.login(loginInput, passwordInput);
      
      if (result.ok) {
        setIsAuthenticated(true);
        setUserRole(result.role || 'admin'); // Role'ni saqlaymiz
        
        // Agar gijduvon_manager bo'lsa, branchId'ni saqlaymiz va "Hisobotlar" sahifasiga o'tamiz
        if (result.role === 'gijduvon_manager' && result.branchId) {
          setAllowedBranchId(result.branchId);
          localStorage.setItem('allowedBranchId', result.branchId);
          setActiveView('reports'); // Avtomatik "Hisobotlar" sahifasiga o'tish
        }
        
        setShowLoginModal(false);
        setLoginInput("");
        setPasswordInput("");
        // localStorage ga saqlaymiz
        localStorage.setItem('isAuthenticated', 'true');
        localStorage.setItem('userRole', result.role || 'admin');
        // Success notification ko'rsatamiz
        setShowSuccessNotification(true);
        setTimeout(() => {
          setShowSuccessNotification(false);
        }, 4000); // 4 soniyadan keyin yo'qoladi
      } else {
        setLoginError(result.error || "Login yoki parol noto'g'ri");
      }
    } catch (error) {
      setLoginError("Xatolik yuz berdi");
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setUserRole('admin');
    setAllowedBranchId(null);
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('userRole');
    localStorage.removeItem('allowedBranchId');
  };

  const toggleDarkMode = () => {
    const newMode = !isDarkMode;
    setIsDarkMode(newMode);
    localStorage.setItem('isDarkMode', newMode.toString());
  };

  // Sahifa yuklanganda localStorage dan tekshirish
  useEffect(() => {
    const auth = localStorage.getItem('isAuthenticated');
    const role = localStorage.getItem('userRole');
    const branchId = localStorage.getItem('allowedBranchId');
    const darkMode = localStorage.getItem('isDarkMode');
    if (auth === 'true') {
      setIsAuthenticated(true);
      setUserRole((role as 'admin' | 'manager' | 'gijduvon_manager') || 'admin');
      if (branchId) {
        setAllowedBranchId(branchId);
      }
      // Agar G'ijduvon manager bo'lsa, avtomatik "Hisobotlar" sahifasiga o'tamiz
      if (role === 'gijduvon_manager') {
        setActiveView('reports');
      }
    }
    if (darkMode === 'true') {
      setIsDarkMode(true);
    }
  }, []);

  const loadHistory = async () => {
    try {
      // Barcha filiallarning tarixini yuklaymiz
      const allHistory: any[] = [];
      
      for (const branch of branches) {
        const result = await api.getHistory(branch._id, undefined, undefined, 30);
        if (result.ok && result.history.length > 0) {
          allHistory.push(...result.history);
        }
      }
      
      // Sanaga ko'ra tartiblash (eng yangi birinchi)
      allHistory.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      setHistory(allHistory);
    } catch (error) {
      console.error('Tarixni yuklashda xato:', error);
    }
  };

  // Oylik hisobotlarni yuklash
  const loadMonthlyReports = async (branchId: string, month: string) => {
    try {
      // month format: YYYY-MM
      const [year, monthNum] = month.split('-');
      const startDate = `${year}-${monthNum}-01`;
      const lastDay = new Date(parseInt(year), parseInt(monthNum), 0).getDate();
      const endDate = `${year}-${monthNum}-${lastDay}`;
      
      const result = await api.getHistory(branchId, startDate, endDate, 100);
      if (result.ok) {
        setMonthlyReports(result.history);
      } else {
        setMonthlyReports([]);
      }
    } catch (error) {
      console.error('Oylik hisobotlarni yuklashda xato:', error);
      setMonthlyReports([]);
    }
  };

  const loadTaskTemplates = async (position?: string) => {
    try {
      const result = await api.getTaskTemplates(position);
      if (result.ok) {
        setTaskTemplates(result.templates);
      }
    } catch (error) {
      console.error('Vazifa shablonlarini yuklashda xato:', error);
    }
  };

  const loadBranches = async (showLoader = true) => {
    try {
      if (showLoader) setLoading(true);
      const data = await api.getBranches();
      
      // Task templates ni yuklaymiz (oylik hisoblash uchun kerak)
      await loadTaskTemplates();
      
      // Asosiy Skladni avtomatik yangilash
      const mainBranch = data.find(b => b.name === "Asosiy Sklad");
      if (mainBranch) {
        // Faqat filiallarning savdosini yig'amiz
        const filials = data.filter(b => b.name !== "Asosiy Sklad");
        const totalRetailSales = filials.reduce((sum, branch) => sum + (branch.retailSales || 0), 0);
        const totalWholesaleSales = filials.reduce((sum, branch) => sum + (branch.wholesaleSales || 0), 0);
        const totalSales = totalRetailSales + totalWholesaleSales;
        
        // Agar Asosiy Skladning qiymati noto'g'ri bo'lsa, tuzatamiz
        if (mainBranch.totalSales !== totalSales || 
            mainBranch.retailSales !== totalRetailSales || 
            mainBranch.wholesaleSales !== totalWholesaleSales) {
          await api.updateBranchSales(mainBranch._id, totalSales, totalRetailSales, totalWholesaleSales);
          // Qayta yuklaymiz
          const updatedData = await api.getBranches();
          setBranches(updatedData);
        } else {
          setBranches(data);
        }
      } else {
        setBranches(data);
      }
    } catch (error) {
      console.error("Ma'lumotlarni yuklashda xato:", error);
      // Agar server javob bermasa, bo'sh array qo'yamiz
      setBranches([]);
    } finally {
      if (showLoader) setLoading(false);
    }
  };

  // G'ijduvon manager uchun faqat ruxsat berilgan filiallarni ko'rsatish
  const filteredBranches = userRole === 'gijduvon_manager' && allowedBranchId
    ? branches.filter(b => b._id === allowedBranchId)
    : branches;

  const currentBranch = filteredBranches[activeBranch];

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat("en-US").format(num);
  };

  const addEmployee = async () => {
    if (!newEmployee.name || newEmployee.percentage <= 0) return;
    try {
      // BARCHA LAVOZIMLAR uchun vazifalarni task templates dan yaratamiz
      let employeeData = { ...newEmployee };
      
      // Xodimning lavozimiga mos task template'larni topamiz
      const positionTemplates = taskTemplates.filter(t => t.position === newEmployee.position);
      
      if (positionTemplates.length > 0) {
        const dailyTasks: any = {};
        
        // Har bir template uchun false qilib qo'yamiz
        for (const template of positionTemplates) {
          dailyTasks[template._id] = false;
        }
        
        employeeData.dailyTasks = dailyTasks;
      }
      
      // Modal'ni darhol yopamiz
      setShowAddEmployee(false);
      setNewEmployee({ name: "", position: "ishchi", percentage: 0 });
      setPercentageInput("");
      
      // Serverga qo'shamiz va javobni kutamiz
      const result = await api.addEmployee(currentBranch._id, employeeData);
      
      // Yangi xodimni lokal state'ga qo'shamiz
      if (result.id) {
        setBranches(prevBranches => 
          prevBranches.map(branch => 
            branch._id === currentBranch._id
              ? { ...branch, employees: [...branch.employees, result] }
              : branch
          )
        );
      }
    } catch (error) {
      console.error("Xodim qo'shishda xato:", error);
      // Xato bo'lsa, qayta yuklaymiz
      await loadBranches(false);
    }
  };

  const openEditEmployee = (employee: Employee) => {
    setEditingEmployee(employee);
    setEditPercentageInput(employee.percentage.toString());
    setShowEditEmployee(true);
  };

  const openTasksModal = async (employee: Employee) => {
    setSelectedEmployee(employee);
    // Xodimning lavozimiga mos task template'larni yuklaymiz
    await loadTaskTemplates(employee.position);
    setShowTasksModal(true);
  };

  const openSalesModal = (employee: Employee) => {
    setSelectedEmployee(employee);
    setDailySalesInput(employee.dailySales?.toString() || "");
    setWholesaleSalesInput(employee.wholesaleSales?.toString() || "");
    setBonusInput(employee.fixedBonus && employee.fixedBonus > 0 ? employee.fixedBonus.toString() : "");
    setShowSalesModal(true);
  };

  const openBonusModal = (employee: Employee) => {
    setSelectedEmployee(employee);
    setBonusInput(employee.fixedBonus && employee.fixedBonus > 0 ? employee.fixedBonus.toString() : "");
    setShowBonusModal(true);
  };

  const updateBonus = async () => {
    if (!selectedEmployee) return;
    
    // Modal'ni darhol yopamiz (UX uchun)
    setShowBonusModal(false);
    const bonusValue = bonusInput;
    const employeeId = selectedEmployee.id;
    setBonusInput("");
    setSelectedEmployee(null);
    
    try {
      const fixedBonus = parseFloat(bonusValue.replace(/,/g, "")) || 0;
      
      // Lokal state'ni darhol yangilaymiz (optimistik yangilanish)
      setBranches(prevBranches => 
        prevBranches.map(branch => ({
          ...branch,
          employees: branch.employees.map(emp => 
            emp.id === employeeId 
              ? { ...emp, fixedBonus: fixedBonus }
              : emp
          )
        }))
      );
      
      // Background'da serverga saqlaymiz
      await api.updateEmployee(employeeId, {
        name: selectedEmployee.name,
        position: selectedEmployee.position,
        percentage: selectedEmployee.percentage,
        fixedBonus: fixedBonus
      });
    } catch (error) {
      console.error("Bonusni yangilashda xato:", error);
      alert('❌ Bonusni saqlashda xato yuz berdi');
      // Xato bo'lsa, qayta yuklaymiz
      await loadBranches(false);
    }
  };

  const updateDailySales = async () => {
    if (!selectedEmployee) return;
    
    // Modal'ni darhol yopamiz (UX uchun)
    setShowSalesModal(false);
    const employeeId = selectedEmployee.id;
    const employeeName = selectedEmployee.name;
    const employeePosition = selectedEmployee.position;
    const employeePercentage = selectedEmployee.percentage;
    setSelectedEmployee(null);
    const retailValue = dailySalesInput;
    const wholesaleValue = wholesaleSalesInput;
    const bonusValue = bonusInput;
    setDailySalesInput("");
    setWholesaleSalesInput("");
    setBonusInput("");
    
    try {
      const retailSales = parseFloat(retailValue.replace(/,/g, "")) || 0;
      const wholesaleSales = parseFloat(wholesaleValue.replace(/,/g, "")) || 0;
      const fixedBonus = parseFloat(bonusValue.replace(/,/g, "")) || 0;
      
      // Lokal state'ni darhol yangilaymiz
      setBranches(prevBranches => 
        prevBranches.map(branch => ({
          ...branch,
          employees: branch.employees.map(emp => 
            emp.id === employeeId 
              ? { ...emp, dailySales: retailSales, wholesaleSales: wholesaleSales, fixedBonus: fixedBonus }
              : emp
          )
        }))
      );
      
      // Background'da serverga saqlaymiz
      await api.updateEmployee(employeeId, {
        name: employeeName,
        position: employeePosition,
        percentage: employeePercentage,
        dailySales: retailSales,
        wholesaleSales: wholesaleSales,
        fixedBonus: fixedBonus
      });
      
      // Umumiy savdoni avtomatik yangilash (background'da)
      updateTotalSales();
    } catch (error) {
      console.error("Savdoni yangilashda xato:", error);
      alert('❌ Savdoni saqlashda xato yuz berdi');
      // Xato bo'lsa, qayta yuklaymiz
      await loadBranches(false);
    }
  };

  const updateTotalSales = async () => {
    // Ma'lumotlarni qayta yuklab, yangilangan sotuvchilar savdosini hisoblaymiz
    const data = await api.getBranches();
    const currentBranchData = data[activeBranch];
    
    // Barcha sotuvchilar savdosini yig'ish (chakana va optom alohida)
    const retailSales = currentBranchData.employees
      .filter(emp => emp.position === 'sotuvchi')
      .reduce((sum, emp) => sum + (emp.dailySales || 0), 0);
    
    const wholesaleSales = currentBranchData.employees
      .filter(emp => emp.position === 'sotuvchi')
      .reduce((sum, emp) => sum + (emp.wholesaleSales || 0), 0);
    
    const totalSales = retailSales + wholesaleSales;
    
    // Serverga saqlash (chakana va optom alohida)
    await api.updateBranchSales(currentBranchData._id, totalSales, retailSales, wholesaleSales);
    
    // Agar bu filial bo'lsa (Asosiy Sklad emas), Asosiy Skladni ham yangilaymiz
    if (currentBranchData.name !== "Asosiy Sklad") {
      // Yangilangan ma'lumotlarni qayta olamiz
      const updatedData = await api.getBranches();
      await updateMainBranchSales(updatedData);
    }
    
    // Lokal holatni yangilash
    await loadBranches(false);
  };

  const updateMainBranchSales = async (allBranches: Branch[]) => {
    // Asosiy Skladni topamiz
    const mainBranch = allBranches.find(b => b.name === "Asosiy Sklad");
    if (!mainBranch) return;
    
    // Faqat filiallarning savdosini yig'amiz (Asosiy Skladni o'zi emas)
    const filials = allBranches.filter(b => b.name !== "Asosiy Sklad");
    
    const totalRetailSales = filials.reduce((sum, branch) => sum + (branch.retailSales || 0), 0);
    const totalWholesaleSales = filials.reduce((sum, branch) => sum + (branch.wholesaleSales || 0), 0);
    const totalSales = totalRetailSales + totalWholesaleSales;
    
    // Asosiy Sklad savdosini yangilaymiz (chakana va optom alohida)
    await api.updateBranchSales(mainBranch._id, totalSales, totalRetailSales, totalWholesaleSales);
  };

  const updateTasks = async (tasks: Employee['dailyTasks']) => {
    if (!selectedEmployee || !tasks) return;
    
    const employeeId = selectedEmployee.id;
    const updatedTasks = { ...tasks }; // Nusxa olamiz
    
    console.log('🔄 Updating tasks for employee:', employeeId);
    console.log('📋 New tasks:', updatedTasks);
    
    // Modal'ni darhol yopamiz
    setShowTasksModal(false);
    setSelectedEmployee(null);
    setTaskTemplates([]);
    
    try {
      // Lokal state'ni darhol yangilaymiz - MUHIM: yangi obyekt yaratamiz
      setBranches(prevBranches => {
        const newBranches = prevBranches.map(branch => ({
          ...branch,
          employees: branch.employees.map(emp => 
            emp.id === employeeId 
              ? { ...emp, dailyTasks: { ...updatedTasks } }
              : emp
          )
        }));
        console.log('✅ State updated, new branches:', newBranches);
        return newBranches;
      });
      
      // Background'da serverga saqlaymiz
      await api.updateEmployeeTasks(employeeId, updatedTasks);
      console.log('💾 Tasks saved to server');
    } catch (error) {
      console.error("Vazifalarni yangilashda xato:", error);
      // Xato bo'lsa, qayta yuklaymiz
      await loadBranches(false);
    }
  };

  const updateEmployee = async () => {
    if (!editingEmployee || !editingEmployee.name || editingEmployee.percentage <= 0) return;
    
    // Modal'ni darhol yopamiz
    setShowEditEmployee(false);
    const employeeData = { ...editingEmployee };
    setEditingEmployee(null);
    setEditPercentageInput("");
    
    try {
      // Lokal state'ni darhol yangilaymiz
      setBranches(prevBranches => 
        prevBranches.map(branch => ({
          ...branch,
          employees: branch.employees.map(emp => 
            emp.id === employeeData.id 
              ? { ...emp, name: employeeData.name, position: employeeData.position, percentage: employeeData.percentage }
              : emp
          )
        }))
      );
      
      // Background'da serverga saqlaymiz
      await api.updateEmployee(employeeData.id, {
        name: employeeData.name,
        position: employeeData.position,
        percentage: employeeData.percentage
      });
    } catch (error) {
      console.error("Xodimni yangilashda xato:", error);
      // Xato bo'lsa, qayta yuklaymiz
      await loadBranches(false);
    }
  };

  const deleteEmployee = async (employeeId: string) => {
    // Modal'ni darhol yopamiz
    setShowDeleteConfirm(false);
    setEmployeeToDelete(null);
    
    try {
      // Lokal state'dan darhol o'chiramiz
      setBranches(prevBranches => 
        prevBranches.map(branch => ({
          ...branch,
          employees: branch.employees.filter(emp => emp.id !== employeeId)
        }))
      );
      
      // Background'da serverdan o'chiramiz
      await api.deleteEmployee(employeeId);
    } catch (error) {
      console.error("Xodimni o'chirishda xato:", error);
      // Xato bo'lsa, qayta yuklaymiz
      await loadBranches(false);
    }
  };

  const confirmDelete = (employeeId: string) => {
    setEmployeeToDelete(employeeId);
    setShowDeleteConfirm(true);
  };

  const handleSalesChange = (value: string) => {
    const cleaned = value.replace(/[^\d]/g, "");
    if (cleaned === "") {
      setSalesInput("");
      // Lokal holatni yangilaymiz
      const updatedBranches = [...branches];
      updatedBranches[activeBranch].totalSales = 0;
      setBranches(updatedBranches);
      return;
    }
    const numValue = parseFloat(cleaned);
    setSalesInput(formatNumber(numValue));
    // Lokal holatni yangilaymiz
    const updatedBranches = [...branches];
    updatedBranches[activeBranch].totalSales = numValue;
    setBranches(updatedBranches);
  };

  const handleSalesBlur = async () => {
    // Faqat input dan chiqganda serverga saqlaymiz
    if (currentBranch.totalSales !== undefined) {
      try {
        await api.updateBranchSales(currentBranch._id, currentBranch.totalSales);
        
        // Agar bu filial bo'lsa, Asosiy Skladni ham yangilaymiz
        if (currentBranch.name !== "Asosiy Sklad") {
          // Yangilangan ma'lumotlarni olamiz
          const data = await api.getBranches();
          await updateMainBranchSales(data);
          await loadBranches(false);
        }
      } catch (error) {
        console.error("Savdoni saqlashda xato:", error);
      }
    }
  };

  const handlePercentageChange = (value: string) => {
    const cleaned = value.replace(/[^\d.,]/g, "").replace(",", ".");
    setPercentageInput(cleaned);
    const numValue = parseFloat(cleaned) || 0;
    setNewEmployee({ ...newEmployee, percentage: numValue });
  };

  const handleEditPercentageChange = (value: string) => {
    const cleaned = value.replace(/[^\d.,]/g, "").replace(",", ".");
    setEditPercentageInput(cleaned);
    const numValue = parseFloat(cleaned) || 0;
    if (editingEmployee) {
      setEditingEmployee({ ...editingEmployee, percentage: numValue });
    }
  };

  const calculateSalary = (employee: Employee) => {
    let percentage = employee.percentage;
    let calculatedSalary = 0;
    let baseSalary = 0; // Asosiy oylik (vazifalar foizisiz)
    
    // Agar sotuvchi bo'lsa
    if (employee.position === "sotuvchi") {
      // Chakana savdo (to'liq foiz)
      const retailSales = employee.dailySales || 0;
      const retailSalary = (retailSales * percentage) / 100;
      
      // Optom savdo (yarim foiz)
      const wholesaleSales = employee.wholesaleSales || 0;
      const wholesaleSalary = (wholesaleSales * percentage) / 100 / 2;
      
      // Jami asosiy oylik
      baseSalary = retailSalary + wholesaleSalary;
      
      // DEBUG: Sotuvchi uchun hisoblash
      console.log(`🛒 ${currentBranch.name} - ${employee.name} (sotuvchi):`, {
        retailSales,
        wholesaleSales,
        percentage,
        retailSalary,
        wholesaleSalary,
        baseSalary
      });
    } else {
      // Boshqa xodimlar uchun
      
      // MAXSUS: Asosiy Sklad uchun UMUMIY SAVDODAN hisoblash
      if (currentBranch.name === "Asosiy Sklad") {
        // Asosiy Skladda: retailSales va wholesaleSales dan hisoblash
        // Chakana savdo (to'liq foiz)
        const retailSalary = (currentBranch.retailSales || 0) * percentage / 100;
        
        // Optom savdo (yarim foiz)
        const wholesaleSalary = (currentBranch.wholesaleSales || 0) * percentage / 100 / 2;
        
        baseSalary = retailSalary + wholesaleSalary;
        
        // DEBUG
        console.log(`🏢 ${currentBranch.name} - ${employee.name} (${employee.position}):`, {
          retailSales: currentBranch.retailSales,
          wholesaleSales: currentBranch.wholesaleSales,
          percentage,
          retailSalary,
          wholesaleSalary,
          baseSalary
        });
      } else {
        // Oddiy filiallar uchun: FAQAT SHU FILIALDAGI SOTUVCHILARNING SAVDOSIDAN HISOBLASH
        // Filialdagi barcha sotuvchilarning jami savdosini hisoblaymiz
        const filialSotuvchilar = currentBranch.employees.filter(emp => emp.position === 'sotuvchi');
        
        // Jami chakana savdo (barcha sotuvchilardan)
        const totalRetailSales = filialSotuvchilar.reduce((sum, emp) => sum + (emp.dailySales || 0), 0);
        
        // Jami optom savdo (barcha sotuvchilardan)
        const totalWholesaleSales = filialSotuvchilar.reduce((sum, emp) => sum + (emp.wholesaleSales || 0), 0);
        
        // DEBUG: Sotuvchilar ma'lumotlarini ko'rsatish
        console.log(`🏢 ${currentBranch.name} - ${employee.name} (${employee.position}):`, {
          sotuvchilar: filialSotuvchilar.length,
          totalRetailSales,
          totalWholesaleSales,
          percentage: employee.percentage,
          sotuvchilarDetails: filialSotuvchilar.map(s => ({
            name: s.name,
            dailySales: s.dailySales,
            wholesaleSales: s.wholesaleSales
          }))
        });
        
        // Chakana savdo (to'liq foiz) + Optom savdo (yarim foiz)
        const retailSalary = (totalRetailSales * percentage) / 100;
        const wholesaleSalary = (totalWholesaleSales * percentage) / 100 / 2;
        baseSalary = retailSalary + wholesaleSalary;
      }
    }
    
    // BARCHA XODIMLAR UCHUN: Vazifalar tekshiruvi
    if (employee.dailyTasks && Object.keys(employee.dailyTasks).length > 0) {
      // Bajarilgan vazifalar sonini hisoblaymiz
      const completedTasks = Object.values(employee.dailyTasks).filter(task => task === true).length;
      
      // Har bir xodimning o'z vazifalar sonini ishlatamiz
      const totalTasks = Object.keys(employee.dailyTasks).length;
      
      // Bajarilmagan vazifalar soni
      const incompleteTasks = totalTasks - completedTasks;
      
      // Har bir bajarilmagan vazifa uchun 10% kamayadi
      const taskPercentage = 100 - (incompleteTasks * 10);
      
      console.log(`💰 ${currentBranch.name} - ${employee.name}: baseSalary=${baseSalary.toFixed(2)}, completedTasks=${completedTasks}/${totalTasks}, taskPercentage=${taskPercentage}%, finalSalary=${((baseSalary * taskPercentage) / 100).toFixed(2)}`);
      
      // Vazifalar foizini qo'llash
      calculatedSalary = (baseSalary * taskPercentage) / 100;
    } else {
      calculatedSalary = baseSalary;
      console.log(`💰 ${currentBranch.name} - ${employee.name}: baseSalary=${baseSalary.toFixed(2)}, NO TASKS, finalSalary=${baseSalary.toFixed(2)}`);
    }
    
    // Standart oylik (bonus) qo'shish
    return calculatedSalary + (employee.fixedBonus || 0);
  };

  // Jarima summasini hisoblash (real-time) - BARCHA XODIMLAR UCHUN
  const calculatePenalty = (employee: Employee) => {
    // Agar vazifalar yo'q bo'lsa, jarima ham yo'q
    if (!employee.dailyTasks || Object.keys(employee.dailyTasks).length === 0) {
      return 0;
    }
    
    let baseSalary = 0;
    
    if (employee.position === 'sotuvchi') {
      // Sotuvchi uchun: kunlik savdodan hisoblash
      if (!employee.dailySales && !employee.wholesaleSales) {
        return 0;
      }
      
      // Chakana savdo (to'liq foiz)
      const retailSales = employee.dailySales || 0;
      const retailSalary = (retailSales * employee.percentage) / 100;
      
      // Optom savdo (yarim foiz)
      const wholesaleSales = employee.wholesaleSales || 0;
      const wholesaleSalary = (wholesaleSales * employee.percentage) / 100 / 2;
      
      // Jami asosiy oylik
      baseSalary = retailSalary + wholesaleSalary;
    } else {
      // Boshqa xodimlar uchun
      if (currentBranch.name === "Asosiy Sklad") {
        // Asosiy Skladda: retailSales va wholesaleSales dan hisoblash
        const retailSalary = (currentBranch.retailSales || 0) * employee.percentage / 100;
        const wholesaleSalary = (currentBranch.wholesaleSales || 0) * employee.percentage / 100 / 2;
        baseSalary = retailSalary + wholesaleSalary;
      } else {
        // Oddiy filiallar uchun: sotuvchilarning savdosidan
        const filialSotuvchilar = currentBranch.employees.filter(emp => emp.position === 'sotuvchi');
        const totalRetailSales = filialSotuvchilar.reduce((sum, emp) => sum + (emp.dailySales || 0), 0);
        const totalWholesaleSales = filialSotuvchilar.reduce((sum, emp) => sum + (emp.wholesaleSales || 0), 0);
        
        const retailSalary = (totalRetailSales * employee.percentage) / 100;
        const wholesaleSalary = (totalWholesaleSales * employee.percentage) / 100 / 2;
        baseSalary = retailSalary + wholesaleSalary;
      }
    }
    
    const actualSalary = calculateSalary(employee) - (employee.fixedBonus || 0); // Bonusni ayiramiz
    const penalty = baseSalary - actualSalary;
    
    console.log(`⚠️ ${currentBranch.name} - ${employee.name} JARIMA: baseSalary=${baseSalary.toFixed(2)}, actualSalary=${actualSalary.toFixed(2)}, penalty=${penalty.toFixed(2)}`);
    
    return penalty;
  };

  // Filial uchun jami jarima (real-time) - BARCHA XODIMLAR
  const calculateBranchPenalty = (branch: Branch) => {
    return branch.employees
      .filter(emp => emp.dailyTasks && Object.keys(emp.dailyTasks).length > 0)
      .reduce((sum, emp) => sum + calculatePenalty(emp), 0);
  };

  const formatMoney = (amount: number) => {
    return new Intl.NumberFormat("uz-UZ").format(amount) + " so'm";
  };

  if (loading) {
    return (
      <div className={`flex h-screen items-center justify-center ${isDarkMode ? 'bg-gray-900' : 'bg-gray-100'}`}>
        <div className="text-center">
          <div className="inline-block h-16 w-16 animate-spin rounded-full border-4 border-solid border-[#F87819] border-r-transparent shadow-lg"></div>
          <p className={`mt-4 font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Yuklanmoqda...</p>
        </div>
      </div>
    );
  }

  if (!currentBranch || branches.length === 0) {
    return (
      <div className={`flex h-screen items-center justify-center ${isDarkMode ? 'bg-gray-900' : 'bg-gray-100'}`}>
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-red-100 rounded-full mb-4 shadow-lg border-2 border-red-200">
            <svg className="w-10 h-10 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <p className={`text-lg font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Server bilan bog'lanishda xato</p>
          <p className={`text-sm mb-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Backend server ishlamayotgan bo'lishi mumkin</p>
          <button
            onClick={() => loadBranches()}
            className="px-4 py-2 bg-[#F87819] text-white text-sm font-bold rounded-lg hover:bg-[#e06d15] transition-all shadow-lg"
          >
            Qayta urinish
          </button>
        </div>
      </div>
    );
  }

  // Landing Page - Agar login qilinmagan bo'lsa
  if (!isAuthenticated) {
    return (
      <>
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex flex-col">
          {/* Navbar */}
          <nav className="w-full px-6 lg:px-12 py-6 border-b border-gray-800">
            <div className="max-w-7xl mx-auto flex items-center justify-between">
              {/* Logo */}
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#F87819] to-[#ff8c3a] p-0.5">
                  <img 
                    src="/logo.png" 
                    alt="Logo" 
                    className="w-full h-full rounded-xl object-cover bg-white"
                  />
                </div>
                <span className="text-xl font-semibold text-white">Alibobo</span>
              </div>

              {/* Kirish tugmasi */}
              <button
                onClick={() => setShowLoginModal(true)}
                className="px-6 py-2.5 rounded-lg text-sm font-medium transition-all bg-gradient-to-r from-[#F87819] to-[#ff8c3a] text-white hover:shadow-lg hover:shadow-orange-500/50"
              >
                Kirish
              </button>
            </div>
          </nav>

          {/* Hero Section */}
          <div className="flex-1 flex items-center justify-center px-4 sm:px-6 py-8 sm:py-12">
            <div className="max-w-6xl mx-auto w-full">
              {/* Logo - Square & Balanced */}
              <div className="mb-12 sm:mb-16 md:mb-20 flex justify-center">
                <div className="w-64 h-64 sm:w-72 sm:h-72 md:w-80 md:h-80 lg:w-96 lg:h-96 xl:w-[28rem] xl:h-[28rem] rounded-3xl bg-gradient-to-br from-[#F87819] to-[#ff8c3a] p-1.5 shadow-2xl">
                  <img 
                    src="/logo.png" 
                    alt="Alibobo Logo" 
                    className="w-full h-full rounded-3xl object-cover bg-white"
                  />
                </div>
              </div>

              {/* Features - 3ta Card */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-8 max-w-5xl mx-auto px-4">
                <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700 hover:border-[#F87819] transition-all">
                  <div className="w-12 h-12 bg-gradient-to-br from-[#F87819] to-[#ff8c3a] rounded-xl flex items-center justify-center mb-4 mx-auto">
                    <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2 text-center">Xodimlar Boshqaruvi</h3>
                  <p className="text-sm text-gray-400 text-center">Barcha xodimlarning oyligini bir joyda boshqaring</p>
                </div>

                <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700 hover:border-[#F87819] transition-all">
                  <div className="w-12 h-12 bg-gradient-to-br from-[#F87819] to-[#ff8c3a] rounded-xl flex items-center justify-center mb-4 mx-auto">
                    <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2 text-center">Savdo Hisobotlari</h3>
                  <p className="text-sm text-gray-400 text-center">Kunlik va oylik savdo statistikasini kuzating</p>
                </div>

                <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700 hover:border-[#F87819] transition-all">
                  <div className="w-12 h-12 bg-gradient-to-br from-[#F87819] to-[#ff8c3a] rounded-xl flex items-center justify-center mb-4 mx-auto">
                    <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2 text-center">Jarima Nazorati</h3>
                  <p className="text-sm text-gray-400 text-center">Jarimalar jamg'armasini avtomatik hisoblang</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Login Modal */}
        {showLoginModal && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden border-4 border-gray-900">
              {/* Header */}
              <div className="px-8 py-6 bg-gradient-to-br from-gray-900 to-black relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-[#F87819] opacity-10 rounded-full -mr-16 -mt-16"></div>
                <div className="absolute bottom-0 left-0 w-24 h-24 bg-[#F87819] opacity-10 rounded-full -ml-12 -mb-12"></div>
                
                <div className="relative flex items-center gap-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-[#F87819] to-[#ff8c3a] rounded-2xl flex items-center justify-center shadow-xl">
                    <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-white">Tizimga Kirish</h3>
                    <p className="text-sm text-gray-300 mt-1">Admin panelga kirish uchun</p>
                  </div>
                </div>
              </div>

              {/* Body */}
              <div className="p-8 space-y-5">
                {loginError && (
                  <div className="bg-red-50 border-2 border-red-500 rounded-xl p-4 flex items-center gap-3 animate-shake">
                    <div className="flex-shrink-0 w-10 h-10 bg-red-500 rounded-full flex items-center justify-center">
                      <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </div>
                    <p className="text-sm font-bold text-red-700">{loginError}</p>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-bold text-gray-900 mb-2.5">Login</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                    <input
                      type="text"
                      value={loginInput}
                      onChange={(e) => setLoginInput(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
                      className="w-full pl-12 pr-4 py-3.5 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#F87819] focus:border-[#F87819] text-gray-900 font-medium transition-all"
                      placeholder="Login kiriting"
                      autoFocus
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-900 mb-2.5">Parol</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                      </svg>
                    </div>
                    <input
                      type="password"
                      value={passwordInput}
                      onChange={(e) => setPasswordInput(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
                      className="w-full pl-12 pr-4 py-3.5 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#F87819] focus:border-[#F87819] text-gray-900 font-medium transition-all"
                      placeholder="Parol kiriting"
                    />
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="px-8 py-6 bg-gray-50 border-t-2 border-gray-200 flex gap-3">
                <button
                  onClick={() => {
                    setShowLoginModal(false);
                    setLoginInput("");
                    setPasswordInput("");
                    setLoginError("");
                  }}
                  className="flex-1 px-5 py-3.5 border-2 border-gray-900 text-gray-900 text-sm font-bold rounded-xl hover:bg-gray-900 hover:text-white transition-all"
                >
                  Bekor qilish
                </button>
                <button
                  onClick={handleLogin}
                  className="flex-1 px-5 py-3.5 bg-gradient-to-r from-[#F87819] to-[#ff8c3a] text-white text-sm font-bold rounded-xl hover:shadow-2xl hover:scale-[1.02] transition-all shadow-lg"
                >
                  Kirish
                </button>
              </div>
            </div>
          </div>
        )}
      </>
    );
  }

  return (
    <div className={`flex h-screen overflow-hidden ${isDarkMode ? 'bg-gray-900' : 'bg-gray-100'}`}>
      {/* Mobile Overlay */}
      {isMobileSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setIsMobileSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed lg:static inset-y-0 left-0 z-50
        w-72 bg-gradient-to-b from-gray-900 via-gray-900 to-black border-r border-gray-800 
        flex flex-col shadow-2xl
        transform transition-transform duration-300 ease-in-out
        ${isMobileSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        {/* Logo */}
        <div className="p-6 border-b border-gray-800 flex-shrink-0">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#F87819] to-[#ff8c3a] p-0.5 shadow-xl">
                <img 
                  src="/logo.png" 
                  alt="Logo" 
                  className="w-full h-full rounded-2xl object-cover bg-white"
                />
              </div>
              <div>
                <span className="text-ld font-bold text-white block leading-tight">Alibobo</span>
                <span className="text-lg text-gray-200 leading-tight">Oylik Tizimi</span>
              </div>
            </div>
            <button
              onClick={() => setIsMobileSidebarOpen(false)}
              className="lg:hidden text-gray-400 hover:text-white transition-colors"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Navigation - Scrollable */}
        <div className="flex-1 overflow-y-auto px-4 py-4">
          {/* Filiallar */}
          <div className="mb-6">
            <h2 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 px-3">Filiallar</h2>
            <div className="space-y-1">
              {filteredBranches.map((branch, index) => (
                <button
                  key={branch._id}
                  onClick={() => {
                    setActiveBranch(index);
                    setActiveView("branches");
                    setIsMobileSidebarOpen(false);
                  }}
                  className={`w-full text-left px-4 py-3 rounded-xl text-sm font-semibold transition-all group ${
                    activeBranch === index && activeView === "branches"
                      ? "bg-gradient-to-r from-[#F87819] to-[#ff8c3a] text-white shadow-lg shadow-orange-500/30"
                      : "text-gray-300 hover:bg-gray-800/50 hover:text-white"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
                      activeBranch === index && activeView === "branches"
                        ? "bg-white/20"
                        : "bg-gray-800 group-hover:bg-gray-700"
                    }`}>
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                      </svg>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-bold truncate">{branch.name}</div>
                      <div className={`text-xs mt-0.5 ${
                        activeBranch === index && activeView === "branches" 
                          ? "text-orange-100" 
                          : "text-gray-500"
                      }`}>
                        {branch.employees.length} xodim
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Boshqalar */}
          <div> 
            <h2 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 px-3 ">Boshqalar <hr /> </h2> 
            <div className="space-y-1">
              {/* Tarix - faqat admin va manager uchun */}
              {userRole !== 'gijduvon_manager' && (
                <button
                  onClick={() => {
                    setActiveView("history");
                    loadHistory();
                    setIsMobileSidebarOpen(false);
                  }}
                  className={`w-full text-left px-4 py-3 rounded-xl text-sm font-semibold transition-all group ${
                    activeView === "history"
                      ? "bg-gradient-to-r from-[#F87819] to-[#ff8c3a] text-white shadow-lg shadow-orange-500/30"
                      : "text-gray-300 hover:bg-gray-800/50 hover:text-white"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
                      activeView === "history"
                        ? "bg-white/20"
                        : "bg-gray-800 group-hover:bg-gray-700"
                    }`}>
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <span className="truncate">Tarix</span>
                  </div>
                </button>
              )}

              {/* Jarimalar - BARCHA UCHUN */}
              <button
                onClick={() => {
                  setActiveView("penalties");
                  setIsMobileSidebarOpen(false);
                }}
                className={`w-full text-left px-4 py-3 rounded-xl text-sm font-semibold transition-all group ${
                  activeView === "penalties"
                    ? "bg-gradient-to-r from-[#F87819] to-[#ff8c3a] text-white shadow-lg shadow-orange-500/30"
                    : "text-gray-300 hover:bg-gray-800/50 hover:text-white"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
                    activeView === "penalties"
                      ? "bg-white/20"
                      : "bg-gray-800 group-hover:bg-gray-700"
                  }`}>
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <span className="truncate">Jarimalar</span>
                </div>
              </button>

              {/* Kunlik Ishlar - faqat admin va manager uchun */}
              {userRole !== 'gijduvon_manager' && (
                <button
                  onClick={() => {
                    setActiveView("tasks");
                    loadTaskTemplates();
                    setIsMobileSidebarOpen(false);
                  }}
                  className={`w-full text-left px-4 py-3 rounded-xl text-sm font-semibold transition-all group ${
                    activeView === "tasks"
                      ? "bg-gradient-to-r from-[#F87819] to-[#ff8c3a] text-white shadow-lg shadow-orange-500/30"
                      : "text-gray-300 hover:bg-gray-800/50 hover:text-white"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
                      activeView === "tasks"
                        ? "bg-white/20"
                        : "bg-gray-800 group-hover:bg-gray-700"
                    }`}>
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                      </svg>
                    </div>
                    <span className="truncate">Kunlik Ishlar</span>
                  </div>
                </button>
              )}

              {/* Hisobotlar - BARCHA UCHUN */}
              <button
                onClick={() => {
                  setActiveView("reports");
                  loadMonthlyReports(currentBranch._id, selectedMonth);
                  setIsMobileSidebarOpen(false);
                }}
                className={`w-full text-left px-4 py-3 rounded-xl text-sm font-semibold transition-all group ${
                  activeView === "reports"
                    ? "bg-gradient-to-r from-[#F87819] to-[#ff8c3a] text-white shadow-lg shadow-orange-500/30"
                    : "text-gray-300 hover:bg-gray-800/50 hover:text-white"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
                    activeView === "reports"
                      ? "bg-white/20"
                      : "bg-gray-800 group-hover:bg-gray-700"
                  }`}>
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                  <span className="truncate">Hisobotlar</span>
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* Login/Logout - Fixed at bottom */}
        <div className="p-4 border-t border-gray-800 flex-shrink-0">
          {!isAuthenticated ? (
            <button
              onClick={() => {
                setShowLoginModal(true);
                setIsMobileSidebarOpen(false);
              }}
              className="w-full px-4 py-3 rounded-xl text-sm font-bold transition-all bg-gradient-to-r from-[#F87819] to-[#ff8c3a] text-white hover:shadow-2xl hover:shadow-orange-500/50 hover:scale-[1.02] shadow-lg"
            >
              <div className="flex items-center justify-center gap-3">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                <span className="text-base font-bold">Kirish</span>
              </div>
            </button>
          ) : (
            <>
              {/* Dark Mode Toggle */}
              <button
                onClick={toggleDarkMode}
                className="w-full px-4 py-3 rounded-xl text-sm font-bold transition-all bg-gray-800 text-white hover:bg-gray-700 hover:shadow-xl hover:scale-[1.02] shadow-lg mb-3"
              >
                <div className="flex items-center justify-center gap-3">
                  {isDarkMode ? (
                    <>
                      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                      </svg>
                      <span className="text-base font-bold">Light Mode</span>
                    </>
                  ) : (
                    <>
                      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                      </svg>
                      <span className="text-base font-bold">Dark Mode</span>
                    </>
                  )}
                </div>
              </button>

              {/* Logout Button */}
              <button
                onClick={() => {
                  handleLogout();
                  setIsMobileSidebarOpen(false);
                }}
                className="w-full px-4 py-3 rounded-xl text-sm font-bold transition-all bg-gray-800 text-white hover:bg-gray-700 hover:shadow-xl hover:scale-[1.02] shadow-lg"
              >
                <div className="flex items-center justify-center gap-3">
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  <span className="text-base font-bold">Chiqish</span>
                </div>
              </button>
            </>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        {/* Mobile Header */}
        <div className={`lg:hidden sticky top-0 z-30 border-b px-4 py-3 flex items-center justify-between shadow-sm ${
          isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
        }`}>
          <button
            onClick={() => setIsMobileSidebarOpen(true)}
            className={isDarkMode ? 'text-gray-300 hover:text-white' : 'text-gray-600 hover:text-gray-900'}
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <h1 className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            {activeView === "branches" ? currentBranch?.name : 
             activeView === "history" ? "Tarix" :
             activeView === "penalties" ? "Jarimalar" : 
             activeView === "reports" ? "Hisobotlar" : "Kunlik Ishlar"}
          </h1>
          {/* Dark Mode Toggle - Mobile */}
          <button
            onClick={toggleDarkMode}
            className={`p-2 rounded-lg transition-colors ${
              isDarkMode 
                ? 'bg-gray-700 text-yellow-400 hover:bg-gray-600' 
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
            title={isDarkMode ? 'Light Mode' : 'Dark Mode'}
          >
            {isDarkMode ? (
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
              </svg>
            )}
          </button>
        </div>
        {activeView === "branches" && (
          <div className="w-full mx-auto p-4 md:p-6 lg:p-8 max-w-[1920px]">
          {/* Header */}
          <div className="mb-6 md:mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h1 className={`text-2xl font-semibold mb-1 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{currentBranch.name}</h1>
              <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Xodimlar va oylik ma'lumotlari</p>
            </div>
            {isAuthenticated && userRole === 'admin' && (
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setShowAddPosition(true)}
                  className="px-6 py-2.5 bg-gray-900 text-white text-sm font-bold rounded-lg hover:bg-gray-800 transition-all shadow-lg flex items-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Lavozim qo'shish
                </button>
                <button
                  onClick={() => setShowFixTasksModal(true)}
                  className="px-6 py-2.5 bg-blue-600 text-white text-sm font-bold rounded-lg hover:bg-blue-700 transition-all shadow-lg flex items-center gap-2"
                  title="Vazifalar mavjudligini tekshirish va qo'shish"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Vazifalarni Tekshirish
                </button>
                <button
                  onClick={() => {
                    // Tekshirish: xodimlar bormi?
                    if (currentBranch.employees.length === 0) {
                      setShowSaveErrorModal(true);
                      return;
                    }
                    
                    // Tekshirish: savdo bormi?
                    const totalSales = currentBranch.totalSales || 0;
                    if (totalSales === 0) {
                      setShowSaveErrorModal(true);
                      return;
                    }
                    
                    // Tasdiqlash modal oynasini ko'rsatamiz
                    setShowSaveConfirmModal(true);
                  }}
                  className="px-6 py-2.5 bg-[#F87819] text-white text-sm font-bold rounded-lg hover:bg-[#e06d15] transition-all shadow-lg flex items-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                  </svg>
                  Tarixga saqlash
                </button>
              </div>
            )}
          </div>

          {/* Sales Card */}
          {/* Barcha filiallar uchun chakana va optom alohida */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 mb-6">
            <div className="bg-white rounded-xl border-2 border-gray-900 p-6 shadow-lg">
              <p className="text-sm text-gray-600 font-semibold mb-2">Umumiy Savdo</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatMoney(currentBranch.totalSales || 0)}
              </p>
              {currentBranch.name === "Asosiy Sklad" && (
                <p className="text-xs text-gray-500 mt-3">Filiallar yig'indisi</p>
              )}
            </div>
            
            <div className="bg-white rounded-xl border-2 border-green-500 p-6 shadow-lg">
              <p className="text-sm text-green-600 font-semibold mb-2">Chakana Savdo</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatMoney(currentBranch.retailSales || 0)}
              </p>
              {currentBranch.name === "Asosiy Sklad" && (
                <p className="text-xs text-gray-500 mt-3">Filiallar yig'indisi</p>
              )}
            </div>
            
            <div className="bg-white rounded-xl border-2 border-blue-500 p-6 shadow-lg">
              <p className="text-sm text-blue-600 font-semibold mb-2">Optom Savdo</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatMoney(currentBranch.wholesaleSales || 0)}
              </p>
              {currentBranch.name === "Asosiy Sklad" && (
                <p className="text-xs text-gray-500 mt-3">Filiallar yig'indisi</p>
              )}
            </div>
          </div>

          {/* Employees Section */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="px-6 py-4 bg-gray-900 border-b border-gray-800 flex items-center justify-between">
              <h2 className="text-lg font-bold text-white">Xodimlar</h2>
              {isAuthenticated && userRole === 'admin' && (
                <button
                  onClick={() => setShowAddEmployee(true)}
                  className="px-4 py-2 bg-[#F87819] text-white text-sm font-bold rounded-lg hover:bg-[#e06d15] transition-all shadow-lg"
                >
                  Xodim Qo'shish
                </button>
              )}
            </div>

            {currentBranch.employees.length === 0 ? (
              <div className="p-12 text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
                  <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <p className="text-base font-medium text-gray-900 mb-1">Hozircha xodimlar yo'q</p>
                <p className="text-sm text-gray-500">Yuqoridagi tugma orqali xodim qo'shing</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-max">
                  <thead className={`border-b ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200'}`}>
                    <tr>
                      <th className={`px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider whitespace-nowrap ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Ism</th>
                      <th className={`px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider whitespace-nowrap ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Lavozim</th>
                      <th className={`px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider whitespace-nowrap ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Foiz (%)</th>
                      <th className={`px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider whitespace-nowrap ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Chakana Savdo</th>
                      <th className={`px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider whitespace-nowrap ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Optom Savdo</th>
                      <th className={`px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider whitespace-nowrap ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Oylik</th>
                      <th className={`px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider whitespace-nowrap ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Amallar</th>
                    </tr>
                  </thead>
                  <tbody className={`divide-y ${isDarkMode ? 'divide-gray-700' : 'divide-gray-200'}`}>
                    {currentBranch.employees.map((employee) => (
                      <tr key={`${employee.id}-${JSON.stringify(employee.dailyTasks)}`} className={`transition-colors ${
                        isDarkMode 
                          ? 'bg-gray-800 hover:bg-gray-700' 
                          : 'hover:bg-gray-50'
                      }`}>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-3">
                            <div className={`w-9 h-9 rounded-lg flex items-center justify-center text-white text-sm font-bold shadow-md flex-shrink-0 ${
                              isDarkMode ? 'bg-gray-600' : 'bg-gray-900'
                            }`}>
                              {employee.name.charAt(0).toUpperCase()}
                            </div>
                            <span className={`text-sm font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{employee.name}</span>
                          </div>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wide ${positionColors[employee.position] || 'bg-gray-200 text-gray-800'}`}>
                            {positions.find(p => p.id === employee.position)?.name || employee.position}
                          </span>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <span className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-900'}`}>{employee.percentage}%</span>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          {employee.position === "sotuvchi" ? (
                            <span className="text-sm font-bold text-green-600">
                              {employee.dailySales ? formatMoney(employee.dailySales) : "0 so'm"}
                            </span>
                          ) : (
                            <span className={`text-sm ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>—</span>
                          )}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          {employee.position === "sotuvchi" ? (
                            <span className="text-sm font-bold text-blue-600">
                              {employee.wholesaleSales ? formatMoney(employee.wholesaleSales) : "0 so'm"}
                            </span>
                          ) : (
                            <span className={`text-sm ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>—</span>
                          )}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <span className="text-sm font-bold text-green-600">{formatMoney(calculateSalary(employee))}</span>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          {isAuthenticated && userRole === 'admin' ? (
                            <div className="flex items-center gap-2">
                              {employee.position === "sotuvchi" && (
                                <button
                                  onClick={() => openSalesModal(employee)}
                                  className="group relative p-2 rounded-lg bg-gradient-to-br from-green-50 to-emerald-50 hover:from-green-100 hover:to-emerald-100 border border-green-200 hover:border-green-300 transition-all duration-200 hover:shadow-md"
                                  title="Kunlik savdo"
                                >
                                  <svg className="w-4 h-4 text-green-600 group-hover:text-green-700 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                  </svg>
                                </button>
                              )}
                              <button
                                onClick={() => openTasksModal(employee)}
                                className="group relative p-2 rounded-lg bg-gradient-to-br from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100 border border-blue-200 hover:border-blue-300 transition-all duration-200 hover:shadow-md"
                                title="Kunlik vazifalar"
                              >
                                <svg className="w-4 h-4 text-blue-600 group-hover:text-blue-700 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                                </svg>
                              </button>
                              {employee.position !== "sotuvchi" && (
                                <button
                                  onClick={() => openBonusModal(employee)}
                                  className="group relative p-2 rounded-lg bg-gradient-to-br from-green-50 to-emerald-50 hover:from-green-100 hover:to-emerald-100 border border-green-200 hover:border-green-300 transition-all duration-200 hover:shadow-md"
                                  title="Standart Oylik"
                                >
                                  <svg className="w-4 h-4 text-green-600 group-hover:text-green-700 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                  </svg>
                                </button>
                              )}
                              <button
                                onClick={() => openEditEmployee(employee)}
                                className="group relative p-2 rounded-lg bg-gradient-to-br from-orange-50 to-amber-50 hover:from-orange-100 hover:to-amber-100 border border-orange-200 hover:border-orange-300 transition-all duration-200 hover:shadow-md"
                                title="Tahrirlash"
                              >
                                <svg className="w-4 h-4 text-[#F87819] group-hover:text-[#e06d15] transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                </svg>
                              </button>
                              <button
                                onClick={() => confirmDelete(employee.id)}
                                className="group relative p-2 rounded-lg bg-gradient-to-br from-red-50 to-rose-50 hover:from-red-100 hover:to-rose-100 border border-red-200 hover:border-red-300 transition-all duration-200 hover:shadow-md"
                                title="O'chirish"
                              >
                                <svg className="w-4 h-4 text-red-600 group-hover:text-red-700 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                              </button>
                            </div>
                          ) : userRole === 'gijduvon_manager' ? (
                            // G'ijduvon manager uchun faqat 2ta tugma
                            <div className="flex items-center gap-2">
                              {/* Kunlik vazifalar tugmasi */}
                              <button
                                onClick={() => openTasksModal(employee)}
                                className="group relative p-2.5 rounded-xl bg-gradient-to-br from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100 border-2 border-blue-200 hover:border-blue-300 transition-all duration-200 hover:shadow-lg hover:scale-105"
                                title="Kunlik vazifalar"
                              >
                                <svg className="w-5 h-5 text-blue-600 group-hover:text-blue-700 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                                </svg>
                              </button>
                              
                              {/* Kunlik savdo tugmasi - faqat sotuvchilar uchun */}
                              {employee.position === "sotuvchi" && (
                                <button
                                  onClick={() => openSalesModal(employee)}
                                  className="group relative p-2.5 rounded-xl bg-gradient-to-br from-green-50 to-emerald-50 hover:from-green-100 hover:to-emerald-100 border-2 border-green-200 hover:border-green-300 transition-all duration-200 hover:shadow-lg hover:scale-105"
                                  title="Kunlik savdo"
                                >
                                  <svg className="w-5 h-5 text-green-600 group-hover:text-green-700 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                  </svg>
                                </button>
                              )}
                            </div>
                          ) : (
                            <span className="text-sm text-gray-500 italic">—</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Summary Cards */}
          {currentBranch.employees.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 mt-6">
              <div className={`rounded-xl border-2 p-6 shadow-lg ${
                isDarkMode 
                  ? 'bg-gray-800 border-gray-700' 
                  : 'bg-white border-gray-900'
              }`}>
                <p className={`text-sm font-semibold mb-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Jami Oyliklar</p>
                <p className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  {formatMoney(currentBranch.employees.reduce((sum, emp) => sum + calculateSalary(emp), 0))}
                </p>
              </div>

              <div className={`rounded-xl border-2 border-[#F87819] p-6 shadow-lg ${
                isDarkMode ? 'bg-gray-800' : 'bg-white'
              }`}>
                <p className="text-sm text-[#F87819] font-semibold mb-1">Jami Foiz</p>
                <p className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  {currentBranch.employees.reduce((sum, emp) => sum + emp.percentage, 0).toFixed(1)}%
                </p>
              </div>

              <div className={`rounded-xl p-6 shadow-lg ${
                isDarkMode 
                  ? 'bg-gradient-to-br from-gray-700 to-gray-800' 
                  : 'bg-gray-900'
              }`}>
                <p className="text-sm text-gray-400 font-semibold mb-1">Xodimlar Soni</p>
                <p className="text-2xl font-bold text-white">{currentBranch.employees.length}</p>
              </div>
            </div>
          )}
        </div>
        )}

        {activeView === "history" && (
          <div className="w-full mx-auto p-4 md:p-6 lg:p-8 max-w-[1920px]">
            {/* Tarix sahifasi */}
            <div className="mb-8">
              <h1 className={`text-2xl font-semibold mb-1 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Savdo Tarixi</h1>
              <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Barcha filiallar - Oxirgi 30 kun</p>
            </div>

            {history.length === 0 ? (
              <div className={`rounded-lg border p-12 text-center ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
                <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full mb-4 ${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
                  <svg className={`w-8 h-8 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <p className={`text-base font-medium mb-1 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Tarix topilmadi</p>
                <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Hali kunlik savdo tarixi saqlanmagan</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {history.map((record) => {
                  const branch = branches.find(b => b._id === record.branchId);
                  const totalSalary = record.employees.reduce((sum: number, emp: any) => sum + (emp.salary || 0), 0);
                  
                  return (
                    <div 
                      key={record._id} 
                      className={`rounded-xl border-2 p-6 hover:shadow-xl transition-all cursor-pointer ${
                        isDarkMode 
                          ? 'bg-gray-800 border-gray-700 hover:border-[#F87819]' 
                          : 'bg-white border-gray-200 hover:border-gray-900'
                      }`}
                    >
                      <div 
                        onClick={() => {
                          setSelectedHistoryRecord(record);
                          setShowHistoryModal(true);
                        }}
                      >
                        <div className="mb-4">
                          <div className="flex items-center justify-between mb-2">
                            <h3 className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                              {new Date(record.date).toLocaleDateString('uz-UZ', { 
                                year: 'numeric', 
                                month: 'short', 
                                day: 'numeric',
                                weekday: 'short'
                              })}
                            </h3>
                            <svg className={`w-5 h-5 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                          </div>
                          <p className="text-sm font-bold text-[#F87819]">
                            {branch?.name || 'Filial'}
                          </p>
                        </div>

                        <div className="space-y-3">
                          <div className={`rounded-lg p-3 border ${isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'}`}>
                            <p className={`text-xs font-semibold ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Umumiy savdo</p>
                            <p className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                              {formatMoney(record.totalSales)}
                            </p>
                          </div>

                          <div className="bg-gray-900 rounded-lg p-3">
                            <p className="text-xs text-gray-400 font-semibold">Jami oyliklar</p>
                            <p className="text-lg font-bold text-white">
                              {formatMoney(totalSalary)}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Pastki qism - xodimlar soni va o'chirish */}
                      <div className={`pt-3 mt-3 border-t flex items-center justify-between ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                        <p className={`text-xs font-semibold ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                          {record.employees.length} xodim
                        </p>
                        {isAuthenticated && userRole === 'admin' && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setHistoryToDelete(record);
                              setShowDeleteHistoryConfirm(true);
                            }}
                            className="w-8 h-8 bg-red-50 text-red-600 rounded-lg hover:bg-red-600 hover:text-white transition-colors flex items-center justify-center"
                            title="O'chirish"
                          >
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {activeView === "penalties" && (
          <div className="w-full mx-auto p-4 md:p-6 lg:p-8 max-w-[1920px]">
            {/* Jarimalar Jamg'armasi sahifasi */}
            <div className="mb-8">
              <h1 className={`text-2xl font-semibold mb-1 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Jarimalar Jamg'armasi</h1>
              <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Sotuvchilarning bajarilmagan vazifalari uchun yig'ilgan jarima pullar</p>
            </div>

            {/* Filiallar bo'yicha jarimalar */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              {branches.map((branch) => {
                const currentPenalty = calculateBranchPenalty(branch); // Hozirgi jarima (real-time)
                const savedPenalty = branch.penaltyFund || 0; // Tarixga saqlangan jarima
                const totalPenalty = currentPenalty + savedPenalty; // Jami
                
                return (
                  <div key={branch._id} className={`rounded-xl border-2 p-6 hover:shadow-xl transition-all ${
                    isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
                  }`}>
                    <div className="flex items-center justify-between mb-4">
                      <h3 className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{branch.name}</h3>
                      <div className="w-12 h-12 bg-gradient-to-br from-red-100 to-orange-100 rounded-full flex items-center justify-center">
                        <svg className="w-6 h-6 text-[#F87819]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                    </div>
                    
                    {/* Hozirgi jarima (real-time) */}
                    {currentPenalty > 0 && (
                      <div className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-lg p-3 border-2 border-yellow-400 mb-3">
                        <p className="text-xs text-yellow-700 font-semibold mb-1">Hozirgi jarima (saqlanmagan)</p>
                        <p className="text-xl font-bold text-yellow-700">
                          {formatMoney(currentPenalty)}
                        </p>
                        <p className="text-xs text-yellow-600 mt-1">
                          "Tarixga saqlash" bosing
                        </p>
                      </div>
                    )}
                    
                    {/* Saqlangan jarima */}
                    <div className="bg-gradient-to-br from-red-50 to-orange-50 rounded-lg p-4 border-2 border-[#F87819]">
                      <p className={`text-xs font-semibold mb-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Saqlangan jarima</p>
                      <p className="text-2xl font-bold text-[#F87819]">
                        {formatMoney(savedPenalty)}
                      </p>
                    </div>

                    <div className={`mt-4 pt-4 border-t ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                      <div className="flex items-center justify-between text-xs">
                        <span className={isDarkMode ? 'text-gray-400' : 'text-gray-500'}>Jami (hozirgi + saqlangan):</span>
                        <span className={`font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{formatMoney(totalPenalty)}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Statistika */}
            <div className={`rounded-xl border-2 p-6 ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
              <h2 className={`text-xl font-bold mb-6 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Statistika</h2>
              
              <div className="space-y-4">
                {branches
                  .map(branch => ({
                    ...branch,
                    currentPenalty: calculateBranchPenalty(branch),
                    savedPenalty: branch.penaltyFund || 0
                  }))
                  .sort((a, b) => {
                    const totalA = a.currentPenalty + a.savedPenalty;
                    const totalB = b.currentPenalty + b.savedPenalty;
                    return totalB - totalA;
                  })
                  .map((branch, index) => {
                    const totalPenalties = branches.reduce((sum, b) => {
                      const current = calculateBranchPenalty(b);
                      const saved = b.penaltyFund || 0;
                      return sum + current + saved;
                    }, 0);
                    const branchTotal = branch.currentPenalty + branch.savedPenalty;
                    const percentage = totalPenalties > 0 ? (branchTotal / totalPenalties) * 100 : 0;
                    
                    return (
                      <div key={branch._id} className="flex items-center gap-4">
                        <div className="flex-shrink-0 w-8 h-8 bg-gray-900 text-white rounded-lg flex items-center justify-center font-bold text-sm">
                          {index + 1}
                        </div>
                        
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-2">
                            <span className={`text-sm font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{branch.name}</span>
                            <div className="text-right">
                              <div className="text-sm font-bold text-[#F87819]">
                                {formatMoney(branchTotal)}
                              </div>
                              {branch.currentPenalty > 0 && (
                                <div className="text-xs text-yellow-600">
                                  +{formatMoney(branch.currentPenalty)} hozirgi
                                </div>
                              )}
                            </div>
                          </div>
                          
                          <div className={`w-full rounded-full h-3 overflow-hidden ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'}`}>
                            <div 
                              className="h-full bg-gradient-to-r from-[#F87819] to-[#ff8c3a] rounded-full transition-all duration-500"
                              style={{ width: `${percentage}%` }}
                            ></div>
                          </div>
                          
                          <div className="flex items-center justify-between mt-1">
                            <span className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>{percentage.toFixed(1)}% jami jarimadan</span>
                            <span className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                              {branch.employees.filter(e => e.position === 'sotuvchi').length} sotuvchi
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
              </div>

              {/* Jami */}
              <div className={`mt-6 pt-6 border-t-2 ${isDarkMode ? 'border-gray-700' : 'border-gray-900'}`}>
                <div className="flex items-center justify-between mb-2">
                  <span className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>JAMI JARIMA</span>
                  <span className="text-2xl font-bold text-[#F87819]">
                    {formatMoney(branches.reduce((sum, b) => {
                      const current = calculateBranchPenalty(b);
                      const saved = b.penaltyFund || 0;
                      return sum + current + saved;
                    }, 0))}
                  </span>
                </div>
                
                {/* Tafsilot */}
                <div className="grid grid-cols-2 gap-4 mt-4">
                  <div className="bg-yellow-50 rounded-lg p-3 border border-yellow-200">
                    <p className="text-xs text-yellow-700 font-semibold mb-1">Hozirgi (saqlanmagan)</p>
                    <p className="text-lg font-bold text-yellow-700">
                      {formatMoney(branches.reduce((sum, b) => sum + calculateBranchPenalty(b), 0))}
                    </p>
                  </div>
                  
                  <div className="bg-orange-50 rounded-lg p-3 border border-orange-200">
                    <p className="text-xs text-orange-700 font-semibold mb-1">Saqlangan</p>
                    <p className="text-lg font-bold text-orange-700">
                      {formatMoney(branches.reduce((sum, b) => sum + (b.penaltyFund || 0), 0))}
                    </p>
                  </div>
                </div>
                
                <p className={`text-xs mt-3 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  Barcha filiallardan yig'ilgan jami jarima summasi (hozirgi + saqlangan)
                </p>
              </div>
            </div>

            {/* Tushuntirish */}
            <div className="mt-6 bg-gradient-to-br from-orange-50 to-red-50 rounded-xl border-2 border-[#F87819] p-6">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-10 h-10 bg-[#F87819] rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <h3 className="text-sm font-bold text-gray-900 mb-2">Jarima hisoblash qoidasi:</h3>
                  <ul className="text-xs text-gray-700 space-y-1">
                    <li>• Sotuvchi 4ta vazifani bajarishi kerak (o'z vaqtida kelish, polka tozaligi, mahsulot nazorati, polka terish)</li>
                    <li>• Har bir bajarilmagan vazifa uchun oylikdan 10% kamayadi</li>
                    <li>• Kamaytirilgan pul "Jarimalar Jamg'armasi"ga tushadi</li>
                    <li>• Masalan: Oylik 1,000,000 so'm, 2ta vazifa bajarilmagan = 200,000 so'm jarima</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeView === "tasks" && (
          <div className="w-full mx-auto p-4 md:p-6 lg:p-8 max-w-[1920px]">
            {/* Kunlik Ishlar sahifasi */}
            <div className="mb-8 flex items-center justify-between">
              <div>
                <h1 className={`text-2xl font-semibold mb-1 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Kunlik Ishlar</h1>
                <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Har bir lavozim uchun kunlik bajarilishi kerak bo'lgan ishlar</p>
              </div>
              {isAuthenticated && userRole === 'admin' && (
                <button
                  onClick={() => setShowAddTaskModal(true)}
                  className="px-6 py-2.5 bg-[#F87819] text-white text-sm font-bold rounded-lg hover:bg-[#e06d15] transition-all shadow-lg flex items-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                  </svg>
                  Kunlik Ish Qo'shish
                </button>
              )}
            </div>

            {/* Lavozim tanlash */}
            <div className="mb-6">
              <label className={`block text-sm font-bold mb-3 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Lavozimni tanlang:</label>
              <div className="grid grid-cols-6 gap-3">
                {['ishchi', 'manager', 'kassir', 'shofir', 'sotuvchi', 'taminotchi'].map((pos) => (
                  <button
                    key={pos}
                    onClick={() => {
                      setSelectedPosition(pos);
                      loadTaskTemplates(pos);
                    }}
                    className={`px-4 py-3 rounded-lg text-sm font-bold uppercase transition-all ${
                      selectedPosition === pos
                        ? 'bg-[#F87819] text-white shadow-lg'
                        : isDarkMode
                        ? 'bg-gray-800 text-gray-300 border-2 border-gray-700 hover:border-[#F87819]'
                        : 'bg-white text-gray-700 border-2 border-gray-300 hover:border-[#F87819]'
                    }`}
                  >
                    {pos}
                  </button>
                ))}
              </div>
            </div>

            {/* Vazifalar ro'yxati */}
            <div className={`rounded-xl border-2 shadow-sm overflow-hidden ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
              <div className="px-6 py-4 bg-gray-900 border-b border-gray-800">
                <h2 className="text-lg font-bold text-white">{selectedPosition.toUpperCase()} uchun kunlik ishlar</h2>
              </div>

              {taskTemplates.length === 0 ? (
                <div className="p-12 text-center">
                  <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full mb-4 ${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
                    <svg className={`w-8 h-8 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                    </svg>
                  </div>
                  <p className={`text-base font-medium mb-1 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Hozircha ishlar yo'q</p>
                  <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Yuqoridagi tugma orqali kunlik ish qo'shing</p>
                </div>
              ) : (
                <div className={`divide-y ${isDarkMode ? 'divide-gray-700' : 'divide-gray-200'}`}>
                  {taskTemplates.map((task, index) => (
                    <div key={task._id} className={`p-6 transition-colors flex items-center gap-4 ${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'}`}>
                      <div className="flex-shrink-0 w-10 h-10 bg-gray-900 text-white rounded-lg flex items-center justify-center font-bold">
                        {index + 1}
                      </div>
                      
                      <div className="flex-1">
                        <h3 className={`text-base font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{task.taskName}</h3>
                        {task.description && (
                          <p className={`text-sm mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>{task.description}</p>
                        )}
                      </div>

                      {isAuthenticated && userRole === 'admin' && (
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => {
                              setEditingTask(task);
                              setNewTaskName(task.taskName);
                              setShowEditTaskModal(true);
                            }}
                            className="px-4 py-2 text-sm font-medium text-[#F87819] hover:bg-orange-50 rounded-lg transition-colors"
                          >
                            Tahrirlash
                          </button>
                          <button
                            onClick={() => {
                              setTaskToDelete(task);
                              setShowDeleteTaskConfirm(true);
                            }}
                            className="px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            O'chirish
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Tushuntirish */}
            <div className="mt-6 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border-2 border-blue-200 p-6">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <h3 className="text-sm font-bold text-gray-900 mb-2">Qanday ishlaydi:</h3>
                  <ul className="text-xs text-gray-700 space-y-1">
                    <li>• Har bir lavozim uchun alohida kunlik ishlar yaratishingiz mumkin</li>
                    <li>• Xodimlar jadvalida "Kunlik Vazifalar" tugmasi avtomatik paydo bo'ladi</li>
                    <li>• Har bir bajarilmagan vazifa uchun oylikdan 10% kamayadi</li>
                    <li>• Ishlarni istalgan vaqt tahrirlash yoki o'chirish mumkin</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Hisobotlar Sahifasi */}
        {activeView === "reports" && (
          <div className="w-full mx-auto p-4 md:p-6 lg:p-8 max-w-[1920px]">
            {/* Header */}
            <div className="mb-8">
              <h1 className={`text-2xl font-semibold mb-1 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Oylik Hisobotlar</h1>
              <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Filial va xodim bo'yicha batafsil hisobot</p>
            </div>

            {/* Step 1: Filiallarni tanlash */}
            <div className="mb-8">
              <h2 className={`text-lg font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>1. Filialni tanlang</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {branches.map((branch, index) => (
                  <button
                    key={branch._id}
                    onClick={() => {
                      setActiveBranch(index);
                      setSelectedEmployee(null); // Xodim tanlovi tozalanadi
                      loadMonthlyReports(branch._id, selectedMonth);
                    }}
                    className={`p-6 rounded-xl border-2 transition-all text-left ${
                      currentBranch._id === branch._id
                        ? 'border-[#F87819] bg-gradient-to-br from-orange-50 to-yellow-50 shadow-lg'
                        : isDarkMode
                        ? 'border-gray-700 bg-gray-800 hover:border-[#F87819] hover:shadow-md'
                        : 'border-gray-200 bg-white hover:border-[#F87819] hover:shadow-md'
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-14 h-14 rounded-xl flex items-center justify-center ${
                        currentBranch._id === branch._id
                          ? 'bg-gradient-to-br from-[#F87819] to-[#ff8c3a]'
                          : isDarkMode
                          ? 'bg-gray-700'
                          : 'bg-gray-100'
                      }`}>
                        <svg className={`w-7 h-7 ${currentBranch._id === branch._id ? 'text-white' : isDarkMode ? 'text-gray-400' : 'text-gray-600'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                        </svg>
                      </div>
                      <div className="flex-1">
                        <h3 className={`text-lg font-bold ${currentBranch._id === branch._id ? 'text-gray-900' : isDarkMode ? 'text-white' : 'text-gray-900'}`}>{branch.name}</h3>
                        <p className={`text-sm ${currentBranch._id === branch._id ? 'text-gray-600' : isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>{branch.employees.length} xodim</p>
                      </div>
                      {currentBranch._id === branch._id && (
                        <div className="w-6 h-6 bg-[#F87819] rounded-full flex items-center justify-center">
                          <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Step 2: Xodim va Oy tanlash */}
            <div className="mb-8 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className={`block text-sm font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>2. Xodimni tanlang</label>
                <select
                  value={selectedEmployee?.id || ""}
                  onChange={(e) => {
                    const emp = currentBranch.employees.find(emp => emp.id === e.target.value);
                    setSelectedEmployee(emp || null);
                  }}
                  className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#F87819] focus:border-[#F87819] font-medium ${
                    isDarkMode 
                      ? 'border-gray-700 bg-gray-800 text-white' 
                      : 'border-gray-300 bg-white text-gray-900'
                  }`}
                >
                  <option value="">-- Xodimni tanlang --</option>
                  {currentBranch.employees.map(emp => (
                    <option key={emp.id} value={emp.id}>
                      {emp.name} ({positions.find(p => p.id === emp.position)?.name || emp.position})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className={`block text-sm font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>3. Oyni tanlang</label>
                <select
                  value={selectedMonth}
                  onChange={(e) => {
                    setSelectedMonth(e.target.value);
                    if (selectedEmployee) {
                      loadMonthlyReports(currentBranch._id, e.target.value);
                    }
                  }}
                  className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#F87819] focus:border-[#F87819] font-medium ${
                    isDarkMode 
                      ? 'border-gray-700 bg-gray-800 text-white' 
                      : 'border-gray-300 bg-white text-gray-900'
                  }`}
                >
                  {Array.from({ length: 12 }, (_, i) => {
                    const date = new Date();
                    date.setMonth(date.getMonth() - i);
                    const value = date.toISOString().slice(0, 7);
                    const monthNames = ['Yanvar', 'Fevral', 'Mart', 'Aprel', 'May', 'Iyun', 'Iyul', 'Avgust', 'Sentabr', 'Oktabr', 'Noyabr', 'Dekabr'];
                    const label = `${monthNames[date.getMonth()]} ${date.getFullYear()}`;
                    return <option key={value} value={value}>{label}</option>;
                  })}
                </select>
              </div>
            </div>

            {/* Step 3: Xodim hisoboti */}
            {selectedEmployee && monthlyReports.length > 0 ? (() => {
              // Tanlangan xodimning ma'lumotlarini yig'ish
              const employeeData = {
                name: selectedEmployee.name,
                position: selectedEmployee.position,
                totalSalary: 0,
                totalRetailSales: 0,
                totalWholesaleSales: 0,
                totalPenalty: 0,
                daysWorked: 0,
                dailyRecords: [] as any[]
              };

              monthlyReports.forEach(record => {
                const empRecord = record.employees.find((e: any) => e.employeeId === selectedEmployee.id);
                if (empRecord) {
                  employeeData.totalSalary += empRecord.salary || 0;
                  employeeData.totalRetailSales += empRecord.dailySales || 0;
                  employeeData.totalWholesaleSales += empRecord.wholesaleSales || 0;
                  employeeData.totalPenalty += empRecord.penaltyAmount || 0;
                  employeeData.daysWorked += 1;
                  employeeData.dailyRecords.push({
                    date: record.date,
                    salary: empRecord.salary || 0,
                    retailSales: empRecord.dailySales || 0,
                    wholesaleSales: empRecord.wholesaleSales || 0,
                    penalty: empRecord.penaltyAmount || 0,
                    tasks: empRecord.dailyTasks
                  });
                }
              });

              return (
                <div className="space-y-6">
                  {/* Xodim ma'lumotlari */}
                  <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-8 text-white shadow-2xl">
                    <div className="flex items-center gap-6 mb-6">
                      <div className="w-20 h-20 bg-gradient-to-br from-[#F87819] to-[#ff8c3a] rounded-2xl flex items-center justify-center shadow-xl">
                        <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                      </div>
                      <div>
                        <h2 className="text-3xl font-bold mb-2">{employeeData.name}</h2>
                        <span className={`inline-flex items-center px-3 py-1.5 rounded-lg text-sm font-bold uppercase ${
                          positionColors[employeeData.position] || 'bg-gray-200 text-gray-800'
                        }`}>
                          {positions.find(p => p.id === employeeData.position)?.name || employeeData.position}
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                        <p className="text-sm text-white/70 mb-1">Jami Oylik</p>
                        <p className="text-2xl font-bold">{formatMoney(employeeData.totalSalary)}</p>
                      </div>
                      <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                        <p className="text-sm text-white/70 mb-1">Chakana Savdo</p>
                        <p className="text-2xl font-bold">{formatMoney(employeeData.totalRetailSales)}</p>
                      </div>
                      <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                        <p className="text-sm text-white/70 mb-1">Optom Savdo</p>
                        <p className="text-2xl font-bold">{formatMoney(employeeData.totalWholesaleSales)}</p>
                      </div>
                      <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                        <p className="text-sm text-white/70 mb-1">Jarimalar</p>
                        <p className="text-2xl font-bold text-red-300">{formatMoney(employeeData.totalPenalty)}</p>
                      </div>
                    </div>

                    <div className="mt-4 pt-4 border-t border-white/20">
                      <p className="text-sm text-white/70">
                        {employeeData.daysWorked} kun ishlagan • {currentBranch.name}
                      </p>
                    </div>
                  </div>

                  {/* Kunlik ma'lumotlar */}
                  <div className={`rounded-xl border-2 overflow-hidden shadow-lg ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
                    <div className={`px-6 py-4 border-b ${isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'}`}>
                      <h3 className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Kunlik Ma'lumotlar</h3>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className={`border-b ${isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-100 border-gray-200'}`}>
                          <tr>
                            <th className={`px-6 py-3 text-left text-xs font-bold uppercase ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Sana</th>
                            <th className={`px-6 py-3 text-right text-xs font-bold uppercase ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Chakana</th>
                            <th className={`px-6 py-3 text-right text-xs font-bold uppercase ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Optom</th>
                            <th className={`px-6 py-3 text-right text-xs font-bold uppercase ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Oylik</th>
                            <th className={`px-6 py-3 text-right text-xs font-bold uppercase ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Jarima</th>
                          </tr>
                        </thead>
                        <tbody className={`divide-y ${isDarkMode ? 'divide-gray-700' : 'divide-gray-200'}`}>
                          {employeeData.dailyRecords.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map((record, index) => (
                            <tr key={index} className={`transition-colors ${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'}`}>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                  {new Date(record.date).toLocaleDateString('uz-UZ', { day: '2-digit', month: 'long', year: 'numeric' })}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-right">
                                <span className="text-sm font-bold text-green-600">{formatMoney(record.retailSales)}</span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-right">
                                <span className="text-sm font-bold text-blue-600">{formatMoney(record.wholesaleSales)}</span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-right">
                                <span className={`text-sm font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{formatMoney(record.salary)}</span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-right">
                                <span className="text-sm font-bold text-red-600">{formatMoney(record.penalty)}</span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              );
            })() : (
              <div className={`rounded-xl border-2 p-12 text-center ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
                <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full mb-4 ${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
                  <svg className={`w-8 h-8 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <p className={`text-base font-medium mb-1 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  {!selectedEmployee ? "Xodimni tanlang" : "Hisobot topilmadi"}
                </p>
                <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  {!selectedEmployee ? "Yuqoridan xodim va oyni tanlang" : "Tanlangan oy uchun ma'lumot mavjud emas"}
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Modal - Yangi Xodim */}
      {showAddEmployee && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className={`rounded-2xl shadow-2xl max-w-md w-full overflow-hidden ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
            <div className="px-6 py-5 bg-gradient-to-b from-gray-900 to-gray-800">
              <h3 className="text-xl font-bold text-white">Yangi Xodim</h3>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className={`block text-sm font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Ism</label>
                <input
                  type="text"
                  value={newEmployee.name}
                  onChange={(e) => setNewEmployee({ ...newEmployee, name: e.target.value })}
                  className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#F87819] focus:border-[#F87819] ${
                    isDarkMode 
                      ? 'border-gray-700 bg-gray-700 text-white placeholder-gray-400' 
                      : 'border-gray-300 bg-white text-gray-900'
                  }`}
                  placeholder="Xodim ismi"
                />
              </div>

              <div>
                <label className={`block text-sm font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Lavozim</label>
                <select
                  value={newEmployee.position}
                  onChange={(e) => {
                    const position = e.target.value;
                    if (position === "sotuvchi") {
                      setNewEmployee({ ...newEmployee, position, percentage: 1.4 });
                      setPercentageInput("1.4");
                    } else {
                      setNewEmployee({ ...newEmployee, position });
                    }
                  }}
                  className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#F87819] focus:border-[#F87819] cursor-pointer font-medium ${
                    isDarkMode 
                      ? 'border-gray-700 bg-gray-700 text-white' 
                      : 'border-gray-300 bg-white text-gray-900'
                  }`}
                >
                  {positions.map(pos => (
                    <option key={pos.id} value={pos.id}>{pos.name}</option>
                  ))}
                </select>
                {newEmployee.position === "sotuvchi" && (
                  <p className="text-xs text-[#F87819] font-medium mt-1">Sotuvchilar uchun standart foiz: 1.4%</p>
                )}
              </div>

              <div>
                <label className={`block text-sm font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Foiz (%)</label>
                <input
                  type="text"
                  value={percentageInput}
                  onChange={(e) => handlePercentageChange(e.target.value)}
                  className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#F87819] focus:border-[#F87819] ${
                    isDarkMode 
                      ? 'border-gray-700 bg-gray-700 text-white placeholder-gray-400' 
                      : 'border-gray-300 bg-white text-gray-900'
                  }`}
                  placeholder="0 yoki 2.5"
                />
                <p className={`text-xs mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Masalan: 2.5 yoki 10</p>
              </div>
            </div>

            <div className={`px-6 py-4 border-t flex gap-3 ${isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'}`}>
              <button
                onClick={() => setShowAddEmployee(false)}
                className={`flex-1 px-4 py-3 border-2 text-sm font-bold rounded-xl transition-all ${
                  isDarkMode 
                    ? 'border-gray-600 text-gray-300 hover:bg-gray-600' 
                    : 'border-gray-300 text-gray-700 hover:bg-gray-100'
                }`}
              >
                Bekor qilish
              </button>
              <button
                onClick={addEmployee}
                className="flex-1 px-4 py-3 bg-gradient-to-r from-[#F87819] to-[#ff8c3a] text-white text-sm font-bold rounded-xl hover:shadow-lg transition-all"
              >
                Qo'shish
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal - Xodimni Tahrirlash */}
      {showEditEmployee && editingEmployee && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className={`rounded-2xl shadow-2xl max-w-md w-full overflow-hidden ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
            <div className="px-6 py-5 bg-gradient-to-b from-gray-900 to-gray-800">
              <h3 className="text-xl font-bold text-white">Xodimni Tahrirlash</h3>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className={`block text-sm font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Ism</label>
                <input
                  type="text"
                  value={editingEmployee.name}
                  onChange={(e) => setEditingEmployee({ ...editingEmployee, name: e.target.value })}
                  className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#F87819] focus:border-[#F87819] ${
                    isDarkMode 
                      ? 'border-gray-700 bg-gray-700 text-white placeholder-gray-400' 
                      : 'border-gray-300 bg-white text-gray-900'
                  }`}
                  placeholder="Xodim ismi"
                />
              </div>

              <div>
                <label className={`block text-sm font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Lavozim</label>
                <select
                  value={editingEmployee.position}
                  onChange={(e) => {
                    const position = e.target.value;
                    if (position === "sotuvchi") {
                      setEditingEmployee({ ...editingEmployee, position, percentage: 1.4 });
                      setEditPercentageInput("1.4");
                    } else {
                      setEditingEmployee({ ...editingEmployee, position });
                    }
                  }}
                  className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#F87819] focus:border-[#F87819] cursor-pointer font-medium ${
                    isDarkMode 
                      ? 'border-gray-700 bg-gray-700 text-white' 
                      : 'border-gray-300 bg-white text-gray-900'
                  }`}
                >
                  {positions.map(pos => (
                    <option key={pos.id} value={pos.id}>{pos.name}</option>
                  ))}
                </select>
                {editingEmployee.position === "sotuvchi" && (
                  <p className="text-xs text-[#F87819] font-medium mt-1">Sotuvchilar uchun standart foiz: 1.4%</p>
                )}
              </div>

              <div>
                <label className={`block text-sm font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Foiz (%)</label>
                <input
                  type="text"
                  value={editPercentageInput}
                  onChange={(e) => handleEditPercentageChange(e.target.value)}
                  className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#F87819] focus:border-[#F87819] ${
                    isDarkMode 
                      ? 'border-gray-700 bg-gray-700 text-white placeholder-gray-400' 
                      : 'border-gray-300 bg-white text-gray-900'
                  }`}
                  placeholder="0 yoki 2.5"
                />
                <p className={`text-xs mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Masalan: 2.5 yoki 10</p>
              </div>
            </div>

            <div className={`px-6 py-4 border-t flex gap-3 ${isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'}`}>
              <button
                onClick={() => {
                  setShowEditEmployee(false);
                  setEditingEmployee(null);
                  setEditPercentageInput("");
                }}
                className={`flex-1 px-4 py-3 border-2 text-sm font-bold rounded-xl transition-all ${
                  isDarkMode 
                    ? 'border-gray-600 text-gray-300 hover:bg-gray-600' 
                    : 'border-gray-300 text-gray-700 hover:bg-gray-100'
                }`}
              >
                Bekor qilish
              </button>
              <button
                onClick={updateEmployee}
                className="flex-1 px-4 py-3 bg-gradient-to-r from-[#F87819] to-[#ff8c3a] text-white text-sm font-bold rounded-xl hover:shadow-lg transition-all"
              >
                Saqlash
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal - Kunlik Vazifalar (Barcha lavozimlar uchun) */}
      {showTasksModal && selectedEmployee && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className={`rounded-2xl shadow-2xl max-w-md w-full overflow-hidden ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
            <div className="px-6 py-5 bg-gradient-to-b from-gray-900 to-gray-800">
              <h3 className="text-xl font-bold text-white">Kunlik Vazifalar - {selectedEmployee.name}</h3>
              <p className="text-sm text-gray-300 mt-1">
                {selectedEmployee.position.toUpperCase()} - Har bir bajarilmagan vazifa uchun 10% kamayadi
              </p>
              {taskTemplates.length > 0 && (
                <div className="mt-3 text-xs bg-gray-800 text-gray-200 p-3 rounded-lg">
                  <div className="font-bold mb-1">Oylik hisoblash:</div>
                  <div>✅ {taskTemplates.length}ta vazifa = 100% (to'liq oylik)</div>
                  <div>✅ {taskTemplates.length - 1}ta vazifa = 90% (-10%)</div>
                  {taskTemplates.length > 2 && <div>✅ {taskTemplates.length - 2}ta vazifa = 80% (-20%)</div>}
                  {taskTemplates.length > 3 && <div>✅ 1ta vazifa = 70% (-30%)</div>}
                  <div>❌ 0ta vazifa = {100 - (taskTemplates.length * 10)}% (-{taskTemplates.length * 10}%)</div>
                </div>
              )}
            </div>

            <div className="p-6 space-y-3">
              {taskTemplates.length === 0 ? (
                <div className="text-center py-8">
                  <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Bu lavozim uchun kunlik ishlar belgilanmagan</p>
                  <p className={`text-xs mt-2 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>"Kunlik Ishlar" sahifasidan qo'shing</p>
                </div>
              ) : (
                taskTemplates.map((task, index) => {
                  // dailyTasks ni object sifatida saqlash (task._id: boolean)
                  const isChecked = selectedEmployee.dailyTasks?.[task._id] || false;
                  
                  return (
                    <label key={task._id} className={`flex items-center gap-3 p-4 border-2 rounded-xl cursor-pointer transition-all ${
                      isDarkMode 
                        ? 'border-gray-700 hover:bg-gray-700 hover:border-[#F87819]' 
                        : 'border-gray-200 hover:bg-gray-50 hover:border-[#F87819]'
                    }`}>
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={(e) => {
                          const tasks = selectedEmployee.dailyTasks || {};
                          setSelectedEmployee({ 
                            ...selectedEmployee, 
                            dailyTasks: { ...tasks, [task._id]: e.target.checked } 
                          });
                        }}
                        className="w-5 h-5 text-[#F87819] rounded focus:ring-2 focus:ring-[#F87819]"
                      />
                      <div className="flex-1">
                        <p className={`text-sm font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{index + 1}. {task.taskName}</p>
                        {task.description && (
                          <p className={`text-xs mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>{task.description}</p>
                        )}
                      </div>
                    </label>
                  );
                })
              )}
            </div>

            <div className={`px-6 py-4 border-t flex gap-3 ${isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'}`}>
              <button
                onClick={() => {
                  setShowTasksModal(false);
                  setSelectedEmployee(null);
                  setTaskTemplates([]);
                }}
                className={`flex-1 px-4 py-3 border-2 text-sm font-bold rounded-xl transition-all ${
                  isDarkMode 
                    ? 'border-gray-600 text-gray-300 hover:bg-gray-600' 
                    : 'border-gray-300 text-gray-700 hover:bg-gray-100'
                }`}
              >
                Bekor qilish
              </button>
              <button
                onClick={() => updateTasks(selectedEmployee.dailyTasks)}
                disabled={taskTemplates.length === 0}
                className="flex-1 px-4 py-3 bg-gradient-to-r from-[#F87819] to-[#ff8c3a] text-white text-sm font-bold rounded-xl hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Saqlash
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal - Kunlik Savdo (Sotuvchi uchun) */}
      {showSalesModal && selectedEmployee && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className={`rounded-2xl shadow-2xl max-w-md w-full overflow-hidden ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
            <div className="px-6 py-5 bg-gradient-to-b from-gray-900 to-gray-800">
              <h3 className="text-xl font-bold text-white">Kunlik Savdo - {selectedEmployee.name}</h3>
              <p className="text-sm text-gray-300 mt-1">
                Bugungi savdo miqdorlarini kiriting
                {selectedEmployee.lastSalesDate && (
                  <span className="ml-2 font-semibold text-[#F87819]">
                    (Oxirgi: {new Date(selectedEmployee.lastSalesDate).toLocaleDateString('uz-UZ')})
                  </span>
                )}
              </p>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className={`block text-sm font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  Chakana Savdo (so'm) - To'liq foiz
                </label>
                <input
                  type="text"
                  value={dailySalesInput}
                  onChange={(e) => {
                    const cleaned = e.target.value.replace(/[^\d]/g, "");
                    if (cleaned === "") {
                      setDailySalesInput("");
                      return;
                    }
                    const numValue = parseFloat(cleaned);
                    setDailySalesInput(formatNumber(numValue));
                  }}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      updateDailySales();
                    }
                  }}
                  className={`w-full px-4 py-3 border-2 border-green-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 text-lg font-bold ${
                    isDarkMode ? 'bg-gray-700 text-white placeholder-gray-400' : 'bg-white text-gray-900'
                  }`}
                  placeholder="0"
                  autoFocus
                />
                <p className={`text-xs mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Masalan: 10,000,000 (1.4% = 140,000 so'm)</p>
              </div>

              <div>
                <label className={`block text-sm font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  Optom Savdo (so'm) - Yarim foiz
                </label>
                <input
                  type="text"
                  value={wholesaleSalesInput}
                  onChange={(e) => {
                    const cleaned = e.target.value.replace(/[^\d]/g, "");
                    if (cleaned === "") {
                      setWholesaleSalesInput("");
                      return;
                    }
                    const numValue = parseFloat(cleaned);
                    setWholesaleSalesInput(formatNumber(numValue));
                  }}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      updateDailySales();
                    }
                  }}
                  className={`w-full px-4 py-3 border-2 border-blue-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-lg font-bold ${
                    isDarkMode ? 'bg-gray-700 text-white placeholder-gray-400' : 'bg-white text-gray-900'
                  }`}
                  placeholder="0"
                />
                <p className={`text-xs mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Masalan: 20,000,000 (1.4% ÷ 2 = 140,000 so'm)</p>
              </div>

              <div>
                <label className={`block text-sm font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  Standart Oylik (so'm)
                </label>
                <input
                  type="text"
                  value={bonusInput}
                  onChange={(e) => {
                    const cleaned = e.target.value.replace(/[^\d]/g, "");
                    if (cleaned === "") {
                      setBonusInput("");
                      return;
                    }
                    const numValue = parseFloat(cleaned);
                    setBonusInput(formatNumber(numValue));
                  }}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      updateDailySales();
                    }
                  }}
                  className={`w-full px-4 py-3 border-2 border-purple-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-lg font-bold ${
                    isDarkMode ? 'bg-gray-700 text-white placeholder-gray-400' : 'bg-white text-gray-900'
                  }`}
                  placeholder="0"
                />
                <p className={`text-xs mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Qo'shimcha bonus summasi (masalan: 100,000 so'm)</p>
              </div>

              {/* Hisoblash ko'rsatish */}
              {(dailySalesInput || wholesaleSalesInput || (bonusInput && parseFloat(bonusInput.replace(/,/g, "")) > 0)) && (
                <div className="bg-gradient-to-br from-orange-50 to-yellow-50 rounded-lg p-4 border-2 border-[#F87819]">
                  <p className="text-xs font-bold text-gray-900 mb-2">Taxminiy oylik:</p>
                  <div className="space-y-1 text-xs text-gray-700">
                    {dailySalesInput && (
                      <div className="flex justify-between">
                        <span>Chakana:</span>
                        <span className="font-bold text-green-600">
                          {formatMoney((parseFloat(dailySalesInput.replace(/,/g, "")) || 0) * selectedEmployee.percentage / 100)}
                        </span>
                      </div>
                    )}
                    {wholesaleSalesInput && (
                      <div className="flex justify-between">
                        <span>Optom (÷2):</span>
                        <span className="font-bold text-blue-600">
                          {formatMoney((parseFloat(wholesaleSalesInput.replace(/,/g, "")) || 0) * selectedEmployee.percentage / 100 / 2)}
                        </span>
                      </div>
                    )}
                    {bonusInput && parseFloat(bonusInput.replace(/,/g, "")) > 0 && (
                      <div className="flex justify-between">
                        <span>Standart oylik:</span>
                        <span className="font-bold text-purple-600">
                          + {formatMoney(parseFloat(bonusInput.replace(/,/g, "")) || 0)}
                        </span>
                      </div>
                    )}
                    <div className="flex justify-between pt-2 border-t border-orange-300">
                      <span className="font-bold">Jami:</span>
                      <span className="font-bold text-[#F87819]">
                        {formatMoney(
                          ((parseFloat(dailySalesInput.replace(/,/g, "")) || 0) * selectedEmployee.percentage / 100) +
                          ((parseFloat(wholesaleSalesInput.replace(/,/g, "")) || 0) * selectedEmployee.percentage / 100 / 2) +
                          (parseFloat(bonusInput.replace(/,/g, "")) || 0)
                        )}
                      </span>
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">* Vazifalar foizisiz hisoblangan</p>
                </div>
              )}
            </div>

            <div className={`px-6 py-4 border-t flex gap-3 ${isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'}`}>
              <button
                onClick={() => {
                  setShowSalesModal(false);
                  setSelectedEmployee(null);
                  setDailySalesInput("");
                  setWholesaleSalesInput("");
                  setBonusInput("");
                }}
                className={`flex-1 px-4 py-3 border-2 text-sm font-bold rounded-xl transition-all ${
                  isDarkMode 
                    ? 'border-gray-600 text-gray-300 hover:bg-gray-600' 
                    : 'border-gray-300 text-gray-700 hover:bg-gray-100'
                }`}
              >
                Bekor qilish
              </button>
              <button
                onClick={updateDailySales}
                className="flex-1 px-4 py-3 bg-gradient-to-r from-[#F87819] to-[#ff8c3a] text-white text-sm font-bold rounded-xl hover:shadow-lg transition-all"
              >
                Saqlash
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal - Standart Oylik (Bonus) */}
      {showBonusModal && selectedEmployee && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className={`rounded-2xl shadow-2xl max-w-md w-full overflow-hidden ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
            <div className="px-6 py-5 bg-gradient-to-b from-green-600 to-emerald-700">
              <h3 className="text-xl font-bold text-white">Standart Oylik - {selectedEmployee.name}</h3>
              <p className="text-sm text-green-100 mt-1">
                Qo'shimcha bonus summasini kiriting
              </p>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className={`block text-sm font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  Bonus Summasi (so'm)
                </label>
                <input
                  type="text"
                  value={bonusInput}
                  onChange={(e) => {
                    const cleaned = e.target.value.replace(/[^\d]/g, "");
                    if (cleaned === "") {
                      setBonusInput("");
                      return;
                    }
                    const numValue = parseFloat(cleaned);
                    setBonusInput(formatNumber(numValue));
                  }}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      updateBonus();
                    }
                  }}
                  className={`w-full px-4 py-3 border-2 border-green-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 text-lg font-bold ${
                    isDarkMode ? 'bg-gray-700 text-white placeholder-gray-400' : 'bg-white text-gray-900'
                  }`}
                  placeholder="0"
                  autoFocus
                />
                <p className={`text-xs mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Masalan: 100,000 so'm</p>
              </div>

              {/* Hisoblash ko'rsatish */}
              {bonusInput && parseFloat(bonusInput.replace(/,/g, "")) > 0 && (
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg p-4 border-2 border-green-500">
                  <p className="text-xs font-bold text-gray-900 mb-2">Jami oylik:</p>
                  <div className="space-y-1 text-xs text-gray-700">
                    <div className="flex justify-between">
                      <span>Hisoblangan oylik:</span>
                      <span className="font-bold text-gray-900">
                        {formatMoney(calculateSalary(selectedEmployee) - (selectedEmployee.fixedBonus || 0))}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Standart oylik:</span>
                      <span className="font-bold text-green-600">
                        + {formatMoney(parseFloat(bonusInput.replace(/,/g, "")) || 0)}
                      </span>
                    </div>
                    <div className="flex justify-between pt-2 border-t border-green-300">
                      <span className="font-bold">Jami:</span>
                      <span className="font-bold text-green-700">
                        {formatMoney(
                          (calculateSalary(selectedEmployee) - (selectedEmployee.fixedBonus || 0)) +
                          (parseFloat(bonusInput.replace(/,/g, "")) || 0)
                        )}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className={`px-6 py-4 border-t flex gap-3 ${isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'}`}>
              <button
                onClick={() => {
                  setShowBonusModal(false);
                  setSelectedEmployee(null);
                  setBonusInput("");
                }}
                className={`flex-1 px-4 py-3 border-2 text-sm font-bold rounded-xl transition-all ${
                  isDarkMode 
                    ? 'border-gray-600 text-gray-300 hover:bg-gray-600' 
                    : 'border-gray-300 text-gray-700 hover:bg-gray-100'
                }`}
              >
                Bekor qilish
              </button>
              <button
                onClick={updateBonus}
                className="flex-1 px-4 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white text-sm font-bold rounded-xl hover:shadow-lg transition-all"
              >
                Saqlash
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal - O'chirishni tasdiqlash */}
      {showDeleteConfirm && employeeToDelete && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className={`rounded-2xl shadow-2xl max-w-md w-full overflow-hidden ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
            <div className="px-6 py-5 bg-gradient-to-b from-gray-900 to-gray-800">
              <h3 className="text-xl font-bold text-white">Xodimni o'chirish</h3>
            </div>

            <div className="p-6">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-14 h-14 bg-gradient-to-br from-red-100 to-red-200 rounded-full flex items-center justify-center shadow-lg">
                  <svg className="w-7 h-7 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <p className={`text-base font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Rostdan ham o'chirmoqchimisiz?</p>
                  <p className={`text-sm mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Bu amalni qaytarib bo'lmaydi.</p>
                </div>
              </div>
            </div>

            <div className={`px-6 py-4 border-t flex gap-3 ${isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'}`}>
              <button
                onClick={() => {
                  setShowDeleteConfirm(false);
                  setEmployeeToDelete(null);
                }}
                className={`flex-1 px-4 py-3 border-2 text-sm font-bold rounded-xl transition-all ${
                  isDarkMode 
                    ? 'border-gray-600 text-gray-300 hover:bg-gray-600' 
                    : 'border-gray-300 text-gray-700 hover:bg-gray-100'
                }`}
              >
                Bekor qilish
              </button>
              <button
                onClick={() => employeeToDelete && deleteEmployee(employeeToDelete)}
                className="flex-1 px-4 py-3 bg-gradient-to-r from-red-600 to-red-700 text-white text-sm font-bold rounded-xl hover:shadow-lg transition-all"
              >
                O'chirish
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal - Tarix tafsilotlari */}
      {showHistoryModal && selectedHistoryRecord && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className={`rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
            <div className="px-6 py-5 bg-gradient-to-b from-gray-900 to-gray-800">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold text-white">
                    {new Date(selectedHistoryRecord.date).toLocaleDateString('uz-UZ', { 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric',
                      weekday: 'long'
                    })}
                  </h3>
                  <p className="text-sm text-gray-300 mt-1">
                    {branches.find(b => b._id === selectedHistoryRecord.branchId)?.name || 'Filial'}
                  </p>
                </div>
                <button
                  onClick={() => {
                    setShowHistoryModal(false);
                    setSelectedHistoryRecord(null);
                  }}
                  className="text-gray-300 hover:text-white transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-blue-50 rounded-lg p-4">
                  <p className="text-sm text-blue-600 mb-1">Umumiy savdo</p>
                  <p className="text-2xl font-semibold text-blue-900">
                    {formatMoney(selectedHistoryRecord.totalSales)}
                  </p>
                </div>
                <div className="bg-green-50 rounded-lg p-4">
                  <p className="text-sm text-green-600 mb-1">Jami oyliklar</p>
                  <p className="text-2xl font-semibold text-green-900">
                    {formatMoney(selectedHistoryRecord.employees.reduce((sum: number, emp: any) => sum + (emp.salary || 0), 0))}
                  </p>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className={`border-b ${isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'}`}>
                    <tr>
                      <th className={`px-4 py-3 text-left text-xs font-semibold uppercase ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Xodim</th>
                      <th className={`px-4 py-3 text-left text-xs font-semibold uppercase ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Lavozim</th>
                      <th className={`px-4 py-3 text-left text-xs font-semibold uppercase ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Kunlik Savdo</th>
                      <th className={`px-4 py-3 text-left text-xs font-semibold uppercase ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Foiz</th>
                      <th className={`px-4 py-3 text-left text-xs font-semibold uppercase ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Oylik</th>
                    </tr>
                  </thead>
                  <tbody className={`divide-y ${isDarkMode ? 'divide-gray-700' : 'divide-gray-200'}`}>
                    {selectedHistoryRecord.employees.map((emp: any) => (
                      <tr key={emp.employeeId} className={isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'}>
                        <td className={`px-4 py-3 text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{emp.name}</td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wide ${positionColors[emp.position as keyof typeof positionColors]}`}>
                            {emp.position}
                          </span>
                        </td>
                        <td className={`px-4 py-3 text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-900'}`}>
                          {emp.position === 'sotuvchi' ? formatMoney(emp.dailySales || 0) : '—'}
                        </td>
                        <td className={`px-4 py-3 text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-900'}`}>{emp.percentage}%</td>
                        <td className="px-4 py-3 text-sm font-semibold text-green-600">
                          {formatMoney(emp.salary || 0)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className={`px-6 py-4 border-t ${isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'}`}>
              <button
                onClick={() => {
                  setShowHistoryModal(false);
                  setSelectedHistoryRecord(null);
                }}
                className="w-full px-4 py-3 bg-gradient-to-r from-[#F87819] to-[#ff8c3a] text-white text-sm font-bold rounded-xl hover:shadow-lg transition-all"
              >
                Yopish
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal - Saqlashni tasdiqlash */}
      {showSaveConfirmModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className={`rounded-2xl shadow-2xl max-w-md w-full border-2 ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-orange-100'}`}>
            <div className="p-6">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-14 h-14 bg-gradient-to-br from-orange-100 to-yellow-100 rounded-full flex items-center justify-center shadow-lg">
                  <svg className="w-7 h-7 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <p className={`text-base font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Tarixga saqlashni tasdiqlaysizmi?</p>
                  <p className={`text-sm mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    Barcha ma'lumotlar tarixga saqlanadi va 0 ga qaytariladi.
                  </p>
                </div>
              </div>
            </div>

            <div className={`px-6 py-4 border-t flex gap-3 ${isDarkMode ? 'border-gray-700' : 'border-orange-100'}`}>
              <button
                onClick={() => setShowSaveConfirmModal(false)}
                disabled={isSaving}
                className={`flex-1 px-4 py-2 border-2 text-sm font-semibold rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
                  isDarkMode 
                    ? 'border-gray-600 text-gray-300 hover:bg-gray-700' 
                    : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
              >
                Bekor qilish
              </button>
              <button
                onClick={async () => {
                  if (isSaving) return; // Agar saqlanyapti bo'lsa, qayta bosishni oldini olamiz
                  
                  setIsSaving(true);
                  
                  try {
                    const result = await api.saveDailyHistory(currentBranch._id);
                    if (result.ok) {
                      setShowSaveConfirmModal(false);
                      setSavedDate(result.date);
                      setShowSaveSuccessModal(true);
                      // Ma'lumotlarni qayta yuklaymiz
                      await loadBranches(false);
                      await loadHistory();
                    } else {
                      alert('❌ Saqlashda xato yuz berdi');
                    }
                  } catch (error) {
                    alert('❌ Saqlashda xato yuz berdi');
                    console.error(error);
                  } finally {
                    setIsSaving(false);
                  }
                }}
                disabled={isSaving}
                className="flex-1 px-4 py-2 bg-gradient-to-r from-[#F87819] to-[#ff8c3a] text-white text-sm font-semibold rounded-xl hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isSaving ? (
                  <>
                    <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Saqlanmoqda...
                  </>
                ) : (
                  'Ha, saqlash'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal - Saqlash muvaffaqiyatli */}
      {showSaveSuccessModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className={`rounded-2xl shadow-2xl max-w-md w-full border-2 ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-orange-100'}`}>
            <div className="p-6">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-14 h-14 bg-gradient-to-br from-[#F87819] to-[#ff8c3a] rounded-full flex items-center justify-center shadow-lg">
                  <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div className="flex-1">
                  <p className={`text-base font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Bugungi ma'lumotlar tarixga saqlandi va 0 ga qaytarildi!</p>
                  <p className="text-sm text-[#F87819] font-semibold mt-1">({savedDate})</p>
                </div>
              </div>
            </div>

            <div className={`px-6 py-4 border-t ${isDarkMode ? 'border-gray-700' : 'border-orange-100'}`}>
              <button
                onClick={() => setShowSaveSuccessModal(false)}
                className="w-full px-4 py-2 bg-gradient-to-r from-[#F87819] to-[#ff8c3a] text-white text-sm font-semibold rounded-xl hover:shadow-lg transition-all"
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal - Saqlashda xato (ma'lumotlar yo'q) */}
      {showSaveErrorModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className={`rounded-2xl shadow-2xl max-w-md w-full border-2 ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-orange-100'}`}>
            <div className="p-6">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-14 h-14 bg-gradient-to-br from-orange-100 to-red-100 rounded-full flex items-center justify-center shadow-lg">
                  <svg className="w-7 h-7 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <p className={`text-base font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Tarixga saqlash uchun ma'lumotlar yo'q!</p>
                  <p className={`text-sm mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    {currentBranch.employees.length === 0 
                      ? "Avval xodimlar qo'shing."
                      : "Avval savdo miqdorini kiriting."}
                  </p>
                </div>
              </div>
            </div>

            <div className={`px-6 py-4 border-t ${isDarkMode ? 'border-gray-700' : 'border-orange-100'}`}>
              <button
                onClick={() => setShowSaveErrorModal(false)}
                className="w-full px-4 py-2 bg-gradient-to-r from-[#F87819] to-[#ff8c3a] text-white text-sm font-semibold rounded-xl hover:shadow-lg transition-all"
              >
                Tushunarli
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal - Tarixni o'chirish tasdiqlash */}
      {showDeleteHistoryConfirm && historyToDelete && (
        <div 
          className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={() => {
            setShowDeleteHistoryConfirm(false);
            setHistoryToDelete(null);
          }}
        >
          <div 
            className={`rounded-2xl shadow-2xl max-w-md w-full overflow-hidden ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-6 py-5 bg-gradient-to-b from-gray-900 to-gray-800">
              <h3 className="text-xl font-bold text-white">Tarixni o'chirish</h3>
            </div>

            <div className="p-6">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-14 h-14 bg-gradient-to-br from-red-100 to-red-200 rounded-full flex items-center justify-center shadow-lg">
                  <svg className="w-7 h-7 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <p className={`text-base font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Rostdan ham o'chirmoqchimisiz?</p>
                  <p className={`text-sm mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    {new Date(historyToDelete.date).toLocaleDateString('uz-UZ')} - {branches.find(b => b._id === historyToDelete.branchId)?.name}
                  </p>
                  <p className="text-xs text-red-600 font-semibold mt-2">Bu amalni qaytarib bo'lmaydi.</p>
                </div>
              </div>
            </div>

            <div className={`px-6 py-4 border-t flex gap-3 ${isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'}`}>
              <button
                onClick={() => {
                  setShowDeleteHistoryConfirm(false);
                  setHistoryToDelete(null);
                }}
                className={`flex-1 px-4 py-3 border-2 text-sm font-bold rounded-xl transition-all ${
                  isDarkMode 
                    ? 'border-gray-600 text-gray-300 hover:bg-gray-600' 
                    : 'border-gray-300 text-gray-700 hover:bg-gray-100'
                }`}
              >
                Bekor qilish
              </button>
              <button
                onClick={async () => {
                  try {
                    const result = await api.deleteHistory(historyToDelete._id);
                    if (result.ok) {
                      setShowDeleteHistoryConfirm(false);
                      setHistoryToDelete(null);
                      await loadHistory();
                    }
                  } catch (error) {
                    alert('❌ O\'chirishda xato yuz berdi');
                    console.error(error);
                  }
                }}
                className="flex-1 px-4 py-3 bg-gradient-to-r from-red-600 to-red-700 text-white text-sm font-bold rounded-xl hover:shadow-lg transition-all"
              >
                O'chirish
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal - Kunlik Ish Qo'shish */}
      {showAddTaskModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden">
            <div className="px-6 py-5 bg-gradient-to-b from-gray-900 to-gray-800">
              <h3 className="text-xl font-bold text-white">Kunlik Ish Qo'shish</h3>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-900 mb-2">Lavozim</label>
                <select
                  value={selectedPosition}
                  onChange={(e) => setSelectedPosition(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#F87819] focus:border-[#F87819] text-gray-900 bg-white"
                >
                  <option value="ishchi">Ishchi</option>
                  <option value="manager">Manager</option>
                  <option value="kassir">Kassir</option>
                  <option value="shofir">Shofir</option>
                  <option value="sotuvchi">Sotuvchi</option>
                  <option value="taminotchi">Ta'minotchi</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-900 mb-2">Ish nomi</label>
                <input
                  type="text"
                  value={newTaskName}
                  onChange={(e) => setNewTaskName(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#F87819] focus:border-[#F87819] text-gray-900"
                  placeholder="Masalan: Ishga o'z vaqtida kelish"
                />
              </div>
            </div>

            <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex gap-3">
              <button
                onClick={() => {
                  setShowAddTaskModal(false);
                  setNewTaskName("");
                }}
                className="flex-1 px-4 py-3 border-2 border-gray-300 text-gray-700 text-sm font-bold rounded-xl hover:bg-gray-100 transition-all"
              >
                Bekor qilish
              </button>
              <button
                onClick={async () => {
                  if (!newTaskName.trim()) return;
                  try {
                    await api.addTaskTemplate(selectedPosition, newTaskName);
                    await loadTaskTemplates(selectedPosition);
                    setShowAddTaskModal(false);
                    setNewTaskName("");
                  } catch (error) {
                    console.error('Vazifa qo\'shishda xato:', error);
                  }
                }}
                className="flex-1 px-4 py-3 bg-gradient-to-r from-[#F87819] to-[#ff8c3a] text-white text-sm font-bold rounded-xl hover:shadow-lg transition-all"
              >
                Qo'shish
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal - Kunlik Ishni Tahrirlash */}
      {showEditTaskModal && editingTask && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden">
            <div className="px-6 py-5 bg-gradient-to-b from-gray-900 to-gray-800">
              <h3 className="text-xl font-bold text-white">Kunlik Ishni Tahrirlash</h3>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-900 mb-2">Ish nomi</label>
                <input
                  type="text"
                  value={newTaskName}
                  onChange={(e) => setNewTaskName(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#F87819] focus:border-[#F87819] text-gray-900"
                  placeholder="Masalan: Ishga o'z vaqtida kelish"
                />
              </div>
            </div>

            <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex gap-3">
              <button
                onClick={() => {
                  setShowEditTaskModal(false);
                  setEditingTask(null);
                  setNewTaskName("");
                }}
                className="flex-1 px-4 py-3 border-2 border-gray-300 text-gray-700 text-sm font-bold rounded-xl hover:bg-gray-100 transition-all"
              >
                Bekor qilish
              </button>
              <button
                onClick={async () => {
                  if (!newTaskName.trim()) return;
                  try {
                    await api.updateTaskTemplate(editingTask._id, newTaskName);
                    await loadTaskTemplates(selectedPosition);
                    setShowEditTaskModal(false);
                    setEditingTask(null);
                    setNewTaskName("");
                  } catch (error) {
                    console.error('Vazifani yangilashda xato:', error);
                  }
                }}
                className="flex-1 px-4 py-3 bg-gradient-to-r from-[#F87819] to-[#ff8c3a] text-white text-sm font-bold rounded-xl hover:shadow-lg transition-all"
              >
                Saqlash
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal - Kunlik Ishni O'chirish */}
      {showDeleteTaskConfirm && taskToDelete && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden">
            <div className="px-6 py-5 bg-gradient-to-b from-gray-900 to-gray-800">
              <h3 className="text-xl font-bold text-white">Kunlik Ishni O'chirish</h3>
            </div>

            <div className="p-6">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-14 h-14 bg-gradient-to-br from-red-100 to-red-200 rounded-full flex items-center justify-center shadow-lg">
                  <svg className="w-7 h-7 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <p className="text-base font-bold text-gray-900">Rostdan ham o'chirmoqchimisiz?</p>
                  <p className="text-sm text-gray-600 mt-1">{taskToDelete.taskName}</p>
                  <p className="text-xs text-red-600 font-semibold mt-2">Bu amalni qaytarib bo'lmaydi.</p>
                </div>
              </div>
            </div>

            <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex gap-3">
              <button
                onClick={() => {
                  setShowDeleteTaskConfirm(false);
                  setTaskToDelete(null);
                }}
                className="flex-1 px-4 py-3 border-2 border-gray-300 text-gray-700 text-sm font-bold rounded-xl hover:bg-gray-100 transition-all"
              >
                Bekor qilish
              </button>
              <button
                onClick={async () => {
                  try {
                    await api.deleteTaskTemplate(taskToDelete._id);
                    await loadTaskTemplates(selectedPosition);
                    setShowDeleteTaskConfirm(false);
                    setTaskToDelete(null);
                  } catch (error) {
                    console.error('Vazifani o\'chirishda xato:', error);
                  }
                }}
                className="flex-1 px-4 py-3 bg-gradient-to-r from-red-600 to-red-700 text-white text-sm font-bold rounded-xl hover:shadow-lg transition-all"
              >
                O'chirish
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal - Login */}
      {showLoginModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden border-4 border-gray-900">
            {/* Header */}
            <div className="px-8 py-6 bg-gradient-to-br from-gray-900 to-black relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-[#F87819] opacity-10 rounded-full -mr-16 -mt-16"></div>
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-[#F87819] opacity-10 rounded-full -ml-12 -mb-12"></div>
              
              <div className="relative flex items-center gap-4">
                <div className="w-16 h-16 bg-gradient-to-br from-[#F87819] to-[#ff8c3a] rounded-2xl flex items-center justify-center shadow-xl">
                  <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-white">Tizimga Kirish</h3>
                  <p className="text-sm text-gray-300 mt-1">Admin panelga kirish uchun</p>
                </div>
              </div>
            </div>

            {/* Body */}
            <div className="p-8 space-y-5">
              {loginError && (
                <div className="bg-red-50 border-2 border-red-500 rounded-xl p-4 flex items-center gap-3 animate-shake">
                  <div className="flex-shrink-0 w-10 h-10 bg-red-500 rounded-full flex items-center justify-center">
                    <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </div>
                  <p className="text-sm font-bold text-red-700">{loginError}</p>
                </div>
              )}

              <div>
                <label className="block text-sm font-bold text-gray-900 mb-2.5">Login</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <input
                    type="text"
                    value={loginInput}
                    onChange={(e) => setLoginInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
                    className="w-full pl-12 pr-4 py-3.5 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#F87819] focus:border-[#F87819] text-gray-900 font-medium transition-all"
                    placeholder="Login kiriting"
                    autoFocus
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-900 mb-2.5">Parol</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                    </svg>
                  </div>
                  <input
                    type="password"
                    value={passwordInput}
                    onChange={(e) => setPasswordInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
                    className="w-full pl-12 pr-4 py-3.5 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#F87819] focus:border-[#F87819] text-gray-900 font-medium transition-all"
                    placeholder="Parol kiriting"
                  />
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="px-8 py-6 bg-gray-50 border-t-2 border-gray-200 flex gap-3">
              <button
                onClick={() => {
                  setShowLoginModal(false);
                  setLoginInput("");
                  setPasswordInput("");
                  setLoginError("");
                }}
                className="flex-1 px-5 py-3.5 border-2 border-gray-900 text-gray-900 text-sm font-bold rounded-xl hover:bg-gray-900 hover:text-white transition-all"
              >
                Bekor qilish
              </button>
              <button
                onClick={handleLogin}
                className="flex-1 px-5 py-3.5 bg-gradient-to-r from-[#F87819] to-[#ff8c3a] text-white text-sm font-bold rounded-xl hover:shadow-2xl hover:scale-[1.02] transition-all shadow-lg"
              >
                Kirish
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Success Notification */}
      {showSuccessNotification && (
        <div className="fixed top-4 right-4 z-[60] animate-slide-in-right">
          <div className="bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl shadow-2xl p-4 flex items-center gap-4 min-w-[320px] max-w-md">
            <div className="flex-shrink-0 w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div className="flex-1">
              <p className="font-bold text-base">Muvaffaqiyatli kirildi!</p>
              <p className="text-sm text-green-50 mt-0.5">Endi siz barcha funksiyalarni bemalol bajara olasiz</p>
            </div>
            <button
              onClick={() => setShowSuccessNotification(false)}
              className="flex-shrink-0 text-white/80 hover:text-white transition-colors"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* Modal - Lavozim Qo'shish */}
      {showAddPosition && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden">
            <div className="px-6 py-5 bg-gradient-to-b from-gray-900 to-gray-800">
              <h3 className="text-xl font-bold text-white">Yangi Lavozim Qo'shish</h3>
              <p className="text-sm text-gray-300 mt-1">Xodimlar uchun yangi lavozim yarating</p>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-900 mb-2">Lavozim Nomi</label>
                <input
                  type="text"
                  value={newPositionName}
                  onChange={(e) => setNewPositionName(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#F87819] focus:border-[#F87819] text-gray-900"
                  placeholder="Masalan: Do'kon Mudiri"
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-900 mb-2">Rang Tanlash</label>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { color: "bg-blue-500 text-white shadow-md", name: "Ko'k" },
                    { color: "bg-green-500 text-white shadow-md", name: "Yashil" },
                    { color: "bg-red-500 text-white shadow-md", name: "Qizil" },
                    { color: "bg-purple-500 text-white shadow-md", name: "Binafsha" },
                  ].map((item) => (
                    <button
                      key={item.color}
                      onClick={() => setNewPositionColor(item.color)}
                      className={`px-4 py-3 rounded-lg text-xs font-bold uppercase transition-all ${item.color} ${
                        newPositionColor === item.color
                          ? 'ring-4 ring-[#F87819] scale-105'
                          : 'opacity-70 hover:opacity-100'
                      }`}
                    >
                      {item.name}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex gap-3">
              <button
                onClick={() => {
                  setShowAddPosition(false);
                  setNewPositionName("");
                  setNewPositionColor("bg-blue-500 text-white shadow-md");
                }}
                className="flex-1 px-4 py-3 border-2 border-gray-300 text-gray-700 text-sm font-bold rounded-xl hover:bg-gray-100 transition-all"
              >
                Bekor qilish
              </button>
              <button
                onClick={addPosition}
                disabled={!newPositionName.trim()}
                className="flex-1 px-4 py-3 bg-gradient-to-r from-[#F87819] to-[#ff8c3a] text-white text-sm font-bold rounded-xl hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Qo'shish
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal - Vazifalarni Tekshirish */}
      {showFixTasksModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-black rounded-3xl shadow-2xl max-w-md w-full border border-gray-700">
            {/* Header */}
            <div className="p-8 text-center">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full mb-6 shadow-xl">
                <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              
              <h3 className="text-2xl font-bold text-white mb-3">
                {currentBranch.name} says
              </h3>
              
              <p className="text-gray-300 text-base leading-relaxed mb-2">
                {currentBranch.name} filialidagi xodimlarning vazifalarini tekshirish va qo'shishni xohlaysizmi?
              </p>
              
              <p className="text-gray-400 text-sm leading-relaxed">
                Agar xodimga vazifalar berilmagan bo'lsa, lavozimiga mos vazifalar avtomatik qo'shiladi.
              </p>
            </div>

            {/* Footer */}
            <div className="px-8 pb-8 flex gap-4">
              <button
                onClick={async () => {
                  setShowFixTasksModal(false);
                  try {
                    let fixedCount = 0;
                    
                    // Har bir xodimni tekshiramiz
                    for (const employee of currentBranch.employees) {
                      // Agar vazifalar yo'q bo'lsa yoki bo'sh bo'lsa
                      if (!employee.dailyTasks || Object.keys(employee.dailyTasks).length === 0) {
                        // Lavozimiga mos task template'larni topamiz
                        const positionTemplates = taskTemplates.filter(t => t.position === employee.position);
                        
                        if (positionTemplates.length > 0) {
                          const dailyTasks: any = {};
                          
                          // Har bir template uchun false qilib qo'yamiz
                          for (const template of positionTemplates) {
                            dailyTasks[template._id] = false;
                          }
                          
                          // Backend'ga yuboramiz
                          await api.updateEmployee(employee.id, {
                            name: employee.name,
                            position: employee.position,
                            percentage: employee.percentage,
                            dailyTasks: dailyTasks,
                            dailySales: employee.dailySales,
                            wholesaleSales: employee.wholesaleSales,
                            fixedBonus: employee.fixedBonus
                          });
                          fixedCount++;
                        }
                      }
                    }
                    
                    if (fixedCount > 0) {
                      setFixedTasksCount(fixedCount);
                      setShowFixTasksSuccessModal(true);
                      await loadBranches(false);
                    } else {
                      // Hech qanday muammo topilmadi - modal ko'rsatamiz
                      setShowNoIssuesModal(true);
                    }
                  } catch (error) {
                    console.error('Xato:', error);
                    alert('❌ Xato yuz berdi! Console ni tekshiring.');
                  }
                }}
                className="flex-1 px-6 py-3.5 bg-gradient-to-r from-blue-500 to-indigo-600 text-white text-base font-bold rounded-xl hover:from-blue-600 hover:to-indigo-700 transition-all shadow-lg hover:shadow-xl hover:scale-[1.02]"
              >
                Tekshirish
              </button>
              <button
                onClick={() => setShowFixTasksModal(false)}
                className="flex-1 px-6 py-3.5 bg-gradient-to-r from-gray-700 to-gray-800 text-white text-base font-bold rounded-xl hover:from-gray-600 hover:to-gray-700 transition-all shadow-lg hover:shadow-xl hover:scale-[1.02]"
              >
                Bekor qilish
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal - Vazifalar Qo'shildi (Success) */}
      {showFixTasksSuccessModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-black rounded-3xl shadow-2xl max-w-md w-full border border-gray-700">
            {/* Header */}
            <div className="p-8 text-center">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full mb-6 shadow-xl">
                <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              
              <h3 className="text-2xl font-bold text-white mb-3">
                Vazifalar Qo'shildi!
              </h3>
              
              <p className="text-gray-300 text-base leading-relaxed mb-4">
                {fixedTasksCount} ta xodimga kunlik vazifalar qo'shildi
              </p>
              
              <div className="bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/20 rounded-xl p-4">
                <p className="text-green-400 text-sm font-semibold mb-1">✅ Natija:</p>
                <p className="text-gray-400 text-xs">
                  Endi barcha xodimlar kunlik vazifalarni bajarishi kerak. Bajarilmagan vazifalar uchun oylikdan 10% kamayadi.
                </p>
              </div>
            </div>

            {/* Footer */}
            <div className="px-8 pb-8">
              <button
                onClick={() => setShowFixTasksSuccessModal(false)}
                className="w-full px-6 py-3.5 bg-gradient-to-r from-green-500 to-emerald-600 text-white text-base font-bold rounded-xl hover:from-green-600 hover:to-emerald-700 transition-all shadow-lg hover:shadow-xl hover:scale-[1.02]"
              >
                Ajoyib!
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal - Hech qanday muammo yo'q */}
      {showNoIssuesModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-black rounded-3xl shadow-2xl max-w-md w-full border border-gray-700">
            {/* Header */}
            <div className="p-8 text-center">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full mb-6 shadow-xl">
                <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              
              <h3 className="text-2xl font-bold text-white mb-3">
                {currentBranch.name} says
              </h3>
              
              <p className="text-gray-300 text-base leading-relaxed">
                ✅ Hech qanday muammo topilmadi! Barcha xodimlarning oyligini to'g'ri hisoblanmoqda.
              </p>
            </div>

            {/* Footer */}
            <div className="px-8 pb-8">
              <button
                onClick={() => setShowNoIssuesModal(false)}
                className="w-full px-6 py-3.5 bg-gradient-to-r from-green-500 to-emerald-600 text-white text-base font-bold rounded-xl hover:from-green-600 hover:to-emerald-700 transition-all shadow-lg hover:shadow-xl hover:scale-[1.02]"
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}