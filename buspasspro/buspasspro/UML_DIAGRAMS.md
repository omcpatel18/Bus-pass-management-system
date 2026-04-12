# BusPassPro - UML Diagrams

## 1. CLASS DIAGRAM

```
classDiagram
    direction TB

    %% User Module
    class User {
        UUID id
        String email
        String phone
        String role (student/admin/conductor)
        Boolean is_active
        Boolean is_verified
        DateTime created_at
        DateTime updated_at
        +create_user()
        +create_superuser()
    }

    class StudentProfile {
        String student_id
        String full_name
        String gender
        Date date_of_birth
        String department
        Integer year_of_study
        String college_name
        String home_address
        Image profile_photo
        String aadhar_number
        String emergency_contact
    }

    class OTPVerification {
        UUID id
        String otp
        String otp_type (email/phone)
        Boolean is_used
        DateTime created_at
        DateTime expires_at
    }

    %% Routes & Buses
    class Route {
        Integer id
        String name
        String source
        String destination
        List stops
        Float distance_km
        Integer duration_min
        Decimal fare
        Boolean is_active
    }

    class Bus {
        Integer id
        String bus_number
        Integer capacity
        String driver_name
        String driver_phone
        Boolean is_active
    }

    class BusLocation {
        Integer id
        Float latitude
        Float longitude
        Float speed_kmh
        String stop_name
        DateTime timestamp
    }

    class BusSchedule {
        Integer id
        String stop_name
        Time arrival_time
        Integer stop_order
        Boolean is_active
    }

    %% Pass Module
    class PassApplication {
        UUID id
        String duration_type (monthly/quarterly/annual)
        String boarding_stop
        String status (pending/approved/rejected)
        DateTime applied_at
        DateTime reviewed_at
        String rejection_note
        Dict documents
        +apply_for_pass()
        +approve_pass()
        +reject_pass()
    }

    class BusPass {
        UUID id
        String pass_number
        Date valid_from
        Date valid_until
        String status (active/expired/revoked)
        Image qr_code
        String qr_token
        DateTime issued_at
        DateTime last_scanned
        +generate_qr_token()
        +generate_qr_image()
        +is_valid()
    }

    %% Payment Module
    class Payment {
        UUID id
        Decimal amount
        String currency
        String razorpay_order_id
        String razorpay_payment_id
        String razorpay_signature
        String status (pending/success/failed/refunded)
        DateTime created_at
        DateTime paid_at
    }

    %% Notification Module
    class Notification {
        Integer id
        String title
        String message
        String notif_type (email/sms)
        Boolean is_read
        DateTime created_at
        +send_notification()
        +mark_as_read()
    }

    %% AI Engine
    class AIEngine {
        +predict_demand()
        +optimize_routes()
        +forecast_pricing()
    }

    %% Relationships
    User "1" --> "1" StudentProfile : has
    User "1" --> "*" OTPVerification : receives
    User "1" --> "*" PassApplication : submits
    User "1" --> "*" Notification : gets
    User "*" --> "*" PassApplication : reviews

    Route "1" --> "*" Bus : operates
    Route "1" --> "*" PassApplication : for
    Bus "1" --> "*" BusLocation : tracks
    Bus "1" --> "*" BusSchedule : has

    PassApplication "1" --> "1" BusPass : issues
    PassApplication "1" --> "1" Payment : has
    BusPass "1" --> "1" User : belongs_to

```

---

## 2. USE CASE DIAGRAM

