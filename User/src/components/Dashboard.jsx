import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { CHAT_API } from '../config/api';
import './Dashboard.css';

const timeAgo = (dateStr) => {
  const diff = Math.floor((Date.now() - new Date(dateStr)) / 1000)
  if (diff < 60) return 'just now'
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
  if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

function Dashboard() {
  const navigate = useNavigate();
  const { user, token, logout } = useAuth();
  const [sessions, setSessions] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('recent');
  const [selectedSession, setSelectedSession] = useState(null);

  // API Base URL
  const API_URL = CHAT_API;

  // Redirect if not authenticated
  useEffect(() => {
    if (!user || !token) {
      navigate('/');
      return;
    }
    
    fetchDashboard();
  }, [user, token, navigate]);

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch user statistics and recent sessions
      const [statsRes, sessionsRes] = await Promise.all([
        fetch(`${API_URL}/stats`, {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch(`${API_URL}/recent?limit=10`, {
          headers: { 'Authorization': `Bearer ${token}` }
        })
      ]);

      const statsData = await statsRes.json();
      const sessionsData = await sessionsRes.json();

      if (statsData.success) {
        setStats(statsData.stats);
      }

      if (sessionsData.success) {
        setSessions(sessionsData.sessions);
      }

    } catch (error) {
      console.error('Dashboard fetch error:', error);
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const fetchFullSession = async (sessionId) => {
    try {
      const res = await fetch(`${API_URL}/sessions/${sessionId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      const data = await res.json();
      
      if (data.success) {
        setSelectedSession(data.session);
      } else {
        setError('Failed to load session details');
      }
    } catch (error) {
      console.error('Session fetch error:', error);
      setError('Failed to load session details');
    }
  };

  const getEmergencyLevelColor = (level) => {
    switch (level) {
      case 'critical': return '#e74c3c';
      case 'high': return '#f39c12';
      case 'medium': return '#f1c40f';
      case 'low': return '#27ae60';
      default: return '#95a5a6';
    }
  };

  const getEmergencyLevelIcon = (level) => {
    switch (level) {
      case 'critical': 
        return <svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2L1 21h22L12 2zm0 3.5L19.5 19h-15L12 5.5zM11 10v4h2v-4h-2zm0 6v2h2v-2h-2z"/></svg>;
      case 'high':
        return <svg viewBox="0 0 24 24" fill="currentColor"><path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z"/></svg>;
      case 'medium':
        return <svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/></svg>;
      case 'low':
        return <svg viewBox="0 0 24 24" fill="currentColor"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>;
      default:
        return <svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/></svg>;
    }
  };

  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="loading-spinner"></div>
        <p>Loading your medical consultation history...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard-error">
        <svg viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
        </svg>
        <h3>Error Loading Dashboard</h3>
        <p>{error}</p>
        <button onClick={fetchDashboard} className="retry-btn">Try Again</button>
      </div>
    );
  }

  return (
    <div className="dashboard-page">
      {/* Header */}
      <header className="dashboard-header">
        <button onClick={() => navigate(-1)} className="back-button">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M19 12H5M12 19l-7-7 7-7"/>
          </svg>
          Back
        </button>
        <div className="header-content">
          <h1>📊 Medical Dashboard</h1>
          <p>Welcome back, {user?.name}!</p>
        </div>
        <button onClick={logout} className="logout-button">
          <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M17 7l-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.59L17 17l5-5-5-5zM4 5h8V3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8v-2H4V5z"/>
          </svg>
          Logout
        </button>
      </header>

      {/* Statistics Cards */}
      {stats && (
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon">💬</div>
            <div className="stat-info">
              <h3>{stats.totalSessions}</h3>
              <p>Total Sessions</p>
            </div>
          </div>
          
          <div className="stat-card">
            <div className="stat-icon">💭</div>
            <div className="stat-info">
              <h3>{stats.totalMessages}</h3>
              <p>Messages Exchanged</p>
            </div>
          </div>
          
          <div className="stat-card emergency">
            <div className="stat-icon">🚨</div>
            <div className="stat-info">
              <h3>{stats.emergencySessions}</h3>
              <p>Emergency Sessions</p>
            </div>
          </div>
          
          <div className="stat-card">
            <div className="stat-icon">🏥</div>
            <div className="stat-info">
              <h3>{stats.hospitalSearches}</h3>
              <p>Hospital Searches</p>
            </div>
          </div>
        </div>
      )}

      {/* Session Modal */}
      {selectedSession && (
        <div className="session-modal-overlay" onClick={() => setSelectedSession(null)}>
          <div className="session-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{selectedSession.title}</h3>
              <button 
                onClick={() => setSelectedSession(null)}
                className="modal-close"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18"/>
                  <line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>
            
            <div className="modal-content">
              <div className="session-metadata">
                <div className="metadata-item">
                  <strong>Duration:</strong> {selectedSession.sessionInfo?.duration || 0} minutes
                </div>
                <div className="metadata-item">
                  <strong>Messages:</strong> {selectedSession.sessionInfo?.messageCount || 0}
                </div>
                <div className="metadata-item">
                  <strong>Emergency Level:</strong>
                  <span 
                    className="emergency-badge" 
                    style={{ color: getEmergencyLevelColor(selectedSession.medicalAnalysis?.emergencyLevel) }}
                  >
                    {getEmergencyLevelIcon(selectedSession.medicalAnalysis?.emergencyLevel)}
                    {selectedSession.medicalAnalysis?.emergencyLevel || 'none'}
                  </span>
                </div>
              </div>
              
              <div className="messages-container">
                {selectedSession.messages?.map((message, index) => (
                  <div key={index} className={`message ${message.sender}`}>
                    <div className="message-header">
                      <span className="sender">{message.sender === 'user' ? 'You' : 'AI Assistant'}</span>
                      <span className="timestamp">{new Date(message.timestamp).toLocaleTimeString()}</span>
                    </div>
                    <div className="message-content">{message.content}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Sessions List */}
      <div className="sessions-section">
        <h2>Recent Medical Consultations</h2>
        
        {sessions.length === 0 ? (
          <div className="no-sessions">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10"/>
              <line x1="8" y1="15" x2="16" y2="15"/>
              <line x1="9" y1="9" x2="9.01" y2="9"/>
              <line x1="15" y1="9" x2="15.01" y2="9"/>
            </svg>
            <h3>No Consultations Yet</h3>
            <p>Start a conversation with our AI medical assistant to see your consultation history here.</p>
            <button onClick={() => navigate('/')} className="start-chat-btn">
              Start Medical Consultation
            </button>
          </div>
        ) : (
          <div className="sessions-list">
            {sessions.map(session => (
              <div 
                key={session.sessionId} 
                className="session-card"
                onClick={() => fetchFullSession(session.sessionId)}
              >
                <div className="session-main">
                  <div className="session-header">
                    <h4>{session.title}</h4>
                    <span className="session-date" title={new Date(session.createdAt).toLocaleString()}>
                      {timeAgo(session.createdAt)}
                    </span>
                  </div>
                  
                  <div className="session-metadata">
                    <span className="message-count">
                      💬 {session.messageCount} messages
                    </span>
                    {session.duration > 0 && (
                      <span className="duration">⏱️ {session.duration}m</span>
                    )}
                  </div>
                </div>
                
                <div className="session-emergency">
                  <div 
                    className="emergency-indicator" 
                    style={{ color: getEmergencyLevelColor(session.emergencyLevel) }}
                  >
                    {getEmergencyLevelIcon(session.emergencyLevel)}
                    <span>{session.emergencyLevel}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Dashboard;