# PU UNICARE API Documentation

## Base URL

```
https://your-project.supabase.co/functions/v1
```

## Authentication

All API requests require authentication via Supabase JWT token:

```
Authorization: Bearer <your_jwt_token>
```

## Edge Functions

### 1. Send Email

**Endpoint:** `POST /send-email`

**Description:** Sends an email notification to specified recipients.

**Request Body:**
```json
{
  "type": "new_complaint",
  "to": ["user@paruluniversity.ac.in"],
  "subject": "New Complaint Registered",
  "data": {
    "complaintNumber": "CMP-2026-0001",
    "title": "Leaking Tap",
    "priority": "medium",
    "location": "Building A, Room 101",
    "departmentName": "Civil Engineering",
    "categoryName": "Plumbing"
  }
}
```

**Email Types:**
| Type | Description |
|------|-------------|
| `new_complaint` | New complaint registered |
| `status_update` | Complaint status changed |
| `assignment` | Staff assigned to complaint |
| `completion` | Work completed |
| `sla_breach` | SLA deadline breached |
| `progress_update` | Progress update |
| `work_started` | Work started |
| `work_on_hold` | Work put on hold |
| `work_resumed` | Work resumed |
| `verification_requested` | Verification needed |
| `verification_rejected` | Verification rejected |
| `verification_approved` | Verification approved |
| `complaint_submitted` | Complaint submitted confirmation |
| `complaint_assigned` | Complaint assigned notification |
| `escalated` | Complaint escalated |
| `resolved` | Complaint resolved |
| `feedback_request` | Request feedback |
| `reminder` | Reminder notification |
| `digest` | Digest email |

**Response:**
```json
{
  "success": true,
  "id": "email_id"
}
```

### 2. Send Digest

**Endpoint:** `POST /send-digest`

**Description:** Sends digest emails and triggers escalation checks.

**Request Body:**
```json
{
  "digestType": "morning"
}
```

**Digest Types:**
- `morning` - Morning brief at 8:00 AM IST
- `evening` - Evening summary at 6:00 PM IST
- `weekly` - Weekly report on Monday

**Response:**
```json
{
  "success": true,
  "message": "Digest emails sent: 5 successful, 0 failed",
  "sentCount": 5,
  "failedCount": 0,
  "escalationCount": 2,
  "scheduledEmailsProcessed": 3
}
```

## Database Functions

### 1. Get Complaint Statistics

**Function:** `get_complaint_stats(user_id, role, department_id)`

**Parameters:**
- `user_id` (UUID, optional) - Filter by user
- `role` (TEXT, optional) - Filter by role
- `department_id` (UUID, optional) - Filter by department

**Returns:**
```sql
total BIGINT,
pending BIGINT,
in_progress BIGINT,
completed BIGINT,
escalated BIGINT,
avg_resolution_hours NUMERIC
```

### 2. Bulk Update Status

**Function:** `bulk_update_status(complaint_ids, new_status, updated_by, note)`

**Parameters:**
- `complaint_ids` (UUID[]) - Array of complaint IDs
- `new_status` (TEXT) - New status value
- `updated_by` (UUID) - User performing the update
- `note` (TEXT, optional) - Optional note

**Returns:** Number of updated records

### 3. Get Escalation Candidates

**Function:** `get_escalation_candidates()`

**Returns:**
```sql
complaint_id UUID,
complaint_number TEXT,
title TEXT,
current_level INTEGER,
hours_pending NUMERIC,
should_escalate_to TEXT,
department_name TEXT
```

### 4. Get Audit Logs

**Function:** `get_audit_logs(table_name, record_id, limit)`

**Parameters:**
- `table_name` (TEXT) - Table to search
- `record_id` (UUID) - Record ID
- `limit` (INTEGER, optional) - Max results (default 50)

**Returns:**
```sql
id UUID,
user_id UUID,
action TEXT,
old_values JSONB,
new_values JSONB,
created_at TIMESTAMPTZ,
user_name TEXT
```

### 5. Get Recent Activity

**Function:** `get_recent_activity(limit)`

**Parameters:**
- `limit` (INTEGER, optional) - Max results (default 20)

**Returns:**
```sql
id UUID,
user_name TEXT,
action TEXT,
table_name TEXT,
record_id UUID,
created_at TIMESTAMPTZ,
summary TEXT
```

## Database Views

### 1. Department Analytics

**View:** `v_department_analytics`

```sql
department_id UUID,
department_name TEXT,
total_complaints BIGINT,
pending_count BIGINT,
in_progress_count BIGINT,
completed_count BIGINT,
closed_count BIGINT,
escalated_count BIGINT,
resolution_rate NUMERIC,
avg_resolution_hours NUMERIC
```

### 2. Category Analytics

**View:** `v_category_analytics`

```sql
category_id UUID,
category_name TEXT,
total_complaints BIGINT,
pending_count BIGINT,
completed_count BIGINT,
avg_resolution_hours NUMERIC,
critical_count BIGINT,
high_count BIGINT
```

### 3. SLA Compliance

**View:** `v_sla_compliance`

```sql
complaint_id UUID,
complaint_number TEXT,
title TEXT,
priority TEXT,
status TEXT,
response_due_at TIMESTAMPTZ,
resolution_due_at TIMESTAMPTZ,
escalation_due_at TIMESTAMPTZ,
is_response_breached BOOLEAN,
is_resolution_breached BOOLEAN,
resolved_at TIMESTAMPTZ,
sla_status TEXT,
hours_elapsed NUMERIC
```

### 4. Staff Performance

**View:** `v_staff_performance`

```sql
user_id UUID,
full_name TEXT,
email TEXT,
total_assigned BIGINT,
completed_count BIGINT,
completion_rate NUMERIC,
avg_rating NUMERIC,
avg_resolution_hours NUMERIC
```

## Webhooks

### Supported Events

| Event | Description |
|-------|-------------|
| `INSERT:complaints` | New complaint created |
| `UPDATE:complaints` | Complaint updated |
| `INSERT:escalation_history` | Escalation triggered |

### Webhook Payload

```json
{
  "event": "INSERT:complaints",
  "table": "complaints",
  "operation": "INSERT",
  "timestamp": "2026-05-31T12:00:00Z",
  "data": {
    "id": "complaint-1",
    "complaint_number": "CMP-2026-0001",
    "title": "Leaking Tap",
    "status": "pending"
  }
}
```

## Error Codes

| Code | HTTP Status | Description |
|------|-------------|-------------|
| `VALIDATION_ERROR` | 400 | Invalid input data |
| `NOT_FOUND` | 404 | Resource not found |
| `UNAUTHORIZED` | 401 | Authentication required |
| `FORBIDDEN` | 403 | Insufficient permissions |
| `RATE_LIMITED` | 429 | Too many requests |
| `EXTERNAL_SERVICE_ERROR` | 502 | External service failure |
| `DATABASE_ERROR` | 500 | Database error |
| `INTERNAL_ERROR` | 500 | Internal server error |

## Rate Limits

| Endpoint | Limit | Window |
|----------|-------|--------|
| `/send-email` | 10 requests | 1 minute |
| `/send-digest` | 5 requests | 1 hour |
| General API | 60 requests | 1 minute |

## Security Headers

All responses include:

```
Content-Security-Policy: default-src 'self'...
X-Content-Type-Options: nosniff
X-XSS-Protection: 1; mode=block
X-Frame-Options: DENY
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: camera=(), microphone=()
Strict-Transport-Security: max-age=31536000
```
