import { createContext, useContext, useReducer, useEffect } from 'react';
import { AUTH_API, CHAT_API } from '../config/api';

const AuthContext = createContext();

// Initial state
const initialState = {
  user: null,
  token: localStorage.getItem('token'),
  isAuthenticated: false,
  loading: true,
  error: null
};

// Auth reducer
const authReducer = (state, action) => {
  switch (action.type) {
    case 'SET_LOADING':
      return {
        ...state,
        loading: action.payload
      };
    case 'LOGIN_SUCCESS':
    case 'REGISTER_SUCCESS':
      localStorage.setItem('token', action.payload.token);
      return {
        ...state,
        token: action.payload.token,
        user: action.payload.user,
        isAuthenticated: true,
        loading: false,
        error: null
      };
    case 'USER_LOADED':
      return {
        ...state,
        user: action.payload,
        isAuthenticated: true,
        loading: false
      };
    case 'AUTH_ERROR':
    case 'LOGIN_FAIL':
    case 'REGISTER_FAIL':
    case 'LOGOUT':
      localStorage.removeItem('token');
      return {
        ...state,
        token: null,
        user: null,
        isAuthenticated: false,
        loading: false,
        error: action.payload
      };
    case 'CLEAR_ERROR':
      return {
        ...state,
        error: null
      };
    case 'UPDATE_PROFILE':
      return {
        ...state,
        user: action.payload,
        error: null
      };
    default:
      return state;
  }
};

// Auth Provider Component
export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // API Base URL - adjust based on your backend port
  const API_URL = AUTH_API;
  const CHAT_API_URL = CHAT_API;
  const GUEST_SESSION_KEY = 'ai_health_guest_session';

  // Migrate any guest session saved in localStorage to the DB after login
  const migrateGuestSessionToDb = async (token) => {
    try {
      const stored = localStorage.getItem(GUEST_SESSION_KEY);
      if (!stored) return;
      const guestSession = JSON.parse(stored);
      if (!guestSession || !guestSession.messages || guestSession.messages.length <= 1) return;

      // Create a new chat session
      const sessionRes = await fetch(`${CHAT_API_URL}/sessions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ title: 'Medical Consultation' })
      });
      const sessionData = await sessionRes.json();
      if (!sessionData.success) return;
      const sessionId = sessionData.session.sessionId;

      // Save all messages
      for (const msg of guestSession.messages) {
        if (msg.role === 'user' || msg.role === 'assistant') {
          await fetch(`${CHAT_API_URL}/sessions/${sessionId}/messages`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify({
              sender: msg.role === 'user' ? 'user' : 'ai',
              content: msg.content,
              metadata: { migratedFromGuest: true }
            })
          });
        }
      }

      // Save any critical symptoms
      for (const symptom of guestSession.symptoms || []) {
        await fetch(`${CHAT_API_URL}/sessions/${sessionId}/symptoms`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
          body: JSON.stringify({
            symptom: symptom.symptom,
            emergencyLevel: symptom.emergencyLevel?.toLowerCase().replace('_', ' ') || 'normal'
          })
        });
      }

      // End/complete the session
      await fetch(`${CHAT_API_URL}/sessions/${sessionId}/end`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      // Clear guest data from localStorage
      localStorage.removeItem(GUEST_SESSION_KEY);
      console.log('Guest session migrated to DB successfully');
    } catch (err) {
      console.error('Guest session migration failed:', err);
    }
  };

  // Load user from token
  const loadUser = async () => {
    if (state.token) {
      try {
        const res = await fetch(`${API_URL}/me`, {
          headers: {
            'Authorization': `Bearer ${state.token}`
          }
        });

        const data = await res.json();

        if (data.success) {
          dispatch({
            type: 'USER_LOADED',
            payload: data.user
          });
        } else {
          dispatch({ type: 'AUTH_ERROR', payload: data.message });
        }
      } catch (error) {
        console.error('Load user error:', error);
        dispatch({ type: 'AUTH_ERROR', payload: 'Server error' });
      }
    } else {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  // Register user
  const register = async (userData, onSuccess = null) => {
    dispatch({ type: 'SET_LOADING', payload: true });

    try {
      const res = await fetch(`${API_URL}/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(userData)
      });

      const data = await res.json();

      if (data.success) {
        dispatch({
          type: 'REGISTER_SUCCESS',
          payload: {
            token: data.token,
            user: data.user
          }
        });

        // Migrate any guest session to DB immediately after register
        await migrateGuestSessionToDb(data.token);
        
        // Call success callback if provided
        if (onSuccess && typeof onSuccess === 'function') {
          setTimeout(() => onSuccess(), 100); // Small delay to ensure state is updated
        }
        
        return { success: true, message: data.message };
      } else {
        dispatch({ type: 'REGISTER_FAIL', payload: data.message });
        return { success: false, message: data.message };
      }
    } catch (error) {
      console.error('Register error:', error);
      const errorMessage = 'Network error. Please try again.';
      dispatch({ type: 'REGISTER_FAIL', payload: errorMessage });
      return { success: false, message: errorMessage };
    }
  };

  // Login user
  const login = async (credentials, onSuccess = null) => {
    dispatch({ type: 'SET_LOADING', payload: true });

    try {
      const res = await fetch(`${API_URL}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(credentials)
      });

      const data = await res.json();

      if (data.success) {
        dispatch({
          type: 'LOGIN_SUCCESS',
          payload: {
            token: data.token,
            user: data.user
          }
        });

        // Migrate any guest session to DB immediately after login
        await migrateGuestSessionToDb(data.token);
        
        // Call success callback if provided
        if (onSuccess && typeof onSuccess === 'function') {
          setTimeout(() => onSuccess(), 100); // Small delay to ensure state is updated
        }
        
        return { success: true, message: data.message };
      } else {
        dispatch({ type: 'LOGIN_FAIL', payload: data.message });
        return { success: false, message: data.message };
      }
    } catch (error) {
      console.error('Login error:', error);
      const errorMessage = 'Network error. Please try again.';
      dispatch({ type: 'LOGIN_FAIL', payload: errorMessage });
      return { success: false, message: errorMessage };
    }
  };

  // Logout user
  const logout = () => {
    dispatch({ type: 'LOGOUT' });
  };

  // Update profile
  const updateProfile = async (profileData) => {
    try {
      const res = await fetch(`${API_URL}/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${state.token}`
        },
        body: JSON.stringify(profileData)
      });

      const data = await res.json();

      if (data.success) {
        dispatch({
          type: 'UPDATE_PROFILE',
          payload: data.user
        });
        return { success: true, message: data.message };
      } else {
        return { success: false, message: data.message };
      }
    } catch (error) {
      console.error('Update profile error:', error);
      return { success: false, message: 'Network error. Please try again.' };
    }
  };

  // Change password
  const changePassword = async (passwordData) => {
    try {
      const res = await fetch(`${API_URL}/password`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${state.token}`
        },
        body: JSON.stringify(passwordData)
      });

      const data = await res.json();
      return { success: data.success, message: data.message };
    } catch (error) {
      console.error('Change password error:', error);
      return { success: false, message: 'Network error. Please try again.' };
    }
  };

  // Clear errors
  const clearError = () => {
    dispatch({ type: 'CLEAR_ERROR' });
  };

  // Load user on component mount
  useEffect(() => {
    loadUser();
  }, [state.token]);

  const value = {
    ...state,
    register,
    login,
    logout,
    updateProfile,
    changePassword,
    clearError,
    loadUser
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;