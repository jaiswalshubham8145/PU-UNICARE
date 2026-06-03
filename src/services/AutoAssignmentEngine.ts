/**
 * AutoAssignmentEngine - Intelligent staff assignment
 * 
 * This service automatically assigns complaints to the best available
 * maintenance staff based on skills, workload, and other factors.
 */

import { supabase } from '@/integrations/supabase/client';
import { sendComplaintEmail, ComplaintEmailData, getComplaintForEmail } from './emailService';

export interface StaffSkill {
    id: string;
    user_id: string;
    category_id: string | null;
    skill_name: string;
    proficiency_level: number;
    is_primary: boolean;
    years_experience: number;
    certifications: string[];
}

export interface StaffAvailability {
    id: string;
    user_id: string;
    status: 'available' | 'busy' | 'on_leave' | 'offline';
    current_workload: number;
    max_workload: number;
    is_on_duty: boolean;
    last_seen_at: string;
    location_lat?: number;
    location_lng?: number;
}

export interface StaffCandidate {
    user_id: string;
    full_name: string;
    email: string;
    phone?: string;
    avatar_url?: string;
    skill_score: number;
    workload_score: number;
    proximity_score: number;
    total_score: number;
    current_workload: number;
    max_workload: number;
    skills: string[];
    status: string;
}

export interface AssignmentLog {
    complaint_id: string;
    assigned_to_user_id: string | null;
    assignment_reason: string;
    skill_match_score: number;
    workload_score: number;
    proximity_score: number;
    total_score: number;
    candidates_considered: StaffCandidate[];
}

export interface AutoAssignmentConfig {
    skillWeight: number;  // 0-1, how much to weight skill match
    workloadWeight: number;  // 0-1, how much to weight workload availability
    proximityWeight: number;  // 0-1, how much to weight physical proximity
    minSkillLevel: number;  // Minimum required skill level (1-5)
    maxWorkloadPercentage: number;  // Max workload % before staff is skipped
    preferPrimarySkill: boolean;  // Only assign to staff with primary skill match
}

const DEFAULT_CONFIG: AutoAssignmentConfig = {
    skillWeight: 0.5,
    workloadWeight: 0.35,
    proximityWeight: 0.15,
    minSkillLevel: 1,
    maxWorkloadPercentage: 80,
    preferPrimarySkill: false
};

class AutoAssignmentEngine {
    private config: AutoAssignmentConfig;

    constructor(config: Partial<AutoAssignmentConfig> = {}) {
        this.config = { ...DEFAULT_CONFIG, ...config };
    }

