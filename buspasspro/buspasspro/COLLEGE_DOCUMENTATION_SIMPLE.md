# BusPassPro Simplified Documentation

## 1. System Overview
BusPassPro is a digital bus pass management system designed for students. It automates the application, payment, and verification process using QR codes and live tracking.

## 2. Use Case Diagram
The system involves Students, Admins, and Staff.

```mermaid
flowchart TD
    Student((Student))
    Admin((Admin))
    Staff((Staff))

    subgraph S[Student]
        UC1[Apply for Pass]
        UC2[Make Payment]
        UC3[View QR Pass]
    end

    subgraph A[Admin]
        UC4[Approve/Reject Pass]
        UC5[Manage Routes]
    end

    subgraph T[Staff]
        UC6[Scan QR Code]
        UC7[Track Bus]
    end

    Student --> UC1
    Student --> UC2
    Student --> UC3
    Admin --> UC4
    Admin --> UC5
    Staff --> UC6
    Staff --> UC7
```

## 3. Core Class Diagram
Simplified view of the main system entities.

```mermaid
classDiagram
    direction LR
    class User {
        +String email
        +String role
    }
    class StudentProfile {
        +String student_id
        +String college_name
    }
    class PassApplication {
        +String status
        +String duration_type
    }
    class BusPass {
        +String pass_number
        +Date valid_until
        +Image qr_code
    }
    class Route {
        +String source
        +String destination
    }

    User "1" -- "1" StudentProfile
    User "1" -- "*" PassApplication
    PassApplication "1" -- "1" BusPass
    Route "1" -- "*" PassApplication
```

## 4. Data Dictionary (Key Tables)

### User & Profile
| Field | Type | Description |
| --- | --- | --- |
| email | String | Unique login identifier |
| role | String | student or admin |
| student_id | String | College ID number |

### Pass Management
| Field | Type | Description |
| --- | --- | --- |
| route | Link | Selected bus route |
| status | String | pending, approved, or rejected |
| pass_number | String | Unique issued pass ID |
| valid_until | Date | Expiry date of the pass |

### Routes & Buses
| Field | Type | Description |
| --- | --- | --- |
| source | String | Starting point |
| destination | String | Ending point |
| bus_number | String | Vehicle registration number |
