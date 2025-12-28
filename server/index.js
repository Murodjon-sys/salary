import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import { regosService } from './regosService.js';

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Schemas - avval yaratamiz
// Lavozim schema
const positionSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  color: { type: String, required: true },
  isDefault: { type: Boolean, default: false } // Standart lavozimlarni belgilash uchun
}, { timestamps: true });

// Kunlik vazifa shabloni schema
const taskTemplateSchema = new mongoose.Schema({
  position: { type: String, required: true }, // Har qanday lavozim (dinamik)
  taskName: { type: String, required: true },
  description: { type: String },
  order: { type: Number, default: 0 } // Tartib raqami
}, { timestamps: true });

const employeeSchema = new mongoose.Schema({
  name: { type: String, required: true },
  position: { type: String, required: true }, // Har qanday lavozim (dinamik)
  percentage: { type: Number, required: true },
  branchId: { type: mongoose.Schema.Types.ObjectId, ref: 'Branch', required: true },
  dailyTasks: { type: mongoose.Schema.Types.Mixed, default: {} }, // Dynamic object: { taskId: boolean }
  dailySales: { type: Number, default: 0 }, // Kunlik chakana savdo
  wholesaleSales: { type: Number, default: 0 }, // Kunlik optom savdo
  lastSalesDate: { type: String, default: null }, // Oxirgi savdo kiritilgan sana (YYYY-MM-DD)
  fixedBonus: { type: Number, default: 0 } // Standart oylik (bonus)
});

const branchSchema = new mongoose.Schema({
  name: { type: String, required: true },
  totalSales: { type: Number, default: 0 },
  retailSales: { type: Number, default: 0 }, // Chakana savdo
  wholesaleSales: { type: Number, default: 0 }, // Optom savdo
  penaltyFund: { type: Number, default: 0 }, // Jarimalar jamg'armasi
  regosDepartmentId: { type: Number }, // Regos department ID
  lastSyncDate: { type: Date } // Oxirgi sinxronizatsiya sanasi
}, { timestamps: true });

// Kunlik savdo tarixi schema
const dailySalesHistorySchema = new mongoose.Schema({
  date: { type: String, required: true }, // YYYY-MM-DD
  branchId: { type: mongoose.Schema.Types.ObjectId, ref: 'Branch', required: true },
  totalSales: { type: Number, default: 0 }, // Filialning umumiy savdosi
  retailSales: { type: Number, default: 0 }, // Filialning chakana savdosi
  wholesaleSales: { type: Number, default: 0 }, // Filialning optom savdosi
  penaltyAmount: { type: Number, default: 0 }, // Shu kun uchun jarima summasi
  employees: [{
    employeeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee' },
    name: { type: String },
    position: { type: String },
    percentage: { type: Number },
    dailySales: { type: Number },
    wholesaleSales: { type: Number },
    dailyTasks: { type: mongoose.Schema.Types.Mixed }, // Dynamic object: { taskId: boolean }
    salary: { type: Number }, // Hisoblangan oylik
    penaltyAmount: { type: Number, default: 0 } // Xodimdan ayrilgan jarima
  }]
}, { timestamps: true });

