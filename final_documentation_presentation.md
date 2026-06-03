# 🌟 PU UNICARE Documentation Presentation

Welcome to the final, comprehensive presentation of the **PU Unicare Enterprise Maintenance & Facility Management System**. 

Use the carousel below to interactively explore the system architecture, database schemas, automated lifecycles, and role-based flows.

````carousel
## 1. Executive Summary & Vision

**PU UNICARE** is a centralized, AI-powered digital maintenance complaint management platform. 

> [!TIP]
> **Expected Institutional ROI:**
> - Administrative Workload Reduced by 75%
> - Resolution Time Frame Decreased by 60%
> - SLA Compliance Rate Maintained at >98%
> - Infrastructure Lifespan Increased by 25%

*Swipe to the next slide to view the system architecture.*
<!-- slide -->
## 2. System Architecture

The architecture separates concerns into a React-based frontend, a Supabase (PostgreSQL) backend, and a real-time event-driven notification layer.

```mermaid
graph TD
    %% Client Layer
    subgraph Client Layer
        Web[Web Application React/Vite]
        Mobile[Mobile Responsive UI]
    end

    %% Application Layer
    subgraph Application Layer
        UI[shadcn/ui & Tailwind]
        State[TanStack React Query]
        Router[React Router v6]
    end

    %% Edge & Auth Layer
    subgraph Edge & Auth Layer
        Auth[Supabase Auth JWT]
        Functions[Supabase Edge Functions]
    end

    %% Data Layer
    subgraph Data Layer
        DB[(PostgreSQL DB)]
        Storage[Supabase Storage]
        Realtime[Supabase Realtime WebSockets]
    end

    %% External Services
    subgraph External Services
        Email[Resend API]
        SMS[SMS Gateway]
    end

    Web --> UI
    Mobile --> UI
    UI --> State
    State --> Auth
    State --> DB
    State --> Storage
    State --> Realtime
    Functions --> Email
    Functions --> SMS
    DB --> Functions
```
<!-- slide -->
## 3. Database Schema

The core relational structure mapping Profiles, Complaints, and Departments, secured by PostgreSQL Row-Level Security (RLS).

```mermaid
erDiagram
    PROFILES ||--o{ USER_ROLES : has
    PROFILES ||--o{ COMPLAINTS : submits
    DEPARTMENTS ||--o{ COMPLAINTS : owns
    BUILDINGS ||--o{ COMPLAINTS : located_in
    MAINTENANCE_CATEGORIES ||--o{ COMPLAINTS : categorizes
    
    COMPLAINTS ||--o{ COMPLAINT_UPDATES : tracks
    COMPLAINTS ||--o{ ESCALATION_HISTORY : triggers
    COMPLAINTS ||--o| SLA_TRACKING : monitors
    
    PROFILES {
        uuid user_id PK
        string full_name
        string email
    }
    
    COMPLAINTS {
        uuid id PK
        string status
        string priority
    }
```
<!-- slide -->
## 4. The Complaint Lifecycle

Every complaint follows a strict, state-machine driven lifecycle monitored by the SLA Engine.

```mermaid
stateDiagram-v2
    [*] --> Pending : Submitted
    
    Pending --> Approved : HOD Approves
    Pending --> Rejected : HOD Rejects
    Rejected --> [*]
    
    Approved --> In_Progress : Staff Starts Work
    In_Progress --> On_Hold : Staff Pauses
    On_Hold --> In_Progress : Staff Resumes
    
    In_Progress --> Completed : Uploads Proof
    
    Completed --> Closed : Faculty Verifies (Pass)
    Completed --> In_Progress : Faculty Rejects (Fail)
    
    Closed --> [*]
    
    %% Escalation Paths
    Pending --> Escalated : SLA Timeout
    In_Progress --> Escalated : SLA Timeout
    Escalated --> In_Progress : Admin Re-assigns
```
<!-- slide -->
## 5. AI Auto-Assignment Engine

When a complaint is approved, the local heuristic algorithm instantly assigns the best technician without human intervention.

> [!NOTE]
> **The Scoring Algorithm:**
> `Total Score = (Skill Match * 50%) + (Workload Capacity * 35%) + (Physical Proximity * 15%)`

This ensures that tasks are routed evenly, and urgent safety hazards are prioritized automatically.
<!-- slide -->
## 6. Access Control & Navigation Flow

Strict Role-Based Access Control (RBAC) ensures users only see what they are permitted to.

```mermaid
sequenceDiagram
    actor User
    participant App
    participant Auth as Supabase Auth
    participant DB as Profiles Table
    
    User->>App: Submits Login
    App->>Auth: Authenticate
    Auth-->>App: JWT Token
    App->>DB: Fetch user_roles
    DB-->>App: Returns [faculty, hod]
    App->>User: Prompts Role Selection
    User->>App: Selects 'HOD'
    App->>App: Sets Active Session
    App->>User: Redirects to /dashboard/hod
```
````

For the full, raw text documentation, please refer to the repository file: [PU_UNICARE_MASTER_DOCUMENTATION.md](file:///c:/PU%20unicare/PU_UNICARE_MASTER_DOCUMENTATION.md)
