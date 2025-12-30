import { useState, useEffect } from "react";
import { api, type Branch, type Employee } from "./api";

// O'zbek tilida sana formatlash funksiyasi
const formatUzbekDate = (dateString: string) => {
  const date = new Date(dateString);
  
  const months = [
    'yanvar', 'fevral', 'mart', 'aprel', 'may', 'iyun',
    'iyul', 'avgust', 'sentabr', 'oktabr', 'noyabr', 'dekabr'
  ];
  
  const weekdays = [
    'Yakshanba', 'Dushanba', 'Seshanba', 'Chorshanba', 
    'Payshanba', 'Juma', 'Shanba'
  ];
  
  const day = date.getDate();
  const month = months[date.getMonth()];
  const year = date.getFullYear();
  const weekday = weekdays[date.getDay()];
  
  return `${day}-${month}, ${year}, ${weekday}`;
};

// To'liq sana va vaqtni formatlash funksiyasi
const formatFullDateTime = () => {
  const now = new Date();
  
  const months = [
    'yanvar', 'fevral', 'mart', 'aprel', 'may', 'iyun',
    'iyul', 'avgust', 'sentabr', 'oktabr', 'noyabr', 'dekabr'
  ];
  
  const weekdays = [
    'Yakshanba', 'Dushanba', 'Seshanba', 'Chorshanba', 
    'Payshanba', 'Juma', 'Shanba'
  ];
  
  const day = now.getDate();
  const month = months[now.getMonth()];
  const year = now.getFullYear();
  const weekday = weekdays[now.getDay()];
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const seconds = String(now.getSeconds()).padStart(2, '0');
  
  return {
    date: `${day}-${month}, ${year}`,
    weekday: weekday,
    time: `${hours}:${minutes}:${seconds}`
  };
};

