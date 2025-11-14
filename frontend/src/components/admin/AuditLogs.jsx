import { useState } from 'react';
import { Search, Filter, Shield, User, FileText, Settings } from 'lucide-react';

const mockLogs = [
  { id: 1, action: 'User Login', user: 'admin@lumen.com', role: 'admin', timestamp: '2024-03-15 10:30:25', ip: '192.168.1.1', status: 'success' },
  { id: 2, action: 'Document Uploaded', user: 'user@lumen.com', role: 'user', timestamp: '2024-03-15 10:25:12', ip: '192.168.1.2', status: 'success' },
  { id: 3, action: 'Anomaly Detected', user: 'System', role: 'system', timestamp: '2024-03-15 10:20:45', ip: 'N/A', status: 'warning' },
  { id: 4, action: 'User Deleted', user: 'admin@lumen.com', role: 'admin', timestamp: '2024-03-15 09:15:30', ip: '192.168.1.1', status: 'success' },
  { id: 5, action: 'Settings Updated', user: 'admin@lumen.com', role: 'admin', timestamp: '2024-03-15 08:45:20', ip: '192.168.1.1', status: 'success' },
  { id: 6, action: 'Failed Login Attempt', user: 'unknown@example.com', role: 'unknown', timestamp: '2024-03-15 08:30:15', ip: '192.168.1.99', status: 'failed' },
];

const getActionIcon = (action) => {
  if (action.includes('Login') || action.includes('User')) return User;
  if (action.includes('Document')) return FileText;
  if (action.includes('Settings')) return Settings;
  if (action.includes('Anomaly')) return Shield;
  return Shield;
};

export default function AuditLogs() {
  const [logs, setLogs] = useState(mockLogs);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  const filteredLogs = logs.filter(log => {
    const matchesSearch = log.user.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         log.action.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || log.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Audit Logs</h1>
        <p className="text-gray-600 mt-1">Complete audit trail of all system activities</p>
      </div>

      {/* Filters */}
      <div className="card">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search logs..."
              className="input-field pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex items-center space-x-2">
            <Filter className="h-5 w-5 text-gray-400" />
            <select
              className="input-field"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="all">All Status</option>
              <option value="success">Success</option>
              <option value="failed">Failed</option>
              <option value="warning">Warning</option>
            </select>
          </div>
        </div>
      </div>

      {/* Logs Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Action</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">User</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Timestamp</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">IP Address</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredLogs.map((log) => {
                const Icon = getActionIcon(log.action);
                return (
                  <tr key={log.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        <Icon className="h-4 w-4 text-gray-400" />
                        <span className="text-sm font-medium text-gray-900">{log.action}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {log.user}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        log.role === 'admin' ? 'bg-red-100 text-red-800' :
                        log.role === 'user' ? 'bg-blue-100 text-blue-800' :
                        log.role === 'system' ? 'bg-purple-100 text-purple-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {log.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {log.timestamp}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {log.ip}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        log.status === 'success' ? 'bg-green-100 text-green-800' :
                        log.status === 'failed' ? 'bg-red-100 text-red-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {log.status}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

