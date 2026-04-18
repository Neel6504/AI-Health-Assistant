# Deployment Guide (Vercel + Render)

This project has:
- User frontend: User
- Hospital frontend: Hospital
- Backend API: Hospital/backend

## 1) Deploy Backend on Render

### Option A: Blueprint (recommended)
1. Push this repository to GitHub.
2. In Render, click New + -> Blueprint.
3. Select your repository.
4. Render will detect render.yaml.
5. Set these required environment variables in Render service:
   - MONGODB_URI
   - JWT_SECRET
   - CORS_ORIGIN
6. For CORS_ORIGIN, use both Vercel domains (comma-separated), example:
   - https://user-app.vercel.app,https://hospital-app.vercel.app
7. Deploy and copy backend URL, example:
   - https://ai-health-assistant-backend.onrender.com

### Option B: Manual Web Service
1. New + -> Web Service
2. Root directory: Hospital/backend
3. Build command: npm install
4. Start command: npm start
5. Set env vars: MONGODB_URI, JWT_SECRET, NODE_ENV=production, CORS_ORIGIN

## 2) Deploy User Frontend on Vercel

1. Import repository in Vercel.
2. Select root directory: User
3. Framework preset: Vite
4. Build command: npm run build
5. Output directory: dist
6. Add environment variables:
   - VITE_API_BASE_URL = https://your-render-backend.onrender.com
   - VITE_GROQ_API_KEY = your Groq key
   - VITE_GOOGLE_PLACES_API_KEY = optional
7. Deploy.

## 3) Deploy Hospital Frontend on Vercel

1. Import same repository again as a second Vercel project.
2. Select root directory: Hospital
3. Framework preset: Vite
4. Build command: npm run build
5. Output directory: dist
6. Add environment variable:
   - VITE_API_BASE_URL = https://your-render-backend.onrender.com
7. Deploy.

## 4) Final CORS Update on Render

After both Vercel apps are live, update backend CORS_ORIGIN in Render with both domains:
- https://your-user-app.vercel.app,https://your-hospital-app.vercel.app

Then redeploy backend.

## 5) Verify

1. Open backend URL in browser and check health response on /.
2. Test user signup/login in User app.
3. Test hospital signup/login in Hospital app.
4. Test nearby hospitals and appointment booking flow.

## Notes

- Vercel routing for SPA is configured via:
  - User/vercel.json
  - Hospital/vercel.json
- Frontend API URLs are environment-driven via VITE_API_BASE_URL.
- Backend CORS now supports comma-separated origins via CORS_ORIGIN.
