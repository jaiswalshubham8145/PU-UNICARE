# 🌟 PU UNICARE: Master System Documentation

> [!IMPORTANT]
> This is the final, comprehensive documentation for the **PU Unicare Enterprise Maintenance & Facility Management System**, optimized for Parul University. It consolidates all system architecture, database schemas, API references, SLA definitions, and business logic into a single source of truth.

**Version:** 2.0.0 (Production Ready)  
**Target:** Parul University, Vadodara, Gujarat  

---

## 📑 Table of Contents

1. [Executive Summary & ROI](#1-executive-summary--roi)
2. [System Architecture](#2-system-architecture)
3. [User Roles & Access Control](#3-user-roles--access-control)
4. [Database Schema (ER Diagram)](#4-database-schema-er-diagram)
5. [Complaint Lifecycle & State Machine](#5-complaint-lifecycle--state-machine)
6. [AI Automation & Smart Routing](#6-ai-automation--smart-routing)
7. [SLA, Escalations & Notifications](#7-sla-escalations--notifications)
8. [Frontend Components & Tech Stack](#8-frontend-components--tech-stack)
9. [Deployment & Infrastructure](#9-deployment--infrastructure)
10. [Commercial & Licensing](#10-commercial--licensing)

---

## 1. Executive Summary & ROI

**PU UNICARE** is a centralized, AI-powered digital maintenance complaint management platform. Traditional paper or email-based systems suffer from delayed responses, poor tracking, and low accountability. This platform coordinates communication between 6 distinct campus user types to ensure facility complaints are registered, routed, resolved, and verified instantly.

> [!TIP]
> **Expected Institutional ROI:**
> - Administrative Workload Reduced by 75% (Zero manual dispatch overhead)
> - Resolution Time Frame Decreased by 60%
> - SLA Compliance Rate Maintained at >98%
> - Infrastructure Lifespan Increased by 25% due to preventative oversight

---

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
        Storage[Supabase Storage Images/Docs]
        Realtime[Supabase Realtime WebSockets]
    end

    %% External Services
    subgraph External Services
        Email[Resend API]
        SMS[SMS Gateway]
    end

    %% Connections
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

---

## 3. User Roles & Access Control

The platform implements stringent Role-Based Access Control (RBAC) enforced both at the UI route level and at the Database Row-Level Security (RLS) level.

| Role | Access Level | Responsibilities & Capabilities |
| :--- | :--- | :--- |
| **Faculty** | Basic | File complaints, verify completed work, provide 5-star ratings. |
| **Class Rep (CR)** | Basic | Submit infrastructure issues affecting classrooms on behalf of students. |
| **Maintenance Staff**| Operational | Receive auto-assignments, update task progress, upload completion photos. |
| **HOD** | Departmental | Approve/reject complaints, re-route tasks, view department workload. |
| **Principal** | Global (View) | Oversee campus resolution rates, track delayed SLA tasks via analytics. |
| **Admin** | Full Control | System CRUD, SLA configuration, user management, and manual overrides. |

<details>
<summary><strong>Click to view Auth & Navigation Flow</strong></summary>

```mermaid
sequenceDiagram
    actor User
    participant App
    participant Auth as Supabase Auth
    participant DB as Profiles Table
    
    User->>App: Submits Login Credentials
    App->>Auth: Authenticate (Email/Password)
    Auth-->>App: JWT Token + User ID
    App->>DB: Fetch user_roles
    DB-->>App: Returns [faculty, hod]
    App->>User: Prompts Role Selection Modal
    User->>App: Selects 'HOD'
    App->>App: Sets Active Session State
    App->>User: Redirects to /dashboard/hod
```

</details>

---

## 4. Database Schema (ER Diagram)

The system relies on a heavily relational PostgreSQL database architecture.

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
        uuid department_id FK
    }
    
    COMPLAINTS {
        uuid id PK
        string complaint_number
        string status
        string priority
        uuid category_id FK
        uuid submitted_by FK
        uuid assigned_to FK
    }
    
    SLA_TRACKING {
        uuid complaint_id FK
        timestamp response_due_at
        timestamp resolution_due_at
        boolean is_resolution_breached
    }
    
    MAINTENANCE_CATEGORIES {
        uuid id PK
        string name
        uuid department_id FK
    }
```

> [!NOTE]
> All tables enforce Row-Level Security (RLS). For instance, a Faculty member can only SELECT rows from `complaints` where `submitted_by = auth.uid()`, whereas an Admin can SELECT all rows.

---

## 5. Complaint Lifecycle & State Machine

The core value of PU UNICARE is the automated lifecycle tracking of every infrastructure issue.

```mermaid
stateDiagram-v2
    [*] --> Pending : Submitted by User
    
    Pending --> Approved : HOD Approves
    Pending --> Rejected : HOD Rejects
    Rejected --> [*]
    
    Approved --> In_Progress : Staff Starts Work
    In_Progress --> On_Hold : Staff Pauses
    On_Hold --> In_Progress : Staff Resumes
    
    In_Progress --> Completed : Staff Uploads Proof
    
    Completed --> Closed : Faculty Verifies (Pass)
    Completed --> In_Progress : Faculty Rejects (Fail)
    
    Closed --> [*]
    
    %% Escalation Paths
    Pending --> Escalated : SLA Timeout (Response)
    In_Progress --> Escalated : SLA Timeout (Resolution)
    Escalated --> In_Progress : Admin Re-assigns
```

---

## 6. AI Automation & Smart Routing

To achieve a 75% reduction in administrative overhead, the platform utilizes local heuristic algorithms for immediate task routing.

### AI Category & Priority Detection
When a user types a description (e.g., *"There is sparking in the AC plug in lab 3"*):
1. **Keyword Analysis:** Extracts `sparking`, `plug` -> Automatically assigns to **Electrical**.
2. **Urgency Scoring:** `sparking` is classified as a safety hazard -> Automatically sets Priority to **Critical**.

### The Auto-Assignment Engine

```math
Total Score = (Skill Match * 50%) + (Workload Capacity * 35%) + (Physical Proximity * 15%)
```

> [!WARNING]
> If a technician is operating at >80% workload capacity, their score receives a massive penalty, ensuring tasks are distributed evenly across the maintenance pool.

---

## 7. SLA, Escalations & Notifications

Service Level Agreements (SLAs) ensure accountability. If a deadline is breached, the Escalation Engine triggers.

| Priority | Response SLA | Resolution SLA | Escalation Trigger |
| :--- | :--- | :--- | :--- |
| **Critical** | 2 Hours | 24 Hours | Level 1 (HOD) in 12h |
| **High** | 8 Hours | 48 Hours | Level 1 (HOD) in 24h |
| **Medium** | 24 Hours | 72 Hours | Level 2 (Principal) |
| **Low** | 48 Hours | 120 Hours | Level 3 (Admin) |

### Real-time Event Subscriptions
The UI uses `Supabase Realtime` to listen to database `INSERT` and `UPDATE` events.
When a ticket status shifts to `Completed`, an edge function simultaneously fires a Resend API email template (with a green success header) to the submitter.

---

## 8. Frontend Components & Tech Stack

- **Framework:** React 18 + Vite (TypeScript)
- **Styling:** Tailwind CSS + Glassmorphism UX + Framer Motion micro-animations
- **UI Library:** shadcn/ui (Radix UI primitives for accessibility)
- **State/Caching:** TanStack React Query v5
- **Forms:** React Hook Form + Zod (Strict schema validation)
- **Data Visualization:** Recharts + jsPDF-AutoTable for Admin exports

<details>
<summary><strong>Expand to view Directory Structure</strong></summary>

```text
src/
├── pages/              # Route-level views (e.g., /login, /dashboard)
├── components/         # Reusable UI architecture
│   ├── home/           # Landing page & marketing sections
│   ├── complaints/     # Modals, timelines, and smart detectors
│   ├── dashboard/      # Analytic widgets, tables, SLA trackers
│   └── ui/             # shadcn foundational primitives
├── services/           # Business logic (AIService, EmailNotificationService)
├── hooks/              # Data fetching (useComplaints, useAuth, useSLA)
├── integrations/       # Database generated types (supabase.ts)
└── lib/                # Utility pure functions (utils.ts)
```

</details>

---

## 9. Deployment & Infrastructure

Designed for high availability on modern cloud edges.

### Setup Process
1. **Clone & Install:** `npm install`
2. **Database Provisioning:** Execute all SQL within `supabase/migrations/` via the Supabase SQL Editor.
3. **Environment Config:** Set `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`.
4. **Edge Secrets:** Store `RESEND_API_KEY` in Supabase vault for the mailer function.
5. **Function Deployment:** 
   ```bash
   supabase functions deploy send-email
   supabase functions deploy send-digest
   ```
6. **Launch:** `npm run build` & deploy to Vercel/Netlify.

---

## 10. Commercial & Licensing

> [!IMPORTANT]
> **Total First Year Cost:** ₹10,44,000  
> **Annual Maintenance (Year 2+):** ₹1,94,000 / year

**Key Deliverables:**
- Complete Enterprise License (Unlimited Users)
- Full RLS Database setup and data seeding
- Automated Mail/SMS Notification systems
- Comprehensive Admin/HOD Training
- Source Code Ownership Transfer upon final milestone completion.

---
*Generated by the PU UNICARE Core Engineering Team.*
