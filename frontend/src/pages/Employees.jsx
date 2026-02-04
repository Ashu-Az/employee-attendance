import React, { useState, useEffect } from 'react';
import { UserPlus, Trash2, Search, ChevronDown, CheckCircle2, XCircle, Mail, Briefcase } from 'lucide-react';
import { useEmployees } from '@/context/DataContext';
import { employeeAPI } from '@/services/api';
import Loader from '@/components/Loader';
import EmptyState from '@/components/EmptyState';
import ConfirmModal from '@/components/ConfirmModal';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';

const DEPARTMENTS = [
  'Engineering', 'Marketing', 'Sales', 'Human Resources',
  'Finance', 'Operations', 'Design', 'Legal',
];

const validators = {
  employeeId: (v) => (!v.trim() ? 'Employee ID is required.' : null),
  fullName: (v) => (!v.trim() ? 'Full name is required.' : null),
  email: (v) => {
    if (!v.trim()) return 'Email address is required.';
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()) ? null : 'Please enter a valid email address.';
  },
  department: (v) => (!v ? 'Please select a department.' : null),
};

function Employees({ showToast }) {
  const { employees, loading, error, refresh, getCachedAttendance, fetchEmployeeAttendance, invalidateEmployeeAttendance } = useEmployees();

  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ employeeId: '', fullName: '', email: '', department: '' });
  const [fieldErrors, setFieldErrors] = useState({});
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [employeeToDelete, setEmployeeToDelete] = useState(null);

  const [search, setSearch] = useState('');
  const [filterDept, setFilterDept] = useState('');

  const [expandedEmpId, setExpandedEmpId] = useState(null);
  const [history, setHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  useEffect(() => {
    if (!expandedEmpId) { setHistory([]); return; }
    const cached = getCachedAttendance(expandedEmpId);
    if (cached) { setHistory(cached); setHistoryLoading(false); return; }
    let cancelled = false;
    setHistoryLoading(true);
    fetchEmployeeAttendance(expandedEmpId)
      .then((data) => { if (!cancelled) { setHistory(data); setHistoryLoading(false); } })
      .catch(() => { if (!cancelled) { setHistory([]); setHistoryLoading(false); } });
    return () => { cancelled = true; };
  }, [expandedEmpId, getCachedAttendance, fetchEmployeeAttendance]);

  const handleBlur = (e) => {
    const msg = validators[e.target.name]?.(e.target.value) || null;
    setFieldErrors((prev) => ({ ...prev, [e.target.name]: msg }));
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (fieldErrors[name]) setFieldErrors((prev) => ({ ...prev, [name]: null }));
    if (formError) setFormError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errors = {};
    let hasError = false;
    Object.keys(validators).forEach((name) => {
      const msg = validators[name](formData[name]);
      errors[name] = msg;
      if (msg) hasError = true;
    });
    setFieldErrors(errors);
    if (hasError) return;

    setSubmitting(true);
    setFormError('');
    try {
      await employeeAPI.create(formData);
      showToast('Employee added successfully.');
      setFormData({ employeeId: '', fullName: '', email: '', department: '' });
      setFieldErrors({});
      setShowForm(false);
      await refresh();
    } catch (err) {
      setFormError(err.response?.data?.message || 'Failed to add employee.');
    } finally { setSubmitting(false); }
  };

  const handleDeleteConfirm = async () => {
    try {
      await employeeAPI.remove(employeeToDelete.id);
      showToast('Employee removed successfully.');
      invalidateEmployeeAttendance(employeeToDelete.employeeId);
      if (expandedEmpId === employeeToDelete.employeeId) setExpandedEmpId(null);
      setEmployeeToDelete(null);
      await refresh();
    } catch {
      showToast('Failed to delete employee. Please try again.', 'error');
      setEmployeeToDelete(null);
    }
  };

  const filtered = employees.filter((emp) => {
    const s = search.toLowerCase();
    const matchesSearch =
      emp.fullName.toLowerCase().includes(s) ||
      emp.employeeId.toLowerCase().includes(s) ||
      emp.email.toLowerCase().includes(s);
    return matchesSearch && (!filterDept || emp.department === filterDept);
  });

  if (loading) return <Loader />;

  if (error) {
    return (
      <Card>
        <CardContent className="pt-5 text-center py-8">
          <p className="text-red-600 text-sm">{error}</p>
          <button onClick={refresh} className="mt-3 text-indigo-600 hover:underline text-sm font-medium">Try Again</button>
        </CardContent>
      </Card>
    );
  }

  const inputBorder = (name) =>
    fieldErrors[name] ? 'border-red-400 focus:ring-red-300' : 'border-gray-300 focus:ring-indigo-400';

  const presentCount = history.filter((r) => r.status === 'Present').length;
  const absentCount = history.filter((r) => r.status === 'Absent').length;

  return (
    <div className="max-w-5xl">
      {/* Action bar */}
      <div className="flex items-center justify-between mb-5 animate-slide-up">
        <p className="text-sm text-gray-500">
          {employees.length} employee{employees.length !== 1 ? 's' : ''} registered
        </p>
        <button
          onClick={() => { setShowForm(!showForm); setFieldErrors({}); setFormError(''); }}
          className="flex items-center gap-2 bg-indigo-600 text-white text-sm font-medium px-4 py-2.5 rounded-lg hover:bg-indigo-700 active:bg-indigo-800 transition-colors shadow-sm shadow-indigo-200"
        >
          <UserPlus size={16} />
          {showForm ? 'Cancel' : 'Add Employee'}
        </button>
      </div>

      {/* Add Employee Form */}
      {showForm && (
        <Card className="mb-6 animate-fade-in">
          <CardHeader>
            <CardTitle>New Employee Details</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  { name: 'employeeId', label: 'Employee ID', placeholder: 'e.g. EMP001' },
                  { name: 'fullName', label: 'Full Name', placeholder: 'John Doe' },
                  { name: 'email', label: 'Email Address', placeholder: 'john@example.com' },
                ].map((field) => (
                  <div key={field.name}>
                    <label className="block text-sm font-medium text-gray-600 mb-1.5">
                      {field.label} <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="text"
                      name={field.name}
                      value={formData[field.name]}
                      onChange={handleInputChange}
                      onBlur={handleBlur}
                      placeholder={field.placeholder}
                      className={`w-full px-3 py-2 border ${inputBorder(field.name)} rounded-lg text-sm focus:outline-none focus:ring-2 focus:border-transparent transition-shadow`}
                    />
                    {fieldErrors[field.name] && <p className="text-red-500 text-xs mt-1">{fieldErrors[field.name]}</p>}
                  </div>
                ))}

                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1.5">
                    Department <span className="text-red-400">*</span>
                  </label>
                  <select
                    name="department"
                    value={formData.department}
                    onChange={handleInputChange}
                    onBlur={handleBlur}
                    className={`w-full px-3 py-2 border ${inputBorder('department')} rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:border-transparent transition-shadow`}
                  >
                    <option value="">Select department</option>
                    {DEPARTMENTS.map((d) => <option key={d} value={d}>{d}</option>)}
                  </select>
                  {fieldErrors.department && <p className="text-red-500 text-xs mt-1">{fieldErrors.department}</p>}
                </div>
              </div>

              {formError && <p className="text-red-500 text-sm mt-3 animate-fade-in">{formError}</p>}

              <div className="mt-5">
                <button
                  type="submit"
                  disabled={submitting}
                  className="bg-indigo-600 text-white text-sm font-medium px-5 py-2.5 rounded-lg hover:bg-indigo-700 active:bg-indigo-800 transition-colors disabled:opacity-60 disabled:cursor-not-allowed shadow-sm shadow-indigo-200"
                >
                  {submitting ? 'Adding…' : 'Add Employee'}
                </button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Search + Filter */}
      {employees.length > 0 && (
        <div className="flex flex-wrap items-center gap-3 mb-4">
          <div className="relative flex-1 min-w-[180px] max-w-sm">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name, ID or email…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent"
            />
          </div>
          <select
            value={filterDept}
            onChange={(e) => setFilterDept(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent"
          >
            <option value="">All Departments</option>
            {DEPARTMENTS.map((d) => <option key={d} value={d}>{d}</option>)}
          </select>
          {(search || filterDept) && (
            <button onClick={() => { setSearch(''); setFilterDept(''); }} className="text-xs text-indigo-600 hover:underline">
              Clear filters
            </button>
          )}
        </div>
      )}

      {/* Employee Table */}
      {employees.length === 0 ? (
        <EmptyState message="No employees added yet. Click 'Add Employee' to get started." />
      ) : filtered.length === 0 ? (
        <Card>
          <CardContent className="py-10 text-center">
            <p className="text-gray-400 text-sm">No employees match your filters.</p>
          </CardContent>
        </Card>
      ) : (
        <Card className="overflow-hidden animate-slide-up">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-gray-50">
                <TableHead>ID</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((emp) => {
                const isOpen = expandedEmpId === emp.employeeId;
                return (
                  <React.Fragment key={emp.id}>
                    <TableRow
                      onClick={() => setExpandedEmpId(isOpen ? null : emp.employeeId)}
                      className={`cursor-pointer select-none ${isOpen ? 'bg-indigo-50 hover:bg-indigo-50' : ''}`}
                    >
                      <TableCell className="font-semibold text-gray-800">{emp.employeeId}</TableCell>
                      <TableCell className="text-gray-700">{emp.fullName}</TableCell>
                      <TableCell className="text-gray-500">{emp.email}</TableCell>
                      <TableCell><Badge variant="default">{emp.department}</Badge></TableCell>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <button
                            onClick={(e) => { e.stopPropagation(); setEmployeeToDelete(emp); }}
                            className="flex items-center gap-1.5 text-red-500 hover:text-red-700 text-sm transition-colors"
                          >
                            <Trash2 size={15} /> Delete
                          </button>
                          <ChevronDown size={16} className={`text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                        </div>
                      </TableCell>
                    </TableRow>

                    {/* Expanded detail */}
                    {isOpen && (
                      <tr className="border-b border-gray-100">
                        <td colSpan={5} className="p-0">
                          <div className="bg-gray-50 border-t border-indigo-100 px-5 py-4 animate-fade-in">
                            <div className="flex flex-wrap items-start justify-between gap-4">
                              <div className="flex flex-wrap gap-3">
                                <div className="flex items-center gap-1.5 text-sm text-gray-600">
                                  <Mail size={14} className="text-gray-400" />
                                  <span>{emp.email}</span>
                                </div>
                                <div className="flex items-center gap-1.5 text-sm text-gray-600">
                                  <Briefcase size={14} className="text-gray-400" />
                                  <span>{emp.department}</span>
                                </div>
                              </div>
                              <div className="flex gap-2">
                                <Badge variant="success"><CheckCircle2 size={12} /> Present: {presentCount}</Badge>
                                <Badge variant="destructive"><XCircle size={12} /> Absent: {absentCount}</Badge>
                              </div>
                            </div>

                            <div className="mt-4">
                              {historyLoading ? (
                                <p className="text-xs text-gray-400 italic">Loading history…</p>
                              ) : history.length === 0 ? (
                                <p className="text-xs text-gray-400 italic">No attendance records yet.</p>
                              ) : (
                                <div className="rounded-lg border border-gray-200 overflow-hidden">
                                  <Table>
                                    <TableHeader>
                                      <TableRow className="hover:bg-gray-50">
                                        <TableHead>Date</TableHead>
                                        <TableHead>Status</TableHead>
                                      </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                      {history.map((record, i) => (
                                        <TableRow key={i} className="hover:bg-white">
                                          <TableCell className="text-gray-600">{record.date}</TableCell>
                                          <TableCell>
                                            <Badge variant={record.status === 'Present' ? 'success' : 'destructive'}>
                                              {record.status === 'Present' ? <CheckCircle2 size={12} /> : <XCircle size={12} />}
                                              {record.status}
                                            </Badge>
                                          </TableCell>
                                        </TableRow>
                                      ))}
                                    </TableBody>
                                  </Table>
                                </div>
                              )}
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
            </TableBody>
          </Table>
        </Card>
      )}

      {/* Delete modal */}
      {employeeToDelete && (
        <ConfirmModal
          title="Delete Employee"
          message={`Are you sure you want to delete "${employeeToDelete.fullName}" (${employeeToDelete.employeeId})? Their attendance records will also be removed. This cannot be undone.`}
          onConfirm={handleDeleteConfirm}
          onCancel={() => setEmployeeToDelete(null)}
        />
      )}
    </div>
  );
}

export default Employees;
