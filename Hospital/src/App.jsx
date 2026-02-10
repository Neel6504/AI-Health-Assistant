import { useState } from 'react'
import Login from './components/Login'
import Signup from './components/Signup'
import Dashboard from './components/Dashboard'
import './App.css'

function App() {
  const [currentView, setCurrentView] = useState('login') // 'login', 'signup', 'dashboard'
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  const handleLoginSuccess = () => {
    setIsAuthenticated(true)
    setCurrentView('dashboard')
  }

  const handleSignupSuccess = () => {
    setCurrentView('login')
  }

  const handleLogout = () => {
    setIsAuthenticated(false)
    setCurrentView('login')
  }

  const toggleAuth = () => {
    setCurrentView(currentView === 'login' ? 'signup' : 'login')
  }

  if (isAuthenticated && currentView === 'dashboard') {
    return <Dashboard onLogout={handleLogout} />
  }

  if (currentView === 'signup') {
    return (
      <Signup 
        onToggleAuth={toggleAuth}
        onSignupSuccess={handleSignupSuccess}
      />
    )
  }

  return (
    <Login 
      onToggleAuth={toggleAuth}
      onLoginSuccess={handleLoginSuccess}
    />
  )
}

export default App
