import React from 'react';

const DemoMode = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            🚀 Splitwise Clone Demo
          </h2>
          <p className="text-gray-600 mb-6">
            Your app is successfully deployed! 
          </p>
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
            <h3 className="text-green-800 font-semibold mb-2">✅ Frontend Live</h3>
            <p className="text-green-700 text-sm">
              Your React app is running on Vercel
            </p>
          </div>
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
            <h3 className="text-yellow-800 font-semibold mb-2">⚠️ Next Steps</h3>
            <p className="text-yellow-700 text-sm">
              Deploy backend to connect full functionality
            </p>
          </div>
          <div className="space-y-2 text-left">
            <h3 className="font-semibold text-gray-900 mb-2">Features Ready:</h3>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>✅ User authentication</li>
              <li>✅ Group management</li>
              <li>✅ Expense tracking</li>
              <li>✅ Balance calculations</li>
              <li>✅ Member invitations</li>
              <li>✅ Responsive design</li>
            </ul>
          </div>
          <div className="mt-6 pt-4 border-t">
            <p className="text-xs text-gray-500">
              Backend deployment needed for full functionality
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DemoMode;
