import { Router, Request, Response } from 'express';
import mongoose from 'mongoose';
import { authenticate, requireAdminOrSuperAdmin } from '../middleware/auth.middleware';
import { Employee, Attendance, Shift } from '../models/Employee.model';

const router = Router();

// All employee routes require authentication and admin role
router.use(authenticate, requireAdminOrSuperAdmin);

function getRestaurantId(req: Request): string {
  return (req as any).user.restaurantId;
}

function startOfDay(d: Date): Date {
  const dt = new Date(d);
  dt.setHours(0, 0, 0, 0);
  return dt;
}

function endOfDay(d: Date): Date {
  const dt = new Date(d);
  dt.setHours(23, 59, 59, 999);
  return dt;
}

// ═══════════════════════════════════════════════════════════════════════════════
// EMPLOYEES
// ═══════════════════════════════════════════════════════════════════════════════

// GET /employees — list with pagination and filters
router.get('/employees', async (req: Request, res: Response) => {
  try {
    const restaurantId = getRestaurantId(req);
    const { role, isActive, search, page = '1', limit = '50' } = req.query;

    const filter: any = { restaurantId };
    if (role) filter.role = role;
    if (isActive !== undefined) filter.isActive = isActive === 'true';
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
      ];
    }

    const pageNum = parseInt(page as string, 10) || 1;
    const limitNum = parseInt(limit as string, 10) || 50;
    const skip = (pageNum - 1) * limitNum;

    const [employees, total] = await Promise.all([
      Employee.find(filter).sort({ name: 1 }).skip(skip).limit(limitNum).lean(),
      Employee.countDocuments(filter),
    ]);

    res.json({ employees, total, page: pageNum, limit: limitNum, pages: Math.ceil(total / limitNum) });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// POST /employees — create employee
router.post('/employees', async (req: Request, res: Response) => {
  try {
    const restaurantId = getRestaurantId(req);
    const { name, email, phone, role, department, joiningDate, salary, salaryType, address, emergencyContact, userId } = req.body;

    const employee = new Employee({
      restaurantId,
      name,
      email,
      phone,
      role,
      department,
      joiningDate: joiningDate ? new Date(joiningDate) : new Date(),
      salary: Number(salary),
      salaryType: salaryType || 'monthly',
      isActive: true,
      address,
      emergencyContact,
      userId: userId || null,
    });

    await employee.save();
    res.status(201).json(employee);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// PUT /employees/:id — update employee
router.put('/employees/:id', async (req: Request, res: Response) => {
  try {
    const restaurantId = getRestaurantId(req);
    const { name, email, phone, role, department, joiningDate, salary, salaryType, isActive, address, emergencyContact } = req.body;

    const update: any = {};
    if (name !== undefined) update.name = name;
    if (email !== undefined) update.email = email;
    if (phone !== undefined) update.phone = phone;
    if (role !== undefined) update.role = role;
    if (department !== undefined) update.department = department;
    if (joiningDate !== undefined) update.joiningDate = new Date(joiningDate);
    if (salary !== undefined) update.salary = Number(salary);
    if (salaryType !== undefined) update.salaryType = salaryType;
    if (isActive !== undefined) update.isActive = isActive;
    if (address !== undefined) update.address = address;
    if (emergencyContact !== undefined) update.emergencyContact = emergencyContact;

    const employee = await Employee.findOneAndUpdate(
      { _id: req.params.id, restaurantId },
      { $set: update },
      { new: true, runValidators: true }
    );

    if (!employee) return res.status(404).json({ error: 'Employee not found' });
    res.json(employee);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// DELETE /employees/:id — soft delete (isActive: false)
router.delete('/employees/:id', async (req: Request, res: Response) => {
  try {
    const restaurantId = getRestaurantId(req);
    const employee = await Employee.findOneAndUpdate(
      { _id: req.params.id, restaurantId },
      { $set: { isActive: false } },
      { new: true }
    );
    if (!employee) return res.status(404).json({ error: 'Employee not found' });
    res.json({ message: 'Employee deactivated', employee });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ═══════════════════════════════════════════════════════════════════════════════
// ATTENDANCE
// ═══════════════════════════════════════════════════════════════════════════════

// GET /attendance/summary — today's counts (must be before /attendance/:id)
router.get('/attendance/summary', async (req: Request, res: Response) => {
  try {
    const restaurantId = getRestaurantId(req);
    const today = new Date();

    const records = await Attendance.find({
      restaurantId,
      date: { $gte: startOfDay(today), $lte: endOfDay(today) },
    }).lean();

    const summary = {
      present: records.filter((r) => r.status === 'present').length,
      absent: records.filter((r) => r.status === 'absent').length,
      late: records.filter((r) => r.status === 'late').length,
      halfDay: records.filter((r) => r.status === 'half-day').length,
      holiday: records.filter((r) => r.status === 'holiday').length,
      total: records.length,
    };

    res.json(summary);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// GET /attendance — list with filters
router.get('/attendance', async (req: Request, res: Response) => {
  try {
    const restaurantId = getRestaurantId(req);
    const { date, employeeId, month } = req.query;

    const filter: any = { restaurantId };

    if (date) {
      const d = new Date(date as string);
      filter.date = { $gte: startOfDay(d), $lte: endOfDay(d) };
    } else if (month) {
      // month = "YYYY-MM"
      const [year, mon] = (month as string).split('-').map(Number);
      const start = new Date(year, mon - 1, 1);
      const end = new Date(year, mon, 0, 23, 59, 59, 999);
      filter.date = { $gte: start, $lte: end };
    }

    if (employeeId) filter.employeeId = employeeId;

    const records = await Attendance.find(filter)
      .populate('employeeId', 'name role phone department')
      .sort({ date: -1 })
      .lean();

    res.json(records);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// POST /attendance — mark attendance (upsert by employeeId + date)
router.post('/attendance', async (req: Request, res: Response) => {
  try {
    const restaurantId = getRestaurantId(req);
    const { employeeId, date, checkIn, checkOut, status, hoursWorked, notes } = req.body;

    if (!employeeId || !date || !status) {
      return res.status(400).json({ error: 'employeeId, date, and status are required' });
    }

    const d = new Date(date);
    const dayStart = startOfDay(d);
    const dayEnd = endOfDay(d);

    // Calculate hoursWorked automatically if checkIn and checkOut provided
    let computedHours = hoursWorked;
    if (!computedHours && checkIn && checkOut) {
      const inTime = new Date(checkIn).getTime();
      const outTime = new Date(checkOut).getTime();
      if (outTime > inTime) {
        computedHours = Math.round(((outTime - inTime) / (1000 * 60 * 60)) * 100) / 100;
      }
    }

    const record = await Attendance.findOneAndUpdate(
      {
        restaurantId,
        employeeId: new mongoose.Types.ObjectId(employeeId),
        date: { $gte: dayStart, $lte: dayEnd },
      },
      {
        $set: {
          restaurantId,
          employeeId,
          date: dayStart,
          ...(checkIn && { checkIn: new Date(checkIn) }),
          ...(checkOut && { checkOut: new Date(checkOut) }),
          status,
          ...(computedHours !== undefined && { hoursWorked: computedHours }),
          ...(notes !== undefined && { notes }),
        },
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    res.status(201).json(record);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// PUT /attendance/:id — update (checkOut, status, notes)
router.put('/attendance/:id', async (req: Request, res: Response) => {
  try {
    const restaurantId = getRestaurantId(req);
    const { checkIn, checkOut, status, hoursWorked, notes } = req.body;

    const update: any = {};
    if (checkIn !== undefined) update.checkIn = new Date(checkIn);
    if (checkOut !== undefined) update.checkOut = new Date(checkOut);
    if (status !== undefined) update.status = status;
    if (hoursWorked !== undefined) update.hoursWorked = hoursWorked;
    if (notes !== undefined) update.notes = notes;

    // Auto-calculate hoursWorked if both times present
    if (update.checkIn && update.checkOut) {
      const diff = update.checkOut.getTime() - update.checkIn.getTime();
      if (diff > 0) update.hoursWorked = Math.round((diff / (1000 * 60 * 60)) * 100) / 100;
    }

    const record = await Attendance.findOneAndUpdate(
      { _id: req.params.id, restaurantId },
      { $set: update },
      { new: true, runValidators: true }
    ).populate('employeeId', 'name role');

    if (!record) return res.status(404).json({ error: 'Attendance record not found' });
    res.json(record);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// ═══════════════════════════════════════════════════════════════════════════════
// SHIFTS
// ═══════════════════════════════════════════════════════════════════════════════

// GET /shifts — list with filters
router.get('/shifts', async (req: Request, res: Response) => {
  try {
    const restaurantId = getRestaurantId(req);
    const { date, employeeId, weekStart } = req.query;

    const filter: any = { restaurantId };

    if (date) {
      const d = new Date(date as string);
      filter.date = { $gte: startOfDay(d), $lte: endOfDay(d) };
    } else if (weekStart) {
      const ws = new Date(weekStart as string);
      const we = new Date(ws);
      we.setDate(we.getDate() + 6);
      filter.date = { $gte: startOfDay(ws), $lte: endOfDay(we) };
    }

    if (employeeId) filter.employeeId = employeeId;

    const shifts = await Shift.find(filter)
      .populate('employeeId', 'name role phone')
      .sort({ date: 1, startTime: 1 })
      .lean();

    res.json(shifts);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// POST /shifts — create shift
router.post('/shifts', async (req: Request, res: Response) => {
  try {
    const restaurantId = getRestaurantId(req);
    const { employeeId, date, startTime, endTime, role, notes } = req.body;

    if (!employeeId || !date || !startTime || !endTime || !role) {
      return res.status(400).json({ error: 'employeeId, date, startTime, endTime, role are required' });
    }

    const shift = new Shift({
      restaurantId,
      employeeId,
      date: new Date(date),
      startTime,
      endTime,
      role,
      status: 'scheduled',
      notes,
    });

    await shift.save();
    const populated = await Shift.findById(shift._id).populate('employeeId', 'name role phone').lean();
    res.status(201).json(populated);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// PUT /shifts/:id — update status / details
router.put('/shifts/:id', async (req: Request, res: Response) => {
  try {
    const restaurantId = getRestaurantId(req);
    const { status, startTime, endTime, role, notes } = req.body;

    const update: any = {};
    if (status !== undefined) update.status = status;
    if (startTime !== undefined) update.startTime = startTime;
    if (endTime !== undefined) update.endTime = endTime;
    if (role !== undefined) update.role = role;
    if (notes !== undefined) update.notes = notes;

    const shift = await Shift.findOneAndUpdate(
      { _id: req.params.id, restaurantId },
      { $set: update },
      { new: true, runValidators: true }
    ).populate('employeeId', 'name role');

    if (!shift) return res.status(404).json({ error: 'Shift not found' });
    res.json(shift);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// DELETE /shifts/:id — delete shift
router.delete('/shifts/:id', async (req: Request, res: Response) => {
  try {
    const restaurantId = getRestaurantId(req);
    const shift = await Shift.findOneAndDelete({ _id: req.params.id, restaurantId });
    if (!shift) return res.status(404).json({ error: 'Shift not found' });
    res.json({ message: 'Shift deleted' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ═══════════════════════════════════════════════════════════════════════════════
// PAYROLL
// ═══════════════════════════════════════════════════════════════════════════════

// GET /payroll — calculate payroll for ?month=YYYY-MM
router.get('/payroll', async (req: Request, res: Response) => {
  try {
    const restaurantId = getRestaurantId(req);
    const { month } = req.query;

    // Default to current month
    const now = new Date();
    const monthStr = (month as string) || `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    const [year, mon] = monthStr.split('-').map(Number);

    const monthStart = new Date(year, mon - 1, 1);
    const monthEnd = new Date(year, mon, 0, 23, 59, 59, 999);
    const totalDays = monthEnd.getDate();
    const workingDays = Math.ceil(totalDays * (26 / 30)); // approx 26 working days

    // Get all active employees
    const employees = await Employee.find({ restaurantId, isActive: true }).lean();

    // Get attendance for the month
    const attendanceRecords = await Attendance.find({
      restaurantId,
      date: { $gte: monthStart, $lte: monthEnd },
      status: { $in: ['present', 'late', 'half-day'] },
    }).lean();

    // Build attendance map: employeeId -> count of days (half-day = 0.5)
    const attendanceMap = new Map<string, number>();
    for (const rec of attendanceRecords) {
      const key = rec.employeeId.toString();
      const prev = attendanceMap.get(key) || 0;
      if (rec.status === 'half-day') {
        attendanceMap.set(key, prev + 0.5);
      } else {
        attendanceMap.set(key, prev + 1);
      }
    }

    const payroll = employees.map((emp) => {
      const daysPresent = attendanceMap.get(emp._id.toString()) || 0;
      let earned = 0;

      if (emp.salaryType === 'monthly') {
        // Prorate based on working days
        earned = (emp.salary / workingDays) * daysPresent;
      } else if (emp.salaryType === 'daily') {
        earned = emp.salary * daysPresent;
      } else if (emp.salaryType === 'hourly') {
        // Assume 8 hours per present day
        earned = emp.salary * 8 * daysPresent;
      }

      earned = Math.round(earned * 100) / 100;

      return {
        employee: {
          _id: emp._id,
          name: emp.name,
          role: emp.role,
          department: emp.department,
          salary: emp.salary,
          salaryType: emp.salaryType,
        },
        daysPresent,
        totalDays: workingDays,
        salary: emp.salary,
        salaryType: emp.salaryType,
        earned,
        deductions: 0,
        netPayable: earned,
      };
    });

    const totalPayroll = payroll.reduce((sum, p) => sum + p.earned, 0);

    res.json({
      month: monthStr,
      workingDays,
      payroll,
      totalPayroll: Math.round(totalPayroll * 100) / 100,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