    /**
     * Find the best available staff for a complaint
     */
    async findBestStaff(
        categoryId: string | null,
        departmentId: string,
        priority: string = 'medium',
        buildingLocation?: { lat: number; lng: number }
    ): Promise<StaffCandidate[]> {
        // 1. Get maintenance staff in the specific department
        let staffIds = await this.getMaintenanceStaffIds(departmentId);

        // 2. FALLBACK: If no staff in department, get ALL maintenance staff
        let isFallback = false;
        if (staffIds.length === 0) {
            console.warn(`No maintenance staff found in department ${departmentId}. Falling back to all departments.`);
            staffIds = await this.getAllMaintenanceStaffIds();
            isFallback = true;
        }

        if (staffIds.length === 0) {
            console.error('No maintenance staff found in the entire system!');
            return [];
        }

        const { data: staffProfiles, error: profileError } = await supabase
            .from('profiles')
            .select(`
        user_id,
        full_name,
        email,
        phone,
        avatar_url
      `)
            .in('user_id', staffIds);

        if (profileError) {
            console.error('Error fetching staff profiles:', profileError);
            return [];
        }

        // Get skills for all staff (only filter by category if categoryId is provided)
        let skillsQuery = supabase
            .from('staff_skills')
            .select('*');

        if (categoryId) {
            skillsQuery = skillsQuery.eq('category_id', categoryId);
        }

        const { data: allSkills } = await skillsQuery;

        // Get availability for all staff
        const { data: allAvailability } = await supabase
            .from('staff_availability')
            .select('*');

        const candidates: StaffCandidate[] = [];

        for (const profile of staffProfiles || []) {
            const skills = allSkills?.filter(s => s.user_id === profile.user_id) || [];
            const availability = allAvailability?.find(a => a.user_id === profile.user_id);

            // Skip if explicitly not available (on_leave or offline)
            // If no availability record exists, treat them as available
            if (availability && availability.status !== 'available' && availability.status !== 'busy') {
                continue;
            }

            // Skip if over workload threshold
            if (availability) {
                const workloadPercentage = (availability.current_workload / availability.max_workload) * 100;
                if (workloadPercentage >= this.config.maxWorkloadPercentage) {
                    continue;
                }
            }

            // Calculate skill score
            let skillScore = 0;
            if (categoryId) {
                const relevantSkill = skills.find(s => s.category_id === categoryId);
                if (relevantSkill) {
                    skillScore = relevantSkill.proficiency_level / 5; // Normalize to 0-1
                    if (relevantSkill.proficiency_level < this.config.minSkillLevel) {
                        continue; // Skip if below minimum skill level
                    }
                    if (this.config.preferPrimarySkill && !relevantSkill.is_primary) {
                        skillScore *= 0.5; // Reduce score if not primary skill
                    }
                } else if (skills.length === 0) {
                    // No skills registered - assign base score
                    skillScore = 0.3;
                }
            } else {
                // No category specified - assign base score to all staff
                skillScore = 0.5;
            }

            // Calculate workload score (higher is better - more capacity)
            let workloadScore = 1;
            if (availability) {
                workloadScore = 1 - (availability.current_workload / availability.max_workload);
            }

            // Calculate proximity score
            let proximityScore = 0.5; // Default middle score
            if (buildingLocation && availability?.location_lat && availability?.location_lng) {
                const distance = this.calculateDistance(
                    buildingLocation.lat,
                    buildingLocation.lng,
                    availability.location_lat,
                    availability.location_lng
                );
                // Assume max campus distance is ~2km, normalize score
                proximityScore = Math.max(0, 1 - (distance / 2));
            }

            // Calculate total weighted score
            let totalScore =
                (skillScore * this.config.skillWeight) +
                (workloadScore * this.config.workloadWeight) +
                (proximityScore * this.config.proximityWeight);

            // Apply penalty if it's a fallback (different department)
            if (isFallback) {
                totalScore *= 0.7; // 30% penalty for being in a different department
            }

            candidates.push({
                user_id: profile.user_id,
                full_name: profile.full_name,
                email: profile.email,
                phone: profile.phone,
                avatar_url: profile.avatar_url,
                skill_score: Math.round(skillScore * 100) / 100,
                workload_score: Math.round(workloadScore * 100) / 100,
                proximity_score: Math.round(proximityScore * 100) / 100,
                total_score: Math.round(totalScore * 100) / 100,
                current_workload: availability?.current_workload || 0,
                max_workload: availability?.max_workload || 5,
                skills: skills.map(s => s.skill_name),
                status: availability?.status || 'available'
            });
        }

        // Sort by total score descending
        candidates.sort((a, b) => b.total_score - a.total_score);

        // For critical priority, boost staff with highest skill
        if (priority === 'critical') {
            candidates.sort((a, b) => {
                const skillDiff = b.skill_score - a.skill_score;
                if (Math.abs(skillDiff) > 0.2) return skillDiff;
                return b.total_score - a.total_score;
            });
        }

        return candidates;
    }

    /**
     * Get IDs of all maintenance staff in a department
     */
    private async getMaintenanceStaffIds(departmentId: string): Promise<string[]> {
        const { data, error } = await supabase
            .from('user_roles')
            .select('user_id')
            .eq('role', 'maintenance_staff')
            .eq('department_id', departmentId);

        if (error) {
            console.error('Error fetching maintenance staff:', error);
            return [];
        }

        return data?.map(d => d.user_id) || [];
    }

    /**
     * Get IDs of all maintenance staff in the system
     */
    private async getAllMaintenanceStaffIds(): Promise<string[]> {
        const { data, error } = await supabase
            .from('user_roles')
            .select('user_id')
            .eq('role', 'maintenance_staff');

        if (error) {
            console.error('Error fetching all maintenance staff:', error);
            return [];
        }

        return data?.map(d => d.user_id) || [];
    }

