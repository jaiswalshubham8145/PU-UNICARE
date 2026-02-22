import { useEffect, useCallback, useRef } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Database } from "@/integrations/supabase/types";
import { logSecurityEvent, updateLastActivity, getLastActivity, isSessionValid } from "@/lib/security";

type AppRole = Database['public']['Enums']['app_role'];

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: AppRole[];
  /** Maximum idle time in minutes before auto-logout (default: 30) */
  maxIdleMinutes?: number;
  /** Whether to show access denied page instead of redirecting */
  showAccessDenied?: boolean;
}

// Session timeout in milliseconds (30 minutes default)
const DEFAULT_IDLE_TIMEOUT = 30 * 60 * 1000;

const ProtectedRoute = ({
  children,
  allowedRoles,
  maxIdleMinutes = 30,
  showAccessDenied = false
}: ProtectedRouteProps) => {
  const { user, loading, roles, signOut } = useAuth();
  const location = useLocation();
  const lastActivityCheckRef = useRef<NodeJS.Timeout | null>(null);
  const idleTimeoutMs = maxIdleMinutes * 60 * 1000;

  // Update activity on user interaction
  const handleUserActivity = useCallback(() => {
    updateLastActivity();
  }, []);

  // Check session validity periodically
  const checkSessionValidity = useCallback(async () => {
    const lastActivity = getLastActivity();

    if (lastActivity && !isSessionValid(lastActivity, maxIdleMinutes)) {
      logSecurityEvent({
        type: 'session_expired',
        severity: 'low',
        message: `Session expired due to ${maxIdleMinutes} minutes of inactivity`,
        metadata: { lastActivity: lastActivity.toISOString() }
      });

      await signOut();
    }
  }, [maxIdleMinutes, signOut]);

  // Set up activity tracking and session checking
  useEffect(() => {
    if (!user) return;

    // Initialize last activity
    updateLastActivity();

    // Track user activity
    const activityEvents = ['mousedown', 'keydown', 'scroll', 'touchstart'];
    activityEvents.forEach(event => {
      window.addEventListener(event, handleUserActivity, { passive: true });
    });

    // Periodic session check (every minute)
    lastActivityCheckRef.current = setInterval(checkSessionValidity, 60000);

    return () => {
      activityEvents.forEach(event => {
        window.removeEventListener(event, handleUserActivity);
      });

      if (lastActivityCheckRef.current) {
        clearInterval(lastActivityCheckRef.current);
      }
    };
  }, [user, handleUserActivity, checkSessionValidity]);

  // Loading state with improved UI
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary/20 border-t-primary"></div>
          </div>
          <p className="text-sm text-muted-foreground animate-pulse">
            Verifying authentication...
          </p>
        </div>
      </div>
    );
  }

  // Not authenticated
  if (!user) {
    logSecurityEvent({
      type: 'auth_failure',
      severity: 'low',
      message: 'Unauthenticated access attempt',
      metadata: {
        attemptedPath: location.pathname,
        timestamp: new Date().toISOString()
      }
    });

    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check role permissions
  if (allowedRoles && allowedRoles.length > 0) {
    const hasPermission = allowedRoles.some(role => roles.includes(role));

    if (!hasPermission) {
      logSecurityEvent({
        type: 'permission_denied',
        severity: 'medium',
        message: `Unauthorized access attempt to protected route`,
        metadata: {
          attemptedPath: location.pathname,
          userRoles: roles,
          requiredRoles: allowedRoles,
          userId: user.id
        }
      });

      if (showAccessDenied) {
        return (
          <div className="min-h-screen flex items-center justify-center bg-background">
            <div className="max-w-md w-full bg-card border border-border rounded-2xl p-8 text-center shadow-lg">
              <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-4xl">🚫</span>
              </div>
              <h2 className="text-2xl font-bold mb-3 text-foreground">Access Denied</h2>
              <p className="text-muted-foreground mb-6">
                You don't have permission to access this page. Please contact your administrator if you believe this is an error.
              </p>
              <div className="flex gap-3 justify-center">
                <button
                  onClick={() => window.history.back()}
                  className="px-4 py-2 rounded-lg border border-border hover:bg-accent transition-colors"
                >
                  Go Back
                </button>
                <a
                  href="/"
                  className="px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
                >
                  Home
                </a>
              </div>
            </div>
          </div>
        );
      }

      return <Navigate to="/" replace />;
    }
  }

  // Authorized - render children
  return <>{children}</>;
};

export default ProtectedRoute;
