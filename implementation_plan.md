# Master Implementation Plan (PU UNICARE v3.0)

Based on your feedback, here is the updated master plan incorporating all 23 requested features. 

## Key Constraints Applied
1. **Free Services Only**: 
   - SMS: We will use the **Fast2SMS free tier** (widely used in India).
   - AI: We will use the **Google Gemini API Free Tier** for chatbot and predictive analytics.
2. **Role Permissions**: Principal, Admin, and HOD will have permissions to add/manage inventory items.
3. **i18n Scope**: Multilingual support (Hindi/Gujarati) will be strictly limited to the `dashboard/*` routes.

---

## Proposed Changes (Phased Approach)

Because of the massive scope, features are grouped logically. 

### Phase 1: Mobile & Filing Enhancements
1. **QR Code Asset Tracking**: Add a `react-qr-scanner` to `RegisterComplaint` to auto-fill asset location and category.
2. **Geolocation Tagging (Feature 6)**: Use the HTML5 Geolocation API to attach GPS coordinates (`lat/lng`) to complaints when filed on campus.
3. **Camera Integration (Feature 7)**: Add a direct "Take Photo" button using the `<input type="file" capture="environment">` attribute.
4. **Voice Input (Feature 17)**: Add a microphone button using the Web Speech API (`SpeechRecognition`) to dictate complaint descriptions.
5. **Batch Complaint Filing (Feature 14)**: Create a new `/register-batch` route allowing users to submit multiple complaints in one go via a dynamic form array.

### Phase 2: AI, Analytics & Heatmaps
6. **Conversational AI (Feature 5)**: Upgrade `ChatWidget.tsx` with Gemini API to parse natural language into structured JSON tickets.
7. **Predictive Analytics (Feature 10)**: Create a cron Edge Function that sends historical data to Gemini to predict next week's complaint volume by department, displayed on the Admin Dashboard.
8. **Campus Heatmap & Live Dashboard (Features 9, 12)**: 
   - Integrate `leaflet` or `react-map-gl` to show a visual map of the campus.
   - Plot live complaints using the Geolocation tags (from Phase 1).
   - Create a Heatmap overlay to identify problem areas.

### Phase 3: Dashboards & Management
9. **Multilingual Dashboard (Feature 4)**: Implement `react-i18next` exclusively for `/dashboard/*` components (English, Hindi, Gujarati).
10. **Inventory Management (Feature 3)**: Create `inventory_items` and `inventory_usage` tables. Add an Inventory page for Admin, Principal, and HOD. Allow staff to log usage in `CompletionProofModal`.
11. **Calendar View (Feature 8)**: Add `react-big-calendar` to show complaint SLA deadlines and scheduled maintenance visually.
12. **Staff Performance Leaderboard (Feature 11)**: Add a gamified ranking table to the HOD/Admin dashboards calculating scores based on resolution time and star ratings.
13. **Export to Excel (Feature 13)**: Integrate `xlsx` to add an "Export to Excel" button next to the existing PDF/CSV exports.
14. **Scheduled Maintenance (Feature 23)**: Add a database table for `maintenance_windows` and display these upcoming events on the Calendar and Home page.

### Phase 4: Notifications, Feedback & Sharing
15. **Fast2SMS Notifications (Feature 2)**: Create a Supabase Edge Function to hit the Fast2SMS API for critical alerts.
16. **Complaint Sharing (Feature 16)**: Add a "Share Status" button utilizing the Web Share API (native share drawer for WhatsApp/Telegram) with deep links to `/track/:id`.
17. **Satisfaction Survey (Feature 15)**: Create a detailed Post-Resolution Survey page. Link to it in the "Resolved" email/SMS.

### Phase 5: Enterprise Features & Security
18. **Two-Factor Authentication (Feature 18)**: Enforce email-OTP 2FA for Admin, Principal, and HOD roles during login.
19. **Audit Trail (Feature 19)**: Create an `audit_logs` table that tracks every single DB mutation (who, what, when) via Supabase triggers.
20. **Bulk Import (Feature 20)**: Add a CSV parser (`papaparse`) in the Admin dashboard to migrate/import legacy complaints.
21. **API Documentation (Feature 21)**: Generate a `swagger.json` and host a Swagger UI route (`/api-docs`) for external integrations.
22. **Webhook Support (Feature 22)**: Create a `webhooks` table. Admins can register URLs. An Edge Function will POST to these URLs when complaints change status (for ERP integration).

---

## User Review Required
> [!IMPORTANT]
> Because there are 23 distinct features, executing all of them simultaneously is prone to conflict. 
> **Are you okay with me executing these phase by phase?** I will start with Phase 1, create a task list, execute it, and then proceed to the next phase.

## Verification Plan
For each phase, I will:
- Run typescript validation (`npm run check`)
- Verify Supabase DB migrations apply cleanly
- Check UI rendering locally using the development server
- Update `walkthrough.md` with screenshots/logs of the new features.
