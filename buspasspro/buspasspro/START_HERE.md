# BusPassPro - START HERE

This guide is the fastest way to run the current project on a new laptop/PC.

## 1) Prerequisites

Install these once:

- Python 3.11+ (3.11/3.12 recommended)
- Node.js 18+ (LTS recommended)
- Git (optional, only if you clone from repository)

Optional services:

- PostgreSQL (only if you set `USE_SQLITE=False`)
- Redis (recommended for WebSocket/cache/real-time features)

## 2) Project Structure

Run from the project root (folder containing `backend/` and `frontend/`).

## 3) Backend Setup (Django)

### Windows (PowerShell)

```powershell
cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
Copy-Item .env.example .env -Force
python manage.py migrate
python manage.py runserver 0.0.0.0:8000
```

### macOS/Linux

```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
python manage.py migrate
python manage.py runserver 0.0.0.0:8000
```

Backend runs at `http://localhost:8000`.

Notes:

- By default, backend uses SQLite (`USE_SQLITE=True`).
- Demo users are auto-seeded after migrations when `ENABLE_DEMO_USERS=True`.
- ASGI/Daphne is supported, but `runserver` is recommended for local development.

## 4) Frontend Setup (React + Vite)

Open a second terminal:

### Windows (PowerShell)

```powershell
cd frontend
npm install
Copy-Item .env.example .env -Force
npm run dev
```

### macOS/Linux

```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

Frontend runs at `http://localhost:5173`.

## 5) Login and First Use

- Open app: `http://localhost:5173`
- API docs: `http://localhost:8000/api/docs/`
- Admin panel: `http://localhost:8000/admin/`

Default demo credentials (if enabled):

- Admin: `admin@admin.com` / `12345678`
- Student: `test@example.com` / `12345678`

For production/demo deployment, change all default secrets and passwords.

## 6) Optional Configuration

### Use PostgreSQL instead of SQLite

Edit `backend/.env`:

```env
USE_SQLITE=False
DB_NAME=buspasspro
DB_USER=postgres
DB_PASSWORD=your_password
DB_HOST=localhost
DB_PORT=5432
```

Then run:

```bash
python manage.py migrate
```

### Enable Redis-backed realtime/cache

Set in `backend/.env` (if needed):

```env
REDIS_HOST=127.0.0.1
REDIS_URL=redis://127.0.0.1:6379/1
```

## 7) Daily Restart Commands

Backend terminal:

```powershell
cd buspasspro\buspasspro
.\run_backend.bat
```

Alternative (explicit Python path, no activate needed):

```powershell
cd backend
venv\Scripts\python.exe manage.py runserver 0.0.0.0:8000
```

Frontend terminal:

```powershell
cd frontend
npm run dev
```

## 8) Troubleshooting

- `python` not found: reinstall Python and enable "Add Python to PATH".
- PowerShell blocks venv activate: run `Set-ExecutionPolicy -Scope CurrentUser RemoteSigned` once.
- If startup fails with `CheckConstraint.__init__() got an unexpected keyword argument 'condition'`, you are using an older Django environment. Run `run_backend.bat` from project root so it picks the correct project venv.
- Port busy (`8000`/`5173`): stop old process or change port.
- Postgres auth errors: verify `DB_USER` / `DB_PASSWORD` in `backend/.env`.
- Razorpay errors: set keys in both `backend/.env` and `frontend/.env`.

## 9) Packaging / Transfer Tip

When sharing this project to another machine, include source + config templates (`.env.example`) and exclude local artifacts like `venv/`, `node_modules/`, `db.sqlite3`, `media/`, and caches.
