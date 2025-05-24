import React, { useState } from 'react';
import { Trip, GroundingChunk, GroundingChunkWeb, AIServiceError, User } from '../types';
import PageShell from '../components/PageShell';
import LoadingSpinner from '../components/LoadingSpinner';
import { getMileageInsights, AIInsightResponse } from '../services/GeminiService';
import { SparklesIcon } from '../constants';

interface AIInsightsViewProps {
  trips: Trip[];
  currentUser: User | null;
  onLogout: () => void;
}

const AIInsightsView: React.FC<AIInsightsViewProps> = ({ trips, currentUser, onLogout }) => {
  const [question, setQuestion] = useState('');
  const [insight, setInsight] = useState<string | null>(null);
  const [groundingChunks, setGroundingChunks] = useState<GroundingChunk[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAskQuestion = async () => {
    if (!question.trim()) {
      setError("Please enter a question.");
      return;
    }
    setIsLoading(true);
    setError(null);
    setInsight(null);
    setGroundingChunks([]);

    const result = await getMileageInsights(question, trips);
    
    if ('message' in result) {
      setError(result.message);
      if(result.isApiKeyMissing) alert("Gemini API Key is missing. AI features are disabled.");
    } else {
      const aiResponse = result as AIInsightResponse;
      setInsight(aiResponse.insight);
      if (aiResponse.groundingMetadata?.groundingChunks) {
         setGroundingChunks(aiResponse.groundingMetadata.groundingChunks);
      }
    }
    setIsLoading(false);
  };
  
  if (!currentUser) return null; // Should be caught by router, but for safety

  return (
    <PageShell title="AI Mileage Insights" currentUser={currentUser} onLogout={onLogout}>
      <div className="bg-white p-6 rounded-lg shadow">
        <div className="mb-4">
          <label htmlFor="aiQuestion" className="block text-sm font-medium text-gray-700 mb-1">
            Ask a question about your mileage:
          </label>
          <textarea
            id="aiQuestion"
            rows={3}
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            placeholder="e.g., What was my most common business destination last month? or What are current fuel price trends?"
          />
        </div>
        <button
          onClick={handleAskQuestion}
          disabled={isLoading}
          className="w-full inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50"
        >
          <SparklesIcon className="w-5 h-5 mr-2" />
          {isLoading ? 'Getting Insights...' : 'Ask AI'}
        </button>

        {isLoading && <LoadingSpinner message="AI is analyzing..." />}
        {error && <p className="text-red-500 text-sm mt-4">{error}</p>}
        
        {insight && (
          <div className="mt-6 p-4 bg-gray-50 rounded-md">
            <h3 className="text-md font-semibold text-gray-800 mb-2">AI Response:</h3>
            <p className="text-gray-700 whitespace-pre-wrap">{insight}</p>
            {groundingChunks.length > 0 && (
              <div className="mt-4 border-t pt-3">
                <h4 className="text-sm font-medium text-gray-600">Sources / Related Information:</h4>
                <ul className="list-disc list-inside mt-1 space-y-1">
                  {groundingChunks.map((chunk, index) => {
                     const webChunk = chunk.web as GroundingChunkWeb | undefined; // Type assertion
                     const passageChunk = chunk.retrievedPassage;
                     if (webChunk && webChunk.uri) {
                        return (
                          <li key={index} className="text-xs text-blue-600 hover:underline">
                            <a href={webChunk.uri} target="_blank" rel="noopener noreferrer">
                              {webChunk.title || webChunk.uri}
                            </a>
                          </li>
                        );
                     } else if (passageChunk && passageChunk.uri) {
                        return (
                          <li key={index} className="text-xs text-blue-600 hover:underline">
                            <a href={passageChunk.uri} target="_blank" rel="noopener noreferrer">
                              {passageChunk.title || passageChunk.content.substring(0,50) + "..."}
                            </a>
                          </li>
                        );
                     }
                     return null; // Or render some other fallback
                  })}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>
       <div className="mt-6 text-xs text-gray-500 p-4 bg-white rounded-lg shadow">
          <p className="font-semibold mb-1">Example Questions:</p>
          <ul className="list-disc list-inside space-y-1">
              <li>Summarize my business travel in the last 3 trips.</li>
              <li>Which vehicle did I use most for personal trips?</li>
              <li>What's the average distance of my commute trips?</li>
              <li>Are there any patterns in my long-distance travel?</li>
              <li>Tell me about mileage deduction rules for business use. (Uses Google Search)</li>
          </ul>
        </div>
    </PageShell>
  );
};

export default AIInsightsView;