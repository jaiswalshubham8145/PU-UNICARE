import { useState } from "react";
import { formatDistanceToNow } from "date-fns";
import {
    Bell,
    Check,
    Trash2,
    CheckCheck,
    MessageSquare,
    AlertTriangle,
    CheckCircle2,
    Calendar,
    ArrowRight
} from "lucide-react";
import { motion, AnimatePresence, type Variants } from "framer-motion";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";

import { useAuth } from "@/hooks/useAuth";
import {
    useNotifications,
    useUnreadNotificationCount,
    useMarkNotificationRead,
    useMarkAllNotificationsRead,
    useDeleteNotification
} from "@/hooks/useNotifications";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

const Notifications = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState("all");

    // Data hooks
    const { data: notifications = [], isLoading } = useNotifications(user?.id);
    const { data: unreadCount = 0 } = useUnreadNotificationCount(user?.id);

    // Mutation hooks
    const markAsRead = useMarkNotificationRead();
    const markAllAsRead = useMarkAllNotificationsRead();
    const deleteNotification = useDeleteNotification();

    // Filter notifications based on tab
    const filteredNotifications = notifications.filter(n => {
        if (activeTab === "unread") return !n.is_read;
        return true;
    });

    const handleNotificationClick = (notification: typeof notifications[0]) => {
        if (!notification.is_read) {
            markAsRead.mutate(notification.id);
        }
        if (notification.link) {
            navigate(notification.link);
        }
    };

    const handleMarkAllRead = () => {
        if (user?.id) {
            markAllAsRead.mutate(user.id);
        }
    };

    const handleDelete = (e: React.MouseEvent, id: string) => {
        e.stopPropagation();
        deleteNotification.mutate(id);
    };

    const getIcon = (type: string) => {
        switch (type) {
            case "new_complaint":
            case "complaint_created":
                return <Bell className="h-5 w-5 text-blue-500" />;
            case "status_update":
                return <MessageSquare className="h-5 w-5 text-indigo-500" />;
            case "assignment":
            case "complaint_assigned":
                return <Calendar className="h-5 w-5 text-[#C2A05A]" />;
            case "completion":
            case "complaint_completed":
                return <CheckCircle2 className="h-5 w-5 text-green-500" />;
            case "sla_breach":
            case "sla_warning":
                return <AlertTriangle className="h-5 w-5 text-red-500" />;
            default:
                return <Bell className="h-5 w-5 text-gray-500" />;
        }
    };

    const getTypeColor = (type: string) => {
        switch (type) {
            case "new_complaint": return "bg-blue-500/10 border-blue-500/20";
            case "status_update": return "bg-indigo-500/10 border-indigo-500/20";
            case "assignment": return "bg-[#C2A05A]/10 border-[#C2A05A]/25";
            case "completion": return "bg-green-500/10 border-green-500/20";
            case "sla_breach": return "bg-red-500/10 border-red-500/20";
            default: return "bg-gray-500/10 border-gray-500/20";
        }
    };

    const containerVariants: Variants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { staggerChildren: 0.05 }
        }
    };

    const itemVariants: Variants = {
        hidden: { y: 20, opacity: 0 },
        visible: {
            y: 0,
            opacity: 1,
            transition: { type: "spring" as const, stiffness: 100 }
        },
        exit: {
            x: -20,
            opacity: 0,
            transition: { duration: 0.2 }
        }
    };

    return (
        <div className="min-h-screen bg-background">
            <Navbar />

            <main className="container max-w-4xl mx-auto pt-24 pb-16 px-4">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Notifications</h1>
                        <p className="text-muted-foreground mt-1">
                            Stay updated with your complaint status and activities.
                        </p>
                    </div>

                    <div className="flex items-center gap-2">
                        {unreadCount > 0 && (
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={handleMarkAllRead}
                                className="group hover:bg-primary/5"
                            >
                                <CheckCheck className="w-4 h-4 mr-2 group-hover:text-primary transition-colors" />
                                Mark all as read
                            </Button>
                        )}
                    </div>
                </div>

                <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab} className="w-full">
                    <TabsList className="mb-6 grid w-full max-w-md grid-cols-2">
                        <TabsTrigger value="all" className="relative">
                            All Notifications
                            <Badge variant="secondary" className="ml-2 h-5 min-w-5 px-1 rounded-full text-[10px]">
                                {notifications.length}
                            </Badge>
                        </TabsTrigger>
                        <TabsTrigger value="unread" className="relative">
                            Unread
                            {unreadCount > 0 && (
                                <Badge variant="destructive" className="ml-2 h-5 min-w-5 px-1 rounded-full text-[10px]">
                                    {unreadCount}
                                </Badge>
                            )}
                        </TabsTrigger>
                    </TabsList>

                    <Card className="border-none shadow-sm bg-card/50 backdrop-blur-sm">
                        <CardContent className="p-0">
                            {isLoading ? (
                                <div className="p-8 text-center text-muted-foreground animate-pulse">
                                    Loading notifications...
                                </div>
                            ) : filteredNotifications.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-16 text-center">
                                    <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
                                        <Bell className="w-8 h-8 text-muted-foreground/50" />
                                    </div>
                                    <h3 className="text-lg font-medium">No {activeTab === "unread" ? "new " : ""}notifications</h3>
                                    <p className="text-muted-foreground max-w-xs mx-auto mt-2">
                                        {activeTab === "unread"
                                            ? "You're all caught up! Check the 'All' tab for past notifications."
                                            : "You don't have any notifications at the moment."}
                                    </p>
                                </div>
                            ) : (
                                <ScrollArea className="h-[600px]">
                                    <motion.div
                                        className="flex flex-col p-2 gap-2"
                                        variants={containerVariants}
                                        initial="hidden"
                                        animate="visible"
                                    >
                                        <AnimatePresence mode="popLayout">
                                            {filteredNotifications.map((notification) => (
                                                <motion.div
                                                    key={notification.id}
                                                    variants={itemVariants}
                                                    layout
                                                    className={cn(
                                                        "relative group flex gap-4 p-4 rounded-xl border transition-all duration-200 cursor-pointer hover:shadow-md",
                                                        notification.is_read
                                                            ? "bg-card border-border hover:border-primary/20"
                                                            : "bg-accent/5 border-primary/20 hover:bg-accent/10"
                                                    )}
                                                    onClick={() => handleNotificationClick(notification)}
                                                >
                                                    <div className={cn(
                                                        "flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center border",
                                                        getTypeColor(notification.type)
                                                    )}>
                                                        {getIcon(notification.type)}
                                                    </div>

                                                    <div className="flex-1 min-w-0 pt-1">
                                                        <div className="flex items-start justify-between gap-4">
                                                            <div>
                                                                <h4 className={cn(
                                                                    "text-base leading-none mb-1.5",
                                                                    notification.is_read ? "font-medium" : "font-semibold"
                                                                )}>
                                                                    {notification.title}
                                                                </h4>
                                                                <p className="text-sm text-muted-foreground line-clamp-2">
                                                                    {notification.message}
                                                                </p>
                                                            </div>
                                                            <div className="flex flex-col items-end gap-2">
                                                                <span className="text-xs text-muted-foreground whitespace-nowrap">
                                                                    {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                                                                </span>
                                                                {!notification.is_read && (
                                                                    <span className="w-2 h-2 bg-primary rounded-full animate-pulse" />
                                                                )}
                                                            </div>
                                                        </div>

                                                        {notification.link && (
                                                            <div className="mt-3 flex items-center text-xs font-medium text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                                                                View Details <ArrowRight className="w-3 h-3 ml-1" />
                                                            </div>
                                                        )}
                                                    </div>

                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-destructive/10 hover:text-destructive"
                                                        onClick={(e) => handleDelete(e, notification.id)}
                                                        title="Delete notification"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </Button>
                                                </motion.div>
                                            ))}
                                        </AnimatePresence>
                                    </motion.div>
                                </ScrollArea>
                            )}
                        </CardContent>
                    </Card>
                </Tabs>
            </main>
            <Footer />
        </div>
    );
};

export default Notifications;
