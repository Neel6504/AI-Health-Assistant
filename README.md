# AI Health Assistant

Full-stack AI healthcare assistant with:

- User-facing AI symptom chat
- Nearby hospital discovery
- Hospital registration and management dashboard
- Appointment booking workflow
- Emergency symptom detection
- Multi-language support (English, Hindi, Gujarati)

## Project Structure

- `User/` : Patient-facing frontend (React + Vite)
- `Hospital/` : Hospital-facing frontend (React + Vite)
- `Hospital/backend/` : Node.js + Express + MongoDB API

## Implemented Functionality

### 1. AI Medical Chat (User App)

- Groq-powered medical interview flow
- Structured assessment responses
- Emergency pattern detection with warning prompts
- Chat history persistence for authenticated users
- Guest session capture and migration after login

### 2. Nearby Hospitals (User App)

- Geolocation-based nearby search
- Uses registered hospitals from backend database
- Distance sorting and open/closed status
- Detailed hospital info card with contact and services
- Google Maps direction handoff

### 3. Hospital Authentication & Onboarding (Hospital App)

- Hospital register/login
- Multi-step registration form
- Captures address, coordinates, services, admin info
- Includes operating days and operating hours setup
- Step navigation with Next/Previous controls

### 4. Schedule-Aware Appointment Booking

- Appointments can be booked only for today + next 2 days
- Date/time validated in backend (not only UI)
- Time slots shown based on selected hospital operating hours
- Closed days block slot selection
- Same-day past slots are filtered and rejected

### 5. Hospital Dashboard

- Hospital views incoming appointments
- Filter and update appointment statuses
- Review patient details and chat context snapshot

### 6. Localization

- Language selector dropdown (EN / HI / GU)
- Gujarati support added to chat and nearby-hospital flows
- Language-aware system prompts for AI output style

### 7. Deployment Readiness

- Frontends configured for Vercel (SPA rewrites)
- Backend configured for Render
- Environment-driven API base URLs
- CORS configured for comma-separated frontend origins

## Tech Stack

- Frontend: React 19 + Vite
- Backend: Node.js + Express
- Database: MongoDB Atlas + Mongoose
- AI: Groq (Llama 3.3 70B)
- 3D UI: Three.js + React Three Fiber + Drei

## Local Development

### Prerequisites

- Node.js 18+
- MongoDB Atlas URI (or local MongoDB)

### 1) Install dependencies

```bash
cd User && npm install
cd ../Hospital && npm install
cd backend && npm install
```

### 2) Configure environment variables

Use the provided examples:

- `User/.env.example`
- `Hospital/.env.example`
- `Hospital/backend/.env.example`

### 3) Run apps

Backend:

```bash
cd Hospital/backend
npm run dev
```

User frontend:

```bash
cd User
npm run dev
```

Hospital frontend:

```bash
cd Hospital
npm run dev
```

## Deployment

- Backend: Render
- Frontends: Vercel (two separate projects, one for `User`, one for `Hospital`)

Detailed deployment steps are in `DEPLOYMENT.md`.

## Safety Note

This system is for informational support only and does not replace professional medical diagnosis or emergency care.

