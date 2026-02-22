
import { Suspense, lazy } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { Loader2 } from "lucide-react";
import ProtectedRoute from "@/components/ProtectedRoute";

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
const KnowledgeBase = lazy(() => import("./pages/KnowledgeBase"));
const StaffDirectory = lazy(() => import("./pages/StaffDirectory"));
const HelpCenter = lazy(() => import("./pages/HelpCenter"));

// Protected Pages
const Profile = lazy(() => import("./pages/Profile"));
const Settings = lazy(() => import("./pages/Settings"));
const Notifications = lazy(() => import("./pages/Notifications"));

// Dashboard Pages
const FacultyDashboard = lazy(() => import("./pages/dashboard/FacultyDashboard"));
const HODDashboard = lazy(() => import("./pages/dashboard/HODDashboard"));
const AdminDashboard = lazy(() => import("./pages/dashboard/AdminDashboard"));
const MaintenanceStaffDashboard = lazy(() => import("./pages/dashboard/MaintenanceStaffDashboard"));
const PrincipalDashboard = lazy(() => import("./pages/dashboard/PrincipalDashboard"));
const CRDashboard = lazy(() => import("./pages/dashboard/CRDashboard"));
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

const LoadingFallback = () => (
    <div className="flex h-screen w-full items-center justify-center bg-background">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
    </div>
);

const AppRoutes = () => {
    return (
        <Suspense fallback={<LoadingFallback />}>
            <Routes>
                {/* Public Routes */}
                <Route path="/" element={<Index />} />
                <Route path="/help" element={<KnowledgeBase />} />
                <Route path="/about" element={<About />} />
                <Route path="/maintenance" element={<Maintenance />} />
                <Route path="/register-complaint" element={<RegisterComplaint />} />
                <Route path="/complaint-wizard" element={<ComplaintWizard />} />
                <Route path="/track" element={<TrackComplaint />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/reset-password" element={<ResetPassword />} />
                <Route path="/staff-directory" element={<StaffDirectory />} />
                <Route path="/help-center" element={<HelpCenter />} />

                {/* Protected Routes - Profile & Settings */}
                <Route
                    path="/profile"
                    element={
                        <ProtectedRoute>
                            <Profile />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/notifications"
                    element={
                        <ProtectedRoute>
                            <Notifications />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/settings"
                    element={
                        <ProtectedRoute>
                            <Settings />
                        </ProtectedRoute>
                    }
                />

                {/* Dashboard Routes */}
                <Route
                    path="/dashboard/faculty"
                    element={
                        <ProtectedRoute allowedRoles={["faculty"]}>
                            <FacultyDashboard />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/dashboard/cr"
                    element={
                        <ProtectedRoute allowedRoles={["cr", "admin"]}>
                            <CRDashboard />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/dashboard/hod"
                    element={
                        <ProtectedRoute allowedRoles={["hod", "admin", "principal"]}>
                            <HODDashboard />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/dashboard/hod/pending"
                    element={
                        <ProtectedRoute allowedRoles={["hod", "admin", "principal"]}>
                            <HODPendingComplaints />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/dashboard/hod/in-progress"
                    element={
                        <ProtectedRoute allowedRoles={["hod", "admin", "principal"]}>
                            <HODInProgressComplaints />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/dashboard/hod/completed"
                    element={
                        <ProtectedRoute allowedRoles={["hod", "admin", "principal"]}>
                            <HODCompletedComplaints />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/dashboard/hod/all"
                    element={
                        <ProtectedRoute allowedRoles={["hod", "admin", "principal"]}>
                            <HODAllComplaints />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/dashboard/principal"
                    element={
                        <ProtectedRoute allowedRoles={["principal", "admin"]}>
                            <PrincipalDashboard />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/dashboard/principal/all"
                    element={
                        <ProtectedRoute allowedRoles={["principal", "admin"]}>
                            <PrincipalAllComplaints />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/dashboard/principal/delayed"
                    element={
                        <ProtectedRoute allowedRoles={["principal", "admin"]}>
                            <PrincipalDelayedComplaints />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/dashboard/principal/in-progress"
                    element={
                        <ProtectedRoute allowedRoles={["principal", "admin"]}>
                            <PrincipalInProgressComplaints />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/dashboard/principal/resolved"
                    element={
                        <ProtectedRoute allowedRoles={["principal", "admin"]}>
                            <PrincipalResolvedComplaints />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/dashboard/maintenance"
                    element={
                        <ProtectedRoute allowedRoles={["maintenance_staff", "admin"]}>
                            <MaintenanceStaffDashboard />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/dashboard/maintenance/new-assigned"
                    element={
                        <ProtectedRoute allowedRoles={["maintenance_staff", "admin"]}>
                            <MaintenanceNewAssignedComplaints />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/dashboard/maintenance/in-progress"
                    element={
                        <ProtectedRoute allowedRoles={["maintenance_staff", "admin"]}>
                            <MaintenanceInProgressComplaints />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/dashboard/maintenance/on-hold"
                    element={
                        <ProtectedRoute allowedRoles={["maintenance_staff", "admin"]}>
                            <MaintenanceOnHoldComplaints />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/dashboard/maintenance/completed"
                    element={
                        <ProtectedRoute allowedRoles={["maintenance_staff", "admin"]}>
                            <MaintenanceCompletedComplaints />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/dashboard/admin"
                    element={
                        <ProtectedRoute allowedRoles={["admin"]}>
                            <AdminDashboard />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/dashboard/admin/all"
                    element={
                        <ProtectedRoute allowedRoles={["admin"]}>
                            <AdminAllComplaints />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/dashboard/admin/pending"
                    element={
                        <ProtectedRoute allowedRoles={["admin"]}>
                            <AdminPendingComplaints />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/dashboard/admin/in-progress"
                    element={
                        <ProtectedRoute allowedRoles={["admin"]}>
                            <AdminInProgressComplaints />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/dashboard/admin/completed"
                    element={
                        <ProtectedRoute allowedRoles={["admin"]}>
                            <AdminCompletedComplaints />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/dashboard/admin/users"
                    element={
                        <ProtectedRoute allowedRoles={["admin"]}>
                            <AdminUserManagement />
                        </ProtectedRoute>
                    }
                />

                {/* Catch-all Route */}
                <Route path="*" element={<NotFound />} />
            </Routes>
        </Suspense>
    );
};

export default AppRoutes;
