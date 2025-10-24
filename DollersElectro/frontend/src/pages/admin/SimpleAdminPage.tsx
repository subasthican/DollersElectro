import React from 'react';

const AdminPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Admin Dashboard</h1>
        
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Welcome to Admin Panel</h2>
          <p className="text-gray-600 mb-4">
            This is your main admin dashboard for managing the entire system.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="text-lg font-medium text-blue-900">Users</h3>
              <p className="text-2xl font-bold text-blue-600">1,247</p>
              <p className="text-sm text-blue-700">Total registered users</p>
            </div>
            
            <div className="bg-green-50 p-4 rounded-lg">
              <h3 className="text-lg font-medium text-green-900">Products</h3>
              <p className="text-2xl font-bold text-green-600">156</p>
              <p className="text-sm text-green-700">Total products</p>
            </div>
            
            <div className="bg-purple-50 p-4 rounded-lg">
              <h3 className="text-lg font-medium text-purple-900">Orders</h3>
              <p className="text-2xl font-bold text-purple-600">2,341</p>
              <p className="text-sm text-purple-700">Total orders</p>
            </div>
          </div>
          
          <div className="mt-8">
            <h3 className="text-lg font-medium text-gray-800 mb-4">Quick Actions</h3>
            <div className="flex flex-wrap gap-3">
              <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
                Add Product
              </button>
              <button className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors">
                View Users
              </button>
              <button className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors">
                Manage Orders
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminPage;



