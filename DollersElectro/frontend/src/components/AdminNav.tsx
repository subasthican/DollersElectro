import React from 'react';
import { Link } from 'react-router-dom';

const AdminNav: React.FC = () => {
  return (
    <div className="fixed top-[72px] right-4 z-[60]">
      <div className="backdrop-blur-2xl bg-gradient-to-br from-red-500/90 to-red-600/90 hover:from-red-600/95 hover:to-red-700/95 text-white px-4 py-2.5 rounded-2xl shadow-2xl shadow-red-500/40 hover:shadow-red-500/60 border-2 border-white/30 hover:border-white/50 transition-all duration-300 hover:scale-105">
        <Link 
          to="/admin" 
          className="text-sm font-bold hover:text-white/90 transition-colors flex items-center gap-2"
        >
          <span className="text-base">🔧</span>
          Admin Panel
        </Link>
      </div>
    </div>
  );
};

export default AdminNav;
