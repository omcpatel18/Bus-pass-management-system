# 🚕 NEARBY TAXI FEATURE — DOCUMENTATION

## Overview
The Nearby Taxi feature allows students to find and book taxis near their current location. It integrates geolocation, distance calculation, and a booking workflow into the BusPassPro app.

---

## 📋 WHAT WAS BUILT

### **Backend (Django - Python)**

#### 1. **Models** (`apps/taxis/models.py`)
- **`Taxi`** — Stores taxi driver info, vehicle details, ratings, and trip count
- **`TaxiLocation`** — Real-time location tracking of taxis (latitude, longitude, availability)
- **`TaxiBooking`** — Student booking requests with status tracking (requested → accepted → completed)

#### 2. **API Endpoints** (`apps/taxis/views.py`)

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `GET /api/v1/taxis/taxis/nearby/` | GET | Find taxis within radius (params: `lat`, `lng`, `radius`) |
| `GET /api/v1/taxis/taxis/locations/` | GET | Get latest locations of all active taxis |
| `GET /api/v1/taxis/bookings/` | GET | List student's bookings |
| `POST /api/v1/taxis/bookings/` | POST | Create a booking request |
| `POST /api/v1/taxis/bookings/{id}/accept/` | POST | Accept a booking |
| `POST /api/v1/taxis/bookings/{id}/cancel/` | POST | Cancel a booking |

#### 3. **Distance Calculation**
Uses **Haversine formula** to calculate real distances between user and taxis (in kilometers).

#### 4. **ETA Calculation**
Estimates arrival time assuming 30 km/h average speed.

---

### **Frontend (React - JavaScript)**

#### 1. **TaxiService** (`frontend/src/services/taxiService.js`)
- Handles all API calls to the backend
- Methods: `getNearbyTaxis()`, `createBooking()`, `cancelBooking()`, etc.

#### 2. **NearbyTaxis Screen** (`frontend/src/screens/NearbyTaxis.jsx`)
- **Geolocation**: Uses browser's `navigator.geolocation` to get user's current position
- **Taxi List**: Shows available taxis with:
  - Driver name, phone, vehicle type
  - Rating (out of 5)
  - Distance away & ETA
  - All sorted by distance
- **Booking Panel**: 
  - Select pickup location (auto-filled with current location)
  - Optional dropoff location
  - Confirm booking
- **My Bookings**: Shows active bookings with:
  - Booking ID and date
  - Taxi details (if accepted)
  - Pickup/dropoff locations
  - Status badge (requested, accepted, ongoing, etc.)
  - Cancel button (if not completed)

#### 3. **Student Navigation**
Added "TAXIS" link to student nav bar in `App.jsx` between "BUS MAP" and "PROFILE"

---

## 🚀 QUICK START

### **Step 1: Seed Sample Data**

In terminal, from backend folder:
```bash
./venv/Scripts/activate
python manage.py shell
```

Then paste the contents of `seed_taxis.py` and run it.

Or directly:
```bash
python manage.py shell < seed_taxis.py
```

This creates 5 sample taxis with locations for testing.

### **Step 2: Start Backend**

```bash
./venv/Scripts/activate
python manage.py runserver
```

The API will be running at `http://localhost:8000/api/v1/taxis/`

### **Step 3: Start Frontend**

From frontend folder:
```bash
npm run dev
```

Open `http://localhost:5173` and login as a student.

### **Step 4: Navigate to Taxis**

Click "TAXIS" in the student nav. Allow browser geolocation access → See nearby taxis → Select and book!

---

## 🎯 FEATURES IN DETAIL

### **Finding Nearby Taxis**
1. App gets your GPS location automatically
2. Searches within radius (default 5km, adjustable)
3. Shows all available taxis sorted by distance
4. Displays real-time data with ETA estimates

### **Booking a Taxi**
1. Click "Book This Taxi" on any taxi card
2. Enter/confirm pickup location (auto-filled)
3. Optionally add dropoff location
4. Confirm booking
5. Booking request sent to backend with "requested" status

### **Managing Bookings**
- View all your active bookings in the right panel
- See booking details and assigned taxi info
- Cancel bookings that are still "requested" or "accepted"
- Completed/cancelled bookings remain visible for history

### **Admin Controls** (Future Enhancement)
Admins can:
- View all bookings (not just their own)
- Accept/reject booking requests
- Manage taxi fleet and drivers

---

## 📦 FILE STRUCTURE