```
usecaseDiagram
    actor Student
    actor Admin
    actor Conductor
    actor System

    usecase UC1 as "Register/Login"
    usecase UC2 as "Apply for Bus Pass"
    usecase UC3 as "Upload Documents"
    usecase UC4 as "Make Payment"
    usecase UC5 as "View Pass Status"
    usecase UC6 as "Download Digital Pass"
    usecase UC7 as "View QR Code"
    usecase UC8 as "Scan Pass at Stop"
    
    usecase UC9 as "Review Applications"
    usecase UC10 as "Approve/Reject Pass"
    usecase UC11 as "Manage Routes"
    usecase UC12 as "Manage Buses"
    usecase UC13 as "Send Notifications"
    usecase UC14 as "Generate Reports"
    
    usecase UC15 as "Track Bus Location"
    usecase UC16 as "Validate Pass"
    usecase UC17 as "Record Boarding"
    
    usecase UC18 as "Process Payment"
    usecase UC19 as "Generate Bill"
    usecase UC20 as "Track Order Status"
    usecase UC21 as "Predict Demand"
    usecase UC22 as "Optimize Routes"

    Student --> UC1
    Student --> UC2
    Student --> UC3
    Student --> UC4
    Student --> UC5
    Student --> UC6
    Student --> UC7
    Student --> UC20

    Conductor --> UC15
    Conductor --> UC16
    Conductor --> UC17

    Admin --> UC9
    Admin --> UC10
    Admin --> UC11
    Admin --> UC12
    Admin --> UC13
    Admin --> UC14

    System --> UC18
    System --> UC19
    System --> UC21
    System --> UC22

```

---

## 3. ACTIVITY DIAGRAM - Bus Pass Application Flow

```
activityDiagram
    title Bus Pass Application & Approval Flow

    start([User Starts])
    
    a1: User Registers/Logs In
    a2: Fill Application Form
    a3: Select Route & Duration
    a4: Upload Required Documents
    a5: Review Information
    
    checkout{Confirm Details?}
    
    a6: Generate Payment Order
    a7: Process Payment via Razorpay
    
    payment{Payment Successful?}
    
    failed[Payment Failed]
    retry{Retry?}
    
    a8: Application Submitted
    a9: Admin Reviews Application
    
    ApprovalCheck{All Documents<br/>Valid?}
    
    a10: Generate Bus Pass
    a11: Generate QR Code
    a12: Send Approval Notification
    a13: User Downloads Digital Pass
    active[Pass Activated]
    
    rejected[Application Rejected]
    notify_reject: Send Rejection Notification
    
    end1([Process Complete])
    end2([Process Failed])

    start --> a1
    a1 --> a2
    a2 --> a3
    a3 --> a4
    a4 --> a5
    a5 --> checkout
    
    checkout -->|No| a2
    checkout -->|Yes| a6
    
    a6 --> a7
    a7 --> payment
    
    payment -->|No| failed
    failed --> retry
    retry -->|Yes| a7
    retry -->|No| end2
    
    payment -->|Yes| a8
    a8 --> a9
    a9 --> ApprovalCheck
    
    ApprovalCheck -->|No| rejected
    ApprovalCheck -->|Yes| a10
    
    rejected --> notify_reject
    notify_reject --> end2
    
    a10 --> a11
    a11 --> a12
    a12 --> a13
    a13 --> active
    active --> end1

```

---

## 4. ACTIVITY DIAGRAM - Bus Boarding & Pass Validation

```
activityDiagram
    title Bus Boarding & Pass Validation Flow

    start([Student Arrives at Stop])
    
    b1: Student Waits for Bus
    b2: Bus Arrives at Stop
    b3: Bus Updates Location
    b4: Conductor Scans QR Code
    
    validation{Pass Valid?}
    
    b5: Extract Pass Data
    b6: Verify Expiration Date
    b7: Verify Route Match
    
    invalid_exp[Pass Expired]
    invalid_route[Route Mismatch]
    
    b8: Log Boarding Record
    b9: Update Last Scanned Time
    b10: Grant Bus Access
    b11: Student Boards Bus
    b12: Get Seat Assignment
    
    end_success([Boarding Complete])
    end_fail([Boarding Denied])

    start --> b1
    b1 --> b2
    b2 --> b3
    b3 --> b4
    b4 --> b5
    b5 --> b6
    b6 --> validation
    
    validation -->|No| b7
    b7 --> validation
    
    validation -->|Route Mismatch| invalid_route
    invalid_route --> end_fail
    
    validation -->|Expired| invalid_exp
    invalid_exp --> end_fail
    
    validation -->|Valid| b8
    b8 --> b9
    b9 --> b10
    b10 --> b11
    b11 --> b12
    b12 --> end_success

```

