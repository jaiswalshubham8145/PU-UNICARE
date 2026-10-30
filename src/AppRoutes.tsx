import { Suspense, lazy } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { Loader2 } from "lucide-react";
import ProtectedRoute from "@/components/ProtectedRoute";
import ErrorBoundary from "@/components/ErrorBoundary";
import { PageLoadingSkeleton } from "@/components/ui/skeleton";

// Public Pages
const Index = lazy(() => import("./pages/Index"));
const About = lazy(() => import("./pages/About"));
const Maintenance = lazy(() => import("./pages/Maintenance"));
const RegisterComplaint = lazy(() => import("./pages/RegisterComplaint"));
const TrackComplaint = lazy(() => import("./pages/TrackComplaint"));
const Contact = lazy(() => import("./pages/Contact"));
const Login = lazy(() => import("./pages/Login"));
const ForgotPassword = lazy(() => import("./pages/ForgotPassword"));
const ResetPassword = lazy(() => import("./pages/ResetPassword"));
const Register = lazy(() => import("./pages/Register"));
const NotFound = lazy(() => import("./pages/NotFound"));
const ComplaintWizard = lazy(() => import("./pages/ComplaintWizard"));
const BatchComplaint = lazy(() => import("./pages/BatchComplaint"));
const KnowledgeBase = lazy(() => import("./pages/KnowledgeBase"));
const StaffDirectory = lazy(() => import("./pages/StaffDirectory"));
const HelpCenter = lazy(() => import("./pages/HelpCenter"));
const SatisfactionSurvey = lazy(() => import("./pages/SatisfactionSurvey"));
const ApiDocs = lazy(() => import("./pages/ApiDocs"));

// Protected Pages
const Profile = lazy(() => import("./pages/Profile"));
const Settings = lazy(() => import("./pages/Settings"));
const Notifications = lazy(() => import("./pages/Notifications"));
const Inventory = lazy(() => import("./pages/dashboard/Inventory"));
const CalendarView = lazy(() => import("./pages/dashboard/CalendarView"));

// Dashboard Pages
const FacultyDashboard = lazy(() => import("./pages/dashboard/FacultyDashboard"));
const HODDashboard = lazy(() => import("./pages/dashboard/HODDashboard"));
const AdminDashboard = lazy(() => import("./pages/dashboard/AdminDashboard"));
const MaintenanceStaffDashboard = lazy(() => import("./pages/dashboard/MaintenanceStaffDashboard"));
const PrincipalDashboard = lazy(() => import("./pages/dashboard/PrincipalDashboard"));
const AdminUserManagement = lazy(() => import("./pages/dashboard/AdminUserManagement"));
const HODPendingComplaints = lazy(() => import("./pages/dashboard/HODPendingComplaints"));
const HODInProgressComplaints = lazy(() => import("./pages/dashboard/HODInProgressComplaints"));
const HODCompletedComplaints = lazy(() => import("./pages/dashboard/HODCompletedComplaints"));
const HODAllComplaints = lazy(() => import("./pages/dashboard/HODAllComplaints"));
const AdminAllComplaints = lazy(() => import("./pages/dashboard/AdminAllComplaints"));
const AdminPendingComplaints = lazy(() => import("./pages/dashboard/AdminPendingComplaints"));
const AdminInProgressComplaints = lazy(() => import("./pages/dashboard/AdminInProgressComplaints"));
const AdminCompletedComplaints = lazy(() => import("./pages/dashboard/AdminCompletedComplaints"));
const PrincipalAllComplaints = lazy(() => import("./pages/dashboard/PrincipalAllComplaints"));
const PrincipalDelayedComplaints = lazy(() => import("./pages/dashboard/PrincipalDelayedComplaints"));
const PrincipalInProgressComplaints = lazy(() => import("./pages/dashboard/PrincipalInProgressComplaints"));
const PrincipalResolvedComplaints = lazy(() => import("./pages/dashboard/PrincipalResolvedComplaints"));
const MaintenanceNewAssignedComplaints = lazy(() => import("./pages/dashboard/MaintenanceNewAssignedComplaints"));
const MaintenanceInProgressComplaints = lazy(() => import("./pages/dashboard/MaintenanceInProgressComplaints"));
const MaintenanceOnHoldComplaints = lazy(() => import("./pages/dashboard/MaintenanceOnHoldComplaints"));
const MaintenanceCompletedComplaints = lazy(() => import("./pages/dashboard/MaintenanceCompletedComplaints"));

const LoadingFallback = () => <PageLoadingSkeleton />;

const RouteErrorFallback = ({ error }: { error?: Error }) => (
  <div className="flex h-screen w-full items-center justify-center bg-background p-4">
    <div className="max-w-md w-full text-center">
      <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mx-auto mb-4">
        <span className="text-3xl" aria-hidden="true">⚠️</span>
      </div>
      <h2 className="text-xl font-bold mb-2">Page Error</h2>
      <p className="text-muted-foreground mb-4">Failed to load this page.</p>
      {error && <pre className="text-left text-xs bg-black/20 p-4 rounded-md overflow-auto mb-4 text-red-400">{error.message}</pre>}
      <button onClick={() => window.location.reload()} className="bg-primary text-primary-foreground px-4 py-2 rounded-md">
        Reload Page
      </button>
    </div>
  </div>
);

