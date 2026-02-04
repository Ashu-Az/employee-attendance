import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Users, ClipboardCheck } from 'lucide-react';

const NAV_ITEMS = [
  { path: '/', label: 'Dashboard', Icon: LayoutDashboard },
  { path: '/employees', label: 'Employees', Icon: Users },
  { path: '/attendance', label: 'Attendance', Icon: ClipboardCheck },
];

function Sidebar() {
  return (
    <aside className="w-64 bg-slate-900 text-white flex flex-col flex-shrink-0">
      {/* Brand */}
      <div className="p-6 border-b border-slate-700">
        <h1 className="text-xl font-bold tracking-tight">HRMS Lite</h1>
        <p className="text-slate-400 text-xs mt-1">Human Resource Management</p>
      </div>

      {/* Nav links */}
      <nav className="flex-1 py-5 px-3">
        {NAV_ITEMS.map(({ path, label, Icon }) => (
          <NavLink
            key={path}
            to={path}
            className={({ isActive }) =>
              [
                'flex items-center gap-3 px-4 py-3 rounded-lg mb-1',
                'text-sm font-medium transition-colors duration-150',
                isActive
                  ? 'bg-indigo-600 text-white'
                  : 'text-slate-400 hover:bg-slate-800 hover:text-white',
              ].join(' ')
            }
          >
            <Icon size={18} />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>

      {/* Footer */}
      <div className="p-5 border-t border-slate-700">
        <p className="text-slate-600 text-xs text-center">© 2025 HRMS Lite</p>
      </div>
    </aside>
  );
}

export default Sidebar;
