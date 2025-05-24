import React from 'react';
import { HashRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import useLocalStorage from './hooks/useLocalStorage';
import { Trip, Vehicle, User } from './types';

import BottomNav from './components/BottomNav';
import LogTripView from './views/LogTripView';
import HistoryView from './views/HistoryView';
import VehiclesView from './views/VehiclesView';
import ReportsView from './views/ReportsView';
import AIInsightsView from './views/AIInsightsView';
import LoginView from './views/LoginView'; // Import the new LoginView

const App: React.FC = () => {
  const [trips, setTrips] = useLocalStorage<Trip[]>('mileageTrackerTrips', []);
  const [vehicles, setVehicles] = useLocalStorage<Vehicle[]>('mileageTrackerVehicles', []);
  const [currentUser, setCurrentUser] = useLocalStorage<User | null>('mileageTrackerUser', null);

  // Navigation hook needs to be used within a Router context, so we create a tiny component for logout
  const LogoutNavigator: React.FC<{onLogoutAction: () => void}> = ({onLogoutAction}) => {
    const navigate = useNavigate();
    React.useEffect(() => {
      onLogoutAction();
      navigate('/login', { replace: true });
    },[onLogoutAction, navigate]);
    return null; // This component doesn't render anything itself
  }

  const handleGoogleLogin = () => {
    // Simulate successful Google login
    const mockUser: User = {
      id: 'mockUserId123',
      name: 'Demo User',
      email: 'demo@example.com',
      photoUrl: undefined, // Add a mock photo URL if desired
    };
    setCurrentUser(mockUser);
    // Navigation to '/log' will be handled by the routing logic or LoginView's useEffect
  };
  
  let effectiveLogoutAction = () => {
    setCurrentUser(null);
  };
  
  // This is a bit of a hack to allow useNavigate to be called from App.tsx context for logout.
  // A cleaner way might involve a context for auth.
  const AppCore: React.FC = () => {
      const navigate = useNavigate();
      effectiveLogoutAction = () => {
          setCurrentUser(null);
          navigate('/login', {replace: true});
      }

      if (!currentUser) {
        return (
          <Routes>
            <Route path="/login" element={<LoginView onLogin={handleGoogleLogin} currentUser={currentUser} />} />
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        );
      }

      return (
        <>
          <Routes>
            <Route path="/" element={<Navigate to="/log" replace />} />
            <Route path="/log" element={<LogTripView addTrip={addTrip} vehicles={vehicles} currentUser={currentUser} onLogout={effectiveLogoutAction} />} />
            <Route path="/history" element={<HistoryView trips={trips} vehicles={vehicles} deleteTrip={deleteTrip} currentUser={currentUser} onLogout={effectiveLogoutAction} />} />
            <Route path="/vehicles" element={<VehiclesView vehicles={vehicles} addVehicle={addVehicle} updateVehicle={updateVehicle} deleteVehicle={deleteVehicle} currentUser={currentUser} onLogout={effectiveLogoutAction} />} />
            <Route path="/reports" element={<ReportsView trips={trips} vehicles={vehicles} currentUser={currentUser} onLogout={effectiveLogoutAction} />} />
            <Route path="/ai-insights" element={<AIInsightsView trips={trips} currentUser={currentUser} onLogout={effectiveLogoutAction} />} />
            <Route path="/login" element={<Navigate to="/log" replace />} /> {/* If logged in, /login redirects to /log */}
            <Route path="*" element={<Navigate to="/log" replace />} /> {/* Fallback for any other authenticated path */}
          </Routes>
          <BottomNav />
        </>
      );
  }


  const addTrip = (trip: Trip) => {
    setTrips(prevTrips => [trip, ...prevTrips]);
  };

  const deleteTrip = (tripId: string) => {
    setTrips(prevTrips => prevTrips.filter(trip => trip.id !== tripId));
  };
  
  const addVehicle = (vehicleData: Omit<Vehicle, 'id'>) => {
    const newVehicle: Vehicle = { ...vehicleData, id: Date.now().toString() };
    setVehicles(prevVehicles => [newVehicle, ...prevVehicles]);
  };

  const updateVehicle = (updatedVehicle: Vehicle) => {
    setVehicles(prevVehicles => prevVehicles.map(v => v.id === updatedVehicle.id ? updatedVehicle : v));
  };

  const deleteVehicle = (vehicleId: string) => {
    setVehicles(prevVehicles => prevVehicles.filter(v => v.id !== vehicleId));
    setTrips(prevTrips => prevTrips.map(t => t.vehicleId === vehicleId ? {...t, vehicleId: undefined} : t));
  };

  return (
    <HashRouter>
      <div className="font-sans">
        <AppCore />
      </div>
    </HashRouter>
  );
};

export default App;