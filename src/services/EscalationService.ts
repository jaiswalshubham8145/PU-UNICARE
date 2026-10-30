/**
 * EscalationService - Handles automatic complaint escalation
 * 
 * This service monitors complaints and automatically escalates them
 * when they remain unattended beyond configured time limits.
 */

import { supabase } from '@/integrations/supabase/client';
import { sendComplaintEmail, getComplaintForEmail } from './emailService';

export interface EscalationRule {
    id: string;
    department_id: string | null;
    category_id: string | null;
    level: number;
    escalate_after_hours: number;
    escalate_to_role: 'hod' | 'principal' | 'admin';
    notify_via: string[];
    notify_original_assignee: boolean;
    notify_submitter: boolean;
    is_active: boolean;
}

export interface EscalationHistory {
    id: string;
    complaint_id: string;
    escalation_rule_id: string | null;
    escalated_from_user_id: string | null;
    escalated_to_user_id: string | null;
    escalation_level: number;
    reason: string;
    escalated_at: string;
    acknowledged_at: string | null;
}

export interface EscalationCandidate {
    complaint_id: string;
    complaint_number: string;
    title: string;
    current_level: number;
    hours_pending: number;
    should_escalate_to: 'hod' | 'principal' | 'admin';
    department_name: string;
}

class EscalationService {
    /**
     * Fetch all active escalation rules
     */
    async getEscalationRules(): Promise<EscalationRule[]> {
        const { data, error } = await supabase
            .from('escalation_rules')
            .select('*')
            .eq('is_active', true)
            .order('level', { ascending: true });

        if (error) {
            console.error('Error fetching escalation rules:', error);
            throw error;
        }

        return (data as unknown as EscalationRule[]) || [];
    }

    /**
     * Create a new escalation rule
     */
    async createEscalationRule(rule: Omit<EscalationRule, 'id'>): Promise<EscalationRule> {
        const { data, error } = await supabase
            .from('escalation_rules')
            .insert(rule)
            .select()
            .single();

        if (error) {
            console.error('Error creating escalation rule:', error);
            throw error;
        }

        return data as unknown as EscalationRule;
    }

    /**
     * Update an existing escalation rule
     */
    async updateEscalationRule(id: string, updates: Partial<EscalationRule>): Promise<EscalationRule> {
        const { data, error } = await supabase
            .from('escalation_rules')
            .update({ ...updates, updated_at: new Date().toISOString() })
            .eq('id', id)
            .select()
            .single();

        if (error) {
            console.error('Error updating escalation rule:', error);
            throw error;
        }

        return data as unknown as EscalationRule;
    }

    /**
     * Delete (deactivate) an escalation rule
     */
    async deleteEscalationRule(id: string): Promise<void> {
        const { error } = await supabase
            .from('escalation_rules')
            .update({ is_active: false })
            .eq('id', id);

        if (error) {
            console.error('Error deleting escalation rule:', error);
            throw error;
        }
    }

    /**
     * Get complaints that are candidates for escalation
     */
    async getEscalationCandidates(): Promise<EscalationCandidate[]> {
        const rules = await this.getEscalationRules();

        // Get pending complaints
        const { data: complaints, error } = await supabase
            .from('complaints')
            .select(`
        id,
        complaint_number,
        title,
        status,
        escalation_level,
        created_at,
        department_id,
        category_id,
        departments(name)
      `)
            .in('status', ['pending', 'acknowledged', 'approved'])
            .lt('escalation_level', 3);

        if (error) {
            console.error('Error fetching complaints:', error);
            throw error;
        }

        const candidates: EscalationCandidate[] = [];
        const now = new Date();

        for (const complaint of complaints || []) {
            const hoursPending = (now.getTime() - new Date(complaint.created_at).getTime()) / (1000 * 60 * 60);
            const nextLevel = (complaint.escalation_level || 0) + 1;

            // Find applicable rule
            const applicableRule = rules.find(rule =>
                rule.level === nextLevel &&
                (rule.department_id === null || rule.department_id === complaint.department_id) &&
                (rule.category_id === null || rule.category_id === complaint.category_id) &&
                hoursPending >= rule.escalate_after_hours
            );

            if (applicableRule) {
                candidates.push({
                    complaint_id: complaint.id,
                    complaint_number: complaint.complaint_number,
                    title: complaint.title,
                    current_level: complaint.escalation_level || 0,
                    hours_pending: Math.round(hoursPending),
                    should_escalate_to: applicableRule.escalate_to_role,
                    department_name: (complaint.departments as unknown as { name: string })?.name || 'Unknown'
                });
            }
        }

        return candidates;
    }

