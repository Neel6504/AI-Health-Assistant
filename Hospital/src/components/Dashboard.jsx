import { useState, useEffect, useCallback } from 'react'
import { API_BASE } from '../config/api'
import './Dashboard.css'

const API_ROOT = `${API_BASE}/api`

const STATUS_COLORS = {
  pending:   { bg: '#fef3c7', text: '#92400e', border: '#fbbf24' },
  confirmed: { bg: '#d1fae5', text: '#065f46', border: '#34d399' },
  completed: { bg: '#dbeafe', text: '#1e40af', border: '#60a5fa' }
}

const STATUS_LABELS = { pending: 'Pending', confirmed: 'Confirmed', completed: 'Completed' }

function ChatBubble({ msg }) {
  const isAI = msg.sender === 'ai'
  return (
    <div className={`chat-bubble ${isAI ? 'ai' : 'user'}`}>
      <span className="chat-sender">{isAI ? '🤖 AI' : '👤 Patient'}</span>
      <p>{msg.content}</p>
      <span className="chat-time">{new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
    </div>
  )
}

function AppointmentDetail({ appt, onClose, onStatusChange }) {
  const [status, setStatus] = useState(appt.status)
  const [saving, setSaving] = useState(false)

  const updateStatus = async (newStatus) => {
    setSaving(true)
    try {
      const token = localStorage.getItem('hospitalToken')
      const res = await fetch(`${API_ROOT}/appointments/hospital/${appt._id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ status: newStatus })
      })
      const data = await res.json()
      if (data.success) {
        setStatus(newStatus)
        onStatusChange(appt._id, newStatus)
      }
    } finally {
      setSaving(false)
    }
  }

  const colors = STATUS_COLORS[status]
  const patientName = appt.userId?.name || 'Unknown Patient'
  const patientEmail = appt.userId?.email || ''

  return (
    <div className="detail-panel">
      <div className="detail-header">
        <div>
          <h2>Appointment Details</h2>
          <p className="detail-sub">#{appt._id.slice(-8).toUpperCase()}</p>
        </div>
        <button className="detail-close" onClick={onClose}>✕</button>
      </div>

      {/* Patient info */}
      <section className="detail-section">
        <h3>👤 Patient</h3>
        <div className="info-row"><span>Name</span><strong>{patientName}</strong></div>
        {patientEmail && <div className="info-row"><span>Email</span><strong>{patientEmail}</strong></div>}
      </section>

      {/* Appointment info */}
      <section className="detail-section">
        <h3>📅 Appointment</h3>
        <div className="info-row">
          <span>Date</span>
          <strong>{new Date(appt.appointmentDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</strong>
        </div>
        <div className="info-row"><span>Time</span><strong>{appt.appointmentTime}</strong></div>
        {appt.reason && <div className="info-row"><span>Reason</span><strong>{appt.reason}</strong></div>}
        <div className="info-row">
          <span>Status</span>
          <span className="status-chip" style={{ background: colors.bg, color: colors.text, borderColor: colors.border }}>
            {STATUS_LABELS[status]}
          </span>
        </div>
      </section>

      {/* Status update */}
      <section className="detail-section">
        <h3>🔄 Update Status</h3>
        <div className="status-buttons">
          {Object.keys(STATUS_LABELS).map((s) => (
            <button
              key={s}
              className={`status-btn ${status === s ? 'active' : ''}`}
              style={status === s ? { background: STATUS_COLORS[s].bg, color: STATUS_COLORS[s].text, borderColor: STATUS_COLORS[s].border } : {}}
              onClick={() => updateStatus(s)}
              disabled={saving || status === s}
            >
              {STATUS_LABELS[s]}
            </button>
          ))}
        </div>
      </section>

      {/* Patient Health Profile */}
      {appt.healthProfile && (
        <section className="detail-section">
          <h3>🩺 Patient Health Profile</h3>
          <div className="health-profile-grid">
            <div className="hp-item">
              <span className="hp-label">Diabetes</span>
              <span className={`hp-badge ${appt.healthProfile.hasDiabetes ? 'hp-yes' : 'hp-no'}`}>
                {appt.healthProfile.hasDiabetes ? 'Yes' : 'No'}
              </span>
            </div>
            <div className="hp-item">
              <span className="hp-label">High Blood Sugar / BP</span>
              <span className={`hp-badge ${appt.healthProfile.hasBloodSugar ? 'hp-yes' : 'hp-no'}`}>
                {appt.healthProfile.hasBloodSugar ? 'Yes' : 'No'}
              </span>
            </div>
            {appt.healthProfile.bloodType && (
              <div className="hp-item">
                <span className="hp-label">Blood Type</span>
                <span className="hp-badge hp-blue">{appt.healthProfile.bloodType}</span>
              </div>
            )}
          </div>

          {appt.healthProfile.allergies?.length > 0 && (
            <div className="hp-tags-row">
              <span className="hp-tags-label">Allergies</span>
              <div className="hp-tags">
                {appt.healthProfile.allergies.map(a => <span key={a} className="hp-tag hp-tag-red">{a}</span>)}
              </div>
            </div>
          )}
          {appt.healthProfile.medications?.length > 0 && (
            <div className="hp-tags-row">
              <span className="hp-tags-label">Medications</span>
              <div className="hp-tags">
                {appt.healthProfile.medications.map(m => <span key={m} className="hp-tag hp-tag-purple">{m}</span>)}
              </div>
            </div>
          )}
          {appt.healthProfile.conditions?.length > 0 && (
            <div className="hp-tags-row">
              <span className="hp-tags-label">Conditions</span>
              <div className="hp-tags">
                {appt.healthProfile.conditions.map(c => <span key={c} className="hp-tag hp-tag-orange">{c}</span>)}
              </div>
            </div>
          )}

          {!appt.healthProfile.hasDiabetes && !appt.healthProfile.hasBloodSugar &&
           !appt.healthProfile.bloodType &&
           !appt.healthProfile.allergies?.length &&
           !appt.healthProfile.medications?.length &&
           !appt.healthProfile.conditions?.length && (
            <p className="empty-note">No health profile information provided.</p>
          )}
        </section>
      )}

      {/* AI Chat Context */}
      
    </div>
  )
}

function Dashboard({ onLogout }) {
  const hospitalName = localStorage.getItem('hospitalName') || 'Hospital'
  const [appointments, setAppointments] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [selected, setSelected] = useState(null)
  const [filterStatus, setFilterStatus] = useState('all')
  const [search, setSearch] = useState('')

  const fetchAppointments = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const token = localStorage.getItem('hospitalToken')
      const res = await fetch(`${API_ROOT}/appointments/hospital`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      const data = await res.json()
      if (data.success) {
        setAppointments(data.appointments)
      } else {
        setError(data.message || 'Failed to load appointments')
      }
    } catch (err) {
      setError('Could not connect to server. Is the backend running?')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchAppointments() }, [fetchAppointments])

  const handleStatusChange = (id, newStatus) => {
    setAppointments(prev => prev.map(a => a._id === id ? { ...a, status: newStatus } : a))
    if (selected?._id === id) setSelected(prev => ({ ...prev, status: newStatus }))
  }

  const filtered = appointments.filter(a => {
    const matchStatus = filterStatus === 'all' || a.status === filterStatus
    const name = a.userId?.name?.toLowerCase() || ''
    const reason = a.reason?.toLowerCase() || ''
    const matchSearch = !search || name.includes(search.toLowerCase()) || reason.includes(search.toLowerCase())
    return matchStatus && matchSearch
  })

  // Stats
  const stats = {
    total: appointments.length,
    pending: appointments.filter(a => a.status === 'pending').length,
    confirmed: appointments.filter(a => a.status === 'confirmed').length,
    completed: appointments.filter(a => a.status === 'completed').length,
  }

  return (
    <div className="dashboard-container">
      {/* ... header ... */}
      <div className="dashboard-header">
        <div className="header-left">
          <h1>🏥 {hospitalName}</h1>
          <span className="header-sub">Hospital Dashboard</span>
        </div>
        <div className="header-right">
          <button onClick={fetchAppointments} className="refresh-btn" title="Refresh">↻ Refresh</button>
          <button onClick={onLogout} className="logout-btn">Logout</button>
        </div>
      </div>

      <div className="dashboard-body">
        <div className="list-panel">
          {/* ... stats, filters, list ... */}
          <div className="stats-row">
            <div className="stat-box"><span className="stat-n">{stats.total}</span><span>Total</span></div>
            <div className="stat-box pending"><span className="stat-n">{stats.pending}</span><span>Pending</span></div>
            <div className="stat-box confirmed"><span className="stat-n">{stats.confirmed}</span><span>Confirmed</span></div>
            <div className="stat-box completed"><span className="stat-n">{stats.completed}</span><span>Completed</span></div>
          </div>

          {/* Filters */}
          <div className="filters-row">
            <input
              type="text"
              placeholder="Search patient or reason…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="search-input"
            />
            <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className="status-filter">
              <option value="all">All Status</option>
              {Object.keys(STATUS_LABELS).map(s => <option key={s} value={s}>{STATUS_LABELS[s]}</option>)}
            </select>
          </div>

          {/* Appointments list */}
          {loading ? (
            <div className="loading-state">⏳ Loading appointments…</div>
          ) : error ? (
            <div className="error-state">⚠️ {error}</div>
          ) : filtered.length === 0 ? (
            <div className="empty-state">
              <p>📋 No appointments found.</p>
              <small>Appointments booked by patients will appear here.</small>
            </div>
          ) : (
            <div className="appt-list">
              {filtered.map(appt => {
                const colors = STATUS_COLORS[appt.status]
                const isSelected = selected?._id === appt._id
                return (
                  <div
                    key={appt._id}
                    className={`appt-card ${isSelected ? 'selected' : ''}`}
                    onClick={() => setSelected(isSelected ? null : appt)}
                  >
                    <div className="appt-card-top">
                      <span className="patient-name">{appt.userId?.name || 'Unknown Patient'}</span>
                      <span className="status-chip" style={{ background: colors.bg, color: colors.text, borderColor: colors.border }}>
                        {STATUS_LABELS[appt.status]}
                      </span>
                    </div>
                    <div className="appt-card-mid">
                      <span>📅 {new Date(appt.appointmentDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                      <span>🕐 {appt.appointmentTime}</span>
                    </div>
                    {appt.reason && <p className="appt-reason">"{appt.reason}"</p>}
                    {appt.chatContext?.length > 0 && (
                      <span className="chat-badge">💬 {appt.chatContext.length} chat msgs</span>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>

        <div className={`main-content ${selected ? 'visible' : ''}`}>
          {selected ? (
            <>
              <div className="detail-wrapper">
                <AppointmentDetail
                  appt={selected}
                  onClose={() => setSelected(null)}
                  onStatusChange={handleStatusChange}
                />
              </div>
              <div className="chat-wrapper">
                {selected.chatContext && selected.chatContext.length > 0 ? (
                  <section className="detail-section chat-section">
                    <h3>💬 AI Health Chat ({selected.chatContext.length} messages)</h3>
                    <p className="chat-note">Chat submitted by patient at booking time for doctor reference.</p>
                    <div className="chat-thread">
                      {[...selected.chatContext]
                        .sort((a, b) => {
                          const tDiff = new Date(a.timestamp) - new Date(b.timestamp);
                          if (tDiff !== 0) return tDiff;
                          return (a._id || '') < (b._id || '') ? -1 : 1;
                        })
                        .map((msg, i) => <ChatBubble key={i} msg={msg} />)
                      }
                    </div>
                  </section>
                ) : (
                  <section className="detail-section">
                    <h3>💬 AI Health Chat</h3>
                    <p className="empty-note">No chat history was attached to this appointment.</p>
                  </section>
                )}
              </div>
            </>
          ) : (
            <div className="detail-placeholder">
              <span>👈</span>
              <p>Select an appointment to view patient details and chat history</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Dashboard
