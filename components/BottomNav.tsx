
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { HomeIcon, PlusCircleIcon, ListBulletIcon, ChartBarIcon, SparklesIcon, CarIcon } from '../constants';

interface NavItemProps {
  to: string;
  icon: React.ReactNode;
  label: string;
  currentPath: string;
}

const NavItem: React.FC<NavItemProps> = ({ to, icon, label, currentPath }) => {
  const isActive = currentPath === to || (currentPath === "/" && to === "/log"); // Default to Log Trip
  return (
    <Link
      to={to}
      className={`flex flex-col items-center justify-center flex-1 p-2 text-xs ${
        isActive ? 'text-blue-600' : 'text-gray-500 hover:text-blue-500'
      }`}
    >
      {icon}
      <span>{label}</span>
    </Link>
  );
};

const BottomNav: React.FC = () => {
  const location = useLocation();
  const currentPath = location.pathname;

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-md flex z-50">
      <NavItem to="/log" icon={<PlusCircleIcon className="w-6 h-6 mb-1" />} label="Log Trip" currentPath={currentPath} />
      <NavItem to="/history" icon={<ListBulletIcon className="w-6 h-6 mb-1" />} label="History" currentPath={currentPath} />
      <NavItem to="/vehicles" icon={<CarIcon className="w-6 h-6 mb-1" />} label="Vehicles" currentPath={currentPath} />
      <NavItem to="/reports" icon={<ChartBarIcon className="w-6 h-6 mb-1" />} label="Reports" currentPath={currentPath} />
      <NavItem to="/ai-insights" icon={<SparklesIcon className="w-6 h-6 mb-1" />} label="AI Insights" currentPath={currentPath} />
    </nav>
  );
};

export default BottomNav;
