import React, { useState, useEffect } from 'react';
import { UserPlus, Trash2, Search, ChevronDown, CheckCircle2, XCircle, Mail, Briefcase } from 'lucide-react';
import { useEmployees } from '../context/DataContext';
import { employeeAPI, attendanceAPI } from '../services/api';
import Loader from '../components/Loader';
import EmptyState from '../components/EmptyState';
import ConfirmModal from '../components/ConfirmModal';

const DEPARTMENTS = [
  'Engineering',
  'Marketing',
  'Sales',
  'Human Resources',
  'Finance',
  'Operations',
  'Design',
  'Legal',
];

// ── per-field validators ────────────────────────────────────
const validators = {
  employeeId: (v) => (!v.trim() ? 'Employee ID is required.' : null),
  fullName: (v) => (!v.trim() ? 'Full name is required.' : null),
  email: (v) => {
    if (!v.trim()) return 'Email address is required.';
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim())
      ? null
      : 'Please enter a valid email address.';
  },
  department: (v) => (!v ? 'Please select a department.' : null),
};

function Employees({ showToast }) {
  const { employees, loading, error, refresh } = useEmployees();

  // Form state
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    employeeId: '',
    fullName: '',
    email: '',
    department: '',
  });
  const [fieldErrors, setFieldErrors] = useState({});
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Delete confirmation
  const [employeeToDelete, setEmployeeToDelete] = useState(null);

  // Filters
  const [search, setSearch] = useState('');
  const [filterDept, setFilterDept] = useState('');

  // Expanded row detail
  const [expandedEmpId, setExpandedEmpId] = useState(null);
  const [history, setHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  // Fetch attendance when a row is expanded
  useEffect(() => {
    if (!expandedEmpId) {
      setHistory([]);
      return;
    }
    const fetch = async () => {
      setHistoryLoading(true);
      try {
        const { data } = await attendanceAPI.getByEmployee(expandedEmpId);
        setHistory(data);
      } catch {
        setHistory([]);
      } finally {
        setHistoryLoading(false);
      }
    };
    fetch();
  }, [expandedEmpId]);

  // ── blur validation ────────────────────────────────────────
  const validateField = (name, value) => {
    const msg = validators[name]?.(value) || null;
    setFieldErrors((prev) => ({ ...prev, [name]: msg }));
    return msg;
  };

  const handleBlur = (e) => {
    validateField(e.target.name, e.target.value);
  };

  // ── form handling ──────────────────────────────────────────
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (fieldErrors[name]) {
      setFieldErrors((prev) => ({ ...prev, [name]: null }));
    }
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
      const msg = err.response?.data?.message || 'Failed to add employee.';
      setFormError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  // ── delete handling ────────────────────────────────────────
  const handleDeleteConfirm = async () => {
    try {
      await employeeAPI.remove(employeeToDelete.id);
      showToast('Employee removed successfully.');
      if (expandedEmpId === employeeToDelete.employeeId) setExpandedEmpId(null);
      setEmployeeToDelete(null);
      await refresh();
    } catch (err) {
      showToast('Failed to delete employee. Please try again.', 'error');
      setEmployeeToDelete(null);
    }
  };

  // ── filtered list ──────────────────────────────────────────
  const filtered = employees.filter((emp) => {
    const matchesSearch =
      emp.fullName.toLowerCase().includes(search.toLowerCase()) ||
      emp.employeeId.toLowerCase().includes(search.toLowerCase()) ||
      emp.email.toLowerCase().includes(search.toLowerCase());
    const matchesDept = !filterDept || emp.department === filterDept;
    return matchesSearch && matchesDept;
  });

  // ── render guards ──────────────────────────────────────────
  if (loading) return <Loader />;

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
        <p className="text-red-600 text-sm">{error}</p>
        <button
          onClick={refresh}
          className="mt-3 text-indigo-600 hover:underline text-sm font-medium"
        >
          Try Again
        </button>
      </div>
    );
  }

  // helper: input border class
  const inputBorder = (name) =>
    fieldErrors[name]
      ? 'border-red-400 focus:ring-red-300'
      : 'border-gray-300 focus:ring-indigo-400';

  const presentCount = history.filter((r) => r.status === 'Present').length;
  const absentCount = history.filter((r) => r.status === 'Absent').length;

  // ── main render ────────────────────────────────────────────
  return (
    <div className="max-w-5xl">
      {/* Header row */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-gray-800">Employees</h2>
          <p className="text-gray-500 text-sm mt-0.5">
            {employees.length} employee{employees.length !== 1 ? 's' : ''} registered
          </p>
        </div>
        <button
          onClick={() => {
            setShowForm(!showForm);
            setFieldErrors({});
            setFormError('');
          }}
          className="flex items-center gap-2 bg-indigo-600 text-white text-sm font-medium px-4 py-2.5 rounded-lg hover:bg-indigo-700 transition-colors"
        >
          <UserPlus size={16} />
          {showForm ? 'Cancel' : 'Add Employee'}
        </button>
      </div>

      {/* ── Add employee form ──────────────────────────────── */}
      {showForm && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 mb-6 animate-fade-in">
          <h3 className="text-base font-semibold text-gray-700 mb-4">New Employee Details</h3>

          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Employee ID */}
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1.5">
                  Employee ID <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  name="employeeId"
                  value={formData.employeeId}
                  onChange={handleInputChange}
                  onBlur={handleBlur}
                  placeholder="e.g. EMP001"
                  className={`w-full px-3 py-2 border ${inputBorder('employeeId')} rounded-lg text-sm
                             focus:outline-none focus:ring-2 focus:border-transparent transition-shadow`}
                />
                {fieldErrors.employeeId && (
                  <p className="text-red-500 text-xs mt-1">{fieldErrors.employeeId}</p>
                )}
              </div>

              {/* Full Name */}
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1.5">
                  Full Name <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleInputChange}
                  onBlur={handleBlur}
                  placeholder="John Doe"
                  className={`w-full px-3 py-2 border ${inputBorder('fullName')} rounded-lg text-sm
                             focus:outline-none focus:ring-2 focus:border-transparent transition-shadow`}
                />
                {fieldErrors.fullName && (
                  <p className="text-red-500 text-xs mt-1">{fieldErrors.fullName}</p>
                )}
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1.5">
                  Email Address <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  onBlur={handleBlur}
                  placeholder="john@example.com"
                  className={`w-full px-3 py-2 border ${inputBorder('email')} rounded-lg text-sm
                             focus:outline-none focus:ring-2 focus:border-transparent transition-shadow`}
                />
                {fieldErrors.email && (
                  <p className="text-red-500 text-xs mt-1">{fieldErrors.email}</p>
                )}
              </div>

              {/* Department */}
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1.5">
                  Department <span className="text-red-400">*</span>
                </label>
                <select
                  name="department"
                  value={formData.department}
                  onChange={handleInputChange}
                  onBlur={handleBlur}
                  className={`w-full px-3 py-2 border ${inputBorder('department')} rounded-lg text-sm bg-white
                             focus:outline-none focus:ring-2 focus:border-transparent transition-shadow`}
                >
                  <option value="">Select department</option>
                  {DEPARTMENTS.map((dept) => (
                    <option key={dept} value={dept}>
                      {dept}
                    </option>
                  ))}
                </select>
                {fieldErrors.department && (
                  <p className="text-red-500 text-xs mt-1">{fieldErrors.department}</p>
                )}
              </div>
            </div>

            {/* Server-level error (e.g. duplicate ID 409) */}
            {formError && (
              <p className="text-red-500 text-sm mt-3 animate-fade-in">{formError}</p>
            )}

            {/* Submit button */}
            <div className="mt-5">
              <button
                type="submit"
                disabled={submitting}
                className="bg-indigo-600 text-white text-sm font-medium px-5 py-2.5 rounded-lg
                           hover:bg-indigo-700 transition-colors
                           disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {submitting ? 'Adding…' : 'Add Employee'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ── Search + Department filter bar ──────────────────── */}
      {employees.length > 0 && (
        <div className="flex flex-wrap items-center gap-3 mb-4">
          <div className="relative flex-1 min-w-[180px] max-w-sm">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name, ID or email…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm
                         focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent"
            />
          </div>

          <select
            value={filterDept}
            onChange={(e) => setFilterDept(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white
                       focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent"
          >
            <option value="">All Departments</option>
            {DEPARTMENTS.map((dept) => (
              <option key={dept} value={dept}>
                {dept}
              </option>
            ))}
          </select>

          {(search || filterDept) && (
            <button
              onClick={() => { setSearch(''); setFilterDept(''); }}
              className="text-xs text-indigo-600 hover:underline"
            >
              Clear filters
            </button>
          )}
        </div>
      )}

      {/* ── Employee list / table ────────────────────────── */}
      {employees.length === 0 ? (
        <EmptyState message="No employees added yet. Click 'Add Employee' to get started." />
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-10 text-center">
          <p className="text-gray-400 text-sm">No employees match your filters.</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    ID
                  </th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Department
                  </th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((emp) => {
                  const isOpen = expandedEmpId === emp.employeeId;
                  return (
                    <React.Fragment key={emp.id}>
                      {/* ── main row ── */}
                      <tr
                        onClick={() =>
                          setExpandedEmpId(isOpen ? null : emp.employeeId)
                        }
                        className={[
                          'border-b border-gray-100 transition-colors cursor-pointer select-none',
                          isOpen ? 'bg-indigo-50' : 'hover:bg-gray-50',
                        ].join(' ')}
                      >
                        <td className="px-5 py-3.5 text-sm font-semibold text-gray-800">
                          {emp.employeeId}
                        </td>
                        <td className="px-5 py-3.5 text-sm text-gray-700">{emp.fullName}</td>
                        <td className="px-5 py-3.5 text-sm text-gray-500">{emp.email}</td>
                        <td className="px-5 py-3.5">
                          <span className="inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-50 text-indigo-700">
                            {emp.department}
                          </span>
                        </td>
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-3">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setEmployeeToDelete(emp);
                              }}
                              className="flex items-center gap-1.5 text-red-500 hover:text-red-700 text-sm transition-colors"
                            >
                              <Trash2 size={15} />
                              Delete
                            </button>
                            <ChevronDown
                              size={16}
                              className={[
                                'text-gray-400 transition-transform',
                                isOpen ? 'rotate-180' : '',
                              ].join(' ')}
                            />
                          </div>
                        </td>
                      </tr>

                      {/* ── expanded detail panel ── */}
                      {isOpen && (
                        <tr className="border-b border-gray-100">
                          <td colSpan={5} className="p-0">
                            <div className="bg-gray-50 border-t border-indigo-100 px-5 py-4 animate-fade-in">

                              {/* Details + summary badges */}
                              <div className="flex flex-wrap items-start justify-between gap-4">
                                {/* Left: info pills */}
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

                                {/* Right: attendance summary badges */}
                                <div className="flex gap-3">
                                  <span className="inline-flex items-center gap-1 text-xs font-semibold text-green-700 bg-green-100 px-2.5 py-1 rounded-full">
                                    <CheckCircle2 size={12} />
                                    Present: {presentCount}
                                  </span>
                                  <span className="inline-flex items-center gap-1 text-xs font-semibold text-red-700 bg-red-100 px-2.5 py-1 rounded-full">
                                    <XCircle size={12} />
                                    Absent: {absentCount}
                                  </span>
                                </div>
                              </div>

                              {/* Attendance history */}
                              <div className="mt-4">
                                {historyLoading ? (
                                  <p className="text-xs text-gray-400 italic">Loading history…</p>
                                ) : history.length === 0 ? (
                                  <p className="text-xs text-gray-400 italic">No attendance records yet.</p>
                                ) : (
                                  <div className="overflow-x-auto rounded-lg border border-gray-200">
                                    <table className="w-full text-sm">
                                      <thead>
                                        <tr className="bg-white">
                                          <th className="text-left px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                            Date
                                          </th>
                                          <th className="text-left px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                            Status
                                          </th>
                                        </tr>
                                      </thead>
                                      <tbody>
                                        {history.map((record, i) => (
                                          <tr key={i} className="border-t border-gray-100">
                                            <td className="px-4 py-2 text-sm text-gray-600">{record.date}</td>
                                            <td className="px-4 py-2">
                                              <span
                                                className={[
                                                  'inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium',
                                                  record.status === 'Present'
                                                    ? 'bg-green-100 text-green-700'
                                                    : 'bg-red-100 text-red-700',
                                                ].join(' ')}
                                              >
                                                {record.status === 'Present' ? (
                                                  <CheckCircle2 size={12} />
                                                ) : (
                                                  <XCircle size={12} />
                                                )}
                                                {record.status}
                                              </span>
                                            </td>
                                          </tr>
                                        ))}
                                      </tbody>
                                    </table>
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
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── Delete confirmation modal ──────────────────── */}
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
