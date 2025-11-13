import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  FileText, 
  TrendingUp, 
  Bell, 
  Settings, 
  Users, 
  Shield,
  AlertTriangle,
  BarChart3,
  Receipt,
  Car
} from 'lucide-react';

const menuItems = {
  admin: [
    { path: '/admin', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/admin/users', icon: Users, label: 'User Management' },
    { path: '/admin/documents', icon: FileText, label: 'All Documents' },
    { path: '/admin/transactions', icon: TrendingUp, label: 'Transactions' },
    { path: '/admin/analytics', icon: BarChart3, label: 'Analytics' },
    { path: '/admin/anomalies', icon: AlertTriangle, label: 'Anomaly Detection' },
    { path: '/admin/audit', icon: Shield, label: 'Audit Logs' },
    { path: '/admin/settings', icon: Settings, label: 'Settings' },
  ],
  user: [
    { path: '/user', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/user/documents', icon: FileText, label: 'My Documents' },
    { path: '/user/transactions', icon: TrendingUp, label: 'Transactions' },
    { path: '/user/insights', icon: BarChart3, label: 'Financial Insights' },
    { path: '/user/reminders', icon: Bell, label: 'Smart Reminders' },
    { path: '/user/settings', icon: Settings, label: 'Settings' },
  ],
  driver: [
    { path: '/driver', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/driver/expenses', icon: Receipt, label: 'Expenses' },
    { path: '/driver/vehicles', icon: Car, label: 'Vehicles' },
    { path: '/driver/transactions', icon: TrendingUp, label: 'Transactions' },
    { path: '/driver/settings', icon: Settings, label: 'Settings' },
  ],
};

export default function Sidebar({ role, onClose }) {
  const location = useLocation();
  const items = menuItems[role] || [];

  return (
    <div className="h-full bg-white border-r border-gray-200 flex flex-col">
      <div className="p-6 border-b border-gray-200">
        <h1 className="text-2xl font-bold text-primary-600">LUMEN</h1>
        <p className="text-xs text-gray-500 mt-1">Financial Intelligence</p>
      </div>
      
      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        {items.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path || 
            (item.path !== `/${role}` && location.pathname.startsWith(item.path));
          
          return (
            <Link
              key={item.path}
              to={item.path}
              onClick={onClose}
              className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                isActive
                  ? 'bg-primary-50 text-primary-700 font-medium'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              <Icon className="h-5 w-5" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}

