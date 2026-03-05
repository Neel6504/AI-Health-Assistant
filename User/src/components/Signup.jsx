import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import './Auth.css';

function Signup({ onSwitchToLogin, onClose, onSuccess }) {
  const { register, loading, error, clearError } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [formError, setFormError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const { name, email, password, confirmPassword } = formData;

  const onChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (formError) setFormError('');
    if (error) clearError();
  };

  const validateForm = () => {
    if (!name || !email || !password || !confirmPassword) {
      setFormError('Please fill in all fields');
      return false;
    }

    if (name.length < 2) {
      setFormError('Name must be at least 2 characters long');
      return false;
    }

    if (!email.includes('@')) {
      setFormError('Please enter a valid email');
      return false;
    }

    if (password.length < 6) {
      setFormError('Password must be at least 6 characters long');
      return false;
    }

    if (password !== confirmPassword) {
      setFormError('Passwords do not match');
      return false;
    }

    return true;
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    try {
      const result = await register({ name, email, password }, onSuccess);
      if (result.success) {
        onClose();
      } else {
        setFormError(result.message || 'Registration failed');
      }
    } catch (error) {
      setFormError('An error occurred. Please try again.');
    }
  };

  return (
    <div className="auth-form-container">
      <div className="auth-header">
        <h2>Create Account</h2>
        <p>Join us to save and track your medical consultations</p>
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
          <label htmlFor="name">Full Name</label>
          <input
            type="text"
            id="name"
            name="name"
            value={name}
            onChange={onChange}
            placeholder="Enter your full name"
            required
          />
        </div>

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
              placeholder="Create a password (min 6 characters)"
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

        <div className="form-group">
          <label htmlFor="confirmPassword">Confirm Password</label>
          <div className="password-input">
            <input
              type={showConfirmPassword ? 'text' : 'password'}
              id="confirmPassword"
              name="confirmPassword"
              value={confirmPassword}
              onChange={onChange}
              placeholder="Confirm your password"
              required
            />
            <button
              type="button"
              className="password-toggle"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            >
              {showConfirmPassword ? (
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
            'Create Account'
          )}
        </button>
      </form>

      <div className="auth-switch">
        <p>
          Already have an account?{' '}
          <button
            type="button"
            onClick={onSwitchToLogin}
            className="switch-auth-btn"
          >
            Sign In
          </button>
        </p>
      </div>
    </div>
  );
}

export default Signup;