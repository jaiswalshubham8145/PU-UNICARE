import { supabase } from "@/integrations/supabase/client";
import { Database } from "@/integrations/supabase/types";

// Email types supported by the system
export type EmailType =
    | "new_complaint"
    | "status_update"
    | "assignment"
    | "completion"
    | "sla_breach"
    | "progress_update"
    | "work_started"
    | "work_on_hold"
    | "work_resumed"
    | "verification_requested"
    | "verification_rejected"
    | "verification_approved"
    | "escalated"
    | "complaint_submitted"
    | "complaint_assigned"
    | "resolved"
    | "feedback_request"
    | "reminder"
    | "digest";

// Complaint data needed for emails
export interface ComplaintEmailData {
    id: string;
    complaint_number: string;
    title: string;
    description?: string;
    priority: string;
    status: string;
    location: string;
    department_id: string;
    submitted_by: string;
    assigned_to?: string | null;
    expected_resolution?: string | null;
    category_name?: string;
    department_name?: string;
}

// Additional context for emails
export interface EmailContext {
    updatedBy?: string;
    updatedByName?: string;
    note?: string;
    progress?: number;
    rating?: number;
    feedback?: string;
    assigneeName?: string;
    escalationLevel?: string;
    escalationReason?: string;
}

interface RecipientInfo {
    email: string;
    name: string;
    role: string;
}

/**
 * Fetches all relevant email recipients for a complaint
 * Returns emails of: submitter, assigned staff, department HOD, and admins
 */
export async function getComplaintRecipients(
    complaint: ComplaintEmailData,
    includeSubmitter = true,
    includeAssignee = true,
    includeHOD = true,
    includeAdmins = true
): Promise<RecipientInfo[]> {
    const recipients: RecipientInfo[] = [];

    try {
        const { data, error } = await supabase.rpc('get_complaint_recipients_info', {
            p_department_id: complaint.department_id || null,
            p_include_hod: includeHOD,
            p_include_admins: includeAdmins,
            p_assignee_id: includeAssignee ? complaint.assigned_to : null,
            p_submitter_id: includeSubmitter ? complaint.submitted_by : null
        });

        if (error) {
            console.error("Error fetching email recipients via RPC:", error);
            throw error;
        }

        if (data) {
            data.forEach((row: any) => {
                recipients.push({
                    email: row.email,
                    name: row.full_name,
                    role: row.role,
                });
            });
        }
    } catch (error) {
        console.error("Error fetching email recipients:", error);
    }

    return recipients;
}

/**
 * Generates email subject based on type and complaint
 */
function generateSubject(type: EmailType, complaint: ComplaintEmailData): string {
    const prefix = `[${complaint.complaint_number}]`;

    switch (type) {
        case "new_complaint":
        case "complaint_submitted":
            return `${prefix} New Complaint Registered: ${complaint.title}`;
        case "status_update":
            return `${prefix} Status Updated to ${complaint.status.replace("_", " ").toUpperCase()}`;
        case "assignment":
        case "complaint_assigned":
            return `${prefix} New Task Assigned: ${complaint.title}`;
        case "completion":
            return `${prefix} Complaint Marked as Complete`;
        case "sla_breach":
            return `⚠️ ${prefix} SLA BREACH ALERT`;
        case "escalated":
            return `⚠️ ${prefix} COMPLAINT ESCALATED`;
        case "progress_update":
            return `${prefix} Progress Update`;
        case "work_started":
            return `${prefix} Work Has Started`;
        case "work_on_hold":
            return `${prefix} Work Put On Hold`;
        case "work_resumed":
            return `${prefix} Work Resumed`;
        case "verification_requested":
            return `${prefix} Please Verify Completion`;
        case "verification_rejected":
            return `${prefix} Completion Rejected - Rework Required`;
        case "verification_approved":
            return `${prefix} Complaint Verified & Closed`;
        case "resolved":
            return `${prefix} Complaint Resolved`;
        case "feedback_request":
            return `${prefix} How did we do? Rate our service`;
        case "reminder":
            return `${prefix} Reminder: Action Needed`;
        case "digest":
            return `PU Unicare Daily Digest`;
        default:
            return `${prefix} Complaint Update`;
    }
}

/**
 * Get recipient strategy based on email type
 */
