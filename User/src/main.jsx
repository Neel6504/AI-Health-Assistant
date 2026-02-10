import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import './index.css'
import App from './App.jsx'
import NearbyHospitals from './pages/NearbyHospitals.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/nearby-hospitals" element={<NearbyHospitals />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>,
)
