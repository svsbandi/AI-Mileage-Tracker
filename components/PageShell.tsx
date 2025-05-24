import React from 'react';
import { User } from '../types';
import { LogoutIcon } from '../constants';

interface PageShellProps {
  title: string;
  children: React.ReactNode;
  rightHeaderContent?: React.ReactNode;
  currentUser?: User | null; // Optional, for showing user info or logout
  onLogout?: () => void; // Optional, for logout action
}

const PageShell: React.FC<PageShellProps> = ({ title, children, rightHeaderContent, currentUser, onLogout }) => {
  return (
    <div className="min-h-screen bg-slate-100 pb-20"> {/* pb-20 for bottom nav clearance */}
      <header className="bg-blue-600 text-white p-4 shadow-md sticky top-0 z-40">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-xl font-semibold">{title}</h1>
          <div className="flex items-center space-x-3">
            {rightHeaderContent}
            {currentUser && onLogout && (
              <button 
                onClick={onLogout} 
                className="p-1.5 hover:bg-blue-700 rounded-md text-white"
                title="Logout"
                aria-label="Logout"
              >
                <LogoutIcon className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>
      </header>
      <main className="container mx-auto p-4">
        {children}
      </main>
    </div>
  );
};

export default PageShell;