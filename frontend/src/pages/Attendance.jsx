import React, { useState, useEffect } from 'react';
import { ClipboardCheck, CheckCircle2, XCircle } from 'lucide-react';
import { employeeAPI, attendanceAPI } from '../services/api';
import Loader from '../components/Loader';

function Attendance({ showToast }) {
  // Master list of employees (for the dropdown)
  const [employees, setEmployees] = useState([]);

  // Form state
  const [selectedEmployeeId, setSelectedEmployeeId] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [status, setStatus] = useState('Present');
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Records for the chosen employee
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [recordsLoading, setRecordsLoading] = useState(false);

  // Date filter (bonus feature)
  const [filterDate, setFilterDate] = useState('');

  // Initial load – just need the employee list
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const { data } = await employeeAPI.getAll();
        setEmployees(data);
      } catch (err) {
        setFormError('Failed to load employee list.');
      } finally {
        setLoading(false);
      }
    };
    fetchEmployees();
  }, []);

  // Whenever the selected employee changes, pull their attendance
  useEffect(() => {
    if (!selectedEmployeeId) {
      setAttendanceRecords([]);
      return;
    }

    const fetchRecords = async () => {
      setRecordsLoading(true);
      try {
        const { data } = await attendanceAPI.getByEmployee(selectedEmployeeId);
        setAttendanceRecords(data);
      } catch (err) {
        setFormError('Failed to load attendance records.');
      } finally {
        setRecordsLoading(false);
      }
    };

    fetchRecords();
  }, [selectedEmployeeId]);

  // ── mark attendance ──────────────────────────────────────
  const handleMarkAttendance = async (e) => {
    e.preventDefault();

    if (!selectedEmployeeId) {
      setFormError('Please select an employee.');
      return;
    }
    if (!date) {
      setFormError('Please pick a date.');
      return;
    }

    setSubmitting(true);
    setFormError('');

    try {
      const { data } = await attendanceAPI.mark({
        employeeId: selectedEmployeeId,
        date,
        status,
      });

      showToast(data.updated ? 'Attendance updated.' : 'Attendance marked successfully.');

      // Refresh the records table immediately
      const { data: updated } = await attendanceAPI.getByEmployee(selectedEmployeeId);
      setAttendanceRecords(updated);
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to mark attendance.';
      setFormError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  // ── derived data ─────────────────────────────────────────
  const selectedEmployee = employees.find((e) => e.employeeId === selectedEmployeeId);

  // Apply the optional date filter
  const displayedRecords = filterDate
    ? attendanceRecords.filter((r) => r.date === filterDate)
    : attendanceRecords;

  // Totals (bonus)
  const presentCount = attendanceRecords.filter((r) => r.status === 'Present').length;
  const absentCount = attendanceRecords.filter((r) => r.status === 'Absent').length;

  // ── render ───────────────────────────────────────────────
  if (loading) return <Loader />;

  return (
    <div className="max-w-4xl">
      {/* ── Mark attendance card ─────────────────────────── */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 mb-6">
        <h3 className="text-base font-semibold text-gray-700 mb-4">Mark Attendance</h3>

        <form onSubmit={handleMarkAttendance}>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Employee dropdown */}
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1.5">Employee</label>
              <select
                value={selectedEmployeeId}
                onChange={(e) => {
                  setSelectedEmployeeId(e.target.value);
                  setFormError('');
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white
                           focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent
                           transition-shadow"
              >
                <option value="">Select employee</option>
                {employees.map((emp) => (
                  <option key={emp.employeeId} value={emp.employeeId}>
                    {emp.employeeId} – {emp.fullName}
                  </option>
                ))}
              </select>
            </div>

            {/* Date picker */}
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1.5">Date</label>
              <input
                type="date"
                value={date}
                onChange={(e) => {
                  setDate(e.target.value);
                  setFormError('');
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm
                           focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent
                           transition-shadow"
              />
            </div>

            {/* Status dropdown */}
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1.5">Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white
                           focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent
                           transition-shadow"
              >
                <option value="Present">Present</option>
                <option value="Absent">Absent</option>
              </select>
            </div>
          </div>

          {/* Inline error */}
          {formError && (
            <p className="text-red-500 text-sm mt-3">{formError}</p>
          )}

          {/* Submit */}
          <div className="mt-4">
            <button
              type="submit"
              disabled={submitting}
              className="bg-indigo-600 text-white text-sm font-medium px-5 py-2.5 rounded-lg
                         hover:bg-indigo-700 transition-colors
                         disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {submitting ? 'Marking…' : 'Mark Attendance'}
            </button>
          </div>
        </form>
      </div>

      {/* ── Attendance records section ───────────────────── */}
      {selectedEmployeeId ? (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
          {/* Card header with stats + filter */}
          <div className="p-5 border-b border-gray-100 flex flex-wrap items-end justify-between gap-3">
            <div>
              <h3 className="text-base font-semibold text-gray-700">
                Attendance – {selectedEmployee?.fullName}
              </h3>
              {/* Bonus: present / absent / total counts */}
              <div className="flex gap-4 mt-2">
                <span className="text-xs text-green-600 font-semibold">
                  Present: {presentCount}
                </span>
                <span className="text-xs text-red-600 font-semibold">
                  Absent: {absentCount}
                </span>
                <span className="text-xs text-gray-400 font-medium">
                  Total: {attendanceRecords.length}
                </span>
              </div>
            </div>

            {/* Bonus: filter by specific date */}
            <div className="flex items-center gap-2">
              <label className="text-xs text-gray-500">Filter by date:</label>
              <input
                type="date"
                value={filterDate}
                onChange={(e) => setFilterDate(e.target.value)}
                className="px-2 py-1 border border-gray-300 rounded text-xs
                           focus:outline-none focus:ring-1 focus:ring-indigo-400"
              />
              {filterDate && (
                <button
                  onClick={() => setFilterDate('')}
                  className="text-xs text-indigo-600 hover:underline"
                >
                  Clear
                </button>
              )}
            </div>
          </div>

          {/* Table body */}
          {recordsLoading ? (
            <Loader message="Loading records…" />
          ) : displayedRecords.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-gray-400 text-sm">
                {filterDate
                  ? 'No record found for the selected date.'
                  : 'No attendance records yet for this employee.'}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {displayedRecords.map((record, i) => (
                    <tr key={i} className="border-t border-gray-100 hover:bg-gray-50 transition-colors">
                      <td className="px-5 py-3 text-sm text-gray-600">{record.date}</td>
                      <td className="px-5 py-3">
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
      ) : (
        /* Empty state when no employee is selected */
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <ClipboardCheck size={40} className="text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 text-sm">
            Select an employee above to view their attendance history.
          </p>
        </div>
      )}
    </div>
  );
}

export default Attendance;
