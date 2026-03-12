import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import './Auth.css';

function TagInput({ label, placeholder, tags, onChange }) {
  const [enabled, setEnabled] = useState(null); // null=not answered, true=yes, false=no
  const [input, setInput] = useState('');

  const add = () => {
    const v = input.trim();
    if (v && !tags.includes(v)) onChange([...tags, v]);
    setInput('');
  };

  const remove = (tag) => onChange(tags.filter(t => t !== tag));

  const handleSelect = (val) => {
    setEnabled(val);
    if (!val) onChange([]); // clear tags when switching to No
  };

  return (
    <div className="form-group">
      <label>{label}</label>
      <div className="yn-select-row">
        <select
          className="health-select yn-inline-select"
          value={enabled === null ? '' : enabled ? 'yes' : 'no'}
          onChange={e => handleSelect(e.target.value === 'yes' ? true : e.target.value === 'no' ? false : null)}
        >
          <option value="">Select…</option>
          <option value="yes">Yes</option>
          <option value="no">No</option>
        </select>

        {enabled === true && (
          <div className="tag-input-wrap">
            {tags.map(t => (
              <span key={t} className="health-tag">
                {t}
                <button type="button" onClick={() => remove(t)}>×</button>
              </span>
            ))}
            <input
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); add(); } }}
              placeholder={placeholder}
            />
            {input.trim() && (
              <button type="button" className="tag-add-btn" onClick={add}>Add</button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function Signup({ onSwitchToLogin, onClose, onSuccess }) {
  const { register, loading, error, clearError } = useAuth();
  const [step, setStep] = useState(1);
  const [formError, setFormError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [basicInfo, setBasicInfo] = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const [healthInfo, setHealthInfo] = useState({
    hasDiabetes: false,
    hasBloodSugar: false,
    bloodType: '',
    allergies: [],
    medications: [],
    conditions: []
  });

  const onBasicChange = (e) => {
    setBasicInfo({ ...basicInfo, [e.target.name]: e.target.value });
    if (formError) setFormError('');
    if (error) clearError();
  };

  const validateStep1 = () => {
    const { name, email, password, confirmPassword } = basicInfo;
    if (!name || !email || !password || !confirmPassword) { setFormError('Please fill in all fields'); return false; }
    if (name.length < 2) { setFormError('Name must be at least 2 characters long'); return false; }
    if (!email.includes('@')) { setFormError('Please enter a valid email'); return false; }
    if (password.length < 6) { setFormError('Password must be at least 6 characters long'); return false; }
    if (password !== basicInfo.confirmPassword) { setFormError('Passwords do not match'); return false; }
    return true;
  };

  const handleNext = (e) => {
    e.preventDefault();
    setFormError('');
    if (validateStep1()) setStep(2);
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    try {
      const result = await register({
        name: basicInfo.name,
        email: basicInfo.email,
        password: basicInfo.password,
        ...healthInfo
      }, onSuccess);
      if (result && result.success) {
        onClose();
      } else {
        setFormError((result && result.message) || 'Registration failed');
      }
    } catch {
      setFormError('An error occurred. Please try again.');
    }
  };

  return (
    <div className="auth-form-container">
      <div className="auth-header">
        <h2>Create Account</h2>
        <p>{step === 1 ? 'Join us to save and track your medical consultations' : 'Health Profile — helps doctors know you better'}</p>
        <div className="step-indicator">
          <span className={`step-dot${step >= 1 ? ' active' : ''}`}>1</span>
          <span className="step-line"></span>
          <span className={`step-dot${step >= 2 ? ' active' : ''}`}>2</span>
        </div>
      </div>

      {(formError || error) && (
        <div className="error-message">
          <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
          </svg>
          {formError || error}
        </div>
      )}

      {step === 1 ? (
        <form onSubmit={handleNext} className="auth-form">
          <div className="form-group">
            <label htmlFor="name">Full Name</label>
            <input type="text" id="name" name="name" value={basicInfo.name} onChange={onBasicChange} placeholder="Enter your full name" required />
          </div>

          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <input type="email" id="email" name="email" value={basicInfo.email} onChange={onBasicChange} placeholder="Enter your email" required />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <div className="password-input">
              <input
                type={showPassword ? 'text' : 'password'}
                id="password" name="password"
                value={basicInfo.password} onChange={onBasicChange}
                placeholder="Create a password (min 6 characters)" required
              />
              <button type="button" className="password-toggle" onClick={() => setShowPassword(!showPassword)}>
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
                id="confirmPassword" name="confirmPassword"
                value={basicInfo.confirmPassword} onChange={onBasicChange}
                placeholder="Confirm your password" required
              />
              <button type="button" className="password-toggle" onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
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

          <button type="submit" className="auth-submit-btn">Next: Health Profile →</button>
        </form>
      ) : (
        <form onSubmit={onSubmit} className="auth-form">
          <p className="health-form-note">All fields are optional. This info will be shared with doctors when you book an appointment.</p>

          <div className="health-yn-row">
            <div className="health-yn-card">
              <label>Do you have Diabetes?</label>
              <div className="yn-buttons">
                <button type="button" className={`yn-btn${healthInfo.hasDiabetes ? ' active-yes' : ''}`}
                  onClick={() => setHealthInfo(h => ({ ...h, hasDiabetes: true }))}>Yes</button>
                <button type="button" className={`yn-btn${!healthInfo.hasDiabetes ? ' active-no' : ''}`}
                  onClick={() => setHealthInfo(h => ({ ...h, hasDiabetes: false }))}>No</button>
              </div>
            </div>
            <div className="health-yn-card">
              <label>High Blood Sugar / BP?</label>
              <div className="yn-buttons">
                <button type="button" className={`yn-btn${healthInfo.hasBloodSugar ? ' active-yes' : ''}`}
                  onClick={() => setHealthInfo(h => ({ ...h, hasBloodSugar: true }))}>Yes</button>
                <button type="button" className={`yn-btn${!healthInfo.hasBloodSugar ? ' active-no' : ''}`}
                  onClick={() => setHealthInfo(h => ({ ...h, hasBloodSugar: false }))}>No</button>
              </div>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="bloodType">Blood Type</label>
            <select
              id="bloodType"
              value={healthInfo.bloodType}
              onChange={e => setHealthInfo(h => ({ ...h, bloodType: e.target.value }))}
              className="health-select"
            >
              <option value="">Select blood type (optional)</option>
              {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(t => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>

          <TagInput
            label="Allergies"
            placeholder="Type an allergy & press Enter"
            tags={healthInfo.allergies}
            onChange={v => setHealthInfo(h => ({ ...h, allergies: v }))}
          />
          <TagInput
            label="Current Medications"
            placeholder="Type medication & press Enter"
            tags={healthInfo.medications}
            onChange={v => setHealthInfo(h => ({ ...h, medications: v }))}
          />
          <TagInput
            label="Other Medical Conditions"
            placeholder="Type condition & press Enter"
            tags={healthInfo.conditions}
            onChange={v => setHealthInfo(h => ({ ...h, conditions: v }))}
          />

          <div className="auth-form-actions">
            <button type="button" className="auth-back-btn" onClick={() => { setStep(1); setFormError(''); }}>← Back</button>
            <button type="submit" className="auth-submit-btn" disabled={loading}>
              {loading ? <div className="loading-spinner"></div> : 'Create Account'}
            </button>
          </div>
        </form>
      )}

      <div className="auth-switch">
        <p>
          Already have an account?{' '}
          <button type="button" onClick={onSwitchToLogin} className="switch-auth-btn">Sign In</button>
        </p>
      </div>
    </div>
  );
}

export default Signup;
