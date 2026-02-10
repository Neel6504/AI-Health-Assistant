import { useState } from 'react'
import './Auth.css'

function Signup({ onToggleAuth, onSignupSuccess }) {
  const [formData, setFormData] = useState({
    hospitalName: '',
    registrationNumber: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    establishedYear: '',
    hospitalType: '',
    totalBeds: '',
    specializations: '',
    emergencyAvailable: false,
    ambulanceAvailable: false,
    adminName: '',
    adminPosition: '',
    password: '',
    confirmPassword: ''
  })
  const [errors, setErrors] = useState({})
  const [isLoading, setIsLoading] = useState(false)

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }))
    }
  }

  const validateForm = () => {
    const newErrors = {}

    // Basic validations
    if (!formData.hospitalName.trim()) newErrors.hospitalName = 'Hospital name is required'
    if (!formData.registrationNumber.trim()) newErrors.registrationNumber = 'Registration number is required'
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required'
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid'
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone is required'
    } else if (!/^\d{10}$/.test(formData.phone.replace(/\D/g, ''))) {
      newErrors.phone = 'Phone must be 10 digits'
    }

    if (!formData.address.trim()) newErrors.address = 'Address is required'
    if (!formData.city.trim()) newErrors.city = 'City is required'
    if (!formData.state.trim()) newErrors.state = 'State is required'
    
    if (!formData.pincode.trim()) {
      newErrors.pincode = 'Pincode is required'
    } else if (!/^\d{6}$/.test(formData.pincode)) {
      newErrors.pincode = 'Pincode must be 6 digits'
    }

    if (!formData.establishedYear) {
      newErrors.establishedYear = 'Established year is required'
    } else if (formData.establishedYear > new Date().getFullYear()) {
      newErrors.establishedYear = 'Invalid year'
    }

    if (!formData.hospitalType) newErrors.hospitalType = 'Hospital type is required'
    if (!formData.totalBeds) newErrors.totalBeds = 'Total beds is required'
    if (!formData.specializations.trim()) newErrors.specializations = 'Specializations are required'
    if (!formData.adminName.trim()) newErrors.adminName = 'Admin name is required'
    if (!formData.adminPosition.trim()) newErrors.adminPosition = 'Admin position is required'

    if (!formData.password) {
      newErrors.password = 'Password is required'
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters'
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!validateForm()) return

    setIsLoading(true)
    
    try {
      // Remove confirmPassword before sending to backend
      const { confirmPassword, ...hospitalData } = formData
      
      const response = await fetch('http://localhost:5000/api/hospitals/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(hospitalData)
      })

      const data = await response.json()

      if (response.ok && data.success) {
        alert('Hospital registered successfully! Please login.')
        // Optionally store token in localStorage
        if (data.data.token) {
          localStorage.setItem('hospitalToken', data.data.token)
          localStorage.setItem('hospitalId', data.data._id)
          localStorage.setItem('hospitalName', data.data.hospitalName)
        }
        onSignupSuccess()
      } else {
        // Handle error response
        const errorMessage = data.message || 'Registration failed'
        alert(errorMessage)
        
        // If there are validation errors, display them
        if (data.errors && Array.isArray(data.errors)) {
          setErrors({ general: data.errors.join(', ') })
        }
      }
    } catch (error) {
      console.error('Registration error:', error)
      alert('Failed to connect to server. Please make sure the backend is running.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="auth-container">
      <div className="auth-card signup-card">
        <div className="auth-header">
          <h1>🏥 Hospital Registration</h1>
          <p>Register your hospital to manage appointments</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form signup-form">
          {/* Hospital Basic Information */}
          <div className="form-section">
            <h3>Hospital Information</h3>
            
            <div className="form-group">
              <label htmlFor="hospitalName">Hospital Name *</label>
              <input
                type="text"
                id="hospitalName"
                name="hospitalName"
                value={formData.hospitalName}
                onChange={handleChange}
                placeholder="City General Hospital"
                className={errors.hospitalName ? 'error' : ''}
              />
              {errors.hospitalName && <span className="error-message">{errors.hospitalName}</span>}
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="registrationNumber">Registration Number *</label>
                <input
                  type="text"
                  id="registrationNumber"
                  name="registrationNumber"
                  value={formData.registrationNumber}
                  onChange={handleChange}
                  placeholder="REG123456"
                  className={errors.registrationNumber ? 'error' : ''}
                />
                {errors.registrationNumber && <span className="error-message">{errors.registrationNumber}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="establishedYear">Established Year *</label>
                <input
                  type="number"
                  id="establishedYear"
                  name="establishedYear"
                  value={formData.establishedYear}
                  onChange={handleChange}
                  placeholder="2000"
                  min="1800"
                  max={new Date().getFullYear()}
                  className={errors.establishedYear ? 'error' : ''}
                />
                {errors.establishedYear && <span className="error-message">{errors.establishedYear}</span>}
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div className="form-section">
            <h3>Contact Details</h3>
            
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="email">Email Address *</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="contact@hospital.com"
                  className={errors.email ? 'error' : ''}
                />
                {errors.email && <span className="error-message">{errors.email}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="phone">Phone Number *</label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="9876543210"
                  className={errors.phone ? 'error' : ''}
                />
                {errors.phone && <span className="error-message">{errors.phone}</span>}
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="address">Address *</label>
              <textarea
                id="address"
                name="address"
                value={formData.address}
                onChange={handleChange}
                placeholder="123 Main Street, Medical District"
                rows="2"
                className={errors.address ? 'error' : ''}
              />
              {errors.address && <span className="error-message">{errors.address}</span>}
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="city">City *</label>
                <input
                  type="text"
                  id="city"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  placeholder="Mumbai"
                  className={errors.city ? 'error' : ''}
                />
                {errors.city && <span className="error-message">{errors.city}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="state">State *</label>
                <input
                  type="text"
                  id="state"
                  name="state"
                  value={formData.state}
                  onChange={handleChange}
                  placeholder="Maharashtra"
                  className={errors.state ? 'error' : ''}
                />
                {errors.state && <span className="error-message">{errors.state}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="pincode">Pincode *</label>
                <input
                  type="text"
                  id="pincode"
                  name="pincode"
                  value={formData.pincode}
                  onChange={handleChange}
                  placeholder="400001"
                  maxLength="6"
                  className={errors.pincode ? 'error' : ''}
                />
                {errors.pincode && <span className="error-message">{errors.pincode}</span>}
              </div>
            </div>
          </div>

          {/* Hospital Details */}
          <div className="form-section">
            <h3>Hospital Details</h3>
            
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="hospitalType">Hospital Type *</label>
                <select
                  id="hospitalType"
                  name="hospitalType"
                  value={formData.hospitalType}
                  onChange={handleChange}
                  className={errors.hospitalType ? 'error' : ''}
                >
                  <option value="">Select Type</option>
                  <option value="Government">Government Hospital</option>
                  <option value="Private">Private Hospital</option>
                  <option value="Semi-Government">Semi-Government Hospital</option>
                  <option value="Trust">Trust Hospital</option>
                </select>
                {errors.hospitalType && <span className="error-message">{errors.hospitalType}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="totalBeds">Total Beds *</label>
                <input
                  type="number"
                  id="totalBeds"
                  name="totalBeds"
                  value={formData.totalBeds}
                  onChange={handleChange}
                  placeholder="100"
                  min="1"
                  className={errors.totalBeds ? 'error' : ''}
                />
                {errors.totalBeds && <span className="error-message">{errors.totalBeds}</span>}
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="specializations">Specializations *</label>
              <textarea
                id="specializations"
                name="specializations"
                value={formData.specializations}
                onChange={handleChange}
                placeholder="Cardiology, Neurology, Orthopedics, Pediatrics (comma separated)"
                rows="2"
                className={errors.specializations ? 'error' : ''}
              />
              {errors.specializations && <span className="error-message">{errors.specializations}</span>}
            </div>

            <div className="form-group checkbox-group">
              <label>
                <input
                  type="checkbox"
                  name="emergencyAvailable"
                  checked={formData.emergencyAvailable}
                  onChange={handleChange}
                />
                <span>24/7 Emergency Services Available</span>
              </label>
            </div>

            <div className="form-group checkbox-group">
              <label>
                <input
                  type="checkbox"
                  name="ambulanceAvailable"
                  checked={formData.ambulanceAvailable}
                  onChange={handleChange}
                />
                <span>Ambulance Service Available</span>
              </label>
            </div>
          </div>

          {/* Admin Details */}
          <div className="form-section">
            <h3>Administrator Details</h3>
            
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="adminName">Admin Name *</label>
                <input
                  type="text"
                  id="adminName"
                  name="adminName"
                  value={formData.adminName}
                  onChange={handleChange}
                  placeholder="Dr. John Doe"
                  className={errors.adminName ? 'error' : ''}
                />
                {errors.adminName && <span className="error-message">{errors.adminName}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="adminPosition">Position *</label>
                <input
                  type="text"
                  id="adminPosition"
                  name="adminPosition"
                  value={formData.adminPosition}
                  onChange={handleChange}
                  placeholder="Hospital Director"
                  className={errors.adminPosition ? 'error' : ''}
                />
                {errors.adminPosition && <span className="error-message">{errors.adminPosition}</span>}
              </div>
            </div>
          </div>

          {/* Account Security */}
          <div className="form-section">
            <h3>Account Security</h3>
            
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="password">Password *</label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="At least 8 characters"
                  className={errors.password ? 'error' : ''}
                />
                {errors.password && <span className="error-message">{errors.password}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="confirmPassword">Confirm Password *</label>
                <input
                  type="password"
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="Re-enter password"
                  className={errors.confirmPassword ? 'error' : ''}
                />
                {errors.confirmPassword && <span className="error-message">{errors.confirmPassword}</span>}
              </div>
            </div>
          </div>

          <button type="submit" className="auth-button" disabled={isLoading}>
            {isLoading ? 'Registering...' : 'Register Hospital'}
          </button>
        </form>

        <div className="auth-footer">
          <p>
            Already have an account?{' '}
            <button onClick={onToggleAuth} className="toggle-auth-btn">
              Login
            </button>
          </p>
        </div>
      </div>
    </div>
  )
}

export default Signup
