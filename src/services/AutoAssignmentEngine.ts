/**
 * AutoAssignmentEngine - Intelligent staff assignment
 * 
 * This service automatically assigns complaints to the best available
 * maintenance staff based on skills, workload, and other factors.
 */

import { supabase } from '@/integrations/supabase/client';

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
        categoryId: string,
        departmentId: string,
        priority: string = 'medium',
        buildingLocation?: { lat: number; lng: number }
    ): Promise<StaffCandidate[]> {
        // Get all maintenance staff in the department
        const { data: staffProfiles, error: profileError } = await supabase
            .from('profiles')
            .select(`
        user_id,
        full_name,
        email,
        phone,
        avatar_url
      `)
            .in('user_id',
                await this.getMaintenanceStaffIds(departmentId)
            );

        if (profileError) {
            console.error('Error fetching staff profiles:', profileError);
            return [];
        }

        // Get skills for all staff
        const { data: allSkills } = await supabase
            .from('staff_skills')
            .select('*')
            .eq('category_id', categoryId);

        // Get availability for all staff
        const { data: allAvailability } = await supabase
            .from('staff_availability')
            .select('*');

        const candidates: StaffCandidate[] = [];

        for (const profile of staffProfiles || []) {
            const skills = allSkills?.filter(s => s.user_id === profile.user_id) || [];
            const availability = allAvailability?.find(a => a.user_id === profile.user_id);

            // Skip if not available
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
            const relevantSkill = skills.find(s => s.category_id === categoryId);
            let skillScore = 0;
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
            const totalScore =
                (skillScore * this.config.skillWeight) +
                (workloadScore * this.config.workloadWeight) +
                (proximityScore * this.config.proximityWeight);

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
     * Auto-assign a complaint to the best available staff
     */
    async autoAssign(
        complaintId: string,
        categoryId: string,
        departmentId: string,
        priority: string = 'medium'
    ): Promise<AssignmentLog | null> {
        const candidates = await this.findBestStaff(categoryId, departmentId, priority);

        if (candidates.length === 0) {
            console.warn('No available staff found for auto-assignment');
            return null;
        }

        const bestCandidate = candidates[0];

        // Assign the complaint
        const { error: updateError } = await supabase
            .from('complaints')
            .update({
                assigned_to: bestCandidate.user_id,
                status: 'approved',
                is_auto_assigned: true,
                updated_at: new Date().toISOString()
            })
            .eq('id', complaintId);

        if (updateError) {
            console.error('Error assigning complaint:', updateError);
            throw updateError;
        }

        // Log the assignment
        const assignmentLog: AssignmentLog = {
            complaint_id: complaintId,
            assigned_to_user_id: bestCandidate.user_id,
            assignment_reason: this.getAssignmentReason(bestCandidate),
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
            console.error('Error logging assignment:', logError);
        }

        // Create notification for assigned staff
        await this.notifyAssignment(complaintId, bestCandidate.user_id);

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
            type: 'info',
            title: `${priorityEmoji} New Task Assigned`,
            message: `You have been assigned a new ${complaint.priority} priority task: "${complaint.title}"`,
            related_complaint_id: complaintId,
            link: `/dashboard/maintenance/new-assigned`
        });
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
}

export const autoAssignmentEngine = new AutoAssignmentEngine();
export default autoAssignmentEngine;
