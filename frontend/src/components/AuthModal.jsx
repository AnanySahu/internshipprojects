import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Users, LogIn, UserPlus, AlertCircle } from 'lucide-react';

const AuthModal = () => {
  const [isRegister, setIsRegister] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const { login, register, loading } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (isRegister) {
      if (!name.trim()) {
        setError('Please enter your full name');
        return;
      }
      if (password.length < 6) {
        setError('Password must be at least 6 characters');
        return;
      }
      const res = await register(name, email, password);
      if (!res.success) {
        setError(res.error);
      }
    } else {
      const res = await login(email, password);
      if (!res.success) {
        setError(res.error);
      }
    }
  };

  const toggleMode = () => {
    setIsRegister(!isRegister);
    setError('');
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-card">
        <div className="auth-header">
          <div
            style={{
              width: '48px',
              height: '48px',
              margin: '0 auto 1rem',
              background: 'var(--primary-light)',
              color: 'var(--primary)',
              borderRadius: 'var(--radius-md)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Users size={26} />
          </div>
          <h2>{isRegister ? 'Create an account' : 'Welcome back'}</h2>
          <p>
            {isRegister
              ? 'Start organizing your personal and professional contacts securely'
              : 'Log in to manage and access your contact database'}
          </p>
        </div>

        {error && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.75rem 1rem',
              borderRadius: 'var(--radius-md)',
              background: 'var(--danger-light)',
              color: 'var(--danger)',
              fontSize: '0.875rem',
              fontWeight: 500,
              marginBottom: '1.25rem',
            }}
          >
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {isRegister && (
            <div className="form-group">
              <label htmlFor="auth-name">Full Name</label>
              <input
                id="auth-name"
                type="text"
                placeholder="John Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
          )}

          <div className="form-group">
            <label htmlFor="auth-email">Email Address</label>
            <input
              id="auth-email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="auth-password">Password</label>
            <input
              id="auth-password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%', marginTop: '0.5rem', padding: '0.75rem' }}
            disabled={loading}
          >
            {loading ? (
              <span>Please wait...</span>
            ) : isRegister ? (
              <>
                <UserPlus size={18} />
                <span>Create Account</span>
              </>
            ) : (
              <>
                <LogIn size={18} />
                <span>Sign In</span>
              </>
            )}
          </button>
        </form>

        <div className="auth-toggle">
          <span>{isRegister ? 'Already have an account?' : "Don't have an account yet?"}</span>
          <button type="button" onClick={toggleMode}>
            {isRegister ? 'Log In' : 'Sign Up'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AuthModal;
