'use client';

import { useState, useEffect, useCallback } from 'react';
import api from '@/services/api';

// ─── Types ────────────────────────────────────────────────────────────────────

type EmployeeRole = 'manager' | 'cashier' | 'chef' | 'waiter' | 'delivery' | 'cleaner';
type SalaryType = 'monthly' | 'daily' | 'hourly';
type AttendanceStatus = 'present' | 'absent' | 'late' | 'half-day' | 'holiday';
type ShiftStatus = 'scheduled' | 'completed' | 'missed';

interface Employee {
  _id: string;
  name: string;
  email: string;
  phone: string;
  role: EmployeeRole;
  department: string;
  joiningDate: string;
  salary: number;
  salaryType: SalaryType;
  isActive: boolean;
  address?: string;
  emergencyContact?: string;
}

interface AttendanceRecord {
  _id: string;
  employeeId: Employee | string;
  date: string;
  checkIn?: string;
  checkOut?: string;
  status: AttendanceStatus;
  hoursWorked?: number;
  notes?: string;
}

interface Shift {
  _id: string;
  employeeId: Employee | string;
  date: string;
  startTime: string;
  endTime: string;
  role: string;
  status: ShiftStatus;
  notes?: string;
}

interface PayrollItem {
  employee: {
    _id: string;
    name: string;
    role: EmployeeRole;
    department: string;
    salary: number;
    salaryType: SalaryType;
  };
  daysPresent: number;
  totalDays: number;
  salary: number;
  salaryType: SalaryType;
  earned: number;
  deductions: number;
  netPayable: number;
}

interface PayrollResponse {
  month: string;
  workingDays: number;
  payroll: PayrollItem[];
  totalPayroll: number;
}

interface AttendanceSummary {
  present: number;
  absent: number;
  late: number;
  halfDay: number;
  total: number;
}

// ─── Color constants ──────────────────────────────────────────────────────────

const C = {
  bg: '#080808',
  card: '#111111',
  cardHover: '#161616',
  border: 'rgba(200,151,42,0.18)',
  borderBright: 'rgba(200,151,42,0.4)',
  gold: '#c8972a',
  goldLight: '#f0c060',
  goldDark: '#8b5a00',
  goldGrad: 'linear-gradient(135deg,#8b5a00,#c8972a,#f0c060)',
  text: '#f8f4ed',
  textMuted: '#a89070',
  textDim: '#6b5a40',
  danger: '#e05252',
  success: '#4caf7d',
  warning: '#e0a050',
  info: '#5090e0',
  orange: '#e07830',
};

const roleColors: Record<string, string> = {
  manager: C.gold,
  chef: C.orange,
  waiter: C.info,
  cashier: C.success,
  delivery: '#9070e0',
  cleaner: C.textMuted,
};

const statusColors: Record<string, string> = {
  present: C.success,
  absent: C.danger,
  late: C.warning,
  'half-day': C.info,
  holiday: C.textMuted,
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmt(n: number) {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n);
}

function today() {
  return new Date().toISOString().split('T')[0];
}

function currentMonth() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
}

function getMonday(d: Date) {
  const dt = new Date(d);
  const day = dt.getDay();
  const diff = dt.getDate() - day + (day === 0 ? -6 : 1);
  dt.setDate(diff);
  dt.setHours(0, 0, 0, 0);
  return dt;
}

function addDays(d: Date, n: number) {
  const dt = new Date(d);
  dt.setDate(dt.getDate() + n);
  return dt;
}

function formatTime(isoStr?: string) {
  if (!isoStr) return '-';
  const d = new Date(isoStr);
  return d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });
}

function avatarLetter(name: string) {
  return name ? name[0].toUpperCase() : '?';
}

function getEmployeeName(e: Employee | string | undefined): string {
  if (!e) return '-';
  if (typeof e === 'string') return e;
  return e.name;
}

function getEmployeeObj(e: Employee | string | undefined): Employee | null {
  if (!e || typeof e === 'string') return null;
  return e;
}

// ─── Shared UI components ─────────────────────────────────────────────────────

function GoldButton({ onClick, children, style, disabled }: { onClick?: () => void; children: React.ReactNode; style?: React.CSSProperties; disabled?: boolean }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        background: disabled ? '#2a2a2a' : C.goldGrad,
        color: disabled ? C.textDim : '#080808',
        border: 'none',
        borderRadius: 10,
        padding: '8px 18px',
        fontWeight: 700,
        fontSize: 13,
        cursor: disabled ? 'not-allowed' : 'pointer',
        whiteSpace: 'nowrap',
        ...style,
      }}
    >
      {children}
    </button>
  );
}

