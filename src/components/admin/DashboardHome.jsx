import { TrendingUp, Users, FileText, AlertTriangle, DollarSign, Activity } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const stats = [
  { name: 'Total Users', value: '2,458', change: '+12.5%', icon: Users, color: 'bg-blue-500' },
  { name: 'Documents Processed', value: '18,234', change: '+8.2%', icon: FileText, color: 'bg-green-500' },
  { name: 'Total Transactions', value: '$1.2M', change: '+15.3%', icon: DollarSign, color: 'bg-purple-500' },
  { name: 'Anomalies Detected', value: '23', change: '-5.1%', icon: AlertTriangle, color: 'bg-red-500' },
];

const revenueData = [
  { month: 'Jan', revenue: 45000, expenses: 32000 },
  { month: 'Feb', revenue: 52000, expenses: 38000 },
  { month: 'Mar', revenue: 48000, expenses: 35000 },
  { month: 'Apr', revenue: 61000, expenses: 42000 },
  { month: 'May', revenue: 55000, expenses: 40000 },
  { month: 'Jun', revenue: 67000, expenses: 45000 },
];

const categoryData = [
  { name: 'Groceries', value: 35, color: '#3b82f6' },
  { name: 'Shopping', value: 25, color: '#10b981' },
  { name: 'Food', value: 20, color: '#f59e0b' },
  { name: 'Gas', value: 12, color: '#ef4444' },
  { name: 'Utilities', value: 8, color: '#8b5cf6' },
];

export default function DashboardHome() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="text-gray-600 mt-1">Overview of your financial intelligence platform</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.name} className="card">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.name}</p>
                  <p className="text-2xl font-bold text-gray-900 mt-2">{stat.value}</p>
                  <p className="text-sm text-green-600 mt-1">{stat.change}</p>
                </div>
                <div className={`${stat.color} p-3 rounded-lg`}>
                  <Icon className="h-6 w-6 text-white" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Revenue vs Expenses</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={revenueData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="revenue" stroke="#3b82f6" strokeWidth={2} />
              <Line type="monotone" dataKey="expenses" stroke="#ef4444" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="card">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Spending by Category</h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={categoryData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {categoryData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="card">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Recent Activity</h2>
        <div className="space-y-4">
          {[
            { action: 'New document processed', user: 'John Doe', time: '2 minutes ago', type: 'success' },
            { action: 'Anomaly detected', user: 'System', time: '15 minutes ago', type: 'warning' },
            { action: 'User registered', user: 'Jane Smith', time: '1 hour ago', type: 'info' },
            { action: 'Transaction approved', user: 'Admin', time: '2 hours ago', type: 'success' },
          ].map((activity, idx) => (
            <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <Activity className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-sm font-medium text-gray-900">{activity.action}</p>
                  <p className="text-xs text-gray-500">{activity.user} • {activity.time}</p>
                </div>
              </div>
              <span className={`px-2 py-1 text-xs rounded-full ${
                activity.type === 'success' ? 'bg-green-100 text-green-800' :
                activity.type === 'warning' ? 'bg-yellow-100 text-yellow-800' :
                'bg-blue-100 text-blue-800'
              }`}>
                {activity.type}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