    /**
     * Auto-assign a complaint to the best available staff
     */
    /**
     * Determine the best assignment before inserting into the database
     */
    async determineAssignment(
        categoryId: string | null,
        departmentId: string,
        priority: string = 'medium'
    ): Promise<{
        candidate: StaffCandidate;
        isFallback: boolean;
        fallbackReasonText: string;
        candidatesList: StaffCandidate[];
    } | null> {
        console.log('[AutoAssign] Starting assignment determination...');
        console.log('[AutoAssign] Department:', departmentId, '| Category:', categoryId, '| Priority:', priority);

        // 1. Try the scored candidate search (maintenance staff with skills/workload/proximity)
        const candidates = await this.findBestStaff(categoryId, departmentId, priority);
        console.log('[AutoAssign] findBestStaff returned', candidates.length, 'candidates');

        if (candidates.length > 0) {
            const bestCandidate = candidates[0];
            console.log('[AutoAssign] ✅ Best candidate found:', bestCandidate.full_name, '| Score:', bestCandidate.total_score);
            return {
                candidate: bestCandidate,
                isFallback: false,
                fallbackReasonText: '',
                candidatesList: candidates
            };
        }

        // 2. Use the SECURITY DEFINER RPC function to find fallback candidates
        // This bypasses RLS so even students can find HOD/admin for assignment
        console.log('[AutoAssign] No scored candidates. Using RPC fallback (find_auto_assignment_candidate)...');
        
        try {
            const { data: rpcResult, error: rpcError } = await supabase
                .rpc('find_auto_assignment_candidate', {
                    _department_id: departmentId,
                    _category_id: categoryId
                });

            if (rpcError) {
                console.error('[AutoAssign] RPC error:', rpcError.message);
            }

            if (rpcResult && rpcResult.length > 0) {
                const fallback = rpcResult[0];
                console.log('[AutoAssign] ✅ RPC fallback found:', fallback.candidate_name, '| Role:', fallback.candidate_role, '| Reason:', fallback.assignment_reason);
                
                const bestCandidate: StaffCandidate = {
                    user_id: fallback.candidate_user_id,
                    full_name: fallback.candidate_name || 'System Handler',
                    email: fallback.candidate_email || '',
                    phone: '',
                    avatar_url: '',
                    skill_score: 0.5,
                    workload_score: 0.5,
                    proximity_score: 0.5,
                    total_score: 0.5,
                    current_workload: 0,
                    max_workload: 5,
                    skills: [],
                    status: 'available'
                };

                return {
                    candidate: bestCandidate,
                    isFallback: true,
                    fallbackReasonText: fallback.assignment_reason || `Auto-assigned to ${fallback.candidate_role}`,
                    candidatesList: []
                };
            }
        } catch (rpcCallError) {
            console.error('[AutoAssign] RPC call failed:', rpcCallError);
        }

        // 3. Direct query fallback (for cases where RPC function doesn't exist yet)
        console.log('[AutoAssign] RPC not available. Trying direct query fallback...');
        
        // Try HOD for this department
        const { data: hodRoles } = await supabase
            .from('user_roles')
            .select('user_id')
            .eq('role', 'hod')
            .eq('department_id', departmentId);

        let fallbackUserId: string | null = null;
        let fallbackReason = 'Auto-assigned to HOD (Fallback: No active maintenance staff)';

        if (hodRoles && hodRoles.length > 0) {
            fallbackUserId = hodRoles[0].user_id;
            console.log('[AutoAssign] Found HOD via direct query:', fallbackUserId);
        } else {
            // Try any admin or HOD in system
            const { data: anyStaff } = await supabase
                .from('user_roles')
                .select('user_id, role')
                .in('role', ['admin', 'hod'])
                .limit(1);
            if (anyStaff && anyStaff.length > 0) {
                fallbackUserId = anyStaff[0].user_id;
                fallbackReason = `Auto-assigned to ${anyStaff[0].role.toUpperCase()} (Fallback)`;
                console.log('[AutoAssign] Found admin/HOD via direct query:', fallbackUserId);
            } else {
                console.log('[AutoAssign] No HOD/admin found via direct query either');
            }
        }

        if (fallbackUserId) {
            const { data: profile } = await supabase
                .from('profiles')
                .select('full_name, email, phone, avatar_url')
                .eq('user_id', fallbackUserId)
                .single();

            const bestCandidate: StaffCandidate = {
                user_id: fallbackUserId,
                full_name: profile?.full_name || 'System Handler',
                email: profile?.email || '',
                phone: profile?.phone || '',
                avatar_url: profile?.avatar_url || '',
                skill_score: 0.5,
                workload_score: 0.5,
                proximity_score: 0.5,
                total_score: 0.5,
                current_workload: 0,
                max_workload: 5,
                skills: [],
                status: 'available'
            };

            return {
                candidate: bestCandidate,
                isFallback: true,
                fallbackReasonText: fallbackReason,
                candidatesList: []
            };
        }

        console.warn('[AutoAssign] ❌ No candidates found at any level. Complaint will remain pending.');
        return null;
    }

