import { useState } from 'react';
import { AlertTriangle, CheckCircle, XCircle, Eye, Shield } from 'lucide-react';
import toast from 'react-hot-toast';

const mockAnomalies = [
  { id: 1, type: 'Unusual Transaction', description: 'Transaction amount $2,500 at Walmart exceeds normal spending pattern', severity: 'high', date: '2024-03-15', status: 'pending', amount: 2500, merchant: 'Walmart' },
  { id: 2, type: 'Duplicate Payment', description: 'Duplicate payment detected for invoice #12345', severity: 'medium', date: '2024-03-14', status: 'resolved', amount: 450, merchant: 'Amazon' },
  { id: 3, type: 'Suspicious Activity', description: 'Multiple transactions from different locations within short time', severity: 'high', date: '2024-03-13', status: 'pending', amount: 1200, merchant: 'Various' },
  { id: 4, type: 'Pattern Anomaly', description: 'Spending pattern deviation detected in grocery category', severity: 'low', date: '2024-03-12', status: 'resolved', amount: 350, merchant: 'Target' },
];

export default function AnomalyDetection() {
  const [anomalies, setAnomalies] = useState(mockAnomalies);
  const [filter, setFilter] = useState('all');

  const filteredAnomalies = anomalies.filter(a => 
    filter === 'all' || a.status === filter
  );

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'high':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const handleResolve = (id) => {
    setAnomalies(anomalies.map(a => 
      a.id === id ? { ...a, status: 'resolved' } : a
    ));
    toast.success('Anomaly marked as resolved');
  };

  const handleIgnore = (id) => {
    setAnomalies(anomalies.map(a => 
      a.id === id ? { ...a, status: 'ignored' } : a
    ));
    toast.success('Anomaly ignored');
  };

  const stats = {
    total: anomalies.length,
    pending: anomalies.filter(a => a.status === 'pending').length,
    resolved: anomalies.filter(a => a.status === 'resolved').length,
    high: anomalies.filter(a => a.severity === 'high').length,
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Anomaly Detection</h1>
        <p className="text-gray-600 mt-1">AI-powered fraud and anomaly detection</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Anomalies</p>
              <p className="text-2xl font-bold text-gray-900 mt-2">{stats.total}</p>
            </div>
            <AlertTriangle className="h-8 w-8 text-orange-500" />
          </div>
        </div>
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Pending</p>
              <p className="text-2xl font-bold text-yellow-600 mt-2">{stats.pending}</p>
            </div>
            <XCircle className="h-8 w-8 text-yellow-500" />
          </div>
        </div>
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Resolved</p>
              <p className="text-2xl font-bold text-green-600 mt-2">{stats.resolved}</p>
            </div>
            <CheckCircle className="h-8 w-8 text-green-500" />
          </div>
        </div>
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">High Severity</p>
              <p className="text-2xl font-bold text-red-600 mt-2">{stats.high}</p>
            </div>
            <Shield className="h-8 w-8 text-red-500" />
          </div>
        </div>
      </div>

      {/* Filter */}
      <div className="card">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              filter === 'all' ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setFilter('pending')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              filter === 'pending' ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Pending
          </button>
          <button
            onClick={() => setFilter('resolved')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              filter === 'resolved' ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Resolved
          </button>
        </div>
      </div>

      {/* Anomalies List */}
      <div className="space-y-4">
        {filteredAnomalies.map((anomaly) => (
          <div key={anomaly.id} className="card">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-2">
                  <AlertTriangle className={`h-5 w-5 ${
                    anomaly.severity === 'high' ? 'text-red-500' :
                    anomaly.severity === 'medium' ? 'text-yellow-500' : 'text-blue-500'
                  }`} />
                  <h3 className="font-semibold text-gray-900">{anomaly.type}</h3>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getSeverityColor(anomaly.severity)}`}>
                    {anomaly.severity}
                  </span>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                    anomaly.status === 'resolved' ? 'bg-green-100 text-green-800' :
                    anomaly.status === 'ignored' ? 'bg-gray-100 text-gray-800' :
                    'bg-yellow-100 text-yellow-800'
                  }`}>
                    {anomaly.status}
                  </span>
                </div>
                <p className="text-gray-600 mb-3">{anomaly.description}</p>
                <div className="flex items-center space-x-4 text-sm text-gray-500">
                  <span>Merchant: {anomaly.merchant}</span>
                  <span>•</span>
                  <span>Amount: ${anomaly.amount.toFixed(2)}</span>
                  <span>•</span>
                  <span>Date: {anomaly.date}</span>
                </div>
              </div>
              {anomaly.status === 'pending' && (
                <div className="flex items-center space-x-2 ml-4">
                  <button
                    onClick={() => handleResolve(anomaly.id)}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm font-medium"
                  >
                    Resolve
                  </button>
                  <button
                    onClick={() => handleIgnore(anomaly.id)}
                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 text-sm font-medium"
                  >
                    Ignore
                  </button>
                  <button className="p-2 bg-gray-100 rounded-lg hover:bg-gray-200">
                    <Eye className="h-5 w-5 text-gray-600" />
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

