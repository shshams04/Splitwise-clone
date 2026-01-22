import React, { useState } from 'react';

function App() {
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [groups, setGroups] = useState([]);
  const [showCreateGroup, setShowCreateGroup] = useState(false);
  const [groupName, setGroupName] = useState('');

  const handleCreateGroup = () => {
    if (groupName.trim()) {
      setGroups([...groups, { id: Date.now(), name: groupName, created: new Date().toLocaleDateString() }]);
      setGroupName('');
      setShowCreateGroup(false);
    }
  };

  const renderPage = () => {
    switch(currentPage) {
      case 'dashboard':
        return (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h1 style={{ fontSize: '2rem', fontWeight: 'bold', color: '#111827' }}>My Groups</h1>
              <button
                onClick={() => setShowCreateGroup(true)}
                style={{
                  backgroundColor: '#10b981',
                  color: 'white',
                  padding: '8px 16px',
                  borderRadius: '6px',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '14px'
                }}
              >
                + Create Group
              </button>
            </div>
            
            {groups.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '48px', backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                <div style={{ fontSize: '3rem', marginBottom: '16px' }}>👥</div>
                <h2 style={{ fontSize: '1.25rem', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>No groups yet</h2>
                <p style={{ color: '#6b7280' }}>Create your first group to start splitting expenses!</p>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '16px' }}>
                {groups.map(group => (
                  <div key={group.id} style={{ backgroundColor: 'white', padding: '24px', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                    <h3 style={{ fontSize: '1.125rem', fontWeight: '600', color: '#111827', marginBottom: '8px' }}>{group.name}</h3>
                    <p style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '16px' }}>Created: {group.created}</p>
                    <button
                      style={{
                        backgroundColor: '#3b82f6',
                        color: 'white',
                        padding: '8px 16px',
                        borderRadius: '6px',
                        border: 'none',
                        cursor: 'pointer',
                        fontSize: '14px',
                        width: '100%'
                      }}
                    >
                      View Group
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      
      case 'login':
        return (
          <div style={{ maxWidth: '400px', margin: '0 auto', padding: '32px', backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#111827', marginBottom: '24px', textAlign: 'center' }}>Login</h2>
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#374151', marginBottom: '4px' }}>Email</label>
              <input
                type="email"
                style={{ width: '100%', padding: '8px 12px', border: '1px solid #d1d5db', borderRadius: '6px' }}
                placeholder="Enter your email"
              />
            </div>
            <div style={{ marginBottom: '24px' }}>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#374151', marginBottom: '4px' }}>Password</label>
              <input
                type="password"
                style={{ width: '100%', padding: '8px 12px', border: '1px solid #d1d5db', borderRadius: '6px' }}
                placeholder="Enter your password"
              />
            </div>
            <button
              onClick={() => setCurrentPage('dashboard')}
              style={{
                backgroundColor: '#3b82f6',
                color: 'white',
                padding: '10px 16px',
                borderRadius: '6px',
                border: 'none',
                cursor: 'pointer',
                fontSize: '14px',
                width: '100%'
              }}
            >
              Login
            </button>
            <p style={{ textAlign: 'center', marginTop: '16px', fontSize: '0.875rem', color: '#6b7280' }}>
              Don't have an account? <button onClick={() => setCurrentPage('register')} style={{ color: '#3b82f6', background: 'none', border: 'none', cursor: 'pointer' }}>Register</button>
            </p>
          </div>
        );
      
      case 'register':
        return (
          <div style={{ maxWidth: '400px', margin: '0 auto', padding: '32px', backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#111827', marginBottom: '24px', textAlign: 'center' }}>Register</h2>
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#374151', marginBottom: '4px' }}>Username</label>
              <input
                type="text"
                style={{ width: '100%', padding: '8px 12px', border: '1px solid #d1d5db', borderRadius: '6px' }}
                placeholder="Choose a username"
              />
            </div>
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#374151', marginBottom: '4px' }}>Email</label>
              <input
                type="email"
                style={{ width: '100%', padding: '8px 12px', border: '1px solid #d1d5db', borderRadius: '6px' }}
                placeholder="Enter your email"
              />
            </div>
            <div style={{ marginBottom: '24px' }}>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#374151', marginBottom: '4px' }}>Password</label>
              <input
                type="password"
                style={{ width: '100%', padding: '8px 12px', border: '1px solid #d1d5db', borderRadius: '6px' }}
                placeholder="Create a password"
              />
            </div>
            <button
              onClick={() => setCurrentPage('dashboard')}
              style={{
                backgroundColor: '#10b981',
                color: 'white',
                padding: '10px 16px',
                borderRadius: '6px',
                border: 'none',
                cursor: 'pointer',
                fontSize: '14px',
                width: '100%'
              }}
            >
              Register
            </button>
            <p style={{ textAlign: 'center', marginTop: '16px', fontSize: '0.875rem', color: '#6b7280' }}>
              Already have an account? <button onClick={() => setCurrentPage('login')} style={{ color: '#3b82f6', background: 'none', border: 'none', cursor: 'pointer' }}>Login</button>
            </p>
          </div>
        );
      
      default:
        return null;
    }
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f9fafb' }}>
      {/* Navigation */}
      <nav style={{ backgroundColor: 'white', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', height: '64px' }}>
            <h1 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#111827' }}>Splitwise</h1>
            <div style={{ display: 'flex', gap: '16px' }}>
              <button
                onClick={() => setCurrentPage('login')}
                style={{
                  color: currentPage === 'login' ? '#3b82f6' : '#6b7280',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '14px',
                  padding: '8px 12px',
                  borderRadius: '4px'
                }}
              >
                Login
              </button>
              <button
                onClick={() => setCurrentPage('register')}
                style={{
                  color: currentPage === 'register' ? '#3b82f6' : '#6b7280',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '14px',
                  padding: '8px 12px',
                  borderRadius: '4px'
                }}
              >
                Register
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main style={{ maxWidth: '1200px', margin: '0 auto', padding: '32px 16px' }}>
        {renderPage()}
      </main>

      {/* Create Group Modal */}
      {showCreateGroup && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: '8px', maxWidth: '400px', width: '100%', margin: '16px' }}>
            <h3 style={{ fontSize: '1.125rem', fontWeight: '600', color: '#111827', marginBottom: '16px' }}>Create New Group</h3>
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#374151', marginBottom: '4px' }}>Group Name</label>
              <input
                type="text"
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
                style={{ width: '100%', padding: '8px 12px', border: '1px solid #d1d5db', borderRadius: '6px' }}
                placeholder="Enter group name"
                autoFocus
              />
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                onClick={handleCreateGroup}
                style={{
                  backgroundColor: '#10b981',
                  color: 'white',
                  padding: '8px 16px',
                  borderRadius: '6px',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '14px',
                  flex: 1
                }}
              >
                Create
              </button>
              <button
                onClick={() => setShowCreateGroup(false)}
                style={{
                  backgroundColor: '#6b7280',
                  color: 'white',
                  padding: '8px 16px',
                  borderRadius: '6px',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '14px',
                  flex: 1
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