    /**
     * Auto-assign a complaint to the best available staff (Legacy/Update method)
     */
    async autoAssign(
        complaintId: string,
        categoryId: string | null,
        departmentId: string,
        priority: string = 'medium'
    ): Promise<AssignmentLog | null> {
        const assignmentDetails = await this.determineAssignment(categoryId, departmentId, priority);
        if (!assignmentDetails) return null;

        const { candidate: bestCandidate, isFallback: isFallbackAssignment, fallbackReasonText, candidatesList: candidates } = assignmentDetails;

        // Assign the complaint
        const { error: updateError } = await supabase
            .from('complaints')
            .update({
                assigned_to: bestCandidate.user_id,
                approved_by: bestCandidate.user_id,
                status: 'approved',
                is_auto_assigned: true,
                updated_at: new Date().toISOString()
            })
            .eq('id', complaintId);

        if (updateError) {
            console.error('Error assigning complaint:', updateError);
            throw updateError;
        }

        // Log the status change in complaint_updates
        const { error: updateLogError } = await supabase
            .from('complaint_updates')
            .insert({
                complaint_id: complaintId,
                status: 'approved',
                updated_by: bestCandidate.user_id,
                note: `Auto-assigned to ${bestCandidate.full_name}. ${isFallbackAssignment ? fallbackReasonText : this.getAssignmentReason(bestCandidate)}`,
            });

        if (updateLogError) {
            console.warn('Error logging complaint update (non-fatal):', updateLogError.message);
        }

        // Log the assignment
        const assignmentReason = isFallbackAssignment ? fallbackReasonText : this.getAssignmentReason(bestCandidate);
        const assignmentLog: AssignmentLog = {
            complaint_id: complaintId,
            assigned_to_user_id: bestCandidate.user_id,
            assignment_reason: assignmentReason,
            skill_match_score: bestCandidate.skill_score,
            workload_score: bestCandidate.workload_score,
            proximity_score: bestCandidate.proximity_score,
            total_score: bestCandidate.total_score,
            candidates_considered: candidates.slice(0, 5) // Top 5 candidates
        };

        const { error: logError } = await supabase
            .from('auto_assignment_logs')
            .insert({
                complaint_id: assignmentLog.complaint_id,
                assigned_to_user_id: assignmentLog.assigned_to_user_id,
                assignment_reason: assignmentLog.assignment_reason,
                skill_match_score: assignmentLog.skill_match_score,
                workload_score: assignmentLog.workload_score,
                proximity_score: assignmentLog.proximity_score,
                total_score: assignmentLog.total_score,
                candidates_considered: JSON.stringify(assignmentLog.candidates_considered)
            });

        if (logError) {
            // Log error but don't fail the assignment
            console.warn('Error logging assignment (non-fatal):', logError.message);
        }

        // Create notification for assigned staff
        await this.notifyAssignment(complaintId, bestCandidate.user_id);

        // Send email notification for auto-assignment
        await this.sendAssignmentEmail(complaintId, bestCandidate.user_id, assignmentLog.assignment_reason);

        return assignmentLog;
    }

