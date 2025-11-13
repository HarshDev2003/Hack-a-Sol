import { useState } from 'react';
import { Search, Filter, FileText, Download, Eye } from 'lucide-react';
import DocumentUpload from '../DocumentUpload';

const mockDocuments = [
  { id: 1, name: 'Receipt_2024_01_15.pdf', type: 'Receipt', amount: 125.50, merchant: 'Walmart', date: '2024-01-15', status: 'processed' },
  { id: 2, name: 'Invoice_2024_02_20.pdf', type: 'Invoice', amount: 450.00, merchant: 'Amazon', date: '2024-02-20', status: 'processed' },
  { id: 3, name: 'Transaction_2024_03_10.jpg', type: 'Transaction', amount: 89.99, merchant: 'Starbucks', date: '2024-03-10', status: 'pending' },
];

export default function AllDocuments() {
  const [documents, setDocuments] = useState(mockDocuments);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');

  const filteredDocs = documents.filter(doc => {
    const matchesSearch = doc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         doc.merchant.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterType === 'all' || doc.type.toLowerCase() === filterType.toLowerCase();
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">All Documents</h1>
        <p className="text-gray-600 mt-1">View and manage all processed documents</p>
      </div>

      {/* Upload Section */}
      <div className="card">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Upload New Documents</h2>
        <DocumentUpload />
      </div>

      {/* Filters */}
      <div className="card">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search documents..."
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
              <option value="receipt">Receipts</option>
              <option value="invoice">Invoices</option>
              <option value="transaction">Transactions</option>
            </select>
          </div>
        </div>
      </div>

      {/* Documents List */}
      <div className="card">
        <div className="space-y-4">
          {filteredDocs.map((doc) => (
            <div
              key={doc.id}
              className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <div className="flex items-center space-x-4 flex-1">
                <div className="bg-primary-100 p-3 rounded-lg">
                  <FileText className="h-6 w-6 text-primary-600" />
                </div>
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900">{doc.name}</h3>
                  <div className="flex items-center space-x-4 mt-1 text-sm text-gray-500">
                    <span>{doc.type}</span>
                    <span>•</span>
                    <span>{doc.merchant}</span>
                    <span>•</span>
                    <span>${doc.amount}</span>
                    <span>•</span>
                    <span>{doc.date}</span>
                  </div>
                </div>
                <span className={`px-3 py-1 text-xs font-medium rounded-full ${
                  doc.status === 'processed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {doc.status}
                </span>
              </div>
              <div className="flex items-center space-x-2 ml-4">
                <button className="p-2 hover:bg-gray-200 rounded-lg">
                  <Eye className="h-5 w-5 text-gray-600" />
                </button>
                <button className="p-2 hover:bg-gray-200 rounded-lg">
                  <Download className="h-5 w-5 text-gray-600" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