function OutlineButton({ onClick, children, style, color }: { onClick?: () => void; children: React.ReactNode; style?: React.CSSProperties; color?: string }) {
  const c = color || C.gold;
  return (
    <button
      onClick={onClick}
      style={{
        background: 'transparent',
        color: c,
        border: `1px solid ${c}55`,
        borderRadius: 10,
        padding: '7px 14px',
        fontWeight: 600,
        fontSize: 12,
        cursor: 'pointer',
        whiteSpace: 'nowrap',
        ...style,
      }}
    >
      {children}
    </button>
  );
}

function Input({ value, onChange, placeholder, type = 'text', style }: { value: string; onChange: (v: string) => void; placeholder?: string; type?: string; style?: React.CSSProperties }) {
  return (
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      style={{
        background: '#1a1a1a',
        color: C.text,
        border: `1px solid ${C.border}`,
        borderRadius: 8,
        padding: '8px 12px',
        fontSize: 13,
        outline: 'none',
        width: '100%',
        boxSizing: 'border-box',
        ...style,
      }}
    />
  );
}

function Select({ value, onChange, options, style }: { value: string; onChange: (v: string) => void; options: { value: string; label: string }[]; style?: React.CSSProperties }) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      style={{
        background: '#1a1a1a',
        color: C.text,
        border: `1px solid ${C.border}`,
        borderRadius: 8,
        padding: '8px 12px',
        fontSize: 13,
        outline: 'none',
        width: '100%',
        boxSizing: 'border-box',
        cursor: 'pointer',
        ...style,
      }}
    >
      {options.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  );
}

function Label({ children }: { children: React.ReactNode }) {
  return <div style={{ color: C.textMuted, fontSize: 11, fontWeight: 600, marginBottom: 5, textTransform: 'uppercase', letterSpacing: '0.5px' }}>{children}</div>;
}

function FormField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <Label>{label}</Label>
      {children}
    </div>
  );
}

function Modal({ title, onClose, children, width = 540 }: { title: string; onClose: () => void; children: React.ReactNode; width?: number }) {
  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 1000,
        background: 'rgba(0,0,0,0.75)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 16,
      }}
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: '#141414',
          border: `1px solid ${C.borderBright}`,
          borderRadius: 16,
          width: '100%',
          maxWidth: width,
          maxHeight: '90vh',
          overflowY: 'auto',
          boxShadow: '0 24px 80px rgba(0,0,0,0.8)',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 24px 0' }}>
          <div style={{ color: C.text, fontSize: 18, fontWeight: 700 }}>{title}</div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: C.textMuted, cursor: 'pointer', fontSize: 22, lineHeight: 1 }}>×</button>
        </div>
        <div style={{ padding: 24 }}>{children}</div>
      </div>
    </div>
  );
}

function Badge({ label, color }: { label: string; color: string }) {
  return (
    <span style={{
      display: 'inline-block',
      background: `${color}22`,
      color: color,
      border: `1px solid ${color}44`,
      borderRadius: 6,
      padding: '2px 8px',
      fontSize: 11,
      fontWeight: 700,
      textTransform: 'capitalize',
    }}>{label}</span>
  );
}

// ─── Employee Tab ─────────────────────────────────────────────────────────────

const ROLES: EmployeeRole[] = ['manager', 'cashier', 'chef', 'waiter', 'delivery', 'cleaner'];
const SALARY_TYPES: SalaryType[] = ['monthly', 'daily', 'hourly'];

interface EmployeeForm {
  name: string;
  email: string;
  phone: string;
  role: EmployeeRole;
  department: string;
  joiningDate: string;
  salary: string;
  salaryType: SalaryType;
  address: string;
  emergencyContact: string;
}

const emptyForm: EmployeeForm = {
  name: '', email: '', phone: '',
  role: 'waiter', department: '',
  joiningDate: today(), salary: '',
  salaryType: 'monthly', address: '', emergencyContact: '',
};

