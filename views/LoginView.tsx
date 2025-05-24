import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User } from '../types';
import { APP_TITLE, GoogleIcon, SparklesIcon } from '../constants';
import LoadingSpinner from '../components/LoadingSpinner';

interface LoginViewProps {
  onLogin: () => void; // Simulate login
  currentUser: User | null;
}

const LoginView: React.FC<LoginViewProps> = ({ onLogin, currentUser }) => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (currentUser) {
      navigate('/log', { replace: true });
    }
  }, [currentUser, navigate]);

  const handleSignIn = () => {
    setIsLoading(true);
    // Simulate API call delay for Google Sign-In
    setTimeout(() => {
      onLogin(); // This will set the currentUser in App.tsx
      // Navigation will happen via useEffect once currentUser is set
      setIsLoading(false);
    }, 1000);
  };

  if (currentUser) {
    return <LoadingSpinner message="Redirecting..." />; // Should be handled by useEffect, but as a fallback
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-700 flex flex-col justify-center items-center p-4 text-white">
      <header className="text-center mb-12">
        <SparklesIcon className="w-16 h-16 mx-auto mb-4 text-blue-400" />
        <h1 className="text-4xl font-bold tracking-tight">{APP_TITLE}</h1>
        <p className="text-slate-300 mt-2">Track your miles effortlessly.</p>
      </header>

      <main className="w-full max-w-xs">
        {isLoading ? (
          <LoadingSpinner message="Signing in..." />
        ) : (
          <button
            onClick={handleSignIn}
            disabled={isLoading}
            className="w-full flex items-center justify-center bg-white text-gray-700 font-semibold py-3 px-4 rounded-lg shadow-md hover:bg-gray-100 transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
            aria-label="Sign in with Google"
          >
            <GoogleIcon className="w-5 h-5 mr-3" />
            Sign in with Google
          </button>
        )}
      </main>

      <footer className="absolute bottom-6 text-center text-slate-400 text-xs">
        <p>&copy; {new Date().getFullYear()} {APP_TITLE}. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default LoginView;