const Employee = mongoose.model('Employee', employeeSchema);
const Branch = mongoose.model('Branch', branchSchema);
const DailySalesHistory = mongoose.model('DailySalesHistory', dailySalesHistorySchema);
const TaskTemplate = mongoose.model('TaskTemplate', taskTemplateSchema);
const Position = mongoose.model('Position', positionSchema);

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI)
  .then(async () => {
    console.log('MongoDB ga ulandi');
    
    // Standart lavozimlarni yaratish
    const positionCount = await Position.countDocuments();
    if (positionCount === 0) {
      await Position.insertMany([
        { id: "ishchi", name: "Ishchi", color: "bg-gray-100 text-gray-800 border-2 border-gray-300", isDefault: true },
        { id: "manager", name: "Manager", color: "bg-gray-900 text-white shadow-md", isDefault: true },
        { id: "kassir", name: "Kassir", color: "bg-white text-gray-900 border-2 border-gray-900", isDefault: true },
        { id: "shofir", name: "Shofir", color: "bg-gradient-to-r from-[#F87819] to-[#ff8c3a] text-white shadow-md", isDefault: true },
        { id: "sotuvchi", name: "Sotuvchi", color: "bg-white text-[#F87819] border-2 border-[#F87819]", isDefault: true },
        { id: "taminotchi", name: "Ta'minotchi", color: "bg-gray-700 text-white shadow-md", isDefault: true },
      ]);
      console.log('Standart lavozimlar yaratildi');
    }
    
    // Boshlang'ich filiallarni yaratish
    const count = await Branch.countDocuments();
    if (count === 0) {
      await Branch.insertMany([
        { name: "Asosiy Sklad", totalSales: 0 },
        { name: "G'ijduvon Filial", totalSales: 0 },
        { name: "Navoiy Filial", totalSales: 0 }
      ]);
      console.log('Boshlang\'ich filiallar yaratildi');
    }
    
    // Boshlang'ich vazifa shablonlarini yaratish (faqat sotuvchi uchun)
    const taskCount = await TaskTemplate.countDocuments();
    if (taskCount === 0) {
      await TaskTemplate.insertMany([
        { position: 'sotuvchi', taskName: "Ishga o'z vaqtida kelish", order: 1 },
        { position: 'sotuvchi', taskName: "Polka tozaligi nazorati", order: 2 },
        { position: 'sotuvchi', taskName: "Mahsulot kam kelgan bilishi", order: 3 },
        { position: 'sotuvchi', taskName: "Polka terish va kod yopish", order: 4 }
      ]);
      console.log('Boshlang\'ich vazifa shablonlari yaratildi');
    }
  })
  .catch((err) => console.error('MongoDB ulanish xatosi:', err));

// Routes

// Login endpoint
app.post('/api/login', async (req, res) => {
  try {
    const { login, password } = req.body;
    
    // Admin login tekshirish (to'liq huquq)
    if (login === process.env.ADMIN_LOGIN && password === process.env.ADMIN_PASSWORD) {
      res.json({
        ok: true,
        message: 'Muvaffaqiyatli kirildi',
        role: 'admin' // To'liq huquq
      });
    } 
    // Manager login tekshirish (faqat ko'rish rejimi)
    else if (login === process.env.MANAGER_LOGIN && password === process.env.MANAGER_PASSWORD) {
      res.json({
        ok: true,
        message: 'Muvaffaqiyatli kirildi (Ko\'rish rejimi)',
        role: 'manager' // Faqat ko'rish
      });
    } 
    else {
      res.status(401).json({
        ok: false,
        error: 'Login yoki parol noto\'g\'ri'
      });
    }
  } catch (error) {
    res.status(500).json({
      ok: false,
      error: error.message
    });
  }
});

