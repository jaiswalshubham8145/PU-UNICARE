import type { Database } from "@/integrations/supabase/types";

type AppRole = Database['public']['Enums']['app_role'];

export const getPrimaryDashboard = (roles: AppRole[]) => {
  if (roles.includes("admin")) return "/dashboard/admin";
  if (roles.includes("principal")) return "/dashboard/principal";
  if (roles.includes("hod")) return "/dashboard/hod";
  if (roles.includes("cr")) return "/dashboard/cr";
  if (roles.includes("faculty")) return "/dashboard/faculty";
  if (roles.includes("maintenance_staff")) return "/dashboard/maintenance";
  return "/";
};