```
backend/
├── apps/taxis/
│   ├── __init__.py
│   ├── admin.py              # Django admin registration
│   ├── apps.py               # App configuration
│   ├── models.py             # Taxi, TaxiLocation, TaxiBooking
│   ├── serializers.py        # REST serializers
│   ├── views.py              # API viewsets & logic
│   ├── urls.py               # URL routing
│   └── migrations/
│       ├── __init__.py
│       └── 0001_initial.py   # Initial migration
├── config/
│   ├── settings.py           # Added 'apps.taxis' to INSTALLED_APPS
│   └── urls.py               # Added taxis URLs: /api/v1/taxis/
└── seed_taxis.py             # Sample data for testing

frontend/
├── src/
│   ├── services/
│   │   └── taxiService.js    # API client for taxi endpoints
│   ├── screens/
│   │   └── NearbyTaxis.jsx   # Main taxis UI component
│   └── App.jsx               # Added NearbyTaxis to nav & routing
```

---

## 🔧 KEY TECHNOLOGIES

- **Backend**: Django REST Framework, Haversine distance formula, PostGIS (optional)
- **Frontend**: React hooks (useState, useEffect), Geolocation API, Tailwind CSS
- **Database**: PostgreSQL (Taxi, TaxiLocation, TaxiBooking models)

---

## 🧪 TESTING THE FEATURE

### **Test Scenario 1: Find Nearby Taxis**
1. Go to TAXIS screen
2. Allow geolocation
3. Should see 3-5 taxis within 5km
4. Adjust radius slider to see more/fewer results

### **Test Scenario 2: Book a Taxi**
1. Click on a taxi card (it highlights)
2. Click "Book This Taxi"
3. Confirm pickup location or modify it
4. Add optional dropoff location
5. Click "Confirm Booking"
6. Should see booking in "My Bookings" with "requested" status

### **Test Scenario 3: Cancel Booking**
1. In "My Bookings", find a booking with "requested" status
2. Click "Cancel Booking"
3. Confirm cancellation
4. Booking should disappear or show "cancelled" status

---

## 📈 FUTURE ENHANCEMENTS

1. **Real-time Updates** — Use WebSocket (already set up in project) for live taxi location tracking
2. **Map Integration** — Google Maps or Leaflet to show taxis on a map
3. **Ratings & Reviews** — Students rate taxis after completing rides
4. **Payment Integration** — Link to Razorpay for taxi fare payment
5. **Driver App** — Drivers can accept/reject bookings and track routes
6. **Notifications** — Firebase push notifications for booking status updates
7. **Waypoint Routing** — Use Google Directions API for optimal routes
8. **Fare Estimation** — Calculate expected fare based on distance

---

## 🐛 TROUBLESHOOTING

### **"No taxis found"**
- Check that sample data was seeded (see Step 1)
- Verify backend is running and migrations were applied
- Check browser geolocation permissions

### **"Could not get your location"**
- Ensure HTTPS or localhost
- Check browser geolocation settings (allow permission)
- Test with manual lat/lng in browser console

### **API errors**
- Verify `http://localhost:8000` responds
- Check `settings.py` has `'apps.taxis'` in INSTALLED_APPS
- Check `urls.py` has taxis URLs registered
- Run migrations: `python manage.py migrate taxis`

---

## 📞 API RESPONSE EXAMPLES

### **GET /api/v1/taxis/taxis/nearby/?lat=13.0827&lng=80.2707&radius=5**
```json
{
  "count": 2,
  "results": [
    {
      "id": 1,
      "driver_name": "Rajesh Kumar",
      "driver_phone": "+91 9876543210",
      "vehicle_type": "sedan",
      "vehicle_number": "KA-01-TXI-001",
      "rating": 4.8,
      "total_trips": 250,
      "is_active": true,
      "latest_location": {
        "latitude": 13.0831,
        "longitude": 80.2710,
        "stop_name": "IT Hub - Whitefield"
      },
      "distance_km": 0.45,
      "eta_minutes": 1
    }
  ]
}
```

### **POST /api/v1/taxis/bookings/**
```json
{
  "pickup_lat": 13.0827,
  "pickup_lng": 80.2707,
  "pickup_name": "College Main Gate",
  "dropoff_lat": 13.0832,
  "dropoff_lng": 80.2705,
  "dropoff_name": "IT Hub"
}
```

Response:
```json
{
  "id": 1,
  "status": "requested",
  "taxi": 1,
  "created_at": "2026-03-15T10:30:00Z"
}
```

---

## ✅ DEPLOYMENT CHECKLIST

- [ ] Run migrations on production: `python manage.py migrate taxis`
- [ ] Add real taxi data to database (not just sample data)
- [ ] Enable HTTPS (required for geolocation)
- [ ] Set `ALLOWED_HOSTS` in settings.py
- [ ] Configure production database (PostgreSQL)
- [ ] Test all API endpoints with Postman/curl
- [ ] Test frontend on multiple browsers
- [ ] Create admin panel for taxi management
- [ ] Set up monitoring for API performance

---

Built with ❤️ for BusPassPro FYP
