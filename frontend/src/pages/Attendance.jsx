import React, { useState, useEffect } from 'react';
import { ClipboardCheck, CheckCircle2, XCircle } from 'lucide-react';
import { useEmployees } from '@/context/DataContext';
import { attendanceAPI } from '@/services/api';
import Loader from '@/components/Loader';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';

function Attendance({ showToast }) {
  const { employees, loading: empLoading, getCachedAttendance, fetchEmployeeAttendance, invalidateEmployeeAttendance, refreshAttendance } = useEmployees();

  const [selectedEmployeeId, setSelectedEmployeeId] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [status, setStatus] = useState('Present');
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [recordsLoading, setRecordsLoading] = useState(false);

  const [filterDate, setFilterDate] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  useEffect(() => {
    if (!selectedEmployeeId) { setAttendanceRecords([]); return; }
    const cached = getCachedAttendance(selectedEmployeeId);
    if (cached) { setAttendanceRecords(cached); setRecordsLoading(false); return; }
    let cancelled = false;
    setRecordsLoading(true);
    fetchEmployeeAttendance(selectedEmployeeId)
      .then((data) => { if (!cancelled) { setAttendanceRecords(data); setRecordsLoading(false); } })
      .catch(() => { if (!cancelled) { setFormError('Failed to load attendance records.'); setRecordsLoading(false); } });
    return () => { cancelled = true; };
  }, [selectedEmployeeId, getCachedAttendance, fetchEmployeeAttendance]);

  const handleMarkAttendance = async (e) => {
    e.preventDefault();
    if (!selectedEmployeeId) { setFormError('Please select an employee.'); return; }
    if (!date) { setFormError('Please pick a date.'); return; }

    setSubmitting(true);
    setFormError('');
    try {
      const { data } = await attendanceAPI.mark({ employeeId: selectedEmployeeId, date, status });
      showToast(data.updated ? 'Attendance updated.' : 'Attendance marked successfully.');
      invalidateEmployeeAttendance(selectedEmployeeId);
      const updated = await fetchEmployeeAttendance(selectedEmployeeId);
      setAttendanceRecords(updated);
      refreshAttendance();
    } catch (err) {
      setFormError(err.response?.data?.message || 'Failed to mark attendance.');
    } finally { setSubmitting(false); }
  };

  const selectedEmployee = employees.find((e) => e.employeeId === selectedEmployeeId);

  const displayedRecords = attendanceRecords
    .filter((r) => !filterDate || r.date === filterDate)
    .filter((r) => !filterStatus || r.status === filterStatus);

  const presentCount = attendanceRecords.filter((r) => r.status === 'Present').length;
  const absentCount = attendanceRecords.filter((r) => r.status === 'Absent').length;

  if (empLoading) return <Loader />;

  return (
    <div className="max-w-4xl">
      {/* Mark Attendance */}
      <Card className="mb-6 animate-slide-up">
        <CardHeader>
          <CardTitle>Mark Attendance</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleMarkAttendance}>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1.5">Employee</label>
                <select
                  value={selectedEmployeeId}
                  onChange={(e) => { setSelectedEmployeeId(e.target.value); setFormError(''); }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent transition-shadow"
                >
                  <option value="">Select employee</option>
                  {employees.map((emp) => (
                    <option key={emp.employeeId} value={emp.employeeId}>{emp.employeeId} – {emp.fullName}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1.5">Date</label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => { setDate(e.target.value); setFormError(''); }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent transition-shadow"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1.5">Status</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent transition-shadow"
                >
                  <option value="Present">Present</option>
                  <option value="Absent">Absent</option>
                </select>
              </div>
            </div>

            {formError && <p className="text-red-500 text-sm mt-3">{formError}</p>}

            <div className="mt-4">
              <button
                type="submit"
                disabled={submitting}
                className="bg-indigo-600 text-white text-sm font-medium px-5 py-2.5 rounded-lg hover:bg-indigo-700 active:bg-indigo-800 transition-colors disabled:opacity-60 disabled:cursor-not-allowed shadow-sm shadow-indigo-200"
              >
                {submitting ? 'Marking…' : 'Mark Attendance'}
              </button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Records */}
      {selectedEmployeeId ? (
        <Card className="animate-slide-up">
          <CardHeader>
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <CardTitle>Attendance – {selectedEmployee?.fullName}</CardTitle>
                <div className="flex gap-2 mt-2">
                  <Badge variant="success"><CheckCircle2 size={12} /> Present: {presentCount}</Badge>
                  <Badge variant="destructive"><XCircle size={12} /> Absent: {absentCount}</Badge>
                  <Badge variant="secondary">Total: {attendanceRecords.length}</Badge>
                </div>
              </div>

              {/* Filters */}
              <div className="flex items-center gap-2 flex-wrap">
                <label className="text-xs text-gray-500">Date:</label>
                <input
                  type="date"
                  value={filterDate}
                  onChange={(e) => setFilterDate(e.target.value)}
                  className="px-2 py-1 border border-gray-300 rounded text-xs focus:outline-none focus:ring-1 focus:ring-indigo-400"
                />
                <label className="text-xs text-gray-500 ml-2">Status:</label>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="px-2 py-1 border border-gray-300 rounded text-xs bg-white focus:outline-none focus:ring-1 focus:ring-indigo-400"
                >
                  <option value="">All</option>
                  <option value="Present">Present</option>
                  <option value="Absent">Absent</option>
                </select>
                {(filterDate || filterStatus) && (
                  <button onClick={() => { setFilterDate(''); setFilterStatus(''); }} className="text-xs text-indigo-600 hover:underline ml-1">
                    Clear
                  </button>
                )}
              </div>
            </div>
          </CardHeader>

          {recordsLoading ? (
            <CardContent><Loader /></CardContent>
          ) : displayedRecords.length === 0 ? (
            <CardContent>
              <p className="text-gray-400 text-sm text-center py-4">
                {filterDate || filterStatus ? 'No records match the selected filters.' : 'No attendance records yet for this employee.'}
              </p>
            </CardContent>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-gray-50">
                  <TableHead>Date</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {displayedRecords.map((record, i) => (
                  <TableRow key={i}>
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
          )}
        </Card>
      ) : (
        <Card className="animate-slide-up">
          <CardContent className="py-12 text-center">
            <ClipboardCheck size={40} className="text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 text-sm">Select an employee above to view their attendance history.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default Attendance;
