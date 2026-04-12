# BusPassPro — Public City Transit System

BusPassPro is a premium public transit pass management system designed with an "Indian Transit Brutalism × Editorial Magazine" aesthetic. It manages city-wide student, passenger, senior, and corporate passes.

## Features
- **Passenger Types:** General, Student (30% off), Senior Citizen (50% off), Corporate (15% off).
- **Routes & Passes:** R1 Red Line, R2 Blue Line, R3 Green Line. Daily, Weekly, Monthly, Quarterly, and Annual passes.
- **Secure Payments (Razorpay):** End-to-end integration for pass purchases, renewals, and admin refunding.
- **Micro-Animations:** Real-time route tracking, particle maps, spring UI curves.
- **Robust Staff Portals:** Passenger, Admin, and Conductor interfaces.

## Payment Testing (Razorpay)

The payment flow leverages **Razorpay Test Mode**. Test it safely using Razorpay's dummy cards:
- **Test Card Number:** `4111 1111 1111 1111`
- **Expiry:** Any future date (e.g. `12/28`)
- **CVV:** Any 3 digits (e.g. `123`)
- **OTP (for simulated 3D Secure):** Enter any OTP or simulate Success/Failure from the test bank page.

Make sure to grab your test keys from the [Razorpay Dashboard](https://dashboard.razorpay.com/) and place them in the `.env` files for both frontend and backend.

## Getting Started

1. **Backend Configuration:**
    ```bash
    cd backend
    python -m venv venv
    source venv/Scripts/activate # Windows
    pip install -r requirements.txt
    python manage.py migrate
    python manage.py runserver
    ```
2. **Frontend Configuration:**
    ```bash
    cd frontend
    npm install
    npm run dev
    ```
