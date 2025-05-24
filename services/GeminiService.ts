
import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { AIPurposeSuggestion, PurposeCategory, Trip, GroundingMetadata, AIServiceError } from '../types';
import { GEMINI_API_MODEL_TEXT } from '../constants';

const API_KEY = process.env.API_KEY;

let ai: GoogleGenAI | null = null;
if (API_KEY) {
  ai = new GoogleGenAI({ apiKey: API_KEY });
} else {
  console.warn("API_KEY for Gemini is not set. AI features will be disabled.");
}

const handleApiResponse = <T,>(
  response: GenerateContentResponse,
  isJson: boolean = false
): T | AIServiceError => {
  try {
    const text = response.text;
    if (isJson) {
      let jsonStr = text.trim();
      const fenceRegex = /^```(\w*)?\s*\n?(.*?)\n?\s*```$/s;
      const match = jsonStr.match(fenceRegex);
      if (match && match[2]) {
        jsonStr = match[2].trim();
      }
      return JSON.parse(jsonStr) as T;
    }
    return text as T;
  } catch (error) {
    console.error("Error processing Gemini API response:", error);
    return { message: `Error processing API response: ${error instanceof Error ? error.message : String(error)}` };
  }
};

export const suggestTripPurpose = async (
  tripDescription: string
): Promise<AIPurposeSuggestion[] | AIServiceError> => {
  if (!ai) return { message: "AI Service not initialized. API_KEY might be missing.", isApiKeyMissing: true };

  const prompt = `
    You are a helpful assistant for a mileage tracking app.
    Given the following trip description, categorize it into one or more purposes from this list: ${Object.values(PurposeCategory).join(", ")}.
    If multiple purposes apply, list them. For each purpose, provide a brief refined description.
    Return the response as a JSON array of objects, where each object has 'purposeCategory' (must be one of the provided enum values) and 'refinedDescription' keys.

    Trip Description: "${tripDescription}"

    Example for "Met John at Cafe Bistro for a sales pitch, then went to the gym":
    [
      {"purposeCategory": "Business", "refinedDescription": "Sales pitch meeting with John at Cafe Bistro"},
      {"purposeCategory": "Personal", "refinedDescription": "Gym visit"}
    ]
  `;

  try {
    const response = await ai.models.generateContent({
      model: GEMINI_API_MODEL_TEXT,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        temperature: 0.5,
      }
    });
    return handleApiResponse<AIPurposeSuggestion[]>(response, true);
  } catch (error) {
    console.error("Error suggesting trip purpose:", error);
    return { message: `Failed to get AI suggestions: ${error instanceof Error ? error.message : String(error)}` };
  }
};

export const generateTripNotes = async (
  trip: Pick<Trip, 'startLocation' | 'endLocation' | 'purposeCategory' | 'purposeDetail' | 'date'>
): Promise<string | AIServiceError> => {
  if (!ai) return { message: "AI Service not initialized. API_KEY might be missing.", isApiKeyMissing: true };

  const prompt = `
    You are a helpful assistant for a mileage tracking app.
    Generate a concise and professional trip log note based on the following details:
    Start Location: "${trip.startLocation}"
    End Location: "${trip.endLocation}"
    Purpose: ${trip.purposeCategory}
    ${trip.purposeDetail ? `Detail: "${trip.purposeDetail}"` : ""}
    Date: ${new Date(trip.date).toLocaleDateString()}

    Keep the note under 25 words.
    Example: "Business trip to Client Office from Home for project meeting on ${new Date().toLocaleDateString()}."
  `;

  try {
    const response = await ai.models.generateContent({
      model: GEMINI_API_MODEL_TEXT,
      contents: prompt,
      config: {
        temperature: 0.7,
      }
    });
    return handleApiResponse<string>(response);
  } catch (error) {
    console.error("Error generating trip notes:", error);
    return { message: `Failed to generate AI notes: ${error instanceof Error ? error.message : String(error)}` };
  }
};

export interface AIInsightResponse {
  insight: string;
  groundingMetadata?: GroundingMetadata;
}

export const getMileageInsights = async (
  userQuestion: string,
  tripsData: Trip[]
): Promise<AIInsightResponse | AIServiceError> => {
  if (!ai) return { message: "AI Service not initialized. API_KEY might be missing.", isApiKeyMissing: true };

  // Basic data sanitization/summary if tripsData is too large
  const summarizedTrips = tripsData.slice(0, 50).map(t => ({ // Send max 50 recent trips for context
    date: t.date,
    distance: t.distance,
    purpose: t.purposeCategory,
    start: t.startLocation.substring(0,30), // Truncate for brevity
    end: t.endLocation.substring(0,30)
  }));


  const prompt = `
    You are a data analyst for a mileage tracking app.
    Based on the following trip data, answer the user's question:
    User Question: "${userQuestion}"

    Trip Data Summary (recent trips):
    ${JSON.stringify(summarizedTrips, null, 2)}

    Provide a concise answer. If the data seems insufficient for a definitive answer, state that.
    If the question is about recent events or requires up-to-date information, use your knowledge and available tools.
  `;
  
  const useGoogleSearch = userQuestion.toLowerCase().includes("recent") || userQuestion.toLowerCase().includes("news") || userQuestion.toLowerCase().includes("current");

  try {
    const response = await ai.models.generateContent({
      model: GEMINI_API_MODEL_TEXT,
      contents: prompt,
      config: {
        temperature: 0.5,
        tools: useGoogleSearch ? [{ googleSearch: {} }] : undefined,
      }
    });
    
    const insightText = response.text;
    const groundingMetadata = response.candidates?.[0]?.groundingMetadata as GroundingMetadata | undefined;

    return { insight: insightText, groundingMetadata };

  } catch (error) {
    console.error("Error getting mileage insights:", error);
    return { message: `Failed to get AI insights: ${error instanceof Error ? error.message : String(error)}` };
  }
};
