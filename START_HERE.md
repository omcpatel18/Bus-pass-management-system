# 🚌 BusPassPro — Setup Guide
## Read this first! Follow every step in order.

---

## WHAT YOU NEED TO INSTALL (one time only)

### 1. Python 3.11
- Go to: https://www.python.org/downloads/
- Download Python 3.11
- Run the installer
- ⚠️ TICK THE BOX: "Add Python to PATH" ← very important!
- Click Install Now

### 2. Node.js
- Go to: https://nodejs.org
- Download LTS version (left button)
- Run installer, click Next → Next → Install

### 3. PostgreSQL (Database)
- Go to: https://www.postgresql.org/download/windows/
- Download and run installer
- Set password to: postgres
- Port: leave as 5432
- Click Next through everything
- At the end, skip Stack Builder

### 4. Redis (Real-time server)
- Go to: https://github.com/microsoftarchive/redis/releases
- Download: Redis-x64-3.0.504.msi
- Run installer, check "Add Redis to PATH"

---

## CREATE THE DATABASE

1. Open pgAdmin (search it in Start Menu)
2. Click: Servers → PostgreSQL → Databases
3. Right-click "Databases" → Create → Database
4. Name: buspasspro
5. Click Save

---

## BACKEND SETUP (Django)

Open VS Code → Open folder "BusPassPro" → Press Ctrl+` to open terminal

Run these commands ONE BY ONE (copy-paste each line):

```
cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
python manage.py makemigrations
python manage.py migrate
python manage.py createsuperuser
```

For createsuperuser:
- Email: admin@college.edu
- Password: Admin@123 (won't show while typing, that's normal)

Then start the backend:
```
daphne -b 0.0.0.0 -p 8000 config.asgi:application
```

✅ You should see: "Starting server at tcp:port=8000"
Keep this terminal open!

---

## FRONTEND SETUP (React)

Open a NEW terminal in VS Code (click the + button near terminal)

```
cd frontend
npm install
npm run dev
```

✅ You should see: "Local: http://localhost:5173/"

---

## OPEN THE APP

Open your browser and go to:
👉 http://localhost:5173

---

## ADD SAMPLE DATA

1. Go to: http://localhost:8000/admin
2. Login: admin@college.edu / Admin@123
3. Click "Routes" → Add Route
   - Name: Route Alpha
   - Source: College Gate
   - Destination: City Center
   - Stops: ["North Campus", "Library Sq"]
   - Distance: 12.5
   - Fare: 450
4. Click Save

Now go back to your app and register as a student!

---

## EVERY TIME YOU RESTART YOUR COMPUTER

You need to run both servers again:

Terminal 1 (Backend):
```
cd Desktop/BusPassPro/backend
venv\Scripts\activate
daphne -b 0.0.0.0 -p 8000 config.asgi:application
```

Terminal 2 (Frontend):
```
cd Desktop/BusPassPro/frontend
npm run dev
```

---

## IF SOMETHING GOES WRONG

| Problem | Fix |
|---------|-----|
| 'python' not recognized | Reinstall Python, tick "Add to PATH" |
| venv not activating | Run: Set-ExecutionPolicy RemoteSigned |
| Database error | Make sure pgAdmin is open & buspasspro DB exists |
| Redis error | Open Services (Win+R → services.msc) → find Redis → Start |
| Port already in use | Restart VS Code |

---

## NEED HELP?
Check the INTEGRATION_GUIDE.env file for full API documentation.
