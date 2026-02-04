import React, { useState, useCallback } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { DataProvider } from './context/DataContext';
import Sidebar from './components/Sidebar';
import Toast from './components/Toast';
import Dashboard from './pages/Dashboard';
import Employees from './pages/Employees';
import Attendance from './pages/Attendance';

// Maps route paths to the heading shown in the top bar
const PAGE_TITLES = {
  '/': 'Dashboard',
  '/employees': 'Employee Management',
  '/attendance': 'Attendance',
};

function AppLayout({ showToast }) {
  const location = useLocation();
  const title = PAGE_TITLES[location.pathname] || 'Dashboard';

  return (
    <div className="flex h-screen bg-gray-100 font-sans">
      {/* Left sidebar */}
      <Sidebar />

      {/* Main area */}
      <div className="flex-1 flex flex-col min-h-0">
        {/* Top bar */}
        <header className="bg-white border-b border-gray-200 px-8 py-4 flex items-center justify-between flex-shrink-0">
          <h1 className="text-lg font-semibold text-gray-800">{title}</h1>
          <span className="text-xs font-medium text-slate-500 bg-indigo-50 text-indigo-600 px-3 py-1 rounded-full">
            Admin
          </span>
        </header>

        {/* Scrollable content */}
        <main className="flex-1 overflow-y-auto p-8">
          <Routes>
            <Route path="/" element={<Dashboard showToast={showToast} />} />
            <Route path="/employees" element={<Employees showToast={showToast} />} />
            <Route path="/attendance" element={<Attendance showToast={showToast} />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}

function App() {
  const [toast, setToast] = useState(null);

  const showToast = useCallback((message, type = 'success') => {
    setToast({ message, type, id: Date.now() });
  }, []);

  return (
    <BrowserRouter>
      <DataProvider>
        <AppLayout showToast={showToast} />
      </DataProvider>

      {/* Toast notification – rendered outside the layout so it floats */}
      {toast && (
        <Toast
          key={toast.id}
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </BrowserRouter>
  );
}

export default App;
