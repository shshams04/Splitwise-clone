import React, { useState, useEffect } from 'react';

// Supabase configuration
const supabaseUrl = 'https://livinwsodaxjasdnrohx.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imxpdmlud3NvZGF4amFzZG5yb2h4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjkwOTAzODksImV4cCI6MjA4NDY2NjM4OX0.Ai-YXtiiq7Bh9Oufr0tvAKnjGIwoGRTYsnItiLl80e4';

// Simple Supabase client
const supabase = {
  async select(table) {
    const response = await fetch(`${supabaseUrl}/rest/v1/${table}`, {
      headers: {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`
      }
    });
    return { data: await response.json(), error: null };
  },
  
  async insert(table, data) {
    const response = await fetch(`${supabaseUrl}/rest/v1/${table}`, {
      method: 'POST',
      headers: {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    });
    return { data: await response.json(), error: null };
  }
};

function App() {
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [groups, setGroups] = useState([]);
  const [showCreateGroup, setShowCreateGroup] = useState(false);
  const [groupName, setGroupName] = useState('');
  const [loading, setLoading] = useState(false);
  
  // Expense tracking state
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [showAddExpense, setShowAddExpense] = useState(false);
  const [expenses, setExpenses] = useState([]);
  const [expenseForm, setExpenseForm] = useState({
    description: '',
    amount: '',
    paidBy: 'You',
    splitWith: 'You'
  });

  // Load groups from Supabase on component mount
  useEffect(() => {
    loadGroups();
  }, []);

  const loadGroups = async () => {
    try {
      console.log('Loading groups from Supabase...');
      const { data } = await supabase.select('groups');
      console.log('Groups loaded:', data);
      setGroups(data || []);
    } catch (error) {
      console.error('Error loading groups:', error);
      console.log('Using local groups for demo');
    }
  };

  const handleCreateGroup = async () => {
    if (groupName.trim()) {
      setLoading(true);
      try {
        console.log('Creating group in Supabase:', groupName);
        // Try to save to Supabase
        const newGroup = {
          name: groupName,
          description: '',
          created_at: new Date().toISOString()
        };
        
        const { data } = await supabase.insert('groups', newGroup);
        console.log('Group created in Supabase:', data);
        
        // Update local state with the new group
        setGroups([...groups, { 
          ...newGroup, 
          id: data[0]?.id || Date.now(), 
          created: new Date().toLocaleDateString() 
        }]);
        
        setGroupName('');
        setShowCreateGroup(false);
      } catch (error) {
        console.error('Error creating group:', error);
        // Fallback to local storage if Supabase fails
        console.log('Falling back to local storage');
        const newGroup = { 
          id: Date.now(), 
          name: groupName, 
          created: new Date().toLocaleDateString() 
        };
        setGroups([...groups, newGroup]);
        setGroupName('');
        setShowCreateGroup(false);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleViewGroup = (group) => {
    setSelectedGroup(group);
    loadExpenses(group.id);
  };

  const loadExpenses = async (groupId) => {
    try {
      console.log('Loading expenses for group:', groupId);
      // For now, use local expenses - we'll add Supabase integration next
      const localExpenses = JSON.parse(localStorage.getItem(`expenses_${groupId}`) || '[]');
      setExpenses(localExpenses);
    } catch (error) {
      console.error('Error loading expenses:', error);
      setExpenses([]);
    }
  };

  const handleAddExpense = async () => {
    if (expenseForm.description.trim() && expenseForm.amount.trim()) {
      const newExpense = {
        id: Date.now(),
        groupId: selectedGroup.id,
        description: expenseForm.description,
        amount: parseFloat(expenseForm.amount),
        paidBy: expenseForm.paidBy,
        splitWith: expenseForm.splitWith,
        date: new Date().toLocaleDateString(),
        created_at: new Date().toISOString()
      };

      const updatedExpenses = [...expenses, newExpense];
      setExpenses(updatedExpenses);
      
      // Save to localStorage for now
      localStorage.setItem(`expenses_${selectedGroup.id}`, JSON.stringify(updatedExpenses));
      
      // Reset form
      setExpenseForm({
        description: '',
        amount: '',
        paidBy: 'You',
        splitWith: 'You'
      });
      setShowAddExpense(false);
    }
  };

  const handleDeleteExpense = (expenseId) => {
    const updatedExpenses = expenses.filter(exp => exp.id !== expenseId);
    setExpenses(updatedExpenses);
    localStorage.setItem(`expenses_${selectedGroup.id}`, JSON.stringify(updatedExpenses));
  };

  const handleBackToGroups = () => {
    setSelectedGroup(null);
    setExpenses([]);
  };

  const renderPage = () => {
    // If a group is selected, show group detail view
    if (selectedGroup) {
      return (
        <div>
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '24px' }}>
            <button
              onClick={handleBackToGroups}
              style={{
                backgroundColor: '#6b7280',
                color: 'white',
                padding: '8px 16px',
                borderRadius: '6px',
                border: 'none',
                cursor: 'pointer',
                fontSize: '14px',
                marginRight: '16px'
              }}
            >
              ← Back to Groups
            </button>
            <h1 style={{ fontSize: '2rem', fontWeight: 'bold', color: '#111827', margin: 0 }}>
              {selectedGroup.name}
            </h1>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: '600', color: '#111827' }}>Expenses</h2>
            <button
              onClick={() => setShowAddExpense(true)}
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
              + Add Expense
            </button>
          </div>

          {expenses.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '48px', backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
              <div style={{ fontSize: '3rem', marginBottom: '16px' }}>💰</div>
              <h2 style={{ fontSize: '1.25rem', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>No expenses yet</h2>
              <p style={{ color: '#6b7280' }}>Add your first expense to start tracking!</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {expenses.map(expense => (
                <div key={expense.id} style={{ backgroundColor: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                    <div>
                      <h3 style={{ fontSize: '1.125rem', fontWeight: '600', color: '#111827', marginBottom: '4px' }}>
                        {expense.description}
                      </h3>
                      <p style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '8px' }}>
                        Paid by {expense.paidBy} • {expense.date}
                      </p>
                      <p style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                        Split with {expense.splitWith}
                      </p>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <span style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#111827' }}>
                        ${expense.amount.toFixed(2)}
                      </span>
                      <button
                        onClick={() => handleDeleteExpense(expense.id)}
                        style={{
                          backgroundColor: '#ef4444',
                          color: 'white',
                          padding: '4px 8px',
                          borderRadius: '4px',
                          border: 'none',
                          cursor: 'pointer',
                          fontSize: '12px'
                        }}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      );
    }

    switch(currentPage) {
      case 'dashboard':
        return (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h1 style={{ fontSize: '2rem', fontWeight: 'bold', color: '#111827' }}>My Groups</h1>
              <button
                onClick={() => setShowCreateGroup(true)}
                disabled={loading}
                style={{
                  backgroundColor: loading ? '#6b7280' : '#10b981',
                  color: 'white',
                  padding: '8px 16px',
                  borderRadius: '6px',
                  border: 'none',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  fontSize: '14px'
                }}
              >
                {loading ? 'Loading...' : '+ Create Group'}
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
                      onClick={() => handleViewGroup(group)}
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
                disabled={loading || !groupName.trim()}
                style={{
                  backgroundColor: (loading || !groupName.trim()) ? '#6b7280' : '#10b981',
                  color: 'white',
                  padding: '8px 16px',
                  borderRadius: '6px',
                  border: 'none',
                  cursor: (loading || !groupName.trim()) ? 'not-allowed' : 'pointer',
                  fontSize: '14px',
                  flex: 1
                }}
              >
                {loading ? 'Creating...' : 'Create'}
              </button>
              <button
                onClick={() => setShowCreateGroup(false)}
                disabled={loading}
                style={{
                  backgroundColor: loading ? '#6b7280' : '#6b7280',
                  color: 'white',
                  padding: '8px 16px',
                  borderRadius: '6px',
                  border: 'none',
                  cursor: loading ? 'not-allowed' : 'pointer',
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

      {/* Add Expense Modal */}
      {showAddExpense && (
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
            <h3 style={{ fontSize: '1.125rem', fontWeight: '600', color: '#111827', marginBottom: '16px' }}>Add Expense</h3>
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#374151', marginBottom: '4px' }}>Description</label>
              <input
                type="text"
                value={expenseForm.description}
                onChange={(e) => setExpenseForm({...expenseForm, description: e.target.value})}
                style={{ width: '100%', padding: '8px 12px', border: '1px solid #d1d5db', borderRadius: '6px' }}
                placeholder="What's this expense for?"
                autoFocus
              />
            </div>
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#374151', marginBottom: '4px' }}>Amount</label>
              <input
                type="number"
                value={expenseForm.amount}
                onChange={(e) => setExpenseForm({...expenseForm, amount: e.target.value})}
                style={{ width: '100%', padding: '8px 12px', border: '1px solid #d1d5db', borderRadius: '6px' }}
                placeholder="0.00"
                step="0.01"
              />
            </div>
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#374151', marginBottom: '4px' }}>Paid By</label>
              <select
                value={expenseForm.paidBy}
                onChange={(e) => setExpenseForm({...expenseForm, paidBy: e.target.value})}
                style={{ width: '100%', padding: '8px 12px', border: '1px solid #d1d5db', borderRadius: '6px' }}
              >
                <option value="You">You</option>
              </select>
            </div>
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#374151', marginBottom: '4px' }}>Split With</label>
              <select
                value={expenseForm.splitWith}
                onChange={(e) => setExpenseForm({...expenseForm, splitWith: e.target.value})}
                style={{ width: '100%', padding: '8px 12px', border: '1px solid #d1d5db', borderRadius: '6px' }}
              >
                <option value="You">You</option>
              </select>
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                onClick={handleAddExpense}
                disabled={!expenseForm.description.trim() || !expenseForm.amount.trim()}
                style={{
                  backgroundColor: (!expenseForm.description.trim() || !expenseForm.amount.trim()) ? '#6b7280' : '#10b981',
                  color: 'white',
                  padding: '8px 16px',
                  borderRadius: '6px',
                  border: 'none',
                  cursor: (!expenseForm.description.trim() || !expenseForm.amount.trim()) ? 'not-allowed' : 'pointer',
                  fontSize: '14px',
                  flex: 1
                }}
              >
                Add Expense
              </button>
              <button
                onClick={() => setShowAddExpense(false)}
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