// Saqlangan vaqtni formatlash funksiyasi
const formatSavedTime = (dateString: string) => {
  const date = new Date(dateString);
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${hours}:${minutes}`;
};

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
  const [activeView, setActiveView] = useState<"branches" | "history" | "penalties" | "tasks" | "reports" | "plans" | "planHistory">("branches");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [userRole, setUserRole] = useState<'admin' | 'manager' | 'gijduvon_manager' | 'navoi_manager'>('admin');
  const [allowedBranchId, setAllowedBranchId] = useState<string | null>(null); // Manager uchun ruxsat berilgan filial
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showLoginSuccessNotification, setShowLoginSuccessNotification] = useState(false);
  const [showSuccessNotification, setShowSuccessNotification] = useState(false);
  const [successNotificationMessage, setSuccessNotificationMessage] = useState("");
  const [showErrorNotification, setShowErrorNotification] = useState(false);
  const [errorNotificationMessage, setErrorNotificationMessage] = useState("");
  const [showInfoNotification, setShowInfoNotification] = useState(false);
  const [infoNotificationMessage, setInfoNotificationMessage] = useState("");
  const [loginInput, setLoginInput] = useState("");
  const [passwordInput, setPasswordInput] = useState("");
  const [loginError, setLoginError] = useState("");
  const [showAddEmployee, setShowAddEmployee] = useState(false);
  
  // Hozirgi sana va vaqt uchun state
  const [currentDateTime, setCurrentDateTime] = useState(formatFullDateTime());
  const [showEditEmployee, setShowEditEmployee] = useState(false);
  const [showTasksModal, setShowTasksModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showSalesModal, setShowSalesModal] = useState(false);
  const [showBonusModal, setShowBonusModal] = useState(false);
  const [bonusInput, setBonusInput] = useState("");
  const [personalBonusInput, setPersonalBonusInput] = useState(""); // Shaxsiy bonus
  const [teamVolumeBonusInput, setTeamVolumeBonusInput] = useState(""); // O'zi qilgan savdodan 0.5%
  const [salesShareBonusInput, setSalesShareBonusInput] = useState(""); // Jami savdodan ulush bonusi
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
  const [showAllEmployees, setShowAllEmployees] = useState(false); // Barcha xodimlarni ko'rsatish

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
  
  // Oylik plan tarixi uchun state
  const [monthlyPlanHistory, setMonthlyPlanHistory] = useState<any[]>([]);
  const [selectedPlanBranch, setSelectedPlanBranch] = useState<string | null>(null);
  const [selectedPlanMonth, setSelectedPlanMonth] = useState<string>(new Date().toISOString().slice(0, 7));
  const [showPlanHistoryModal, setShowPlanHistoryModal] = useState(false);
  const [selectedPlanRecord, setSelectedPlanRecord] = useState<any | null>(null);

  // Hisobotlarni o'chirish uchun state
  const [showDeleteReportConfirm, setShowDeleteReportConfirm] = useState(false);
  const [reportToDelete, setReportToDelete] = useState<any | null>(null);
  const [deleteReportCode, setDeleteReportCode] = useState("");

  // Har bir filial uchun tanlangan sana
  const [selectedDates, setSelectedDates] = useState<Record<string, string>>({});

  // Tarixni tahrirlashni bloklash uchun state
  const [isHistoryLocked, setIsHistoryLocked] = useState(true); // Default: yoniq (bloklangan)

  // Tarix modalida tahrirlash uchun state
  const [editingHistoryEmployee, setEditingHistoryEmployee] = useState<any | null>(null);
  const [showEditHistoryModal, setShowEditHistoryModal] = useState(false);
  const [editHistorySalary, setEditHistorySalary] = useState("");
  
  // Tahrirlash uchun to'liq ma'lumotlar
  const [editHistoryRetailSales, setEditHistoryRetailSales] = useState("");
  const [editHistoryWholesaleSales, setEditHistoryWholesaleSales] = useState("");
  const [editHistoryPercentage, setEditHistoryPercentage] = useState("");
  const [editHistoryFixedBonus, setEditHistoryFixedBonus] = useState("");
  const [editHistoryPersonalBonus, setEditHistoryPersonalBonus] = useState("");
  
  // Xato va muvaffaqiyat modallari
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

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
        showErrorNotif(result.error || 'Lavozim qo\'shishda xato yuz berdi');
      }
    } catch (error) {
      showErrorNotif('Lavozim qo\'shishda xato yuz berdi');
    }
  };

  // Ma'lumotlarni yuklash
  useEffect(() => {
    loadBranches();
    // Bir martalik: eski savdo ma'lumotlarini yangilash
    migrateSales();
    // Sotuvchilarning fixedBonus'ini tozalash (har safar)
    clearSellerFixedBonus();
    
    // Avtomatik tarixga saqlash (har kuni 23:59 da)
    const autoSaveCleanup = checkAndAutoSave();
    
    // Hozirgi sana va vaqtni har soniyada yangilash
    const dateTimeInterval = setInterval(() => {
      setCurrentDateTime(formatFullDateTime());
    }, 1000);
    
    return () => {
      clearInterval(dateTimeInterval);
      if (autoSaveCleanup) autoSaveCleanup();
    };
  }, []);

  // Avtomatik tarixga saqlash funksiyasi
  const checkAndAutoSave = () => {
    let lastSavedDate = ''; // Oxirgi saqlangan sana
    
    const checkTime = () => {
      const now = new Date();
      const hours = now.getHours();
      const minutes = now.getMinutes();
      const today = now.toISOString().split('T')[0];
      
      // Agar soat 23:59 yoki 00:00 bo'lsa va bugun hali saqlanmagan bo'lsa
      if ((hours === 23 && minutes === 59) || (hours === 0 && minutes === 0)) {
        // Agar bugun allaqachon saqlanmagan bo'lsa
        if (lastSavedDate !== today) {
          lastSavedDate = today;
          // Barcha filiallar uchun tarixga saqlaymiz
          autoSaveAllBranches();
        }
      }
    };
    
    // Har daqiqada tekshiramiz
    const interval = setInterval(checkTime, 60000); // 60 soniya
    
    // Darhol bir marta tekshiramiz (agar sahifa 23:59 yoki 00:00 da ochildi bo'lsa)
    checkTime();
    
    // Component unmount bo'lganda interval'ni to'xtatamiz
    return () => clearInterval(interval);
  };

  const autoSaveAllBranches = async () => {
    try {
      const now = new Date();
      const hours = now.getHours();
      
      // Agar soat 00:00 bo'lsa, kechagi sanani saqlaymiz
      // Agar soat 23:59 bo'lsa, bugungi sanani saqlaymiz
      let dateToSave;
      if (hours === 0) {
        // Kechagi sana
        const yesterday = new Date(now);
        yesterday.setDate(yesterday.getDate() - 1);
        dateToSave = yesterday.toISOString().split('T')[0];
      } else {
        // Bugungi sana
        dateToSave = now.toISOString().split('T')[0];
      }
      
      let savedCount = 0;
      let errorCount = 0;
      
      // Barcha filiallar uchun tarixga saqlaymiz
      for (const branch of branches) {
        // Agar filialda xodimlar bo'lsa
        if (branch.employees.length > 0) {
          try {
            const result = await api.saveDailyHistory(branch._id, dateToSave);
            if (result.ok) {
              savedCount++;
            } else {
              errorCount++;
            }
          } catch (error) {
            errorCount++;
          }
        }
      }
      
      // Ma'lumotlarni qayta yuklaymiz
      if (savedCount > 0) {
        await loadBranches(true);
        showSuccessNotif(`${savedCount} ta filial tarixga avtomatik saqlandi! (${hours === 0 ? '00:00' : '23:59'})`);
      }
      
      if (errorCount > 0) {
        showErrorNotif(`${errorCount} ta filialda xatolik yuz berdi!`);
      }
    } catch (error) {
      // Umumiy xato
      showErrorNotif('Avtomatik saqlashda xatolik yuz berdi!');
    }
  };

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
    }
  };

  const clearSellerFixedBonus = async () => {
    try {
      const result = await api.clearSellerFixedBonus();
      if (result.ok && result.updatedSellers > 0) {
        // Ma'lumotlarni qayta yuklaymiz
        await loadBranches(false);
      }
    } catch (error) {
    }
  };

  // Notification ko'rsatish funksiyalari
  const showSuccessNotif = (message: string) => {
    setSuccessNotificationMessage(message);
    setShowSuccessNotification(true);
    setTimeout(() => {
      setShowSuccessNotification(false);
      setSuccessNotificationMessage("");
    }, 3000);
  };

  const showErrorNotif = (message: string) => {
    setErrorNotificationMessage(message);
    setShowErrorNotification(true);
    setTimeout(() => {
      setShowErrorNotification(false);
      setErrorNotificationMessage("");
    }, 3000);
  };

  const showInfoNotif = (message: string) => {
    setInfoNotificationMessage(message);
    setShowInfoNotification(true);
    setTimeout(() => {
      setShowInfoNotification(false);
      setInfoNotificationMessage("");
    }, 3000);
  };

  const handleLogin = async () => {
    try {
      setLoginError("");
      const result = await api.login(loginInput, passwordInput);
      
      if (result.ok) {
        setIsAuthenticated(true);
        setUserRole(result.role || 'admin'); // Role'ni saqlaymiz
        
        // Agar gijduvon_manager yoki navoi_manager bo'lsa, branchId'ni saqlaymiz
        if ((result.role === 'gijduvon_manager' || result.role === 'navoi_manager') && result.branchId) {
          setAllowedBranchId(result.branchId);
          localStorage.setItem('allowedBranchId', result.branchId);
          // "branches" sahifasida qolamiz (default), Hisobotlarga o'tmaymiz
        }
        
        setShowLoginModal(false);
        setLoginInput("");
        setPasswordInput("");
        // localStorage ga saqlaymiz
        localStorage.setItem('isAuthenticated', 'true');
        localStorage.setItem('userRole', result.role || 'admin');
        // Success notification ko'rsatamiz
        setShowLoginSuccessNotification(true);
        setTimeout(() => {
          setShowLoginSuccessNotification(false);
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
      setUserRole((role as 'admin' | 'manager' | 'gijduvon_manager' | 'navoi_manager') || 'admin');
      if (branchId) {
        setAllowedBranchId(branchId);
      }
      // G'ijduvon manager uchun "branches" sahifasida qolamiz (default)
      // Hisobotlarga o'tmaymiz
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
    }
  };

  // Oylik plan tarixini yuklash
  const loadMonthlyPlanHistory = async (branchId?: string) => {
    try {
      if (branchId) {
        // Bitta filial uchun
        const result = await api.getMonthlyPlanHistory(branchId, undefined, undefined, 12);
        if (result.ok) {
          setMonthlyPlanHistory(result.history);
        }
      } else {
        // Barcha filiallar uchun
        const result = await api.getAllMonthlyPlanHistory();
        if (result.ok) {
          setMonthlyPlanHistory(result.history);
        }
      }
    } catch (error) {
      setMonthlyPlanHistory([]);
    }
  };

  const loadBranches = async (showLoader = true) => {
    try {
      if (showLoader) setLoading(true);
      const data = await api.getBranches();
      // DEBUG: Xodimlarning dailyTasks qiymatlarini ko'ramiz
      data.forEach((branch: Branch) => {
        branch.employees.forEach((emp: Employee) => {
          if (emp.dailyTasks && Object.keys(emp.dailyTasks).length > 0) {
            const tasksStatus = Object.entries(emp.dailyTasks).map(([key, value]) => `${key}: ${value}`).join(', ');
          }
        });
      });
      
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
      // Agar server javob bermasa, bo'sh array qo'yamiz
      setBranches([]);
    } finally {
      if (showLoader) setLoading(false);
    }
  };

  // Filial menejerlari uchun faqat ruxsat berilgan filiallarni ko'rsatish
  const filteredBranches = (userRole === 'gijduvon_manager' || userRole === 'navoi_manager') && allowedBranchId
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
        showSuccessNotif(`${employeeData.name} muvaffaqiyatli qo'shildi!`);
      }
    } catch (error) {
      showErrorNotif("Xodim qo'shishda xato yuz berdi!");
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
    // Tanlangan sanani tekshiramiz
    const selectedDate = selectedDates[currentBranch._id] || new Date().toISOString().split('T')[0];
    const today = new Date().toISOString().split('T')[0];
    
    // Agar tanlangan sana bugungi kundan oldingi kun bo'lsa, tahrirlashga ruxsat bermaymiz
    if (selectedDate < today) {
      showErrorNotif('O\'tgan kunlar uchun ma\'lumot kiritish mumkin emas! Faqat bugungi kun uchun tahrirlash mumkin.');
      return;
    }
    
    setSelectedEmployee(employee);
    setDailySalesInput(employee.dailySales?.toString() || "");
    setWholesaleSalesInput(employee.wholesaleSales?.toString() || "");
    
    // Bonuslarni formatlab ko'rsatamiz
    if (employee.fixedBonus && employee.fixedBonus > 0) {
      setBonusInput(formatNumber(employee.fixedBonus));
    } else {
      setBonusInput("");
    }
    
    if (employee.personalBonus && employee.personalBonus > 0) {
      setPersonalBonusInput(formatNumber(employee.personalBonus));
    } else {
      setPersonalBonusInput("");
    }
    
    // O'zi qilgan savdodan 0.5% hisoblash (faqat chakana savdo)
    const employeeRetailSales = employee.dailySales || 0;
    const personalSalesBonus = (employeeRetailSales * 0.5) / 100;
    if (personalSalesBonus > 0) {
      setTeamVolumeBonusInput(formatNumber(Math.round(personalSalesBonus)));
    } else {
      setTeamVolumeBonusInput("");
    }
    
    // Jami savdodan ulush bonusini hisoblash (FAQAT CHAKANA SAVDO)
    if (currentBranch) {
      const retailSalesOnly = currentBranch.retailSales || 0; // Faqat chakana savdo
      const salesSharePercentage = 0.5; // 0.5%
      const totalShareBonus = (retailSalesOnly * salesSharePercentage) / 100;
      
      // Sotuvchilar sonini hisoblash
      const sellersCount = currentBranch.employees.filter(emp => emp.position === 'sotuvchi').length;
      
      if (sellersCount > 0) {
        const sharePerSeller = totalShareBonus / sellersCount;
        setSalesShareBonusInput(formatNumber(Math.round(sharePerSeller)));
      } else {
        setSalesShareBonusInput("");
      }
    } else {
      setSalesShareBonusInput("");
    }
    
    setShowSalesModal(true);
  };

  const openBonusModal = (employee: Employee) => {
    // Tanlangan sanani tekshiramiz
    const selectedDate = selectedDates[currentBranch._id] || new Date().toISOString().split('T')[0];
    const today = new Date().toISOString().split('T')[0];
    
    // Agar tanlangan sana bugungi kundan oldingi kun bo'lsa, tahrirlashga ruxsat bermaymiz
    if (selectedDate < today) {
      showErrorNotif('O\'tgan kunlar uchun ma\'lumot kiritish mumkin emas! Faqat bugungi kun uchun tahrirlash mumkin.');
      return;
    }
    
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
    const employeeName = selectedEmployee.name;
    const employeePosition = selectedEmployee.position;
    setBonusInput("");
    setSelectedEmployee(null);
    
    try {
      let fixedBonus = parseFloat(bonusValue.replace(/,/g, "")) || 0;
      
      // MUHIM: Sotuvchilar uchun fixedBonus har doim 0 bo'lishi kerak
      if (employeePosition === 'sotuvchi') {
        fixedBonus = 0;
      }
      
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
        name: employeeName,
        position: employeePosition,
        percentage: selectedEmployee.percentage,
        fixedBonus: fixedBonus
      });
      
      if (employeePosition === 'sotuvchi') {
        showSuccessNotif(`${employeeName} - Sotuvchilar uchun standart bonus 0 bo'lishi kerak!`);
      } else {
        showSuccessNotif(`${employeeName} bonusi saqlandi!`);
      }
    } catch (error) {
      showErrorNotif('Bonusni saqlashda xato yuz berdi!');
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
    const personalBonusValue = personalBonusInput;
    const teamVolumeBonusValue = teamVolumeBonusInput;
    const salesShareBonusValue = salesShareBonusInput;
    
    // Tanlangan sanani olamiz
    const selectedDate = selectedDates[currentBranch._id] || new Date().toISOString().split('T')[0];
    
    setDailySalesInput("");
    setWholesaleSalesInput("");
    setBonusInput("");
    setPersonalBonusInput("");
    setTeamVolumeBonusInput("");
    setSalesShareBonusInput("");
    
    try {
      const retailSales = parseFloat(retailValue.replace(/,/g, "")) || 0;
      const wholesaleSales = parseFloat(wholesaleValue.replace(/,/g, "")) || 0;
      let fixedBonus = parseFloat(bonusValue.replace(/,/g, "")) || 0;
      const personalBonus = parseFloat(personalBonusValue.replace(/,/g, "")) || 0;
      const teamVolumeBonus = parseFloat(teamVolumeBonusValue.replace(/,/g, "")) || 0;
      const salesShareBonus = parseFloat(salesShareBonusValue.replace(/,/g, "")) || 0;
      
      // MUHIM: Sotuvchilar uchun fixedBonus har doim 0 bo'lishi kerak
      if (employeePosition === 'sotuvchi') {
        fixedBonus = 0;
      }
      
      // Oylik chakana savdoni yangilaymiz (faqat sotuvchilar uchun)
      const currentMonthlyRetailSales = selectedEmployee.monthlyRetailSales || 0;
      const newMonthlyRetailSales = currentMonthlyRetailSales + retailSales;
      // Lokal state'ni darhol yangilaymiz
      setBranches(prevBranches => 
        prevBranches.map(branch => ({
          ...branch,
          employees: branch.employees.map(emp => 
            emp.id === employeeId 
              ? { ...emp, dailySales: retailSales, wholesaleSales: wholesaleSales, fixedBonus: fixedBonus, personalBonus: personalBonus, teamVolumeBonus: teamVolumeBonus, salesShareBonus: salesShareBonus, monthlyRetailSales: newMonthlyRetailSales, lastSalesDate: selectedDate }
              : emp
          )
        }))
      );
      
      // Background'da serverga saqlaymiz
      const updateData = {
        name: employeeName,
        position: employeePosition,
        percentage: employeePercentage,
        dailySales: retailSales,
        wholesaleSales: wholesaleSales,
        fixedBonus: fixedBonus,
        personalBonus: personalBonus,
        teamVolumeBonus: teamVolumeBonus,
        salesShareBonus: salesShareBonus,
        monthlyRetailSales: newMonthlyRetailSales,
        lastSalesDate: selectedDate
      };
      const result = await api.updateEmployee(employeeId, updateData);
      showSuccessNotif(`${employeeName} savdosi saqlandi!`);
      
      // Umumiy savdoni avtomatik yangilash (background'da)
      updateTotalSales();
    } catch (error) {
      showErrorNotif('Savdoni saqlashda xato yuz berdi!');
      // Xato bo'lsa, qayta yuklaymiz
      await loadBranches(false);
    }
  };

  const updateTotalSales = async () => {
    try {
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
      
      // MUHIM: loadBranches() ni chaqirmaymiz, chunki bu yangi kiritilgan bonuslarni
      // serverdan qayta yuklaydi va ular yo'qoladi
      // O'rniga, lokal state'ni yangilaymiz
      setBranches(prevBranches => 
        prevBranches.map((branch, index) => 
          index === activeBranch
            ? { ...branch, totalSales, retailSales, wholesaleSales }
            : branch
        )
      );
    } catch (error) {
    }
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
        return newBranches;
      });
      
      // Background'da serverga saqlaymiz
      await api.updateEmployeeTasks(employeeId, updatedTasks);
    } catch (error) {
      // Xato bo'lsa, qayta yuklaymiz
      await loadBranches(false);
    }
  };

  const updateEmployee = async () => {
    if (!editingEmployee || !editingEmployee.name || editingEmployee.percentage <= 0) return;
    
    // Modal'ni darhol yopamiz
    setShowEditEmployee(false);
    const employeeData = { ...editingEmployee };
    const employeeName = employeeData.name;
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
      
      showSuccessNotif(`${employeeName} tahrirlandi!`);
    } catch (error) {
      showErrorNotif("Xodimni tahrirlashda xato yuz berdi!");
      // Xato bo'lsa, qayta yuklaymiz
      await loadBranches(false);
    }
  };

  const deleteEmployee = async (employeeId: string) => {
    // Modal'ni darhol yopamiz
    setShowDeleteConfirm(false);
    
    // Xodim nomini topamiz
    const employee = branches.flatMap(b => b.employees).find(e => e.id === employeeId);
    const employeeName = employee?.name || "Xodim";
    
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
      
      showSuccessNotif(`${employeeName} o'chirildi!`);
    } catch (error) {
      showErrorNotif("Xodimni o'chirishda xato yuz berdi!");
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
      } else {
        // Oddiy filiallar uchun: FAQAT SHU FILIALDAGI SOTUVCHILARNING SAVDOSIDAN HISOBLASH
        // Filialdagi barcha sotuvchilarning jami savdosini hisoblaymiz
        const filialSotuvchilar = currentBranch.employees.filter(emp => emp.position === 'sotuvchi');
        
        // Jami chakana savdo (barcha sotuvchilardan)
        const totalRetailSales = filialSotuvchilar.reduce((sum, emp) => sum + (emp.dailySales || 0), 0);
        
        // Jami optom savdo (barcha sotuvchilardan)
        const totalWholesaleSales = filialSotuvchilar.reduce((sum, emp) => sum + (emp.wholesaleSales || 0), 0);
        
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
      
      // Vazifalar foizini qo'llash
      calculatedSalary = (baseSalary * taskPercentage) / 100;
    } else {
      calculatedSalary = baseSalary;
    }
    
    // Standart oylik (bonus) qo'shish
    // MUHIM: Sotuvchilar uchun fixedBonus qo'shilmaydi, faqat boshqa bonuslar
    if (employee.position === "sotuvchi") {
      return calculatedSalary + (employee.personalBonus || 0) + (employee.salesShareBonus || 0) + (employee.planBonus || 0);
    } else {
      // Sotuvchi bo'lmagan xodimlar uchun barcha bonuslar
      return calculatedSalary + (employee.fixedBonus || 0) + (employee.personalBonus || 0) + (employee.salesShareBonus || 0) + (employee.planBonus || 0);
    }
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
    
    const actualSalary = calculateSalary(employee) - (employee.fixedBonus || 0) - (employee.personalBonus || 0) - (employee.salesShareBonus || 0) - (employee.planBonus || 0); // Bonuslarni ayiramiz
    const penalty = baseSalary - actualSalary;
    
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
        <div className="h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex flex-col overflow-hidden">
          {/* Modern Navbar */}
          <nav className="w-full px-4 sm:px-6 lg:px-12 py-3 backdrop-blur-xl bg-gray-900/50 border-b border-gray-700/50">
            <div className="max-w-7xl mx-auto flex items-center justify-between">
              {/* Logo Section */}
              <div className="flex items-center gap-3 group">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-[#F87819] to-[#ff8c3a] rounded-xl blur-md opacity-50 group-hover:opacity-75 transition-opacity"></div>
                  <div className="relative w-10 h-10 rounded-xl bg-gradient-to-br from-[#F87819] to-[#ff8c3a] p-0.5 shadow-lg">
                    <div className="w-full h-full rounded-xl bg-white p-1.5">
                      <img 
                        src="/logo.png" 
                        alt="Logo" 
                        className="w-full h-full object-contain"
                      />
                    </div>
                  </div>
                </div>
                <div className="hidden sm:block">
                  <span className="text-lg font-bold text-white tracking-tight">Alibobo</span>
                  <p className="text-xs text-gray-400 -mt-0.5">Boshqaruv Tizimi</p>
                </div>
              </div>

              {/* Right Side - Actions */}
              <div className="flex items-center gap-3">
                {/* Login Button */}
                <button
                  onClick={() => setShowLoginModal(true)}
                  className="group relative px-5 py-2 rounded-xl text-sm font-bold transition-all overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-[#F87819] to-[#ff8c3a] transition-transform group-hover:scale-105"></div>
                  <div className="absolute inset-0 bg-gradient-to-r from-[#ff8c3a] to-[#F87819] opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  <span className="relative text-white flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                    </svg>
                    <span className="hidden sm:inline">Kirish</span>
                  </span>
                </button>
              </div>
            </div>
          </nav>

          {/* Hero Section - Horizontal Layout */}
          <div className="flex-1 flex items-center px-4 sm:px-6 lg:px-12 overflow-hidden">
            <div className="max-w-7xl mx-auto w-full h-full flex items-center">
              <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center w-full">
                
                {/* Left Side - Content */}
                <div className="text-center lg:text-left space-y-6">
                  {/* Badge */}
                  <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-[#F87819]/20 to-[#ff8c3a]/20 border border-[#F87819]/30">
                    <span className="w-2 h-2 rounded-full bg-[#F87819] animate-pulse"></span>
                    <span className="text-sm font-medium text-[#F87819]">Zamonaviy Boshqaruv Tizimi</span>
                  </div>

                  {/* Main Heading */}
                  <div className="space-y-3">
                    <h1 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold text-white leading-tight">
                      Oylik Hisoblash
                      <span className="block bg-gradient-to-r from-[#F87819] to-[#ff8c3a] bg-clip-text text-transparent">
                        Oson va Tez
                      </span>
                    </h1>
                    <p className="text-base sm:text-lg text-gray-400 max-w-xl mx-auto lg:mx-0">
                      Xodimlar, savdo va bonuslarni bir joyda boshqaring. Avtomatik hisoblash va real-time hisobotlar.
                    </p>
                  </div>

                  {/* CTA Buttons */}
                  <div className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start">
                    <button
                      onClick={() => setShowLoginModal(true)}
                      className="group px-6 py-3 rounded-xl text-sm font-bold transition-all bg-gradient-to-r from-[#F87819] to-[#ff8c3a] text-white hover:shadow-2xl hover:shadow-orange-500/50 hover:scale-105 flex items-center justify-center gap-2"
                    >
                      <span>Boshlash</span>
                      <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                      </svg>
                    </button>
                    <button
                      onClick={() => setShowLoginModal(true)}
                      className="px-6 py-3 rounded-xl text-sm font-bold transition-all bg-gray-800/50 text-white border-2 border-gray-700 hover:border-[#F87819] hover:bg-gray-800"
                    >
                      Demo Ko'rish
                    </button>
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-3 gap-4 pt-6 border-t border-gray-800">
                    <div>
                      <div className="text-2xl font-bold text-white mb-1">3+</div>
                      <div className="text-xs text-gray-400">Filiallar</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-white mb-1">50+</div>
                      <div className="text-xs text-gray-400">Xodimlar</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-white mb-1">24/7</div>
                      <div className="text-xs text-gray-400">Ishlaydi</div>
                    </div>
                  </div>
                </div>

                {/* Right Side - Logo Card Only (Larger) */}
                <div className="relative flex items-center justify-center">
                  {/* Decorative Elements */}
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-[#F87819]/10 rounded-full blur-3xl animate-pulse"></div>
                  
                  {/* Logo Card - Large and Centered */}
                  <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-br from-[#F87819] to-[#ff8c3a] rounded-[3rem] blur-2xl opacity-30 animate-pulse"></div>
                    <div className="relative bg-gradient-to-br from-gray-900 to-gray-800 rounded-[3rem] p-8 sm:p-10 lg:p-12 border-2 border-gray-700 shadow-2xl hover:shadow-orange-500/30 transition-all duration-500">
                      <div className="w-48 h-48 sm:w-56 sm:h-56 md:w-64 md:h-64 lg:w-80 lg:h-80 rounded-3xl bg-gradient-to-br from-[#F87819] to-[#ff8c3a] p-1.5 shadow-2xl">
                        <div className="w-full h-full rounded-3xl bg-white p-6 sm:p-8 flex items-center justify-center">
                          <img 
                            src="/logo.png" 
                            alt="Alibobo Logo" 
                            className="w-full h-full object-contain"
                          />
                        </div>
                      </div>
                      
                      {/* Logo Title */}
                      <div className="mt-6 text-center">
                        <h3 className="text-3xl sm:text-4xl font-bold text-white mb-2">Alibobo</h3>
                        <p className="text-base sm:text-lg text-gray-400">Qurilish Materiallari</p>
                      </div>
                    </div>
                  </div>
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
        {/* Header - Logo va Close button */}
        <div className="p-4 border-b border-gray-800 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#F87819] to-[#ff8c3a] p-0.5 shadow-lg">
                <img 
                  src="/logo.png" 
                  alt="Logo" 
                  className="w-full h-full rounded-xl object-cover bg-white"
                />
              </div>
              <div>
                <span className="text-sm font-bold text-white block leading-tight">Alibobo</span>
                <span className="text-xs text-gray-400 leading-tight">Oylik Tizimi</span>
              </div>
            </div>
            <button
              onClick={() => setIsMobileSidebarOpen(false)}
              className="lg:hidden text-gray-400 hover:text-white transition-colors"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
        
        {/* Hozirgi sana va vaqt - Minimalist */}
        <div className="px-4 pt-4 pb-3 border-b border-gray-800 flex-shrink-0">
          <div className="bg-gray-800/50 rounded-lg p-3 border border-gray-700/50">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-1.5">
                <svg className="w-3.5 h-3.5 text-[#F87819]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span className="text-xs font-medium text-gray-400">{currentDateTime.weekday}</span>
              </div>
              <span className="text-xs font-semibold text-white">{currentDateTime.date}</span>
            </div>
            <div className="flex items-center justify-center gap-2 pt-2 border-t border-gray-700/50">
              <svg className="w-4 h-4 text-[#F87819]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-xl font-mono font-bold text-white tracking-wider">{currentDateTime.time}</span>
            </div>
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
            <h2 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 px-3 "><hr /> </h2> 
            <div className="space-y-1">
              {/* Tarix - faqat admin va manager uchun */}
              {userRole !== 'gijduvon_manager' && userRole !== 'navoi_manager' && (
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
              {userRole !== 'gijduvon_manager' && userRole !== 'navoi_manager' && (
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

              {/* Oylik Plan - BARCHA UCHUN */}
              <button
                onClick={() => {
                  setActiveView("plans");
                  setIsMobileSidebarOpen(false);
                }}
                className={`w-full text-left px-4 py-3 rounded-xl text-sm font-semibold transition-all group ${
                  activeView === "plans"
                    ? "bg-gradient-to-r from-[#F87819] to-[#ff8c3a] text-white shadow-lg shadow-orange-500/30"
                    : "text-gray-300 hover:bg-gray-800/50 hover:text-white"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
                    activeView === "plans"
                      ? "bg-white/20"
                      : "bg-gray-800 group-hover:bg-gray-700"
                  }`}>
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                    </svg>
                  </div>
                  <span className="truncate">Oylik Plan</span>
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
             activeView === "reports" ? "Hisobotlar" :
             activeView === "plans" ? "Oylik Plan" :
             activeView === "planHistory" ? "Oylik Plan Tarixi" : "Kunlik Ishlar"}
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
            <div className="flex-1">
              <h1 className={`text-2xl font-semibold mb-1 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{currentBranch.name}</h1>
              <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Xodimlar va oylik ma'lumotlari</p>
              
              {/* Sana tanlagich */}
              <div className="mt-3 flex flex-col sm:flex-row items-start sm:items-center gap-2">
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-[#F87819]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <input
                    type="date"
                    value={selectedDates[currentBranch._id] || new Date().toISOString().split('T')[0]}
                    onChange={(e) => {
                      setSelectedDates(prev => ({
                        ...prev,
                        [currentBranch._id]: e.target.value
                      }));
                    }}
                    className={`px-3 py-1.5 rounded-lg border-2 text-sm font-medium transition-all ${
                      isDarkMode 
                        ? 'bg-gray-800 border-gray-700 text-white' 
                        : 'bg-white border-gray-200 text-gray-900'
                    }`}
                  />
                </div>
                <span className={`text-xs sm:text-sm font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  {formatUzbekDate(selectedDates[currentBranch._id] || new Date().toISOString().split('T')[0])}
                </span>
              </div>
            </div>
            {isAuthenticated && userRole === 'admin' && (
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3 w-full sm:w-auto">
                <button
                  onClick={() => setShowAddPosition(true)}
                  className={`px-4 sm:px-6 py-2.5 text-white text-sm font-bold rounded-lg transition-all shadow-lg flex items-center justify-center gap-2 ${
                    isDarkMode 
                      ? 'bg-gray-700 hover:bg-gray-600' 
                      : 'bg-gray-900 hover:bg-gray-800'
                  }`}
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Lavozim qo'shish
                </button>
                <button
                  onClick={() => setShowFixTasksModal(true)}
                  className="px-4 sm:px-6 py-2.5 bg-blue-600 text-white text-sm font-bold rounded-lg hover:bg-blue-700 transition-all shadow-lg flex items-center justify-center gap-2"
                  title="Vazifalar mavjudligini tekshirish va qo'shish"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Vazifalarni Tekshirish
                </button>
                <button
                  onClick={() => {
                    // Tanlangan sanani tekshiramiz
                    const selectedDate = selectedDates[currentBranch._id] || new Date().toISOString().split('T')[0];
                    const today = new Date().toISOString().split('T')[0];
                    
                    // Agar tanlangan sana bugungi kundan oldingi kun bo'lsa, tarixga saqlashga ruxsat bermaymiz
                    if (selectedDate < today) {
                      showErrorNotif('O\'tgan kunlar uchun tarixga saqlash mumkin emas! Faqat bugungi kun uchun saqlash mumkin.');
                      return;
                    }
                    
                    // Tekshirish: xodimlar bormi?
                    if (currentBranch.employees.length === 0) {
                      setShowSaveErrorModal(true);
                      return;
                    }
                    
                    // Tekshirish: savdo bormi?
                    // 1. Filial umumiy savdosi
                    const totalSales = currentBranch.totalSales || 0;
                    
                    // 2. Sotuvchilarning kunlik savdosi
                    const sotuvchilarSavdosi = currentBranch.employees
                      .filter(emp => emp.position === 'sotuvchi')
                      .reduce((sum, emp) => sum + (emp.dailySales || 0) + (emp.wholesaleSales || 0), 0);
                    
                    // Agar hech qanday savdo bo'lmasa
                    if (totalSales === 0 && sotuvchilarSavdosi === 0) {
                      setShowSaveErrorModal(true);
                      return;
                    }
                    
                    // Tasdiqlash modal oynasini ko'rsatamiz
                    setShowSaveConfirmModal(true);
                  }}
                  className="px-4 sm:px-6 py-2.5 bg-[#F87819] text-white text-sm font-bold rounded-lg hover:bg-[#e06d15] transition-all shadow-lg flex items-center justify-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                  </svg>
                  Tarixga saqlash
                </button>
              </div>
            )}
            {/* Filial menejerlari uchun tugmalar */}
            {isAuthenticated && (userRole === 'gijduvon_manager' || userRole === 'navoi_manager') && (
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3 w-full sm:w-auto">
                <button
                  onClick={() => setShowFixTasksModal(true)}
                  className="px-4 sm:px-6 py-2.5 bg-blue-600 text-white text-sm font-bold rounded-lg hover:bg-blue-700 transition-all shadow-lg flex items-center justify-center gap-2"
                  title="Vazifalar mavjudligini tekshirish va qo'shish"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Vazifalarni Tekshirish
                </button>
                <button
                  onClick={() => {
                    // Tanlangan sanani tekshiramiz
                    const selectedDate = selectedDates[currentBranch._id] || new Date().toISOString().split('T')[0];
                    const today = new Date().toISOString().split('T')[0];
                    
                    // Agar tanlangan sana bugungi kundan oldingi kun bo'lsa, tarixga saqlashga ruxsat bermaymiz
                    if (selectedDate < today) {
                      showErrorNotif('O\'tgan kunlar uchun tarixga saqlash mumkin emas! Faqat bugungi kun uchun saqlash mumkin.');
                      return;
                    }
                    
                    // Tekshirish: xodimlar bormi?
                    if (currentBranch.employees.length === 0) {
                      setShowSaveErrorModal(true);
                      return;
                    }
                    
                    // Tekshirish: savdo bormi?
                    // 1. Filial umumiy savdosi
                    const totalSales = currentBranch.totalSales || 0;
                    
                    // 2. Sotuvchilarning kunlik savdosi
                    const sotuvchilarSavdosi = currentBranch.employees
                      .filter(emp => emp.position === 'sotuvchi')
                      .reduce((sum, emp) => sum + (emp.dailySales || 0) + (emp.wholesaleSales || 0), 0);
                    
                    // Agar hech qanday savdo bo'lmasa
                    if (totalSales === 0 && sotuvchilarSavdosi === 0) {
                      setShowSaveErrorModal(true);
                      return;
                    }
                    
                    // Tasdiqlash modal oynasini ko'rsatamiz
                    setShowSaveConfirmModal(true);
                  }}
                  className="px-4 sm:px-6 py-2.5 bg-[#F87819] text-white text-sm font-bold rounded-lg hover:bg-[#e06d15] transition-all shadow-lg flex items-center justify-center gap-2"
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
          {/* 3ta asosiy card - tartibli joylashtirilgan */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 mb-6">
            
            <div className={`rounded-xl border-2 p-6 shadow-lg ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-900'}`}>
              <p className={`text-sm font-semibold mb-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Umumiy Savdo</p>
              <p className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                {formatMoney(currentBranch.totalSales || 0)}
              </p>
              {currentBranch.name === "Asosiy Sklad" && (
                <p className={`text-xs mt-3 ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>Filiallar yig'indisi</p>
              )}
            </div>
            
            <div className={`rounded-xl border-2 border-green-500 p-6 shadow-lg ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
              <p className="text-sm text-green-600 font-semibold mb-2">Chakana Savdo</p>
              <p className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                {formatMoney(currentBranch.retailSales || 0)}
              </p>
              {currentBranch.name === "Asosiy Sklad" && (
                <p className={`text-xs mt-3 ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>Filiallar yig'indisi</p>
              )}
            </div>
            
            <div className={`rounded-xl border-2 border-blue-500 p-6 shadow-lg ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
              <p className="text-sm text-blue-600 font-semibold mb-2">Optom Savdo</p>
              <p className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                {formatMoney(currentBranch.wholesaleSales || 0)}
              </p>
              {currentBranch.name === "Asosiy Sklad" && (
                <p className={`text-xs mt-3 ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>Filiallar yig'indisi</p>
              )}
            </div>
          </div>

          {/* Employees Section */}
          <div className={`rounded-xl border shadow-sm overflow-hidden ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
            <div className={`px-6 py-4 border-b flex items-center justify-between ${isDarkMode ? 'bg-gray-900 border-gray-700' : 'bg-gray-900 border-gray-800'}`}>
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
                <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full mb-4 ${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
                  <svg className={`w-8 h-8 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <p className={`text-base font-medium mb-1 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Hozircha xodimlar yo'q</p>
                <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Yuqoridagi tugma orqali xodim qo'shing</p>
              </div>
            ) : (
              <>
                {/* Desktop Table View */}
                <div className="hidden lg:block overflow-x-auto">
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
                    {currentBranch.employees
                      .sort((a, b) => {
                        // Asosiy Sklad uchun alohida tartib
                        if (currentBranch.name === "Asosiy Sklad") {
                          const positionOrder: Record<string, number> = {
                            'taminotchi': 1,
                            'manager': 2,
                            'shofir': 3,
                            'ishchi': 4,
                            'sotuvchi': 5,
                            'kassir': 6
                          };
                          
                          const orderA = positionOrder[a.position] || 999;
                          const orderB = positionOrder[b.position] || 999;
                          
                          return orderA - orderB;
                        }
                        
                        // Boshqa filiallar uchun: Manager → Kassir → Shofir → Ishchi → Sotuvchi → Ta'minotchi
                        const positionOrder: Record<string, number> = {
                          'manager': 1,
                          'kassir': 2,
                          'shofir': 3,
                          'ishchi': 4,
                          'sotuvchi': 5,
                          'taminotchi': 6
                        };
                        
                        const orderA = positionOrder[a.position] || 999;
                        const orderB = positionOrder[b.position] || 999;
                        
                        return orderA - orderB;
                      })
                      .map((employee) => (
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
                          ) : (userRole === 'gijduvon_manager' || userRole === 'navoi_manager') ? (
                            // Filial menejerlari uchun faqat 2ta tugma
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

              {/* Mobile Card View */}
              <div className="lg:hidden p-4 space-y-4">
                {currentBranch.employees
                  .sort((a, b) => {
                    // Lavozimlar tartibi: Manager → Kassir → Shofir → Ishchi → Sotuvchi → Ta'minotchi
                    const positionOrder: Record<string, number> = {
                      'manager': 1,
                      'kassir': 2,
                      'shofir': 3,
                      'ishchi': 4,
                      'sotuvchi': 5,
                      'taminotchi': 6
                    };
                    
                    const orderA = positionOrder[a.position] || 999;
                    const orderB = positionOrder[b.position] || 999;
                    
                    return orderA - orderB;
                  })
                  .map((employee) => (
                  <div 
                    key={`${employee.id}-mobile-${JSON.stringify(employee.dailyTasks)}`}
                    className={`rounded-xl border-2 shadow-lg overflow-hidden transition-all hover:shadow-xl ${
                      isDarkMode 
                        ? 'bg-gray-800 border-gray-700' 
                        : 'bg-white border-gray-200'
                    }`}
                  >
                    {/* Card Header */}
                    <div className={`px-4 py-3 border-b ${
                      isDarkMode ? 'bg-gray-900 border-gray-700' : 'bg-gray-50 border-gray-200'
                    }`}>
                      <div className="flex items-center gap-3">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-white text-lg font-bold shadow-md ${
                          isDarkMode ? 'bg-gray-600' : 'bg-gray-900'
                        }`}>
                          {employee.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <h3 className={`text-base font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                            {employee.name}
                          </h3>
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-bold uppercase mt-1 ${positionColors[employee.position] || 'bg-gray-200 text-gray-800'}`}>
                            {positions.find(p => p.id === employee.position)?.name || employee.position}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Card Body */}
                    <div className="p-4 space-y-3">
                      {/* Foiz */}
                      <div className="flex items-center justify-between">
                        <span className={`text-sm font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Foiz:</span>
                        <span className={`text-sm font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{employee.percentage}%</span>
                      </div>

                      {/* Chakana Savdo - faqat sotuvchilar uchun */}
                      {employee.position === "sotuvchi" && (
                        <div className="flex items-center justify-between">
                          <span className={`text-sm font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Chakana Savdo:</span>
                          <span className="text-sm font-bold text-green-600">
                            {employee.dailySales ? formatMoney(employee.dailySales) : "0 so'm"}
                          </span>
                        </div>
                      )}

                      {/* Optom Savdo - faqat sotuvchilar uchun */}
                      {employee.position === "sotuvchi" && (
                        <div className="flex items-center justify-between">
                          <span className={`text-sm font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Optom Savdo:</span>
                          <span className="text-sm font-bold text-blue-600">
                            {employee.wholesaleSales ? formatMoney(employee.wholesaleSales) : "0 so'm"}
                          </span>
                        </div>
                      )}

                      {/* Oylik */}
                      <div className={`flex items-center justify-between pt-3 border-t ${
                        isDarkMode ? 'border-gray-700' : 'border-gray-200'
                      }`}>
                        <span className={`text-sm font-semibold ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Oylik:</span>
                        <span className="text-lg font-bold text-green-600">{formatMoney(calculateSalary(employee))}</span>
                      </div>
                    </div>

                    {/* Card Actions */}
                    {(isAuthenticated && (userRole === 'admin' || userRole === 'gijduvon_manager' || userRole === 'navoi_manager')) && (
                      <div className={`px-4 py-3 border-t flex items-center justify-center gap-3 ${
                        isDarkMode ? 'bg-gray-900 border-gray-700' : 'bg-gray-50 border-gray-200'
                      }`}>
                        {userRole === 'admin' ? (
                          <>
                            {employee.position === "sotuvchi" && (
                              <button
                                onClick={() => openSalesModal(employee)}
                                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-gradient-to-br from-green-50 to-emerald-50 hover:from-green-100 hover:to-emerald-100 border-2 border-green-200 hover:border-green-300 transition-all"
                              >
                                <svg className="w-5 h-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <span className="text-sm font-bold text-green-700">Savdo</span>
                              </button>
                            )}
                            <button
                              onClick={() => openTasksModal(employee)}
                              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-gradient-to-br from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100 border-2 border-blue-200 hover:border-blue-300 transition-all"
                            >
                              <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                              </svg>
                              <span className="text-sm font-bold text-blue-700">Vazifalar</span>
                            </button>
                            <button
                              onClick={() => openEditEmployee(employee)}
                              className="p-2.5 rounded-lg bg-gradient-to-br from-orange-50 to-amber-50 hover:from-orange-100 hover:to-amber-100 border-2 border-orange-200 hover:border-orange-300 transition-all"
                            >
                              <svg className="w-5 h-5 text-[#F87819]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                            </button>
                            <button
                              onClick={() => confirmDelete(employee.id)}
                              className="p-2.5 rounded-lg bg-gradient-to-br from-red-50 to-rose-50 hover:from-red-100 hover:to-rose-100 border-2 border-red-200 hover:border-red-300 transition-all"
                            >
                              <svg className="w-5 h-5 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          </>
                        ) : (userRole === 'gijduvon_manager' || userRole === 'navoi_manager') ? (
                          <>
                            <button
                              onClick={() => openTasksModal(employee)}
                              className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-gradient-to-br from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100 border-2 border-blue-200 hover:border-blue-300 transition-all shadow-md hover:shadow-lg"
                            >
                              <svg className="w-6 h-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                              </svg>
                              <span className="text-sm font-bold text-blue-700">Kunlik Ishlar</span>
                            </button>
                            {employee.position === "sotuvchi" && (
                              <button
                                onClick={() => openSalesModal(employee)}
                                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-gradient-to-br from-green-50 to-emerald-50 hover:from-green-100 hover:to-emerald-100 border-2 border-green-200 hover:border-green-300 transition-all shadow-md hover:shadow-lg"
                              >
                                <svg className="w-6 h-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <span className="text-sm font-bold text-green-700">Kunlik Savdo</span>
                              </button>
                            )}
                          </>
                        ) : null}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </>
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
            <div className="mb-8 flex items-center justify-between">
              <div>
                <h1 className={`text-2xl font-semibold mb-1 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Savdo Tarixi</h1>
                <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Barcha filiallar - Oxirgi 30 kun</p>
              </div>
              
              <div className="flex items-center gap-4">
                {/* Tarixni tahrirlash toggle */}
                {isAuthenticated && userRole === 'admin' && (
                  <div className={`flex items-center gap-3 px-4 py-2 rounded-xl ${isDarkMode ? 'bg-gray-800' : 'bg-gray-100'}`}>
                    <span className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Tarixni tahrirlash
                    </span>
                    <button
                      onClick={() => setIsHistoryLocked(!isHistoryLocked)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        isHistoryLocked ? 'bg-green-500' : 'bg-red-500'
                      }`}
                      title={isHistoryLocked ? "Tahrirlash mumkin emas (Yoniq)" : "Tahrirlash mumkin (O'chiq)"}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          isHistoryLocked ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                    <span className={`text-xs font-semibold ${isHistoryLocked ? 'text-green-500' : 'text-red-500'}`}>
                      {isHistoryLocked ? 'Yoniq' : 'O\'chiq'}
                    </span>
                  </div>
                )}
                
                {/* Oylik Plan Tarixi tugmasi */}
                <button
                  onClick={() => {
                    setActiveView("planHistory");
                    loadMonthlyPlanHistory();
                  }}
                  className="px-6 py-3 bg-gradient-to-r from-[#F87819] to-[#ff8c3a] text-white rounded-xl font-semibold hover:shadow-lg hover:shadow-orange-500/30 transition-all flex items-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Oylik Plan Tarixi
                </button>
              </div>
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
                          if (isHistoryLocked) {
                            showErrorNotif("Tarix himoyalangan! Tahrirlash uchun himoyani o'chiring.");
                            return;
                          }
                          record.employees.forEach((emp: any) => {
                          });
                          setSelectedHistoryRecord(record);
                          setShowHistoryModal(true);
                        }}
                      >
                        <div className="mb-4">
                          <div className="flex items-center justify-between mb-2">
                            <h3 className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                              {formatUzbekDate(record.date)}
                            </h3>
                            <svg className={`w-5 h-5 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                          </div>
                          <p className="text-sm font-bold text-[#F87819]">
                            {branch?.name || 'Filial'}
                          </p>
                          {/* Saqlangan vaqt */}
                          {record.createdAt && (
                            <div className="flex items-center gap-1 mt-2">
                              <svg className="w-3.5 h-3.5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              <span className={`text-xs font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                Saqlangan: {formatSavedTime(record.createdAt)}
                              </span>
                            </div>
                          )}
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
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2 sm:gap-3">
                {['ishchi', 'manager', 'kassir', 'shofir', 'sotuvchi', 'taminotchi'].map((pos) => (
                  <button
                    key={pos}
                    onClick={() => {
                      setSelectedPosition(pos);
                      loadTaskTemplates(pos);
                    }}
                    className={`px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg text-xs sm:text-sm font-bold uppercase transition-all ${
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
              <div className="px-4 sm:px-6 py-3 sm:py-4 bg-gray-900 border-b border-gray-800">
                <h2 className="text-base sm:text-lg font-bold text-white">{selectedPosition.toUpperCase()} uchun kunlik ishlar</h2>
              </div>

              {taskTemplates.length === 0 ? (
                <div className="p-8 sm:p-12 text-center">
                  <div className={`inline-flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 rounded-full mb-3 sm:mb-4 ${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
                    <svg className={`w-6 h-6 sm:w-8 sm:h-8 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                    </svg>
                  </div>
                  <p className={`text-sm sm:text-base font-medium mb-1 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Hozircha ishlar yo'q</p>
                  <p className={`text-xs sm:text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Yuqoridagi tugma orqali kunlik ish qo'shing</p>
                </div>
              ) : (
                <div className={`divide-y ${isDarkMode ? 'divide-gray-700' : 'divide-gray-200'}`}>
                  {taskTemplates.map((task, index) => (
                    <div key={task._id} className={`p-4 sm:p-6 transition-colors ${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'}`}>
                      <div className="flex items-start gap-3 sm:gap-4">
                        <div className="flex-shrink-0 w-8 h-8 sm:w-10 sm:h-10 bg-gray-900 text-white rounded-lg flex items-center justify-center font-bold text-sm sm:text-base">
                          {index + 1}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <h3 className={`text-sm sm:text-base font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{task.taskName}</h3>
                          {task.description && (
                            <p className={`text-xs sm:text-sm mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>{task.description}</p>
                          )}
                        </div>

                        {isAuthenticated && userRole === 'admin' && (
                          <div className="flex flex-col sm:flex-row items-end sm:items-center gap-1 sm:gap-2">
                            <button
                              onClick={() => {
                                setEditingTask(task);
                                setNewTaskName(task.taskName);
                                setShowEditTaskModal(true);
                              }}
                              className="px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-medium text-[#F87819] hover:bg-orange-50 rounded-lg transition-colors whitespace-nowrap"
                            >
                              Tahrirlash
                            </button>
                            <button
                              onClick={() => {
                                setTaskToDelete(task);
                                setShowDeleteTaskConfirm(true);
                              }}
                              className="px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors whitespace-nowrap"
                            >
                              O'chirish
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Tushuntirish */}
            <div className="mt-6 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border-2 border-blue-200 p-4 sm:p-6">
              <div className="flex items-start gap-3 sm:gap-4">
                <div className="flex-shrink-0 w-8 h-8 sm:w-10 sm:h-10 bg-blue-500 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-xs sm:text-sm font-bold text-gray-900 mb-2">Qanday ishlaydi:</h3>
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

        {/* Oylik Plan Tarixi Sahifasi */}
        {activeView === "planHistory" && (
          <div className="w-full mx-auto p-4 md:p-6 lg:p-8 max-w-[1920px]">
            {/* Header */}
            <div className="mb-8 flex items-center justify-between">
              <div>
                <h1 className={`text-2xl font-semibold mb-1 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Oylik Plan Tarixi</h1>
                <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Sotuvchilarning oylik plan bajarilishi tarixi</p>
              </div>
              
              {/* Orqaga qaytish tugmasi */}
              <button
                onClick={() => setActiveView("history")}
                className={`px-4 py-2 rounded-xl font-semibold transition-all flex items-center gap-2 ${
                  isDarkMode 
                    ? 'bg-gray-800 text-white hover:bg-gray-700' 
                    : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                }`}
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Orqaga
              </button>
            </div>

            {/* Filiallarni tanlash */}
            <div className="mb-8">
              <h2 className={`text-lg font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Filialni tanlang</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {branches
                  .filter(b => b.name !== "Asosiy Sklad")
                  .map((branch) => (
                    <button
                      key={branch._id}
                      onClick={() => {
                        setSelectedPlanBranch(branch._id);
                        loadMonthlyPlanHistory(branch._id);
                      }}
                      className={`rounded-xl border-2 p-6 text-left transition-all ${
                        selectedPlanBranch === branch._id
                          ? 'border-[#F87819] bg-gradient-to-br from-orange-50 to-red-50 shadow-lg'
                          : isDarkMode
                            ? 'border-gray-700 bg-gray-800 hover:border-gray-600'
                            : 'border-gray-200 bg-white hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <h3 className={`text-lg font-bold ${
                          selectedPlanBranch === branch._id 
                            ? 'text-[#F87819]' 
                            : isDarkMode ? 'text-white' : 'text-gray-900'
                        }`}>
                          {branch.name}
                        </h3>
                        {selectedPlanBranch === branch._id && (
                          <svg className="w-6 h-6 text-[#F87819]" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                        )}
                      </div>
                      <p className={`text-sm ${
                        selectedPlanBranch === branch._id 
                          ? 'text-orange-700' 
                          : isDarkMode ? 'text-gray-400' : 'text-gray-500'
                      }`}>
                        {branch.employees.filter(e => e.position === 'sotuvchi').length} sotuvchi
                      </p>
                    </button>
                  ))}
              </div>
            </div>

            {/* Tarix yozuvlari */}
            {selectedPlanBranch && (
              <div>
                <h2 className={`text-lg font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  Tarix ({monthlyPlanHistory.length} oy)
                </h2>
                
                {monthlyPlanHistory.length === 0 ? (
                  <div className={`rounded-lg border p-12 text-center ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
                    <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full mb-4 ${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
                      <svg className={`w-8 h-8 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <p className={`text-base font-medium mb-1 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Tarix topilmadi</p>
                    <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Hali oylik plan tarixi saqlanmagan</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {monthlyPlanHistory.map((record) => {
                      const completedCount = record.sellers.filter((s: any) => s.planCompleted).length;
                      const totalBonus = record.sellers.reduce((sum: number, s: any) => sum + (s.planBonus || 0), 0);
                      
                      return (
                        <div 
                          key={record._id} 
                          onClick={() => {
                            setSelectedPlanRecord(record);
                            setShowPlanHistoryModal(true);
                          }}
                          className={`rounded-xl border-2 p-6 hover:shadow-xl transition-all cursor-pointer ${
                            isDarkMode 
                              ? 'bg-gray-800 border-gray-700 hover:border-[#F87819]' 
                              : 'bg-white border-gray-200 hover:border-gray-900'
                          }`}
                        >
                          <div className="mb-4">
                            <div className="flex items-center justify-between mb-2">
                              <h3 className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                {new Date(record.month + '-01').toLocaleDateString('uz-UZ', { 
                                  year: 'numeric', 
                                  month: 'long'
                                })}
                              </h3>
                              <svg className={`w-5 h-5 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                              </svg>
                            </div>
                          </div>

                          <div className="space-y-3">
                            <div className={`rounded-lg p-3 border ${isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'}`}>
                              <p className={`text-xs font-semibold ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Plan bajarganlar</p>
                              <p className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                {completedCount} / {record.sellers.length}
                              </p>
                            </div>

                            <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg p-3 border-2 border-green-500">
                              <p className="text-xs text-green-700 font-semibold">Jami bonus</p>
                              <p className="text-lg font-bold text-green-700">
                                {formatMoney(totalBonus)}
                              </p>
                            </div>
                          </div>

                          <div className={`pt-3 mt-3 border-t flex items-center justify-between ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                            <p className={`text-xs font-semibold ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                              {record.sellers.length} sotuvchi
                            </p>
                            {isAuthenticated && userRole === 'admin' && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  if (confirm('Ushbu oylik plan tarixini o\'chirmoqchimisiz?')) {
                                    api.deleteMonthlyPlanHistory(record._id).then(() => {
                                      loadMonthlyPlanHistory(selectedPlanBranch);
                                    });
                                  }
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
                  <div
                    key={branch._id}
                    onClick={() => {
                      setActiveBranch(index);
                      setSelectedEmployee(null);
                      loadMonthlyReports(branch._id, selectedMonth);
                    }}
                    className={`p-6 rounded-xl border-2 transition-all text-left cursor-pointer relative ${
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
                      <div className="flex items-center gap-2">
                        {/* O'chirish tugmasi */}
                        {currentBranch._id === branch._id && isAuthenticated && userRole === 'admin' && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setReportToDelete({ branchId: branch._id, branchName: branch.name, month: selectedMonth });
                              setShowDeleteReportConfirm(true);
                            }}
                            className="w-10 h-10 bg-red-50 text-red-600 rounded-lg hover:bg-red-600 hover:text-white transition-colors flex items-center justify-center"
                            title="Hisobotlarni o'chirish"
                          >
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        )}
                        {currentBranch._id === branch._id && (
                          <div className="w-6 h-6 bg-[#F87819] rounded-full flex items-center justify-center">
                            <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                            </svg>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Step 2: Xodim va Oy tanlash */}
            <div className="mb-8 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className={`block text-sm font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>2. Xodimni tanlang</label>
                <div className="flex gap-3">
                  <select
                    value={selectedEmployee?.id || ""}
                    onChange={(e) => {
                      const emp = currentBranch.employees.find(emp => emp.id === e.target.value);
                      setSelectedEmployee(emp || null);
                      setShowAllEmployees(false);
                    }}
                    className={`flex-1 px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#F87819] focus:border-[#F87819] font-medium ${
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
                  <button
                    onClick={() => {
                      setShowAllEmployees(true);
                      setSelectedEmployee(null);
                    }}
                    className={`px-6 py-3 rounded-xl font-bold transition-all whitespace-nowrap ${
                      showAllEmployees
                        ? 'bg-gradient-to-r from-[#F87819] to-[#ff8c3a] text-white shadow-lg'
                        : isDarkMode
                        ? 'bg-gray-700 text-white hover:bg-gray-600'
                        : 'bg-gray-200 text-gray-900 hover:bg-gray-300'
                    }`}
                  >
                    Barchasi
                  </button>
                </div>
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

            {/* Step 3: Xodim hisoboti yoki Barcha xodimlar hisoboti */}
            {showAllEmployees && monthlyReports.length > 0 ? (() => {
              // Barcha xodimlarning ma'lumotlarini yig'ish
              const allEmployeesData = currentBranch.employees.map(employee => {
                const employeeData = {
                  id: employee.id,
                  name: employee.name,
                  position: employee.position,
                  totalSalary: 0,
                  totalRetailSales: 0,
                  totalWholesaleSales: 0,
                  totalPenalty: 0,
                  daysWorked: 0
                };

                monthlyReports.forEach(record => {
                  const empRecord = record.employees.find((e: any) => e.employeeId === employee.id);
                  if (empRecord) {
                    employeeData.totalSalary += empRecord.salary || 0;
                    employeeData.totalRetailSales += empRecord.dailySales || 0;
                    employeeData.totalWholesaleSales += empRecord.wholesaleSales || 0;
                    employeeData.totalPenalty += empRecord.penaltyAmount || 0;
                    employeeData.daysWorked += 1;
                  }
                });

                return employeeData;
              });

              return (
                <div className={`rounded-xl border-2 overflow-hidden ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
                  <div className="px-6 py-4 bg-gradient-to-r from-[#F87819] to-[#ff8c3a]">
                    <h2 className="text-xl font-bold text-white">Barcha xodimlar hisoboti</h2>
                    <p className="text-sm text-white/80 mt-1">{currentBranch.name} - {selectedMonth}</p>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className={`border-b ${isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-100 border-gray-200'}`}>
                        <tr>
                          <th className={`px-6 py-3 text-left text-xs font-bold uppercase ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Xodim</th>
                          <th className={`px-6 py-3 text-left text-xs font-bold uppercase ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Lavozim</th>
                          <th className={`px-6 py-3 text-right text-xs font-bold uppercase ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Kunlar</th>
                          <th className={`px-6 py-3 text-right text-xs font-bold uppercase ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Chakana</th>
                          <th className={`px-6 py-3 text-right text-xs font-bold uppercase ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Optom</th>
                          <th className={`px-6 py-3 text-right text-xs font-bold uppercase ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Jami Oylik</th>
                          <th className={`px-6 py-3 text-right text-xs font-bold uppercase ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Jarima</th>
                        </tr>
                      </thead>
                      <tbody className={`divide-y ${isDarkMode ? 'divide-gray-700' : 'divide-gray-200'}`}>
                        {allEmployeesData.map((empData) => (
                          <tr key={empData.id} className={`transition-colors ${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'}`}>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`text-sm font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{empData.name}</span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-bold ${positionColors[empData.position] || 'bg-gray-200 text-gray-800'}`}>
                                {positions.find(p => p.id === empData.position)?.name || empData.position}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right">
                              <span className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>{empData.daysWorked}</span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right">
                              <span className="text-sm font-bold text-green-600">{formatMoney(empData.totalRetailSales)}</span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right">
                              <span className="text-sm font-bold text-blue-600">{formatMoney(empData.totalWholesaleSales)}</span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right">
                              <span className={`text-sm font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{formatMoney(empData.totalSalary)}</span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right">
                              <span className="text-sm font-bold text-red-600">{formatMoney(empData.totalPenalty)}</span>
                            </td>
                          </tr>
                        ))}
                        <tr className={`font-bold ${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
                          <td colSpan={3} className="px-6 py-4 text-right">
                            <span className={`text-sm font-bold uppercase ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>JAMI:</span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right">
                            <span className="text-sm font-bold text-green-600">{formatMoney(allEmployeesData.reduce((sum, emp) => sum + emp.totalRetailSales, 0))}</span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right">
                            <span className="text-sm font-bold text-blue-600">{formatMoney(allEmployeesData.reduce((sum, emp) => sum + emp.totalWholesaleSales, 0))}</span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right">
                            <span className={`text-sm font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{formatMoney(allEmployeesData.reduce((sum, emp) => sum + emp.totalSalary, 0))}</span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right">
                            <span className="text-sm font-bold text-red-600">{formatMoney(allEmployeesData.reduce((sum, emp) => sum + emp.totalPenalty, 0))}</span>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              );
            })() : selectedEmployee && monthlyReports.length > 0 ? (() => {
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
                                  {formatUzbekDate(record.date)}
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

        {/* Oylik Plan Sahifasi */}
        {activeView === "plans" && (
          <div className="w-full mx-auto p-4 md:p-6 lg:p-8 max-w-[1920px]">
            {/* Header */}
            <div className="mb-8 flex items-center justify-between">
              <div>
                <h1 className={`text-3xl font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  Oylik Plan
                </h1>
                <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  Sotuvchilar uchun oylik plan va bonuslar
                </p>
              </div>
              
              {/* Qo'lda saqlash tugmasi (Admin uchun) */}
              {isAuthenticated && userRole === 'admin' && (
                <button
                  onClick={async () => {
                    if (confirm('Oylik planni hozir tarixga saqlashni xohlaysizmi?\n\nDiqqat: Bu amal faqat test uchun. Tizim avtomatik ravishda har oyning oxirgi kunida saqlaydi.')) {
                      try {
                        const response = await fetch('/api/monthly-plan/auto-save-now', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' }
                        });
                        const result = await response.json();
                        if (result.ok) {
                          showSuccessNotif('Oylik plan tarixga saqlandi!');
                          await loadBranches();
                        } else {
                          showErrorNotif('Xato: ' + result.error);
                        }
                      } catch (error) {
                        showErrorNotif('Xato yuz berdi: ' + (error as Error).message);
                      }
                    }
                  }}
                  className="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl font-semibold hover:shadow-lg hover:shadow-green-500/30 transition-all flex items-center gap-2"
                  title="Oylik planni qo'lda tarixga saqlash (test uchun)"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                  </svg>
                  Tarixga Saqlash
                </button>
              )}
            </div>

            {/* Filiallar tanlash */}
            <div className="mb-8">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredBranches.map((branch, index) => {
                  const sellersCount = branch.employees.filter(emp => emp.position === 'sotuvchi').length;
                  const completedPlans = branch.employees
                    .filter(emp => emp.position === 'sotuvchi')
                    .filter(emp => (emp.monthlyRetailSales || 0) >= (emp.monthlyPlan || 500000000))
                    .length;
                  
                  return (
                    <button
                      key={branch._id}
                      onClick={() => setActiveBranch(index)}
                      className={`p-6 rounded-xl border-2 transition-all text-left ${
                        activeBranch === index
                          ? 'border-[#F87819] bg-gradient-to-br from-orange-50 to-yellow-50 shadow-lg scale-105'
                          : isDarkMode
                          ? 'border-gray-700 bg-gray-800 hover:border-gray-600 hover:shadow-md'
                          : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-md'
                      }`}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className={`text-lg font-bold mb-1 ${
                            activeBranch === index 
                              ? 'text-[#F87819]' 
                              : isDarkMode ? 'text-white' : 'text-gray-900'
                          }`}>
                            {branch.name}
                          </h3>
                          <p className={`text-sm ${
                            activeBranch === index 
                              ? 'text-orange-600' 
                              : isDarkMode ? 'text-gray-400' : 'text-gray-500'
                          }`}>
                            {sellersCount} ta sotuvchi
                          </p>
                        </div>
                        {activeBranch === index && (
                          <div className="w-10 h-10 bg-[#F87819] rounded-full flex items-center justify-center">
                            <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                            </svg>
                          </div>
                        )}
                      </div>
                      
                      {sellersCount > 0 && (
                        <div className={`flex items-center gap-2 text-sm ${
                          activeBranch === index 
                            ? 'text-orange-700' 
                            : isDarkMode ? 'text-gray-400' : 'text-gray-600'
                        }`}>
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                          </svg>
                          <span className="font-semibold">
                            {completedPlans} / {sellersCount} plan bajarildi
                          </span>
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Tanlangan filial nomi */}
            <div className="mb-6">
              <h2 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                {currentBranch.name} - Sotuvchilar
              </h2>
            </div>

            {/* Sotuvchilar ro'yxati */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {currentBranch.employees
                .filter(emp => emp.position === 'sotuvchi')
                .map((employee) => {
                  const monthlyPlan = employee.monthlyPlan || 500000000;
                  const monthlyRetailSales = employee.monthlyRetailSales || 0;
                  const progress = (monthlyRetailSales / monthlyPlan) * 100;
                  const isPlanCompleted = monthlyRetailSales >= monthlyPlan;
                  
                  return (
                    <div
                      key={employee.id}
                      className={`rounded-xl border-2 overflow-hidden shadow-lg transition-all hover:shadow-xl ${
                        isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
                      }`}
                    >
                      {/* Header */}
                      <div className={`px-6 py-4 ${
                        isPlanCompleted 
                          ? 'bg-gradient-to-r from-green-500 to-emerald-600' 
                          : 'bg-gradient-to-r from-[#F87819] to-[#ff8c3a]'
                      }`}>
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="text-lg font-bold text-white">{employee.name}</h3>
                            <p className="text-sm text-white/80">Sotuvchi</p>
                          </div>
                          {isPlanCompleted && (
                            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                              <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                              </svg>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Content */}
                      <div className="p-6 space-y-4">
                        {/* Plan */}
                        <div>
                          <div className="flex justify-between items-center mb-2">
                            <span className={`text-sm font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                              Oylik Plan
                            </span>
                            <span className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                              {formatMoney(monthlyPlan)}
                            </span>
                          </div>
                          
                          {/* Progress Bar */}
                          <div className="relative w-full h-3 bg-gray-200 rounded-full overflow-hidden">
                            <div
                              className={`absolute top-0 left-0 h-full transition-all duration-500 ${
                                isPlanCompleted 
                                  ? 'bg-gradient-to-r from-green-500 to-emerald-600' 
                                  : 'bg-gradient-to-r from-[#F87819] to-[#ff8c3a]'
                              }`}
                              style={{ width: `${Math.min(progress, 100)}%` }}
                            />
                          </div>
                          
                          <div className="flex justify-between items-center mt-2">
                            <span className={`text-xs font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                              {progress.toFixed(1)}% bajarildi
                            </span>
                            <span className={`text-xs font-bold ${
                              isPlanCompleted ? 'text-green-600' : isDarkMode ? 'text-gray-400' : 'text-gray-600'
                            }`}>
                              {isPlanCompleted ? '✓ Bajarildi' : 'Jarayonda'}
                            </span>
                          </div>
                        </div>

                        {/* Hozirgi savdo */}
                        <div className={`rounded-lg p-4 ${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                          <div className="flex justify-between items-center">
                            <span className={`text-sm font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                              Hozirgi Savdo
                            </span>
                            <span className={`text-xl font-bold ${
                              isPlanCompleted ? 'text-green-600' : isDarkMode ? 'text-white' : 'text-gray-900'
                            }`}>
                              {formatMoney(monthlyRetailSales)}
                            </span>
                          </div>
                        </div>

                        {/* Qolgan summa */}
                        {!isPlanCompleted && (
                          <div className={`rounded-lg p-4 border-2 ${isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-orange-50 border-orange-200'}`}>
                            <div className="flex justify-between items-center">
                              <span className={`text-sm font-medium ${isDarkMode ? 'text-gray-400' : 'text-orange-700'}`}>
                                Qolgan
                              </span>
                              <span className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-orange-700'}`}>
                                {formatMoney(monthlyPlan - monthlyRetailSales)}
                              </span>
                            </div>
                          </div>
                        )}

                        {/* Bonus */}
                        <div className={`rounded-lg p-4 ${
                          isPlanCompleted 
                            ? 'bg-gradient-to-r from-green-500 to-emerald-600' 
                            : isDarkMode ? 'bg-gray-700' : 'bg-gray-100'
                        }`}>
                          <div className="flex justify-between items-center">
                            <span className={`text-sm font-medium ${
                              isPlanCompleted ? 'text-white' : isDarkMode ? 'text-gray-400' : 'text-gray-600'
                            }`}>
                              Plan Bonusi
                            </span>
                            <span className={`text-2xl font-bold ${
                              isPlanCompleted ? 'text-white' : isDarkMode ? 'text-gray-500' : 'text-gray-400'
                            }`}>
                              {isPlanCompleted ? '+ ' : ''}1,000,000 so'm
                            </span>
                          </div>
                          {!isPlanCompleted && (
                            <p className={`text-xs mt-2 ${isDarkMode ? 'text-green-600' : 'text-green-600'}`}>
                              <span className="text-lg">✅</span> <span className="text-lg">Planni bajaring va bonus oling</span>
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
            </div>

            {/* Agar sotuvchi bo'lmasa */}
            {currentBranch.employees.filter(emp => emp.position === 'sotuvchi').length === 0 && (
              <div className={`rounded-xl border-2 p-12 text-center ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
                <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full mb-4 ${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
                  <svg className={`w-8 h-8 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <p className={`text-base font-medium mb-1 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  Sotuvchi topilmadi
                </p>
                <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  Bu filialda hozircha sotuvchi xodimlar yo'q
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
          <div className={`rounded-2xl shadow-2xl w-full max-w-2xl flex flex-col max-h-[92vh] ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
            {/* Header - Sticky */}
            <div className="flex-shrink-0 px-6 py-5 bg-gradient-to-r from-[#F87819] to-[#ff8c3a] rounded-t-2xl">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
                  <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-xl font-bold text-white truncate">Kunlik Savdo</h3>
                  <p className="text-sm text-white/90 mt-0.5 truncate">
                    {selectedEmployee.name}
                  </p>
                </div>
              </div>
            </div>

            {/* Content - Scrollable with hidden scrollbar */}
            <div className="flex-1 overflow-y-auto scrollbar-hide p-6 space-y-5">
              {/* SAVDO BO'LIMI */}
              <div className={`rounded-xl p-4 ${isDarkMode ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                <div className="flex items-center gap-2 mb-4">
                  <svg className="w-5 h-5 text-[#F87819]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  <h4 className={`text-sm font-bold uppercase ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Savdo Ma'lumotlari</h4>
                </div>

                <div className="space-y-4">
                  {/* Chakana Savdo */}
                  <div>
                    <label className={`flex items-center gap-2 text-sm font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      <span className="w-2 h-2 rounded-full bg-green-500"></span>
                      Chakana Savdo (To'liq foiz)
                    </label>
                    <input
                      type="text"
                      value={dailySalesInput}
                      onChange={(e) => {
                        const cleaned = e.target.value.replace(/[^\d]/g, "");
                        if (cleaned === "") {
                          setDailySalesInput("");
                          setTeamVolumeBonusInput(""); // O'zi qilgan savdodan bonusni ham tozalaymiz
                          return;
                        }
                        const numValue = parseFloat(cleaned);
                        setDailySalesInput(formatNumber(numValue));
                        
                        // O'zi qilgan savdodan 0.5% ni avtomatik hisoblash
                        const personalSalesBonus = (numValue * 0.5) / 100;
                        setTeamVolumeBonusInput(formatNumber(Math.round(personalSalesBonus)));
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
                    <p className={`text-xs mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      💡 {selectedEmployee.percentage}% foiz qo'llaniladi
                    </p>
                  </div>

                  {/* Optom Savdo */}
                  <div>
                    <label className={`flex items-center gap-2 text-sm font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                      Optom Savdo (Yarim foiz)
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
                    <p className={`text-xs mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      💡 {selectedEmployee.percentage / 2}% foiz qo'llaniladi (yarim)
                    </p>
                  </div>
                </div>
              </div>

              {/* BONUSLAR BO'LIMI */}
              <div className={`rounded-xl p-4 ${isDarkMode ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                <div className="flex items-center gap-2 mb-4">
                  <svg className="w-5 h-5 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <h4 className={`text-sm font-bold uppercase ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Qo'shimcha Bonuslar</h4>
                </div>

                <div className="space-y-4">
                  {/* Standart Oylik */}
                  <div>
                    <label className={`flex items-center gap-2 text-sm font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      <span className="w-2 h-2 rounded-full bg-purple-500"></span>
                      Standart Oylik
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
                    <p className={`text-xs mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      💡 Doimiy oylik bonus
                    </p>
                  </div>

                  {/* Shaxsiy Bonus */}
                  <div>
                    <label className={`flex items-center gap-2 text-sm font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      <span className="w-2 h-2 rounded-full bg-indigo-500"></span>
                      Shaxsiy Bonus
                    </label>
                    <input
                      type="text"
                      value={personalBonusInput}
                      onChange={(e) => {
                        const cleaned = e.target.value.replace(/[^\d]/g, "");
                        if (cleaned === "") {
                          setPersonalBonusInput("");
                          return;
                        }
                        const numValue = parseFloat(cleaned);
                        setPersonalBonusInput(formatNumber(numValue));
                      }}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          updateDailySales();
                        }
                      }}
                      className={`w-full px-4 py-3 border-2 border-indigo-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-lg font-bold ${
                        isDarkMode ? 'bg-gray-700 text-white placeholder-gray-400' : 'bg-white text-gray-900'
                      }`}
                      placeholder="0"
                    />
                    <p className={`text-xs mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      💡 Shaxsiy yutuqlar uchun mukofot
                    </p>
                  </div>

                  {/* O'zi Qilgan Savdo */}
                  <div>
                    <label className={`flex items-center gap-2 text-sm font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      <span className="w-2 h-2 rounded-full bg-teal-500"></span>
                      O'zi Qilgan Savdo
                    </label>
                    <input
                      type="text"
                      value={teamVolumeBonusInput}
                      readOnly
                      className={`w-full px-4 py-3 border-2 border-teal-300 rounded-xl text-lg font-bold cursor-not-allowed ${
                        isDarkMode ? 'bg-gray-700 text-white' : 'bg-white text-gray-900'
                      }`}
                      placeholder="0"
                    />
                    <p className={`text-xs mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      💡 Avtomatik: Chakana savdo × 0.5%
                    </p>
                  </div>

                  {/* Jami Savdodan Ulush Bonusi */}
                  <div>
                    <label className={`flex items-center gap-2 text-sm font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                      Jami Savdodan Ulush (0.5%)
                    </label>
                    <input
                      type="text"
                      value={salesShareBonusInput}
                      readOnly
                      className={`w-full px-4 py-3 border-2 border-emerald-300 rounded-xl text-lg font-bold bg-emerald-50 cursor-not-allowed ${
                        isDarkMode ? 'bg-gray-700/50 text-gray-300' : 'bg-emerald-50 text-gray-700'
                      }`}
                      placeholder="0"
                    />
                    <p className={`text-xs mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      💡 Avtomatik: Chakana savdo × 0.5% ÷ {currentBranch?.employees.filter(emp => emp.position === 'sotuvchi').length || 0} sotuvchi
                    </p>
                  </div>
                </div>
              </div>

              {/* Hisoblash ko'rsatish */}
              {(dailySalesInput || wholesaleSalesInput || (bonusInput && parseFloat(bonusInput.replace(/,/g, "")) > 0) || (personalBonusInput && parseFloat(personalBonusInput.replace(/,/g, "")) > 0) || (teamVolumeBonusInput && parseFloat(teamVolumeBonusInput.replace(/,/g, "")) > 0) || (salesShareBonusInput && parseFloat(salesShareBonusInput.replace(/,/g, "")) > 0)) && (
                <div className="bg-gradient-to-br from-orange-50 to-yellow-50 rounded-xl p-5 border-2 border-[#F87819]">
                  <div className="flex items-center gap-2 mb-3">
                    <svg className="w-5 h-5 text-[#F87819]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                    </svg>
                    <p className="text-sm font-bold text-gray-900">Taxminiy Oylik Hisob</p>
                  </div>
                  
                  <div className="space-y-2 text-sm text-gray-700">
                    {dailySalesInput && (
                      <div className="flex justify-between items-center py-1">
                        <span className="flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-green-500"></span>
                          Chakana:
                        </span>
                        <span className="font-bold text-green-600">
                          {formatMoney((parseFloat(dailySalesInput.replace(/,/g, "")) || 0) * selectedEmployee.percentage / 100)}
                        </span>
                      </div>
                    )}
                    {wholesaleSalesInput && (
                      <div className="flex justify-between items-center py-1">
                        <span className="flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                          Optom (÷2):
                        </span>
                        <span className="font-bold text-blue-600">
                          {formatMoney((parseFloat(wholesaleSalesInput.replace(/,/g, "")) || 0) * selectedEmployee.percentage / 100 / 2)}
                        </span>
                      </div>
                    )}
                    {bonusInput && parseFloat(bonusInput.replace(/,/g, "")) > 0 && (
                      <div className="flex justify-between items-center py-1">
                        <span className="flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-purple-500"></span>
                          Standart oylik:
                        </span>
                        <span className="font-bold text-purple-600">
                          + {formatMoney(parseFloat(bonusInput.replace(/,/g, "")) || 0)}
                        </span>
                      </div>
                    )}
                    {personalBonusInput && parseFloat(personalBonusInput.replace(/,/g, "")) > 0 && (
                      <div className="flex justify-between items-center py-1">
                        <span className="flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-indigo-500"></span>
                          Shaxsiy bonus:
                        </span>
                        <span className="font-bold text-indigo-600">
                          + {formatMoney(parseFloat(personalBonusInput.replace(/,/g, "")) || 0)}
                        </span>
                      </div>
                    )}
                    {teamVolumeBonusInput && parseFloat(teamVolumeBonusInput.replace(/,/g, "")) > 0 && (
                      <div className="flex justify-between items-center py-1">
                        <span className="flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-teal-500"></span>
                          O'z savdosi (0.5%):
                        </span>
                        <span className="font-bold text-teal-600">
                          + {formatMoney(parseFloat(teamVolumeBonusInput.replace(/,/g, "")) || 0)}
                        </span>
                      </div>
                    )}
                    {salesShareBonusInput && parseFloat(salesShareBonusInput.replace(/,/g, "")) > 0 && (
                      <div className="flex justify-between items-center py-1">
                        <span className="flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                          Savdo ulushi (0.5%):
                        </span>
                        <span className="font-bold text-emerald-600">
                          + {formatMoney(parseFloat(salesShareBonusInput.replace(/,/g, "")) || 0)}
                        </span>
                      </div>
                    )}
                    
                    <div className="flex justify-between items-center pt-3 mt-3 border-t-2 border-orange-300">
                      <span className="font-bold text-base">JAMI OYLIK:</span>
                      <span className="font-bold text-xl text-[#F87819]">
                        {formatMoney(
                          ((parseFloat(dailySalesInput.replace(/,/g, "")) || 0) * selectedEmployee.percentage / 100) +
                          ((parseFloat(wholesaleSalesInput.replace(/,/g, "")) || 0) * selectedEmployee.percentage / 100 / 2) +
                          (parseFloat(bonusInput.replace(/,/g, "")) || 0) +
                          (parseFloat(personalBonusInput.replace(/,/g, "")) || 0) +
                          (parseFloat(salesShareBonusInput.replace(/,/g, "")) || 0)
                        )}
                      </span>
                    </div>
                  </div>
                  
                  <div className="mt-3 pt-3 border-t border-orange-200">
                    <p className="text-xs text-gray-600 flex items-center gap-1">
                      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Vazifalar foizisiz hisoblangan. Vazifalar bajarilishiga qarab kamayishi mumkin.
                    </p>
                  </div>
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
                  setPersonalBonusInput("");
                  setTeamVolumeBonusInput("");
                  setSalesShareBonusInput("");
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
                    {formatUzbekDate(selectedHistoryRecord.date)}
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
              </div>

              {/* Desktop: Jadval, Mobile: Cardlar */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full">
                  <thead className={`border-b ${isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'}`}>
                    <tr>
                      <th className={`px-4 py-3 text-left text-xs font-semibold uppercase ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Xodim</th>
                      <th className={`px-4 py-3 text-left text-xs font-semibold uppercase ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Lavozim</th>
                      <th className={`px-4 py-3 text-left text-xs font-semibold uppercase ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Kunlik Savdo</th>
                      <th className={`px-4 py-3 text-left text-xs font-semibold uppercase ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Foiz</th>
                      <th className={`px-4 py-3 text-left text-xs font-semibold uppercase ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Oylik</th>
                      {!isHistoryLocked && isAuthenticated && userRole === 'admin' && (
                        <th className={`px-4 py-3 text-left text-xs font-semibold uppercase ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Amallar</th>
                      )}
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
                        {!isHistoryLocked && isAuthenticated && userRole === 'admin' && (
                          <td className="px-4 py-3">
                            <button
                              onClick={() => {
                                setEditingHistoryEmployee(emp);
                                // Sotuvchi uchun to'liq ma'lumotlarni yuklash
                                if (emp.position === 'sotuvchi') {
                                  setEditHistoryRetailSales((emp.dailySales || 0).toString());
                                  setEditHistoryWholesaleSales((emp.wholesaleSales || 0).toString());
                                  setEditHistoryPercentage((emp.percentage || 0).toString());
                                  setEditHistoryFixedBonus((emp.fixedBonus || 0).toString());
                                  setEditHistoryPersonalBonus((emp.personalBonus || 0).toString());
                                } else {
                                  setEditHistorySalary(emp.salary?.toString() || "0");
                                }
                                setShowEditHistoryModal(true);
                              }}
                              className="px-3 py-1.5 bg-blue-500 text-white text-xs font-bold rounded-lg hover:bg-blue-600 transition-colors"
                            >
                              Tahrirlash
                            </button>
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile: Card ko'rinishi */}
              <div className="md:hidden space-y-3">
                {selectedHistoryRecord.employees.map((emp: any) => (
                  <div 
                    key={emp.employeeId} 
                    className={`rounded-xl border-2 p-4 ${
                      isDarkMode 
                        ? 'bg-gray-700 border-gray-600' 
                        : 'bg-white border-gray-200'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <h4 className={`font-bold text-base ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                        {emp.name}
                      </h4>
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-bold uppercase ${positionColors[emp.position as keyof typeof positionColors]}`}>
                        {emp.position}
                      </span>
                    </div>
                    
                    <div className="space-y-2">
                      {emp.position === 'sotuvchi' && (
                        <div className="flex justify-between text-sm">
                          <span className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>Kunlik Savdo:</span>
                          <span className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                            {formatMoney(emp.dailySales || 0)}
                          </span>
                        </div>
                      )}
                      
                      <div className="flex justify-between text-sm">
                        <span className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>Foiz:</span>
                        <span className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                          {emp.percentage}%
                        </span>
                      </div>
                      
                      <div className={`flex justify-between text-sm pt-2 border-t ${isDarkMode ? 'border-gray-600' : 'border-gray-200'}`}>
                        <span className={`font-bold ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Oylik:</span>
                        <span className="font-bold text-green-600 text-base">
                          {formatMoney(emp.salary || 0)}
                        </span>
                      </div>
                      
                      {!isHistoryLocked && isAuthenticated && userRole === 'admin' && (
                        <button
                          onClick={() => {
                            setEditingHistoryEmployee(emp);
                            // Sotuvchi uchun to'liq ma'lumotlarni yuklash
                            if (emp.position === 'sotuvchi') {
                              setEditHistoryRetailSales((emp.dailySales || 0).toString());
                              setEditHistoryWholesaleSales((emp.wholesaleSales || 0).toString());
                              setEditHistoryPercentage((emp.percentage || 0).toString());
                              setEditHistoryFixedBonus((emp.fixedBonus || 0).toString());
                              setEditHistoryPersonalBonus((emp.personalBonus || 0).toString());
                            } else {
                              setEditHistorySalary(emp.salary?.toString() || "0");
                            }
                            setShowEditHistoryModal(true);
                          }}
                          className="w-full mt-3 px-3 py-2 bg-blue-500 text-white text-sm font-bold rounded-lg hover:bg-blue-600 transition-colors"
                        >
                          Tahrirlash
                        </button>
                      )}
                    </div>
                  </div>
                ))}
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

      {/* Modal - Oylik Plan Tarixi Tafsilotlari */}
      {showPlanHistoryModal && selectedPlanRecord && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className={`rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
            <div className="px-6 py-5 bg-gradient-to-b from-gray-900 to-gray-800">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold text-white">
                    {new Date(selectedPlanRecord.month + '-01').toLocaleDateString('uz-UZ', { 
                      year: 'numeric', 
                      month: 'long'
                    })}
                  </h3>
                  <p className="text-sm text-gray-300 mt-1">
                    {branches.find(b => b._id === selectedPlanRecord.branchId)?.name || 'Filial'} - Oylik Plan
                  </p>
                </div>
                <button
                  onClick={() => {
                    setShowPlanHistoryModal(false);
                    setSelectedPlanRecord(null);
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
              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="bg-blue-50 rounded-lg p-4">
                  <p className="text-sm text-blue-600 mb-1">Jami sotuvchilar</p>
                  <p className="text-2xl font-semibold text-blue-900">
                    {selectedPlanRecord.sellers.length}
                  </p>
                </div>
                <div className="bg-green-50 rounded-lg p-4">
                  <p className="text-sm text-green-600 mb-1">Plan bajarganlar</p>
                  <p className="text-2xl font-semibold text-green-900">
                    {selectedPlanRecord.sellers.filter((s: any) => s.planCompleted).length}
                  </p>
                </div>
                <div className="bg-orange-50 rounded-lg p-4">
                  <p className="text-sm text-orange-600 mb-1">Jami bonus</p>
                  <p className="text-2xl font-semibold text-orange-900">
                    {formatMoney(selectedPlanRecord.sellers.reduce((sum: number, s: any) => sum + (s.planBonus || 0), 0))}
                  </p>
                </div>
              </div>

              {/* Desktop: Jadval */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full">
                  <thead className={`border-b ${isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'}`}>
                    <tr>
                      <th className={`px-4 py-3 text-left text-xs font-semibold uppercase ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Sotuvchi</th>
                      <th className={`px-4 py-3 text-left text-xs font-semibold uppercase ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Plan</th>
                      <th className={`px-4 py-3 text-left text-xs font-semibold uppercase ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Savdo</th>
                      <th className={`px-4 py-3 text-left text-xs font-semibold uppercase ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Holat</th>
                      <th className={`px-4 py-3 text-left text-xs font-semibold uppercase ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Bonus</th>
                    </tr>
                  </thead>
                  <tbody className={`divide-y ${isDarkMode ? 'divide-gray-700' : 'divide-gray-200'}`}>
                    {selectedPlanRecord.sellers.map((seller: any) => (
                      <tr key={seller.employeeId} className={isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'}>
                        <td className={`px-4 py-3 text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{seller.name}</td>
                        <td className={`px-4 py-3 text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-900'}`}>
                          {formatMoney(seller.monthlyPlan)}
                        </td>
                        <td className={`px-4 py-3 text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-900'}`}>
                          {formatMoney(seller.monthlyRetailSales)}
                        </td>
                        <td className="px-4 py-3">
                          {seller.planCompleted ? (
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-green-100 text-green-700">
                              ✓ Bajarildi
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-red-100 text-red-700">
                              ✗ Bajarilmadi
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-sm font-semibold text-green-600">
                          {formatMoney(seller.planBonus)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile: Card ko'rinishi */}
              <div className="md:hidden space-y-3">
                {selectedPlanRecord.sellers.map((seller: any) => (
                  <div 
                    key={seller.employeeId} 
                    className={`rounded-xl border-2 p-4 ${
                      seller.planCompleted
                        ? 'bg-green-50 border-green-500'
                        : isDarkMode 
                          ? 'bg-gray-700 border-gray-600' 
                          : 'bg-white border-gray-200'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <h4 className={`font-bold text-base ${isDarkMode && !seller.planCompleted ? 'text-white' : 'text-gray-900'}`}>
                        {seller.name}
                      </h4>
                      {seller.planCompleted ? (
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-green-600 text-white">
                          ✓ Bajarildi
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-red-100 text-red-700">
                          ✗ Bajarilmadi
                        </span>
                      )}
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className={isDarkMode && !seller.planCompleted ? 'text-gray-400' : 'text-gray-600'}>Plan:</span>
                        <span className={`font-semibold ${isDarkMode && !seller.planCompleted ? 'text-white' : 'text-gray-900'}`}>
                          {formatMoney(seller.monthlyPlan)}
                        </span>
                      </div>
                      
                      <div className="flex justify-between text-sm">
                        <span className={isDarkMode && !seller.planCompleted ? 'text-gray-400' : 'text-gray-600'}>Savdo:</span>
                        <span className={`font-semibold ${isDarkMode && !seller.planCompleted ? 'text-white' : 'text-gray-900'}`}>
                          {formatMoney(seller.monthlyRetailSales)}
                        </span>
                      </div>
                      
                      <div className={`flex justify-between text-sm pt-2 border-t ${seller.planCompleted ? 'border-green-300' : isDarkMode ? 'border-gray-600' : 'border-gray-200'}`}>
                        <span className={`font-bold ${isDarkMode && !seller.planCompleted ? 'text-gray-300' : 'text-gray-700'}`}>Bonus:</span>
                        <span className="font-bold text-green-600 text-base">
                          {formatMoney(seller.planBonus)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className={`px-6 py-4 border-t ${isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'}`}>
              <button
                onClick={() => {
                  setShowPlanHistoryModal(false);
                  setSelectedPlanRecord(null);
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
                    // Tanlangan sanani olamiz
                    const selectedDate = selectedDates[currentBranch._id] || new Date().toISOString().split('T')[0];
                    
                    const result = await api.saveDailyHistory(currentBranch._id, selectedDate);
                    if (result.ok) {
                      setShowSaveConfirmModal(false);
                      setSavedDate(result.date);
                      setShowSaveSuccessModal(true);
                      
                      // Ma'lumotlarni to'liq qayta yuklaymiz (cache'siz)
                      await loadBranches(true); // Loading indicator bilan
                      await loadHistory();
                    } else {
                      showErrorNotif('Saqlashda xato yuz berdi');
                    }
                  } catch (error) {
                    showErrorNotif('Saqlashda xato yuz berdi');
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
                    {formatUzbekDate(historyToDelete.date)} - {branches.find(b => b._id === historyToDelete.branchId)?.name}
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
                    showErrorNotif('O\'chirishda xato yuz berdi');
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

      {/* Modal - Hisobotlarni o'chirish tasdiqlash */}
      {showDeleteReportConfirm && reportToDelete && (
        <div 
          className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={() => {
            setShowDeleteReportConfirm(false);
            setReportToDelete(null);
            setDeleteReportCode("");
          }}
        >
          <div 
            className={`rounded-2xl shadow-2xl max-w-md w-full overflow-hidden ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-6 py-5 bg-gradient-to-b from-gray-900 to-gray-800">
              <h3 className="text-xl font-bold text-white">Hisobotlarni o'chirish</h3>
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
                    {reportToDelete.month} - {reportToDelete.branchName}
                  </p>
                  <p className="text-xs text-red-600 font-semibold mt-2">Bu amalni qaytarib bo'lmaydi.</p>
                </div>
              </div>

              {/* Kod kiritish */}
              <div className="mt-4">
                <label className={`block text-sm font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  Tasdiqlash kodi
                </label>
                <input
                  type="password"
                  value={deleteReportCode}
                  onChange={(e) => setDeleteReportCode(e.target.value)}
                  placeholder="Kodni kiriting"
                  autoComplete="off"
                  className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 font-medium ${
                    isDarkMode 
                      ? 'border-gray-700 bg-gray-700 text-white placeholder-gray-500' 
                      : 'border-gray-300 bg-white text-gray-900 placeholder-gray-400'
                  }`}
                  autoFocus
                />
              </div>
            </div>

            <div className={`px-6 py-4 border-t flex gap-3 ${isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'}`}>
              <button
                onClick={() => {
                  setShowDeleteReportConfirm(false);
                  setReportToDelete(null);
                  setDeleteReportCode("");
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
                  // Kodni tekshirish
                  if (deleteReportCode !== "3335") {
                    showErrorNotif("Xato! Kod noto'g'ri.");
                    return;
                  }

                  try {
                    // Tanlangan filial va oyning barcha hisobotlarini o'chirish
                    const reportsToDelete = monthlyReports.filter(
                      report => report.branchId === reportToDelete.branchId
                    );

                    // Har bir hisobotni o'chirish
                    for (const report of reportsToDelete) {
                      await api.deleteHistory(report._id);
                    }

                    setShowDeleteReportConfirm(false);
                    setReportToDelete(null);
                    setDeleteReportCode("");
                    
                    // Success notification
                    showSuccessNotif("Hisobot muvaffaqiyatli o'chirildi!");
                    
                    // Hisobotlarni qayta yuklash
                    await loadMonthlyReports(reportToDelete.branchId, reportToDelete.month);
                  } catch (error) {
                    showErrorNotif("Xato! Hisobotni o'chirishda xatolik yuz berdi.");
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

      {/* Login Success Notification */}
      {showLoginSuccessNotification && (
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
              onClick={() => setShowLoginSuccessNotification(false)}
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
                    showErrorNotif('Xato yuz berdi! Console ni tekshiring.');
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

      {/* Modal - Tarix xodimini tahrirlash */}
      {showEditHistoryModal && editingHistoryEmployee && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className={`rounded-2xl shadow-2xl max-w-2xl w-full overflow-hidden ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
            <div className="px-6 py-5 bg-gradient-to-b from-gray-900 to-gray-800">
              <h3 className="text-xl font-bold text-white">
                {editingHistoryEmployee.position === 'sotuvchi' ? 'Sotuvchi Ma\'lumotlarini Tahrirlash' : 'Oylikni Tahrirlash'}
              </h3>
              <p className="text-sm text-gray-300 mt-1">{editingHistoryEmployee.name}</p>
            </div>

            <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
              {editingHistoryEmployee.position === 'sotuvchi' ? (
                // Sotuvchi uchun to'liq ma'lumotlar
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className={`block text-sm font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                        Chakana Savdo (so'm)
                      </label>
                      <input
                        type="text"
                        value={editHistoryRetailSales}
                        onChange={(e) => {
                          const value = e.target.value.replace(/[^0-9]/g, '');
                          setEditHistoryRetailSales(value);
                        }}
                        placeholder="0"
                        className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-medium ${
                          isDarkMode 
                            ? 'border-gray-700 bg-gray-700 text-white placeholder-gray-500' 
                            : 'border-gray-300 bg-white text-gray-900 placeholder-gray-400'
                        }`}
                      />
                    </div>

                    <div>
                      <label className={`block text-sm font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                        Optom Savdo (so'm)
                      </label>
                      <input
                        type="text"
                        value={editHistoryWholesaleSales}
                        onChange={(e) => {
                          const value = e.target.value.replace(/[^0-9]/g, '');
                          setEditHistoryWholesaleSales(value);
                        }}
                        placeholder="0"
                        className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-medium ${
                          isDarkMode 
                            ? 'border-gray-700 bg-gray-700 text-white placeholder-gray-500' 
                            : 'border-gray-300 bg-white text-gray-900 placeholder-gray-400'
                        }`}
                      />
                    </div>

                    <div>
                      <label className={`block text-sm font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                        Foiz (%)
                      </label>
                      <input
                        type="text"
                        value={editHistoryPercentage}
                        onChange={(e) => {
                          const value = e.target.value.replace(/[^0-9.]/g, '');
                          setEditHistoryPercentage(value);
                        }}
                        placeholder="0"
                        className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-medium ${
                          isDarkMode 
                            ? 'border-gray-700 bg-gray-700 text-white placeholder-gray-500' 
                            : 'border-gray-300 bg-white text-gray-900 placeholder-gray-400'
                        }`}
                      />
                    </div>

                    <div>
                      <label className={`block text-sm font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                        Standart Bonus (so'm)
                      </label>
                      <input
                        type="text"
                        value={editHistoryFixedBonus}
                        onChange={(e) => {
                          const value = e.target.value.replace(/[^0-9]/g, '');
                          setEditHistoryFixedBonus(value);
                        }}
                        placeholder="0"
                        className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-medium ${
                          isDarkMode 
                            ? 'border-gray-700 bg-gray-700 text-white placeholder-gray-500' 
                            : 'border-gray-300 bg-white text-gray-900 placeholder-gray-400'
                        }`}
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className={`block text-sm font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                        Shaxsiy Bonus (so'm)
                      </label>
                      <input
                        type="text"
                        value={editHistoryPersonalBonus}
                        onChange={(e) => {
                          const value = e.target.value.replace(/[^0-9]/g, '');
                          setEditHistoryPersonalBonus(value);
                        }}
                        placeholder="0"
                        className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-medium ${
                          isDarkMode 
                            ? 'border-gray-700 bg-gray-700 text-white placeholder-gray-500' 
                            : 'border-gray-300 bg-white text-gray-900 placeholder-gray-400'
                        }`}
                      />
                    </div>
                  </div>

                  <div className={`p-4 rounded-xl ${isDarkMode ? 'bg-gray-700' : 'bg-blue-50'}`}>
                    <p className={`text-xs mb-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Hozirgi qiymatlar:</p>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <span className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>Chakana: </span>
                        <span className={`font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                          {formatMoney(editingHistoryEmployee.dailySales || 0)}
                        </span>
                      </div>
                      <div>
                        <span className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>Optom: </span>
                        <span className={`font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                          {formatMoney(editingHistoryEmployee.wholesaleSales || 0)}
                        </span>
                      </div>
                      <div>
                        <span className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>Foiz: </span>
                        <span className={`font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                          {editingHistoryEmployee.percentage}%
                        </span>
                      </div>
                      <div>
                        <span className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>Standart Bonus: </span>
                        <span className={`font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                          {formatMoney(editingHistoryEmployee.fixedBonus || 0)}
                        </span>
                      </div>
                      <div className="col-span-2">
                        <span className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>Shaxsiy Bonus: </span>
                        <span className={`font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                          {formatMoney(editingHistoryEmployee.personalBonus || 0)}
                        </span>
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                // Boshqa xodimlar uchun faqat oylik
                <div>
                  <label className={`block text-sm font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    Oylik (so'm)
                  </label>
                  <input
                    type="text"
                    value={editHistorySalary}
                    onChange={(e) => {
                      const value = e.target.value.replace(/[^0-9]/g, '');
                      setEditHistorySalary(value);
                    }}
                    placeholder="0"
                    className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-medium ${
                      isDarkMode 
                        ? 'border-gray-700 bg-gray-700 text-white placeholder-gray-500' 
                        : 'border-gray-300 bg-white text-gray-900 placeholder-gray-400'
                    }`}
                  />
                  <p className={`text-xs mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    Hozirgi: {formatMoney(editingHistoryEmployee.salary || 0)}
                  </p>
                </div>
              )}
            </div>

            <div className={`px-6 py-4 border-t flex gap-3 ${isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'}`}>
              <button
                onClick={() => {
                  setShowEditHistoryModal(false);
                  setEditingHistoryEmployee(null);
                  setEditHistorySalary("");
                  setEditHistoryRetailSales("");
                  setEditHistoryWholesaleSales("");
                  setEditHistoryPercentage("");
                  setEditHistoryFixedBonus("");
                  setEditHistoryPersonalBonus("");
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
                  let updatedEmployees;
                  
                  if (editingHistoryEmployee.position === 'sotuvchi') {
                    // Sotuvchi uchun to'liq ma'lumotlarni yangilash
                    const newRetailSales = parseFloat(editHistoryRetailSales) || 0;
                    const newWholesaleSales = parseFloat(editHistoryWholesaleSales) || 0;
                    const newPercentage = parseFloat(editHistoryPercentage) || 0;
                    const newFixedBonus = parseFloat(editHistoryFixedBonus) || 0;
                    const newPersonalBonus = parseFloat(editHistoryPersonalBonus) || 0;
                    
                    // Yangi oylikni hisoblash
                    const retailSalary = (newRetailSales * newPercentage) / 100;
                    const wholesaleSalary = (newWholesaleSales * newPercentage) / 100 / 2;
                    const newSalary = retailSalary + wholesaleSalary + newFixedBonus + newPersonalBonus;
                    
                    updatedEmployees = selectedHistoryRecord.employees.map((emp: any) => 
                      emp.employeeId === editingHistoryEmployee.employeeId 
                        ? { 
                            ...emp, 
                            dailySales: newRetailSales,
                            wholesaleSales: newWholesaleSales,
                            percentage: newPercentage,
                            fixedBonus: newFixedBonus,
                            personalBonus: newPersonalBonus,
                            salary: newSalary
                          }
                        : emp
                    );
                  } else {
                    // Boshqa xodimlar uchun faqat oylikni yangilash
                    const newSalary = parseFloat(editHistorySalary) || 0;
                    
                    updatedEmployees = selectedHistoryRecord.employees.map((emp: any) => 
                      emp.employeeId === editingHistoryEmployee.employeeId 
                        ? { ...emp, salary: newSalary }
                        : emp
                    );
                  }

                  // Lokal state'ni yangilash
                  setSelectedHistoryRecord({
                    ...selectedHistoryRecord,
                    employees: updatedEmployees
                  });

                  // History listni ham yangilash
                  setHistory(prevHistory => 
                    prevHistory.map(record => 
                      record._id === selectedHistoryRecord._id
                        ? { ...record, employees: updatedEmployees }
                        : record
                    )
                  );

                  setShowEditHistoryModal(false);
                  setEditingHistoryEmployee(null);
                  setEditHistorySalary("");
                  setEditHistoryRetailSales("");
                  setEditHistoryWholesaleSales("");
                  setEditHistoryPercentage("");
                  setEditHistoryFixedBonus("");
                  setEditHistoryPersonalBonus("");
                  
                  showSuccessNotif("Ma'lumotlar muvaffaqiyatli yangilandi!");
                }}
                className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white text-sm font-bold rounded-xl hover:shadow-lg transition-all"
              >
                Saqlash
              </button>
            </div>
          </div>
        </div>
      )}



      {/* Modal - Xato - YASHIRILGAN (notification ishlatiladi) */}
      {false && showErrorModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className={`rounded-2xl shadow-2xl max-w-md w-full overflow-hidden ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
            <div className="px-6 py-5 bg-gradient-to-b from-red-600 to-red-700">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-white">Xato!</h3>
              </div>
            </div>

            <div className="p-6">
              <p className={`text-base ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                {errorMessage}
              </p>
            </div>

            <div className={`px-6 py-4 border-t ${isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'}`}>
              <button
                onClick={() => {
                  setShowErrorModal(false);
                  setErrorMessage("");
                }}
                className="w-full px-4 py-3 bg-gradient-to-r from-red-600 to-red-700 text-white text-sm font-bold rounded-xl hover:shadow-lg transition-all"
              >
                Yopish
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal - Muvaffaqiyat - YASHIRILGAN (notification ishlatiladi) */}
      {false && showSuccessModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className={`rounded-2xl shadow-2xl max-w-md w-full overflow-hidden ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
            <div className="px-6 py-5 bg-gradient-to-b from-green-600 to-green-700">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-white">Muvaffaqiyatli!</h3>
              </div>
            </div>

            <div className="p-6">
              <p className={`text-base ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                {successMessage}
              </p>
            </div>

            <div className={`px-6 py-4 border-t ${isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'}`}>
              <button
                onClick={() => {
                  setShowSuccessModal(false);
                  setSuccessMessage("");
                }}
                className="w-full px-4 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white text-sm font-bold rounded-xl hover:shadow-lg transition-all"
              >
                Yopish
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Notification - Success (o'ng tepada) */}
      {showSuccessNotification && (
        <div className="fixed top-4 right-4 z-[60] animate-slide-in-right">
          <div className="bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl shadow-2xl p-4 flex items-center gap-4 min-w-[320px] max-w-md">
            <div className="flex-shrink-0 w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div className="flex-1">
              <p className="font-bold text-sm">{successNotificationMessage}</p>
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

      {/* Notification - Error (o'ng tepada) */}
      {showErrorNotification && (
        <div className="fixed top-4 right-4 z-[60] animate-slide-in-right">
          <div className="bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl shadow-2xl p-4 flex items-center gap-4 min-w-[320px] max-w-md">
            <div className="flex-shrink-0 w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <div className="flex-1">
              <p className="font-bold text-sm">{errorNotificationMessage}</p>
            </div>
            <button
              onClick={() => setShowErrorNotification(false)}
              className="flex-shrink-0 text-white/80 hover:text-white transition-colors"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* Notification - Info (o'ng tepada) */}
      {showInfoNotification && (
        <div className="fixed top-4 right-4 z-[60] animate-slide-in-right">
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl shadow-2xl p-4 flex items-center gap-4 min-w-[320px] max-w-md">
            <div className="flex-shrink-0 w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="flex-1">
              <p className="font-bold text-sm">{infoNotificationMessage}</p>
            </div>
            <button
              onClick={() => setShowInfoNotification(false)}
              className="flex-shrink-0 text-white/80 hover:text-white transition-colors"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}