import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import './BookAppointment.css'

const API_URL = 'http://localhost:3001/api/appointments'

function BookAppointment({ hospital, onClose, onSuccess }) {
  const { token } = useAuth()

  // Today's date string for the min attribute of date input
  const todayStr = new Date().toISOString().split('T')[0]

  const [form, setForm] = useState({
    appointmentDate: '',
    appointmentTime: '',
    reason: '',
    includeChatHistory: true
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Close on ESC
  useEffect(() => {
    const handleEsc = (e) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', handleEsc)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', handleEsc)
      document.body.style.overflow = 'unset'
    }
  }, [onClose])

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setForm((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (!form.appointmentDate || !form.appointmentTime) {
      setError('Please select both a date and time.')
      return
    }

    // Validate date is not in the past
    const chosen = new Date(`${form.appointmentDate}T${form.appointmentTime}`)
    if (chosen < new Date()) {
      setError('Please choose a future date and time.')
      return
    }

    setLoading(true)
    try {
      const res = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          hospitalId: hospital.id || hospital._id || hospital.hospitalId,
          hospitalName: hospital.name || hospital.hospitalName,
          hospitalAddress: hospital.address || '',
          hospitalPhone: hospital.phone !== 'N/A' ? hospital.phone : '',
          hospitalEmail: hospital.email || '',
          appointmentDate: form.appointmentDate,
          appointmentTime: form.appointmentTime,
          reason: form.reason,
          includeChatHistory: form.includeChatHistory
        })
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.message || 'Failed to book appointment')
      }

      onSuccess(data.appointment)
    } catch (err) {
      setError(err.message || 'Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  // Generate time slot options every 30 minutes
  const timeSlots = []
  for (let h = 0; h < 24; h++) {
    for (let m = 0; m < 60; m += 30) {
      const hh = String(h).padStart(2, '0')
      const mm = String(m).padStart(2, '0')
      const ampm = h < 12 ? 'AM' : 'PM'
      const hour12 = h === 0 ? 12 : h > 12 ? h - 12 : h
      const label = `${String(hour12).padStart(2, '0')}:${mm} ${ampm}`
      timeSlots.push({ value: `${hh}:${mm}`, label })
    }
  }

  return (
    <div className="ba-overlay" onClick={onClose}>
      <div className="ba-modal" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="ba-header">
          <div className="ba-header-info">
            <span className="ba-icon">📅</span>
            <div>
              <h2>Book Appointment</h2>
              <p className="ba-hospital-name">{hospital.name || hospital.hospitalName}</p>
            </div>
          </div>
          <button className="ba-close" onClick={onClose} aria-label="Close">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        {/* Hospital summary */}
        <div className="ba-hospital-summary">
          {hospital.address && (
            <span className="ba-detail">📍 {hospital.address}</span>
          )}
          {hospital.phone && hospital.phone !== 'N/A' && (
            <span className="ba-detail">📞 {hospital.phone}</span>
          )}
        </div>

        {/* Form */}
        <form className="ba-form" onSubmit={handleSubmit}>
          <div className="ba-row">
            <div className="ba-field">
              <label htmlFor="appointmentDate">Appointment Date <span className="ba-required">*</span></label>
              <input
                type="date"
                id="appointmentDate"
                name="appointmentDate"
                min={todayStr}
                value={form.appointmentDate}
                onChange={handleChange}
                required
              />
            </div>
            <div className="ba-field">
              <label htmlFor="appointmentTime">Appointment Time <span className="ba-required">*</span></label>
              <select
                id="appointmentTime"
                name="appointmentTime"
                value={form.appointmentTime}
                onChange={handleChange}
                required
              >
                <option value="">Select a time</option>
                {timeSlots.map((slot) => (
                  <option key={slot.value} value={slot.value}>{slot.label}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="ba-field">
            <label htmlFor="reason">Reason / Chief Complaint</label>
            <textarea
              id="reason"
              name="reason"
              rows={3}
              placeholder="Briefly describe your symptoms or reason for visit..."
              value={form.reason}
              onChange={handleChange}
            />
          </div>

          <label className="ba-checkbox-label">
            <input
              type="checkbox"
              name="includeChatHistory"
              checked={form.includeChatHistory}
              onChange={handleChange}
            />
            <span>Attach my recent AI health chat for doctor reference</span>
          </label>

          {error && (
            <div className="ba-error">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"/>
                <line x1="12" y1="8" x2="12" y2="12"/>
                <line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
              {error}
            </div>
          )}

          <div className="ba-actions">
            <button type="button" className="ba-btn-cancel" onClick={onClose} disabled={loading}>
              Cancel
            </button>
            <button type="submit" className="ba-btn-submit" disabled={loading}>
              {loading ? (
                <>
                  <span className="ba-spinner" />
                  Booking...
                </>
              ) : (
                <>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01"/>
                  </svg>
                  Confirm Appointment
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default BookAppointment
