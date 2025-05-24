
import { LocationCoords } from '../types';

export const getCurrentLocation = (): Promise<LocationCoords> => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error("Geolocation is not supported by your browser."));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
      },
      (error) => {
        reject(new Error(`Error getting location: ${error.message}`));
      }
    );
  });
};

// Fix: Changed GECODE_API_KEY to GEOCODE_API_KEY for consistency and standard naming.
export const GEOCODE_API_KEY = process.env.GEOCODE_API_KEY; // Hypothetical API key for a geocoding service

// A mock geocoding function. In a real app, use a service like Google Geocoding API.
export const getAddressFromCoords = async (coords: LocationCoords): Promise<string> => {
  if (!GEOCODE_API_KEY) {
      // console.warn("GEOCODE_API_KEY not set. Returning coords as address.");
      // Fallback for when no geocoding API is available.
      // In a real app, you might want to inform the user or handle this differently.
      return `Lat: ${coords.latitude.toFixed(4)}, Lon: ${coords.longitude.toFixed(4)}`;
  }
  // Simulate API call to a geocoding service
  // This is a placeholder. Replace with actual API call.
  // For example:
  // const response = await fetch(`https://api.geocodingservice.com/reverse?lat=${coords.latitude}&lon=${coords.longitude}&key=${GEOCODE_API_KEY}`);
  // const data = await response.json();
  // return data.address;

  // Mock response:
  await new Promise(resolve => setTimeout(resolve, 500)); // Simulate network delay
  // This is a dummy address.
  if (coords.latitude === 37.7749 && coords.longitude === -122.4194) {
    return "San Francisco, CA, USA (Mocked)";
  }
  return `Approx. Address for ${coords.latitude.toFixed(2)}, ${coords.longitude.toFixed(2)} (Mocked)`;
};