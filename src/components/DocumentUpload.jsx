import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, FileText, X, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';

export default function DocumentUpload({ onUpload }) {
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [processing, setProcessing] = useState(false);

  const onDrop = useCallback((acceptedFiles) => {
    const newFiles = acceptedFiles.map(file => ({
      file,
      id: Math.random().toString(36).substr(2, 9),
      name: file.name,
      size: file.size,
      type: file.type,
      status: 'pending',
    }));
    
    setUploadedFiles(prev => [...prev, ...newFiles]);
    processFiles(newFiles);
  }, []);

  const processFiles = async (files) => {
    setProcessing(true);
    
    for (const fileObj of files) {
      // Simulate AI processing
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setUploadedFiles(prev => prev.map(f => 
        f.id === fileObj.id 
          ? { ...f, status: 'processed', extractedData: generateMockData() }
          : f
      ));
    }
    
    setProcessing(false);
    toast.success('Documents processed successfully!');
    
    if (onUpload) {
      onUpload(uploadedFiles);
    }
  };

  const generateMockData = () => {
    return {
      amount: (Math.random() * 1000 + 10).toFixed(2),
      merchant: ['Walmart', 'Amazon', 'Starbucks', 'Shell', 'Target'][Math.floor(Math.random() * 5)],
      category: ['Groceries', 'Shopping', 'Food', 'Gas', 'Utilities'][Math.floor(Math.random() * 5)],
      date: new Date().toISOString().split('T')[0],
      confidence: (Math.random() * 0.2 + 0.8).toFixed(2),
    };
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg'],
      'application/pdf': ['.pdf'],
    },
    maxSize: 10485760, // 10MB
  });

  const removeFile = (id) => {
    setUploadedFiles(prev => prev.filter(f => f.id !== id));
  };

  return (
    <div className="space-y-4">
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
          isDragActive
            ? 'border-primary-500 bg-primary-50'
            : 'border-gray-300 hover:border-primary-400 hover:bg-gray-50'
        }`}
      >
        <input {...getInputProps()} />
        <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        {isDragActive ? (
          <p className="text-primary-600 font-medium">Drop files here...</p>
        ) : (
          <div>
            <p className="text-gray-600 mb-2">
              Drag & drop receipts, invoices, or transaction records here
            </p>
            <p className="text-sm text-gray-500">
              or click to browse (PDF, PNG, JPG up to 10MB)
            </p>
          </div>
        )}
      </div>

      {uploadedFiles.length > 0 && (
        <div className="space-y-2">
          <h3 className="font-medium text-gray-900">Uploaded Files</h3>
          {uploadedFiles.map((fileObj) => (
            <div
              key={fileObj.id}
              className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
            >
              <div className="flex items-center space-x-3 flex-1">
                <FileText className="h-5 w-5 text-gray-400" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {fileObj.name}
                  </p>
                  <p className="text-xs text-gray-500">
                    {(fileObj.size / 1024).toFixed(2)} KB
                  </p>
                </div>
                {fileObj.status === 'processed' && (
                  <CheckCircle className="h-5 w-5 text-green-500" />
                )}
                {fileObj.status === 'pending' && (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary-600"></div>
                )}
              </div>
              <button
                onClick={() => removeFile(fileObj.id)}
                className="p-1 hover:bg-gray-200 rounded"
              >
                <X className="h-4 w-4 text-gray-500" />
              </button>
            </div>
          ))}
        </div>
      )}

      {processing && (
        <div className="text-center py-4">
          <div className="inline-flex items-center space-x-2 text-primary-600">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary-600"></div>
            <span className="text-sm">Processing with AI...</span>
          </div>
        </div>
      )}
    </div>
  );
}

