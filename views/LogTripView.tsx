
import React, { useState, useEffect } from 'react';
import { Trip, Vehicle, PurposeCategory, AIPurposeSuggestion, AIServiceError, User } from '../types';
import { PurposeCategoryOptions, SparklesIcon, MapPinIcon } from '../constants';
import PageShell from '../components/PageShell';
import LoadingSpinner from '../components/LoadingSpinner';
import { suggestTripPurpose, generateTripNotes } from '../services/GeminiService';
import { getCurrentLocation, getAddressFromCoords } from '../services/LocationService';

interface LogTripViewProps {
  addTrip: (trip: Trip) => void;
  vehicles: Vehicle[];
  currentUser: User | null;
  onLogout: () => void;
}

const LogTripView: React.FC<LogTripViewProps> = ({ addTrip, vehicles, currentUser, onLogout }) => {
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [startLocation, setStartLocation] = useState('');
  const [endLocation, setEndLocation] = useState('');
  const [distance, setDistance] = useState(''); // Stores distance as string for input field
  const [purposeCategory, setPurposeCategory] = useState<PurposeCategory>(PurposeCategory.BUSINESS);
  const [purposeDetail, setPurposeDetail] = useState('');
  const [vehicleId, setVehicleId] = useState<string | undefined>(vehicles.length > 0 ? vehicles[0].id : undefined);
  const [notes, setNotes] = useState('');

  const [rawDescriptionForAI, setRawDescriptionForAI] = useState('');
  const [aiSuggestions, setAiSuggestions] = useState<AIPurposeSuggestion[]>([]);
  const [isLoadingAI, setIsLoadingAI] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  
  const [isFetchingGeoLocation, setIsFetchingGeoLocation] = useState<boolean>(false);
  const [geoLocationError, setGeoLocationError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);


  useEffect(() => {
    if (vehicles.length > 0 && !vehicleId) {
      setVehicleId(vehicles[0].id);
    }
  }, [vehicles, vehicleId]);

  const handleGetGeoLocation = async (locationSetter: React.Dispatch<React.SetStateAction<string>>) => {
    setIsFetchingGeoLocation(true);
    setGeoLocationError(null);
    setFormError(null);
    try {
      const coords = await getCurrentLocation();
      const address = await getAddressFromCoords(coords); 
      locationSetter(address);
    } catch (error) {
      setGeoLocationError(error instanceof Error ? error.message : "Failed to get location");
    } finally {
      setIsFetchingGeoLocation(false);
    }
  };

  const handleSuggestPurpose = async () => {
    if (!rawDescriptionForAI.trim()) {
      setAiError("Please enter a trip description first.");
      return;
    }
    setIsLoadingAI(true);
    setAiError(null);
    setAiSuggestions([]);
    const result = await suggestTripPurpose(rawDescriptionForAI);
    if ('message' in result) {
      setAiError(result.message);
       if(result.isApiKeyMissing) alert("Gemini API Key is missing. AI features are disabled.");
    } else {
      setAiSuggestions(result);
    }
    setIsLoadingAI(false);
  };

  const handleGenerateNotes = async () => {
    if (!startLocation || !endLocation) {
        setAiError("Please fill in start and end locations to generate notes.");
        return;
    }
    setIsLoadingAI(true);
    setAiError(null);
    const tripDataForNotes = {
        startLocation,
        endLocation,
        purposeCategory,
        purposeDetail,
        date
    };
    const result = await generateTripNotes(tripDataForNotes);
    if (typeof result === 'string') {
      setNotes(result);
    } else {
      setAiError(result.message);
      if (result.isApiKeyMissing) {
        alert("Gemini API Key is missing. AI features are disabled.");
      }
    }
    setIsLoadingAI(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null); // Clear previous form errors
    if (!distance || isNaN(parseFloat(distance)) || parseFloat(distance) <=0) {
        setFormError("Please enter a valid distance.");
        document.getElementById('distance')?.focus();
        return;
    }
    if (!startLocation.trim()) {
        setFormError("Start location cannot be empty.");
        document.getElementById('startLocation')?.focus();
        return;
    }
    if (!endLocation.trim()) {
        setFormError("End location cannot be empty.");
        document.getElementById('endLocation')?.focus();
        return;
    }

    const newTrip: Trip = {
      id: Date.now().toString(),
      date,
      startLocation,
      endLocation,
      distance: parseFloat(distance),
      purposeCategory,
      purposeDetail,
      vehicleId,
      notes,
    };
    addTrip(newTrip);
    // Reset form
    setDate(new Date().toISOString().split('T')[0]);
    setStartLocation('');
    setEndLocation('');
    setDistance('');
    setPurposeCategory(PurposeCategory.BUSINESS);
    setPurposeDetail('');
    setRawDescriptionForAI('');
    setAiSuggestions([]);
    setNotes('');
    setGeoLocationError(null);
    setFormError(null);
    alert("Trip logged successfully!");
  };

  return (
    <PageShell title="Log New Trip" currentUser={currentUser} onLogout={onLogout}>
      <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 rounded-lg shadow">
        
        <div>
          <label htmlFor="date" className="block text-sm font-medium text-gray-700">Date</label>
          <input type="date" id="date" value={date} onChange={(e) => setDate(e.target.value)} required 
                 className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm" />
        </div>

        {/* Start Location Input */}
        <div>
          <label htmlFor="startLocation" className="block text-sm font-medium text-gray-700">Start Location</label>
          <div className="mt-1 flex rounded-md shadow-sm">
            <input 
              type="text" 
              id="startLocation"
              value={startLocation} 
              onChange={(e) => setStartLocation(e.target.value)}
              required
              placeholder="Enter start address"
              className="flex-1 block w-full min-w-0 rounded-none rounded-l-md px-3 py-2 border border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm" 
            />
            <button 
              type="button" 
              onClick={() => handleGetGeoLocation(setStartLocation)} 
              disabled={isFetchingGeoLocation}
              className="inline-flex items-center px-3 py-2 border border-l-0 border-gray-300 rounded-r-md bg-gray-50 text-gray-500 hover:bg-gray-100 text-sm disabled:opacity-50"
              aria-label="Get current start location"
            >
              {isFetchingGeoLocation ? <LoadingSpinner size="w-4 h-4" /> : <MapPinIcon className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* End Location Input */}
        <div>
          <label htmlFor="endLocation" className="block text-sm font-medium text-gray-700">End Location</label>
          <div className="mt-1 flex rounded-md shadow-sm">
            <input 
              type="text" 
              id="endLocation"
              value={endLocation}
              onChange={(e) => setEndLocation(e.target.value)}
              required
              placeholder="Enter end address"
              className="flex-1 block w-full min-w-0 rounded-none rounded-l-md px-3 py-2 border border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            />
            <button 
              type="button" 
              onClick={() => handleGetGeoLocation(setEndLocation)} 
              disabled={isFetchingGeoLocation}
              className="inline-flex items-center px-3 py-2 border border-l-0 border-gray-300 rounded-r-md bg-gray-50 text-gray-500 hover:bg-gray-100 text-sm disabled:opacity-50"
              aria-label="Get current end location"
            >
              {isFetchingGeoLocation ? <LoadingSpinner size="w-4 h-4" /> : <MapPinIcon className="w-5 h-5" />}
            </button>
          </div>
        </div>
        {geoLocationError && <p className="text-red-500 text-xs mt-1">{geoLocationError}</p>}


        <div>
          <label htmlFor="distance" className="block text-sm font-medium text-gray-700">
            Distance (km)
          </label>
          <input 
            type="number" 
            id="distance" 
            value={distance} 
            onChange={(e) => setDistance(e.target.value)} 
            required 
            step="0.1"
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          />
        </div>
        {formError && <p className="text-red-500 text-xs mt-1">{formError}</p>}


        <div className="border-t pt-4 mt-4">
            <h3 className="text-md font-medium text-gray-800 mb-2">AI Trip Assistant</h3>
            <div>
                <label htmlFor="rawDescription" className="block text-sm font-medium text-gray-700">Describe your trip for AI Purpose Suggestion</label>
                <textarea id="rawDescription" value={rawDescriptionForAI} onChange={(e) => setRawDescriptionForAI(e.target.value)} rows={2}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        placeholder="e.g., Met client at downtown office, then picked up groceries." />
                <button type="button" onClick={handleSuggestPurpose} disabled={isLoadingAI}
                        className="mt-2 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50">
                    <SparklesIcon className="w-4 h-4 mr-2" /> Suggest Purpose
                </button>
            </div>
            {isLoadingAI && <LoadingSpinner message="AI is thinking..." />}
            {aiError && <p className="text-red-500 text-sm mt-2">{aiError}</p>}
            {aiSuggestions.length > 0 && (
                <div className="mt-4 space-y-2">
                    <p className="text-sm font-medium text-gray-700">AI Suggested Purposes:</p>
                    {aiSuggestions.map((suggestion, index) => (
                        <button key={index} type="button"
                                onClick={() => {
                                    setPurposeCategory(suggestion.purposeCategory);
                                    setPurposeDetail(suggestion.refinedDescription);
                                    setAiSuggestions([]); 
                                }}
                                className="block w-full text-left p-2 bg-gray-100 hover:bg-gray-200 rounded-md text-sm">
                            <strong>{suggestion.purposeCategory}:</strong> {suggestion.refinedDescription}
                        </button>
                    ))}
                </div>
            )}
        </div>

        <div>
          <label htmlFor="purposeCategory" className="block text-sm font-medium text-gray-700">Purpose Category</label>
          <select id="purposeCategory" value={purposeCategory} onChange={(e) => setPurposeCategory(e.target.value as PurposeCategory)}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm">
            {PurposeCategoryOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
          </select>
        </div>

        <div>
          <label htmlFor="purposeDetail" className="block text-sm font-medium text-gray-700">Purpose Detail (Optional)</label>
          <input type="text" id="purposeDetail" value={purposeDetail} onChange={(e) => setPurposeDetail(e.target.value)}
                 className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                 placeholder="e.g., Meeting with Client X" />
        </div>
        
        {vehicles.length > 0 && (
          <div>
            <label htmlFor="vehicleId" className="block text-sm font-medium text-gray-700">Vehicle (Optional)</label>
            <select id="vehicleId" value={vehicleId || ''} onChange={(e) => setVehicleId(e.target.value)}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm">
              <option value="">None</option>
              {vehicles.map(v => <option key={v.id} value={v.id}>{v.nickname} ({v.make} {v.model})</option>)}
            </select>
          </div>
        )}

        <div>
          <label htmlFor="notes" className="block text-sm font-medium text-gray-700">Notes (Optional)</label>
          <textarea id="notes" value={notes} onChange={(e) => setNotes(e.target.value)} rows={3}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    placeholder="Any additional notes about the trip..." />
           <button type="button" onClick={handleGenerateNotes} disabled={isLoadingAI}
                    className="mt-2 inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50">
                <SparklesIcon className="w-3 h-3 mr-1" /> Generate Notes
            </button>
        </div>

        <button type="submit"
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
          Log Trip
        </button>
      </form>
    </PageShell>
  );
};

export default LogTripView;
