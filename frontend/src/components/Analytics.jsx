import { useEffect, useMemo, useState } from 'react';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import { TrendingUp, DollarSign, Activity, Loader2, FileText } from 'lucide-react';
import toast from 'react-hot-toast';
import apiClient from '../lib/apiClient';
import { formatCurrency } from '../utils/formatters';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#6366f1'];

const calcShare = (value = 0, total = 1) => ((value / (total || 1)) * 100).toFixed(1);

export default function Analytics() {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        const response = await apiClient.get('/analytics/summary');
        setSummary(response.data.data);
      } catch (error) {
        toast.error(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchSummary();
  }, []);

  const monthlyData = summary?.monthlyPerformance || [];
  const categoryData = summary?.categoryDistribution || [];

  const metrics = useMemo(() => {
    const totals = summary?.totals || { totalIncome: 0, totalExpenses: 0, documentCount: 0 };
    const latest = monthlyData.at(-1) || {};
    const recentTransactions = summary?.recentTransactions || [];
    return [
      {
        label: 'Total Income',
        value: formatCurrency(totals.totalIncome),
        trailing: latest.income,
        icon: DollarSign,
        color: 'text-green-600'
      },
      {
        label: 'Total Expenses',
        value: formatCurrency(totals.totalExpenses),
        trailing: latest.expenses,
        icon: Activity,
        color: 'text-red-600'
      },
      {
        label: 'Net Profit',
        value: formatCurrency(totals.totalIncome - totals.totalExpenses),
        trailing: latest.profit,
        icon: TrendingUp,
        color: 'text-blue-600'
      },
      {
        label: 'Documents Processed',
        value: totals.documentCount?.toString() || '0',
        trailing: recentTransactions.length,
        icon: FileText,
        color: 'text-purple-600'
      }
    ];
  }, [monthlyData, summary]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full py-12 text-gray-500">
        <Loader2 className="h-6 w-6 animate-spin mr-2" />
        Loading analytics...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Analytics</h1>
        <p className="text-gray-600 mt-1">Comprehensive financial analytics and insights</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {metrics.map((metric) => {
          const Icon = metric.icon;
          return (
            <div key={metric.label} className="card">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{metric.label}</p>
                  <p className={`text-2xl font-bold text-gray-900 mt-2 ${metric.color}`}>{metric.value}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    Last month: {metric.trailing ? formatCurrency(metric.trailing) : '—'}
                  </p>
                </div>
                <Icon className={`h-8 w-8 ${metric.color}`} />
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Monthly Performance</h2>
          <ResponsiveContainer width="100%" height={320}>
            <LineChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="income" stroke="#10b981" strokeWidth={2} />
              <Line type="monotone" dataKey="expenses" stroke="#ef4444" strokeWidth={2} />
              <Line type="monotone" dataKey="profit" stroke="#3b82f6" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="card">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Spending Distribution</h2>
          <ResponsiveContainer width="100%" height={320}>
            <PieChart>
              <Pie
                data={categoryData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, value }) => `${name} ${calcShare(value, totals.totalExpenses)}%`}
                outerRadius={100}
                dataKey="value"
              >
                {categoryData.map((entry, index) => (
                  <Cell key={entry.name} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => formatCurrency(value)} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="card">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Category Breakdown</h2>
        <ResponsiveContainer width="100%" height={320}>
          <BarChart data={categoryData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip formatter={(value) => formatCurrency(value)} />
            <Legend />
            <Bar dataKey="value" name="Spend" fill="#6366f1" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

