# 🏢 PROPOSAL & COMMERCIAL QUOTATION
## PU UNICARE: Enterprise Maintenance & Facility Management System
**Optimized for Parul University Campus Operations**

---

* **Proposal Reference:** PU-UNICARE-2026-Q2  
* **Date of Issue:** May 31, 2026  
* **Validity:** Valid for 45 Days from Date of Issue  
* **Prepared For:** The Management, Parul University, Vadodara, Gujarat  
* **Prepared By:** PU UNICARE core Engineering & Product Team  
* **Contact:** business@puunicare.ac.in | +91 90000 00000  

---

## 📋 Table of Contents
1. [Executive Summary & Return on Investment (ROI)](#1-executive-summary--return-on-investment-roi)
2. [Platform Vision & Core Value Proposition](#2-platform-vision--core-value-proposition)
3. [Technical Architecture & Platform Security](#3-technical-architecture--platform-security)
4. [Role-Based Dashboard Ecosystem](#4-role-based-dashboard-ecosystem)
5. [The AI-Powered Automation Engine](#5-the-ai-powered-automation-engine)
6. [Detailed Project Implementation Plan (4 Weeks)](#6-detailed-project-implementation-plan-4-weeks)
7. [Comprehensive Commercial Quotation](#7-comprehensive-commercial-quotation)
8. [Service Level Agreement (SLA) & Technical Support](#8-service-level-agreement-sla--technical-support)
9. [Intellectual Property & Legal Terms](#9-intellectual-property--legal-terms)
10. [Project Acceptance & Next Steps](#10-project-acceptance--next-steps)

---

## 1. Executive Summary & Return on Investment (ROI)

Parul University, spanning a vast campus with multiple faculties, student hostels, research facilities, and administrative quarters, requires a modernized infrastructure operational system. Traditional paper or email-based systems suffer from delayed responses, poor tracking, administrative bottlenecks, and low accountability.

**PU UNICARE** is a centralized, AI-powered digital maintenance complaint management platform designed specifically for the unique operational landscape of Parul University. The platform coordinates communication between 6 distinct campus user types to ensure campus facility complaints are registered, routed, resolved, and verified instantly.

### 📈 Expected Institutional ROI

```
┌─────────────────────────────────┐       ┌─────────────────────────────────┐
│     Administrative Workload     │  ───> │     Resolution Time Frame       │
│         REDUCED BY 75%          │       │         DECREASED BY 60%        │
└─────────────────────────────────┘       └─────────────────────────────────┘
┌─────────────────────────────────┐       ┌─────────────────────────────────┐
│       SLA Compliance Rate       │  ───> │      Infrastructure Lifespan    │
│      MAINTAINED AT >98%         │       │         INCREASED BY 25%        │
└─────────────────────────────────┘       └─────────────────────────────────┘
```

*   **Zero Manual Dispatch Overhead:** The AI Auto-Assignment engine analyzes skills, location coordinates, and workloads to instantly route tasks to the best-suited technician without any administrative intervention.
*   **Preventative Oversight:** Automated notifications prevent complaints from being forgotten, ensuring critical facility issues (e.g., electrical hazards, major leaks) are solved before causing damage.
*   **Accountability & Feedback:** Submitter verification ensures that work is actually completed to standard before a ticket is closed, maintaining a transparent audit trail.

---

## 2. Platform Vision & Core Value Proposition

PU UNICARE bridges the gap between campus users and operations, eliminating system fragmentation.

```
       [ Student / Faculty ] ──(Smart Registration)──> [ PU UNICARE ]
                                                            │
  ┌─────────────────┬───────────────────────────────┴───────────────┬─────────────────┐
  ▼                 ▼                                               ▼                 ▼
[ HOD Approval ]  [ AI Auto-Assignment ]                     [ SLA Monitoring ]  [ Verification ]
```

### Key Differentiators

| Feature | Standard Manual Systems | PU UNICARE Platform |
| :--- | :--- | :--- |
| **Category Selection** | Manual, often incorrect or ambiguous. | **AI-powered keyword analyzer** automatically categorizes inputs. |
| **Technician Dispatch** | Phone calls, paper slips, highly delayed. | **Weighted assignment algorithm** routes tasks in milliseconds. |
| **Deadlines & Tracking**| No clear timelines, tickets frequently lost. | **Dynamic SLA clocks** with real-time indicators. |
| **Quality Control** | No feedback loop; "verbal" completions. | **5-Dimension Faculty Star Rating** with completion photo proofs. |
| **Escalations** | Requires manual writing to administration. | **Automated Level 1, 2, and 3 Escalations** via background timers. |

---

## 3. Technical Architecture & Platform Security

PU UNICARE is built on an enterprise-ready tech stack designed to deliver sub-second performance, total system reliability, and standard data security compliance.

### 3.1 Technology Stack Configuration

*   **Frontend:** React 18 (TypeScript), Vite, Tailwind CSS, shadcn/ui.
*   **State Management:** TanStack React Query v5 for rapid caching and database synchronization.
*   **Database & Core Backend:** Supabase (PostgreSQL with built-in Row-Level Security).
*   **Realtime Communication:** WebSocket-driven database synchronization for live chat, alerts, and counters.
*   **Email Deliverability:** Resend API integration via Supabase Edge Functions with DKIM/SPF domain verification.
*   **PDF Generation:** Client-side vector generation utilizing jsPDF for instantly watermarked administrative reports.

### 3.2 Enterprise Security Hardening

```
  [ Client Request ] 
          │
          ▼
  [ SSL/TLS 1.3 Encryption ]
          │
          ▼
  [ Supabase RLS (Row-Level Security) ] ──(Checks Active JWT Session & User Role)
          │
          ▼
  [ PostgreSQL Data Tables ] 
```

*   **Domain Restrictor:** Registration is locked to verified university domains (`@paruluniversity.ac.in` and `@paruluniversity.in`).
*   **Row-Level Security (RLS):** Policies are enforced directly inside the database, preventing unauthorized users from accessing tables via external APIs.
*   **Automatic Session Expiry:** System forces auto-logout after 30 minutes of complete user idle time.

---

## 4. Role-Based Dashboard Ecosystem

The system features **6 highly specialized role dashboards**, keeping workflows clean and removing unnecessary clutter:

### 4.1 Faculty & Staff Dashboard (`/dashboard/faculty`)
*   **Submission Center:** File complex complaints with smart dropdowns, exact location models, and photo uploads.
*   **Actionable Alerts:** Immediate visual banners highlighting completed tasks waiting for validation.
*   **Review Panel:** Star rating portal (1 to 5 stars) across multiple facility categories with comment fields.

### 4.2 Class Representative Dashboard (`/dashboard/cr`)
*   **Representative Portal:** Purpose-built console allowing CRs to file infrastructure issues affecting classrooms or laboratories on behalf of their peers.
*   **Activity Ledger:** Unified list detailing the real-time resolution timeline of submitted tickets.

### 4.3 Head of Department Dashboard (`/dashboard/hod`)
*   **Approval Queue:** Quick approval card deck allowing HODs to approve, reject, or re-route department tickets.
*   **Manpower Console:** Real-time visibility into active technician workloads, task assignments, and availability indicators.

### 4.4 Principal Dashboard (`/dashboard/principal`)
*   **Campus Overview:** Central dashboard monitoring global resolution rates, pending ticket backlogs, and active technicians.
*   **Performance Metrics:** Analytical bar/pie charts displaying ticket counts grouped by department and category.
*   **Delayed/Escalated Filters:** Visual trackers highlighting tickets that have breached their SLA timelines.

### 4.5 Maintenance Staff Dashboard (`/dashboard/maintenance`)
*   **Work Queue:** Clean task slots split into *New Assigned, In Progress, On Hold*, and *Completed*.
*   **Task Updates:** Interactive drawers to post progress updates, pause tasks, or submit complete photo proof.

### 4.6 System Admin Dashboard (`/dashboard/admin`)
*   **Operational Control:** CRUD interface to modify departments, staff members, and category matrices.
*   **SLA Configuration:** Custom threshold panel to adjust global response, resolution, and escalation metrics.
*   **Auditing:** System event logger displaying background job logs and auto-assignment logs.

---

## 5. The AI-Powered Automation Engine

PU UNICARE features state-of-the-art heuristic algorithms and decision-making logic running locally to automate system operations:

### 5.1 Smart Category & Priority Detection
*   **Semantic Matching:** Analyzes description fields to automatically detect category tags (Plumbing, Electrical, Carpentry, Cleaning, IT, Civil, Security).
*   **Urgency Analysis:** Scores complaints based on safety keywords, automatically elevating tickets with words like *hazard, emergency, flood, shock* to **Critical** or **High** priority.

### 5.2 Dynamic Auto-Assignment Engine
Upon submission, the engine matches the ticket to the best technician using a weighted multi-criteria formula:

$$\text{Total Score} = (\text{Skill Match} \times 50\%) + (\text{Workload Capacity} \times 35\%) + (\text{Physical Proximity} \times 15\%)$$

```
  ┌──────────────────────────────────────────────────────────┐
  │ 50% Skill Match       [Technician Proficiency 1 to 5]   │
  ├──────────────────────────────────────────────────────────┤
  │ 35% Workload Capacity [1 - (Active Tasks / Max Allowed)]  │
  ├──────────────────────────────────────────────────────────┤
  │ 15% Proximity         [Haversine Distance Formula]       │
  └──────────────────────────────────────────────────────────┘
```

*   **Proximity Calculation:** Uses coordinate telemetry and the Haversine formula to prioritize workers closest to the building.
*   **Robust Fallbacks:** Automatically routes tasks to global university technicians if specific department queues are overloaded, applying a minor penalty.

---

## 6. Detailed Project Implementation Plan (4 Weeks)

We propose a seamless, highly structured **4-week implementation timeline** with zero disruption to active campus life:

```
Week 1: Platform Setup & DB Migration
├── Configure Supabase PostgreSQL Project
├── Migrate RLS Database Schema & Triggers
└── Deploy Supabase Edge Functions & Resend Mailer

Week 2: Data Import & Integrations
├── Import Department structure & Campus Buildings
├── Seed Profiles & Staff Skills Matrix
└── Set up Domain verification on Resend

Week 3: Quality Control & Onboarding
├── Perform End-to-End SLA Testing (18+ Auto-Tests)
├── Admin & HOD Dashboard walkthroughs
└── Maintenance Technicians training sessions

Week 4: Launch & Verification
├── Verify Production System Integrity (UAT Approval)
├── Final production domain launch
└── 2-Week Post Launch Hyper-Care support
```

---

## 7. Comprehensive Commercial Quotation

Our financial structure is optimized to deliver enterprise-grade software capabilities at highly competitive rates, avoiding expensive per-user monthly SaaS fees.

### 7.1 One-Time Procurement Costs

| Phase Item | Deliverables & Scope | Amount (₹) |
| :--- | :--- | :--- |
| **Enterprise Software License** | Full core software license, including source code files. Unlimited student/faculty users, unlimited technicians. | 6,00,000 |
| **Customization & Setup** | Custom branding, theme integrations, configuring Parul email domain rules. | 1,50,000 |
| **Database Migration & Seeding**| Migrating database structures, seeding 100+ departments, campus buildings, and user registries. | 50,000 |
| **Staff Training & Onboarding** | 4 custom hands-on training sessions with system admins, HODs, and maintenance teams. | 50,000 |
| **Deploy & Go-Live Support** | Server setup, staging checks, and production deployment support. | 50,000 |
| **Subtotal One-Time Costs** | **Complete Core Software Acquisition** | **₹8,50,000** |

### 7.2 Annual Hosting & Maintenance Costs (Starts Year 1)

| Operations Item | Scope & Description | Amount (₹/Year) |
| :--- | :--- | :--- |
| **Database & Cloud Hosting** | Supabase Cloud Pro Plan (includes database, authentication, realtime, edge storage). | 30,000 |
| **Enterprise Mail Delivery** | Resend API delivery (up to 50,000 automated notification/digest emails per month). | 12,000 |
| **Domain SSL & Security** | Continuous SSL renewals, DNS management, security patches. | 2,000 |
| **Maintenance & Optimization** | Periodic updates, performance tweaks, code optimizations. | 1,00,000 |
| **Technical Support (SLA-based)**| Level 3 support for technical queries and bug resolutions. | 50,000 |
| **Subtotal Annual Operations** | **Annual Hosting, Maintenance & Support** | **₹1,94,000** |

---

### 💳 Commercial Summary

*   **Total First Year Cost:** **₹10,44,000** *(includes acquisition, migration, setup, hosting, and maintenance)*
*   **Total Second Year Onward:** **₹1,94,000 / year** *(flat recurring operational costs)*

### 📅 Milestones & Payment Terms

| Billing Milestone | Percentage | Deliverables / Trigger Event | Invoice Value (₹) |
| :--- | :--- | :--- | :--- |
| **Milestone 1: Project Kickoff** | 40% | Upon signing of contract / commencement of Week 1. | 3,40,000 |
| **Milestone 2: System UAT** | 30% | Platform setup, database seeding, UAT verification. | 2,55,000 |
| **Milestone 3: Go-Live** | 30% | Complete staging-to-production transfer and official launch. | 2,55,000 |

---

## 8. Service Level Agreement (SLA) & Technical Support

We guarantee operational stability via a structured Service Level Agreement:

### 8.1 Support Resolution Matrix

```
┌─────────────────────────────────┐       ┌─────────────────────────────────┐
│     CRITICAL SYSTEM FAILURE     │  ───> │        HIGH PRIORITY BUG        │
│    Resolution within 24 Hours   │       │    Resolution within 48 Hours   │
└─────────────────────────────────┘       └─────────────────────────────────┘
┌─────────────────────────────────┐       ┌─────────────────────────────────┘
│      MEDIUM PRIORITY BUG        │  ───> │     LOW INCONVENIENCE BUG       │
│     Resolution within 5 Days    │       │    Resolution within 10 Days    │
└─────────────────────────────────┘       └─────────────────────────────────┘
```

*   **Support Hours:** Monday to Saturday | 09:00 AM to 06:00 PM IST.
*   **Premium Upgrades (Optional):**
    *   *Extended Dedicated Support:* ₹30,000 / year (includes 24/7 hotline access).
    *   *On-Site Maintenance Visits:* ₹5,000 / visit (beyond standard maintenance checks).

---

## 9. Intellectual Property & Legal Terms

*   **Full Ownership Transfer:** Upon complete payment of Milestone 3, all frontend and backend source code ownership transfers directly to **Parul University**.
*   **Modification Rights:** The university retains full rights to modify, custom-develop, expand, and host the software on any chosen private cloud.
*   **Non-Disclosure & Data Privacy:** All university operational data, student registers, and technician credentials remain the exclusive property of Parul University. No system data is shared with third parties.

---

## 10. Project Acceptance & Next Steps

To proceed with deploying **PU UNICARE** at Parul University:

1.  **Draft Feedback:** Review this proposal and discuss any minor customization requests.
2.  **Approve Proposal:** Formally accept and execute this commercial contract.
3.  **Initiate Week 1:** Release the Milestone 1 payment to start platform deployment.

---

### Acceptance Signatures

By signing below, both parties agree to the implementation plans, technical delivery matrices, payment milestones, and legal terms detailed in this proposal document.

```
For Parul University:                        For PU UNICARE Development Team:


Signature: __________________________        Signature: __________________________

Name:      __________________________        Name:      __________________________

Title:     __________________________        Title:     __________________________

Date:      __________________________        Date:      __________________________
```

---
*This document is digitally locked and prepared by the PU UNICARE Business Operations & Core Engineering Team.*
