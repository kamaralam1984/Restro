import mongoose, { Schema, Document } from 'mongoose';

// ─── IEmployee ────────────────────────────────────────────────────────────────

export type EmployeeRole = 'manager' | 'cashier' | 'chef' | 'waiter' | 'delivery' | 'cleaner';
export type SalaryType = 'monthly' | 'daily' | 'hourly';

export interface IEmployee extends Document {
  restaurantId: mongoose.Types.ObjectId;
  name: string;
  email: string;
  phone: string;
  role: EmployeeRole;
  department: string;
  joiningDate: Date;
  salary: number;
  salaryType: SalaryType;
  isActive: boolean;
  address?: string;
  emergencyContact?: string;
  userId?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const EmployeeSchema = new Schema<IEmployee>(
  {
    restaurantId: {
      type: Schema.Types.ObjectId,
      ref: 'Restaurant',
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    phone: {
      type: String,
      required: true,
      trim: true,
    },
    role: {
      type: String,
      enum: ['manager', 'cashier', 'chef', 'waiter', 'delivery', 'cleaner'],
      required: true,
    },
    department: {
      type: String,
      required: true,
      trim: true,
    },
    joiningDate: {
      type: Date,
      required: true,
    },
    salary: {
      type: Number,
      required: true,
      min: 0,
    },
    salaryType: {
      type: String,
      enum: ['monthly', 'daily', 'hourly'],
      required: true,
      default: 'monthly',
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    address: {
      type: String,
      trim: true,
    },
    emergencyContact: {
      type: String,
      trim: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
  },
  { timestamps: true }
);

EmployeeSchema.index({ restaurantId: 1, email: 1 });
EmployeeSchema.index({ restaurantId: 1, role: 1 });
EmployeeSchema.index({ restaurantId: 1, isActive: 1 });

export const Employee = mongoose.model<IEmployee>('Employee', EmployeeSchema);

// ─── IAttendance ──────────────────────────────────────────────────────────────

export type AttendanceStatus = 'present' | 'absent' | 'late' | 'half-day' | 'holiday';

export interface IAttendance extends Document {
  restaurantId: mongoose.Types.ObjectId;
  employeeId: mongoose.Types.ObjectId;
  date: Date;
  checkIn?: Date;
  checkOut?: Date;
  status: AttendanceStatus;
  hoursWorked?: number;
  notes?: string;
  createdAt: Date;
}

const AttendanceSchema = new Schema<IAttendance>(
  {
    restaurantId: {
      type: Schema.Types.ObjectId,
      ref: 'Restaurant',
      required: true,
      index: true,
    },
    employeeId: {
      type: Schema.Types.ObjectId,
      ref: 'Employee',
      required: true,
    },
    date: {
      type: Date,
      required: true,
    },
    checkIn: {
      type: Date,
    },
    checkOut: {
      type: Date,
    },
    status: {
      type: String,
      enum: ['present', 'absent', 'late', 'half-day', 'holiday'],
      required: true,
      default: 'absent',
    },
    hoursWorked: {
      type: Number,
      min: 0,
    },
    notes: {
      type: String,
      trim: true,
    },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

AttendanceSchema.index({ restaurantId: 1, date: 1 });
AttendanceSchema.index({ restaurantId: 1, employeeId: 1, date: 1 }, { unique: true });

export const Attendance = mongoose.model<IAttendance>('Attendance', AttendanceSchema);

// ─── IShift ───────────────────────────────────────────────────────────────────

export type ShiftStatus = 'scheduled' | 'completed' | 'missed';

export interface IShift extends Document {
  restaurantId: mongoose.Types.ObjectId;
  employeeId: mongoose.Types.ObjectId;
  date: Date;
  startTime: string;
  endTime: string;
  role: string;
  status: ShiftStatus;
  notes?: string;
  createdAt: Date;
}

const ShiftSchema = new Schema<IShift>(
  {
    restaurantId: {
      type: Schema.Types.ObjectId,
      ref: 'Restaurant',
      required: true,
      index: true,
    },
    employeeId: {
      type: Schema.Types.ObjectId,
      ref: 'Employee',
      required: true,
    },
    date: {
      type: Date,
      required: true,
    },
    startTime: {
      type: String,
      required: true,
      trim: true,
    },
    endTime: {
      type: String,
      required: true,
      trim: true,
    },
    role: {
      type: String,
      required: true,
      trim: true,
    },
    status: {
      type: String,
      enum: ['scheduled', 'completed', 'missed'],
      required: true,
      default: 'scheduled',
    },
    notes: {
      type: String,
      trim: true,
    },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

ShiftSchema.index({ restaurantId: 1, date: 1 });
ShiftSchema.index({ restaurantId: 1, employeeId: 1, date: 1 });

export const Shift = mongoose.model<IShift>('Shift', ShiftSchema);
