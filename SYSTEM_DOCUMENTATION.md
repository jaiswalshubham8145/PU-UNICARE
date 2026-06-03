# PU UNICARE - Complete System Documentation

**Version:** 2.0.0  
**Platform:** Parul University, Vadodara, Gujarat, India  
**Status:** Production Ready  

---

## Table of Contents

1. [System Overview](#1-system-overview)
2. [Tech Stack](#2-tech-stack)
3. [Architecture](#3-architecture)
4. [Public Pages](#4-public-pages)
5. [Authentication System](#5-authentication-system)
6. [Dashboard System](#6-dashboard-system)
7. [Complaint Lifecycle](#7-complaint-lifecycle)
8. [Automation & Intelligence](#8-automation--intelligence)
9. [Email & Notification System](#9-email--notification-system)
10. [SLA & Escalation System](#10-sla--escalation-system)
11. [Components Reference](#11-components-reference)
12. [Services Reference](#12-services-reference)
13. [Hooks Reference](#13-hooks-reference)
14. [Database Schema](#14-database-schema)
15. [Route Map](#15-route-map)
16. [Deployment Guide](#16-deployment-guide)

---

## 1. System Overview

PU UNICARE is a centralized, role-based digital maintenance complaint management system. It allows any member of Parul University to register, track, manage, and resolve facility maintenance complaints with full SLA tracking, auto-assignment, escalation, email notifications, ratings, and real-time updates.

### User Roles

| Role | Access Level | Description |
|------|-------------|-------------|
| **Faculty** | Basic | Register complaints, verify completed work, rate service |
| **CR (Class Representative)** | Basic | Submit complaints on behalf of students |
| **Maintenance Staff** | Operational | View assigned tasks, update progress, mark complete |
| **HOD (Head of Department)** | Departmental | Approve/reject complaints, assign staff, view department stats |
| **Principal** | University-wide | View all complaints, analytics, delayed/escalated views |
| **Admin** | Full Control | Manage users, configure SLA rules, manage departments, full system control |

### Key Features

- Smart complaint filing with AI-assisted categorization
- Role-based dashboards tailored to each user type
- Automated staff assignment using weighted scoring algorithm
- SLA-based escalation (Level 1: HOD, Level 2: Principal, Level 3: Admin)
- Real-time updates via Supabase Realtime
- Email notifications for every lifecycle event
- Digest emails (morning/evening/weekly)
- Complaint ratings with 5 dimensions
- Knowledge base and help center
- Staff directory with availability status
- AI chatbot for self-service
- PDF/CSV report exports
- Full-text search across complaints

---

## 2. Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 18, TypeScript, Vite |
| **Routing** | React Router v6 |
| **State Management** | TanStack React Query v5 |
| **UI Components** | shadcn/ui (Radix UI primitives) |
| **Styling** | Tailwind CSS, glassmorphism design |
| **Animations** | Framer Motion, CSS animations |
| **Charts** | Recharts |
| **Forms** | React Hook Form + Zod validation |
| **Backend** | Supabase (PostgreSQL, Auth, Realtime, Storage, Edge Functions) |
| **Email** | Resend API via Supabase Edge Functions |
| **Icons** | Lucide React |
| **PDF Generation** | jsPDF + jsPDF-AutoTable |

---

## 3. Architecture

```
src/
├── pages/              # Route-level page components (19 pages)
├── pages/dashboard/    # Dashboard pages per role (24 pages)
├── components/         # Reusable UI components
│   ├── layout/         # Navbar, Footer, BackgroundVideo
│   ├── home/           # Landing page sections
│   ├── complaints/     # Complaint modals, filters, pagination
│   ├── dashboard/      # Analytics, escalation, reports
│   ├── admins/         # Department & SLA management
│   ├── chat/           # AI chatbot widget
│   ├── notifications/  # Notification bell
│   ├── ratings/        # Rating modal
│   ├── sla/            # SLA indicator
│   └── ui/             # shadcn/ui primitives
├── services/           # Business logic layer (6 services)
├── hooks/              # React Query hooks (12 hook files)
├── integrations/       # Supabase client & types
├── config/             # Constants & configuration
├── lib/                # Utility functions
├── assets/             # Static images, videos
└── test/               # Test utilities & test files

supabase/
├── functions/          # Edge Functions (send-email, send-digest)
├── migrations/         # Database migrations (15 files)
└── config.toml         # Supabase configuration
```

---

## 4. Public Pages

### 4.1 Home Page (`/`)

The landing page with 7 sections:

| Section | Description |
|---------|-------------|
| **Navbar** | Fixed glassmorphism top navigation with logo, links, user dropdown, notification bell |
| **HeroSection** | Main headline, description text, CTA buttons (Report Issue, Track Complaint) |
| **FeaturesGrid** | Grid showcasing system capabilities (AI categorization, real-time tracking, SLA management, etc.) |
| **MaintenanceCategories** | Visual grid of campus maintenance categories with images |
| **RolesSection** | Explains each user role with icons and descriptions |
| **WorkflowSection** | Step-by-step complaint lifecycle visualization (Submit -> Assign -> Work -> Verify -> Close) |
| **CTASection** | Final call-to-action to register complaints |
| **Footer** | Dark gradient footer with brand, quick links, contact info, social media |

### 4.2 About Page (`/about`)

| Section | Description |
|---------|-------------|
| **Hero** | Badge + headline about the system |
| **Mission & Vision** | Two-column cards describing system goals |
| **Key Guarantees** | 4 cards: 24-Hour Acknowledgment, Clear Timelines, Transparent Tracking, Full Accountability |
| **About Parul University** | University description text |

### 4.3 Maintenance Catalog (`/maintenance`)

Comprehensive catalog of all maintenance categories across 7 departments:

| Department | Items |
|-----------|-------|
| **Classroom Maintenance** (9) | Lighting, Fans, Smart Boards, Audio Systems, Benches/Seating, Doors/Windows, Power Sockets, AC/Cooling, Cleanliness |
| **Department Maintenance** (7) | Cabins, Office Equipment, Printers, WiFi/Network, Power Backup, Notice Boards, Storage |
| **Laboratory Maintenance** (7) | Instruments, Electrical Safety, Software, Hardware, Pipelines, Furniture, Safety Equipment |
| **Washroom & Hygiene** (6) | Water Supply, Flush/Drainage, Leakage, Sanitation, Cleaning Schedule, Fittings/Tiles |
| **Campus Infrastructure** (6) | Roads, Parking, Gardens, Street Lighting, Drainage, Waste Management |
| **Safety & Security** (5) | CCTV, Fire Extinguishers, Emergency Exits, Security Lighting, Access Control |
| **Utilities & Services** (6) | Lifts/Elevators, Generators, Water Tanks, Solar Systems, PA Systems, Internet |

Each item links to `/register-complaint` for quick filing.

### 4.4 Complaint Tracking (`/track`)

| Section | Description |
|---------|-------------|
| **Search Section** | Input field + search button to find complaint by ID |
| **Complaint Details Card** | ID, Status badge, Title, Description, Location, Department, Created Date, Expected Resolution, Attached Images |
| **Progress Timeline** | Vertical timeline showing all status updates with timestamps |

### 4.5 Staff Directory (`/staff-directory`)

| Section | Description |
|---------|-------------|
| **Stats Cards** | Total Staff, Available Now, Currently Busy, Average Rating |
| **Filters** | Search by name, Department filter, Status filter, Sort options |
| **Staff Grid** | Responsive grid of staff cards with Avatar, Name, Designation, Status, Department, Skills, Stats (Rating/Completed/Experience), Workload bar, Contact buttons (Call/WhatsApp/Email) |

### 4.6 Help Center (`/help-center`)

| Section | Description |
|---------|-------------|
| **Search Bar** | Search FAQs |
| **Quick Links** | File Complaint, Track Status, Staff Directory, AI Chatbot |
| **FAQ Accordion** | 10 questions covering General, Filing, Tracking, Communication, Escalation, Feedback, Emergency |
| **Contact Support** | Email, Call, Live Chat buttons |

### 4.7 Knowledge Base (`/help`)

| Section | Description |
|---------|-------------|
| **Search Bar** | Search articles |
| **Category Grid** | Dynamic categories from database with icons |
| **Articles Accordion** | FAQ-style expandable articles from `knowledge_articles` table |
| **Feedback Buttons** | Helpful / Not Helpful per article |

### 4.8 Contact Page (`/contact`)

| Section | Description |
|---------|-------------|
| **Hero** | "24/7 Support" badge |
| **Contact Info** | Campus Address, Phone, Email |
| **Send Message Form** | Full Name, Email, Subject, Message textarea, Send button |

---

## 5. Authentication System

### Login Page (`/login`)

| Element | Description |
|---------|-------------|
| **Email Input** | University email field |
| **Password Input** | With show/hide toggle |
| **Remember Me** | Checkbox |
| **Forgot Password** | Link to `/forgot-password` |
| **Submit Button** | Login with loading state |
| **Resend Verification** | Shown when email not confirmed |
| **Toggle to Sign Up** | Switch to registration form |

### Sign Up (inline on Login page)

| Element | Description |
|---------|-------------|
| **Full Name** | Text input |
| **Email** | University email |
| **Password** | With strength indicator |
| **Confirm Password** | Must match |
| **Role Selection** | Dropdown: Faculty, CR, Maintenance Staff, HOD, Principal, Admin |
| **Submit Button** | Register with loading state |

### Role Selection Modal

Shown when a user has multiple roles. Displays role cards with icons. User selects active role, which determines which dashboard they access.

### Password Reset

| Page | Description |
|------|-------------|
| **Forgot Password** (`/forgot-password`) | Enter email, receive reset link |
| **Reset Password** (`/reset-password`) | Enter new password + confirm, auto-redirect to login |

### Security Features

- **ProtectedRoute** component with role checking
- Session timeout (30 minutes idle)
- Activity tracking (mouse, keyboard, scroll, click)
- Access denied page for unauthorized access
- Security event logging

---

## 6. Dashboard System

### 6.1 Faculty Dashboard (`/dashboard/faculty`)

| Section | Description |
|---------|-------------|
| **Header** | Welcome message, Report Download button, New Complaint button |
| **Verification Alert** | Shows count of completed complaints awaiting faculty verification |
| **4 Stat Cards** | Total Complaints, Pending, In Progress, Completed |
| **Recent Complaints** | Top 3 complaints with status badges, Verify/View buttons |
| **Quick Actions** | Report New, Track Status, View Categories |
| **Recent Updates** | Latest status changes |
| **All My Complaints Table** | Full list with ComplaintFilters + ComplaintsPagination |
| **Modals** | ComplaintDetailsModal, VerifyCompletionModal |

**Actions Available:**
- Register new complaints
- Verify completed work (approve/reject with rating)
- View complaint details
- Filter and paginate complaints

### 6.2 CR Dashboard (`/dashboard/cr`)

| Section | Description |
|---------|-------------|
| **Header** | "Submit Complaint" button, Report Download |
| **Info Banner** | Explains CR role and responsibilities |
| **4 Stat Cards** | Total Submitted, Pending, In Progress, Resolved |
| **Quick Actions** | File Complaint, Track Status, Help Center |
| **Recent Updates** | Latest status changes |
| **My Submitted Complaints Table** | Full list with filters + pagination |
| **Modals** | ComplaintDetailsModal |

**Actions Available:**
- Submit complaints on behalf of students
- Track all submitted complaints

### 6.3 HOD Dashboard (`/dashboard/hod`)

| Section | Description |
|---------|-------------|
| **Header** | Report Download |
| **Critical Issues Alert** | Red pulsing alert for critical complaints |
| **4 Stat Cards** | Pending Approval, In Progress, Completed, Total (each links to sub-page) |
| **Pending Approvals List** | Top 5 pending complaints with Approve & Assign / Details / Reject buttons |
| **Department Stats** | Total complaints, Completed, Resolution Rate |
| **Status Overview** | Pending, Approved, In Progress, Rejected counts |
| **Modals** | ComplaintDetailsModal, AssignStaffModal |

**Sub-pages:**
- `/dashboard/hod/pending` - Pending complaints for department
- `/dashboard/hod/in-progress` - In-progress complaints
- `/dashboard/hod/completed` - Completed complaints
- `/dashboard/hod/all` - All department complaints

**Actions Available:**
- Approve or reject complaints
- Assign maintenance staff
- Auto-assign using AI engine
- View department statistics

### 6.4 Principal Dashboard (`/dashboard/principal`)

| Section | Description |
|---------|-------------|
| **Header** | Report Download, Export PDF |
| **Delayed Complaints Alert** | Warning for complaints past expected resolution |
| **4 Stat Cards** | Total, Delayed, In Progress, Resolved |
| **Analytics Section** | Department Performance bar chart, Status Distribution pie chart |
| **Key Metrics** | Avg Resolution Time, Resolution Rate, Escalated Issues, Departments count |
| **Complaints Overview** | Tabs (All / Delayed / Escalated) with filters + pagination |
| **Modals** | ComplaintDetailsModal |

**Sub-pages:**
- `/dashboard/principal/all` - All university complaints
- `/dashboard/principal/delayed` - Delayed complaints
- `/dashboard/principal/in-progress` - In-progress complaints
- `/dashboard/principal/resolved` - Resolved complaints

**Actions Available:**
- View analytics across all departments
- Filter by delayed/escalated complaints
- Export reports as PDF

### 6.5 Admin Dashboard (`/dashboard/admin`)

| Section | Description |
|---------|-------------|
| **Header** | Report Download, Export PDF, Manage Users, Settings buttons |
| **Escalated Issues Alert** | Critical + pending escalated complaints |
| **4 Stat Cards** | Total, Pending, In Progress, Completed (with trend indicators) |
| **Tab Interface** | |

**Overview Tab:**
| Widget | Description |
|--------|-------------|
| Department Overview | Bar chart of complaints per department |
| System Performance | Resolution Rate + Active Complaints progress bars |
| User Statistics | Faculty, HODs, Maintenance Staff, CR counts |
| Category Distribution | Horizontal bar chart of complaints by category |

**Departments Tab:**
| Widget | Description |
|--------|-------------|
| DepartmentManagement | CRUD interface for departments (create, edit, delete) |

**SLA Rules Tab:**
| Widget | Description |
|--------|-------------|
| SLAConfiguration | CRUD interface for SLA rules (response time, resolution time, escalation time per priority/category/department) |

**Reports Tab:**
| Widget | Description |
|--------|-------------|
| Export Buttons | Export All/Pending/Completed complaints as PDF |

**Sub-pages:**
- `/dashboard/admin/all` - All complaints
- `/dashboard/admin/pending` - Pending complaints
- `/dashboard/admin/in-progress` - In-progress complaints
- `/dashboard/admin/completed` - Completed complaints
- `/dashboard/admin/users` - User management

**Actions Available:**
- Full system control
- Manage departments (CRUD)
- Configure SLA rules (CRUD)
- Manage user roles (add/remove)
- Export reports
- Assign staff to any complaint
- Bulk operations on complaints

### 6.6 Maintenance Staff Dashboard (`/dashboard/maintenance`)

| Section | Description |
|---------|-------------|
| **Header** | Report Download |
| **Overdue Alert** | Tasks past expected resolution |
| **4 Stat Cards** | New Assigned, In Progress, On Hold, Completed |
| **Assigned Tasks List** | Each task shows: Complaint number, Priority badge, Status badge, OVERDUE badge, Title, Location, Date, Time remaining |

**Per-Task Action Buttons:**
| Status | Available Actions |
|--------|------------------|
| approved | View, Start Work |
| in_progress | View, Update Progress, Put On Hold, Mark Complete |
| on_hold | View, Resume Work |
| completed | View |

**Sub-pages:**
- `/dashboard/maintenance/new-assigned` - Newly assigned tasks
- `/dashboard/maintenance/in-progress` - In-progress tasks
- `/dashboard/maintenance/on-hold` - On-hold tasks
- `/dashboard/maintenance/completed` - Completed tasks

**Modals:**
- ComplaintDetailsModal - View full complaint details
- ProgressUpdateModal - Add progress note + optional image
- CompletionProofModal - Upload before/after photos + description

---

## 7. Complaint Lifecycle

### Step 1: Submission

```
User fills form on /register-complaint
  -> Title, Department, Building, Location, Category, Priority, Description
  -> Optional: Photo/Video evidence (max 5 files, 10MB each)
  -> SmartCategoryDetector suggests category/priority from description
  -> Submit
```

**Backend Actions:**
1. Insert into `complaints` table (complaint_number auto-generated by trigger)
2. `AutoAssignmentEngine.autoAssign()` runs:
   - Finds best staff via weighted scoring (skill 50%, workload 35%, proximity 15%)
   - Updates complaint with `assigned_to` and `status = 'approved'`
   - Logs assignment to `auto_assignment_logs`
3. `sendComplaintEmail("new_complaint")` fires
4. If auto-assigned: `sendComplaintEmail("assignment")` fires
5. In-app notification created for assigned staff

### Step 2: HOD Review

```
HOD sees complaint in /dashboard/hod/pending
  -> Option A: Approve & Assign (AssignStaffModal)
    -> Select staff, add notes
    -> Status -> "approved"
    -> Email sent to staff + submitter
  -> Option B: Reject
    -> Status -> "rejected"
    -> Email sent to submitter
```

### Step 3: Maintenance Work

```
Staff sees task in /dashboard/maintenance/new-assigned
  -> Start Work: Status -> "in_progress"
    -> Email: "Work Has Started" to submitter
  -> Update Progress (ProgressUpdateModal):
    -> Add note, optional image
    -> Progress percentage logged
    -> Email: "Progress Update" to submitter
  -> Put On Hold (if needed):
    -> Status -> "on_hold"
    -> Add reason
    -> Email: "Work Put On Hold" to submitter
  -> Resume:
    -> Status -> "in_progress"
    -> Email: "Work Resumed" to submitter
  -> Complete (CompletionProofModal):
    -> Upload before/after photos
    -> Add completion description
    -> Status -> "completed", set resolved_at
    -> Email: "Verification Required" to submitter
```

### Step 4: Faculty Verification

```
Faculty sees verification alert on /dashboard/faculty
  -> Opens VerifyCompletionModal
  -> Views completion proof photos
  -> Option A: Approve
    -> Star rating (1-5)
    -> Written feedback
    -> Status -> "closed"
    -> Rating saved to complaint_ratings
    -> Email: "Complaint Closed" to all parties
  -> Option B: Reject
    -> Rejection reason
    -> Status -> "in_progress"
    -> Email: "Completion Rejected" to maintenance staff
```

### Step 5: SLA Monitoring (Continuous)

```
Background monitoring:
  -> SLA rules define response/resolution times per priority
  -> SLA tracking records deadlines per complaint
  -> Escalation rules trigger when thresholds exceeded:
    -> Level 1 (24h): Escalate to HOD
    -> Level 2 (48h): Escalate to Principal
    -> Level 3 (72h): Escalate to Admin
  -> SLA breach emails sent automatically
  -> Real-time SLA indicators on dashboard
```

---

## 8. Automation & Intelligence

### 8.1 AI Service (`AIService.ts`)

**Category Detection:**
- Analyzes description text against keyword sets
- 8 categories: Plumbing, Electrical, Carpentry, Cleaning, HVAC, IT/Software, Civil/Structural, Security
- Returns best match with confidence score

**Priority Detection:**
- Weighted keyword scoring
- Critical keywords (emergency, dangerous, safety hazard) = 100
- High keywords (urgent, broken, not working) = 75
- Medium keywords (needs repair, damaged) = 50
- Low keywords (cosmetic, minor) = 25

**Location Detection:**
- Identifies location type from description (classroom, office, restroom, lab, etc.)

**Smart Suggestions:**
- Auto-complete based on partial input
- Common complaint patterns

**Integration:** Used by `SmartCategoryDetector` component on complaint registration form.

### 8.2 Auto-Assignment Engine (`AutoAssignmentEngine.ts`)

**Algorithm:**
```
Total Score = (Skill Score × 0.5) + (Workload Score × 0.35) + (Proximity Score × 0.15)
```

**Scoring Details:**

| Factor | Weight | Calculation |
|--------|--------|-------------|
| Skill Match | 50% | Staff proficiency level (1-5) normalized to 0-1 |
| Workload | 35% | 1 - (current_workload / max_workload) |
| Proximity | 15% | Haversine distance, normalized (max 2km campus) |

**Special Rules:**
- Cross-department fallback: 30% score penalty
- Critical priority: Boost highest-skill candidates
- Minimum skill level filter
- Max workload threshold (80% default)

**Outputs:**
- Best candidate selected
- Assignment logged to `auto_assignment_logs`
- In-app notification created
- Email notification sent

### 8.3 Escalation Engine (`EscalationService.ts`)

**Default Rules:**

| Level | After | Target | Trigger |
|-------|-------|--------|---------|
| 1 | 24 hours | HOD | Complaint pending/unacknowledged |
| 2 | 48 hours | Principal | Still unresolved after Level 1 |
| 3 | 72 hours | Admin | Maximum escalation |

**Actions on Escalation:**
1. Update `complaints.escalation_level`
2. Insert into `escalation_history`
3. Create in-app notification for target role
4. Send escalation email
5. Notify original submitter

### 8.4 SLA System

**SLA Rules Configuration:**
- Per priority (critical/high/medium/low)
- Per category (optional)
- Per department (optional)
- Most specific rule wins

**SLA Tracking:**
- `response_due_at` - When first response is expected
- `resolution_due_at` - When resolution is expected
- `escalation_due_at` - When escalation should trigger
- `is_response_breached` / `is_resolution_breached` - Breach flags

**Business Hours:**
- Monday-Friday, 09:00-17:00 IST
- Holidays excluded from SLA calculation

---

## 9. Email & Notification System

### 9.1 Email Types

| Type | Template | Recipients | Trigger |
|------|----------|------------|---------|
| `new_complaint` | Yellow header | Submitter, HOD, Admins | Complaint submitted |
| `complaint_submitted` | Green header | Submitter, HOD | Complaint registered |
| `complaint_assigned` | Purple header | Submitter, Assigned Staff | Staff assigned |
| `assignment` | Purple header | Assignee, HOD | Task assigned |
| `status_update` | Blue header | Submitter, HOD | Status changed |
| `completion` | Green header | Submitter, HOD, Admins | Work completed |
| `verification_requested` | Purple header | Submitter, HOD, Admins | Verification needed |
| `verification_approved` | Green header | All parties | Verification passed |
| `verification_rejected` | Red header | Assignee, HOD | Verification failed |
| `progress_update` | Cyan header | Submitter, HOD | Progress update |
| `work_started` | Green header | Submitter | Work started |
| `work_on_hold` | Yellow header | Submitter | Work paused |
| `work_resumed` | Green header | Submitter | Work resumed |
| `sla_breach` | Red border | Assignee, HOD, Admins | SLA breached |
| `escalated` | Red header | Target role, Submitter | Complaint escalated |
| `resolved` | Green header | Submitter | Complaint resolved |
| `feedback_request` | Yellow header | Submitter | Request feedback (24h after resolution) |
| `reminder` | Purple header | Assigned staff | Pending action reminder |
| `digest` | Blue header | HODs, Admins, Principals | Scheduled digest |

### 9.2 Digest System

| Digest | Schedule | Content |
|--------|----------|---------|
| Morning | 8:00 AM IST daily | Pending complaints, escalated, SLA breaches |
| Evening | 6:00 PM IST daily | Resolved today, summary stats |
| Weekly | Monday 9:00 AM IST | Full weekly report |

### 9.3 In-App Notifications

Real-time notifications via Supabase Realtime:

| Type | Icon | Trigger |
|------|------|---------|
| `complaint_created` | Plus | New complaint |
| `complaint_assigned` | UserCheck | Staff assigned |
| `complaint_updated` | RefreshCw | Status changed |
| `complaint_completed` | CheckCircle | Work completed |
| `complaint_approved` | ThumbsUp | HOD approved |
| `complaint_rejected` | XCircle | HOD rejected |
| `sla_warning` | AlertTriangle | SLA warning |
| `sla_breach` | AlertOctagon | SLA breached |
| `system_announcement` | Info | System message |

### 9.4 SMS Service (Infrastructure Ready)

Templates defined for all notification types. Currently configured as placeholder. Ready for integration with:
- Twilio
- MSG91
- Fast2SMS (free tier in India)
- TextLocal

---

## 10. SLA & Escalation System

### SLA Rules

| Priority | Response Time | Resolution Time | Escalation Time |
|----------|--------------|-----------------|-----------------|
| Critical | 2 hours | 24 hours | 12 hours |
| High | 8 hours | 48 hours | 24 hours |
| Medium | 24 hours | 72 hours | 48 hours |
| Low | 48 hours | 120 hours | 72 hours |

### Escalation Flow

```
Complaint Created
  -> SLA deadlines calculated
  -> Timer starts

After Escalation Time Threshold:
  -> check_and_escalate_complaints() runs (hourly cron)
  -> Level 1: Notify HOD
  -> Level 2: Notify Principal
  -> Level 3: Notify Admin (maximum)

Manual Escalation:
  -> Any admin/HOD can manually escalate
  -> Reason recorded
  -> Same notification chain triggered
```

### SLA Indicator Component

Visual indicator showing:
- **Green:** On track (>70% time remaining)
- **Blue:** Due soon (<70% time remaining)
- **Yellow:** Warning (<4 hours remaining)
- **Red:** Overdue (breached)

---

## 11. Components Reference

### Layout Components

| Component | File | Description |
|-----------|------|-------------|
| Navbar | `components/layout/Navbar.tsx` | Glassmorphism top navigation with logo, links, user menu, notification bell, mobile hamburger |
| Footer | `components/layout/Footer.tsx` | Dark gradient footer with brand, links, contact info, social media |
| BackgroundVideo | `components/layout/BackgroundVideo.tsx` | Full-screen video background that changes per route |

### Home Components

| Component | File | Description |
|-----------|------|-------------|
| HeroSection | `components/home/HeroSection.tsx` | Main hero with headline, CTA buttons |
| FeaturesGrid | `components/home/FeaturesGrid.tsx` | Grid of system features |
| MaintenanceCategories | `components/home/MaintenanceCategories.tsx` | Visual maintenance category grid |
| RolesSection | `components/home/RolesSection.tsx` | User role descriptions |
| WorkflowSection | `components/home/WorkflowSection.tsx` | Complaint lifecycle visualization |
| CTASection | `components/home/CTASection.tsx` | Call-to-action section |

### Complaint Components

| Component | File | Description |
|-----------|------|-------------|
| ComplaintDetailsModal | `components/complaints/ComplaintDetailsModal.tsx` | Full complaint details dialog with image gallery, update history |
| AssignStaffModal | `components/complaints/AssignStaffModal.tsx` | Staff assignment dialog with selection, notes |
| ComplaintFilters | `components/complaints/ComplaintFilters.tsx` | Search + Status + Priority filters |
| ComplaintsPagination | `components/complaints/ComplaintsPagination.tsx` | Page navigation with item count |
| ComplaintTimeline | `components/complaints/ComplaintTimeline.tsx` | Vertical status history timeline |
| VerifyCompletionModal | `components/complaints/VerifyCompletionModal.tsx` | Faculty verification with star rating |
| ProgressUpdateModal | `components/complaints/ProgressUpdateModal.tsx` | Maintenance progress update with note |
| CompletionProofModal | `components/complaints/CompletionProofModal.tsx` | Completion proof upload with before/after photos |
| SmartCategoryDetector | `components/complaints/SmartCategoryDetector.tsx` | AI-powered category/priority suggestion |
| BulkActionToolbar | `components/complaints/BulkActionToolbar.tsx` | Bulk operations toolbar |

### Dashboard Components

| Component | File | Description |
|-----------|------|-------------|
| ReportDownloadButton | `components/dashboard/ReportDownloadButton.tsx` | CSV/PDF export with role watermark |
| AnalyticsDashboard | `components/dashboard/AnalyticsDashboard.tsx` | Charts: department performance, category distribution, SLA compliance |
| EscalationDashboard | `components/dashboard/EscalationDashboard.tsx` | Escalation monitoring with candidates, history, rules |
| DepartmentManagement | `components/admins/DepartmentManagement.tsx` | Department CRUD interface |
| SLAConfiguration | `components/admins/SLAConfiguration.tsx` | SLA rules CRUD interface |

### Other Components

| Component | File | Description |
|-----------|------|-------------|
| ChatWidget | `components/chat/ChatWidget.tsx` | Floating AI chat widget |
| NotificationBell | `components/notifications/NotificationBell.tsx` | Bell icon with unread count, dropdown |
| RatingModal | `components/ratings/RatingModal.tsx` | 5-dimension rating dialog |
| SLAIndicator | `components/sla/SLAIndicator.tsx` | SLA compliance visual indicator |
| RoleSelection | `components/RoleSelection.tsx` | Multi-role selection modal |
| ProtectedRoute | `components/ProtectedRoute.tsx` | Auth guard with role checking |

---

## 12. Services Reference

### AIService.ts
- `detectCategory(text)` - Category detection from keywords
- `detectPriority(text)` - Priority scoring from keywords
- `detectLocation(text)` - Location type detection
- `generateTitle(description)` - Auto-title generation
- `analyzeComplaint(text)` - Full analysis
- `getSmartSuggestions(partialText)` - Auto-complete

### AutoAssignmentEngine.ts
- `findBestStaff(categoryId, departmentId, priority)` - Find top candidates
- `autoAssign(complaintId, categoryId, departmentId, priority)` - Auto-assign
- `updateStaffSkills(userId, skills)` - Manage skills
- `updateStaffAvailability(userId, availability)` - Update status
- `getAssignmentStats()` - Assignment statistics
- `bulkAutoAssign(complaints)` - Bulk assignment

### emailService.ts
- `getComplaintRecipients(complaint, ...)` - Fetch email recipients
- `sendComplaintEmail(type, complaint, context)` - Send email
- `getComplaintForEmail(complaintId)` - Fetch complaint data

### EmailNotificationService.ts
- `sendNotificationEmail(params)` - Type-based email sending
- `sendComplaintSubmittedEmail(...)` - Convenience function
- `sendComplaintAssignedEmail(...)` - Convenience function
- `sendStatusChangeEmail(...)` - Convenience function
- `sendEscalationEmail(...)` - Convenience function
- `sendResolutionEmail(...)` - Convenience function (with scheduled feedback)
- `sendReminderEmail(...)` - Convenience function

### EscalationService.ts
- `getEscalationRules()` - Fetch rules
- `createEscalationRule(rule)` - Create rule
- `updateEscalationRule(id, updates)` - Update rule
- `deleteEscalationRule(id)` - Deactivate rule
- `getEscalationCandidates()` - Find complaints needing escalation
- `escalateComplaint(complaintId, reason)` - Execute escalation
- `getEscalationHistory(complaintId)` - Get history
- `acknowledgeEscalation(historyId)` - Acknowledge
- `getEscalationStats()` - Statistics

### SMSService.ts
- `sendSMS(recipient, type, data)` - Send SMS
- `isUserSMSEnabled(userId)` - Check if enabled
- `updateUserSMSPreference(userId, enabled, phone)` - Update preference

---

## 13. Hooks Reference

| Hook | Queries | Mutations | Purpose |
|------|---------|-----------|---------|
| useAuth | Session, roles | signIn, signUp, signOut, setActiveRole | Authentication |
| useComplaints | myComplaints, departmentComplaints, allComplaints, complaintStats, departments, categories, buildings | submitComplaint, updateComplaintStatus | Complaint CRUD |
| useNotifications | notifications, unreadCount | markRead, markAllRead, delete | Notifications |
| useAutoAssignment | staffCandidates, staffSkills, staffAvailability, assignmentStats, assignmentLogs | autoAssign, updateSkills, updateAvailability | Auto-assignment |
| useRatings | complaintRating, staffRatings, departmentRatings, systemRatings, recentFeedback | submitRating | Ratings |
| useSLA | slaRules, slaTracking, breachStats, upcomingBreaches, timeRemaining | saveSLARule, deleteSLARule | SLA management |
| useEscalation | escalationRules, escalationCandidates, escalationHistory, escalationStats | saveRule, deleteRule, escalate, acknowledge | Escalation |
| useBulkActions | - | updateStatus, assignTo, deleteComplaints | Bulk operations |
| useRealtimeComplaints | - | - | Auto-invalidation on DB changes |
| useChatbot | conversations, messages | sendMessage | AI chat |

---

## 14. Database Schema

### Core Tables

**complaints** - Central entity
- id, complaint_number (auto-generated), title, description
- status (pending/acknowledged/approved/in_progress/on_hold/completed/rejected/closed)
- priority (critical/high/medium/low)
- location, building_id, department_id, category_id
- submitted_by, assigned_to, approved_by
- escalation_level, last_escalated_at
- is_auto_assigned, auto_assignment_score
- image_urls, expected_resolution, resolved_at
- search_vector (full-text search)
- created_at, updated_at

**complaint_updates** - Status change history
- id, complaint_id, status, updated_by, note, image_urls, created_at

**profiles** - User profiles
- user_id, full_name, email, phone, department_id, avatar_url
- employee_id, designation, skills, experience_years

**user_roles** - Role assignments
- id, user_id, role, department_id

**departments** - Academic departments
- id, name, code, head_id

**buildings** - Campus buildings
- id, name, category, location_lat, location_lng

**maintenance_categories** - Complaint categories
- id, name, description, icon, department_id

### Automation Tables

**sla_rules** - SLA configuration
- id, priority, category_id, department_id
- response_time_hours, resolution_time_hours, escalation_time_hours

**sla_tracking** - SLA compliance per complaint
- complaint_id, response_due_at, resolution_due_at, escalation_due_at
- is_response_breached, is_resolution_breached, resolved_at

**escalation_rules** - Escalation configuration
- id, level, escalate_after_hours, escalate_to_role
- department_id, category_id, is_active

**escalation_history** - Escalation log
- id, complaint_id, escalation_level, reason
- escalated_from_user_id, escalated_to_user_id
- escalated_at, acknowledged_at

**auto_assignment_logs** - Assignment decision logs
- complaint_id, assigned_to_user_id, assignment_reason
- skill_match_score, workload_score, proximity_score, total_score
- candidates_considered (JSON)

**staff_skills** - Staff skill records
- user_id, category_id, skill_name, proficiency_level, is_primary

**staff_availability** - Real-time staff status
- user_id, status (available/busy/on_leave/offline)
- current_workload, max_workload, is_on_duty

**staff_shifts** - Staff scheduling
- user_id, shift_date, shift_start, shift_end
- shift_type, is_leave, backup_user_id

### Notification Tables

**notifications** - In-app notifications
- id, user_id, type, title, message
- related_complaint_id, link, is_read, read_at

**scheduled_emails** - Delayed email queue
- id, recipient_email, recipient_name, type
- complaint_data (JSON), scheduled_for, status

**sms_queue** - SMS message queue
- id, phone, name, type, message, status

**sms_preferences** - User SMS opt-in
- user_id, enabled, phone, per-type toggles

### Knowledge Base Tables

**knowledge_categories** - Article categories
- id, name, description, icon

**knowledge_articles** - Help articles
- id, category_id, title, content, author_id
- helpful_count, not_helpful_count

### System Tables

**system_config** - Key-value configuration
- key, value, description

**holidays** - Holiday calendar
- id, name, date, type

**chat_conversations** - AI chat sessions
- id, user_id, title, created_at

**chat_messages** - Chat history
- id, conversation_id, role, content

**chat_feedback** - Chat quality feedback
- message_id, rating, feedback

---

## 15. Route Map

### Public Routes

| Route | Component | Auth |
|-------|-----------|------|
| `/` | Index | No |
| `/about` | About | No |
| `/maintenance` | Maintenance | No |
| `/register-complaint` | RegisterComplaint | No |
| `/track` | TrackComplaint | No |
| `/contact` | Contact | No |
| `/login` | Login | No |
| `/register` | Register | No |
| `/forgot-password` | ForgotPassword | No |
| `/reset-password` | ResetPassword | No |
| `/staff-directory` | StaffDirectory | No |
| `/help-center` | HelpCenter | No |
| `/help` | KnowledgeBase | No |

### Protected Routes

| Route | Component | Roles |
|-------|-----------|-------|
| `/profile` | Profile | Any |
| `/notifications` | Notifications | Any |
| `/settings` | Settings | Any |

### Dashboard Routes

| Route | Component | Roles |
|-------|-----------|-------|
| `/dashboard/faculty` | FacultyDashboard | faculty |
| `/dashboard/cr` | CRDashboard | cr, admin |
| `/dashboard/hod` | HODDashboard | hod, admin, principal |
| `/dashboard/hod/pending` | HODPendingComplaints | hod, admin, principal |
| `/dashboard/hod/in-progress` | HODInProgressComplaints | hod, admin, principal |
| `/dashboard/hod/completed` | HODCompletedComplaints | hod, admin, principal |
| `/dashboard/hod/all` | HODAllComplaints | hod, admin, principal |
| `/dashboard/principal` | PrincipalDashboard | principal, admin |
| `/dashboard/principal/all` | PrincipalAllComplaints | principal, admin |
| `/dashboard/principal/delayed` | PrincipalDelayedComplaints | principal, admin |
| `/dashboard/principal/in-progress` | PrincipalInProgressComplaints | principal, admin |
| `/dashboard/principal/resolved` | PrincipalResolvedComplaints | principal, admin |
| `/dashboard/maintenance` | MaintenanceStaffDashboard | maintenance_staff, admin |
| `/dashboard/maintenance/new-assigned` | MaintenanceNewAssignedComplaints | maintenance_staff, admin |
| `/dashboard/maintenance/in-progress` | MaintenanceInProgressComplaints | maintenance_staff, admin |
| `/dashboard/maintenance/on-hold` | MaintenanceOnHoldComplaints | maintenance_staff, admin |
| `/dashboard/maintenance/completed` | MaintenanceCompletedComplaints | maintenance_staff, admin |
| `/dashboard/admin` | AdminDashboard | admin |
| `/dashboard/admin/all` | AdminAllComplaints | admin |
| `/dashboard/admin/pending` | AdminPendingComplaints | admin |
| `/dashboard/admin/in-progress` | AdminInProgressComplaints | admin |
| `/dashboard/admin/completed` | AdminCompletedComplaints | admin |
| `/dashboard/admin/users` | AdminUserManagement | admin |

### Role Priority

`admin > principal > hod > maintenance_staff > cr > faculty`

---

## 16. Deployment Guide

### Prerequisites

- Node.js v18+
- Supabase account
- Resend API key (for emails)

### Environment Variables

Create `.env` file:
```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### Setup Steps

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Run database migrations**
   - Go to Supabase Dashboard > SQL Editor
   - Run all migration files in `supabase/migrations/` in order

3. **Enable extensions**
   - Supabase Dashboard > Database > Extensions
   - Enable: `pg_cron`, `pg_net`

4. **Configure secrets**
   - Supabase Dashboard > Edge Functions > Secrets
   - Add: `RESEND_API_KEY=your_resend_api_key`

5. **Deploy edge functions**
   ```bash
   supabase functions deploy send-email
   supabase functions deploy send-digest
   ```

6. **Start development server**
   ```bash
   npm run dev
   ```

7. **Build for production**
   ```bash
   npm run build
   ```

### Available Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start Vite dev server |
| `npm run build` | Production build |
| `npm run build:dev` | Development build |
| `npm run preview` | Preview production build |
| `npm run lint` | Run ESLint |
| `npm run test` | Run Vitest tests |
| `npm run test:ui` | Run tests with UI |
| `npm run test:coverage` | Run tests with coverage |
| `npm run gen-types` | Generate Supabase types |

---

## Test Results

| Test Suite | Tests | Status |
|-----------|-------|--------|
| emailService.test.ts | 3 | Pass |
| automation.test.ts | 10 | Pass |
| button.test.tsx | 3 | Pass |
| exportUtils.test.ts | 2 | Pass |
| **Total** | **18** | **All Pass** |

---

*Documentation generated for PU UNICARE v2.0.0*