function getRecipientStrategy(type: EmailType): {
    includeSubmitter: boolean;
    includeAssignee: boolean;
    includeHOD: boolean;
    includeAdmins: boolean;
} {
    switch (type) {
        case "new_complaint":
        case "complaint_submitted":
            return { includeSubmitter: true, includeAssignee: false, includeHOD: true, includeAdmins: true };
        case "assignment":
        case "complaint_assigned":
            return { includeSubmitter: true, includeAssignee: true, includeHOD: true, includeAdmins: false };
        case "status_update":
        case "work_started":
        case "work_on_hold":
        case "work_resumed":
        case "progress_update":
            return { includeSubmitter: true, includeAssignee: false, includeHOD: true, includeAdmins: false };
        case "completion":
        case "verification_requested":
            return { includeSubmitter: true, includeAssignee: false, includeHOD: true, includeAdmins: true };
        case "verification_rejected":
            return { includeSubmitter: false, includeAssignee: true, includeHOD: true, includeAdmins: false };
        case "verification_approved":
            return { includeSubmitter: true, includeAssignee: true, includeHOD: true, includeAdmins: false };
        case "sla_breach":
        case "escalated":
            return { includeSubmitter: false, includeAssignee: true, includeHOD: true, includeAdmins: true };
        case "resolved":
        case "feedback_request":
            return { includeSubmitter: true, includeAssignee: false, includeHOD: false, includeAdmins: false };
        case "reminder":
            return { includeSubmitter: true, includeAssignee: true, includeHOD: false, includeAdmins: false };
        case "digest":
            return { includeSubmitter: false, includeAssignee: false, includeHOD: true, includeAdmins: true };
        default:
            return { includeSubmitter: true, includeAssignee: true, includeHOD: true, includeAdmins: false };
    }
}

/**
 * Main function to send complaint-related emails
 * Automatically determines recipients based on email type
 */
export async function sendComplaintEmail(
    type: EmailType,
    complaint: ComplaintEmailData,
    context: EmailContext = {}
): Promise<{ success: boolean; error?: string }> {
    try {
        // Get recipient strategy for this email type
        const strategy = getRecipientStrategy(type);

        // Fetch all relevant recipients
        const recipients = await getComplaintRecipients(
            complaint,
            strategy.includeSubmitter,
            strategy.includeAssignee,
            strategy.includeHOD,
            strategy.includeAdmins
        );

        if (recipients.length === 0) {
            console.log("No recipients found for email type:", type);
            return { success: true }; // Not an error, just no recipients
        }

        // Extract just the email addresses
        const emailAddresses = recipients.map((r) => r.email);

        // Generate subject
        const subject = generateSubject(type, complaint);

        // Build email data payload
        const emailData: Record<string, unknown> = {
            complaintNumber: complaint.complaint_number,
            title: complaint.title,
            description: complaint.description,
            priority: complaint.priority,
            status: complaint.status,
            location: complaint.location,
            departmentName: complaint.department_name,
            categoryName: complaint.category_name,
            expectedResolution: complaint.expected_resolution,
            escalationLevel: context.escalationLevel,
            escalationReason: context.escalationReason,
            ...context,
        };

        // Invoke the Edge Function
        const { error } = await supabase.functions.invoke("send-email", {
            body: {
                type,
                to: emailAddresses,
                subject,
                data: emailData,
            },
        });

        if (error) {
            console.error("Email send error:", error);
            return { success: false, error: error.message };
        }

        console.log(`Email sent successfully: ${type} to ${emailAddresses.length} recipients`);
        return { success: true };
    } catch (error) {
        const message = error instanceof Error ? error.message : "Unknown email error";
        console.error("Failed to send email:", message);
        return { success: false, error: message };
    }
}

/**
 * Helper to fetch complaint with all needed data for emails
 */
export async function getComplaintForEmail(
    complaintId: string
): Promise<ComplaintEmailData | null> {
    const { data, error } = await supabase
        .from("complaints")
        .select(`
      id,
      complaint_number,
      title,
      description,
      priority,
      status,
      location,
      department_id,
      submitted_by,
      assigned_to,
      expected_resolution,
      departments(name),
      maintenance_categories(name)
    `)
        .eq("id", complaintId)
        .single();

    if (error || !data) {
        console.error("Failed to fetch complaint for email:", error);
        return null;
    }

    return {
        id: data.id,
        complaint_number: data.complaint_number,
        title: data.title,
        description: data.description,
        priority: data.priority,
        status: data.status,
        location: data.location,
        department_id: data.department_id,
        submitted_by: data.submitted_by,
        assigned_to: data.assigned_to,
        expected_resolution: data.expected_resolution,
        department_name: (data.departments as { name: string } | null)?.name,
        category_name: (data.maintenance_categories as { name: string } | null)?.name,
    };
}