---

## 5. SEQUENCE DIAGRAM - Complete Pass Application Process

```
sequenceDiagram
    participant Student as Student (Frontend)
    participant API as Backend API
    participant DB as Database
    participant Razorpay as Razorpay Payment
    participant Email as Email Service
    participant AI as AI Engine

    Student->>API: Register/Login
    API->>DB: Verify Credentials
    DB-->>API: User Session Created
    API-->>Student: Auth Token

    Student->>API: GET Available Routes
    API->>DB: Fetch Routes
    DB-->>API: Routes List
    API-->>Student: Display Routes

    Student->>API: Submit Application (Route, Duration)
    API->>DB: Save Application (PENDING)
    DB-->>API: Application ID
    API-->>Student: Application Created

    Student->>API: Upload Documents
    API->>DB: Store Document URLs
    DB-->>API: Documents Saved
    API-->>Student: Upload Confirmation

    Student->>API: Initiate Payment
    API->>Razorpay: Create Order
    Razorpay-->>API: Order ID & Session
    API-->>Student: Payment Gateway Opens

    Student->>Razorpay: Process Payment
    Razorpay->>API: Payment Webhook
    API->>DB: Update Payment Status (SUCCESS)
    DB-->>API: Payment Recorded

    API->>DB: Update Application (APPROVED)
    API->>DB: Generate Bus Pass
    API->>API: Generate QR Code & Token
    API->>DB: Save Pass with QR
    DB-->>API: Pass Created

    API->>AI: Send Pass Data for Analytics
    AI-->>API: Demand Prediction

    API->>Email: Send Pass Document
    Email-->>Student: Pass PDF Emailed

    API->>DB: Create Notification
    DB-->>API: Notification Sent
    API-->>Student: Pass Ready to Download

    Student->>API: Download Digital Pass
    API-->>Student: Pass PDF & Digital Card

```

---

## 6. SEQUENCE DIAGRAM - Bus Conductor Pass Validation

```
sequenceDiagram
    participant Conductor as Conductor (Mobile)
    participant Scanner as QR Scanner
    participant API as Backend API
    participant DB as Database
    participant Notification as Notification Service

    Conductor->>Scanner: Open Scanner App
    Scanner-->>Conductor: Ready to Scan

    Conductor->>Scanner: Point at Student's QR
    Scanner->>Scanner: Capture QR Code
    Scanner->>API: Send QR Token

    API->>API: Verify HMAC Signature
    API->>API: Parse Pass Data
    API->>DB: Query Bus Pass by ID
    DB-->>API: Pass Details

    API->>API: Check Pass Status
    API->>API: Check Expiration Date
    API->>API: Verify Route Match

    alt Pass Valid
        API->>DB: Update last_scanned Time
        API->>DB: Log Boarding Record
        API->>Notification: Queue Pass Used Event
        DB-->>API: Record Saved
        API-->>Scanner: ✓ VALID - Grant Access
        Scanner-->>Conductor: Green ✓ Access Granted
        Conductor->>Conductor: Allow Student Boarding
    else Pass Invalid/Expired
        API-->>Scanner: ✗ INVALID - Deny Access
        Scanner-->>Conductor: Red ✗ Invalid Pass
        Conductor->>Conductor: Block Student
        API->>Notification: Send Alert to Admin
    end

    API->>DB: Create Boarding Log Entry
    Notification-->>DB: Event Saved

```

---

## 7. SEQUENCE DIAGRAM - Admin Review & Approval

