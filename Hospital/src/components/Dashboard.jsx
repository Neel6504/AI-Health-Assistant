import './Dashboard.css'

function Dashboard({ onLogout }) {
  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1>🏥 Hospital Dashboard</h1>
        <button onClick={onLogout} className="logout-btn">Logout</button>
      </div>
      
      <div className="dashboard-content">
        <div className="welcome-card">
          <h2>Welcome to Hospital Management System</h2>
          <p>Dashboard features coming soon...</p>
        </div>
      </div>
    </div>
  )
}

export default Dashboard
