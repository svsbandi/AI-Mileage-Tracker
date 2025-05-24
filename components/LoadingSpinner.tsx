
import React from 'react';

const LoadingSpinner: React.FC<{ size?: string; message?: string }> = ({ size = "w-8 h-8", message }) => {
  return (
    <div className="flex flex-col items-center justify-center p-4">
      <div className={`animate-spin rounded-full border-4 border-blue-500 border-t-transparent ${size}`} />
      {message && <p className="mt-2 text-sm text-gray-600">{message}</p>}
    </div>
  );
};

export default LoadingSpinner;
