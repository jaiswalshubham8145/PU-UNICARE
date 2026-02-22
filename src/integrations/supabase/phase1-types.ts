// Phase 1 Feature Types - Re-export from auto-generated types
// This file is now fully automated via `npm run gen-types`
import { Database } from './types';

// ==============================================================================
// 1. Core Types (Direct from Database)
// ==============================================================================

export type NotificationType = Database['public']['Enums']['notification_type'];

export type Notification = Database['public']['Tables']['notifications']['Row'];

export type SLARule = Database['public']['Tables']['sla_rules']['Row'];

export type SLATracking = Database['public']['Tables']['sla_tracking']['Row'];

export type ComplaintRating = Database['public']['Tables']['complaint_ratings']['Row'];

export type DepartmentAnalytics = Database['public']['Views']['department_analytics']['Row'];


// ==============================================================================
// 2. Composite Types (Joins & Relations)
// ==============================================================================

export interface NotificationWithComplaint extends Notification {
    complaints?: Database['public']['Tables']['complaints']['Row'] | null;
}

export interface SLAWithRelations extends SLARule {
    maintenance_categories?: Database['public']['Tables']['maintenance_categories']['Row'] | null;
    departments?: Database['public']['Tables']['departments']['Row'] | null;
}

export type ComplaintWithSLA = Database['public']['Tables']['complaints']['Row'] & {
    sla_tracking?: SLATracking | null;
    complaint_ratings?: ComplaintRating | null;
};

export type SLATrackingWithRelations = SLATracking & {
    sla_rules?: Pick<SLARule, 'response_time_hours' | 'resolution_time_hours' | 'escalation_time_hours'> | null;
};

// ==============================================================================
// 3. Analytics & UI Types (Data Shapes)
// ==============================================================================

export interface TrendData {
    date: string;
    total: number;
    completed: number;
    pending: number;
    in_progress: number;
}

export interface CategoryAnalytics {
    category_id: string;
    category_name: string;
    total_complaints: number;
    avg_resolution_hours?: number;
    avg_rating?: number;
}

export interface StaffPerformance {
    staff_id: string;
    staff_name: string;
    assigned_complaints: number;
    completed_complaints: number;
    avg_rating?: number;
    avg_resolution_hours?: number;
    sla_compliance_rate: number;
}
