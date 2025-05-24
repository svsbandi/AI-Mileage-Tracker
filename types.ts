
export enum PurposeCategory {
  BUSINESS = "Business",
  PERSONAL = "Personal",
  MEDICAL = "Medical",
  CHARITY = "Charity",
  COMMUTE = "Commute",
  OTHER = "Other",
}

export interface Vehicle {
  id: string;
  make: string;
  model: string;
  year: number;
  nickname: string;
}

export interface Trip {
  id: string;
  date: string; // ISO string
  startLocation: string;
  endLocation: string;
  distance: number; // in miles or km
  purposeCategory: PurposeCategory;
  purposeDetail?: string; // More specific detail
  vehicleId?: string; // Optional link to a vehicle
  notes?: string; // General notes, can be AI generated
}

export interface AIPurposeSuggestion {
  purposeCategory: PurposeCategory;
  refinedDescription: string;
}

export interface LocationCoords {
  latitude: number;
  longitude: number;
}

export interface GroundingChunkWeb {
  uri: string;
  title: string;
}
export interface GroundingChunk {
  web?: GroundingChunkWeb;
  retrievedPassage?: {
    content: string;
    title?: string;
    uri?: string;
  };
  // Other types of chunks can be added here if needed
}

export interface GroundingMetadata {
  groundingChunks?: GroundingChunk[];
  // Other grounding metadata fields
}

// For Gemini Service
export interface AIServiceError {
  message: string;
  isApiKeyMissing?: boolean;
}

// User authentication
export interface User {
  id: string;
  name: string;
  email: string;
  photoUrl?: string; // Optional
}

// Google Maps API related types have been removed.
