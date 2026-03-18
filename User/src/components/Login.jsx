import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import './Auth.css';

function Login({ onSwitchToSignup, onClose, onSuccess }) {
  const { login, loading, error, clearError } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [formError, setFormError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const { email, password } = formData;

  const onChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (formError) setFormError('');
    if (error) clearError();
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    
    // Client-side validation
    if (!email || !password) {
      setFormError('Please fill in all fields');
      return;
    }

    if (!email.includes('@')) {
      setFormError('Please enter a valid email');
      return;
    }

    try {
      const result = await login({ email, password }, onSuccess);
      if (result.success) {
        onClose();
      } else {
        setFormError(result.message || 'Login failed');
      }
    } catch (error) {
      setFormError('An error occurred. Please try again.');
    }
  };

  return (
    <div className="auth-form-container">
      <button 
        className="auth-modal-close"
        onClick={onClose}
        aria-label="Close"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <line x1="18" y1="6" x2="6" y2="18"/>
          <line x1="6" y1="6" x2="18" y2="18"/>
        </svg>
      </button>
      <div className="auth-header">
        <h2>Welcome Back</h2>
        <p>Sign in to access your medical consultation history</p>
      </div>

      <form onSubmit={onSubmit} className="auth-form">
        {(formError || error) && (
          <div className="error-message">
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
            </svg>
            {formError || error}
          </div>
        )}

        <div className="form-group">
          <label htmlFor="email">Email Address</label>
          <input
            type="email"
            id="email"
            name="email"
            value={email}
            onChange={onChange}
            placeholder="Enter your email"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="password">Password</label>
          <div className="password-input">
            <input
              type={showPassword ? 'text' : 'password'}
              id="password"
              name="password"
              value={password}
              onChange={onChange}
              placeholder="Enter your password"
              required
            />
            <button
              type="button"
              className="password-toggle"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
                  <line x1="1" y1="1" x2="23" y2="23"/>
                </svg>
              ) : (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                  <circle cx="12" cy="12" r="3"/>
                </svg>
              )}
            </button>
          </div>
        </div>

        <button
          type="submit"
          className="auth-submit-btn"
          disabled={loading}
        >
          {loading ? (
            <div className="loading-spinner"></div>
          ) : (
            'Sign In'
          )}
        </button>
      </form>

      <div className="auth-switch">
        <p>
          Don't have an account?{' '}
          <button
            type="button"
            onClick={onSwitchToSignup}
            className="switch-auth-btn"
          >
            Sign Up
          </button>
        </p>
      </div>
    </div>
  );
}

export default Login;