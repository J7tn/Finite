import React from 'react';

const Settings: React.FC = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-4">Settings</h1>
      <div className="space-y-4">
        <div className="p-4 border rounded-lg">
          <h2 className="text-xl font-semibold mb-2">Notifications</h2>
          <p className="text-gray-600">Configure your notification preferences</p>
        </div>
        <div className="p-4 border rounded-lg">
          <h2 className="text-xl font-semibold mb-2">Appearance</h2>
          <p className="text-gray-600">Customize the app's look and feel</p>
        </div>
      </div>
    </div>
  );
};

export default Settings; 