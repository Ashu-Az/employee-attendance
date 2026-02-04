import React from 'react';
import { Users, CheckCircle2, XCircle, ClipboardCheck } from 'lucide-react';
import { useEmployees } from '@/context/DataContext';
import Loader from '@/components/Loader';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';

function StatCard({ title, value, Icon, iconColor, iconBg }) {
  return (
    <Card>
      <CardContent className="pt-5">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500 font-medium">{title}</p>
            <p className="text-2xl font-bold text-gray-800 mt-1">{value}</p>
          </div>
          <div className={`w-12 h-12 ${iconBg} rounded-full flex items-center justify-center`}>
            <Icon size={22} className={iconColor} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function Dashboard() {
  const { employees, loading: empLoading, allAttendance, todayAttendance, attLoading } = useEmployees();

  const nameMap = {};
  employees.forEach((emp) => { nameMap[emp.employeeId] = emp.fullName; });

  const presentToday = todayAttendance.filter((a) => a.status === 'Present').length;
  const absentToday = todayAttendance.filter((a) => a.status === 'Absent').length;
  const recentRecords = allAttendance.slice(0, 10).map((record) => ({
    ...record,
    employeeName: nameMap[record.employeeId] || 'Unknown',
  }));

  if (empLoading || attLoading) return <Loader />;

  return (
    <div>
      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        <StatCard title="Total Employees" value={employees.length} Icon={Users} iconColor="text-indigo-600" iconBg="bg-indigo-50" />
        <StatCard title="Present Today" value={presentToday} Icon={CheckCircle2} iconColor="text-green-600" iconBg="bg-green-50" />
        <StatCard title="Absent Today" value={absentToday} Icon={XCircle} iconColor="text-red-600" iconBg="bg-red-50" />
        <StatCard title="Total Attendance Records" value={allAttendance.length} Icon={ClipboardCheck} iconColor="text-amber-600" iconBg="bg-amber-50" />
      </div>

      {/* Recent attendance */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Attendance</CardTitle>
          <CardDescription>Last 10 entries across all employees</CardDescription>
        </CardHeader>

        {recentRecords.length === 0 ? (
          <CardContent>
            <p className="text-gray-400 text-sm text-center py-6">
              No attendance records yet. Start by marking attendance on the Attendance page.
            </p>
          </CardContent>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-gray-50">
                <TableHead>Employee</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recentRecords.map((record, index) => (
                <TableRow key={index}>
                  <TableCell className="font-medium text-gray-700">{record.employeeName}</TableCell>
                  <TableCell className="text-gray-500">{record.date}</TableCell>
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
    </div>
  );
}

export default Dashboard;
