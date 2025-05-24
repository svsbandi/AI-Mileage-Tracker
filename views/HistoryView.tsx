import React, { useState, useMemo } from 'react';
import { Trip, Vehicle, PurposeCategory, User } from '../types';
import PageShell from '../components/PageShell';
import { PurposeCategoryOptions, TrashIcon, EditIcon } from '../constants'; // Assuming icons are here

interface HistoryViewProps {
  trips: Trip[];
  vehicles: Vehicle[];
  deleteTrip: (tripId: string) => void;
  currentUser: User | null;
  onLogout: () => void;
  // updateTrip: (trip: Trip) => void; // Future: For editing trips
}

const TripRow: React.FC<{trip: Trip, vehicleName?: string, onDelete: () => void}> = ({ trip, vehicleName, onDelete }) => {
  return (
    <div className="bg-white p-4 rounded-lg shadow mb-3 hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start">
        <div>
          <p className="text-sm text-gray-500">{new Date(trip.date).toLocaleDateString()}</p>
          <h3 className="text-md font-semibold text-gray-800">
            {trip.startLocation.substring(0,25)}{trip.startLocation.length > 25 ? '...' : ''} to {trip.endLocation.substring(0,25)}{trip.endLocation.length > 25 ? '...' : ''}
          </h3>
        </div>
        <div className="text-right">
            <p className="text-lg font-bold text-blue-600">{trip.distance.toFixed(1)} units</p>
            <button onClick={onDelete} className="text-red-500 hover:text-red-700 ml-2 p-1">
              <TrashIcon className="w-5 h-5" />
            </button>
            {/* <button onClick={() => {}} className="text-blue-500 hover:text-blue-700 ml-1 p-1">
              <EditIcon className="w-5 h-5" />
            </button> */}
        </div>
      </div>
      <div className="mt-2 text-sm text-gray-600">
        <p><span className="font-medium">Purpose:</span> {trip.purposeCategory} {trip.purposeDetail && `(${trip.purposeDetail})`}</p>
        {vehicleName && <p><span className="font-medium">Vehicle:</span> {vehicleName}</p>}
        {trip.notes && <p className="mt-1 italic"><span className="font-medium">Notes:</span> {trip.notes}</p>}
      </div>
    </div>
  );
};

const HistoryView: React.FC<HistoryViewProps> = ({ trips, vehicles, deleteTrip, currentUser, onLogout }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterPurpose, setFilterPurpose] = useState<PurposeCategory | ''>('');
  const [filterVehicle, setFilterVehicle] = useState<string | ''>('');

  const getVehicleName = (vehicleId?: string) => {
    if (!vehicleId) return undefined;
    const vehicle = vehicles.find(v => v.id === vehicleId);
    return vehicle ? `${vehicle.nickname} (${vehicle.make} ${vehicle.model})` : 'Unknown Vehicle';
  };
  
  const filteredTrips = useMemo(() => {
    return trips
      .filter(trip => {
        const term = searchTerm.toLowerCase();
        return (
          trip.startLocation.toLowerCase().includes(term) ||
          trip.endLocation.toLowerCase().includes(term) ||
          (trip.purposeDetail && trip.purposeDetail.toLowerCase().includes(term)) ||
          (trip.notes && trip.notes.toLowerCase().includes(term)) ||
          (getVehicleName(trip.vehicleId) || '').toLowerCase().includes(term)
        );
      })
      .filter(trip => filterPurpose ? trip.purposeCategory === filterPurpose : true)
      .filter(trip => filterVehicle ? trip.vehicleId === filterVehicle : true)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()); // Sort by most recent
  }, [trips, searchTerm, filterPurpose, filterVehicle, vehicles]);


  return (
    <PageShell title="Trip History" currentUser={currentUser} onLogout={onLogout}>
      <div className="mb-6 p-4 bg-white rounded-lg shadow">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <input
            type="text"
            placeholder="Search trips..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="col-span-1 md:col-span-1 p-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          />
          <select
            value={filterPurpose}
            onChange={(e) => setFilterPurpose(e.target.value as PurposeCategory | '')}
            className="col-span-1 md:col-span-1 p-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">All Purposes</option>
            {PurposeCategoryOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
          </select>
          {vehicles.length > 0 && (
            <select
              value={filterVehicle}
              onChange={(e) => setFilterVehicle(e.target.value)}
              className="col-span-1 md:col-span-1 p-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">All Vehicles</option>
              {vehicles.map(v => <option key={v.id} value={v.id}>{v.nickname}</option>)}
            </select>
          )}
        </div>
      </div>

      {filteredTrips.length === 0 ? (
        <p className="text-center text-gray-500 py-8">No trips found. Log your first trip or adjust filters!</p>
      ) : (
        <div className="space-y-4">
          {filteredTrips.map(trip => (
            <TripRow 
              key={trip.id} 
              trip={trip} 
              vehicleName={getVehicleName(trip.vehicleId)} 
              onDelete={() => { if(window.confirm("Are you sure you want to delete this trip?")) deleteTrip(trip.id)}}/>
          ))}
        </div>
      )}
    </PageShell>
  );
};

export default HistoryView;