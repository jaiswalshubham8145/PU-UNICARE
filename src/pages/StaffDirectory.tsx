/**
 * Staff Directory Page
 * 
 * Comprehensive staff directory with:
 * - Staff profiles with photos and contact details
 * - Skills and specializations
 * - Real-time availability status
 * - Click-to-call, click-to-WhatsApp functionality
 * - Search and filter capabilities
 */

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';
import {
    Phone,
    Mail,
    MessageCircle,
    MapPin,
    Star,
    Clock,
    Search,
    Filter,
    CheckCircle2,
    XCircle,
    Clock4,
    Coffee,
    User,
    Briefcase,
    Award,
    ChevronDown
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Skeleton } from '@/components/ui/skeleton';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useDepartments, useCategories } from '@/hooks/useComplaints';
import { useAllStaffAvailability } from '@/hooks/useAutoAssignment';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';

interface StaffMember {
    user_id: string;
    full_name: string;
    email: string;
    phone: string | null;
    avatar_url: string | null;
    designation: string | null;
    bio: string | null;
    skills: string[] | null;
    years_of_experience: number | null;
    department: {
        id: string;
        name: string;
    } | null;
    availability: {
        status: string;
        current_workload: number;
        max_workload: number;
        last_seen_at: string;
    } | null;
    ratings: {
        average_rating: number;
        total_ratings: number;
    };
    completed_tasks: number;
}

interface StaffAvailabilityRow {
    user_id: string;
    status: string;
    current_workload: number;
    max_workload: number;
    last_seen_at: string;
}

const statusConfig = {
    available: { color: 'bg-green-500', icon: CheckCircle2, label: 'Available', textColor: 'text-green-700' },
    busy: { color: 'bg-yellow-500', icon: Clock4, label: 'Busy', textColor: 'text-yellow-700' },
    on_leave: { color: 'bg-red-500', icon: XCircle, label: 'On Leave', textColor: 'text-red-700' },
    offline: { color: 'bg-gray-500', icon: Coffee, label: 'Offline', textColor: 'text-gray-700' },
};

