import React from 'react';
import { Button } from './ui/button';

const AdminInterface = ({ user, onDataUpdate }) => {
  const handleRefreshData = async () => {
    // Simulate data refresh
    await new Promise((resolve) => setTimeout(resolve, 1000));
    onDataUpdate({
      projects: [
        { id: 1, name: 'Updated Project 1', status: 'active' },
        { id: 2, name: 'Updated Project 2', status: 'completed' },
        { id: 3, name: 'New Project 3', status: 'planning' },
      ],
    });
  };

  return (
    <div className="space-y-8">
      <div className="bg-white/80 backdrop-blur-md border border-white/20 rounded-2xl p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Admin Panel</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">
              System Management
            </h3>

            <Button onClick={handleRefreshData} className="w-full">
              Refresh Data
            </Button>

            <Button variant="outline" className="w-full">
              Export Data
            </Button>

            <Button variant="outline" className="w-full">
              View Logs
            </Button>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">
              User Management
            </h3>

            <Button variant="outline" className="w-full">
              Manage Users
            </Button>

            <Button variant="outline" className="w-full">
              View Sessions
            </Button>

            <Button variant="outline" className="w-full">
              Security Settings
            </Button>
          </div>
        </div>
      </div>

      <div className="bg-white/80 backdrop-blur-md border border-white/20 rounded-2xl p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Recent Activity
        </h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <span className="text-sm text-gray-600">
              User login: {user.name}
            </span>
            <span className="text-xs text-gray-400">Just now</span>
          </div>
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <span className="text-sm text-gray-600">System status: Online</span>
            <span className="text-xs text-gray-400">5 min ago</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminInterface;