const AppRoutes = () => {
  return (
    <ErrorBoundary>
      <Suspense fallback={<LoadingFallback />}>
        <main id="main-content" tabIndex={-1} className="outline-none">
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Index />} />
            <Route path="/help" element={<KnowledgeBase />} />
            <Route path="/about" element={<About />} />
            <Route path="/maintenance" element={<Maintenance />} />
            <Route path="/register-complaint" element={<RegisterComplaint />} />
            <Route path="/complaint-wizard" element={<ComplaintWizard />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/staff-directory" element={<StaffDirectory />} />
            <Route path="/help-center" element={<HelpCenter />} />
            <Route path="/api-docs" element={<ApiDocs />} />

            {/* Protected Routes */}
            <Route path="/register-batch" element={<ProtectedRoute><BatchComplaint /></ProtectedRoute>} />
            <Route path="/track" element={<ProtectedRoute><TrackComplaint /></ProtectedRoute>} />
            <Route path="/survey" element={<ProtectedRoute><SatisfactionSurvey /></ProtectedRoute>} />
            <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
            <Route path="/notifications" element={<ProtectedRoute><Notifications /></ProtectedRoute>} />
            <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />

            {/* Faculty Dashboard */}
            <Route path="/dashboard/faculty" element={<ProtectedRoute allowedRoles={["faculty"]}><FacultyDashboard /></ProtectedRoute>} />
            <Route path="/dashboard/cr" element={<Navigate to="/dashboard/faculty" replace />} />

            {/* HOD Dashboard */}
            <Route path="/dashboard/hod" element={<ProtectedRoute allowedRoles={["hod", "admin", "principal"]}><HODDashboard /></ProtectedRoute>} />
            <Route path="/dashboard/hod/pending" element={<ProtectedRoute allowedRoles={["hod", "admin", "principal"]}><HODPendingComplaints /></ProtectedRoute>} />
            <Route path="/dashboard/hod/in-progress" element={<ProtectedRoute allowedRoles={["hod", "admin", "principal"]}><HODInProgressComplaints /></ProtectedRoute>} />
            <Route path="/dashboard/hod/completed" element={<ProtectedRoute allowedRoles={["hod", "admin", "principal"]}><HODCompletedComplaints /></ProtectedRoute>} />
            <Route path="/dashboard/hod/all" element={<ProtectedRoute allowedRoles={["hod", "admin", "principal"]}><HODAllComplaints /></ProtectedRoute>} />

            {/* Principal Dashboard */}
            <Route path="/dashboard/principal" element={<ProtectedRoute allowedRoles={["principal", "admin"]}><PrincipalDashboard /></ProtectedRoute>} />
            <Route path="/dashboard/principal/all" element={<ProtectedRoute allowedRoles={["principal", "admin"]}><PrincipalAllComplaints /></ProtectedRoute>} />
            <Route path="/dashboard/principal/delayed" element={<ProtectedRoute allowedRoles={["principal", "admin"]}><PrincipalDelayedComplaints /></ProtectedRoute>} />
            <Route path="/dashboard/principal/in-progress" element={<ProtectedRoute allowedRoles={["principal", "admin"]}><PrincipalInProgressComplaints /></ProtectedRoute>} />
            <Route path="/dashboard/principal/resolved" element={<ProtectedRoute allowedRoles={["principal", "admin"]}><PrincipalResolvedComplaints /></ProtectedRoute>} />

            {/* Maintenance Dashboard */}
            <Route path="/dashboard/maintenance" element={<ProtectedRoute allowedRoles={["maintenance_staff", "admin"]}><MaintenanceStaffDashboard /></ProtectedRoute>} />
            <Route path="/dashboard/maintenance/new-assigned" element={<ProtectedRoute allowedRoles={["maintenance_staff", "admin"]}><MaintenanceNewAssignedComplaints /></ProtectedRoute>} />
            <Route path="/dashboard/maintenance/in-progress" element={<ProtectedRoute allowedRoles={["maintenance_staff", "admin"]}><MaintenanceInProgressComplaints /></ProtectedRoute>} />
            <Route path="/dashboard/maintenance/on-hold" element={<ProtectedRoute allowedRoles={["maintenance_staff", "admin"]}><MaintenanceOnHoldComplaints /></ProtectedRoute>} />
            <Route path="/dashboard/maintenance/completed" element={<ProtectedRoute allowedRoles={["maintenance_staff", "admin"]}><MaintenanceCompletedComplaints /></ProtectedRoute>} />

            {/* Admin Dashboard */}
            <Route path="/dashboard/admin" element={<ProtectedRoute allowedRoles={["admin"]}><AdminDashboard /></ProtectedRoute>} />
            <Route path="/dashboard/admin/all" element={<ProtectedRoute allowedRoles={["admin"]}><AdminAllComplaints /></ProtectedRoute>} />
            <Route path="/dashboard/admin/pending" element={<ProtectedRoute allowedRoles={["admin"]}><AdminPendingComplaints /></ProtectedRoute>} />
            <Route path="/dashboard/admin/in-progress" element={<ProtectedRoute allowedRoles={["admin"]}><AdminInProgressComplaints /></ProtectedRoute>} />
            <Route path="/dashboard/admin/completed" element={<ProtectedRoute allowedRoles={["admin"]}><AdminCompletedComplaints /></ProtectedRoute>} />
            <Route path="/dashboard/admin/users" element={<ProtectedRoute allowedRoles={["admin"]}><AdminUserManagement /></ProtectedRoute>} />
            <Route path="/dashboard/inventory" element={<ProtectedRoute allowedRoles={["admin", "principal", "hod", "maintenance_staff"]}><Inventory /></ProtectedRoute>} />
            <Route path="/dashboard/calendar" element={<ProtectedRoute allowedRoles={["admin", "principal", "hod", "maintenance_staff", "faculty"]}><CalendarView /></ProtectedRoute>} />

            {/* Catch-all */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>
      </Suspense>
    </ErrorBoundary>
  );
};

export default AppRoutes;