    /**
     * Escalate a specific complaint
     */
    async escalateComplaint(
        complaintId: string,
        reason: string = 'Manual escalation'
    ): Promise<EscalationHistory> {
        // Get complaint current state
        const { data: complaint, error: complaintError } = await supabase
            .from('complaints')
            .select('escalation_level, assigned_to')
            .eq('id', complaintId)
            .single();

        if (complaintError || !complaint) {
            throw new Error('Complaint not found');
        }

        const newLevel = (complaint.escalation_level || 0) + 1;

        if (newLevel > 3) {
            throw new Error('Complaint already at maximum escalation level');
        }

        // Update complaint
        const { error: updateError } = await supabase
            .from('complaints')
            .update({
                escalation_level: newLevel,
                last_escalated_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            })
            .eq('id', complaintId);

        if (updateError) {
            throw updateError;
        }

        // Log escalation
        const { data: history, error: historyError } = await supabase
            .from('escalation_history')
            .insert({
                complaint_id: complaintId,
                escalated_from_user_id: complaint.assigned_to,
                escalation_level: newLevel,
                reason
            })
            .select()
            .single();

        if (historyError) {
            console.error('Error logging escalation:', historyError);
            throw historyError;
        }

        // Trigger notifications (would be handled by edge function)
        await this.notifyEscalation(complaintId, newLevel);

        return history;
    }

    /**
     * Get escalation history for a complaint
     */
    async getEscalationHistory(complaintId: string): Promise<EscalationHistory[]> {
        const { data, error } = await supabase
            .from('escalation_history')
            .select('*')
            .eq('complaint_id', complaintId)
            .order('escalated_at', { ascending: false });

        if (error) {
            console.error('Error fetching escalation history:', error);
            throw error;
        }

        return data || [];
    }

    /**
     * Acknowledge an escalation
     */
    async acknowledgeEscalation(historyId: string): Promise<void> {
        const { error } = await supabase
            .from('escalation_history')
            .update({ acknowledged_at: new Date().toISOString() })
            .eq('id', historyId);

        if (error) {
            console.error('Error acknowledging escalation:', error);
            throw error;
        }
    }

    /**
     * Send notifications for an escalation
     */
    private async notifyEscalation(complaintId: string, level: number): Promise<void> {
        // Get complaint details
        const { data: complaint } = await supabase
            .from('complaints')
            .select(`
        complaint_number,
        title,
        department_id,
        submitted_by,
        assigned_to
      `)
            .eq('id', complaintId)
            .single();

        if (!complaint) return;

        // Determine notification recipients based on level
        const roleToNotify = level === 1 ? 'hod' : level === 2 ? 'principal' : 'admin';

        // Get users with the target role
        const { data: targetUsers } = await supabase
            .from('user_roles')
            .select('user_id')
            .eq('role', roleToNotify)
            .eq('department_id', complaint.department_id);

        // Create in-app notifications
        for (const user of targetUsers || []) {
            await supabase.from('notifications').insert({
                user_id: user.user_id,
                type: 'sla_warning',
                title: `🚨 Complaint Escalated - Level ${level}`,
                message: `Complaint ${complaint.complaint_number} "${complaint.title}" has been escalated and requires your immediate attention.`,
                related_complaint_id: complaintId,
                link: `/track?number=${complaint.complaint_number}`
            });
        }

        // Notify original submitter
        if (complaint.submitted_by) {
            await supabase.from('notifications').insert({
                user_id: complaint.submitted_by,
                type: 'complaint_updated',
                title: '📢 Your Complaint Has Been Escalated',
                message: `Your complaint ${complaint.complaint_number} has been escalated to level ${level} for faster resolution.`,
                related_complaint_id: complaintId,
                link: `/track?number=${complaint.complaint_number}`
            });
        }

        // Trigger Email Notification
        try {
            const complaintForEmail = await getComplaintForEmail(complaintId);
            if (complaintForEmail) {
                await sendComplaintEmail('escalated', complaintForEmail, {
                    escalationLevel: String(level),
                    escalationReason: `Automatic escalation to level ${level}`
                });
            }
        } catch (emailError) {
            console.error('Failed to send escalation email:', emailError);
        }
    }

    /**
     * Get escalation statistics
     */
    async getEscalationStats(): Promise<{
        totalEscalated: number;
        level1Count: number;
        level2Count: number;
        level3Count: number;
        pendingAcknowledgments: number;
        averageTimeToAcknowledge: number;
    }> {
        const { data: complaints } = await supabase
            .from('complaints')
            .select('escalation_level')
            .gt('escalation_level', 0);

        const { data: history } = await supabase
            .from('escalation_history')
            .select('escalation_level, acknowledged_at, escalated_at');

        const stats = {
            totalEscalated: complaints?.length || 0,
            level1Count: complaints?.filter(c => c.escalation_level === 1).length || 0,
            level2Count: complaints?.filter(c => c.escalation_level === 2).length || 0,
            level3Count: complaints?.filter(c => c.escalation_level >= 3).length || 0,
            pendingAcknowledgments: history?.filter(h => !h.acknowledged_at).length || 0,
            averageTimeToAcknowledge: 0
        };

        // Calculate average time to acknowledge
        const acknowledgedItems = history?.filter(h => h.acknowledged_at) || [];
        if (acknowledgedItems.length > 0) {
            const totalTime = acknowledgedItems.reduce((sum, item) => {
                const escTime = new Date(item.escalated_at).getTime();
                const ackTime = new Date(item.acknowledged_at!).getTime();
                return sum + (ackTime - escTime);
            }, 0);
            stats.averageTimeToAcknowledge = totalTime / acknowledgedItems.length / (1000 * 60 * 60); // In hours
        }

        return stats;
    }
}

export const escalationService = new EscalationService();
export default escalationService;
