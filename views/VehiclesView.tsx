import React, { useState } from 'react';
import { Vehicle, User } from '../types';
import PageShell from '../components/PageShell';
import { CarIcon, TrashIcon, EditIcon, PlusCircleIcon } from '../constants';

interface VehicleFormProps {
  onSubmit: (vehicle: Omit<Vehicle, 'id'>) => void;
  initialData?: Vehicle;
  onCancel?: () => void;
}

const VehicleForm: React.FC<VehicleFormProps> = ({ onSubmit, initialData, onCancel }) => {
  const [make, setMake] = useState(initialData?.make || '');
  const [model, setModel] = useState(initialData?.model || '');
  const [year, setYear] = useState(initialData?.year || new Date().getFullYear());
  const [nickname, setNickname] = useState(initialData?.nickname || '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!make || !model || !nickname) {
        alert("Make, Model, and Nickname are required.");
        return;
    }
    onSubmit({ make, model, year, nickname });
    if (!initialData) { // Reset form if it's for adding new
        setMake(''); setModel(''); setYear(new Date().getFullYear()); setNickname('');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 bg-white p-6 rounded-lg shadow mb-6">
      <h3 className="text-lg font-medium text-gray-900">{initialData ? 'Edit Vehicle' : 'Add New Vehicle'}</h3>
      <div>
        <label htmlFor="nickname" className="block text-sm font-medium text-gray-700">Nickname</label>
        <input type="text" id="nickname" value={nickname} onChange={(e) => setNickname(e.target.value)} required
               className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm" />
      </div>
      <div>
        <label htmlFor="make" className="block text-sm font-medium text-gray-700">Make</label>
        <input type="text" id="make" value={make} onChange={(e) => setMake(e.target.value)} required
               className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm" />
      </div>
      <div>
        <label htmlFor="model" className="block text-sm font-medium text-gray-700">Model</label>
        <input type="text" id="model" value={model} onChange={(e) => setModel(e.target.value)} required
               className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm" />
      </div>
      <div>
        <label htmlFor="year" className="block text-sm font-medium text-gray-700">Year</label>
        <input type="number" id="year" value={year} onChange={(e) => setYear(parseInt(e.target.value))} required min="1900" max={new Date().getFullYear() + 1}
               className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm" />
      </div>
      <div className="flex justify-end space-x-3">
        {onCancel && <button type="button" onClick={onCancel} className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md border border-gray-300">Cancel</button>}
        <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
          {initialData ? 'Save Changes' : 'Add Vehicle'}
        </button>
      </div>
    </form>
  );
};


interface VehiclesViewProps {
  vehicles: Vehicle[];
  addVehicle: (vehicle: Omit<Vehicle, 'id'>) => void;
  updateVehicle: (vehicle: Vehicle) => void;
  deleteVehicle: (vehicleId: string) => void;
  currentUser: User | null;
  onLogout: () => void;
}

const VehiclesView: React.FC<VehiclesViewProps> = ({ vehicles, addVehicle, updateVehicle, deleteVehicle, currentUser, onLogout }) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null);

  const handleAddVehicle = (vehicleData: Omit<Vehicle, 'id'>) => {
    addVehicle(vehicleData);
    setShowAddForm(false);
  };
  
  const handleUpdateVehicle = (vehicleData: Omit<Vehicle, 'id'>) => {
    if(editingVehicle) {
      updateVehicle({ ...editingVehicle, ...vehicleData });
      setEditingVehicle(null);
    }
  };

  return (
    <PageShell 
      title="Manage Vehicles"
      currentUser={currentUser}
      onLogout={onLogout}
      rightHeaderContent={
        !showAddForm && !editingVehicle && (
          <button onClick={() => setShowAddForm(true)} className="p-2 text-white hover:bg-blue-700 rounded-full">
            <PlusCircleIcon className="w-6 h-6" />
          </button>
        )
      }
    >
      {showAddForm && (
        <VehicleForm 
          onSubmit={handleAddVehicle} 
          onCancel={() => setShowAddForm(false)}
        />
      )}

      {editingVehicle && (
         <VehicleForm 
          onSubmit={handleUpdateVehicle}
          initialData={editingVehicle}
          onCancel={() => setEditingVehicle(null)}
        />
      )}

      {!showAddForm && !editingVehicle && (
        vehicles.length === 0 ? (
          <div className="text-center py-10">
            <CarIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No vehicles added yet.</p>
            <button onClick={() => setShowAddForm(true)} className="mt-4 px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md shadow-sm">
              Add Your First Vehicle
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {vehicles.map(vehicle => (
              <div key={vehicle.id} className="bg-white p-4 rounded-lg shadow flex justify-between items-center">
                <div>
                  <h3 className="text-lg font-semibold text-gray-800">{vehicle.nickname}</h3>
                  <p className="text-sm text-gray-600">{vehicle.make} {vehicle.model} ({vehicle.year})</p>
                </div>
                <div className="space-x-2">
                   <button onClick={() => setEditingVehicle(vehicle)} className="text-blue-500 hover:text-blue-700 p-1">
                    <EditIcon className="w-5 h-5" />
                  </button>
                  <button onClick={() => {if(window.confirm(`Are you sure you want to delete ${vehicle.nickname}?`)) deleteVehicle(vehicle.id)}} className="text-red-500 hover:text-red-700 p-1">
                    <TrashIcon className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )
      )}
    </PageShell>
  );
};

export default VehiclesView;