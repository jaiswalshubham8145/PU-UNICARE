import type { Database } from "@/integrations/supabase/types";

export type ComplaintRow = Database["public"]["Tables"]["complaints"]["Row"];
export type ComplaintInsert = Database["public"]["Tables"]["complaints"]["Insert"];
export type ComplaintUpdate = Database["public"]["Tables"]["complaints"]["Update"];

export type ComplaintPriority = "low" | "medium" | "high" | "critical";
export type ComplaintStatus =
  | "pending"
  | "approved"
  | "in_progress"
  | "completed"
  | "closed"
  | "rejected"
  | "on_hold";

export type ComplaintWithJoins = ComplaintRow & {
  departments?: { name: string } | null;
  maintenance_categories?: { name: string } | null;
  buildings?: { name: string } | null;
  profiles?: { full_name: string | null; email: string | null; phone_number: string | null } | null;
  assigned_staff?: { full_name: string | null; email: string | null; phone_number: string | null } | null;
  complaint_updates?: Database["public"]["Tables"]["complaint_updates"]["Row"][];
  building_id?: string | null;
};