```
sequenceDiagram
    participant Admin as Admin Dashboard
    participant API as Backend API
    participant DB as Database
    participant Email as Email Service
    participant Queue as Task Queue

    Admin->>API: Load Pending Applications
    API->>DB: Query Applications WHERE status=PENDING
    DB-->>API: List of Applications
    API-->>Admin: Display Applications

    Admin->>API: View Application Details (App ID)
    API->>DB: Fetch Application + Student + Documents
    DB-->>API: Full Application Details
    API-->>Admin: Render Application Review

    Admin->>Admin: Review Documents & Student Info
    Admin->>API: Approve Application
    
    API->>DB: Update Application status=APPROVED
    API->>API: Generate Pass Number
    API->>API: Calculate Valid Dates
    API->>API: Generate QR Token & Image
    API->>DB: Create BusPass Record
    DB-->>API: Pass Created

    API->>Queue: Queue "Pass Issued" Event
    API->>Email: Send Pass Issuance Email
    API->>DB: Create Admin Action Log
    DB-->>API: Action Logged

    API-->>Admin: Pass Approved & Issued
    Admin-->>Admin: Show Success Message

    alt admin Rejects
        Admin->>API: Reject Application with Note
        API->>DB: Update Application status=REJECTED
        API->>DB: Store rejection_note
        API->>Email: Send Rejection Email with Reason
        Email-->>DB: Event Logged
        API-->>Admin: Application Rejected
    end

```

---

## 8. COMPONENT DIAGRAM

```
graph TB
    subgraph Frontend["Frontend (React + Vite)"]
        Auth["Auth Components"]
        Dashboard["Student Dashboard"]
        Forms["Application Forms"]
        PassView["Pass Viewer"]
        QRDisplay["QR Display"]
    end

    subgraph Backend["Backend (Django)"]
        Users["Users App<br/>(Auth, Profile)"]
        Pass["Passes App<br/>(Application, Pass)"]
        Payment["Payment App<br/>(Razorpay Integration)"]
        Bus["Bus App<br/>(Routes, Buses, Locations)"]
        Notify["Notifications App<br/>(Email, SMS)"]
        AI["AI Engine<br/>(Predictions, Optimization)"]
    end

    subgraph Services["External Services"]
        Razorpay["Razorpay<br/>(Payment Gateway)"]
        Email["Email Service<br/>(SMTP)"]
        SMS["SMS Gateway<br/>(Twilio)"]
    end

    subgraph Database["Database Layer"]
        PostgreSQL["PostgreSQL"]
        Redis["Redis Cache<br/>(Realtime)"]
    ]

    Frontend -->|API Calls| Backend
    Backend -->|Payment Requests| Razorpay
    Backend -->|Send Emails| Email
    Backend -->|Send SMS| SMS
    Backend -->|Store/Retrieve| PostgreSQL
    Backend -->|Cache/Realtime| Redis

```

---

## 9. STATE DIAGRAM - Pass Lifecycle

```
stateDiagram-v2
    [*] --> Draft: Application Created

    Draft --> Pending: Submit Application

    Pending --> Approved: Admin Approves
    Pending --> Rejected: Admin Rejects

    Rejected --> [*]

    Approved --> PaymentPending: Generate Payment

    PaymentPending --> PaymentFailed: Payment Failed
    PaymentFailed --> PaymentPending: Retry

    PaymentPending --> PassGenerated: Payment Success

    PassGenerated --> Active: Pass Issued

    Active --> Expired: Validity Date Reached
    Active --> Revoked: Admin Revokes

    Expired --> [*]
    Revoked --> [*]

```

---

## 10. DATA FLOW DIAGRAM (DFD) - Level 1

