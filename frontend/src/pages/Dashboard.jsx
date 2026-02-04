import React, { useState, useEffect } from 'react';
import { Users, CheckCircle2, XCircle, ClipboardCheck } from 'lucide-react';
import { employeeAPI, attendanceAPI } from '../services/api';
import Loader from '../components/Loader';

// ── Reusable summary card ───────────────────────────────────
function StatCard({ title, value, Icon, iconColor, iconBg }) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500 font-medium">{title}</p>
          <p className="text-2xl font-bold text-gray-800 mt-1">{value}</p>
        </div>
        <div className={`w-12 h-12 ${iconBg} rounded-full flex items-center justify-center`}>
          <Icon size={22} className={iconColor} />
        </div>
      </div>
    </div>
  );
}

function Dashboard() {
  const [stats, setStats] = useState({
    totalEmployees: 0,
    presentToday: 0,
    absentToday: 0,
    totalRecords: 0,
  });
  const [recentRecords, setRecentRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      const today = new Date().toISOString().split('T')[0];

      // Fire all three requests at the same time
      const [empRes, allAttRes, todayAttRes] = await Promise.all([
        employeeAPI.getAll(),
        attendanceAPI.getAll(),
        attendanceAPI.getAll({ startDate: today, endDate: today }),
      ]);

      const employees = empRes.data;
      const allAttendance = allAttRes.data;
      const todayAttendance = todayAttRes.data;

      // Quick lookup: employeeId → name
      const nameMap = {};
      employees.forEach((emp) => {
        nameMap[emp.employeeId] = emp.fullName;
      });

      setStats({
        totalEmployees: employees.length,
        presentToday: todayAttendance.filter((a) => a.status === 'Present').length,
        absentToday: todayAttendance.filter((a) => a.status === 'Absent').length,
        totalRecords: allAttendance.length,
      });

      // Show the 10 most recent records with employee names resolved
      setRecentRecords(
        allAttendance.slice(0, 10).map((record) => ({
          ...record,
          employeeName: nameMap[record.employeeId] || 'Unknown',
        }))
      );
    } catch (err) {
      setError('Could not load dashboard data. Please refresh.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Loader />;

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
        <p className="text-red-600 text-sm">{error}</p>
        <button
          onClick={loadDashboard}
          className="mt-3 text-indigo-600 hover:underline text-sm font-medium"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div>
      {/* ── Summary cards row ──────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        <StatCard
          title="Total Employees"
          value={stats.totalEmployees}
          Icon={Users}
          iconColor="text-indigo-600"
          iconBg="bg-indigo-50"
        />
        <StatCard
          title="Present Today"
          value={stats.presentToday}
          Icon={CheckCircle2}
          iconColor="text-green-600"
          iconBg="bg-green-50"
        />
        <StatCard
          title="Absent Today"
          value={stats.absentToday}
          Icon={XCircle}
          iconColor="text-red-600"
          iconBg="bg-red-50"
        />
        <StatCard
          title="Total Attendance Records"
          value={stats.totalRecords}
          Icon={ClipboardCheck}
          iconColor="text-amber-600"
          iconBg="bg-amber-50"
        />
      </div>

      {/* ── Recent attendance table ────────────────────────── */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
        <div className="p-5 border-b border-gray-100">
          <h3 className="text-base font-semibold text-gray-800">Recent Attendance</h3>
          <p className="text-xs text-gray-400 mt-0.5">Last 10 entries across all employees</p>
        </div>

        {recentRecords.length === 0 ? (
          <div className="p-10 text-center">
            <p className="text-gray-400 text-sm">
              No attendance records yet. Start by marking attendance on the Attendance page.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50">
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Employee
                  </th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody>
                {recentRecords.map((record, index) => (
                  <tr key={index} className="border-t border-gray-100 hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-3 text-sm text-gray-700 font-medium">
                      {record.employeeName}
                    </td>
                    <td className="px-5 py-3 text-sm text-gray-500">{record.date}</td>
                    <td className="px-5 py-3">
                      <span
                        className={[
                          'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
                          record.status === 'Present'
                            ? 'bg-green-100 text-green-700'
                            : 'bg-red-100 text-red-700',
                        ].join(' ')}
                      >
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
  );
}

export default Dashboard;
