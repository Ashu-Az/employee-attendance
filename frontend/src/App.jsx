import React, { useState, useCallback, lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { DataProvider } from './context/DataContext';
import Sidebar from './components/Sidebar';
import Toast from './components/Toast';
import Loader from './components/Loader';

const Dashboard = lazy(() => import('./pages/Dashboard'));
const Employees = lazy(() => import('./pages/Employees'));
const Attendance = lazy(() => import('./pages/Attendance'));

const PAGE_META = {
  '/': { title: 'Dashboard', subtitle: 'Overview of your workforce' },
  '/employees': { title: 'Employees', subtitle: 'Manage your team members' },
  '/attendance': { title: 'Attendance', subtitle: 'Track daily attendance' },
};

function AppLayout({ showToast }) {
  const location = useLocation();
  const meta = PAGE_META[location.pathname] || PAGE_META['/'];

  return (
    <div className="flex h-screen bg-gray-100 font-sans">
      {/* Left sidebar */}
      <Sidebar />

      {/* Main area */}
      <div className="flex-1 flex flex-col min-h-0">
        {/* Top bar */}
        <header className="bg-white border-b border-gray-200 px-8 py-4 flex items-center justify-between flex-shrink-0">
          <div>
            <h1 className="text-lg font-bold text-gray-800">{meta.title}</h1>
            <p className="text-sm text-gray-400 mt-0.5">{meta.subtitle}</p>
          </div>
          <span className="text-xs font-medium text-indigo-600 bg-indigo-50 px-3 py-1.5 rounded-full">
            Admin
          </span>
        </header>

        {/* Scrollable content */}
        <main className="flex-1 overflow-y-auto p-8">
          <Suspense fallback={<Loader />}>
            <Routes>
              <Route path="/" element={<Dashboard showToast={showToast} />} />
              <Route path="/employees" element={<Employees showToast={showToast} />} />
              <Route path="/attendance" element={<Attendance showToast={showToast} />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Suspense>
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
