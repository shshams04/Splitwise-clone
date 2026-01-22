import React from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import NavbarMinimal from './components/NavbarMinimal';
import { AuthProvider } from './context/AuthContext';

// Simple placeholder components
const Login = () => (
  <div style={{ textAlign: 'center', padding: '40px' }}>
    <h1 style={{ fontSize: '2rem', marginBottom: '16px' }}>Login Page</h1>
    <p style={{ color: '#6b7280' }}>Login functionality coming soon!</p>
  </div>
);

const Register = () => (
  <div style={{ textAlign: 'center', padding: '40px' }}>
    <h1 style={{ fontSize: '2rem', marginBottom: '16px' }}>Register Page</h1>
    <p style={{ color: '#6b7280' }}>Register functionality coming soon!</p>
  </div>
);

const Dashboard = () => (
  <div style={{ textAlign: 'center', padding: '40px' }}>
    <h1 style={{ fontSize: '2rem', marginBottom: '16px' }}>Dashboard</h1>
    <p style={{ color: '#6b7280' }}>Dashboard functionality coming soon!</p>
  </div>
);

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({
      error: error,
      errorInfo: errorInfo
    });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ 
          minHeight: '100vh', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          padding: '20px',
          backgroundColor: '#f9fafb'
        }}>
          <div style={{
            backgroundColor: '#fef2f2',
            border: '1px solid #fecaca',
            borderRadius: '8px',
            padding: '24px',
            maxWidth: '400px',
            width: '100%'
          }}>
            <h2 style={{ color: '#dc2626', fontSize: '18px', marginBottom: '16px' }}>
              Something went wrong
            </h2>
            <details style={{ textAlign: 'left' }}>
              <summary style={{ cursor: 'pointer', color: '#dc2626', marginBottom: '8px' }}>
                Error Details
              </summary>
              <pre style={{
                backgroundColor: '#fee2e2',
                padding: '16px',
                borderRadius: '4px',
                fontSize: '14px',
                overflow: 'auto'
              }}>
                {this.state.error && this.state.error.toString()}
              </pre>
            </details>
            <button
              onClick={() => window.location.reload()}
              style={{
                marginTop: '16px',
                backgroundColor: '#dc2626',
                color: 'white',
                padding: '8px 16px',
                borderRadius: '4px',
                border: 'none',
                cursor: 'pointer'
              }}
            >
              Reload Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

const App = () => {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <Router>
          <div style={{ minHeight: '100vh', backgroundColor: '#f9fafb' }}>
            <NavbarMinimal />
            <main style={{ maxWidth: '1200px', margin: '0 auto', padding: '32px 16px' }}>
              <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/" element={<Navigate to="/dashboard" />} />
              </Routes>
            </main>
          </div>
        </Router>
      </AuthProvider>
    </ErrorBoundary>
  );
};

export default App;