    /**
     * Log and notify about an assignment (split from autoAssign)
     */
    async logAndNotifyAssignment(
        complaintId: string,
        assignmentDetails: {
            candidate: StaffCandidate;
            isFallback: boolean;
            fallbackReasonText: string;
            candidatesList: StaffCandidate[];
        }
    ): Promise<AssignmentLog> {
        const { candidate: bestCandidate, isFallback: isFallbackAssignment, fallbackReasonText, candidatesList: candidates } = assignmentDetails;
        
        // Log the assignment
        const assignmentReason = isFallbackAssignment ? fallbackReasonText : this.getAssignmentReason(bestCandidate);
        const assignmentLog: AssignmentLog = {
            complaint_id: complaintId,
            assigned_to_user_id: bestCandidate.user_id,
            assignment_reason: assignmentReason,
            skill_match_score: bestCandidate.skill_score,
            workload_score: bestCandidate.workload_score,
            proximity_score: bestCandidate.proximity_score,
            total_score: bestCandidate.total_score,
            candidates_considered: candidates.slice(0, 5) // Top 5 candidates
        };

        const { error: logError } = await supabase
            .from('auto_assignment_logs')
            .insert({
                complaint_id: assignmentLog.complaint_id,
                assigned_to_user_id: assignmentLog.assigned_to_user_id,
                assignment_reason: assignmentLog.assignment_reason,
                skill_match_score: assignmentLog.skill_match_score,
                workload_score: assignmentLog.workload_score,
                proximity_score: assignmentLog.proximity_score,
                total_score: assignmentLog.total_score,
                candidates_considered: JSON.stringify(assignmentLog.candidates_considered)
            });

        if (logError) {
            console.warn('Error logging assignment (non-fatal):', logError.message);
        }

        // Create notification for assigned staff
        await this.notifyAssignment(complaintId, bestCandidate.user_id);

        // Send email notification for auto-assignment
        await this.sendAssignmentEmail(complaintId, bestCandidate.user_id, assignmentLog.assignment_reason);

        return assignmentLog;
    }

    /**
     * Generate human-readable reason for assignment
     */
    private getAssignmentReason(candidate: StaffCandidate): string {
        const reasons: string[] = [];

        if (candidate.skill_score >= 0.8) {
            reasons.push('Expert skill match');
        } else if (candidate.skill_score >= 0.6) {
            reasons.push('Good skill match');
        }

        if (candidate.workload_score >= 0.8) {
            reasons.push('Low current workload');
        } else if (candidate.workload_score >= 0.5) {
            reasons.push('Available capacity');
        }

        if (candidate.proximity_score >= 0.7) {
            reasons.push('Nearby location');
        }

        if (reasons.length === 0) {
            reasons.push('Best available staff');
        }

        return reasons.join(', ');
    }

    /**
     * Notify staff of new assignment
     */
    private async notifyAssignment(complaintId: string, userId: string): Promise<void> {
        const { data: complaint } = await supabase
            .from('complaints')
            .select('complaint_number, title, priority')
            .eq('id', complaintId)
            .single();

        if (!complaint) return;

        const priorityEmoji =
            complaint.priority === 'critical' ? '🔴' :
                complaint.priority === 'high' ? '🟠' :
                    complaint.priority === 'medium' ? '🟡' : '🟢';

        await supabase.from('notifications').insert({
            user_id: userId,
            type: 'complaint_assigned',
            title: `${priorityEmoji} New Task Assigned`,
            message: `You have been assigned a new ${complaint.priority} priority task: "${complaint.title}"`,
            related_complaint_id: complaintId,
            link: `/dashboard/maintenance/new-assigned`
        });
    }

