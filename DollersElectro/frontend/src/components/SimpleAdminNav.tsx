import React from 'react';
import { Link } from 'react-router-dom';

const AdminNav: React.FC = () => {
  return (
    <div className="fixed top-4 right-4 z-50">
      <div className="bg-blue-600 text-white px-4 py-2 rounded-lg shadow-lg">
        <Link 
          to="/admin" 
          className="text-sm font-medium hover:text-blue-100 transition-colors"
        >
          🚀 Admin Panel
        </Link>
      </div>
    </div>
  );
};

export default AdminNav;
