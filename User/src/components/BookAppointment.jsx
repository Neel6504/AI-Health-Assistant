import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { APPOINTMENTS_API } from '../config/api'
import './BookAppointment.css'

const API_URL = APPOINTMENTS_API
const WEEK_DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

const toMinutes = (time) => {
  if (!time || typeof time !== 'string') return null
  const match = /^([01]\d|2[0-3]):([0-5]\d)$/.exec(time)
  if (!match) return null
  return Number(match[1]) * 60 + Number(match[2])
}

const toLabel = (minutes) => {
  const hour24 = Math.floor(minutes / 60)
  const minute = minutes % 60
  const ampm = hour24 < 12 ? 'AM' : 'PM'
  const hour12 = hour24 === 0 ? 12 : hour24 > 12 ? hour24 - 12 : hour24
  return `${String(hour12).padStart(2, '0')}:${String(minute).padStart(2, '0')} ${ampm}`
}

function BookAppointment({ hospital, onClose, onSuccess }) {
  const { token } = useAuth()

  // Today's date string for the min attribute of date input
  const todayStr = new Date().toISOString().split('T')[0]
  const maxDateObj = new Date()
  maxDateObj.setDate(maxDateObj.getDate() + 2)
  const maxDateStr = maxDateObj.toISOString().split('T')[0]

  const [form, setForm] = useState({
    appointmentDate: '',
    appointmentTime: '',
    reason: '',
    includeChatHistory: true
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const openDays = Array.isArray(hospital.openDays) && hospital.openDays.length > 0
    ? hospital.openDays
    : WEEK_DAYS
  const openingTime = hospital.operatingHours?.openingTime || '09:00'
  const closingTime = hospital.operatingHours?.closingTime || '18:00'

  const selectedDateObj = form.appointmentDate ? new Date(`${form.appointmentDate}T00:00:00`) : null
  const selectedDayName = selectedDateObj ? WEEK_DAYS[selectedDateObj.getDay()] : null
  const isOpenOnSelectedDay = selectedDayName ? openDays.includes(selectedDayName) : true

  const openingMinutes = toMinutes(openingTime)
  const closingMinutes = toMinutes(closingTime)

  const timeSlots = []
  if (openingMinutes !== null && closingMinutes !== null && openingMinutes < closingMinutes) {
    for (let m = openingMinutes; m < closingMinutes; m += 30) {
      const hour = Math.floor(m / 60)
      const minute = m % 60
      timeSlots.push({
        value: `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`,
        label: toLabel(m)
      })
    }
  }

  const filteredSlots = timeSlots.filter((slot) => {
    if (!form.appointmentDate) return true
    const todayLocal = new Date()
    const selected = new Date(`${form.appointmentDate}T00:00:00`)
    const sameDay =
      selected.getFullYear() === todayLocal.getFullYear() &&
      selected.getMonth() === todayLocal.getMonth() &&
      selected.getDate() === todayLocal.getDate()

    if (!sameDay) return true
    const nowMinutes = todayLocal.getHours() * 60 + todayLocal.getMinutes()
    const slotMinutes = toMinutes(slot.value)
    return slotMinutes !== null && slotMinutes > nowMinutes
  })

  useEffect(() => {
    if (!form.appointmentTime) return
    const stillAvailable = filteredSlots.some((slot) => slot.value === form.appointmentTime)
    if (!stillAvailable) {
      setForm((prev) => ({ ...prev, appointmentTime: '' }))
    }
  }, [form.appointmentDate])

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

    if (!isOpenOnSelectedDay) {
      setError(`This hospital is closed on ${selectedDayName}. Please choose another day.`)
      return
    }

    if (selectedDateObj) {
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      const maxAllowed = new Date(today)
      maxAllowed.setDate(maxAllowed.getDate() + 2)
      if (selectedDateObj < today || selectedDateObj > maxAllowed) {
        setError('Appointments are allowed only for today and the next 2 days.')
        return
      }
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
                max={maxDateStr}
                value={form.appointmentDate}
                onChange={handleChange}
                required
              />
              <small className="ba-help-text">Only today and next 2 days are allowed.</small>
            </div>
            <div className="ba-field">
              <label htmlFor="appointmentTime">Appointment Time <span className="ba-required">*</span></label>
              <select
                id="appointmentTime"
                name="appointmentTime"
                value={form.appointmentTime}
                onChange={handleChange}
                disabled={!form.appointmentDate || !isOpenOnSelectedDay}
                required
              >
                {!form.appointmentDate && <option value="">Select date first</option>}
                {form.appointmentDate && !isOpenOnSelectedDay && <option value="">Hospital closed on {selectedDayName}</option>}
                {form.appointmentDate && isOpenOnSelectedDay && <option value="">Select a time</option>}
                {form.appointmentDate && isOpenOnSelectedDay && filteredSlots.map((slot) => (
                  <option key={slot.value} value={slot.value}>{slot.label}</option>
                ))}
              </select>
              {form.appointmentDate && isOpenOnSelectedDay && filteredSlots.length === 0 && (
                <small className="ba-help-text">No available slots for the selected date.</small>
              )}
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
