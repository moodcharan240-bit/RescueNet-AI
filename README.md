# RescueNet AI — initial demonstration shell

**Not an emergency service.** All records are simulated, including reports entered by users. No responders are notified. Do not enter sensitive information.

## Architecture and structure

- `frontend/`: Vite + React, React Router, Tailwind CSS, Lucide, Axios, Leaflet and OpenStreetMap. Five routes: `/`, `/login`, `/admin`, `/citizen`, `/responder`.
- `frontend/src/main.jsx`: reusable shell, pages, demo API client and map. `style.css`: responsive design system.
- `frontend/public/`: generated visual assets.
- `backend/main.py`: FastAPI + Pydantic demo REST API backed by SQLite (`backend/demo.db`, created on first run). Seed incidents are explicitly simulated. Data persists locally between restarts.
- `backend/requirements.txt`: Python dependencies.

## Run locally

Backend:
```sh
cd backend
python3 -m venv .venv
. .venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```
Frontend (another terminal):
```sh
cd frontend
npm install
npm run dev
```
Open http://localhost:5173. Vite proxies `/api` to the backend. API docs: http://localhost:8000/docs. Browser geolocation requires HTTPS or localhost and permission; manual location never generates coordinates. OpenStreetMap tiles and Google Fonts require network access.

## Foundation limitations and next steps

- Sign-in and registration are **demo navigation only**: no accounts, password storage, real authentication, authorization or protected routes. Never deploy this API publicly with sensitive data. Session role is cosmetic and routes are intentionally open to explore.
- Gemini classification, Firebase Auth/Firestore, role enforcement, photo storage, push-based real-time updates, notifications, and operational workflows are **not implemented**. Severity is seeded or `Unclassified`, not an AI prediction. Photo picker is UI only; files are not sent or saved. Timeline is derived from current status, not an audit log.
- Production architecture: Firebase client authentication; FastAPI verifies Firebase ID tokens and checks server-side role claims on every request; Firestore stores incidents and audit logs with least-privilege access; private object storage holds images; Gemini is called only from the backend with validation, timeouts, and human review. Add server-side ownership checks, consent, rate limiting, abuse controls, audit logs and security rules before use.
- Required production configuration (not yet wired): frontend `VITE_FIREBASE_API_KEY`, `VITE_FIREBASE_AUTH_DOMAIN`, `VITE_FIREBASE_PROJECT_ID`, `VITE_FIREBASE_APP_ID`, `VITE_API_BASE_URL`; backend `GEMINI_API_KEY`, Firebase project ID and server-side service-account credentials (or workload identity), `CORS_ORIGINS`. Firebase web configuration is public by design; service-account credentials and Gemini keys must remain server-side. No keys are needed in demo mode.
- Vercel: build `npm run build`, output `dist`, configure SPA rewrite to `index.html` and API forwarding to Render. Render: Python web service, install `backend/requirements.txt`, start `uvicorn main:app --host 0.0.0.0 --port $PORT`, configure CORS and secrets. SQLite on Render's ephemeral filesystem is not durable; migrate to Firestore before deployment. Configure a secure HTTPS origin for GPS.

## Live demo map

The admin and responder maps use Leaflet with OpenStreetMap tiles. The incident list refreshes every 10 seconds while the tab is visible, on return to the tab, and on manual refresh. Markers change with the stored incident status. Only reports with coordinates appear on the map; manual addresses are not geocoded. Seed locations are simulated. Tile service availability and internet access are required. Browser location requires permission and a secure context.
