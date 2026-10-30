# 🌟 PU UNICARE — Complete Master Catalog of All Features

> **Target Platform:** Parul University Centralized Infrastructure & Maintenance Platform  
> **Repository:** `PU-UNICARE`  
> **Document Purpose:** Single comprehensive inventory of every single working feature, tool, automation, and workflow in the application.  
>
> 💡 *Quick Links:*
> - 📘 Plain-English Guidebook: **[ABOUT_PROJECT.md](./ABOUT_PROJECT.md)**
> - 🛠️ Engineering Architecture Manual: **[ABOUT_PROJECT_TECHNICAL.md](./ABOUT_PROJECT_TECHNICAL.md)**

---

## 📑 Master Feature Directory

1. [Feature Summary Matrix & Quick Reference](#1-feature-summary-matrix--quick-reference)
2. [Public Portal & Discovery Features](#2-public-portal--discovery-features)
3. [Complaint Intake & Reporting Subsystems](#3-complaint-intake--reporting-subsystems)
4. [AI, Hardware & Automation Features](#4-ai-hardware--automation-features)
5. [Live Tracking & Verification Workflows](#5-live-tracking--verification-workflows)
6. [The 5 Dedicated Role Dashboards](#6-the-5-dedicated-role-dashboards)
   - 6.1 [Faculty Workspace](#61-faculty-workspace)
   - 6.2 [Head of Department (HOD) Operations Deck](#62-head-of-department-hod-operations-deck)
   - 6.3 [Principal & Executive Leadership Command Center](#63-principal--executive-leadership-command-center)
   - 6.4 [Maintenance Technician Mobile Field Deck](#64-maintenance-technician-mobile-field-deck)
   - 6.5 [System Administrator Control Panel](#65-system-administrator-control-panel)
7. [Facility & Resource Management Suites](#7-facility--resource-management-suites)
   - 7.1 [Real-Time Spare Parts Inventory Management](#71-real-time-spare-parts-inventory-management)
   - 7.2 [Campus Scheduled Maintenance Calendar](#72-campus-scheduled-maintenance-calendar)
   - 7.3 [Technician & Staff Directory](#73-technician--staff-directory)
8. [Analytics, Mapping & Visual Intelligence](#8-analytics-mapping--visual-intelligence)
9. [SLA Escalation & Multi-Channel Notifications](#9-sla-escalation--multi-channel-notifications)
10. [Design System, Theming & Accessibility](#10-design-system-theming--accessibility)
11. [Export, Compliance & Audit Generation](#11-export-compliance--audit-generation)

---

## 1. Feature Summary Matrix & Quick Reference

| Feature Name | Route / Component | Primary User Roles | Core Functionality |
| :--- | :--- | :--- | :--- |
| **Landing Portal** | `/` (`Index.tsx`) | Public / All | Hero stats, categories, features showcase, CTA, video background |
| **Category Showcase** | `/maintenance` | Public / All | 7 facility domains with high-end curated HD imagery and checklists |
| **Instant Single Report** | `/register-complaint` | Faculty, HOD, Admin | Single-screen submission with photo upload, priority, and location |
| **Guided Complaint Wizard** | `/complaint-wizard` | Faculty, All | Multi-step interactive flow with failure diagnosis and AI guidance |
| **Batch Bulk Filing** | `/register-batch` | Faculty, Admin | Submit multiple classroom issues in a single synchronized transaction |
| **Live QR Code Scanner** | Modal (`html5-qrcode`) | Any device with camera | Scan room QR tags; auto-populates department, block, and room |
| **Real-Time Ticket Tracker**| `/track` | Public / All | Search ticket number or phone to view live step progression timeline |
| **AI Vision & NLP Triage** | Integrated Service | All reporting flows | Gemini 1.5 Flash auto-categorization & priority suggestions |
| **AI Support Chatbot** | Floating Widget (`ChatWidget.tsx`) | Authenticated Users | In-app intelligent conversational support assistant |
| **Faculty Dashboard** | `/dashboard/faculty` | Faculty | Track personal issues, verify completed jobs, provide 5-star ratings |
| **HOD Operations Hub** | `/dashboard/hod/*` | HOD, Principal, Admin | Approve tickets, manually re-assign technicians, monitor department SLAs |
| **Principal Command Deck**| `/dashboard/principal/*`| Principal, Admin | High-level campus KPI analytics, delayed tickets, SLA breach alerts |
| **Technician Field Deck** | `/dashboard/maintenance/*`| Maintenance Staff | Work order cards, status toggle, parts logging, completion proof upload |
| **Admin Control Suite** | `/dashboard/admin/*` | Admin | User role management, department setup, room registry, system audits |
| **Inventory Manager** | `/dashboard/inventory` | Staff, HOD, Admin | Stock counts, minimum threshold alerts, unit cost, consumption log |
| **Maintenance Calendar** | `/dashboard/calendar` | Staff, HOD, Admin, Faculty | Month/week view of scheduled preventive checks and technician shifts |
| **Staff Directory** | `/staff-directory` | Authenticated Users | On-duty status, contact numbers, skills, and current workloads |
| **Interactive Campus Map**| Leaflet Map Component | HOD, Principal, Admin | Vector polygon campus map with color-coded issue density pins |
| **Knowledge Base & FAQ** | `/help` & `/help-center` | Public / All | Searchable self-help guides, emergency procedures, maintenance tips |
| **Satisfaction Survey** | `/survey` | Faculty, CR, Users | Post-resolution rating, technician score, written feedback capture |
| **API Documentation** | `/api-docs` | Developers, Admins | Interactive PostgREST and REST API endpoint reference |
| **Notifications Center** | `/notifications` | Authenticated Users | Real-time reactive notification inbox with priority filters |
| **Audit & PDF Generator** | jsPDF Integration | HOD, Principal, Admin | Export formal vector PDF maintenance compliance reports |
| **Excel / CSV Exporter** | XLSX Integration | HOD, Principal, Admin | Download raw datasets for university NAAC/NBA inspection records |
| **Multilingual Engine** | Dynamic i18n | All | Instant switching between English, Hindi, and Gujarati |
| **Radiant Dark/Light Theme**| HSL Token Engine | All | Emerald Regal dark mode with ambient glows & Academic Parchment light mode |
| **PWA Offline Support** | Service Worker (`sw.js`)| Mobile & Desktop | Offline caching, home-screen installation, background sync |
| **Interactive Site Tour** | Global Overlay (`SiteTourModal.tsx`) | First-time Visitors & All | 8-step guided onboarding walkthrough + searchable 25+ page visual directory |

---

## 2. Public Portal & Discovery Features

### 1. High-Performance Landing Portal (`/`)
- **Radiant Hero Section**: Displays animated system statistics (Total Resolved, Active Work Orders, Campus Buildings Covered, Average Resolution Hours).
- **Background Video Experience**: Ambient loop video with custom dark-mode luminous green radial gradient backdrop.
- **Dynamic Category Preview**: Interactive cards highlighting campus maintenance specialties with direct links to reporting.
- **Platform Features Grid**: Cards explaining fast response times, real-time tracking, transparent verification, and AI assistance.
- **User Testimonials & Reviews**: Responsive carousel featuring verified quotes from department heads and faculty.
- **Global Header (Navbar)**:
  - Sticky glassmorphism header with logo and glowing emerald accents.
  - Quick-action buttons: *Report Issue*, *Track Status*, *Language Switcher*, *Dark/Light Theme Toggle*, *User Profile / Login*.
- **Comprehensive Footer**:
  - Emergency contact hotlines, quick portal links, copyright, and campus social media links.

### 2. Maintenance Categories Visual Catalog (`/maintenance`)
- Features **7 specialized university maintenance domains**:
  1. **Air Conditioning & Climate Control (HVAC)**
  2. **Classroom & Laboratory Electrical Infrastructure**
  3. **Plumbing, Sanitation & Water Systems**
  4. **Classroom Furniture & Structural Carpentry**
  5. **Campus IT, Projector & Networking Hardware**
  6. **Civil Infrastructure, Masonry & Windows**
  7. **Housekeeping, Hygiene & Waste Management**
- **High-Definition Architectural Photography**: Replaced low-res images with curated, high-resolution imagery for all 7 sectors.
- **Interactive Scope Checklists**: Lists common failures handled under each category with estimated standard resolution times.
- **Direct Report Trigger**: Each card features a one-click CTA directing the user to report an issue for that specific category.

### 3. About Parul University Maintenance Cell (`/about`)
- Overview of Parul University's maintenance philosophy and operational benchmarks.
- Campus infrastructure scale: buildings, classrooms, auditoriums, and laboratory spaces covered.
- Quality assurance milestones and commitment to zero-downtime academic schedules.

### 4. Knowledge Base & Self-Service Portal (`/help` & `/help-center`)
- **Searchable Troubleshooting Articles**: Quick fixes for minor issues (e.g., projector input switching, AC remote resets).
- **Standard Operating Procedures (SOPs)**: How to file emergency tickets versus routine requests.
- **Categorized FAQ Accordions**: Instant answers to common student and faculty inquiries.

### 5. Emergency Contact Hub (`/contact`)
- Immediate emergency phone numbers for campus control rooms (Electrical fire, water burst, IT outage).
- Interactive enquiry form with direct email routing to maintenance dispatchers.
- Campus address details, operating hours, and Google Maps location reference.

### 6. Interactive Site Tour & Page Directory (`SiteTourModal.tsx`)
- **First-Visit Smart Detection**: Floating ambient banner invites first-time visitors with "Start Tour" or "Dismiss" (persisted in `localStorage`).
- **Global Header Access**: Radiant "✨ Site Tour" trigger integrated directly into desktop and mobile navigation bars.
- **8-Step Curated Walkthrough Mode**:
  1. *Welcome to PU UNICARE* — Mission statement, institutional scale, and multi-tier architectural foundation.
  2. *4 Ways to Report Issues* — Instant Form, Guided Wizard, Bulk Filing, and QR Scanner.
  3. *AI-Powered Triage* — Gemini-powered automatic categorization, priority estimation, and duplicate detection.
  4. *Real-Time Public Tracker* — End-to-end resolution pipeline with technician verification proofs.
  5. *6 Dedicated Role Dashboards* — Tailored operational workspaces for all university stakeholders.
  6. *Campus Facility Suites* — Live spare parts inventory, preventive maintenance calendars, and staff directory.
  7. *Executive Analytics & Heatmaps* — Interactive Leaflet GIS campus map and department SLA performance monitors.
  8. *Universal Accessibility & i18n* — Trilingual localization, glowing emerald dark mode, and PWA capabilities.
- **Searchable 25+ Page Directory View**:
  - Live search filter across all routes and views in the entire platform.
  - Category pill filter tabs: *Public & Reporting*, *Dashboards & Operations*, *Facilities & Directory*, *Documentation & Support*.
  - Direct route links, purpose descriptions, and role access badges.
- **Micro-Interactions**: Smooth Framer Motion transitions, step progress bar, dot indicators, and keyboard navigation.

---

## 3. Complaint Intake & Reporting Subsystems

PU UNICARE provides **4 distinct ways** to submit maintenance requests, accommodating every scenario:

### 1. Instant Single Report (`/register-complaint`)
- **Fast One-Page Intake**: Ideal for quick reporting from a mobile phone or laptop.
- **Department & Room Dropdowns**: Dynamic cascading selectors linked to the university room registry.
- **Category & Subcategory Selectors**: Multi-level hierarchical categorization.
- **Priority Selector**: Low (Routine), Medium (Standard), High (Urgent), or Critical (Immediate Hazard).
- **Drag-and-Drop Image Uploader**: Allows uploading initial photo evidence of the damaged asset.
- **Live Form Validation**: Zod schema validation preventing incomplete submissions.

### 2. Interactive Guided Complaint Wizard (`/complaint-wizard`)
- **Step-by-Step Progress Bar**: Guides non-technical users step-by-step through:
  1. *Location Identification* (Campus, Building, Floor, Room).
  2. *Issue Diagnostic Questionnaire* (What broke? Is there a leak? Is it dangerous?).
  3. *Media Attachment* (Photo upload with live preview).
  4. *AI Priority Estimation* (AI suggests priority based on safety risk).
  5. *Confirmation & Submission Summary*.

### 3. Batch Bulk Filing (`/register-batch`)
- **Multi-Issue Classroom Filing**: Designed for faculty or CRs after inspecting an entire laboratory or classroom.
- **Dynamic Issue Adder**: Add 2, 3, 5, or more distinct issues (e.g., 2 broken lights + 1 leaky tap + 1 loose desk) in one go.
- **Atomic Transaction**: Submits all tickets in a single batch, generating unique ticket tracking codes for each item.

### 4. QR Code Instant Doorway Reporting (Modal)
- Integrated camera scanner modal powered by `html5-qrcode`.
- Scans QR stickers affixed on classroom and laboratory doors.
- Instantly parses the encoded URL and pre-populates campus, building, and room number in $<200\,\text{ms}$, saving manual typing.

---

## 4. AI, Hardware & Automation Features

### 1. Google Gemini 1.5 Flash Multimodal Vision & NLP (`AIService.ts`)
- **Visual Equipment Analysis**: Analyzes user-uploaded photos to detect the damaged asset (e.g., shattered switchboard, water leak, frayed wire).
- **Automated Categorization**: Matches descriptions and images to the correct category without user guesswork.
- **Safety Risk Flagging**: Automatically elevates tickets to `High` or `Critical` if signs of electrical fire, structural hazard, or flooding are detected.
- **Deterministic Offline Fallback**: If the device is offline or the Gemini API quota is saturated, a local regex-based keyword engine executes automatically.

### 2. Live In-App AI Support Chatbot (`ChatWidget.tsx`)
- Floating chat launcher at the bottom-right of the screen for logged-in users.
- **Context-Aware Assistance**: Answers questions about ticket statuses, filing guidelines, emergency contacts, and estimated repair times.
- **Smooth Framer Motion Transitions**: Animated expandable chat window with typing indicators and conversation memory.

### 3. Intelligent Auto-Assignment Engine (`AutoAssignmentEngine.ts`)
- Automatically evaluates and assigns incoming tickets to the optimal technician using a calibrated heuristic formula:
  $$\text{Score} = (0.40 \times \text{Skill}) + (0.40 \times \text{Workload}) + (0.20 \times \text{Proximity})$$
- Prevents technician overload by distributing tickets evenly across the maintenance roster.

### 4. Two-Tier Automated SLA Escalation Engine (`EscalationService.ts`)
- **TTA Clock (Time-to-Acknowledge)**: Must be accepted by a technician within **2 hours**. If exceeded $\rightarrow$ **Level 1 Escalation** sent to the Head of Department (HOD).
- **TTR Clock (Time-to-Resolve)**: Must be completed within **24 hours** (or calibrated window). If breached $\rightarrow$ **Level 2 Escalation** sent to the University Principal / Executive Director.

---

## 5. Live Tracking & Verification Workflows

### 1. Universal Ticket Tracking Engine (`/track`)
- **Multi-Method Lookup**: Search by unique Ticket ID (e.g., `PU-2026-EL-0418`) or by registered mobile phone number.
- **Visual Step Progression Timeline**:
  $$\text{Pending} \longrightarrow \text{Assigned} \longrightarrow \text{In Progress} \longrightarrow \text{Resolved} \longrightarrow \text{Verified}$$
- **Assigned Technician Card**: Displays technician name, assigned timestamp, and contact hotline.
- **SLA Countdown Timer**: Live visual indicator showing hours/minutes remaining before SLA breach.

### 2. Mandatory Photographic Proof-of-Work
- Technicians cannot mark a job resolved without uploading a photo of the completed repair.
- Photos are stored securely in Supabase S3 storage and visible on the ticket timeline.

### 3. Two-Way Verification & Satisfaction Survey (`/survey`)
- Prevents false completions: tickets cannot be closed until the original submitter confirms the repair.
- **5-Star Rating System**: Rate technician punctuality, work cleanliness, and repair quality.
- **Reject / Re-Open Option**: If the repair was inadequate, the user taps *Reject*, automatically sending the ticket back to the technician with feedback.

---

## 6. The 5 Dedicated Role Dashboards

### 6.1 Faculty Workspace (`/dashboard/faculty`)
- **Personal Complaint Feed**: View all tickets submitted by the logged-in faculty member.
- **Verification Queue**: Dedicated section showing resolved tickets awaiting faculty sign-off.
- **Live Status Badges**: Color-coded badges (`Pending`, `In Progress`, `Resolved`, `Verified`).
- **Quick Re-Report Action**: Easily re-file periodic or recurrent room issues.

### 6.2 Head of Department (HOD) Operations Deck (`/dashboard/hod/*`)
- **Departmental Ticket Hub**: Complete oversight of all maintenance requests within the department.
- **Filterable Status Views**:
  - `/pending`: Unassigned or unacknowledged tickets.
  - `/in-progress`: Active repair jobs currently being worked on.
  - `/completed`: Repaired tickets awaiting faculty verification.
  - `/all`: Complete historical archive with date range filtering.
- **Technician Manual Re-Assignment**: Override the auto-assignment engine to redirect tickets to specific technicians.
- **SLA Breach Warnings**: Instant red alert cards for tickets exceeding the 2-hour acknowledgement limit.
- **Department Performance KPIs**: Average resolution hours and department satisfaction ratings.

### 6.3 Principal & Executive Leadership Command Center (`/dashboard/principal/*`)
- **Campus-Wide Macro Analytics**: Aggregated KPIs across all faculties (Engineering, Medicine, Management, Arts, etc.).
- **Executive Delayed Tickets Deck (`/dashboard/principal/delayed`)**: Centralized dashboard of all SLA-breached tickets university-wide.
- **Campus Maintenance Heatmap**: Visual overview of which buildings generate the highest volume of complaints.
- **Resolution Velocity Metric**: Tracks week-over-week technician throughput.
- **Executive PDF Export**: One-click download of the university-wide maintenance audit report.

### 6.4 Maintenance Technician Mobile Field Deck (`/dashboard/maintenance/*`)
- **Mobile-First Work Order Feed**: Large, touch-friendly task cards optimized for smartphones on the move.
- **Status Progression Toggles**: Single-tap actions to move tickets:
  $$\text{Acknowledge} \longrightarrow \text{Start Work} \longrightarrow \text{Put On-Hold} \longrightarrow \text{Mark Resolved}$$
- **On-Hold Reason Logger**: Record why work is paused (e.g., *Waiting for spare capacitor from stores*).
- **Spare Parts Consumption Trigger**: Directly deduct consumed items from inventory during repair.
- **Camera Completion Proof Uploader**: Take a photo using the phone camera and upload it directly as resolution proof.

### 6.5 System Administrator Control Panel (`/dashboard/admin/*`)
- **User Role Management (`/dashboard/admin/users`)**: Search, filter, and modify user roles (`faculty`, `hod`, `principal`, `maintenance_staff`, `admin`).
- **Department & Room Registry**: Add, edit, or disable university faculties, building wings, and classrooms.
- **Global Ticket Moderation**: Edit, delete, reassign, or force-close any ticket.
- **System Audit Trail**: Real-time view of system mutations and user actions.

---

## 7. Facility & Resource Management Suites

### 7.1 Real-Time Spare Parts Inventory Management (`/dashboard/inventory`)
- **Stock Tracking Table**: Lists spare items (e.g., LED tubes, switches, ball valves, fan capacitors, HDMI cables).
- **Low-Stock Alert Badges**: Highlights items whose quantity has fallen below the configured minimum threshold.
- **Restock Action Modal**: Increment stock upon receipt of fresh inventory shipments.
- **Consumption Logging**: Automatically records which technician consumed which part on which ticket number.
- **Unit Cost & Valuation**: Tracks total replacement asset expenditure across categories.

### 7.2 Campus Scheduled Maintenance Calendar (`/dashboard/calendar`)
- **Monthly / Weekly Calendar Views**: Interactive grid displaying planned preventive maintenance events.
- **Color-Coded Event Tags**: Blue for routine inspections, Amber for electrical audits, Green for HVAC servicing.
- **Technician Shift Schedules**: View on-duty schedules and planned building power shutdowns.

### 7.3 Technician & Staff Directory (`/staff-directory`)
- **Roster of Campus Technicians**: Categorized by trade (Electricians, Plumbers, Carpenters, HVAC Engineers, IT Technicians).
- **Real-Time Availability Status**: Live badges indicating *Available*, *On Active Job*, or *Off Duty*.
- **Direct Contact Links**: Tap-to-call phone hotlines for emergency dispatch.

---

## 8. Analytics, Mapping & Visual Intelligence

### 1. Interactive Visual Charting (`Recharts`)
- **Complaints by Category (Donut Chart)**: Visual breakdown of issues across electrical, HVAC, plumbing, etc.
- **Weekly Resolution Velocity (Bar Chart)**: Compares tickets reported vs. tickets resolved over 7-day intervals.
- **Average Time-to-Resolution Trendline (Area Chart)**: Displays department resolution speed over monthly cycles.

### 2. Interactive Campus Map & Heatmap (`Leaflet`)
- Vector polygon mapping of Parul University campus grounds.
- Color-coded building status pins:
  - 🟢 **Green**: Normal activity ($< 3$ open issues).
  - 🟡 **Amber**: Moderate workload ($3 - 7$ open issues).
  - 🔴 **Red**: High issue concentration or active SLA breach ($> 7$ issues).
- Tap-to-inspect tooltip showing active ticket summaries per building.

---

## 9. SLA Escalation & Multi-Channel Notifications

### 1. Notifications Center (`/notifications`)
- Real-time reactive notification bell in the top navbar with live unread badge count.
- Filter feed by: *All*, *Unread*, *SLA Alerts*, *Assignments*, *Status Updates*.
- One-click *Mark All as Read* and clear actions.
- Direct clickable links taking the user directly to the relevant ticket.

### 2. Multi-Channel Event Broadcast Engine
- **In-App Realtime**: Powered by Supabase PostgreSQL Change Data Capture (CDC) over WebSockets.
- **Email Notifications**: Serverless Deno Edge Function triggers HTML email templates via the Resend API for ticket creation, assignments, and escalations.
- **SMS / Webhook Telephony**: Dispatches urgent SMS notifications to technician mobile numbers for critical hazard tickets.

---

## 10. Design System, Theming & Accessibility

### 1. Dual Regal Color Theme Architecture
- **Emerald Regal Dark Mode (Default)**:
  - Background: Deep Midnight `#060F10` (`hsl(186 45% 4.3%)`).
  - Accent: Luminous Radiant Emerald `#34D399` (`hsl(156 75% 52%)`).
  - Secondary: Regal Brass Gold `#C2A05A` (`hsl(40 50% 58%)`).
  - Custom ambient glow card shadows and radiant button halos.
- **Academic Parchment Light Mode**:
  - Background: Warm Academic Parchment (`hsl(43 54% 92.4%)`).
  - High-contrast typography and polished dark emerald accents.
- Seamless one-click theme switcher in header and settings.

### 2. Trilingual Localization Engine (i18n)
- One-click language switching between **English**, **Hindi (हिंदी)**, and **Gujarati (ગુજરાતી)**.
- Covers navigation, form labels, role dashboards, and system alerts.

### 3. Progressive Web App (PWA) Capabilities
- Installable as a native app on Android, iOS, Windows, and macOS.
- Integrated Service Worker (`sw.js`) for offline static caching and instant loads.
- Native mobile manifest with splash screens and theme color integration.

### 4. Accessibility & Navigation
- **SkipLink Component (`SkipLink.tsx`)**: Enables screen-reader and keyboard users to bypass navigation directly to main content.
- **ARIA Primitives**: Full keyboard navigation support (Tab, Enter, Escape) on all dialogs, dropdowns, and menus via Radix UI.
- **Global Error Boundary (`ErrorBoundary.tsx`)**: Graceful UI error capture with single-click page reload recovery.

---

## 11. Export, Compliance & Audit Generation

### 1. Vector PDF Maintenance Compliance Reports (`jsPDF` + `AutoTable`)
- Generates publication-ready vector PDF documents formatted for university syndicate and accreditation meetings.
- Includes Parul University logo, date range, department breakdown tables, SLA compliance percentage, and signed approval lines.

### 2. Raw Data Spreadsheet Export (`XLSX` + `PapaParse`)
- HODs and Administrators can export raw ticket datasets into Excel (`.xlsx`) or CSV format for external analysis or NAAC/NBA inspection records.

### 3. Cryptographic Audit Trail
- PostgreSQL database triggers capture full `OLD` and `NEW` JSON snapshots on every row update, recording timestamps and the user UUID responsible.

---

*PU UNICARE Feature Master Catalog • Parul University Maintenance Cell • Confidential & Proprietary.*