function EmployeesTab() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Employee | null>(null);
  const [form, setForm] = useState<EmployeeForm>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const params: any = {};
      if (roleFilter !== 'all') params.role = roleFilter;
      if (search) params.search = search;
      const data = await api.get<any>('/employees/employees', { params });
      setEmployees(Array.isArray(data?.employees) ? data.employees : Array.isArray(data) ? data : []);
    } catch (e: any) {
      setError(e?.message || 'Failed to load employees');
    } finally {
      setLoading(false);
    }
  }, [roleFilter, search]);

  useEffect(() => {
    const t = setTimeout(load, 300);
    return () => clearTimeout(t);
  }, [load]);

  const openAdd = () => {
    setEditing(null);
    setForm(emptyForm);
    setShowModal(true);
  };

  const openEdit = (emp: Employee) => {
    setEditing(emp);
    setForm({
      name: emp.name, email: emp.email, phone: emp.phone,
      role: emp.role, department: emp.department,
      joiningDate: emp.joiningDate?.split('T')[0] || today(),
      salary: String(emp.salary), salaryType: emp.salaryType,
      address: emp.address || '', emergencyContact: emp.emergencyContact || '',
    });
    setShowModal(true);
  };

  const handleSubmit = async () => {
    if (!form.name || !form.phone || !form.role || !form.salary) {
      setError('Name, phone, role, and salary are required');
      return;
    }
    setSaving(true);
    setError('');
    try {
      const payload = { ...form, salary: Number(form.salary) };
      if (editing) {
        await api.put(`/employees/employees/${editing._id}`, payload);
      } else {
        await api.post('/employees/employees', payload);
      }
      setShowModal(false);
      load();
    } catch (e: any) {
      setError(e?.message || 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  const toggleActive = async (emp: Employee) => {
    try {
      if (emp.isActive) {
        await api.delete(`/employees/employees/${emp._id}`);
      } else {
        await api.put(`/employees/employees/${emp._id}`, { isActive: true });
      }
      load();
    } catch (e: any) {
      setError(e?.message || 'Failed to update');
    }
  };

  const setF = (key: keyof EmployeeForm, val: string) => setForm((f) => ({ ...f, [key]: val }));

  return (
    <div>
      {/* Controls */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 20, flexWrap: 'wrap', alignItems: 'center' }}>
        <Input value={search} onChange={setSearch} placeholder="Search employees..." style={{ maxWidth: 260 }} />
        <Select
          value={roleFilter}
          onChange={setRoleFilter}
          options={[{ value: 'all', label: 'All Roles' }, ...ROLES.map((r) => ({ value: r, label: r.charAt(0).toUpperCase() + r.slice(1) }))]}
          style={{ maxWidth: 160 }}
        />
        <div style={{ marginLeft: 'auto' }}>
          <GoldButton onClick={openAdd}>+ Add Employee</GoldButton>
        </div>
      </div>

      {error && <div style={{ color: C.danger, marginBottom: 12, fontSize: 13 }}>{error}</div>}

      {loading ? (
        <div style={{ textAlign: 'center', color: C.textMuted, padding: 60 }}>Loading employees...</div>
      ) : employees.length === 0 ? (
        <div style={{ textAlign: 'center', color: C.textMuted, padding: 60 }}>No employees found. Add your first employee.</div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(280px,1fr))', gap: 16 }}>
          {employees.map((emp) => (
            <div key={emp._id} style={{
              background: C.card,
              border: `1px solid ${C.border}`,
              borderRadius: 14,
              padding: 18,
              position: 'relative',
              opacity: emp.isActive ? 1 : 0.6,
            }}>
              {/* Status dot */}
              <div style={{
                position: 'absolute', top: 14, right: 14,
                width: 10, height: 10, borderRadius: '50%',
                background: emp.isActive ? C.success : C.danger,
                boxShadow: emp.isActive ? `0 0 6px ${C.success}` : 'none',
              }} />

              <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start', marginBottom: 14 }}>
                {/* Avatar */}
                <div style={{
                  width: 46, height: 46, borderRadius: '50%', flexShrink: 0,
                  background: `${roleColors[emp.role] || C.gold}22`,
                  border: `2px solid ${roleColors[emp.role] || C.gold}55`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: roleColors[emp.role] || C.gold,
                  fontWeight: 800, fontSize: 18,
                }}>
                  {avatarLetter(emp.name)}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ color: C.text, fontWeight: 700, fontSize: 15, marginBottom: 4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{emp.name}</div>
                  <Badge label={emp.role} color={roleColors[emp.role] || C.gold} />
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 5, marginBottom: 14 }}>
                <div style={{ color: C.textMuted, fontSize: 12 }}>
                  <span style={{ color: C.textDim }}>Dept:</span> {emp.department}
                </div>
                <div style={{ color: C.textMuted, fontSize: 12 }}>
                  <span style={{ color: C.textDim }}>Phone:</span> {emp.phone}
                </div>
                <div style={{ color: C.textMuted, fontSize: 12 }}>
                  <span style={{ color: C.textDim }}>Salary:</span>{' '}
                  <span style={{ color: C.goldLight }}>{fmt(emp.salary)}</span>{' '}
                  <span style={{ color: C.textDim }}>/ {emp.salaryType}</span>
                </div>
              </div>

              <div style={{ display: 'flex', gap: 8, justifyContent: 'space-between' }}>
                <OutlineButton onClick={() => openEdit(emp)}>Edit</OutlineButton>
                <OutlineButton
                  onClick={() => toggleActive(emp)}
                  color={emp.isActive ? C.danger : C.success}
                >
                  {emp.isActive ? 'Deactivate' : 'Activate'}
                </OutlineButton>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <Modal title={editing ? 'Edit Employee' : 'Add Employee'} onClose={() => setShowModal(false)}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 16px' }}>
            <FormField label="Full Name">
              <Input value={form.name} onChange={(v) => setF('name', v)} placeholder="Employee name" />
            </FormField>
            <FormField label="Phone">
              <Input value={form.phone} onChange={(v) => setF('phone', v)} placeholder="+91 9XXXXXXXXX" />
            </FormField>
            <FormField label="Email">
              <Input value={form.email} onChange={(v) => setF('email', v)} placeholder="email@example.com" type="email" />
            </FormField>
            <FormField label="Department">
              <Input value={form.department} onChange={(v) => setF('department', v)} placeholder="Kitchen, Floor, etc." />
            </FormField>
            <FormField label="Role">
              <Select
                value={form.role}
                onChange={(v) => setF('role', v as EmployeeRole)}
                options={ROLES.map((r) => ({ value: r, label: r.charAt(0).toUpperCase() + r.slice(1) }))}
              />
            </FormField>
            <FormField label="Joining Date">
              <Input value={form.joiningDate} onChange={(v) => setF('joiningDate', v)} type="date" />
            </FormField>
            <FormField label="Salary">
              <Input value={form.salary} onChange={(v) => setF('salary', v)} placeholder="0" type="number" />
            </FormField>
            <FormField label="Salary Type">
              <Select
                value={form.salaryType}
                onChange={(v) => setF('salaryType', v as SalaryType)}
                options={SALARY_TYPES.map((s) => ({ value: s, label: s.charAt(0).toUpperCase() + s.slice(1) }))}
              />
            </FormField>
          </div>
          <FormField label="Address">
            <Input value={form.address} onChange={(v) => setF('address', v)} placeholder="Full address" />
          </FormField>
          <FormField label="Emergency Contact">
            <Input value={form.emergencyContact} onChange={(v) => setF('emergencyContact', v)} placeholder="Name & phone" />
          </FormField>

          {error && <div style={{ color: C.danger, fontSize: 13, marginBottom: 12 }}>{error}</div>}

          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 8 }}>
            <OutlineButton onClick={() => setShowModal(false)}>Cancel</OutlineButton>
            <GoldButton onClick={handleSubmit} disabled={saving}>{saving ? 'Saving...' : editing ? 'Save Changes' : 'Add Employee'}</GoldButton>
          </div>
        </Modal>
      )}
    </div>
  );
}