```
graph TB
    Student["👤 Student"]
    Admin["👤 Admin"]
    Conductor["👤 Conductor"]
    
    subgraph BusPassSystem["🚌 BusPassPro System"]
        AuthModule["🔐 Authentication<br/>Module"]
        PassModule["🎫 Pass<br/>Management"]
        PaymentModule["💳 Payment<br/>Processing"]
        BusModule["🚗 Bus<br/>Management"]
        NotifyModule["📢 Notification<br/>System"]
        AIModule["🤖 AI<br/>Engine"]
    end
    
    Database["💾 Database<br/>(PostgreSQL)"]
    Cache["⚡ Cache<br/>(Redis)"]
    
    Student -->|Login/Register| AuthModule
    Student -->|Apply for Pass| PassModule
    Student -->|Make Payment| PaymentModule
    Student -->|View Pass| PassModule
    
    Admin -->|Review Applications| PassModule
    Admin -->|Manage Routes/Buses| BusModule
    Admin -->|Send Notifications| NotifyModule
    
    Conductor -->|Scan QR| PassModule
    Conductor -->|Track Bus| BusModule
    
    AuthModule -->|Store/Retrieve| Database
    PassModule -->|Store/Retrieve| Database
    PaymentModule -->|Store/Retrieve| Database
    BusModule -->|Store/Retrieve| Database
    NotifyModule -->|Store/Retrieve| Database
    
    AuthModule -->|Cache| Cache
    PassModule -->|Cache| Cache
    BusModule -->|Cache| Cache
    
    PassModule -->|Analyze| AIModule
    AIModule -->|Store Results| Database

```

---

## Entity Relationship Diagram (ERD)

```
erDiagram
    USER ||--o{ STUDENT_PROFILE : has
    USER ||--o{ OTP_VERIFICATION : receives
    USER ||--o{ PASS_APPLICATION : submits
    USER ||--o{ NOTIFICATION : gets
    USER ||--o{ PASS_APPLICATION : reviews

    ROUTE ||--o{ BUS : has
    ROUTE ||--o{ PASS_APPLICATION : for

    BUS ||--o{ BUS_LOCATION : tracks
    BUS ||--o{ BUS_SCHEDULE : has

    PASS_APPLICATION ||--|| BUS_PASS : creates
    PASS_APPLICATION ||--|| PAYMENT : has

    PAYMENT ||--o{ NOTIFICATION : triggers

    USER {
        UUID id PK
        string email UK
        string phone
        string role
        boolean is_active
        boolean is_verified
        datetime created_at
        datetime updated_at
    }

    STUDENT_PROFILE {
        int id PK
        UUID user_id FK
        string student_id UK
        string full_name
        string gender
        date date_of_birth
        string department
    }

    ROUTE {
        int id PK
        string name
        string source
        string destination
        json stops
        float distance_km
    }

    BUS {
        int id PK
        string bus_number UK
        int route_id FK
        int capacity
        string driver_name
    }

    BUS_LOCATION {
        int id PK
        int bus_id FK
        float latitude
        float longitude
        datetime timestamp
    }

    PASS_APPLICATION {
        UUID id PK
        UUID student_id FK
        int route_id FK
        string status
        datetime applied_at
    }

    BUS_PASS {
        UUID id PK
        UUID application_id FK
        string pass_number UK
        date valid_from
        date valid_until
        string status
    }

    PAYMENT {
        UUID id PK
        UUID application_id FK
        decimal amount
        string status
        string razorpay_order_id
    }

    NOTIFICATION {
        int id PK
        UUID user_id FK
        string title
        string message
        boolean is_read
    }

    OTP_VERIFICATION {
        int id PK
        UUID user_id FK
        string otp
        string otp_type
    }

    BUS_SCHEDULE {
        int id PK
        int bus_id FK
        string stop_name
        time arrival_time
    }

```

---

## 11. Deployment Diagram

```
graph TB
    Client["👨‍💻 Client Devices<br/>(Web/Mobile Browser)"]
    
    subgraph Cloud["☁️ Cloud Server"]
        Frontend["Frontend Application<br/>(React + Vite<br/>Port: 5173)"]
        Backend["Django Backend<br/>(Gunicorn<br/>Port: 8000)"]
        RealTime["WebSocket Server<br/>(Django Channels<br/>Port: 8001)"]
        Worker["Task Queue Worker<br/>(Celery)"]
    end
    
    subgraph Data["Data Layer"]
        PG["PostgreSQL<br/>Database"]
        Redis["Redis Server<br/>(Cache & Queue)"]
    end
    
    subgraph Services["External Services"]
        Razorpay["Razorpay API<br/>(Payment)"]
        Email["SMTP Server<br/>(Email)"]
        SMS["SMS Gateway<br/>(Notifications)"]
    end
    
    Client -->|HTTP/HTTPS| Frontend
    Frontend -->|REST API| Backend
    Frontend -->|WebSocket| RealTime
    
    Backend -->|Query/Update| PG
    Backend -->|Cache| Redis
    Worker -->|Consume| Redis
    Worker -->|Update| PG
    
    Backend -->|API Request| Razorpay
    Worker -->|Send| Email
    Worker -->|Send| SMS
    
    RealTime -->|Real-time Data| PG
    RealTime -->|Publish| Redis

```