// Barcha filiallarni olish
app.get('/api/branches', async (req, res) => {
  try {
    // Bugungi sanani olamiz
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0]; // Kecha
    
    const branches = await Branch.find();
    
    // Vazifa shablonlarini yuklaymiz (sotuvchi uchun)
    const taskTemplates = await TaskTemplate.find({ position: 'sotuvchi' }).sort({ order: 1 });
    const standardTaskKeys = taskTemplates.map(t => t._id.toString());
    
    const branchesWithEmployees = await Promise.all(
      branches.map(async (branch) => {
        const employees = await Employee.find({ branchId: branch._id });
        
        // Agar biror xodimning oxirgi savdo sanasi kecha bo'lsa, tarixga saqlaymiz
        const needsSave = employees.some(emp => 
          emp.position === 'sotuvchi' && 
          emp.lastSalesDate && 
          emp.lastSalesDate === yesterday &&
          emp.dailySales > 0
        );
        
        if (needsSave) {
          // Kechagi ma'lumotlarni tarixga saqlaymiz
          const employeesData = employees.map(emp => {
            let salary = 0;
            if (emp.position === 'sotuvchi' && emp.dailySales) {
              const baseSalary = (emp.dailySales * emp.percentage) / 100;
              if (emp.dailyTasks) {
                const completedTasks = [
                  emp.dailyTasks.onTime,
                  emp.dailyTasks.polkaClean,
                  emp.dailyTasks.productCheck,
                  emp.dailyTasks.polkaCode
                ].filter(task => task === true).length;
                const incompleteTasks = 4 - completedTasks;
                const taskPercentage = 100 - (incompleteTasks * 10);
                salary = (baseSalary * taskPercentage) / 100;
              } else {
                salary = baseSalary;
              }
            } else {
              salary = (branch.totalSales * emp.percentage) / 100;
            }
            
            return {
              employeeId: emp._id,
              name: emp.name,
              position: emp.position,
              percentage: emp.percentage,
              dailySales: emp.dailySales || 0,
              dailyTasks: emp.dailyTasks,
              salary: salary
            };
          });
          
          // Tarixga saqlaymiz
          const existing = await DailySalesHistory.findOne({ date: yesterday, branchId: branch._id });
          if (!existing) {
            await DailySalesHistory.create({
              date: yesterday,
              branchId: branch._id,
              totalSales: branch.totalSales,
              employees: employeesData
            });
          }
        }
        
        // Har bir xodimni tekshiramiz va eski savdolarni tozalaymiz
        const processedEmployees = await Promise.all(employees.map(async (emp) => {
          let dailySales = emp.dailySales || 0;
          let wholesaleSales = emp.wholesaleSales || 0;
          let dailyTasks = emp.dailyTasks || {};
          
          // Agar sotuvchi bo'lsa
          if (emp.position === 'sotuvchi') {
            // Vazifalar obyektini standartlashtirish
            // Faqat task template'larda mavjud vazifalarni qoldirish
            const standardizedTasks = {};
            for (const template of taskTemplates) {
              const taskId = template._id.toString();
              standardizedTasks[taskId] = dailyTasks[taskId] || false;
            }
            dailyTasks = standardizedTasks;
            
            // Agar oxirgi savdo sanasi bugun emas bo'lsa, 0 ga qaytaramiz
            if (emp.lastSalesDate && emp.lastSalesDate !== today) {
              dailySales = 0;
              wholesaleSales = 0;
              // Bazada ham yangilaymiz
              await Employee.findByIdAndUpdate(emp._id, { 
                dailySales: 0,
                wholesaleSales: 0,
                lastSalesDate: null,
                dailyTasks: standardizedTasks
              });
            } else if (JSON.stringify(emp.dailyTasks) !== JSON.stringify(standardizedTasks)) {
              // Agar vazifalar standartlashtirilmagan bo'lsa, yangilaymiz
              await Employee.findByIdAndUpdate(emp._id, { 
                dailyTasks: standardizedTasks
              });
            }
          }
          
          return {
            id: emp._id.toString(),
            name: emp.name,
            position: emp.position,
            percentage: emp.percentage,
            dailyTasks: dailyTasks,
            dailySales: dailySales,
            wholesaleSales: wholesaleSales,
            lastSalesDate: emp.lastSalesDate,
            fixedBonus: emp.fixedBonus || 0
          };
        }));
        
        return {
          _id: branch._id,
          name: branch.name,
          totalSales: branch.totalSales,
          retailSales: branch.retailSales || 0,
          wholesaleSales: branch.wholesaleSales || 0,
          penaltyFund: branch.penaltyFund || 0,
          employees: processedEmployees
        };
      })
    );
    res.json(branchesWithEmployees);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Filial yaratish
app.post('/api/branches', async (req, res) => {
  try {
    const branch = new Branch(req.body);
    await branch.save();
    res.status(201).json(branch);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Filial savdosini yangilash
app.put('/api/branches/:id/sales', async (req, res) => {
  try {
    const updateData = { 
      totalSales: req.body.totalSales 
    };
    
    // Agar retailSales va wholesaleSales berilgan bo'lsa, ularni ham yangilaymiz
    if (req.body.retailSales !== undefined) {
      updateData.retailSales = req.body.retailSales;
    }
    if (req.body.wholesaleSales !== undefined) {
      updateData.wholesaleSales = req.body.wholesaleSales;
    }
    
    const branch = await Branch.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    );
    
    res.json(branch);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Xodim qo'shish
app.post('/api/employees', async (req, res) => {
  try {
    const employeeData = { ...req.body };
    
    // Agar sotuvchi bo'lsa, vazifalarni standartlashtirish
    if (employeeData.position === 'sotuvchi') {
      const taskTemplates = await TaskTemplate.find({ position: 'sotuvchi' }).sort({ order: 1 });
      const standardizedTasks = {};
      for (const template of taskTemplates) {
        const taskId = template._id.toString();
        standardizedTasks[taskId] = employeeData.dailyTasks?.[taskId] || false;
      }
      employeeData.dailyTasks = standardizedTasks;
    }
    
    const employee = new Employee(employeeData);
    await employee.save();
    res.status(201).json({
      id: employee._id.toString(),
      name: employee.name,
      position: employee.position,
      percentage: employee.percentage,
      dailyTasks: employee.dailyTasks || {},
      dailySales: employee.dailySales || 0,
      wholesaleSales: employee.wholesaleSales || 0
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Xodimni yangilash
app.put('/api/employees/:id', async (req, res) => {
  try {
    const updateData = { 
      name: req.body.name, 
      position: req.body.position, 
      percentage: req.body.percentage, 
      dailyTasks: req.body.dailyTasks,
      dailySales: req.body.dailySales,
      wholesaleSales: req.body.wholesaleSales
    };
    
    // Agar fixedBonus berilgan bo'lsa, uni ham yangilaymiz
    if (req.body.fixedBonus !== undefined) {
      updateData.fixedBonus = req.body.fixedBonus;
    }
    
    // Agar dailySales yoki wholesaleSales yangilansa, bugungi sanani saqlaymiz
    if (req.body.dailySales !== undefined || req.body.wholesaleSales !== undefined) {
      const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
      updateData.lastSalesDate = today;
    }
    
    const employee = await Employee.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    );
    res.json({
      id: employee._id.toString(),
      name: employee.name,
      position: employee.position,
      percentage: employee.percentage,
      dailyTasks: employee.dailyTasks || {},
      dailySales: employee.dailySales,
      wholesaleSales: employee.wholesaleSales,
      lastSalesDate: employee.lastSalesDate,
      fixedBonus: employee.fixedBonus || 0
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Xodimni o'chirish
app.delete('/api/employees/:id', async (req, res) => {
  try {
    await Employee.findByIdAndDelete(req.params.id);
    res.json({ message: "O'chirildi" });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Xodim vazifalarini yangilash
app.put('/api/employees/:id/tasks', async (req, res) => {
  try {
    const employee = await Employee.findByIdAndUpdate(
      req.params.id,
      { dailyTasks: req.body.dailyTasks },
      { new: true }
    );
    res.json({
      id: employee._id.toString(),
      dailyTasks: employee.dailyTasks || {}
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Boshlang'ich ma'lumotlarni yaratish
app.post('/api/init', async (req, res) => {
  try {
    const count = await Branch.countDocuments();
    if (count === 0) {
      await Branch.insertMany([
        { name: "Asosiy Sklad", totalSales: 0 },
        { name: "G'ijduvon Filial", totalSales: 0 },
        { name: "Navoiy Filial", totalSales: 0 }
      ]);
      res.json({ message: "Boshlang'ich ma'lumotlar yaratildi" });
    } else {
      res.json({ message: "Ma'lumotlar allaqachon mavjud" });
    }
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Regos dan kunlik savdo ma'lumotlarini olish
app.post('/api/regos/sync-sales', async (req, res) => {
  try {
    const { date } = req.body; // Format: YYYY-MM-DD
    const salesData = await regosService.getDailySales(date);
    
    // Savdo ma'lumotlarini qaytaramiz
    res.json({
      ok: true,
      date: date,
      sales: salesData
    });
  } catch (error) {
    res.status(500).json({ 
      ok: false, 
      error: error.message 
    });
  }
});

// Regos dan filiallarni olish
app.get('/api/regos/departments', async (req, res) => {
  try {
    const departments = await regosService.getDepartments();
    res.json({
      ok: true,
      departments: departments.result || []
    });
  } catch (error) {
    res.status(500).json({ 
      ok: false, 
      error: error.message 
    });
  }
});

// Filial savdosini Regos dan yangilash
app.post('/api/branches/:id/sync-from-regos', async (req, res) => {
  try {
    const { departmentId, date } = req.body;
    const salesData = await regosService.getSalesByDepartment(departmentId, date, date);
    
    // Savdo summasini hisoblaymiz
    const totalSales = salesData.result?.total_sum || 0;
    
    // Bazada yangilaymiz
    const branch = await Branch.findByIdAndUpdate(
      req.params.id,
      { totalSales: totalSales },
      { new: true }
    );
    
    res.json({
      ok: true,
      branch: branch,
      salesData: salesData
    });
  } catch (error) {
    res.status(500).json({ 
      ok: false, 
      error: error.message 
    });
  }
});

// Xodimlarni import qilish (CSV yoki JSON)
app.post('/api/employees/import', async (req, res) => {
  try {
    const { employees, branchId } = req.body;
    
    // Xodimlarni yaratish
    const createdEmployees = [];
    for (const emp of employees) {
      const employee = new Employee({
        name: emp.name,
        position: emp.position || 'ishchi',
        percentage: emp.percentage || 0,
        branchId: branchId,
        dailyTasks: emp.position === 'sotuvchi' ? {
          onTime: false,
          polkaClean: false,
          productCheck: false,
          polkaCode: false
        } : undefined
      });
      await employee.save();
      createdEmployees.push({
        id: employee._id.toString(),
        name: employee.name,
        position: employee.position,
        percentage: employee.percentage
      });
    }
    
    res.json({
      ok: true,
      count: createdEmployees.length,
      employees: createdEmployees
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Xodimlarni export qilish
app.get('/api/employees/export/:branchId', async (req, res) => {
  try {
    const employees = await Employee.find({ branchId: req.params.branchId });
    
    const exportData = employees.map(emp => ({
      name: emp.name,
      position: emp.position,
      percentage: emp.percentage,
      dailyTasks: emp.dailyTasks
    }));
    
    res.json({
      ok: true,
      employees: exportData
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Kunlik savdoni tarixga saqlash
app.post('/api/history/save-daily', async (req, res) => {
  try {
    const { date, branchId } = req.body;
    const targetDate = date || new Date().toISOString().split('T')[0];
    
    // Filial va xodimlarni olamiz
    const branch = await Branch.findById(branchId);
    if (!branch) {
      return res.status(404).json({ ok: false, error: 'Filial topilmadi' });
    }
    
    const employees = await Employee.find({ branchId: branchId });
    
    // Xodimlar ma'lumotlarini tayyorlaymiz
    let totalPenalty = 0; // Jami jarima summasi
    const employeesData = employees.map(emp => {
      // Oylikni hisoblaymiz
      let salary = 0;
      let penaltyAmount = 0;
      
      if (emp.position === 'sotuvchi' && (emp.dailySales || emp.wholesaleSales)) {
        // Sotuvchi uchun: kunlik savdodan hisoblash
        // Chakana savdo (to'liq foiz)
        const retailSalary = (emp.dailySales || 0) * emp.percentage / 100;
        
        // Optom savdo (yarim foiz)
        const wholesaleSalary = (emp.wholesaleSales || 0) * emp.percentage / 100 / 2;
        
        // Jami asosiy oylik
        const baseSalary = retailSalary + wholesaleSalary;
        
        // Vazifalar foizini hisoblaymiz
        if (emp.dailyTasks && Object.keys(emp.dailyTasks).length > 0) {
          const completedTasks = Object.values(emp.dailyTasks).filter(task => task === true).length;
          const totalTasks = Object.keys(emp.dailyTasks).length;
          const incompleteTasks = totalTasks - completedTasks;
          const taskPercentage = 100 - (incompleteTasks * 10);
          salary = (baseSalary * taskPercentage) / 100;
          
          // Jarima summasi = to'liq oylik - kamaytirilgan oylik
          penaltyAmount = baseSalary - salary;
          totalPenalty += penaltyAmount;
        } else {
          salary = baseSalary;
        }
      } else {
        // Boshqa xodimlar uchun chakana va optom savdodan hisoblash
        const retailSalary = (branch.retailSales || 0) * emp.percentage / 100;
        const wholesaleSalary = (branch.wholesaleSales || 0) * emp.percentage / 100 / 2;
        const baseSalary = retailSalary + wholesaleSalary;
        
        // Vazifalar foizini hisoblaymiz (barcha lavozimlar uchun)
        if (emp.dailyTasks && Object.keys(emp.dailyTasks).length > 0) {
          const completedTasks = Object.values(emp.dailyTasks).filter(task => task === true).length;
          const totalTasks = Object.keys(emp.dailyTasks).length;
          const incompleteTasks = totalTasks - completedTasks;
          const taskPercentage = 100 - (incompleteTasks * 10);
          salary = (baseSalary * taskPercentage) / 100;
          
          // Jarima summasi = to'liq oylik - kamaytirilgan oylik
          penaltyAmount = baseSalary - salary;
          totalPenalty += penaltyAmount;
        } else {
          salary = baseSalary;
        }
      }
      
      return {
        employeeId: emp._id,
        name: emp.name,
        position: emp.position,
        percentage: emp.percentage,
        dailySales: emp.dailySales || 0,
        wholesaleSales: emp.wholesaleSales || 0,
        dailyTasks: emp.dailyTasks,
        salary: salary,
        penaltyAmount: penaltyAmount
      };
    });
    
    // Tarixda shu sana uchun yozuv bormi tekshiramiz
    const existing = await DailySalesHistory.findOne({ date: targetDate, branchId: branchId });
    
    if (existing) {
      // Mavjud bo'lsa, yangilaymiz
      existing.totalSales = branch.totalSales;
      existing.retailSales = branch.retailSales || 0;
      existing.wholesaleSales = branch.wholesaleSales || 0;
      existing.penaltyAmount = totalPenalty;
      existing.employees = employeesData;
      await existing.save();
    } else {
      // Yo'q bo'lsa, yangi yaratamiz
      const history = new DailySalesHistory({
        date: targetDate,
        branchId: branchId,
        totalSales: branch.totalSales,
        retailSales: branch.retailSales || 0,
        wholesaleSales: branch.wholesaleSales || 0,
        penaltyAmount: totalPenalty,
        employees: employeesData
      });
      await history.save();
    }
    
    // Jarimani filialning jamg'armasiga qo'shamiz
    await Branch.findByIdAndUpdate(branchId, { 
      $inc: { penaltyFund: totalPenalty }
    });
    
    // Tarixga saqlagandan keyin ma'lumotlarni 0 ga qaytaramiz
    // 1. BARCHA xodimlarning kunlik savdosini 0 ga qilamiz (faqat sotuvchi emas!)
    await Employee.updateMany(
      { branchId: branchId },
      { 
        dailySales: 0,
        wholesaleSales: 0,
        lastSalesDate: null
      }
    );
    
    // 2. Filialning umumiy savdosini 0 ga qilamiz
    await Branch.findByIdAndUpdate(branchId, { 
      totalSales: 0,
      retailSales: 0,
      wholesaleSales: 0
    });
    
    res.json({
      ok: true,
      message: 'Kunlik savdo tarixga saqlandi va ma\'lumotlar 0 ga qaytarildi',
      date: targetDate
    });
  } catch (error) {
    res.status(500).json({ 
      ok: false, 
      error: error.message 
    });
  }
});

// Tarixni olish (filial bo'yicha)
app.get('/api/history/:branchId', async (req, res) => {
  try {
    const { branchId } = req.params;
    const { startDate, endDate, limit } = req.query;
    
    let query = { branchId: branchId };
    
    // Sana oralig'i bo'yicha filter
    if (startDate && endDate) {
      query.date = { $gte: startDate, $lte: endDate };
    }
    
    const history = await DailySalesHistory.find(query)
      .sort({ date: -1 }) // Eng yangi birinchi
      .limit(limit ? parseInt(limit) : 30); // Default 30 kun
    
    res.json({
      ok: true,
      history: history
    });
  } catch (error) {
    res.status(500).json({ 
      ok: false, 
      error: error.message 
    });
  }
});

// Tarixni o'chirish
app.delete('/api/history/:historyId', async (req, res) => {
  try {
    const { historyId } = req.params;
    
    const deleted = await DailySalesHistory.findByIdAndDelete(historyId);
    
    if (!deleted) {
      return res.status(404).json({
        ok: false,
        error: 'Tarix topilmadi'
      });
    }
    
    console.log(`Tarix o'chirildi: ${deleted.date}`);
    
    res.json({
      ok: true,
      message: 'Tarix o\'chirildi'
    });
  } catch (error) {
    res.status(500).json({ 
      ok: false, 
      error: error.message 
    });
  }
});

// Barcha sotuvchilarning vazifalarini tuzatish (migration)
app.post('/api/employees/fix-tasks', async (req, res) => {
  try {
    // Barcha sotuvchilarni topamiz
    const sotuvchilar = await Employee.find({ position: 'sotuvchi' });
    
    let fixed = 0;
    for (const emp of sotuvchilar) {
      // Agar dailyTasks yo'q bo'lsa, false qilib qo'yamiz
      if (!emp.dailyTasks) {
        emp.dailyTasks = {
          onTime: false,
          polkaClean: false,
          productCheck: false,
          polkaCode: false
        };
        await emp.save();
        fixed++;
      }
    }
    
    res.json({
      ok: true,
      message: `${fixed} ta sotuvchining vazifalar tuzatildi`,
      total: sotuvchilar.length
    });
  } catch (error) {
    res.status(500).json({ 
      ok: false, 
      error: error.message 
    });
  }
});

// ============ VAZIFA SHABLONLARI (TASK TEMPLATES) ============

// Barcha vazifa shablonlarini olish
app.get('/api/task-templates', async (req, res) => {
  try {
    const { position } = req.query;
    const query = position ? { position } : {};
    const templates = await TaskTemplate.find(query).sort({ order: 1 });
    res.json({
      ok: true,
      templates: templates
    });
  } catch (error) {
    res.status(500).json({ 
      ok: false, 
      error: error.message 
    });
  }
});

// Yangi vazifa shabloni qo'shish
app.post('/api/task-templates', async (req, res) => {
  try {
    const { position, taskName, description } = req.body;
    
    // Shu lavozim uchun oxirgi tartib raqamini topamiz
    const lastTask = await TaskTemplate.findOne({ position }).sort({ order: -1 });
    const order = lastTask ? lastTask.order + 1 : 1;
    
    const template = new TaskTemplate({
      position,
      taskName,
      description,
      order
    });
    
    await template.save();
    
    res.json({
      ok: true,
      template: template
    });
  } catch (error) {
    res.status(400).json({ 
      ok: false, 
      error: error.message 
    });
  }
});

// Vazifa shablonini tahrirlash
app.put('/api/task-templates/:id', async (req, res) => {
  try {
    const { taskName, description } = req.body;
    
    const template = await TaskTemplate.findByIdAndUpdate(
      req.params.id,
      { taskName, description },
      { new: true }
    );
    
    if (!template) {
      return res.status(404).json({
        ok: false,
        error: 'Vazifa topilmadi'
      });
    }
    
    res.json({
      ok: true,
      template: template
    });
  } catch (error) {
    res.status(400).json({ 
      ok: false, 
      error: error.message 
    });
  }
});

// Vazifa shablonini o'chirish
app.delete('/api/task-templates/:id', async (req, res) => {
  try {
    const template = await TaskTemplate.findByIdAndDelete(req.params.id);
    
    if (!template) {
      return res.status(404).json({
        ok: false,
        error: 'Vazifa topilmadi'
      });
    }
    
    res.json({
      ok: true,
      message: 'Vazifa o\'chirildi'
    });
  } catch (error) {
    res.status(400).json({ 
      ok: false, 
      error: error.message 
    });
  }
});

// Migration: Eski ma'lumotlarni yangilash (totalSales -> retailSales)
app.post('/api/migrate-sales', async (req, res) => {
  try {
    const branches = await Branch.find();
    let updated = 0;
    
    for (const branch of branches) {
      // Agar retailSales va wholesaleSales bo'sh bo'lsa, totalSales'dan ko'chiramiz
      if ((branch.retailSales === undefined || branch.retailSales === 0) && 
          (branch.wholesaleSales === undefined || branch.wholesaleSales === 0) &&
          branch.totalSales > 0) {
        
        // Asosiy Sklad emas bo'lsa, totalSales'ni retailSales ga ko'chiramiz
        if (branch.name !== "Asosiy Sklad") {
          await Branch.findByIdAndUpdate(branch._id, {
            retailSales: branch.totalSales,
            wholesaleSales: 0
          });
          updated++;
        }
      }
    }
    
    res.json({
      ok: true,
      message: `${updated} ta filial yangilandi`,
      updated: updated
    });
  } catch (error) {
    res.status(500).json({
      ok: false,
      error: error.message
    });
  }
});

// ============ LAVOZIMLAR API ============

// Barcha lavozimlarni olish
app.get('/api/positions', async (req, res) => {
  try {
    const positions = await Position.find().sort({ isDefault: -1, createdAt: 1 });
    res.json({
      ok: true,
      positions: positions.map(p => ({
        id: p.id,
        name: p.name,
        color: p.color,
        isDefault: p.isDefault
      }))
    });
  } catch (error) {
    res.status(500).json({
      ok: false,
      error: error.message
    });
  }
});

// Yangi lavozim qo'shish
app.post('/api/positions', async (req, res) => {
  try {
    const { id, name, color } = req.body;
    
    // Dublikat tekshirish
    const existing = await Position.findOne({ id });
    if (existing) {
      return res.status(400).json({
        ok: false,
        error: 'Bu lavozim allaqachon mavjud'
      });
    }
    
    const position = new Position({
      id,
      name,
      color,
      isDefault: false
    });
    
    await position.save();
    
    res.json({
      ok: true,
      position: {
        id: position.id,
        name: position.name,
        color: position.color,
        isDefault: position.isDefault
      }
    });
  } catch (error) {
    res.status(500).json({
      ok: false,
      error: error.message
    });
  }
});

// Lavozimni o'chirish (faqat custom lavozimlar)
app.delete('/api/positions/:id', async (req, res) => {
  try {
    const position = await Position.findOne({ id: req.params.id });
    
    if (!position) {
      return res.status(404).json({
        ok: false,
        error: 'Lavozim topilmadi'
      });
    }
    
    if (position.isDefault) {
      return res.status(400).json({
        ok: false,
        error: 'Standart lavozimlarni o\'chirish mumkin emas'
      });
    }
    
    // Bu lavozimda xodimlar bormi tekshirish
    const employeeCount = await Employee.countDocuments({ position: req.params.id });
    if (employeeCount > 0) {
      return res.status(400).json({
        ok: false,
        error: `Bu lavozimda ${employeeCount} ta xodim mavjud. Avval ularni boshqa lavozimga o'tkazing.`
      });
    }
    
    await Position.deleteOne({ id: req.params.id });
    
    res.json({
      ok: true,
      message: 'Lavozim o\'chirildi'
    });
  } catch (error) {
    res.status(500).json({
      ok: false,
      error: error.message
    });
  }
});

// Vazifalarni tuzatish: Faqat sotuvchilar uchun vazifalar qoldirish
app.post('/api/employees/fix-non-seller-tasks', async (req, res) => {
  try {
    const { branchId } = req.body;
    
    // Sotuvchi bo'lmagan xodimlarning vazifalarini o'chiramiz
    const result = await Employee.updateMany(
      { 
        branchId: branchId,
        position: { $ne: 'sotuvchi' } // sotuvchi emas
      },
      { 
        $set: { dailyTasks: {} } // Vazifalarni bo'sh qilamiz
      }
    );
    
    res.json({
      ok: true,
      message: `${result.modifiedCount} ta xodimning vazifalar o'chirildi`,
      modifiedCount: result.modifiedCount
    });
  } catch (error) {
    res.status(500).json({ 
      ok: false, 
      error: error.message 
    });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server ${PORT} portda ishlamoqda`);
});
