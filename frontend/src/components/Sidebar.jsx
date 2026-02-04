import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Users, ClipboardCheck, User } from 'lucide-react';

const NAV_SECTIONS = [
  {
    label: 'Overview',
    items: [{ path: '/', label: 'Dashboard', Icon: LayoutDashboard }],
  },
  {
    label: 'Management',
    items: [
      { path: '/employees', label: 'Employees', Icon: Users },
      { path: '/attendance', label: 'Attendance', Icon: ClipboardCheck },
    ],
  },
];

function Sidebar() {
  return (
    <aside className="w-64 bg-slate-900 text-white flex flex-col flex-shrink-0">
      {/* Brand */}
      <div className="p-5 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-indigo-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">H</span>
          </div>
          <div>
            <h1 className="text-sm font-bold text-white">HRMS Lite</h1>
            <p className="text-slate-500 text-xs">HR Management</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 py-4 px-3 overflow-y-auto">
        {NAV_SECTIONS.map((section) => (
          <div key={section.label} className="mb-5">
            <p className="text-xs font-semibold text-slate-600 uppercase tracking-wider px-4 mb-2">
              {section.label}
            </p>
            {section.items.map(({ path, label, Icon }) => (
              <NavLink
                key={path}
                to={path}
                className={({ isActive }) =>
                  [
                    'flex items-center gap-3 px-4 py-2.5 rounded-lg mb-0.5',
                    'text-sm font-medium transition-all duration-200',
                    isActive
                      ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/30'
                      : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200',
                  ].join(' ')
                }
              >
                <Icon size={18} />
                <span>{label}</span>
              </NavLink>
            ))}
          </div>
        ))}
      </nav>

      {/* User profile */}
      <div className="p-3 border-t border-slate-800">
        <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer">
          <div className="w-8 h-8 bg-indigo-600 rounded-full flex items-center justify-center flex-shrink-0">
            <User size={16} className="text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white truncate">Admin</p>
            <p className="text-xs text-slate-500 truncate">admin@hrms.com</p>
          </div>
        </div>
      </div>
    </aside>
  );
}

export default Sidebar;
