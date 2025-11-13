import { useState } from 'react';
import { Plus, Search, Filter, Receipt, Car } from 'lucide-react';
import DocumentUpload from '../DocumentUpload';

const mockExpenses = [
  { id: 1, type: 'Gas', amount: 85.50, vehicle: 'Vehicle 1', date: '2024-03-15', status: 'processed', merchant: 'Shell' },
  { id: 2, type: 'Maintenance', amount: 250.00, vehicle: 'Vehicle 2', date: '2024-03-14', status: 'processed', merchant: 'Auto Shop' },
  { id: 3, type: 'Toll', amount: 12.50, vehicle: 'Vehicle 1', date: '2024-03-13', status: 'pending', merchant: 'Toll Authority' },
  { id: 4, type: 'Parking', amount: 25.00, vehicle: 'Vehicle 1', date: '2024-03-12', status: 'processed', merchant: 'Parking Co' },
];

export default function DriverExpenses() {
  const [expenses, setExpenses] = useState(mockExpenses);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterVehicle, setFilterVehicle] = useState('all');
  const [showUpload, setShowUpload] = useState(false);

  const filteredExpenses = expenses.filter(expense => {
    const matchesSearch = expense.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         expense.merchant.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterVehicle === 'all' || expense.vehicle === filterVehicle;
    return matchesSearch && matchesFilter;
  });

  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Expenses</h1>
          <p className="text-gray-600 mt-1">Track and manage your vehicle expenses</p>
        </div>
        <button
          onClick={() => setShowUpload(!showUpload)}
          className="btn-primary flex items-center space-x-2"
        >
          <Plus className="h-5 w-5" />
          <span>Add Expense</span>
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Expenses</p>
              <p className="text-2xl font-bold text-red-600 mt-2">${totalExpenses.toFixed(2)}</p>
            </div>
            <Receipt className="h-8 w-8 text-red-500" />
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
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Pending</p>
              <p className="text-2xl font-bold text-yellow-600 mt-2">
                {expenses.filter(e => e.status === 'pending').length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Upload Section */}
      {showUpload && (
        <div className="card">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Upload Expense Receipt</h2>
          <DocumentUpload />
        </div>
      )}

      {/* Filters */}
      <div className="card">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search expenses..."
              className="input-field pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <select
              className="input-field pl-10 pr-8"
              value={filterVehicle}
              onChange={(e) => setFilterVehicle(e.target.value)}
            >
              <option value="all">All Vehicles</option>
              <option value="Vehicle 1">Vehicle 1</option>
              <option value="Vehicle 2">Vehicle 2</option>
            </select>
          </div>
        </div>
      </div>

      {/* Expenses List */}
      <div className="card">
        <div className="space-y-3">
          {filteredExpenses.map((expense) => (
            <div
              key={expense.id}
              className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <div className="flex items-center space-x-4 flex-1">
                <div className="bg-red-100 p-3 rounded-lg">
                  <Receipt className="h-6 w-6 text-red-600" />
                </div>
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900">{expense.type}</h3>
                  <div className="flex items-center space-x-4 mt-1 text-sm text-gray-500">
                    <span>{expense.merchant}</span>
                    <span>•</span>
                    <span>{expense.vehicle}</span>
                    <span>•</span>
                    <span>{expense.date}</span>
                  </div>
                </div>
                <span className={`px-3 py-1 text-xs font-medium rounded-full ${
                  expense.status === 'processed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {expense.status}
                </span>
              </div>
              <p className="text-lg font-semibold text-red-600 ml-4">-${expense.amount.toFixed(2)}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

