import React, { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Trip, Vehicle, PurposeCategory, User } from '../types';
import PageShell from '../components/PageShell';

interface ReportsViewProps {
  trips: Trip[];
  vehicles: Vehicle[];
  currentUser: User | null;
  onLogout: () => void;
}

const StatCard: React.FC<{ title: string; value: string | number; icon?: React.ReactNode }> = ({ title, value, icon }) => (
  <div className="bg-white p-6 rounded-lg shadow">
    {icon && <div className="text-blue-500 mb-2">{icon}</div>}
    <h3 className="text-sm font-medium text-gray-500">{title}</h3>
    <p className="text-2xl font-semibold text-gray-800">{value}</p>
  </div>
);


const ReportsView: React.FC<ReportsViewProps> = ({ trips, vehicles, currentUser, onLogout }) => {
  const totalMileage = useMemo(() => {
    return trips.reduce((sum, trip) => sum + trip.distance, 0).toFixed(1);
  }, [trips]);

  const mileageByPurpose = useMemo(() => {
    const data: { [key in PurposeCategory]?: number } = {};
    Object.values(PurposeCategory).forEach(p => data[p] = 0);

    trips.forEach(trip => {
      data[trip.purposeCategory] = (data[trip.purposeCategory] || 0) + trip.distance;
    });
    return Object.entries(data)
                 .map(([name, value]) => ({ name, mileage: parseFloat(value!.toFixed(1)) }))
                 .filter(item => item.mileage > 0)
                 .sort((a,b) => b.mileage - a.mileage);
  }, [trips]);

  const mileageByVehicle = useMemo(() => {
    const data: { [key: string]: number } = {};
    vehicles.forEach(v => data[v.nickname] = 0);
    data['Unspecified'] = 0;


    trips.forEach(trip => {
      const vehicle = vehicles.find(v => v.id === trip.vehicleId);
      const key = vehicle ? vehicle.nickname : 'Unspecified';
      data[key] = (data[key] || 0) + trip.distance;
    });
    return Object.entries(data)
                 .map(([name, value]) => ({ name, mileage: parseFloat(value.toFixed(1)) }))
                 .filter(item => item.mileage > 0)
                 .sort((a,b) => b.mileage - a.mileage);
  }, [trips, vehicles]);

  if (trips.length === 0 && currentUser) { // Ensure we show this only if logged in but no data
    return (
      <PageShell title="Reports" currentUser={currentUser} onLogout={onLogout}>
        <div className="text-center py-10">
          <p className="text-gray-500">No trip data available to generate reports.</p>
          <p className="text-gray-500">Log some trips to see your stats!</p>
        </div>
      </PageShell>
    );
  }
   if (!currentUser) return null; // Should be caught by router, but for safety

  return (
    <PageShell title="Mileage Reports" currentUser={currentUser} onLogout={onLogout}>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <StatCard title="Total Mileage" value={`${totalMileage} units`} />
        <StatCard title="Total Trips" value={trips.length} />
        {vehicles.length > 0 && <StatCard title="Vehicles Tracked" value={vehicles.length} />}
      </div>

      <div className="space-y-8">
        {mileageByPurpose.length > 0 && (
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-gray-700 mb-4">Mileage by Purpose</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={mileageByPurpose} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="mileage" fill="#3B82F6" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {mileageByVehicle.length > 0 && vehicles.length > 0 && (
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-gray-700 mb-4">Mileage by Vehicle</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={mileageByVehicle} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="mileage" fill="#10B981" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </PageShell>
  );
};

export default ReportsView;