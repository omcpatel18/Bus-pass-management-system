# 🚌 BusPassPro — Bus Pass Management System
### Final Year Project | Python (Django) + React

---

## 📋 Project Overview

BusPassPro is a full-stack, production-ready College Bus Pass Management System featuring:
- **Digital QR Pass Wallet** — encrypted, tamper-proof QR codes
- **Real-time Bus Tracking** — WebSocket-powered live GPS
- **Online Payments** — Razorpay integration (UPI, cards, wallets)
- **AI Route Optimizer** — NetworkX graph + ML demand prediction
- **Three Role Portals** — Student, Admin, Conductor

---

## 🏗️ Architecture

```
BusPassPro/
├── backend/                        # Django REST Framework
│   ├── config/
│   │   ├── settings.py             # Full Django config (JWT, Redis, Channels)
│   │   ├── urls.py                 # Master URL router
│   │   └── asgi.py                 # WebSocket + HTTP via ASGI
│   ├── apps/
│   │   ├── users/                  # Custom User model + OTP auth
│   │   │   ├── models.py           # User, StudentProfile, OTPVerification
│   │   │   ├── serializers.py      # Register, Login, Profile
│   │   │   ├── views.py            # Auth endpoints
│   │   │   └── urls.py
│   │   ├── passes/                 # Core pass management
│   │   │   ├── models.py           # Route, PassApplication, BusPass, ScanLog
│   │   │   ├── serializers.py
│   │   │   ├── views.py            # Apply, Approve, QR Scan
│   │   │   └── urls.py
│   │   ├── payments/               # Razorpay integration
│   │   │   └── views.py            # Create order, Verify signature
│   │   ├── buses/                  # Real-time tracking
│   │   │   ├── models.py           # Bus, BusLocation, BusSchedule
│   │   │   ├── consumers.py        # WebSocket consumer
│   │   │   └── routing.py          # WS URL patterns
│   │   ├── ai_engine/              # ML + optimization
│   │   │   ├── engine.py           # RouteOptimizer + DemandPredictor
│   │   │   └── views.py            # API endpoints
│   │   └── notifications/          # Email/SMS alerts
│   └── requirements.txt
├── frontend/                       # React + Tailwind
│   └── src/
│       ├── components/
│       │   ├── common/             # Reusable UI components
│       │   ├── student/            # QR Pass Card, Apply Form
│       │   ├── admin/              # Dashboard, Application Manager
│       │   └── conductor/          # QR Scanner
│       ├── pages/
│       ├── hooks/                  # useWebSocket, useAuth, usePass
│       ├── services/               # API service layer
│       └── store/                  # State management
├── ml_model/
│   ├── models/                     # Trained model files (.pkl)
│   ├── notebooks/                  # Jupyter notebooks for training
│   └── data/                       # Training datasets
└── docs/
    └── README.md
```

---

## 🚀 Setup Instructions

### Backend Setup

```bash
# 1. Clone and navigate
git clone <repo-url> && cd buspasspro/backend

# 2. Create virtual environment
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# 3. Install dependencies
pip install -r requirements.txt

# 4. Set up environment variables (create .env file)
cp .env.example .env
# Edit .env with your DB, Redis, Razorpay credentials

# 5. Run migrations
python manage.py makemigrations
python manage.py migrate

# 6. Create superuser (admin)
python manage.py createsuperuser

# 7. Start server (with WebSocket support)
daphne -b 0.0.0.0 -p 8000 config.asgi:application
```

### Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

### Docker (Recommended)

```bash
docker-compose up --build
```

---

## 🔌 API Endpoints

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/auth/register/` | Student registration |
| POST | `/api/v1/auth/login/` | JWT login |
| POST | `/api/v1/auth/logout/` | Token blacklist |
| POST | `/api/v1/auth/send-otp/` | Send email OTP |
| POST | `/api/v1/auth/verify-otp/` | Verify OTP |
| GET/PUT | `/api/v1/auth/profile/` | Get/update profile |

### Passes
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/passes/routes/` | List all routes |
| POST | `/api/v1/passes/applications/` | Apply for pass |
| POST | `/api/v1/passes/applications/{id}/approve/` | Admin approve |
| POST | `/api/v1/passes/applications/{id}/reject/` | Admin reject |
| GET | `/api/v1/passes/my-passes/` | Student's passes |
| GET | `/api/v1/passes/my-passes/{id}/qr/` | Get QR code |
| POST | `/api/v1/passes/scan/` | Conductor QR scan |

### Payments
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/payments/create-order/` | Create Razorpay order |
| POST | `/api/v1/payments/verify/` | Verify payment |

### AI Engine
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/ai/optimize-route/` | Find optimal route |
| GET | `/api/v1/ai/demand/{route_id}/` | Current demand prediction |
| GET | `/api/v1/ai/forecast/{route_id}/` | 7-day forecast |
| GET | `/api/v1/ai/stops/` | All available stops |

### WebSocket
```
ws://localhost:8000/ws/buses/track/                  # All buses
ws://localhost:8000/ws/buses/track/{route_id}/       # By route
```

---

## 🤖 AI Features Explained

### 1. Route Optimizer (NetworkX)
- Builds a directed graph of all bus routes and stops
- Uses Dijkstra's algorithm to find shortest path
- Optimizes for: distance / fare / number of stops
- Returns: path, estimated fare, duration

### 2. Demand Predictor (Random Forest)
- Features: hour, day of week, month, exam season flag, route ID
- Trained on historical ridership data (synthetic + real)
- Predicts passenger count for any route + time
- Classifies demand as: Low / Medium / High
- Powers the admin dashboard demand heatmap

---

## 🔐 Security Features

- **JWT Authentication** with refresh token rotation
- **HMAC-signed QR codes** — tamper-proof and verifiable offline
- **Razorpay signature verification** — prevents payment fraud
- **OTP email verification** for new accounts
- **Role-based access control** (Student / Admin / Conductor)

---

## 📱 Features by Role

### 🎓 Student Portal
- Register with college email + profile
- Browse and apply for bus pass
- Pay online via Razorpay
- Digital QR code wallet
- Track live bus location
- AI-powered route suggestions
- Renewal reminders

### ⚙️ Admin Dashboard
- Approve/reject applications
- Manage routes and buses
- View analytics and demand forecast
- Revenue reports
- Bulk pass management

### 🔍 Conductor App
- Scan QR codes (camera or upload)
- Instant pass verification
- Scan history log
- Works offline for QR verification

---

## 🛠 Tech Stack

| Layer | Technology |
|-------|-----------|
| Backend API | Django 4.2 + DRF |
| WebSockets | Django Channels 4 + Redis |
| Database | PostgreSQL |
| Cache | Redis |
| Authentication | JWT (SimpleJWT) |
| Payments | Razorpay |
| QR Codes | qrcode + HMAC-SHA256 |
| AI/ML | scikit-learn + NetworkX |
| Frontend | React 18 + Tailwind CSS |
| API Docs | drf-spectacular (Swagger) |
| Deployment | Docker + Daphne |

---

## 👥 Team Roles Suggestion

| Role | Responsibilities |
|------|-----------------|
| Full Stack Lead | Django setup, API design, React architecture |
| Backend Dev | Models, views, payment integration |
| Frontend Dev | React UI, QR display, real-time tracking |
| ML Engineer | AI engine, demand prediction model |
| DevOps | Docker, deployment, CI/CD |

---

*Built with ❤️ as Final Year Project | BusPassPro v1.0*
