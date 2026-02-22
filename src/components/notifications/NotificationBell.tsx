import { Bell, Check, Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
    useNotifications,
    useUnreadNotificationCount,
    useMarkNotificationRead,
    useMarkAllNotificationsRead,
    useDeleteNotification,
    useRealtimeNotifications,
} from "@/hooks/useNotifications";
import { useNavigate } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";

interface NotificationBellProps {
    userId: string | undefined;
}

const NotificationBell = ({ userId }: NotificationBellProps) => {
    const navigate = useNavigate();
    const { data: notifications = [] } = useNotifications(userId);
    const { data: unreadCount = 0 } = useUnreadNotificationCount(userId);
    const markAsRead = useMarkNotificationRead();
    const markAllAsRead = useMarkAllNotificationsRead();
    const deleteNotification = useDeleteNotification();

    // Enable real-time updates
    useRealtimeNotifications(userId);

    const handleNotificationClick = (notification: typeof notifications[0]) => {
        if (!notification.is_read) {
            markAsRead.mutate(notification.id);
        }
        if (notification.link) {
            navigate(notification.link);
        }
    };

    const handleMarkAllRead = () => {
        if (userId) {
            markAllAsRead.mutate(userId);
        }
    };

    const handleDelete = (e: React.MouseEvent, notificationId: string) => {
        e.stopPropagation();
        deleteNotification.mutate(notificationId);
    };

    const getNotificationIcon = (type: string) => {
        const iconClass = "w-4 h-4";
        switch (type) {
            case "complaint_created":
                return <Bell className={iconClass} />;
            case "complaint_assigned":
                return <Check className={iconClass} />;
            case "sla_warning":
            case "sla_breach":
                return <span className="text-lg">⚠️</span>;
            case "complaint_completed":
                return <span className="text-lg">✅</span>;
            default:
                return <Bell className={iconClass} />;
        }
    };

    const getNotificationColor = (type: string) => {
        switch (type) {
            case "sla_warning":
                return "bg-warning/10 border-warning/30";
            case "sla_breach":
                return "bg-destructive/10 border-destructive/30";
            case "complaint_completed":
                return "bg-success/10 border-success/30";
            case "complaint_assigned":
                return "bg-info/10 border-info/30";
            default:
                return "bg-accent/10 border-accent/30";
        }
    };

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="relative">
                    <Bell className="h-5 w-5" />
                    {unreadCount > 0 && (
                        <Badge
                            variant="destructive"
                            className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
                        >
                            {unreadCount > 9 ? "9+" : unreadCount}
                        </Badge>
                    )}
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80 md:w-96">
                <div className="flex items-center justify-between p-4 border-b">
                    <h3 className="font-semibold text-lg">Notifications</h3>
                    {unreadCount > 0 && (
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleMarkAllRead}
                            className="text-xs h-8"
                        >
                            Mark all read
                        </Button>
                    )}
                </div>

                <ScrollArea className="h-[400px]">
                    {notifications.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
                            <Bell className="w-12 h-12 mb-2 opacity-20" />
                            <p className="text-sm">No notifications yet</p>
                        </div>
                    ) : (
                        <div className="py-2">
                            {notifications.map((notification) => (
                                <div
                                    key={notification.id}
                                    className={cn(
                                        "border-b last:border-0 transition-colors cursor-pointer hover:bg-accent/5",
                                        !notification.is_read && "bg-accent/5"
                                    )}
                                    onClick={() => handleNotificationClick(notification)}
                                >
                                    <div className="p-4">
                                        <div className="flex items-start gap-3">
                                            <div
                                                className={cn(
                                                    "w-10 h-10 rounded-lg border flex items-center justify-center flex-shrink-0",
                                                    getNotificationColor(notification.type)
                                                )}
                                            >
                                                {getNotificationIcon(notification.type)}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-start justify-between gap-2">
                                                    <h4
                                                        className={cn(
                                                            "text-sm font-medium",
                                                            !notification.is_read && "font-bold"
                                                        )}
                                                    >
                                                        {notification.title}
                                                    </h4>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-6 w-6 flex-shrink-0"
                                                        onClick={(e) => handleDelete(e, notification.id)}
                                                    >
                                                        <X className="w-3 h-3" />
                                                    </Button>
                                                </div>
                                                <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                                                    {notification.message}
                                                </p>
                                                <div className="flex items-center gap-2 mt-2">
                                                    <span className="text-xs text-muted-foreground">
                                                        {formatDistanceToNow(new Date(notification.created_at), {
                                                            addSuffix: true,
                                                        })}
                                                    </span>
                                                    {!notification.is_read && (
                                                        <Badge variant="secondary" className="text-xs px-1.5 py-0">
                                                            New
                                                        </Badge>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </ScrollArea>

                {notifications.length > 0 && (
                    <>
                        <DropdownMenuSeparator />
                        <div className="p-2">
                            <Button variant="ghost" className="w-full text-sm" onClick={() => navigate("/notifications")}>
                                View All Notifications
                            </Button>
                        </div>
                    </>
                )}
            </DropdownMenuContent>
        </DropdownMenu>
    );
};

export default NotificationBell;
