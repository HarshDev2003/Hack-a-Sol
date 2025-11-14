import { DollarSign, Car, Receipt, TrendingUp } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const stats = [
  { name: 'Total Expenses', value: '$2,450.50', change: '+12.5%', icon: DollarSign, color: 'text-red-600' },
  { name: 'Active Vehicles', value: '2', change: '0', icon: Car, color: 'text-blue-600' },
  { name: 'Receipts Processed', value: '24', change: '+3', icon: Receipt, color: 'text-green-600' },
  { name: 'This Month', value: '$850.00', change: '-5.2%', icon: TrendingUp, color: 'text-purple-600' },
];

const expenseData = [
  { month: 'Jan', amount: 1200 },
  { month: 'Feb', amount: 1500 },
  { month: 'Mar', amount: 1800 },
  { month: 'Apr', amount: 1450 },
  { month: 'May', amount: 1600 },
  { month: 'Jun', amount: 850 },
];

const recentExpenses = [
  { id: 1, type: 'Gas', amount: 85.50, vehicle: 'Vehicle 1', date: '2024-03-15' },
  { id: 2, type: 'Maintenance', amount: 250.00, vehicle: 'Vehicle 2', date: '2024-03-14' },
  { id: 3, type: 'Toll', amount: 12.50, vehicle: 'Vehicle 1', date: '2024-03-13' },
];

export default function DriverDashboardHome() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Driver Dashboard</h1>
        <p className="text-gray-600 mt-1">Manage your vehicle expenses and transactions</p>
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
                  <p className={`text-2xl font-bold mt-2 ${stat.color}`}>{stat.value}</p>
                  <p className={`text-sm mt-1 ${stat.change.startsWith('+') ? 'text-red-600' : stat.change.startsWith('-') ? 'text-green-600' : 'text-gray-600'}`}>
                    {stat.change}
                  </p>
                </div>
                <div className="bg-gray-100 p-3 rounded-lg">
                  <Icon className={`h-6 w-6 ${stat.color}`} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Chart */}
      <div className="card">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Monthly Expenses</h2>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={expenseData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />
            <Line type="monotone" dataKey="amount" stroke="#ef4444" strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Recent Expenses */}
      <div className="card">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Recent Expenses</h2>
        <div className="space-y-3">
          {recentExpenses.map((expense) => (
            <div key={expense.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="bg-red-100 p-2 rounded-lg">
                  <Receipt className="h-5 w-5 text-red-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">{expense.type}</p>
                  <p className="text-sm text-gray-500">{expense.vehicle} • {expense.date}</p>
                </div>
              </div>
              <p className="text-lg font-semibold text-red-600">-${expense.amount.toFixed(2)}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

