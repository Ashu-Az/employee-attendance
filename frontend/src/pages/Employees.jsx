import React, { useState, useEffect } from 'react';
import { UserPlus, Trash2 } from 'lucide-react';
import { employeeAPI } from '../services/api';
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

function Employees({ showToast }) {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Form state
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    employeeId: '',
    fullName: '',
    email: '',
    department: '',
  });
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Delete confirmation
  const [employeeToDelete, setEmployeeToDelete] = useState(null);

  // ── data fetching ──────────────────────────────────────────
  const fetchEmployees = async () => {
    try {
      setLoading(true);
      const { data } = await employeeAPI.getAll();
      setEmployees(data);
      setError(null);
    } catch (err) {
      setError('Something went wrong while loading employees.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  // ── form handling ──────────────────────────────────────────
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (formError) setFormError('');
  };

  const validateForm = () => {
    if (!formData.employeeId.trim()) return 'Employee ID is required.';
    if (!formData.fullName.trim()) return 'Full name is required.';
    if (!formData.email.trim()) return 'Email address is required.';

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(formData.email.trim())) {
      return 'Please enter a valid email address.';
    }

    if (!formData.department) return 'Please select a department.';
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const validationMsg = validateForm();
    if (validationMsg) {
      setFormError(validationMsg);
      return;
    }

    setSubmitting(true);
    try {
      await employeeAPI.create(formData);
      showToast('Employee added successfully.');
      setFormData({ employeeId: '', fullName: '', email: '', department: '' });
      setShowForm(false);
      await fetchEmployees();
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
      await employeeAPI.remove(employeeToDelete._id);
      showToast('Employee removed successfully.');
      setEmployeeToDelete(null);
      await fetchEmployees();
    } catch (err) {
      showToast('Failed to delete employee. Please try again.', 'error');
      setEmployeeToDelete(null);
    }
  };

  // ── render states ──────────────────────────────────────────
  if (loading) return <Loader />;

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
        <p className="text-red-600 text-sm">{error}</p>
        <button
          onClick={fetchEmployees}
          className="mt-3 text-indigo-600 hover:underline text-sm font-medium"
        >
          Try Again
        </button>
      </div>
    );
  }

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
                  placeholder="e.g. EMP001"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm
                             focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent
                             transition-shadow"
                />
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
                  placeholder="John Doe"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm
                             focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent
                             transition-shadow"
                />
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
                  placeholder="john@example.com"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm
                             focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent
                             transition-shadow"
                />
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white
                             focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent
                             transition-shadow"
                >
                  <option value="">Select department</option>
                  {DEPARTMENTS.map((dept) => (
                    <option key={dept} value={dept}>
                      {dept}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Inline error */}
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

      {/* ── Employee list / table ────────────────────────── */}
      {employees.length === 0 ? (
        <EmptyState message="No employees added yet. Click 'Add Employee' to get started." />
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
                {employees.map((emp) => (
                  <tr
                    key={emp._id}
                    className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
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
                      <button
                        onClick={() => setEmployeeToDelete(emp)}
                        className="flex items-center gap-1.5 text-red-500 hover:text-red-700 text-sm transition-colors"
                      >
                        <Trash2 size={15} />
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
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