    /**
     * Send email notification for auto-assignment
     */
    private async sendAssignmentEmail(complaintId: string, assignedUserId: string, reason: string): Promise<void> {
        try {
            const complaintData = await getComplaintForEmail(complaintId);
            if (!complaintData) return;

            // Get assigned staff profile
            const { data: assigneeProfile } = await supabase
                .from('profiles')
                .select('email, full_name')
                .eq('user_id', assignedUserId)
                .single();

            if (!assigneeProfile?.email) return;

            const emailData: ComplaintEmailData = {
                id: complaintData.id,
                complaint_number: complaintData.complaint_number,
                title: complaintData.title,
                description: complaintData.description,
                priority: complaintData.priority,
                status: complaintData.status,
                location: complaintData.location,
                department_id: complaintData.department_id,
                submitted_by: complaintData.submitted_by,
                assigned_to: assignedUserId,
                category_name: complaintData.category_name,
                department_name: complaintData.department_name,
            };

            await sendComplaintEmail('assignment', emailData, {
                assigneeName: assigneeProfile.full_name,
                note: `Auto-assigned: ${reason}`,
            });
        } catch (error) {
            // Non-fatal: log but don't fail the assignment
            console.error('Failed to send auto-assignment email:', error);
        }
    }

    /**
     * Calculate distance between two coordinates (Haversine formula)
     */
    private calculateDistance(
        lat1: number, lng1: number,
        lat2: number, lng2: number
    ): number {
        const R = 6371; // Earth's radius in km
        const dLat = this.toRad(lat2 - lat1);
        const dLng = this.toRad(lng2 - lng1);
        const a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(this.toRad(lat1)) * Math.cos(this.toRad(lat2)) *
            Math.sin(dLng / 2) * Math.sin(dLng / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    }

    private toRad(deg: number): number {
        return deg * (Math.PI / 180);
    }

    /**
     * Update staff skills
     */
    async updateStaffSkills(
        userId: string,
        skills: Array<{
            category_id: string;
            skill_name: string;
            proficiency_level: number;
            is_primary: boolean;
        }>
    ): Promise<void> {
        // Delete existing skills
        await supabase
            .from('staff_skills')
            .delete()
            .eq('user_id', userId);

        // Insert new skills
        if (skills.length > 0) {
            const { error } = await supabase
                .from('staff_skills')
                .insert(skills.map(s => ({
                    user_id: userId,
                    ...s
                })));

            if (error) {
                console.error('Error updating staff skills:', error);
                throw error;
            }
        }
    }

    /**
     * Update staff availability
     */
    async updateStaffAvailability(
        userId: string,
        availability: Partial<StaffAvailability>
    ): Promise<void> {
        const { error } = await supabase
            .from('staff_availability')
            .upsert({
                user_id: userId,
                ...availability,
                updated_at: new Date().toISOString()
            }, {
                onConflict: 'user_id'
            });

        if (error) {
            console.error('Error updating availability:', error);
            throw error;
        }
    }

    /**
     * Get assignment statistics
     */
    async getAssignmentStats(): Promise<{
        totalAutoAssigned: number;
        averageScore: number;
        byReason: Record<string, number>;
    }> {
        const { data } = await supabase
            .from('auto_assignment_logs')
            .select('assignment_reason, total_score');

        const stats = {
            totalAutoAssigned: data?.length || 0,
            averageScore: 0,
            byReason: {} as Record<string, number>
        };

        if (data && data.length > 0) {
            stats.averageScore = data.reduce((sum, d) => sum + (d.total_score || 0), 0) / data.length;

            for (const log of data) {
                const reasons = log.assignment_reason.split(', ');
                for (const reason of reasons) {
                    stats.byReason[reason] = (stats.byReason[reason] || 0) + 1;
                }
            }
        }

        return stats;
    }

    /**
     * Bulk auto-assign multiple complaints
     */
    async bulkAutoAssign(complaints: {
        id: string;
        category_id: string | null;
        department_id: string;
        priority: string;
    }[]): Promise<{
        successful: string[];
        failed: string[];
    }> {
        const results = {
            successful: [] as string[],
            failed: [] as string[]
        };

        for (const complaint of complaints) {
            try {
                const result = await this.autoAssign(
                    complaint.id,
                    complaint.category_id,
                    complaint.department_id,
                    complaint.priority
                );

                if (result) {
                    results.successful.push(complaint.id);
                } else {
                    results.failed.push(complaint.id);
                }
            } catch (error) {
                console.error(`Bulk assignment failed for ${complaint.id}:`, error);
                results.failed.push(complaint.id);
            }
        }

        return results;
    }
}

export const autoAssignmentEngine = new AutoAssignmentEngine();
export default autoAssignmentEngine;
