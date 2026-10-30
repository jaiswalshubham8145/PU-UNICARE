/**
 * Analytics Dashboard Component
 * 
 * Comprehensive analytics for the complaint system:
 * - Trend analysis charts
 * - Department comparisons
 * - Resolution time metrics
 * - Interactive date filters
 */

import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
    BarChart3,
    TrendingUp,
    TrendingDown,
    Clock,
    CheckCircle2,
    AlertTriangle,
    Calendar,
    Download,
    Filter,
    RefreshCw,
    PieChart as PieChartIcon,
    Activity
} from 'lucide-react';
import {
    AreaChart,
    Area,
    BarChart,
    Bar,
    PieChart,
    Pie,
    Cell,
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { format, subDays, subMonths, startOfMonth, endOfMonth } from 'date-fns';
import { useDepartments } from '@/hooks/useComplaints';

const COLORS = ['#6366f1', '#22c55e', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];

interface AnalyticsData {
    totalComplaints: number;
    resolvedComplaints: number;
    pendingComplaints: number;
    averageResolutionTime: number;
    resolutionRate: number;
    trendData: Array<{ date: string; complaints: number; resolved: number }>;
    departmentData: Array<{ name: string; complaints: number; resolved: number }>;
    categoryData: Array<{ name: string; value: number }>;
    priorityData: Array<{ name: string; value: number }>;
    statusDistribution: Array<{ name: string; value: number }>;
}

function StatCard({
    title,
    value,
    change,
    icon: Icon,
    color
}: {
    title: string;
    value: string | number;
    change?: number;
    icon: React.ElementType;
    color: string;
}) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
        >
            <Card className="border-0 shadow-sm hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-500 mb-1">{title}</p>
                            <p className="text-2xl font-bold text-gray-900">{value}</p>
                            {change !== undefined && (
                                <div className={`flex items-center gap-1 mt-1 text-sm ${change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                    {change >= 0 ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                                    <span>{Math.abs(change)}% vs last period</span>
                                </div>
                            )}
                        </div>
                        <div className={`p-3 rounded-xl ${color}`}>
                            <Icon className="h-6 w-6 text-white" />
                        </div>
                    </div>
                </CardContent>
            </Card>
        </motion.div>
    );
}

export default function AnalyticsDashboard() {
    const [dateRange, setDateRange] = useState('30');
    const [selectedDepartment, setSelectedDepartment] = useState('all');

    const { data: departments } = useDepartments();

    // Fetch analytics data
    const { data: analytics, isLoading, refetch } = useQuery<AnalyticsData>({
        queryKey: ['analytics', dateRange, selectedDepartment],
        queryFn: async () => {
            const days = parseInt(dateRange);
            const startDate = format(subDays(new Date(), days), 'yyyy-MM-dd');

            // Build query
            let query = supabase
                .from('complaints')
                .select('*')
                .gte('created_at', startDate);

            if (selectedDepartment !== 'all') {
                query = query.eq('department_id', selectedDepartment);
            }

            const { data: complaints, error } = await query;
            if (error) throw error;

            // Calculate metrics
            const total = complaints?.length || 0;
            const resolved = complaints?.filter(c => c.status === 'completed').length || 0;
            const pending = complaints?.filter(c => ['pending', 'approved', 'assigned'].includes(c.status)).length || 0;

            // Calculate average resolution time (in hours)
            const resolvedComplaints = complaints?.filter(c => c.status === 'completed' && c.resolved_at) || [];
            const avgResolution = resolvedComplaints.length > 0
                ? resolvedComplaints.reduce((sum, c) => {
                    const created = new Date(c.created_at).getTime();
                    const resolved = new Date(c.resolved_at).getTime();
                    return sum + (resolved - created) / (1000 * 60 * 60);
                }, 0) / resolvedComplaints.length
                : 0;

            // Generate trend data (daily counts for the period)
            const trendMap = new Map<string, { complaints: number; resolved: number }>();
            for (let i = days - 1; i >= 0; i--) {
                const date = format(subDays(new Date(), i), 'MMM dd');
                trendMap.set(date, { complaints: 0, resolved: 0 });
            }

            complaints?.forEach(c => {
                const date = format(new Date(c.created_at), 'MMM dd');
                if (trendMap.has(date)) {
                    const current = trendMap.get(date)!;
                    current.complaints++;
                    if (c.status === 'completed') current.resolved++;
                }
            });

            const trendData = Array.from(trendMap.entries())
                .map(([date, data]) => ({ date, ...data }))
                .slice(-14); // Last 14 days for readability

            // Department breakdown
            const deptMap = new Map<string, { complaints: number; resolved: number }>();
            complaints?.forEach(c => {
                const deptId = c.department_id || 'Unknown';
                if (!deptMap.has(deptId)) {
                    deptMap.set(deptId, { complaints: 0, resolved: 0 });
                }
                const current = deptMap.get(deptId)!;
                current.complaints++;
                if (c.status === 'completed') current.resolved++;
            });

            const departmentData = await Promise.all(
                Array.from(deptMap.entries()).map(async ([id, data]) => {
                    const dept = departments?.find(d => d.id === id);
                    return { name: dept?.name || 'Unknown', ...data };
                })
            );

            // Category distribution
            const categoryMap = new Map<string, number>();
            complaints?.forEach(c => {
                const cat = c.category_id || 'Uncategorized';
                categoryMap.set(cat, (categoryMap.get(cat) || 0) + 1);
            });

            // Priority distribution
            const priorityMap = new Map<string, number>();
            complaints?.forEach(c => {
                const priority = c.priority || 'medium';
                priorityMap.set(priority, (priorityMap.get(priority) || 0) + 1);
            });

            // Status distribution
            const statusMap = new Map<string, number>();
            complaints?.forEach(c => {
                statusMap.set(c.status, (statusMap.get(c.status) || 0) + 1);
            });

            return {
                totalComplaints: total,
                resolvedComplaints: resolved,
                pendingComplaints: pending,
                averageResolutionTime: Math.round(avgResolution * 10) / 10,
                resolutionRate: total > 0 ? Math.round((resolved / total) * 100) : 0,
                trendData,
                departmentData,
                categoryData: Array.from(categoryMap.entries()).map(([name, value]) => ({ name, value })),
                priorityData: Array.from(priorityMap.entries()).map(([name, value]) => ({ name, value })),
                statusDistribution: Array.from(statusMap.entries()).map(([name, value]) => ({ name, value })),
            };
        },
        refetchInterval: 60000, // Refresh every minute
    });

    if (isLoading) {
        return (
            <div className="space-y-6 p-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    {[1, 2, 3, 4].map(i => (
                        <Skeleton key={i} className="h-32" />
                    ))}
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <Skeleton className="h-80" />
                    <Skeleton className="h-80" />
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6 p-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">📊 Analytics Dashboard</h1>
                    <p className="text-gray-500">Comprehensive insights into maintenance operations</p>
                </div>
                <div className="flex items-center gap-3">
                    <Select value={dateRange} onValueChange={setDateRange}>
                        <SelectTrigger className="w-40">
                            <Calendar className="h-4 w-4 mr-2" />
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="7">Last 7 days</SelectItem>
                            <SelectItem value="30">Last 30 days</SelectItem>
                            <SelectItem value="90">Last 90 days</SelectItem>
                            <SelectItem value="365">Last year</SelectItem>
                        </SelectContent>
                    </Select>
                    <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
                        <SelectTrigger className="w-48">
                            <Filter className="h-4 w-4 mr-2" />
                            <SelectValue placeholder="All Departments" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Departments</SelectItem>
                            {departments?.map(dept => (
                                <SelectItem key={dept.id} value={dept.id}>{dept.name}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <Button variant="outline" size="icon" onClick={() => refetch()}>
                        <RefreshCw className="h-4 w-4" />
                    </Button>
                    <Button variant="outline">
                        <Download className="h-4 w-4 mr-2" />
                        Export
                    </Button>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard
                    title="Total Complaints"
                    value={analytics?.totalComplaints || 0}
                    icon={BarChart3}
                    color="bg-gradient-to-br from-blue-500 to-blue-600"
                />
                <StatCard
                    title="Resolved"
                    value={analytics?.resolvedComplaints || 0}
                    change={5}
                    icon={CheckCircle2}
                    color="bg-gradient-to-br from-green-500 to-green-600"
                />
                <StatCard
                    title="Pending"
                    value={analytics?.pendingComplaints || 0}
                    icon={AlertTriangle}
                    color="bg-gradient-to-br from-yellow-500 to-orange-500"
                />
                <StatCard
                    title="Avg Resolution Time"
                    value={`${analytics?.averageResolutionTime || 0}h`}
                    icon={Clock}
                    color="bg-gradient-to-br from-[#1F3F73] to-[#12302F]"
                />
            </div>

            {/* Resolution Rate Progress */}
            <Card>
                <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <h3 className="font-semibold text-gray-900">Resolution Rate</h3>
                            <p className="text-sm text-gray-500">Percentage of complaints resolved</p>
                        </div>
                        <Badge variant="outline" className="text-lg px-4 py-1">
                            {analytics?.resolutionRate || 0}%
                        </Badge>
                    </div>
                    <div className="h-4 bg-gray-100 rounded-full overflow-hidden">
                        <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${analytics?.resolutionRate || 0}%` }}
                            transition={{ duration: 1, ease: 'easeOut' }}
                            className="h-full bg-gradient-to-r from-green-500 to-emerald-500"
                        />
                    </div>
                </CardContent>
            </Card>

            {/* Charts Row 1 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Trend Chart */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Activity className="h-5 w-5 text-blue-500" />
                            Complaint Trends
                        </CardTitle>
                        <CardDescription>Daily complaints vs resolved</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ResponsiveContainer width="100%" height={300}>
                            <AreaChart data={analytics?.trendData || []}>
                                <defs>
                                    <linearGradient id="colorComplaints" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                                    </linearGradient>
                                    <linearGradient id="colorResolved" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                                <YAxis tick={{ fontSize: 12 }} />
                                <Tooltip />
                                <Legend />
                                <Area
                                    type="monotone"
                                    dataKey="complaints"
                                    stroke="#6366f1"
                                    fill="url(#colorComplaints)"
                                    name="Complaints"
                                />
                                <Area
                                    type="monotone"
                                    dataKey="resolved"
                                    stroke="#22c55e"
                                    fill="url(#colorResolved)"
                                    name="Resolved"
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                {/* Department Distribution */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <BarChart3 className="h-5 w-5 text-[#C2A05A]" />
                            Department Comparison
                        </CardTitle>
                        <CardDescription>Complaints by department</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={analytics?.departmentData || []} layout="vertical">
                                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                <XAxis type="number" tick={{ fontSize: 12 }} />
                                <YAxis dataKey="name" type="category" tick={{ fontSize: 12 }} width={100} />
                                <Tooltip />
                                <Legend />
                                <Bar dataKey="complaints" fill="#6366f1" name="Total" radius={[0, 4, 4, 0]} />
                                <Bar dataKey="resolved" fill="#22c55e" name="Resolved" radius={[0, 4, 4, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
            </div>

            {/* Charts Row 2 */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Status Distribution */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <PieChartIcon className="h-5 w-5 text-orange-500" />
                            Status Distribution
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ResponsiveContainer width="100%" height={250}>
                            <PieChart>
                                <Pie
                                    data={analytics?.statusDistribution || []}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={80}
                                    paddingAngle={5}
                                    dataKey="value"
                                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                >
                                    {(analytics?.statusDistribution || []).map((_, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                            </PieChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                {/* Priority Distribution */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <AlertTriangle className="h-5 w-5 text-red-500" />
                            Priority Breakdown
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ResponsiveContainer width="100%" height={250}>
                            <PieChart>
                                <Pie
                                    data={analytics?.priorityData || []}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={80}
                                    paddingAngle={5}
                                    dataKey="value"
                                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                >
                                    <Cell fill="#22c55e" /> {/* low */}
                                    <Cell fill="#f59e0b" /> {/* medium */}
                                    <Cell fill="#ef4444" /> {/* high */}
                                    <Cell fill="#881337" /> {/* critical */}
                                </Pie>
                                <Tooltip />
                            </PieChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                {/* Quick Stats */}
                <Card>
                    <CardHeader>
                        <CardTitle>Quick Stats</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <span className="text-gray-600">Resolution Rate</span>
                            <span className="font-bold text-green-600">{analytics?.resolutionRate}%</span>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <span className="text-gray-600">Avg Resolution</span>
                            <span className="font-bold text-blue-600">{analytics?.averageResolutionTime}h</span>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <span className="text-gray-600">Active Departments</span>
                            <span className="font-bold text-[#1F3F73]">{analytics?.departmentData?.length || 0}</span>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <span className="text-gray-600">Pending Review</span>
                            <span className="font-bold text-orange-600">{analytics?.pendingComplaints}</span>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
