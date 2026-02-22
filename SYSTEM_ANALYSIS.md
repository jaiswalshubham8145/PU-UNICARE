# System Analysis: "Mali" (Mail vs Gardener)

You asked to check the "mali system". Based on the codebase analysis, there are two possibilities for what this refers to.

## 1. Mail (Email) System (Most Likely)

The system is configured to send emails using **Resend** via a Supabase Edge Function (`send-email`).

### How it works:
1.  **Trigger**: The frontend (`AssignStaffModal`, etc.) calls `sendComplaintEmail` in `src/services/emailService.ts`.
2.  **Service**: This service invokes the Supabase function `send-email`.
3.  **Edge Function**: Located in `supabase/functions/send-email/index.ts`, this function handles the actual sending.

### Why it might "not work":
The Edge Function checks for an environment variable `RESEND_API_KEY`.
-   **If Missing**: The function **simulates** the email. It logs "RESEND_API_KEY not configured - email would be sent" and returns success (`200 OK`).
-   **Result**: The UI says "Success", but **no email is actually received**.

### How to fix:
You need to set the `RESEND_API_KEY` in your Supabase project secrets:
```bash
npx supabase secrets set RESEND_API_KEY=re_123456789...
```
(Replace with your actual Resend API Key).

## 2. Mali (Gardener) System

If you meant "Mali" as in the Hindi word for **Gardener**:

### Current Implementation:
There is no dedicated "Mali" role or system. Gardeners are treated as **Maintenance Staff**.
-   **Category**: "Gardens" is listed under the "Campus Infrastructure" category in `MaintenanceCategories.tsx`.
-   **Role**: Gardeners must be assigned the **`maintenance_staff`** role in the database to receive tasks.

### Workflow for Gardeners:
1.  **Create User**: Create a user account for the gardener.
2.  **Assign Role**: Assign them the `maintenance_staff` role (not a custom "mali" role, as that doesn't exist in the system types).
3.  **Assign Tasks**: When a complaint comes in for "Campus Infrastructure" (e.g., "Grass cutting needed"), assigning it to that user will put it on their `MaintenanceStaffDashboard`.

### Potential Issue:
If you created a custom role called "mali" in the database manually, the system **will not recognize it** because the code explicitly filters for `role = 'maintenance_staff'`.

```typescript
// AssignStaffModal.tsx
const { data: roleData } = await supabase
  .from("user_roles")
  .select("user_id")
  .eq("role", "maintenance_staff"); // Only finds maintenance_staff
```

### Solution:
Ensure all gardening staff are assigned the `maintenance_staff` role.