---

## System Architecture Overview

```
graph LR
    subgraph Clients["🖥️ Clients"]
        StudentWeb["Student Web App"]
        AdminWeb["Admin Dashboard"]
        ConductorApp["Conductor Mobile App"]
    end

    subgraph Presentation["🎨 Presentation Layer"]
        FrontendApp["React Frontend<br/>(Vite)"]
    end

    subgraph Application["⚙️ Application Layer"]
        APIGateway["API Gateway<br/>(Django REST)"]
        UserService["User Service"]
        PassService["Pass Service"]
        PaymentService["Payment Service"]
        BusService["Bus Service"]
        NotificationService["Notification Service"]
        AIService["AI Service"]
    end

    subgraph Data["💾 Data Layer"]
        PostgreSQL["PostgreSQL<br/>(Primary DB)"]
        Redis["Redis<br/>(Cache/Queue)"]
        FileStorage["File Storage<br/>(QR Codes, Docs)"]
    end

    subgraph External["🔌 External"]
        RazorpayGW["Razorpay Gateway"]
        EmailProvider["Email Provider"]
        SMSProvider["SMS Provider"]
    end

    Clients --> FrontendApp
    FrontendApp --> APIGateway
    APIGateway --> UserService
    APIGateway --> PassService
    APIGateway --> PaymentService
    APIGateway --> BusService
    APIGateway --> NotificationService
    APIGateway --> AIService

    UserService --> PostgreSQL
    PassService --> PostgreSQL
    PaymentService --> PostgreSQL
    BusService --> PostgreSQL
    NotificationService --> PostgreSQL
    AIService --> PostgreSQL

    UserService --> Redis
    PassService --> Redis
    BusService --> Redis

    PaymentService --> RazorpayGW
    NotificationService --> EmailProvider
    NotificationService --> SMSProvider
    PassService --> FileStorage

```

---

## Key Entities Summary

| Entity | Purpose | Key Attributes |
|--------|---------|-----------------|
| **User** | Authentication & Authorization | email, phone, role, is_verified |
| **StudentProfile** | Student Information | student_id, full_name, department, college |
| **Route** | Bus Routes | source, destination, fare, distance |
| **Bus** | Physical Buses | bus_number, capacity, driver_info |
| **PassApplication** | Pass Request | route, duration, status, documents |
| **BusPass** | Actual Pass | pass_number, valid_dates, qr_code, status |
| **Payment** | Payment Records | amount, razorpay_ids, status |
| **Notification** | System Alerts | title, message, type, is_read |
| **BusLocation** | Live Bus Tracking | latitude, longitude, timestamp |

---

## Process Flows Summary

1. **Pass Application Flow**: Student registers → fills form → uploads docs → makes payment → admin approves → pass generated
2. **Boarding Flow**: Student arrives → conductor scans QR → system validates → grants/denies access → records boarding
3. **Admin Review**: Admin reviews pending applications → validates documents → approves or rejects → user notified
4. **Payment Flow**: Application created → payment gateway initiated → razorpay processes → payment callback → pass issued
5. **Notification Flow**: Event triggered → notification queued → email/SMS sent → user receives notification

---

## Key Features Represented

✅ User Authentication & Roles (Student, Admin, Conductor)
✅ Pass Application Workflow
✅ QR Code Generation & Validation
✅ Payment Integration (Razorpay)
✅ Real-time Bus Tracking
✅ Notification System (Email & SMS)
✅ AI-Powered Analytics & Predictions
✅ Document Upload & Verification
✅ Admin Dashboard for Management
✅ Boarding Log & Analytics

