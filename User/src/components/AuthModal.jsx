import { useEffect } from 'react';
import Login from './Login';
import Signup from './Signup';
import './Auth.css';

function AuthModal({ mode, onClose, onSwitchMode }) {
  // Handle ESC key to close modal
  useEffect(() => {
    const handleEsc = (event) => {
      if (event.keyCode === 27) {
        onClose();
      }
    };
    document.addEventListener('keydown', handleEsc);
    
    // Prevent body scroll when modal is open
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', handleEsc);
      document.body.style.overflow = 'unset';
    };
  }, [onClose]);

  return (
    <div className="auth-modal-overlay" onClick={onClose}>
      <div className="auth-modal" onClick={(e) => e.stopPropagation()}>
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
        
        <div className="auth-modal-content">
          {mode === 'login' ? (
            <Login 
              onSwitchToSignup={() => onSwitchMode('signup')}
              onClose={onClose}
            />
          ) : (
            <Signup 
              onSwitchToLogin={() => onSwitchMode('login')}
              onClose={onClose}
            />
          )}
        </div>
      </div>
    </div>
  );
}

export default AuthModal;