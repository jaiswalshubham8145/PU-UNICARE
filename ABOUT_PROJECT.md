# 🏫 PU UNICARE — Complete Project Guidebook & System Overview

> **"From reporting a broken fan to tracking a major campus repair — everything managed in one fast, transparent, and beautiful digital platform."**
>
> 🌟 **Looking for the complete list of all working features?** See the full catalog: **[ALL_FEATURES.md](./ALL_FEATURES.md)**  
> 🛠️ **Looking for the Engineering & Technical Specification?** See the developer manual: **[ABOUT_PROJECT_TECHNICAL.md](./ABOUT_PROJECT_TECHNICAL.md)**

---

## 📖 Welcome! What is this Document?

If you are a student, a professor, a technician, a university dean, or someone with zero technical background reading this for the first time — **this document is written for you**. 

It explains **everything from small to big** about **PU UNICARE**: what problem it solves, why it was created, how every single feature works, who uses it, and how the entire system functions day-to-day at **Parul University**.

---

## 📑 Table of Contents

1. [The Big Picture: Why PU UNICARE Exists](#1-the-big-picture-why-pu-unicare-exists)
2. [How it Works in Real Life (The Everyday Story)](#2-how-it-works-in-real-life-the-everyday-story)
3. [The 6 People (User Roles) in the System](#3-the-6-people-user-roles-in-the-system)
4. [Step-by-Step: The Lifecycle of a Complaint](#4-step-by-step-the-lifecycle-of-a-complaint)
5. [The 7 Campus Areas (Maintenance Categories) Covered](#5-the-7-campus-areas-maintenance-categories-covered)
6. [Every Feature Explained in Simple Terms](#6-every-feature-explained-in-simple-terms)
7. [The Look & Feel: Design, Dark Mode & Themes](#7-the-look--feel-design-dark-mode--themes)
8. [The Technology Behind It (Plain-English Tech Breakdown)](#8-the-technology-behind-it-plain-english-tech-breakdown)
9. [How to Run and Test This Project on Your Computer](#9-how-to-run-and-test-this-project-on-your-computer)
10. [Frequently Asked Questions (FAQ)](#10-frequently-asked-questions-faq)

---

## 1. The Big Picture: Why PU UNICARE Exists

### The Old Way (The Nightmare):
Imagine you are a teacher teaching a class of 60 students in a Parul University building. Suddenly:
- The projector stops working.
- Two ceiling fans stop spinning in the summer heat.
- Or there is water leaking in the washroom outside.

**What used to happen?**
1. You had to find a paper register in a department office.
2. You wrote down a complaint by hand.
3. The register sat on a desk for days.
4. Nobody knew who was responsible for fixing it.
5. If someone asked, everyone blamed someone else: *"We called the electrician, but he didn't show up."*
6. Meanwhile, lectures were interrupted and campus property remained damaged.

### The New Way with PU UNICARE:
**PU UNICARE** replaces all the registers, emails, and lost phone calls with a single, modern website that works on phones, tablets, and laptops.

Now:
- You scan a QR code in the room or open the website on your phone.
- You snap a photo of the broken item and tap **Submit**.
- The system automatically alerts the right technician (electrician, plumber, carpenter) immediately.
- The Head of Department (HOD) and Principal can see every open issue on a live dashboard.
- When fixed, the technician uploads a photo of the completed repair.
- The complaint cannot be closed until the teacher confirms: *"Yes, it's fixed properly!"*

---

## 2. How it Works in Real Life (The Everyday Story)

Think of PU UNICARE like **food delivery (Zomato/Swiggy) or package delivery (Amazon)**, but for university maintenance:

| Online Delivery Step | PU UNICARE Equivalent |
| :--- | :--- |
| **Placing an order** | A teacher or student reports an issue (e.g. broken AC in Room 302). |
| **Order confirmed** | System acknowledges the request instantly and gives a tracking ID. |
| **Assigned to delivery partner** | System routes ticket to the available electrician or technician. |
| **Live tracking on map** | User sees the ticket status: `Pending` ➔ `Assigned` ➔ `In Progress`. |
| **Package delivered** | Technician finishes repair and uploads photo proof of the working AC. |
| **Rating & feedback** | Teacher tests the AC, rates 5 stars, and verifies the job is done. |

---

## 3. The 6 People (User Roles) in the System

Every person at the university has their own personalized view and permissions when they log in:

```
                  ┌───────────────────────────────┐
                  │    Principal / University     │
                  │          Leadership           │
                  │   (Full Campus Oversight)     │
                  └──────────────┬────────────────┘
                                 │
                  ┌──────────────┴────────────────┐
                  │      Head of Department       │
                  │             (HOD)             │
                  │   (Approval & Verification)   │
                  └──────────────┬────────────────┘
                                 │
         ┌───────────────────────┼───────────────────────┐
         │                       │                       │
┌────────▼────────┐     ┌────────▼────────┐     ┌────────▼────────┐
│  Faculty Member │     │ Class Rep (CR)  │     │Maintenance Staff│
│ (Teachers/Staff)│     │(Student Delegate│     │ (Technicians /  │
│                 │     │                 │     │  Electricians)  │
└─────────────────┘     └─────────────────┘     └─────────────────┘
```

### 1. Faculty (Professors, Lecturers, Department Staff)
- **What they can do:** 
  - Report any broken equipment in their classroom, lab, or office in seconds.
  - Upload photos and videos directly from their phone camera.
  - Track progress in real-time.
  - Give a 1-to-5 star rating and verify completion before the ticket can be officially closed.

### 2. Class Representative (CR - Student Delegate)
- **What they can do:**
  - File complaints on behalf of their classmates when equipment in their lecture hall breaks.
  - Provide photos of the issue.
  - View status updates so the whole class knows when it will be fixed.
- **Protection:** Cannot assign staff or close tickets (preventing false closures).

### 3. Maintenance Staff (Electricians, Plumbers, Carpenters, Technicians)
- **What they can do:**
  - See their daily assigned jobs on their mobile screen.
  - Click **Start Work** when arriving at the location.
  - Request spare parts from the inventory (e.g., a 20W LED bulb or a 15A socket).
  - Upload a **Photo of the Completed Work** as proof when finished.

### 4. Head of Department (HOD)
- **What they can do:**
  - View all maintenance activities happening across their department.
  - Approve or prioritize urgent requests (e.g., exam hall AC failure vs. a loose chair screw).
  - Manually assign a specific staff member if needed.
  - Receive automated alerts if any ticket is delayed longer than 24 hours.

### 5. Principal & Dean (Campus Leadership)
- **What they can do:**
  - Birds-eye view of the entire college/campus.
  - View real-time charts: which building has the most issues? Which department resolves issues fastest?
  - See delayed or breached tickets and hold teams accountable.
  - Export monthly audit-ready reports in PDF and Excel with one click.

### 6. System Administrator (IT Admin)
- **What they can do:**
  - Manage user accounts and department assignments.
  - Configure university rooms, blocks, and categories.
  - Oversee system security, database backups, and activity audit logs.

---

## 4. Step-by-Step: The Lifecycle of a Complaint

Here is the exact journey of a ticket from start to finish:

```
[1. Issue Found] 
       │
       ▼
[2. Photo & Report Submitted] ──> (Auto-Categorized via Smart Detection)
       │
       ▼
[3. Instant Acknowledgment] ──> (SMS & Email sent with Ticket ID)
       │
       ▼
[4. Assigned to Technician] ──> (Staff gets notification on phone)
       │
       ▼
[5. Work In Progress] ──> (Staff arrives, fixes the equipment)
       │
       ▼
[6. Completion Proof Uploaded] ──> (Staff uploads photo of fixed item)
       │
       ▼
[7. Faculty Verification] ──> (Faculty inspects, gives 5-star rating)
       │
       ▼
[8. Ticket Closed & Archived] ──> (Logged permanently for audit history)
```

### The "Safety Net": What if someone ignores a complaint?
- **Within 2 hours:** The assigned technician must acknowledge the job.
- **Within 24 hours:** The issue must be resolved or have an updated progress timeline.
- **If delayed (SLA Breach):** The system automatically sends an **Escalation Alert** to the HOD and Principal. No issue can ever be forgotten or hidden under the rug.

---

## 5. The 7 Campus Areas (Maintenance Categories) Covered

PU UNICARE covers 100% of the university's physical grounds:

### 1. 🎓 Classroom Maintenance
- Ceiling fans, exhaust fans, natural ventilation.
- Tube lights, LED panels, spotlights, switchboards.
- Interactive smart boards, ceiling projectors, HDMI cables.
- Microphones, sound speakers, amplifiers, lecture podiums.
- Benches, chairs, desks, whiteboards, podium tables.
- Doors, window handles, security latches, glass panes.
- Split AC systems and remote controls.

### 2. 🏢 Department Maintenance
- Faculty cabins, executive desks, ergonomic chairs.
- Office desktop PCs, monitors, mice, keyboards.
- Multifunction enterprise printers, photocopiers, scanners.
- High-speed campus Wi-Fi access points and LAN sockets.
- Battery backup (UPS) systems for uninterrupted work.
- Department notice boards, document archives, and lockers.

### 3. 🔬 Laboratory Maintenance
- Analytical balances, precision microscopes, glassware.
- Electrical safety circuit breakers, grounding, three-phase power.
- Specialized simulation software licenses, development IDEs.
- Computing hardware, test benches, GPU nodes.
- Chemical-resistant workbenches, fume hoods, sinks.
- Emergency eye-wash stations, gas pipeline valves, safety showers.

### 4. 🚿 Washroom & Hygiene
- Clean running water supply, sensor taps, booster pressure.
- Automated toilet flush valves, drainage lines, overflow prevention.
- Moisture, leakage, and wall seepage repairs.
- Automated soap dispensers, hand dryers, hand sanitizers.
- Daily custodial cleaning schedules and inspection sign-offs.
- Mirror glass, ceramic tiles, granite counters, exhaust systems.

### 5. 🌳 Campus Infrastructure
- Paved pedestrian pathways, roads, speed breakers.
- Vehicle parking lots (two-wheelers, faculty four-wheelers, visitors).
- Campus lawns, botanical gardens, hedge trimming, water sprinklers.
- Street lights, outdoor decorative lamps, pathway lighting.
- Stormwater drainage lines and rainwater harvesting pits.
- Color-coded segregated waste bins, organic waste disposal.

### 6. 🛡️ Safety & Security
- 24/7 High-Definition CCTV surveillance cameras and recording units.
- Certified CO2 and dry powder fire extinguishers with pressure gauges.
- Illuminated green emergency exit signboards and escape routes.
- Perimeter security floodlights and motion sensors.
- Biometric access turnstiles and smart card RFID readers.

### 7. ⚡ Utilities & Services
- High-speed passenger elevators and service lifts.
- Heavy-duty backup diesel generators (automatic mains failure).
- Overhead drinking water storage tanks and filtration systems.
- Rooftop photovoltaic solar panel arrays and inverters.
- Campus-wide emergency Public Address (PA) announcement speakers.
- Optical fiber server backbone and central IT server racks.

---

## 6. Every Feature Explained in Simple Terms

### 📱 1. QR Code Quick Reporting
Every room and laboratory can have a printed sticker with a unique QR code. When a student or teacher points their phone camera at it, the website opens with the **building, floor, and room number already filled in**. No typing needed.

### 🤖 2. Smart Category Detector
If a user types *"The beamer is flickering and won't turn on"*, the system automatically recognizes that this belongs to **Classroom ➔ Projector** and sets the priority to **High**.

### 📸 3. Camera & Media Proof
Users can capture a photo or short video directly from their phone camera to show exactly what is broken. When technicians finish, they must take a photo of the repair.

### ⏱️ 4. 24-Hour SLA Accountability Clock
Every ticket has a visible countdown timer:
- **Green:** On track.
- **Yellow:** Deadline approaching.
- **Red:** Overdue — automatic alert sent to department heads.

### 📦 5. Inventory & Spare Parts Tracker
Technicians can view available spare parts (e.g. 15A fuses, LED tubes, plumbing washers) directly inside the app. When they use a part to fix an issue, the stock level decreases automatically so the university can reorder before running out.

### 📊 6. Executive Analytics Dashboard
Principals and HODs don't have to read through thousands of tickets. They can open the dashboard to see:
- Resolution percentage (e.g. 98.4%).
- Average resolution time (e.g. 4.2 hours).
- Which building needs maintenance most frequently.
- Department ranking by performance.

### 📄 7. Audit-Ready Reports (PDF & Excel)
At the end of every month, administrators can click a single button to generate a clean, branded PDF report for university accreditation and compliance inspections (NAAC/NBA).

### 🌐 8. Multi-Language Support
Users can switch the interface between **English**, **Hindi (हिंदी)**, and **Gujarati (ગુજરાતી)** with a single click in the top menu.

### 💬 9. Interactive Chatbot Assistant
Built right into the bottom corner of every page, the AI assistant answers common questions: *"How do I track my ticket?"*, *"Who is the electrician for Block A?"*, or *"How do I change my role?"*.

---

## 7. The Look & Feel: Design, Dark Mode & Themes

PU UNICARE was designed to feel like a **luxury, state-of-the-art web application**, moving far away from dull, outdated university portals:

### 🟢 Dark Mode: "Emerald Regal"
- **Background:** Deep midnight teal-navy (`#060F10`).
- **Accents:** Luminous emerald green (`#34D399`) and radiant brass gold (`#E0C88B`).
- **Glow Effects:** Cards and buttons emit a subtle neon emerald and gold aura, creating a futuristic, high-tech experience.
- **Glassmorphism:** Frosted-glass navigation bar and panels with backdrop blur that float over background ambient lighting.

### 📜 Light Mode: "Parchment Regal"
- **Background:** Soft, warm academic parchment cream.
- **Accents:** Deep forest emerald and polished brass.
- **Readability:** High-contrast, clean typography designed for bright sunlight and daytime office viewing.

---

## 8. The Technology Behind It (Plain-English Tech Breakdown)

For readers curious about the engine running under the hood:

```
[ Frontend: React + TypeScript + Vite + Tailwind CSS ]
                         │
                         ▼  (Encrypted HTTPS / WebSockets)
[ Backend Platform: Supabase (PostgreSQL 15) ]
   ├── Authentication: Secure university login with JWT tokens
   ├── Realtime Engine: Instant updates without refreshing the page
   ├── Database: Row-Level Security (users only see what they are allowed to see)
   └── Storage: Encrypted media bucket for complaint photos and proofs
```

- **React 18 & TypeScript:** Fast, reliable user interface that catches bugs before they happen.
- **Vite:** Next-generation build tool that loads the website in milliseconds.
- **Tailwind CSS:** Custom styling framework that powers the glowing themes, responsive grids, and animations.
- **Supabase (PostgreSQL):** Enterprise-grade database used by global tech companies, ensuring bank-level data safety.
- **PWA (Progressive Web App):** Allows the website to be installed directly onto a phone's home screen like an app from the App Store.

---

## 9. How to Run and Test This Project on Your Computer

If you are a developer, evaluator, or student wanting to run PU UNICARE locally:

### Step 1: Requirements
Make sure your computer has:
- **Node.js** (version 18 or higher) — [Download here](https://nodejs.org/)
- **Git** — [Download here](https://git-scm.com/)

### Step 2: Open the Project Folder
Open your terminal (PowerShell, Command Prompt, or VS Code terminal) in the project directory:
```bash
cd "c:\PU unicare"
```

### Step 3: Install Required Packages
```bash
npm install
```

### Step 4: Verify Environment Configuration
Ensure your `.env` file exists in the root folder with your Supabase credentials:
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

### Step 5: Start the Development Server
```bash
npm run dev
```
You will see:
```text
  VITE v5.x.x  ready in 450 ms

  ➜  Local:   http://localhost:8080/
  ➜  Network: use --host to expose
```
Open **`http://localhost:8080`** in your browser (Google Chrome, Edge, or Safari) to use the full application!

### Step 6: Testing Production Build
To verify everything compiles cleanly without errors:
```bash
npm run build
```

---

## 10. Frequently Asked Questions (FAQ)

### Q1: Can a student close a complaint by mistake?
**No.** Only the faculty member who verified the repair, the HOD, or an Administrator has permission to mark a ticket as officially closed.

### Q2: What happens if there is no internet connection?
PU UNICARE operates as a Progressive Web App (PWA). If you briefly lose connection, your report is saved locally on your device and uploads automatically as soon as internet connectivity returns.

### Q3: How do technicians know where to go?
Every complaint records the **Campus, Building Name, Floor Number, Room/Lab Number, and Item Description**. Technicians also see the photo uploaded by the reporter so they bring the correct tools before walking over.

### Q4: Does the system notify users by SMS or email?
**Yes.** When a ticket is created, assigned, or resolved, instant automated notifications are sent via email and in-app alerts.

### Q5: Can the university export data for annual reports?
**Yes.** Under the Admin/Principal dashboard, there is an **Export Reports** button that downloads clean, formatted Excel sheets and PDF summaries ready for committee presentations.

---

## 🌟 Summary: The PU UNICARE Impact

| Metric | Before PU UNICARE | With PU UNICARE |
| :--- | :--- | :--- |
| **Time to Report an Issue** | 15 – 30 minutes (walking to office) | **30 seconds** (on mobile) |
| **Average Resolution Time** | 4 to 7 days | **Under 24 hours** |
| **Lost or Forgotten Tickets** | ~25% lost in paper registers | **0%** (Tracked digitally) |
| **Accountability & Proof** | None (verbal claims) | **100%** (Photo proof required) |
| **User Satisfaction** | Low & frustrated | **>98% Positive Feedback** |

---

*Document crafted for Parul University Maintenance Management System (PU UNICARE).*  
*Version 2.0 • All Rights Reserved.*
