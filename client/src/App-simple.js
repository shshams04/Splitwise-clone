import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// Simple Supabase client
const supabaseUrl = 'https://livinwsodaxjasdnrohx.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.Ai-YXtiiq7Bh9Oufr0tvAKnjGIwoGRTYsnItiLl80e4';

const supabase = {
  select: async (table) => {
    const response = await fetch(`${supabaseUrl}/rest/v1/${table}`, {
      headers: {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${localStorage.getItem('supabase_token')}`
      }
    });
    return response.json();
  },
  insert: async (table, data) => {
    const response = await fetch(`${supabaseUrl}/rest/v1/${table}`, {
      method: 'POST',
      headers: {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${localStorage.getItem('supabase_token')}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    });
    return response.json();
  },
  signUp: async (email, password, username) => {
    const response = await fetch(`${supabaseUrl}/auth/v1/signup`, {
      method: 'POST',
      headers: {
        'apikey': supabaseKey,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email, password, user_metadata: { username } })
    });
    return response.json();
  },
  signIn: async (email, password) => {
    const response = await fetch(`${supabaseUrl}/auth/v1/token?grant_type=password`, {
      method: 'POST',
      headers: {
        'apikey': supabaseKey,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email, password })
    });
    return response.json();
  },
  signOut: async () => {
    await fetch(`${supabaseUrl}/auth/v1/logout`, {
      method: 'POST',
      headers: {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${localStorage.getItem('supabase_token')}`
      }
    });
  },
  getCurrentUser: async () => {
    const response = await fetch(`${supabaseUrl}/auth/v1/user`, {
      headers: {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${localStorage.getItem('supabase_token')}`
      }
    });
    return response.json();
  }
};

function App() {
  const [currentPage, setCurrentPage] = useState('loading');
  const [groups, setGroups] = useState([]);
  const [showCreateGroup, setShowCreateGroup] = useState(false);
  const [groupName, setGroupName] = useState('');
  const [loading, setLoading] = useState(false);
  
  // Authentication state
  const [user, setUser] = useState(null);
  const [authError, setAuthError] = useState('');
  
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

  // Check for existing user on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem('supabase_token');
        if (token) {
          setCurrentPage('dashboard');
          loadGroups();
        } else {
          setCurrentPage('login');
        }
      } catch (error) {
        setCurrentPage('login');
      }
    };
    
    checkAuth();
  }, []);

  // Load groups from Supabase
  const loadGroups = async () => {
    try {
      const { data } = await supabase.select('groups');
      setGroups(data || []);
    } catch (error) {
      console.error('Error loading groups:', error);
    }
  };

  const handleCreateGroup = async () => {
    if (groupName.trim()) {
      setLoading(true);
      try {
        const newGroup = {
          name: groupName,
          created_at: new Date().toISOString()
        };
        
        const { data } = await supabase.insert('groups', newGroup);
        setGroups([...groups, { ...newGroup, id: data[0]?.id || Date.now() }]);
        
        setGroupName('');
        setShowCreateGroup(false);
      } catch (error) {
        console.error('Error creating group:', error);
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
        group_id: selectedGroup.id,
        description: expenseForm.description,
        amount: parseFloat(expenseForm.amount),
        paid_by: user?.id || '00000000-0000-0000-0000-000000000000',
        created_at: new Date().toISOString()
      };

      setLoading(true);
      try {
        const { data } = await supabase.insert('expenses', newExpense);
        
        const displayExpense = {
          ...newExpense,
          id: data?.[0]?.id || Date.now(),
          paidBy: expenseForm.paidBy,
          splitWith: expenseForm.splitWith,
          date: new Date().toLocaleDateString()
        };
        
        const updatedExpenses = [...expenses, displayExpense];
        setExpenses(updatedExpenses);
        localStorage.setItem(`expenses_${selectedGroup.id}`, JSON.stringify(updatedExpenses));
        
        setExpenseForm({
          description: '',
          amount: '',
          paidBy: 'You',
          splitWith: 'You'
        });
        setShowAddExpense(false);
      } catch (error) {
        console.error('Error adding expense:', error);
      } finally {
        setLoading(false);
      }
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

  const handleLogin = async () => {
    if (!loginForm.email || !loginForm.password) {
      setAuthError('Please fill in all fields');
      return;
    }

    setLoading(true);
    setAuthError('');
    
    try {
      const { data } = await supabase.signIn(loginForm.email, loginForm.password);
      
      if (data.access_token) {
        localStorage.setItem('supabase_token', data.access_token);
        setUser(data.user);
        setCurrentPage('dashboard');
        loadGroups();
      } else {
        setAuthError('Login failed. Please check your credentials.');
      }
    } catch (error) {
      setAuthError('Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async () => {
    if (!registerForm.username || !registerForm.email || !registerForm.password) {
      setAuthError('Please fill in all fields');
      return;
    }

    if (registerForm.password !== registerForm.confirmPassword) {
      setAuthError('Passwords do not match');
      return;
    }

    setLoading(true);
    setAuthError('');
    
    try {
      const response = await fetch(`${supabaseUrl}/auth/v1/signup`, {
        method: 'POST',
        headers: {
          'apikey': supabaseKey,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: registerForm.email,
          password: registerForm.password,
          user_metadata: { username: registerForm.username }
        })
      });
      
      const data = await response.json();
      
      if (data.access_token) {
        localStorage.setItem('supabase_token', data.access_token);
        setUser(data.user);
        setCurrentPage('dashboard');
        loadGroups();
      } else {
        setAuthError('Registration failed. Please try again.');
      }
    } catch (error) {
      setAuthError('Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await supabase.signOut();
      localStorage.removeItem('supabase_token');
      setUser(null);
      setGroups([]);
      setSelectedGroup(null);
      setExpenses([]);
      setCurrentPage('login');
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  const renderPage = () => {
    // Show loading while checking auth
    if (currentPage === 'loading') {
      return (
        <div style={{ textAlign: 'center', padding: '48px' }}>
          <div style={{ fontSize: '2rem', marginBottom: '16px' }}>🔄</div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>Loading...</h2>
          <p style={{ color: '#6b7280' }}>Setting up your Splitwise experience</p>
        </div>
      );
    }

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
                fontSize: '14px'
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
                <div key={expense.id} style={{ 
                  backgroundColor: 'white', 
                  padding: '16px', 
                  borderRadius: '8px', 
                  marginBottom: '12px',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                }}>
                  <div style={{ fontSize: '1rem', fontWeight: '600', color: '#111827', marginBottom: '4px' }}>
                    {expense.description}
                  </div>
                  <div style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '4px' }}>
                    Paid by {expense.paidBy} • Split with {expense.splitWith}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#9ca3af' }}>
                    {expense.date || new Date(expense.created_at).toLocaleDateString()}
                  </div>
                  <div style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#111827', marginTop: '8px' }}>
                    ${expense.amount}
                  </div>
                  <button
                    onClick={() => handleDeleteExpense(expense.id)}
                    style={{
                      backgroundColor: '#ef4444',
                      color: 'white',
                      border: 'none',
                      borderRadius: '6px',
                      padding: '8px 12px',
                      cursor: 'pointer',
                      fontSize: '0.875rem'
                    }}
                  >
                    Delete
                  </button>
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
                <div style={{ fontSize: '3rem', marginBottom: '16px' }}>🏠</div>
                <h2 style={{ fontSize: '1.25rem', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>No groups yet</h2>
                <p style={{ color: '#6b7280' }}>Create your first group to start splitting expenses!</p>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '16px' }}>
                {groups.map(group => (
                  <div key={group.id} style={{ 
                    backgroundColor: 'white', 
                    padding: '24px', 
                    borderRadius: '8px', 
                    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                    cursor: 'pointer'
                  }}
                    onClick={() => handleViewGroup(group)}
                  >
                    <h3 style={{ fontSize: '1.25rem', fontWeight: '600', color: '#111827', marginBottom: '8px' }}>
                      {group.name}
                    </h3>
                    <p style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                      Created {group.created || new Date(group.created_at).toLocaleDateString()}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      case 'login':
        return (
          <div style={{ maxWidth: '400px', margin: '48px auto', padding: '32px', backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#111827', marginBottom: '24px', textAlign: 'center' }}>Welcome to Splitwise</h2>
            
            <div style={{ marginBottom: '24px' }}>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#374151', marginBottom: '6px' }}>Email</label>
              <input
                type="email"
                value={loginForm.email}
                onChange={(e) => setLoginForm({...loginForm, email: e.target.value})}
                placeholder="Enter your email"
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  fontSize: '1rem',
                  marginBottom: '16px'
                }}
              />
            </div>
            
            <div style={{ marginBottom: '24px' }}>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#374151', marginBottom: '6px' }}>Password</label>
              <input
                type="password"
                value={loginForm.password}
                onChange={(e) => setLoginForm({...loginForm, password: e.target.value})}
                placeholder="Enter your password"
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  fontSize: '1rem',
                  marginBottom: '24px'
                }}
              />
            </div>
            
            {authError && (
              <div style={{ backgroundColor: '#fef2f2', padding: '12px', borderRadius: '6px', marginBottom: '16px' }}>
                <p style={{ color: '#dc2626', fontSize: '0.875rem' }}>{authError}</p>
              </div>
            )}
            
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
              <button
                onClick={handleLogin}
                disabled={loading}
                style={{
                  backgroundColor: '#3b82f6',
                  color: 'white',
                  padding: '12px 24px',
                  borderRadius: '6px',
                  border: 'none',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  fontSize: '1rem',
                  opacity: loading ? 0.7 : 1
                }}
              >
                {loading ? 'Signing in...' : 'Sign In'}
              </button>
            </div>
          </div>
        );
      case 'register':
        return (
          <div style={{ maxWidth: '400px', margin: '48px auto', padding: '32px', backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#111827', marginBottom: '24px', textAlign: 'center' }}>Create Account</h2>
            
            <div style={{ marginBottom: '24px' }}>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#374151', marginBottom: '6px' }}>Username</label>
              <input
                type="text"
                value={registerForm.username}
                onChange={(e) => setRegisterForm({...registerForm, username: e.target.value})}
                placeholder="Choose a username"
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  fontSize: '1rem',
                  marginBottom: '16px'
                }}
              />
            </div>
            
            <div style={{ marginBottom: '24px' }}>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#374151', marginBottom: '6px' }}>Email</label>
              <input
                type="email"
                value={registerForm.email}
                onChange={(e) => setRegisterForm({...registerForm, email: e.target.value})}
                placeholder="Enter your email"
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  fontSize: '1rem',
                  marginBottom: '16px'
                }}
              />
            </div>
            
            <div style={{ marginBottom: '24px' }}>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#374151', marginBottom: '6px' }}>Password</label>
              <input
                type="password"
                value={registerForm.password}
                onChange={(e) => setRegisterForm({...registerForm, password: e.target.value})}
                placeholder="Create a password"
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  fontSize: '1rem',
                  marginBottom: '24px'
                }}
              />
            </div>
            
            <div style={{ marginBottom: '24px' }}>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#374151', marginBottom: '6px' }}>Confirm Password</label>
              <input
                type="password"
                value={registerForm.confirmPassword}
                onChange={(e) => setRegisterForm({...registerForm, confirmPassword: e.target.value})}
                placeholder="Confirm your password"
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  fontSize: '1rem',
                  marginBottom: '24px'
                }}
              />
            </div>
            
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
              <button
                onClick={() => setCurrentPage('login')}
                style={{
                  backgroundColor: '#6b7280',
                  color: 'white',
                  padding: '12px 24px',
                  borderRadius: '6px',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '1rem'
                }}
              >
                Back to Login
              </button>
              <button
                onClick={handleRegister}
                disabled={loading}
                style={{
                  backgroundColor: '#10b981',
                  color: 'white',
                  padding: '12px 24px',
                  borderRadius: '6px',
                  border: 'none',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  fontSize: '1rem',
                  opacity: loading ? 0.7 : 1
                }}
              >
                {loading ? 'Creating Account...' : 'Create Account'}
              </button>
            </div>
          </div>
        );
      default:
        return (
          <div style={{ textAlign: 'center', padding: '48px' }}>
            <h1 style={{ fontSize: '2rem', fontWeight: 'bold', color: '#111827', marginBottom: '16px' }}>Page Not Found</h1>
            <p style={{ color: '#6b7280' }}>The page you're looking for doesn't exist.</p>
          </div>
        );
    }
  };

  // Add Expense Modal
  const renderAddExpenseModal = () => {
    if (!showAddExpense) return null;

    return (
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.5)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1000
      }}>
        <div style={{
          backgroundColor: 'white',
          padding: '32px',
          borderRadius: '12px',
          width: '90%',
          maxWidth: '500px',
          boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)'
        }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#111827', marginBottom: '24px' }}>Add Expense</h2>
          
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#374151', marginBottom: '6px' }}>Description</label>
            <input
              type="text"
              value={expenseForm.description}
              onChange={(e) => setExpenseForm({...expenseForm, description: e.target.value})}
              placeholder="What's this expense for?"
              style={{
                width: '100%',
                padding: '12px',
                border: '1px solid #d1d5db',
                borderRadius: '6px',
                fontSize: '1rem'
              }}
            />
          </div>
          
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#374151', marginBottom: '6px' }}>Amount</label>
            <input
              type="number"
              value={expenseForm.amount}
              onChange={(e) => setExpenseForm({...expenseForm, amount: e.target.value})}
              placeholder="0.00"
              step="0.01"
              style={{
                width: '100%',
                padding: '12px',
                border: '1px solid #d1d5db',
                borderRadius: '6px',
                fontSize: '1rem'
              }}
            />
          </div>
          
          <div style={{ marginBottom: '24px' }}>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#374151', marginBottom: '6px' }}>Paid By</label>
            <select
              value={expenseForm.paidBy}
              onChange={(e) => setExpenseForm({...expenseForm, paidBy: e.target.value})}
              style={{
                width: '100%',
                padding: '12px',
                border: '1px solid #d1d5db',
                borderRadius: '6px',
                fontSize: '1rem'
              }}
            >
              <option value="You">You</option>
            </select>
          </div>
          
          <div style={{ marginBottom: '24px' }}>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#374151', marginBottom: '66px' }}>Split With</label>
            <select
              value={expenseForm.splitWith}
              onChange={(e) => setExpenseForm({...expenseForm, splitWith: e.target.value})}
              style={{
                width: '100%',
                padding: '12px',
                border: '1px solid #d1d5db',
                borderRadius: '6px',
                fontSize: '1rem'
              }}
            >
              <option value="You">You</option>
            </select>
          </div>
          
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
            <button
              onClick={() => setShowAddExpense(false)}
              style={{
                backgroundColor: '#6b7280',
                color: 'white',
                padding: '12px 24px',
                borderRadius: '6px',
                border: 'none',
                cursor: 'pointer',
                fontSize: '1rem'
              }}
            >
              Cancel
            </button>
            <button
              onClick={handleAddExpense}
              disabled={loading}
              style={{
                backgroundColor: '#10b981',
                color: 'white',
                padding: '12px 24px',
                borderRadius: '6px',
                border: 'none',
                cursor: loading ? 'not-allowed' : 'pointer',
                fontSize: '1rem',
                opacity: loading ? 0.7 : 1
              }}
            >
              {loading ? 'Adding...' : 'Add Expense'}
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <Router>
      <div style={{ minHeight: '100vh', backgroundColor: '#f9fafb' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px' }}>
          {renderPage()}
          {renderAddExpenseModal()}
        </div>
      </div>
    </Router>
  );
}

export default App;
