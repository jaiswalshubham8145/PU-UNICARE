import { Card } from "@/components/ui/card";
import { TrendingUp, TrendingDown, Clock, CheckCircle2, AlertCircle, Star, LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import {
    LineChart,
    Line,
    AreaChart,
    Area,
    BarChart,
    Bar,
    PieChart,
    Pie,
    Cell,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
} from "recharts";
import { useSLABreachStats } from "@/hooks/useSLA";
import { useSystemRatings } from "@/hooks/useRatings";

interface AnalyticsDashboardProps {
    complaintStats?: {
        total: number;
        pending: number;
        in_progress: number;
        completed: number;
        closed: number;
    };
    trendData?: Array<{
        date: string;
        total: number;
        completed: number;
        pending: number;
    }>;
}

const AnalyticsDashboard = ({ complaintStats, trendData = [] }: AnalyticsDashboardProps) => {
    const { data: slaStats } = useSLABreachStats();
    const { data: ratingsStats } = useSystemRatings();

    // Sample trend data if not provided
    const defaultTrendData = [
        { date: "Mon", total: 12, completed: 8, pending: 4 },
        { date: "Tue", total: 15, completed: 10, pending: 5 },
        { date: "Wed", total: 20, completed: 14, pending: 6 },
        { date: "Thu", total: 18, completed: 15, pending: 3 },
        { date: "Fri", total: 22, completed: 18, pending: 4 },
        { date: "Sat", total: 8, completed: 7, pending: 1 },
        { date: "Sun", total: 5, completed: 4, pending: 1 },
    ];

    const chartData = trendData.length > 0 ? trendData : defaultTrendData;

    // Status distribution for pie chart
    const statusData = [
        { name: "Pending", value: complaintStats?.pending || 0, color: "#f59e0b" },
        { name: "In Progress", value: complaintStats?.in_progress || 0, color: "#3b82f6" },
        { name: "Completed", value: (complaintStats?.completed || 0) + (complaintStats?.closed || 0), color: "#10b981" },
    ];

    // Rating distribution
    const ratingDistributionData = ratingsStats
        ? Object.entries(ratingsStats.rating_distribution).map(([rating, count]): { rating: string; count: number } => ({
            rating: `${rating} ⭐`,
            count: count as number,
        }))
        : [];

    const StatCard = ({
        title,
        value,
        icon: Icon,
        trend,
        trendUp,
        color,
    }: {
        title: string;
        value: number | string;
        icon: LucideIcon;
        trend?: string;
        trendUp?: boolean;
        color: string;
    }) => (
        <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
                <div className={cn("w-12 h-12 rounded-lg flex items-center justify-center", color)}>
                    <Icon className="w-6 h-6 text-white" />
                </div>
                {trend && (
                    <div className={cn("flex items-center gap-1 text-sm font-medium",
                        trendUp ? "text-success" : "text-destructive"
                    )}>
                        {trendUp ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                        {trend}
                    </div>
                )}
            </div>
            <div className="text-3xl font-bold text-foreground">{value}</div>
            <div className="text-sm text-muted-foreground mt-1">{title}</div>
        </Card>
    );

    return (
        <div className="space-y-6">
            {/* Key Metrics Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard
                    title="SLA Compliance Rate"
                    value={slaStats ? `${slaStats.compliance_rate.toFixed(1)}%` : "N/A"}
                    icon={CheckCircle2}
                    trend="+5.2%"
                    trendUp={true}
                    color="bg-success"
                />
                <StatCard
                    title="Avg Response Time"
                    value="2.4 hrs"
                    icon={Clock}
                    trend="-12%"
                    trendUp={true}
                    color="bg-info"
                />
                <StatCard
                    title="SLA Breaches"
                    value={slaStats?.resolution_breaches || 0}
                    icon={AlertCircle}
                    trend="-8%"
                    trendUp={true}
                    color="bg-warning"
                />
                <StatCard
                    title="Avg Rating"
                    value={ratingsStats ? ratingsStats.avg_rating.toFixed(1) : "N/A"}
                    icon={Star}
                    trend="+0.3"
                    trendUp={true}
                    color="bg-accent"
                />
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Trend Chart */}
                <Card className="p-6">
                    <h3 className="text-lg font-bold text-foreground mb-6 flex items-center gap-2">
                        <TrendingUp className="w-5 h-5 text-accent" />
                        Complaint Trends (Last 7 Days)
                    </h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <AreaChart data={chartData}>
                            <defs>
                                <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                                </linearGradient>
                                <linearGradient id="colorCompleted" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="hsl(var(--success))" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="hsl(var(--success))" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                            <XAxis dataKey="date" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }} />
                            <YAxis tick={{ fill: "hsl(var(--muted-foreground))" }} />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: "hsl(var(--card))",
                                    border: "1px solid hsl(var(--border))",
                                    borderRadius: "8px",
                                }}
                            />
                            <Legend />
                            <Area
                                type="monotone"
                                dataKey="total"
                                stroke="hsl(var(--primary))"
                                fillOpacity={1}
                                fill="url(#colorTotal)"
                                name="Total"
                            />
                            <Area
                                type="monotone"
                                dataKey="completed"
                                stroke="hsl(var(--success))"
                                fillOpacity={1}
                                fill="url(#colorCompleted)"
                                name="Completed"
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </Card>

                {/* Status Distribution */}
                <Card className="p-6">
                    <h3 className="text-lg font-bold text-foreground mb-6">Status Distribution</h3>
                    <div className="flex items-center justify-center">
                        <ResponsiveContainer width="100%" height={300}>
                            <PieChart>
                                <Pie
                                    data={statusData}
                                    cx="50%"
                                    cy="50%"
                                    labelLine={false}
                                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                                    outerRadius={100}
                                    fill="#8884d8"
                                    dataKey="value"
                                >
                                    {statusData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Tooltip />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </Card>
            </div>

            {/* Rating Distribution */}
            {ratingDistributionData.length > 0 && (
                <Card className="p-6">
                    <h3 className="text-lg font-bold text-foreground mb-6 flex items-center gap-2">
                        <Star className="w-5 h-5 text-yellow-400" />
                        Rating Distribution
                    </h3>
                    <ResponsiveContainer width="100%" height={250}>
                        <BarChart data={ratingDistributionData} layout="vertical">
                            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                            <XAxis type="number" tick={{ fill: "hsl(var(--muted-foreground))" }} />
                            <YAxis dataKey="rating" type="category" tick={{ fill: "hsl(var(--muted-foreground))" }} />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: "hsl(var(--card))",
                                    border: "1px solid hsl(var(--border))",
                                    borderRadius: "8px",
                                }}
                            />
                            <Bar dataKey="count" fill="hsl(var(--accent))" radius={[0, 4, 4, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </Card>
            )}

            {/* Performance Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="p-6">
                    <div className="text-sm text-muted-foreground mb-2">Total Tracked</div>
                    <div className="text-2xl font-bold text-foreground">{slaStats?.total_tracked || 0}</div>
                    <div className="text-xs text-muted-foreground mt-1">Complaints with SLA</div>
                </Card>
                <Card className="p-6">
                    <div className="text-sm text-muted-foreground mb-2">Total Ratings</div>
                    <div className="text-2xl font-bold text-foreground">{ratingsStats?.total_ratings || 0}</div>
                    <div className="text-xs text-muted-foreground mt-1">User feedback received</div>
                </Card>
                <Card className="p-6">
                    <div className="text-sm text-muted-foreground mb-2">Recommendation Rate</div>
                    <div className="text-2xl font-bold text-foreground">
                        {ratingsStats ? `${ratingsStats.recommendation_rate.toFixed(1)}%` : "N/A"}
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">Would recommend</div>
                </Card>
            </div>
        </div>
    );
};

export default AnalyticsDashboard;
