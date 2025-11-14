import { useState } from 'react';
import { Search, Filter, TrendingDown, Car } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const mockTransactions = [
  { id: 1, type: 'Gas', amount: 85.50, vehicle: 'Vehicle 1', date: '2024-03-15', merchant: 'Shell' },
  { id: 2, type: 'Maintenance', amount: 250.00, vehicle: 'Vehicle 2', date: '2024-03-14', merchant: 'Auto Shop' },
  { id: 3, type: 'Toll', amount: 12.50, vehicle: 'Vehicle 1', date: '2024-03-13', merchant: 'Toll Authority' },
  { id: 4, type: 'Parking', amount: 25.00, vehicle: 'Vehicle 1', date: '2024-03-12', merchant: 'Parking Co' },
];

const chartData = [
  { month: 'Jan', amount: 1200 },
  { month: 'Feb', amount: 1500 },
  { month: 'Mar', amount: 1800 },
  { month: 'Apr', amount: 1450 },
  { month: 'May', amount: 1600 },
  { month: 'Jun', amount: 850 },
];

export default function DriverTransactions() {
  const [transactions, setTransactions] = useState(mockTransactions);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');

  const filteredTransactions = transactions.filter(t => {
    const matchesSearch = t.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         t.merchant.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterType === 'all' || t.type.toLowerCase() === filterType.toLowerCase();
    return matchesSearch && matchesFilter;
  });

  const totalExpenses = transactions.reduce((sum, t) => sum + t.amount, 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Transactions</h1>
        <p className="text-gray-600 mt-1">View all your vehicle-related transactions</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Expenses</p>
              <p className="text-2xl font-bold text-red-600 mt-2">${totalExpenses.toFixed(2)}</p>
            </div>
            <TrendingDown className="h-8 w-8 text-red-500" />
          </div>
        </div>
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">This Month</p>
              <p className="text-2xl font-bold text-gray-900 mt-2">$373.00</p>
            </div>
            <Car className="h-8 w-8 text-blue-500" />
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="card">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Monthly Expenses</h2>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="amount" fill="#ef4444" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Filters */}
      <div className="card">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search transactions..."
              className="input-field pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <select
              className="input-field pl-10 pr-8"
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
            >
              <option value="all">All Types</option>
              <option value="gas">Gas</option>
              <option value="maintenance">Maintenance</option>
              <option value="toll">Toll</option>
              <option value="parking">Parking</option>
            </select>
          </div>
        </div>
      </div>

      {/* Transactions List */}
      <div className="card">
        <div className="space-y-3">
          {filteredTransactions.map((transaction) => (
            <div
              key={transaction.id}
              className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <div className="flex items-center space-x-4">
                <div className="bg-red-100 p-3 rounded-lg">
                  <Car className="h-5 w-5 text-red-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">{transaction.type}</p>
                  <p className="text-sm text-gray-500">{transaction.merchant} • {transaction.vehicle} • {transaction.date}</p>
                </div>
              </div>
              <p className="text-lg font-semibold text-red-600">-${transaction.amount.toFixed(2)}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

