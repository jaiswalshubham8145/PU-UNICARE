/**
 * EscalationDashboard Component
 * 
 * Displays escalation metrics, pending escalations, and allows
 * manual escalation of complaints. Used in HOD/Admin dashboards.
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    AlertTriangle,
    ArrowUpCircle,
    CheckCircle,
    Clock,
    ChevronRight,
    TrendingUp,
    Users,
    AlertCircle,
    Eye,
    Loader2
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';
import {
    useEscalationCandidates,
    useEscalationStats,
    useEscalateComplaint,
    useEscalationHistory,
    useAcknowledgeEscalation
} from '@/hooks/useEscalation';
import { EscalationCandidate } from '@/services/EscalationService';

const levelColors = {
    1: { bg: 'bg-yellow-100', text: 'text-yellow-800', border: 'border-yellow-300' },
    2: { bg: 'bg-orange-100', text: 'text-orange-800', border: 'border-orange-300' },
    3: { bg: 'bg-red-100', text: 'text-red-800', border: 'border-red-300' },
};

interface EscalationRowProps {
    candidate: EscalationCandidate;
    onEscalate: (id: string) => void;
    onView: (number: string) => void;
}

function EscalationRow({ candidate, onEscalate, onView }: EscalationRowProps) {
    const nextLevel = candidate.current_level + 1;
    const colors = levelColors[nextLevel as keyof typeof levelColors] || levelColors[3];

    return (
        <motion.tr
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="hover:bg-gray-50 transition-colors"
        >
            <TableCell>
                <div className="flex flex-col">
                    <span className="font-medium text-primary">{candidate.complaint_number}</span>
                    <span className="text-xs text-gray-500">{candidate.department_name}</span>
                </div>
            </TableCell>
            <TableCell>
                <span className="text-sm line-clamp-1">{candidate.title}</span>
            </TableCell>
            <TableCell>
                <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-gray-400" />
                    <span className={`font-medium ${candidate.hours_pending > 48 ? 'text-red-600' :
                            candidate.hours_pending > 24 ? 'text-orange-600' : 'text-gray-900'
                        }`}>
                        {candidate.hours_pending}h
                    </span>
                </div>
            </TableCell>
            <TableCell>
                <Badge variant="outline" className={`${colors.bg} ${colors.text} ${colors.border}`}>
                    {candidate.current_level > 0 ? `Level ${candidate.current_level}` : 'Not Escalated'}
                </Badge>
            </TableCell>
            <TableCell>
                <Badge className="bg-gradient-to-r from-orange-500 to-red-500 text-white border-0">
                    → {candidate.should_escalate_to.toUpperCase()}
                </Badge>
            </TableCell>
            <TableCell>
                <div className="flex gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onView(candidate.complaint_number)}
                    >
                        <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                        variant="default"
                        size="sm"
                        className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600"
                        onClick={() => onEscalate(candidate.complaint_id)}
                    >
                        <ArrowUpCircle className="h-4 w-4 mr-1" />
                        Escalate
                    </Button>
                </div>
            </TableCell>
        </motion.tr>
    );
}

export default function EscalationDashboard() {
    const [selectedComplaintId, setSelectedComplaintId] = useState<string | null>(null);
    const [escalationReason, setEscalationReason] = useState('');
    const [showEscalateDialog, setShowEscalateDialog] = useState(false);

    const { data: candidates, isLoading: loadingCandidates } = useEscalationCandidates();
    const { data: stats, isLoading: loadingStats } = useEscalationStats();
    const escalateMutation = useEscalateComplaint();

    const handleEscalate = (complaintId: string) => {
        setSelectedComplaintId(complaintId);
        setEscalationReason('');
        setShowEscalateDialog(true);
    };

    const confirmEscalation = () => {
        if (!selectedComplaintId) return;
        escalateMutation.mutate({
            complaintId: selectedComplaintId,
            reason: escalationReason || 'Manual escalation - requires immediate attention'
        });
        setShowEscalateDialog(false);
    };

    const handleViewComplaint = (number: string) => {
        window.open(`/track?number=${number}`, '_blank');
    };

    return (
        <div className="space-y-6">
            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0 }}
                >
                    <Card className="border-l-4 border-l-blue-500">
                        <CardContent className="p-4">
                            {loadingStats ? (
                                <Skeleton className="h-12 w-full" />
                            ) : (
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-gray-500">Total Escalated</p>
                                        <p className="text-2xl font-bold text-gray-900">{stats?.totalEscalated || 0}</p>
                                    </div>
                                    <div className="p-3 bg-blue-100 rounded-full">
                                        <TrendingUp className="h-6 w-6 text-blue-600" />
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                >
                    <Card className="border-l-4 border-l-yellow-500">
                        <CardContent className="p-4">
                            {loadingStats ? (
                                <Skeleton className="h-12 w-full" />
                            ) : (
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-gray-500">Level 1</p>
                                        <p className="text-2xl font-bold text-yellow-600">{stats?.level1Count || 0}</p>
                                    </div>
                                    <div className="p-3 bg-yellow-100 rounded-full">
                                        <AlertCircle className="h-6 w-6 text-yellow-600" />
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                >
                    <Card className="border-l-4 border-l-orange-500">
                        <CardContent className="p-4">
                            {loadingStats ? (
                                <Skeleton className="h-12 w-full" />
                            ) : (
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-gray-500">Level 2</p>
                                        <p className="text-2xl font-bold text-orange-600">{stats?.level2Count || 0}</p>
                                    </div>
                                    <div className="p-3 bg-orange-100 rounded-full">
                                        <AlertTriangle className="h-6 w-6 text-orange-600" />
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                >
                    <Card className="border-l-4 border-l-red-500">
                        <CardContent className="p-4">
                            {loadingStats ? (
                                <Skeleton className="h-12 w-full" />
                            ) : (
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-gray-500">Level 3 (Critical)</p>
                                        <p className="text-2xl font-bold text-red-600">{stats?.level3Count || 0}</p>
                                    </div>
                                    <div className="p-3 bg-red-100 rounded-full">
                                        <AlertTriangle className="h-6 w-6 text-red-600" />
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </motion.div>
            </div>

            {/* Pending Acknowledgments Alert */}
            {stats?.pendingAcknowledgments && stats.pendingAcknowledgments > 0 && (
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                >
                    <Card className="bg-gradient-to-r from-red-500 to-orange-500 text-white border-0">
                        <CardContent className="p-4 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-white/20 rounded-full animate-pulse">
                                    <AlertTriangle className="h-6 w-6" />
                                </div>
                                <div>
                                    <p className="font-semibold">
                                        {stats.pendingAcknowledgments} Escalation{stats.pendingAcknowledgments > 1 ? 's' : ''} Pending Acknowledgment
                                    </p>
                                    <p className="text-sm opacity-90">
                                        Please review and acknowledge these escalated complaints
                                    </p>
                                </div>
                            </div>
                            <Button variant="secondary" className="bg-white text-orange-600 hover:bg-orange-50">
                                Review Now
                                <ChevronRight className="h-4 w-4 ml-1" />
                            </Button>
                        </CardContent>
                    </Card>
                </motion.div>
            )}

            {/* Candidates Table */}
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle className="flex items-center gap-2">
                                <ArrowUpCircle className="h-5 w-5 text-orange-500" />
                                Escalation Candidates
                            </CardTitle>
                            <CardDescription>
                                Complaints that are overdue and ready for escalation
                            </CardDescription>
                        </div>
                        <Badge variant="outline" className="text-lg px-3 py-1">
                            {candidates?.length || 0} pending
                        </Badge>
                    </div>
                </CardHeader>
                <CardContent>
                    {loadingCandidates ? (
                        <div className="space-y-3">
                            {[1, 2, 3].map(i => (
                                <Skeleton key={i} className="h-16 w-full" />
                            ))}
                        </div>
                    ) : !candidates || candidates.length === 0 ? (
                        <div className="text-center py-12">
                            <CheckCircle className="h-16 w-16 mx-auto text-green-500 mb-4" />
                            <h3 className="text-lg font-medium text-gray-900 mb-2">All Caught Up!</h3>
                            <p className="text-gray-500">No complaints are pending escalation at this time.</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Complaint</TableHead>
                                        <TableHead>Title</TableHead>
                                        <TableHead>Pending For</TableHead>
                                        <TableHead>Current Level</TableHead>
                                        <TableHead>Escalate To</TableHead>
                                        <TableHead>Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    <AnimatePresence>
                                        {candidates.map(candidate => (
                                            <EscalationRow
                                                key={candidate.complaint_id}
                                                candidate={candidate}
                                                onEscalate={handleEscalate}
                                                onView={handleViewComplaint}
                                            />
                                        ))}
                                    </AnimatePresence>
                                </TableBody>
                            </Table>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Average Acknowledgment Time */}
            {stats && stats.averageTimeToAcknowledge > 0 && (
                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <Clock className="h-5 w-5 text-gray-400" />
                                <span className="text-sm text-gray-600">Average Time to Acknowledge</span>
                            </div>
                            <span className="font-semibold text-gray-900">
                                {stats.averageTimeToAcknowledge.toFixed(1)} hours
                            </span>
                        </div>
                        <Progress
                            value={Math.min((stats.averageTimeToAcknowledge / 24) * 100, 100)}
                            className="mt-2 h-2"
                        />
                    </CardContent>
                </Card>
            )}

            {/* Escalation Confirmation Dialog */}
            <Dialog open={showEscalateDialog} onOpenChange={setShowEscalateDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <ArrowUpCircle className="h-5 w-5 text-orange-500" />
                            Confirm Escalation
                        </DialogTitle>
                        <DialogDescription>
                            This will escalate the complaint to the next level and notify relevant stakeholders.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4 py-4">
                        <div>
                            <label className="text-sm font-medium text-gray-700">
                                Reason for Escalation (Optional)
                            </label>
                            <Textarea
                                placeholder="Provide additional context for the escalation..."
                                value={escalationReason}
                                onChange={(e) => setEscalationReason(e.target.value)}
                                className="mt-1"
                                rows={3}
                            />
                        </div>
                    </div>

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowEscalateDialog(false)}>
                            Cancel
                        </Button>
                        <Button
                            className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600"
                            onClick={confirmEscalation}
                            disabled={escalateMutation.isPending}
                        >
                            {escalateMutation.isPending ? (
                                <>
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                    Escalating...
                                </>
                            ) : (
                                <>
                                    <ArrowUpCircle className="h-4 w-4 mr-2" />
                                    Confirm Escalation
                                </>
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
