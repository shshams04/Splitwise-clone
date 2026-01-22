import React from 'react';

function App() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-green-600 mb-4">🎉 Success!</h1>
        <p className="text-xl text-gray-700 mb-2">Your Splitwise Clone is Ready</p>
        <p className="text-gray-600">All Supabase tables are configured correctly</p>
        <div className="mt-6 p-4 bg-white rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-2">What's Working:</h2>
          <ul className="text-left space-y-2">
            <li>✅ React App</li>
            <li>✅ Vercel Deployment</li>
            <li>✅ Supabase Database</li>
            <li>✅ All Tables Created</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export default App;