function StaffCard({ staff }: { staff: StaffMember }) {
    const { roles } = useAuth();
    const isPrivileged = roles.some(r => ['admin', 'hod', 'principal'].includes(r));
    const status = statusConfig[staff.availability?.status as keyof typeof statusConfig] || statusConfig.offline;
    const StatusIcon = status.icon;
    const workloadPercent = staff.availability
        ? Math.round((staff.availability.current_workload / staff.availability.max_workload) * 100)
        : 0;

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ y: -4 }}
            transition={{ duration: 0.2 }}
        >
            <Card className="h-full hover:shadow-xl transition-all duration-300 border-0 bg-white/80 backdrop-blur-sm">
                <CardContent className="p-6">
                    {/* Header with Avatar and Status */}
                    <div className="flex items-start gap-4 mb-4">
                        <div className="relative">
                            <Avatar className="h-16 w-16 ring-2 ring-offset-2 ring-primary/20">
                                <AvatarImage src={staff.avatar_url || undefined} alt={staff.full_name} />
                                <AvatarFallback className="bg-gradient-to-br from-primary to-[#1F3F73] text-white text-lg font-semibold">
                                    {staff.full_name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                                </AvatarFallback>
                            </Avatar>
                            <div className={`absolute -bottom-1 -right-1 w-5 h-5 ${status.color} rounded-full border-2 border-white flex items-center justify-center`}>
                                <StatusIcon className="h-3 w-3 text-white" />
                            </div>
                        </div>
                        <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-lg text-gray-900 truncate">{staff.full_name}</h3>
                            <p className="text-sm text-gray-500 flex items-center gap-1">
                                <Briefcase className="h-3 w-3" />
                                {staff.designation || 'Maintenance Staff'}
                            </p>
                            <div className="flex items-center gap-2 mt-1">
                                <Badge variant="outline" className={`text-xs ${status.textColor}`}>
                                    <StatusIcon className="h-3 w-3 mr-1" />
                                    {status.label}
                                </Badge>
                            </div>
                        </div>
                    </div>

                    {/* Department */}
                    {staff.department && (
                        <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
                            <MapPin className="h-4 w-4 text-primary" />
                            <span>{staff.department.name}</span>
                        </div>
                    )}

                    {/* Skills */}
                    {staff.skills && staff.skills.length > 0 && (
                        <div className="mb-4">
                            <div className="flex flex-wrap gap-1.5">
                                {staff.skills.slice(0, 3).map((skill, idx) => (
                                    <Badge key={idx} variant="secondary" className="text-xs bg-primary/10 text-primary border-0">
                                        {skill}
                                    </Badge>
                                ))}
                                {staff.skills.length > 3 && (
                                    <Badge variant="secondary" className="text-xs bg-gray-100">
                                        +{staff.skills.length - 3}
                                    </Badge>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Stats */}
                    <div className="grid grid-cols-3 gap-2 mb-4 p-3 bg-gray-50 rounded-lg">
                        <div className="text-center">
                            <div className="flex items-center justify-center gap-1 text-yellow-500">
                                <Star className="h-4 w-4 fill-current" />
                                <span className="font-semibold text-gray-900">
                                    {staff.ratings.average_rating.toFixed(1)}
                                </span>
                            </div>
                            <span className="text-xs text-gray-500">Rating</span>
                        </div>
                        <div className="text-center border-x border-gray-200">
                            <div className="font-semibold text-gray-900">{staff.completed_tasks}</div>
                            <span className="text-xs text-gray-500">Completed</span>
                        </div>
                        <div className="text-center">
                            <div className="font-semibold text-gray-900">{staff.years_of_experience || 0}y</div>
                            <span className="text-xs text-gray-500">Experience</span>
                        </div>
                    </div>

                    {/* Workload Bar */}
                    <div className="mb-4">
                        <div className="flex justify-between text-xs text-gray-500 mb-1">
                            <span>Current Workload</span>
                            <span>{staff.availability?.current_workload || 0}/{staff.availability?.max_workload || 5} tasks</span>
                        </div>
                        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                            <div
                                className={`h-full transition-all duration-300 ${workloadPercent >= 80 ? 'bg-red-500' :
                                    workloadPercent >= 50 ? 'bg-yellow-500' : 'bg-green-500'
                                    }`}
                                style={{ width: `${workloadPercent}%` }}
                            />
                        </div>
                    </div>

                    {/* Contact Actions */}
                    <div className="flex gap-2">
                        {staff.phone && (
                            isPrivileged ? (
                                <>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="flex-1"
                                        onClick={() => window.open(`tel:${staff.phone}`, '_blank')}
                                    >
                                        <Phone className="h-4 w-4 mr-1" />
                                        Call
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="flex-1 text-green-600 border-green-200 hover:bg-green-50"
                                        onClick={() => window.open(`https://wa.me/${staff.phone?.replace(/\D/g, '')}`, '_blank')}
                                    >
                                        <MessageCircle className="h-4 w-4 mr-1" />
                                        WhatsApp
                                    </Button>
                                </>
                            ) : (
                                <div className="flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-md bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-xs font-mono text-slate-500" title="Full contact details reserved for department coordinators and administrators">
                                    <Phone className="h-3.5 w-3.5 opacity-60" />
                                    <span>+91 ••••{staff.phone.replace(/\D/g, '').slice(-4)}</span>
                                </div>
                            )
                        )}
                        <Button
                            variant="outline"
                            size="sm"
                            className="flex-1"
                            onClick={() => window.open(`mailto:${staff.email}`, '_blank')}
                        >
                            <Mail className="h-4 w-4 mr-1" />
                            Email
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </motion.div>
    );
}

function StaffCardSkeleton() {
    return (
        <Card className="h-full">
            <CardContent className="p-6">
                <div className="flex items-start gap-4 mb-4">
                    <Skeleton className="h-16 w-16 rounded-full" />
                    <div className="flex-1">
                        <Skeleton className="h-5 w-32 mb-2" />
                        <Skeleton className="h-4 w-24" />
                    </div>
                </div>
                <Skeleton className="h-4 w-full mb-4" />
                <div className="flex gap-2 mb-4">
                    <Skeleton className="h-6 w-16" />
                    <Skeleton className="h-6 w-16" />
                </div>
                <Skeleton className="h-16 w-full mb-4" />
                <div className="flex gap-2">
                    <Skeleton className="h-9 flex-1" />
                    <Skeleton className="h-9 flex-1" />
                </div>
            </CardContent>
        </Card>
    );
}

export default function StaffDirectory() {
    const [searchQuery, setSearchQuery] = useState('');
    const [departmentFilter, setDepartmentFilter] = useState<string>('all');
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [sortBy, setSortBy] = useState<string>('name');

    const { data: departments } = useDepartments();

    // Fetch all maintenance staff with their details
    const { data: staffList, isLoading } = useQuery<StaffMember[]>({
        queryKey: ['staff-directory'],
        queryFn: async () => {
            // Get all maintenance staff
            const { data: staffRoles, error: rolesError } = await supabase
                .from('user_roles')
                .select('user_id, department_id')
                .eq('role', 'maintenance_staff');

            if (rolesError) throw rolesError;
            if (!staffRoles || staffRoles.length === 0) return [];

            const userIds = staffRoles.map(r => r.user_id);

            // Get profiles
            const { data: profiles, error: profilesError } = await supabase
                .from('profiles')
                .select('*')
                .in('user_id', userIds);

            if (profilesError) throw profilesError;

            // Get departments
            const { data: depts } = await supabase
                .from('departments')
                .select('id, name');

            // Try to get availability (table may not exist yet)
            let availability: StaffAvailabilityRow[] = [];
            try {
                const { data: availData } = await supabase
                    .from('staff_availability' as any)
                    .select('*')
                    .in('user_id', userIds);
                availability = (availData as unknown as StaffAvailabilityRow[]) || [];
            } catch {
                // Table doesn't exist yet, use empty array
            }

            // Get completion counts
            const { data: completions } = await supabase
                .from('complaints')
                .select('assigned_to')
                .eq('status', 'completed')
                .in('assigned_to', userIds);

            // Combine all data
            return (profiles || []).map((profile) => {
                const role = staffRoles.find(r => r.user_id === profile.user_id);
                const dept = depts?.find(d => d.id === role?.department_id);
                const avail = availability?.find((a) => a.user_id === profile.user_id);
                const completionCount = completions?.filter(c => c.assigned_to === profile.user_id).length || 0;

                return {
                    user_id: profile.user_id,
                    full_name: profile.full_name,
                    email: profile.email,
                    phone: profile.phone,
                    avatar_url: profile.avatar_url || null,
                    designation: profile.designation || null,
                    bio: profile.bio || null,
                    skills: profile.skills || null,
                    years_of_experience: profile.years_of_experience || null,
                    department: dept ? { id: dept.id, name: dept.name } : null,
                    availability: avail ? {
                        status: avail.status,
                        current_workload: avail.current_workload,
                        max_workload: avail.max_workload,
                        last_seen_at: avail.last_seen_at
                    } : null,
                    ratings: {
                        average_rating: 0, // Will be populated when ratings table data exists
                        total_ratings: 0
                    },
                    completed_tasks: completionCount
                } as StaffMember;
            });
        },
        refetchInterval: 30 * 1000, // Refresh every 30 seconds
    });

    // Filter and sort staff
    const filteredStaff = (staffList || [])
        .filter(staff => {
            const matchesSearch = searchQuery === '' ||
                staff.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                staff.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
                staff.skills?.some(s => s.toLowerCase().includes(searchQuery.toLowerCase()));

            const matchesDepartment = departmentFilter === 'all' ||
                staff.department?.id === departmentFilter;

            const matchesStatus = statusFilter === 'all' ||
                (staff.availability?.status || 'offline') === statusFilter;

            return matchesSearch && matchesDepartment && matchesStatus;
        })
        .sort((a, b) => {
            switch (sortBy) {
                case 'name':
                    return a.full_name.localeCompare(b.full_name);
                case 'rating':
                    return b.ratings.average_rating - a.ratings.average_rating;
                case 'completed':
                    return b.completed_tasks - a.completed_tasks;
                case 'workload':
                    return (a.availability?.current_workload || 0) - (b.availability?.current_workload || 0);
                default:
                    return 0;
            }
        });

    const availableCount = staffList?.filter(s => s.availability?.status === 'available').length || 0;
    const busyCount = staffList?.filter(s => s.availability?.status === 'busy').length || 0;
    const totalCount = staffList?.length || 0;

    return (
        <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
            <Navbar />

            <main className="container mx-auto px-4 py-8 pt-24">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-8"
                >
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">
                        👥 Maintenance Staff Directory
                    </h1>
                    <p className="text-gray-600">
                        Find and contact maintenance staff across all departments
                    </p>
                </motion.div>

                {/* Stats Cards */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8"
                >
                    <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0">
                        <CardContent className="p-4 flex items-center gap-4">
                            <User className="h-10 w-10 opacity-80" />
                            <div>
                                <p className="text-2xl font-bold">{totalCount}</p>
                                <p className="text-sm opacity-80">Total Staff</p>
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white border-0">
                        <CardContent className="p-4 flex items-center gap-4">
                            <CheckCircle2 className="h-10 w-10 opacity-80" />
                            <div>
                                <p className="text-2xl font-bold">{availableCount}</p>
                                <p className="text-sm opacity-80">Available Now</p>
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="bg-gradient-to-br from-yellow-500 to-yellow-600 text-white border-0">
                        <CardContent className="p-4 flex items-center gap-4">
                            <Clock4 className="h-10 w-10 opacity-80" />
                            <div>
                                <p className="text-2xl font-bold">{busyCount}</p>
                                <p className="text-sm opacity-80">Currently Busy</p>
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="bg-gradient-to-br from-[#1F3F73] to-[#12302F] text-white border-0">
                        <CardContent className="p-4 flex items-center gap-4">
                            <Award className="h-10 w-10 opacity-80" />
                            <div>
                                <p className="text-2xl font-bold">
                                    {((staffList?.reduce((sum, s) => sum + s.ratings.average_rating, 0) || 0) / totalCount || 0).toFixed(1)}
                                </p>
                                <p className="text-sm opacity-80">Avg Rating</p>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>

                {/* Filters */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="flex flex-col md:flex-row gap-4 mb-8"
                >
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                            placeholder="Search by name, email, or skill..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-10"
                        />
                    </div>
                    <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
                        <SelectTrigger className="w-full md:w-48">
                            <SelectValue placeholder="All Departments" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Departments</SelectItem>
                            {departments?.map(dept => (
                                <SelectItem key={dept.id} value={dept.id}>{dept.name}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                        <SelectTrigger className="w-full md:w-40">
                            <SelectValue placeholder="All Status" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Status</SelectItem>
                            <SelectItem value="available">Available</SelectItem>
                            <SelectItem value="busy">Busy</SelectItem>
                            <SelectItem value="on_leave">On Leave</SelectItem>
                            <SelectItem value="offline">Offline</SelectItem>
                        </SelectContent>
                    </Select>
                    <Select value={sortBy} onValueChange={setSortBy}>
                        <SelectTrigger className="w-full md:w-40">
                            <SelectValue placeholder="Sort By" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="name">Name</SelectItem>
                            <SelectItem value="rating">Rating</SelectItem>
                            <SelectItem value="completed">Tasks Completed</SelectItem>
                            <SelectItem value="workload">Workload (Low First)</SelectItem>
                        </SelectContent>
                    </Select>
                </motion.div>

                {/* Staff Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {isLoading ? (
                        Array.from({ length: 8 }).map((_, i) => (
                            <StaffCardSkeleton key={i} />
                        ))
                    ) : filteredStaff.length === 0 ? (
                        <div className="col-span-full text-center py-12">
                            <User className="h-16 w-16 mx-auto text-gray-300 mb-4" />
                            <h3 className="text-lg font-medium text-gray-900 mb-2">No staff found</h3>
                            <p className="text-gray-500">Try adjusting your search or filter criteria</p>
                        </div>
                    ) : (
                        filteredStaff.map((staff, index) => (
                            <motion.div
                                key={staff.user_id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.05 }}
                            >
                                <StaffCard staff={staff} />
                            </motion.div>
                        ))
                    )}
                </div>
            </main>

            <Footer />
        </div>
    );
}
