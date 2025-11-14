import { Car, Plus, Edit, Trash2, Fuel, Wrench, Calendar } from 'lucide-react';
import { useState } from 'react';
import toast from 'react-hot-toast';

const mockVehicles = [
  {
    id: 1,
    name: 'Vehicle 1',
    type: 'Sedan',
    licensePlate: 'ABC-1234',
    year: 2020,
    mileage: 45000,
    lastService: '2024-02-15',
    nextService: '2024-05-15',
    status: 'active',
  },
  {
    id: 2,
    name: 'Vehicle 2',
    type: 'SUV',
    licensePlate: 'XYZ-5678',
    year: 2022,
    mileage: 25000,
    lastService: '2024-03-01',
    nextService: '2024-06-01',
    status: 'active',
  },
];

export default function Vehicles() {
  const [vehicles, setVehicles] = useState(mockVehicles);
  const [showAddModal, setShowAddModal] = useState(false);

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this vehicle?')) {
      setVehicles(vehicles.filter(v => v.id !== id));
      toast.success('Vehicle deleted successfully');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Vehicles</h1>
          <p className="text-gray-600 mt-1">Manage your vehicle fleet</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="btn-primary flex items-center space-x-2"
        >
          <Plus className="h-5 w-5" />
          <span>Add Vehicle</span>
        </button>
      </div>

      {/* Vehicles Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {vehicles.map((vehicle) => (
          <div key={vehicle.id} className="card">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="bg-primary-100 p-3 rounded-lg">
                  <Car className="h-6 w-6 text-primary-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 text-lg">{vehicle.name}</h3>
                  <p className="text-sm text-gray-500">{vehicle.type} • {vehicle.year}</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <button className="p-2 hover:bg-gray-100 rounded-lg">
                  <Edit className="h-5 w-5 text-gray-600" />
                </button>
                <button
                  onClick={() => handleDelete(vehicle.id)}
                  className="p-2 hover:bg-gray-100 rounded-lg"
                >
                  <Trash2 className="h-5 w-5 text-red-600" />
                </button>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-2">
                  <Fuel className="h-4 w-4 text-gray-400" />
                  <span className="text-sm text-gray-600">License Plate</span>
                </div>
                <span className="font-medium text-gray-900">{vehicle.licensePlate}</span>
              </div>

              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-2">
                  <Car className="h-4 w-4 text-gray-400" />
                  <span className="text-sm text-gray-600">Mileage</span>
                </div>
                <span className="font-medium text-gray-900">{vehicle.mileage.toLocaleString()} mi</span>
              </div>

              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-2">
                  <Wrench className="h-4 w-4 text-gray-400" />
                  <span className="text-sm text-gray-600">Last Service</span>
                </div>
                <span className="font-medium text-gray-900">{vehicle.lastService}</span>
              </div>

              <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                <div className="flex items-center space-x-2">
                  <Calendar className="h-4 w-4 text-blue-600" />
                  <span className="text-sm text-blue-600 font-medium">Next Service</span>
                </div>
                <span className="font-medium text-blue-900">{vehicle.nextService}</span>
              </div>

              <div className="pt-3 border-t border-gray-200">
                <span className={`px-3 py-1 text-xs font-medium rounded-full ${
                  vehicle.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                }`}>
                  {vehicle.status}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h2 className="text-xl font-bold mb-4">Add New Vehicle</h2>
            <p className="text-gray-600 mb-4">Vehicle registration form would go here</p>
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setShowAddModal(false)}
                className="btn-secondary"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setShowAddModal(false);
                  toast.success('Vehicle added successfully');
                }}
                className="btn-primary"
              >
                Add Vehicle
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

