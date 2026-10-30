# 🏫 PU UNICARE — Parul University Maintenance Management System

> Centralized, AI-powered digital maintenance and infrastructure management platform designed for Parul University.

---

## 📚 Project Documentation Hub

We provide three tailored documentation guides for this repository:

- 🌟 **[ALL_FEATURES.md](./ALL_FEATURES.md)** — **Complete Master Catalog of All Features**  
  *An exhaustive inventory of every single working feature, page, modal, workflow, AI automation, role dashboard, and hardware integration across the entire site.*

- 📘 **[ABOUT_PROJECT.md](./ABOUT_PROJECT.md)** — **Complete Project Guidebook (Plain-English)**  
  *Written for general readers, faculty, students, department heads, and non-technical stakeholders. Covers the problem, real-world workflows, user stories, and step-by-step lifecycles.*

- 🛠️ **[ABOUT_PROJECT_TECHNICAL.md](./ABOUT_PROJECT_TECHNICAL.md)** — **Comprehensive Technical & Architecture Manual**  
  *Written for software engineers, examiners, viva jury, and technical auditors. Covers C4 component diagrams, 3NF database schema & DDL, Row-Level Security policies, the auto-assignment scoring algorithm, SLA escalation state machines, Gemini AI pipelines, and build optimization.*

---

## 🚀 Quick Start Guide

### 1. Prerequisites
- Node.js (v18 or higher)
- npm or yarn

### 2. Installation
```bash
npm install
```

### 3. Environment Variables
Ensure `.env` contains your Supabase credentials:
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

### 4. Run Development Server
```bash
npm run dev
```
Open [http://localhost:8080](http://localhost:8080) in your web browser.

### 5. Build for Production
```bash
npm run build
```

---

## 👥 The 6 User Roles

1. **Faculty**: File issues, track tickets, verify completion, submit ratings.
2. **Class Representative (CR)**: File classroom complaints on behalf of students.
3. **Maintenance Staff**: Receive dispatch tasks, update job progress, upload photo proof.
4. **Head of Department (HOD)**: Approve tickets, monitor department status, receive SLA alerts.
5. **Principal / Leadership**: High-level university analytics, delayed ticket escalations, audit exports.
6. **System Administrator**: Manage accounts, rooms, departments, and system settings.

---

## 🛡️ License & Copyright
Developed for Parul University Maintenance Cell. All rights reserved.