// ─── Attendance Tab ───────────────────────────────────────────────────────────

function AttendanceTab() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [summary, setSummary] = useState<AttendanceSummary>({ present: 0, absent: 0, late: 0, halfDay: 0, total: 0 });
  const [date, setDate] = useState(today());
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadEmployees();
  }, []);

  useEffect(() => {
    loadAttendance();
    loadSummary();
  }, [date]);

  const loadEmployees = async () => {
    try {
      const data = await api.get<any>('/employees/employees', { params: { limit: 200 } });
      setEmployees(Array.isArray(data?.employees) ? data.employees : Array.isArray(data) ? data : []);
    } catch {}
  };

  const loadAttendance = async () => {
    setLoading(true);
    try {
      const data = await api.get<AttendanceRecord[]>('/employees/attendance', { params: { date } });
      setRecords(Array.isArray(data) ? data : []);
    } catch (e: any) {
      setError(e?.message || 'Failed to load attendance');
    } finally {
      setLoading(false);
    }
  };

  const loadSummary = async () => {
    try {
      const data = await api.get<AttendanceSummary>('/employees/attendance/summary');
      setSummary(data);
    } catch {}
  };

  const markStatus = async (employeeId: string, status: AttendanceStatus) => {
    try {
      await api.post('/employees/attendance', {
        employeeId,
        date,
        status,
        ...(status === 'present' && { checkIn: new Date().toISOString() }),
      });
      loadAttendance();
      loadSummary();
    } catch (e: any) {
      setError(e?.message || 'Failed to mark attendance');
    }
  };

  const bulkMarkPresent = async () => {
    // Mark all employees who don't have an attendance record yet as present
    const markedIds = new Set(records.map((r) => {
      const emp = getEmployeeObj(r.employeeId);
      return emp ? emp._id : r.employeeId;
    }));
    const unmarked = employees.filter((e) => e.isActive && !markedIds.has(e._id));
    await Promise.all(unmarked.map((e) => markStatus(e._id, 'present')));
  };

  // Build a merged list: all active employees for the date, with their record if exists
  const merged = employees
    .filter((emp) => emp.isActive)
    .filter((emp) => !search || emp.name.toLowerCase().includes(search.toLowerCase()))
    .map((emp) => {
      const rec = records.find((r) => {
        const rEmp = getEmployeeObj(r.employeeId);
        return rEmp ? rEmp._id === emp._id : r.employeeId === emp._id;
      });
      return { emp, rec };
    });

  return (
    <div>
      {/* Summary strip */}
      <div style={{
        display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap',
        background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, padding: '14px 20px',
      }}>
        <div style={{ color: C.textMuted, fontSize: 13, fontWeight: 600, marginRight: 6 }}>Today —</div>
        {[
          { label: 'Present', val: summary.present, color: C.success },
          { label: 'Absent', val: summary.absent, color: C.danger },
          { label: 'Late', val: summary.late, color: C.warning },
          { label: 'Half-Day', val: summary.halfDay, color: C.info },
        ].map((s) => (
          <div key={s.label} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ color: s.color, fontWeight: 700, fontSize: 15 }}>{s.val}</span>
            <span style={{ color: C.textDim, fontSize: 12 }}>{s.label}</span>
            <span style={{ color: C.textDim, fontSize: 11, margin: '0 4px' }}>|</span>
          </div>
        ))}
      </div>

      {/* Controls */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 20, flexWrap: 'wrap', alignItems: 'center' }}>
        <Input value={date} onChange={(v) => setDate(v)} type="date" style={{ maxWidth: 180 }} />
        <Input value={search} onChange={setSearch} placeholder="Search employee..." style={{ maxWidth: 220 }} />
        <div style={{ marginLeft: 'auto' }}>
          <GoldButton onClick={bulkMarkPresent}>Bulk Mark Present</GoldButton>
        </div>
      </div>

      {error && <div style={{ color: C.danger, marginBottom: 12, fontSize: 13 }}>{error}</div>}

      {/* Table */}
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr style={{ borderBottom: `1px solid ${C.border}` }}>
              {['Employee', 'Role', 'Status', 'Check-In', 'Check-Out', 'Hours', 'Actions'].map((h) => (
                <th key={h} style={{ textAlign: 'left', padding: '10px 14px', color: C.textMuted, fontWeight: 600, fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.5px' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={7} style={{ textAlign: 'center', padding: 40, color: C.textMuted }}>Loading...</td></tr>
            ) : merged.length === 0 ? (
              <tr><td colSpan={7} style={{ textAlign: 'center', padding: 40, color: C.textMuted }}>No employees found</td></tr>
            ) : merged.map(({ emp, rec }) => (
              <tr key={emp._id} style={{ borderBottom: `1px solid ${C.border}22` }}>
                <td style={{ padding: '12px 14px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{
                      width: 32, height: 32, borderRadius: '50%',
                      background: `${roleColors[emp.role] || C.gold}22`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: roleColors[emp.role] || C.gold, fontWeight: 800, fontSize: 13, flexShrink: 0,
                    }}>{avatarLetter(emp.name)}</div>
                    <span style={{ color: C.text, fontWeight: 600 }}>{emp.name}</span>
                  </div>
                </td>
                <td style={{ padding: '12px 14px' }}><Badge label={emp.role} color={roleColors[emp.role] || C.gold} /></td>
                <td style={{ padding: '12px 14px' }}>
                  {rec ? <Badge label={rec.status} color={statusColors[rec.status] || C.textMuted} /> : <span style={{ color: C.textDim, fontSize: 12 }}>Unmarked</span>}
                </td>
                <td style={{ padding: '12px 14px', color: C.textMuted }}>{rec?.checkIn ? formatTime(rec.checkIn) : '-'}</td>
                <td style={{ padding: '12px 14px', color: C.textMuted }}>{rec?.checkOut ? formatTime(rec.checkOut) : '-'}</td>
                <td style={{ padding: '12px 14px', color: C.textMuted }}>{rec?.hoursWorked ? `${rec.hoursWorked}h` : '-'}</td>
                <td style={{ padding: '12px 14px' }}>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <OutlineButton onClick={() => markStatus(emp._id, 'present')} color={C.success} style={{ padding: '4px 10px', fontSize: 11 }}>P</OutlineButton>
                    <OutlineButton onClick={() => markStatus(emp._id, 'absent')} color={C.danger} style={{ padding: '4px 10px', fontSize: 11 }}>A</OutlineButton>
                    <OutlineButton onClick={() => markStatus(emp._id, 'late')} color={C.warning} style={{ padding: '4px 10px', fontSize: 11 }}>L</OutlineButton>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─── Shifts Tab ───────────────────────────────────────────────────────────────

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

interface ShiftForm {
  employeeId: string;
  date: string;
  startTime: string;
  endTime: string;
  role: string;
  notes: string;
}

function ShiftsTab() {
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [weekStart, setWeekStart] = useState(() => {
    const d = getMonday(new Date());
    return d.toISOString().split('T')[0];
  });
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState<ShiftForm>({ employeeId: '', date: today(), startTime: '09:00', endTime: '17:00', role: 'waiter', notes: '' });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    loadEmployees();
  }, []);

  useEffect(() => {
    loadShifts();
  }, [weekStart]);

  const loadEmployees = async () => {
    try {
      const data = await api.get<any>('/employees/employees', { params: { limit: 200 } });
      setEmployees(Array.isArray(data?.employees) ? data.employees : Array.isArray(data) ? data : []);
    } catch {}
  };

  const loadShifts = async () => {
    try {
      const data = await api.get<Shift[]>('/employees/shifts', { params: { weekStart } });
      setShifts(Array.isArray(data) ? data : []);
    } catch (e: any) {
      setError(e?.message || 'Failed to load shifts');
    }
  };

  const prevWeek = () => {
    const d = new Date(weekStart);
    d.setDate(d.getDate() - 7);
    setWeekStart(d.toISOString().split('T')[0]);
  };

  const nextWeek = () => {
    const d = new Date(weekStart);
    d.setDate(d.getDate() + 7);
    setWeekStart(d.toISOString().split('T')[0]);
  };

  const getShiftsForDay = (dayOffset: number) => {
    const d = addDays(new Date(weekStart), dayOffset);
    const dStr = d.toISOString().split('T')[0];
    return shifts.filter((s) => s.date.startsWith(dStr));
  };

  const handleSubmit = async () => {
    if (!form.employeeId || !form.date || !form.startTime || !form.endTime || !form.role) {
      setError('All required fields must be filled');
      return;
    }
    setSaving(true);
    setError('');
    try {
      await api.post('/employees/shifts', form);
      setShowModal(false);
      loadShifts();
    } catch (e: any) {
      setError(e?.message || 'Failed to create shift');
    } finally {
      setSaving(false);
    }
  };

  const deleteShift = async (id: string) => {
    try {
      await api.delete(`/employees/shifts/${id}`);
      loadShifts();
    } catch {}
  };

  const setF = (key: keyof ShiftForm, val: string) => setForm((f) => ({ ...f, [key]: val }));

  return (
    <div>
      {/* Week navigation */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 20, alignItems: 'center', flexWrap: 'wrap' }}>
        <OutlineButton onClick={prevWeek}>← Prev Week</OutlineButton>
        <div style={{ color: C.text, fontWeight: 700, fontSize: 15 }}>
          Week of {new Date(weekStart).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
        </div>
        <OutlineButton onClick={nextWeek}>Next Week →</OutlineButton>
        <div style={{ marginLeft: 'auto' }}>
          <GoldButton onClick={() => setShowModal(true)}>+ Add Shift</GoldButton>
        </div>
      </div>

      {error && <div style={{ color: C.danger, marginBottom: 12, fontSize: 13 }}>{error}</div>}

      {/* Weekly calendar */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gap: 8, overflowX: 'auto' }}>
        {DAYS.map((day, i) => {
          const d = addDays(new Date(weekStart), i);
          const dayShifts = getShiftsForDay(i);
          const isToday = d.toISOString().split('T')[0] === today();
          return (
            <div key={day} style={{
              background: isToday ? '#1a1400' : C.card,
              border: `1px solid ${isToday ? C.borderBright : C.border}`,
              borderRadius: 12,
              minHeight: 140,
              padding: 10,
            }}>
              <div style={{ marginBottom: 8, textAlign: 'center' }}>
                <div style={{ color: isToday ? C.gold : C.textMuted, fontSize: 11, fontWeight: 700, textTransform: 'uppercase' }}>{day}</div>
                <div style={{ color: isToday ? C.goldLight : C.text, fontSize: 16, fontWeight: 800 }}>{d.getDate()}</div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                {dayShifts.map((shift) => {
                  const empName = getEmployeeName(shift.employeeId);
                  const roleColor = roleColors[shift.role] || roleColors[shift.role.toLowerCase()] || C.gold;
                  return (
                    <div key={shift._id} style={{
                      background: `${roleColor}18`,
                      border: `1px solid ${roleColor}44`,
                      borderRadius: 7,
                      padding: '5px 7px',
                      position: 'relative',
                    }}>
                      <div style={{ color: roleColor, fontSize: 10, fontWeight: 700, marginBottom: 2, textTransform: 'capitalize' }}>{shift.role}</div>
                      <div style={{ color: C.text, fontSize: 11, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{empName}</div>
                      <div style={{ color: C.textMuted, fontSize: 10 }}>{shift.startTime} – {shift.endTime}</div>
                      <button
                        onClick={() => deleteShift(shift._id)}
                        style={{ position: 'absolute', top: 4, right: 4, background: 'none', border: 'none', color: C.textDim, cursor: 'pointer', fontSize: 12, padding: 0, lineHeight: 1 }}
                      >×</button>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Role legend */}
      <div style={{ display: 'flex', gap: 12, marginTop: 16, flexWrap: 'wrap' }}>
        {Object.entries(roleColors).map(([role, color]) => (
          <div key={role} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <div style={{ width: 10, height: 10, borderRadius: 3, background: color }} />
            <span style={{ color: C.textMuted, fontSize: 12, textTransform: 'capitalize' }}>{role}</span>
          </div>
        ))}
      </div>

      {showModal && (
        <Modal title="Add Shift" onClose={() => setShowModal(false)}>
          <FormField label="Employee">
            <Select
              value={form.employeeId}
              onChange={(v) => setF('employeeId', v)}
              options={[{ value: '', label: 'Select employee...' }, ...employees.filter((e) => e.isActive).map((e) => ({ value: e._id, label: `${e.name} (${e.role})` }))]}
            />
          </FormField>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 16px' }}>
            <FormField label="Date">
              <Input value={form.date} onChange={(v) => setF('date', v)} type="date" />
            </FormField>
            <FormField label="Role">
              <Select
                value={form.role}
                onChange={(v) => setF('role', v)}
                options={ROLES.map((r) => ({ value: r, label: r.charAt(0).toUpperCase() + r.slice(1) }))}
              />
            </FormField>
            <FormField label="Start Time">
              <Input value={form.startTime} onChange={(v) => setF('startTime', v)} type="time" />
            </FormField>
            <FormField label="End Time">
              <Input value={form.endTime} onChange={(v) => setF('endTime', v)} type="time" />
            </FormField>
          </div>
          <FormField label="Notes (optional)">
            <Input value={form.notes} onChange={(v) => setF('notes', v)} placeholder="Any notes..." />
          </FormField>

          {error && <div style={{ color: C.danger, fontSize: 13, marginBottom: 12 }}>{error}</div>}

          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 8 }}>
            <OutlineButton onClick={() => setShowModal(false)}>Cancel</OutlineButton>
            <GoldButton onClick={handleSubmit} disabled={saving}>{saving ? 'Saving...' : 'Create Shift'}</GoldButton>
          </div>
        </Modal>
      )}
    </div>
  );
}

// ─── Payroll Tab ──────────────────────────────────────────────────────────────

function PayrollTab() {
  const [month, setMonth] = useState(currentMonth());
  const [data, setData] = useState<PayrollResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const generatePayroll = async () => {
    setLoading(true);
    setError('');
    try {
      const result = await api.get<PayrollResponse>('/employees/payroll', { params: { month } });
      setData(result);
    } catch (e: any) {
      setError(e?.message || 'Failed to generate payroll');
    } finally {
      setLoading(false);
    }
  };

  const handleExport = () => {
    window.print();
  };

  const salaryTypeLabel = (t: SalaryType) => ({ monthly: '/mo', daily: '/day', hourly: '/hr' }[t] || '');

  return (
    <div>
      {/* Controls */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 24, alignItems: 'center', flexWrap: 'wrap' }}>
        <div>
          <Label>Month</Label>
          <Input value={month} onChange={setMonth} type="month" style={{ maxWidth: 200 }} />
        </div>
        <GoldButton onClick={generatePayroll} disabled={loading} style={{ alignSelf: 'flex-end' }}>
          {loading ? 'Generating...' : 'Generate Payroll'}
        </GoldButton>
        {data && (
          <OutlineButton onClick={handleExport} style={{ alignSelf: 'flex-end' }}>Export / Print</OutlineButton>
        )}
      </div>

      {error && <div style={{ color: C.danger, marginBottom: 12, fontSize: 13 }}>{error}</div>}

      {!data && !loading && (
        <div style={{ textAlign: 'center', color: C.textMuted, padding: 60 }}>
          Select a month and click "Generate Payroll" to calculate salaries.
        </div>
      )}

      {data && (
        <>
          {/* Summary */}
          <div style={{ display: 'flex', gap: 16, marginBottom: 20, flexWrap: 'wrap' }}>
            {[
              { label: 'Month', val: data.month },
              { label: 'Working Days', val: data.workingDays },
              { label: 'Employees', val: data.payroll.length },
              { label: 'Total Payroll', val: fmt(data.totalPayroll), highlight: true },
            ].map((s) => (
              <div key={s.label} style={{
                background: s.highlight ? '#1a1200' : C.card,
                border: `1px solid ${s.highlight ? C.borderBright : C.border}`,
                borderRadius: 12, padding: '14px 20px', flex: '1 1 140px',
              }}>
                <div style={{ color: C.textMuted, fontSize: 11, fontWeight: 600, textTransform: 'uppercase', marginBottom: 4 }}>{s.label}</div>
                <div style={{ color: s.highlight ? C.goldLight : C.text, fontSize: s.highlight ? 20 : 18, fontWeight: 800 }}>{s.val}</div>
              </div>
            ))}
          </div>

          {/* Table */}
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead>
                <tr style={{ borderBottom: `1px solid ${C.border}` }}>
                  {['Employee', 'Role', 'Dept', 'Days Present / Total', 'Salary Type', 'Base Salary', 'Earned', 'Deductions', 'Net Payable'].map((h) => (
                    <th key={h} style={{ textAlign: 'left', padding: '10px 14px', color: C.textMuted, fontWeight: 600, fontSize: 11, textTransform: 'uppercase', whiteSpace: 'nowrap' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data.payroll.map((row, i) => (
                  <tr key={row.employee._id} style={{ borderBottom: `1px solid ${C.border}22`, background: i % 2 === 0 ? 'transparent' : '#0c0c0c' }}>
                    <td style={{ padding: '12px 14px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{
                          width: 32, height: 32, borderRadius: '50%',
                          background: `${roleColors[row.employee.role] || C.gold}22`,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          color: roleColors[row.employee.role] || C.gold, fontWeight: 800, fontSize: 13, flexShrink: 0,
                        }}>{avatarLetter(row.employee.name)}</div>
                        <span style={{ color: C.text, fontWeight: 600 }}>{row.employee.name}</span>
                      </div>
                    </td>
                    <td style={{ padding: '12px 14px' }}><Badge label={row.employee.role} color={roleColors[row.employee.role] || C.gold} /></td>
                    <td style={{ padding: '12px 14px', color: C.textMuted }}>{row.employee.department}</td>
                    <td style={{ padding: '12px 14px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ color: row.daysPresent > 0 ? C.success : C.textMuted, fontWeight: 700 }}>{row.daysPresent}</span>
                        <span style={{ color: C.textDim }}>/</span>
                        <span style={{ color: C.textMuted }}>{row.totalDays}</span>
                        <div style={{ flex: 1, maxWidth: 80, height: 4, background: '#2a2a2a', borderRadius: 2 }}>
                          <div style={{ width: `${Math.min(100, (row.daysPresent / row.totalDays) * 100)}%`, height: '100%', background: C.success, borderRadius: 2 }} />
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '12px 14px', color: C.textMuted, textTransform: 'capitalize' }}>{row.salaryType}</td>
                    <td style={{ padding: '12px 14px', color: C.textMuted }}>{fmt(row.salary)}{salaryTypeLabel(row.salaryType)}</td>
                    <td style={{ padding: '12px 14px', color: C.goldLight, fontWeight: 700 }}>{fmt(row.earned)}</td>
                    <td style={{ padding: '12px 14px', color: row.deductions > 0 ? C.danger : C.textDim }}>{row.deductions > 0 ? `-${fmt(row.deductions)}` : '—'}</td>
                    <td style={{ padding: '12px 14px', color: C.text, fontWeight: 700, fontSize: 14 }}>{fmt(row.netPayable)}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr style={{ borderTop: `2px solid ${C.border}` }}>
                  <td colSpan={6} style={{ padding: '14px 14px', color: C.textMuted, fontWeight: 700 }}>Total Payroll</td>
                  <td style={{ padding: '14px 14px', color: C.goldLight, fontWeight: 800, fontSize: 15 }}>{fmt(data.totalPayroll)}</td>
                  <td colSpan={2} />
                </tr>
              </tfoot>
            </table>
          </div>
        </>
      )}
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

type Tab = 'employees' | 'attendance' | 'shifts' | 'payroll';

const TABS: { id: Tab; label: string }[] = [
  { id: 'employees', label: 'Employees' },
  { id: 'attendance', label: 'Attendance' },
  { id: 'shifts', label: 'Shifts' },
  { id: 'payroll', label: 'Payroll' },
];

export default function EmployeesPage() {
  const [activeTab, setActiveTab] = useState<Tab>('employees');

  return (
    <div style={{ background: C.bg, minHeight: '100vh', color: C.text, fontFamily: 'inherit' }}>
      {/* Header */}
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        marginBottom: 28, flexWrap: 'wrap', gap: 12,
      }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 26, fontWeight: 800, color: C.text }}>Employee Management</h1>
          <div style={{ color: C.textMuted, fontSize: 13, marginTop: 4 }}>Manage staff, attendance, shifts and payroll</div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{
            width: 8, height: 8, borderRadius: '50%',
            background: C.success,
            boxShadow: `0 0 6px ${C.success}`,
          }} />
          <span style={{ color: C.textMuted, fontSize: 12 }}>System Active</span>
        </div>
      </div>

      {/* Tabs */}
      <div style={{
        display: 'flex', gap: 4, marginBottom: 28,
        background: C.card, border: `1px solid ${C.border}`,
        borderRadius: 12, padding: 4, width: 'fit-content',
      }}>
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              padding: '9px 24px',
              borderRadius: 9,
              border: 'none',
              fontSize: 13,
              fontWeight: 700,
              cursor: 'pointer',
              transition: 'all 0.18s',
              background: activeTab === tab.id ? C.goldGrad : 'transparent',
              color: activeTab === tab.id ? '#080808' : C.textMuted,
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div>
        {activeTab === 'employees' && <EmployeesTab />}
        {activeTab === 'attendance' && <AttendanceTab />}
        {activeTab === 'shifts' && <ShiftsTab />}
        {activeTab === 'payroll' && <PayrollTab />}
      </div>
    </div>
  );
}
