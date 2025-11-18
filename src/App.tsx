import { useState, useEffect } from 'react'
import Login from './components/Login'
import Signup from './components/Signup'
import Dashboard from './components/Dashboard'
import AdminDashboard from './components/AdminDashboard'
import SuccessMessage from './components/SuccessMessage'

type View = 'login' | 'signup' | 'dashboard' | 'admin'

function App() {
  const [currentView, setCurrentView] = useState<View>('login')
  const [showSuccess, setShowSuccess] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')

  useEffect(() => {
    // Check if user is already logged in
    const currentUser = localStorage.getItem('currentUser')
    const isAdmin = localStorage.getItem('isAdmin')
    if (currentUser) {
      if (isAdmin === 'true') {
        setCurrentView('admin')
      } else {
        setCurrentView('dashboard')
      }
    }
  }, [])

  const handleLoginSuccess = () => {
    const isAdmin = localStorage.getItem('isAdmin')
    if (isAdmin === 'true') {
      setCurrentView('admin')
    } else {
      setSuccessMessage('Thank you! You have successfully logged in.')
      setShowSuccess(true)
    }
  }

  const handleSignupSuccess = () => {
    setSuccessMessage('Thank you! Your account has been created successfully.')
    setShowSuccess(true)
  }

  const handleSuccessClose = () => {
    setShowSuccess(false)
    setCurrentView('dashboard')
  }

  const handleLogout = () => {
    localStorage.removeItem('currentUser')
    localStorage.removeItem('isAdmin')
    setCurrentView('login')
  }

  return (
    <>
      {currentView === 'login' && (
        <Login
          onSwitchToSignup={() => setCurrentView('signup')}
          onLoginSuccess={handleLoginSuccess}
        />
      )}
      {currentView === 'signup' && (
        <Signup
          onSwitchToLogin={() => setCurrentView('login')}
          onSignupSuccess={handleSignupSuccess}
        />
      )}
      {currentView === 'dashboard' && <Dashboard onLogout={handleLogout} />}
      {currentView === 'admin' && <AdminDashboard onLogout={handleLogout} />}
      {showSuccess && (
        <SuccessMessage
          message={successMessage}
          onClose={handleSuccessClose}
        />
      )}
    </>
  )
}

export default App

