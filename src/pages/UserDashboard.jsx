import { useState } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import { useAuth } from '../contexts/AuthContext';
import UserDashboardHome from '../components/user/UserDashboardHome';
import MyDocuments from '../components/user/MyDocuments';
import UserTransactions from '../components/user/UserTransactions';
import FinancialInsights from '../components/user/FinancialInsights';
import SmartReminders from '../components/user/SmartReminders';
import Settings from '../components/Settings';

export default function UserDashboard() {
  const { user } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();

  if (!user || user.role !== 'user') {
    navigate('/login');
    return null;
  }

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <Sidebar role="user" onClose={() => setSidebarOpen(false)} />
      </div>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
        <main className="flex-1 overflow-y-auto p-6">
          <Routes>
            <Route path="/" element={<UserDashboardHome />} />
            <Route path="/documents" element={<MyDocuments />} />
            <Route path="/transactions" element={<UserTransactions />} />
            <Route path="/insights" element={<FinancialInsights />} />
            <Route path="/reminders" element={<SmartReminders />} />
            <Route path="/settings" element={<Settings />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}

