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
  },

  // Auth functions
  async signUp(email, password, username) {
    const response = await fetch(`${supabaseUrl}/auth/v1/signup`, {
      method: 'POST',
      headers: {
        'apikey': supabaseKey,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email,
        password,
        options: {
          data: {
            username
          }
        }
      })
    });
    return { data: await response.json(), error: null };
  },

  async signIn(email, password) {
    const response = await fetch(`${supabaseUrl}/auth/v1/token?grant_type=password`, {
      method: 'POST',
      headers: {
        'apikey': supabaseKey,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email,
        password
      })
    });
    return { data: await response.json(), error: null };
  },

  async signOut() {
    const response = await fetch(`${supabaseUrl}/auth/v1/logout`, {
      method: 'POST',
      headers: {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${localStorage.getItem('supabase_token')}`
      }
    });
    return { data: await response.json(), error: null };
  },

  async getCurrentUser() {
    const token = localStorage.getItem('supabase_token');
    if (!token) return null;
    
    const response = await fetch(`${supabaseUrl}/auth/v1/user`, {
      headers: {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${token}`
      }
    });
    return { data: await response.json(), error: null };
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
  
  // Group member state
  const [showAddMember, setShowAddMember] = useState(false);
  const [memberEmail, setMemberEmail] = useState('');
  const [groupMembers, setGroupMembers] = useState([]);

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

  // Auth form state
  const [loginForm, setLoginForm] = useState({
    email: '',
    password: ''
  });
  const [registerForm, setRegisterForm] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  // Check for existing user on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem('supabase_token');
        if (token) {
          // Simple token validation - if token exists, assume user is logged in
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

  const handleLogin = async () => {
    if (!loginForm.email || !loginForm.password) {
      setAuthError('Please fill in all fields');
      return;
    }

    setLoading(true);
    setAuthError('');
    
    try {
      console.log('Attempting login with:', { email: loginForm.email });
      
      const { data } = await supabase.signIn(loginForm.email, loginForm.password);
      
      console.log('Login response:', data);
      
      if (data.access_token) {
        // Store token
        localStorage.setItem('supabase_token', data.access_token);
        
        // Set user state
        setUser(data.user);
        
        // Clear any previous state
        setSelectedGroup(null);
        setExpenses([]);
        setAuthError('');
        
        // Navigate to dashboard
        setCurrentPage('dashboard');
        loadGroups();
        
        console.log('Login successful for:', data.user.email);
      } else {
        console.log('No access token in login response');
        setAuthError('Login failed. Please check your credentials.');
      }
    } catch (error) {
      console.error('Login error:', error);
      setAuthError('Login failed. Please check your email and password.');
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

    if (registerForm.password.length < 6) {
      setAuthError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    setAuthError('');
    
    try {
      console.log('Attempting registration with:', {
        email: registerForm.email,
        username: registerForm.username,
        passwordLength: registerForm.password.length
      });
      
      // Try a simpler approach - just create user without email confirmation
      const response = await fetch(`${supabaseUrl}/auth/v1/signup`, {
        method: 'POST',
        headers: {
          'apikey': supabaseKey,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: registerForm.email,
          password: registerForm.password,
          options: {
            data: {
              username: registerForm.username
            }
          }
        })
      });
      
      const data = await response.json();
      console.log('Registration response:', data);
      
      if (response.ok && data.access_token) {
        localStorage.setItem('supabase_token', data.access_token);
        setUser(data.user);
        setCurrentPage('dashboard');
        loadGroups();
      } else {
        console.log('No access token in response or error:', data);
        setAuthError(`Registration failed: ${data.msg || data.message || 'Please check Supabase auth settings.'}`);
      }
    } catch (error) {
      console.error('Registration error:', error);
      
      // Check for specific error messages
      if (error.message && error.message.includes('already registered')) {
        setAuthError('This email is already registered. Try logging in or use a different email.');
      } else if (error.message && error.message.includes('Password')) {
        setAuthError('Password issue: ' + error.message);
      } else {
        setAuthError(`Registration failed: ${error.message || 'Please try again.'}`);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    setLoading(true);
    try {
      console.log('Signing out user...');
      
      // Call Supabase sign out
      await supabase.signOut();
      
      // Clear local storage
      localStorage.removeItem('supabase_token');
      
      // Clear all app state
      setUser(null);
      setGroups([]);
      setSelectedGroup(null);
      setExpenses([]);
      setAuthError('');
      
      // Reset forms
      setLoginForm({ email: '', password: '' });
      setRegisterForm({ username: '', email: '', password: '', confirmPassword: '' });
      
      // Redirect to login page
      setCurrentPage('login');
      
      console.log('User signed out successfully');
    } catch (error) {
      console.error('Sign out error:', error);
      // Even if Supabase sign out fails, clear local state
      localStorage.removeItem('supabase_token');
      setUser(null);
      setGroups([]);
      setSelectedGroup(null);
      setExpenses([]);
      setCurrentPage('login');
    } finally {
      setLoading(false);
    }
  };

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
    loadGroupMembers(group.id);
  };

  const loadExpenses = async (groupId) => {
    try {
      console.log('=== LOADING EXPENSES FOR GROUP:', groupId, '===');
      console.log('Current user:', user);
      console.log('User ID:', user?.id);
      
      // Always check localStorage first (most reliable for now)
      console.log('Checking localStorage for key:', `expenses_${groupId}`);
      const localExpenses = JSON.parse(localStorage.getItem(`expenses_${groupId}`) || '[]');
      console.log('Local expenses found:', localExpenses);
      console.log('Local expenses count:', localExpenses.length);
      
      if (localExpenses.length > 0) {
        console.log('✅ Using local expenses');
        setExpenses(localExpenses);
        return;
      }
      
      // If no local expenses, try Supabase
      console.log('No local expenses, trying Supabase...');
      try {
        const { data } = await supabase.select('expenses');
        console.log('All expenses from Supabase:', data);
        
        const groupExpenses = data.filter(expense => {
          console.log('Comparing expense.group_id:', expense.group_id, 'with groupId:', groupId);
          console.log('Match:', expense.group_id === groupId);
          return expense.group_id === groupId;
        });
        
        console.log('Filtered expenses for group:', groupExpenses);
        console.log('Supabase expenses count:', groupExpenses.length);
        
        if (groupExpenses.length > 0) {
          console.log('✅ Using Supabase expenses');
          setExpenses(groupExpenses);
          // Also save to localStorage as backup
          localStorage.setItem(`expenses_${groupId}`, JSON.stringify(groupExpenses));
          console.log('Saved Supabase expenses to localStorage backup');
          return;
        }
      } catch (supabaseError) {
        console.error('Supabase loading failed:', supabaseError);
      }
      
      // No expenses found anywhere
      console.log('❌ No expenses found anywhere');
      setExpenses([]);
      
    } catch (error) {
      console.error('Error loading expenses:', error);
      setExpenses([]);
    }
  };

  const handleAddExpense = async () => {
    if (expenseForm.description.trim() && expenseForm.amount.trim()) {
      // Create expense with minimal required fields
      const newExpense = {
        group_id: selectedGroup.id,
        description: expenseForm.description,
        amount: parseFloat(expenseForm.amount),
        paid_by: user?.id || '00000000-0000-0000-0000-000000000000', // Fallback UUID
        created_at: new Date().toISOString()
      };

      console.log('Creating expense:', newExpense);
      console.log('Selected group ID:', selectedGroup.id);
      console.log('Selected group:', selectedGroup);

      setLoading(true);
      try {
        // First try to add to Supabase
        console.log('Adding expense to Supabase:', newExpense);
        const { data, error } = await supabase.insert('expenses', newExpense);
        
        if (error) {
          console.error('Supabase insert error:', error);
          throw error;
        }
        
        console.log('Expense added to Supabase response:', data);
        
        // Update local state with the new expense
        const displayExpense = {
          ...newExpense,
          id: data?.[0]?.id || Date.now(),
          // Add display fields for UI
          paidBy: expenseForm.paidBy,
          splitWith: expenseForm.splitWith,
          date: new Date().toLocaleDateString()
        };
        
        const updatedExpenses = [...expenses, displayExpense];
        console.log('Updated expenses list:', updatedExpenses);
        setExpenses(updatedExpenses);
        
        // Also save to localStorage as backup
        localStorage.setItem(`expenses_${selectedGroup.id}`, JSON.stringify(updatedExpenses));
        console.log('Saved to localStorage backup:', `expenses_${selectedGroup.id}`);
        
        // Reset form
        setExpenseForm({
          description: '',
          amount: '',
          paidBy: 'You',
          splitWith: 'You'
        });
        setShowAddExpense(false);
        
      } catch (error) {
        console.error('Error adding expense to Supabase:', error);
        
        // Fallback to localStorage
        console.log('Using localStorage fallback');
        const fallbackExpense = { 
          ...newExpense, 
          id: Date.now(),
          paidBy: expenseForm.paidBy,
          splitWith: expenseForm.splitWith,
          date: new Date().toLocaleDateString()
        };
        
        const updatedExpenses = [...expenses, fallbackExpense];
        console.log('Fallback expenses list:', updatedExpenses);
        setExpenses(updatedExpenses);
        localStorage.setItem(`expenses_${selectedGroup.id}`, JSON.stringify(updatedExpenses));
        console.log('Saved to localStorage:', `expenses_${selectedGroup.id}`);
        
        // Reset form
        setExpenseForm({
          description: '',
          amount: '',
          paidBy: 'You',
          splitWith: 'You'
        });
        setShowAddExpense(false);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleDeleteExpense = async (expenseId) => {
    setLoading(true);
    try {
      console.log('Deleting expense:', expenseId);
      
      // Update local state immediately for better UX
      const updatedExpenses = expenses.filter(exp => exp.id !== expenseId);
      setExpenses(updatedExpenses);
      
      // Note: We'd need to implement delete function in supabase client
      // For now, we'll just update local state
      
      console.log('Expense deleted from local state');
    } catch (error) {
      console.error('Error deleting expense:', error);
      // Still update local state even if error occurs
      const updatedExpenses = expenses.filter(exp => exp.id !== expenseId);
      setExpenses(updatedExpenses);
    } finally {
      setLoading(false);
    }
  };

  const handleBackToGroups = () => {
    setSelectedGroup(null);
    setExpenses([]);
    setGroupMembers([]);
  };

  // Group member management functions
  const handleAddMember = async () => {
    if (!memberEmail.trim()) {
      alert('Please enter an email address');
      return;
    }

    if (!memberEmail.includes('@')) {
      alert('Please enter a valid email address');
      return;
    }

    setLoading(true);
    try {
      console.log('Adding member to group:', memberEmail, selectedGroup.id);
      
      // For now, add to local state (we'll integrate with Supabase users table later)
      const newMember = {
        id: Date.now(),
        email: memberEmail.trim(),
        groupId: selectedGroup.id,
        joinedAt: new Date().toLocaleDateString()
      };
      
      const updatedMembers = [...groupMembers, newMember];
      setGroupMembers(updatedMembers);
      
      // Save to localStorage for persistence
      localStorage.setItem(`members_${selectedGroup.id}`, JSON.stringify(updatedMembers));
      
      console.log('Member added successfully:', newMember);
      
      setMemberEmail('');
      setShowAddMember(false);
    } catch (error) {
      console.error('Error adding member:', error);
      alert('Failed to add member. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const loadGroupMembers = async (groupId) => {
    try {
      console.log('Loading members for group:', groupId);
      const localMembers = JSON.parse(localStorage.getItem(`members_${groupId}`) || '[]');
      console.log('Local members found:', localMembers);
      setGroupMembers(localMembers);
    } catch (error) {
      console.error('Error loading group members:', error);
      setGroupMembers([]);
    }
  };

  const handleRemoveMember = (memberId) => {
    if (window.confirm('Are you sure you want to remove this member?')) {
      const updatedMembers = groupMembers.filter(member => member.id !== memberId);
      setGroupMembers(updatedMembers);
      localStorage.setItem(`members_${selectedGroup.id}`, JSON.stringify(updatedMembers));
      console.log('Member removed:', memberId);
    }
  };

  // Balance calculation functions
  const calculateBalances = (expenses) => {
    const balances = {};
    
    expenses.forEach(expense => {
      const amount = expense.amount;
      const paidBy = expense.paidBy;
      const splitWith = expense.splitWith;
      
      // Initialize balances if not exists
      if (!balances[paidBy]) balances[paidBy] = 0;
      if (!balances[splitWith]) balances[splitWith] = 0;
      
      // Person who paid gets credit for the full amount
      balances[paidBy] += amount;
      
      // Person who split with owes their share
      balances[splitWith] -= amount;
    });
    
    return balances;
  };

  const getSettlements = (balances) => {
    const settlements = [];
    const debtors = [];
    const creditors = [];
    
    // Separate debtors (owe money) and creditors (are owed money)
    Object.entries(balances).forEach(([person, balance]) => {
      if (balance < 0) {
        debtors.push({ person, amount: Math.abs(balance) });
      } else if (balance > 0) {
        creditors.push({ person, amount: balance });
      }
    });
    
    // Calculate optimal settlements
    let debtorIndex = 0;
    let creditorIndex = 0;
    
    while (debtorIndex < debtors.length && creditorIndex < creditors.length) {
      const debtor = debtors[debtorIndex];
      const creditor = creditors[creditorIndex];
      
      const settlementAmount = Math.min(debtor.amount, creditor.amount);
      
      settlements.push({
        from: debtor.person,
        to: creditor.person,
        amount: settlementAmount
      });
      
      debtor.amount -= settlementAmount;
      creditor.amount -= settlementAmount;
      
      if (debtor.amount === 0) debtorIndex++;
      if (creditor.amount === 0) creditorIndex++;
    }
    
    return settlements;
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
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
      const balances = calculateBalances(expenses);
      const settlements = getSettlements(balances);
      
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

          {/* Balance Summary */}
          {expenses.length > 0 && (
            <div style={{ marginBottom: '32px' }}>
              <h2 style={{ fontSize: '1.5rem', fontWeight: '600', color: '#111827', marginBottom: '16px' }}>Balances</h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px', marginBottom: '24px' }}>
                {Object.entries(balances).map(([person, balance]) => (
                  <div key={person} style={{ 
                    backgroundColor: 'white', 
                    padding: '16px', 
                    borderRadius: '8px', 
                    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                    borderLeft: `4px solid ${balance >= 0 ? '#10b981' : '#ef4444'}`
                  }}>
                    <div style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '4px' }}>{person}</div>
                    <div style={{ 
                      fontSize: '1.25rem', 
                      fontWeight: 'bold',
                      color: balance >= 0 ? '#10b981' : '#ef4444'
                    }}>
                      {balance >= 0 ? '+' : ''}{formatCurrency(balance)}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '4px' }}>
                      {balance >= 0 ? 'is owed' : 'owes'}
                    </div>
                  </div>
                ))}
              </div>

              {/* Settlements */}
              {settlements.length > 0 && (
                <div style={{ backgroundColor: '#f3f4f6', padding: '16px', borderRadius: '8px' }}>
                  <h3 style={{ fontSize: '1rem', fontWeight: '600', color: '#111827', marginBottom: '12px' }}>
                    💰 Suggested Settlements
                  </h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {settlements.map((settlement, index) => (
                      <div key={index} style={{ 
                        backgroundColor: 'white', 
                        padding: '12px', 
                        borderRadius: '6px',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                      }}>
                        <span style={{ fontSize: '0.875rem', color: '#374151' }}>
                          {settlement.from} → {settlement.to}
                        </span>
                        <span style={{ fontSize: '0.875rem', fontWeight: '600', color: '#111827' }}>
                          {formatCurrency(settlement.amount)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Group Members */}
          <div style={{ marginBottom: '32px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h2 style={{ fontSize: '1.5rem', fontWeight: '600', color: '#111827' }}>Group Members</h2>
              <button
                onClick={() => setShowAddMember(true)}
                style={{
                  backgroundColor: '#3b82f6',
                  color: 'white',
                  padding: '8px 16px',
                  borderRadius: '6px',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '14px'
                }}
              >
                + Add Member
              </button>
            </div>
            
            {groupMembers.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '32px', backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                <div style={{ fontSize: '2rem', marginBottom: '16px' }}>👥</div>
                <h3 style={{ fontSize: '1.125rem', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>No members yet</h3>
                <p style={{ color: '#6b7280' }}>Add members to start splitting expenses!</p>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
                {groupMembers.map(member => (
                  <div key={member.id} style={{ 
                    backgroundColor: 'white', 
                    padding: '16px', 
                    borderRadius: '8px', 
                    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}>
                    <div>
                      <div style={{ fontSize: '1rem', fontWeight: '600', color: '#111827', marginBottom: '4px' }}>
                        {member.email}
                      </div>
                      <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                        Joined {member.joinedAt}
                      </div>
                    </div>
                    <button
                      onClick={() => handleRemoveMember(member.id)}
                      style={{
                        backgroundColor: '#ef4444',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        padding: '6px 10px',
                        cursor: 'pointer',
                        fontSize: '0.75rem'
                      }}
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            )}
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
                  boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '1rem', fontWeight: '600', color: '#111827', marginBottom: '4px' }}>
                      {expense.description}
                    </div>
                    <div style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '4px' }}>
                      Paid by {expense.paidBy || expense.paid_by} • Split with {expense.splitWith || 'You'}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#9ca3af' }}>
                      {expense.date || new Date(expense.created_at).toLocaleDateString()}
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#111827' }}>
                      ${expense.amount}
                    </div>
                    <button
                      onClick={() => handleDeleteExpense(expense.id)}
                      disabled={loading}
                      style={{
                        backgroundColor: '#ef4444',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        padding: '8px 12px',
                        cursor: loading ? 'not-allowed' : 'pointer',
                        fontSize: '0.875rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}
                    >
                      {loading ? '...' : '🗑️'}
                    </button>
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
            
            {authError && (
              <div style={{ backgroundColor: '#fef2f2', border: '1px solid #fecaca', borderRadius: '6px', padding: '12px', marginBottom: '16px' }}>
                <p style={{ color: '#dc2626', fontSize: '0.875rem', margin: 0 }}>{authError}</p>
              </div>
            )}
            
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#374151', marginBottom: '4px' }}>Email</label>
              <input
                type="email"
                value={loginForm.email}
                onChange={(e) => setLoginForm({...loginForm, email: e.target.value})}
                style={{ width: '100%', padding: '8px 12px', border: '1px solid #d1d5db', borderRadius: '6px' }}
                placeholder="Enter your email"
              />
            </div>
            <div style={{ marginBottom: '24px' }}>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#374151', marginBottom: '4px' }}>Password</label>
              <input
                type="password"
                value={loginForm.password}
                onChange={(e) => setLoginForm({...loginForm, password: e.target.value})}
                style={{ width: '100%', padding: '8px 12px', border: '1px solid #d1d5db', borderRadius: '6px' }}
                placeholder="Enter your password"
              />
            </div>
            <button
              onClick={handleLogin}
              disabled={loading}
              style={{
                backgroundColor: loading ? '#6b7280' : '#3b82f6',
                color: 'white',
                padding: '10px 16px',
                borderRadius: '6px',
                border: 'none',
                cursor: loading ? 'not-allowed' : 'pointer',
                fontSize: '14px',
                width: '100%'
              }}
            >
              {loading ? 'Signing in...' : 'Login'}
            </button>
            <p style={{ textAlign: 'center', marginTop: '16px', fontSize: '0.875rem', color: '#6b7280' }}>
              Don't have an account? <button onClick={() => { setCurrentPage('register'); setAuthError(''); }} style={{ color: '#3b82f6', background: 'none', border: 'none', cursor: 'pointer' }}>Register</button>
            </p>
          </div>
        );
      
      case 'register':
        return (
          <div style={{ maxWidth: '400px', margin: '0 auto', padding: '32px', backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#111827', marginBottom: '24px', textAlign: 'center' }}>Register</h2>
            
            {authError && (
              <div style={{ backgroundColor: '#fef2f2', border: '1px solid #fecaca', borderRadius: '6px', padding: '12px', marginBottom: '16px' }}>
                <p style={{ color: '#dc2626', fontSize: '0.875rem', margin: 0 }}>{authError}</p>
              </div>
            )}
            
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#374151', marginBottom: '4px' }}>Username</label>
              <input
                type="text"
                value={registerForm.username}
                onChange={(e) => setRegisterForm({...registerForm, username: e.target.value})}
                style={{ width: '100%', padding: '8px 12px', border: '1px solid #d1d5db', borderRadius: '6px' }}
                placeholder="Choose a username"
              />
            </div>
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#374151', marginBottom: '4px' }}>Email</label>
              <input
                type="email"
                value={registerForm.email}
                onChange={(e) => setRegisterForm({...registerForm, email: e.target.value})}
                style={{ width: '100%', padding: '8px 12px', border: '1px solid #d1d5db', borderRadius: '6px' }}
                placeholder="Enter your email"
              />
            </div>
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#374151', marginBottom: '4px' }}>Password</label>
              <input
                type="password"
                value={registerForm.password}
                onChange={(e) => setRegisterForm({...registerForm, password: e.target.value})}
                style={{ width: '100%', padding: '8px 12px', border: '1px solid #d1d5db', borderRadius: '6px' }}
                placeholder="Create a password (min 6 chars)"
              />
            </div>
            <div style={{ marginBottom: '24px' }}>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#374151', marginBottom: '4px' }}>Confirm Password</label>
              <input
                type="password"
                value={registerForm.confirmPassword}
                onChange={(e) => setRegisterForm({...registerForm, confirmPassword: e.target.value})}
                style={{ width: '100%', padding: '8px 12px', border: '1px solid #d1d5db', borderRadius: '6px' }}
                placeholder="Confirm your password"
              />
            </div>
            <button
              onClick={handleRegister}
              disabled={loading}
              style={{
                backgroundColor: loading ? '#6b7280' : '#10b981',
                color: 'white',
                padding: '10px 16px',
                borderRadius: '6px',
                border: 'none',
                cursor: loading ? 'not-allowed' : 'pointer',
                fontSize: '14px',
                width: '100%'
              }}
            >
              {loading ? 'Creating account...' : 'Register'}
            </button>
            <p style={{ textAlign: 'center', marginTop: '16px', fontSize: '0.875rem', color: '#6b7280' }}>
              Already have an account? <button onClick={() => { setCurrentPage('login'); setAuthError(''); }} style={{ color: '#3b82f6', background: 'none', border: 'none', cursor: 'pointer' }}>Login</button>
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
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              {user ? (
                <>
                  <span style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                    👋 {user.user_metadata?.username || user.email}
                  </span>
                  <button
                    onClick={handleSignOut}
                    disabled={loading}
                    style={{
                      color: '#6b7280',
                      background: 'none',
                      border: 'none',
                      cursor: loading ? 'not-allowed' : 'pointer',
                      fontSize: '14px',
                      padding: '8px 12px',
                      borderRadius: '4px'
                    }}
                  >
                    {loading ? 'Signing out...' : 'Sign Out'}
                  </button>
                </>
              ) : (
                <>
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
                </>
              )}
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
          justifyContent: 'center',
          alignItems: 'center',
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
      
      {/* Add Member Modal */}
      {showAddMember && (
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
            maxWidth: '400px',
            boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)'
          }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#111827', marginBottom: '24px' }}>
              Add Group Member
            </h2>
            
            <div style={{ marginBottom: '24px' }}>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#374151', marginBottom: '6px' }}>
                Email Address
              </label>
              <input
                type="email"
                value={memberEmail}
                onChange={(e) => setMemberEmail(e.target.value)}
                placeholder="Enter email address"
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  fontSize: '1rem'
                }}
              />
            </div>
            
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button
                onClick={() => {
                  setShowAddMember(false);
                  setMemberEmail('');
                }}
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
                onClick={handleAddMember}
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
                {loading ? 'Adding...' : 'Add Member'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
