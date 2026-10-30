import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Link, useNavigate } from "react-router-dom";
import { Shield, Mail, Lock, Eye, EyeOff, User } from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { getPrimaryDashboard } from "@/utils/authUtils";
import { useI18n } from "@/hooks/useI18n";
import { z } from "zod";
import { RoleSelection } from "@/components/RoleSelection";
import type { Database } from "@/integrations/supabase/types";
import { supabase } from "@/integrations/supabase/client";
import { isUniversityEmail, getUniversityEmailError } from "@/lib/emailValidation";

type AppRole = Database['public']['Enums']['app_role'];

const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

const signupSchema = loginSchema.extend({
  fullName: z.string().min(2, "Name must be at least 2 characters"),
  confirmPassword: z.string(),
  role: z.enum(['admin', 'principal', 'hod', 'faculty', 'cr', 'maintenance_staff'], {
    errorMap: () => ({ message: "Please select a role" }),
  }),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

const Login = () => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showRoleSelection, setShowRoleSelection] = useState(false);
  const [role, setRole] = useState<AppRole | "">("");
  const [showResend, setShowResend] = useState(false);

  const { signIn, signUp, user, roles, loading, setActiveRole } = useAuth();
  const { t } = useI18n();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && user) {
      if (roles.length > 1) {
        setShowRoleSelection(true);
      } else if (roles.length === 1) {
        navigate(getPrimaryDashboard(roles));
      }
    }
  }, [user, roles, loading, navigate]);

  const handleRoleSelect = (role: AppRole) => {
    setActiveRole(role);
    const dashboardRoutes = {
      admin: "/dashboard/admin",
      principal: "/dashboard/principal",
      hod: "/dashboard/hod",
      faculty: "/dashboard/faculty",
      cr: "/dashboard/cr",
      maintenance_staff: "/dashboard/maintenance",
    };
    navigate(dashboardRoutes[role]);
  };

  const handleResendVerification = async () => {
    if (!email) {
      toast.error("Please enter your email instructions to resend verification.");
      return;
    }

    setIsLoading(true);
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: email,
        options: {
          emailRedirectTo: `${window.location.origin}/`
        }
      });

      if (error) {
        toast.error(error.message);
      } else {
        toast.success("Verification email resent! Please check your inbox.");
        setShowResend(false);
      }
    } catch (err) {
      toast.error("Failed to resend verification email.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setShowResend(false);

    try {
      // Validate university email domain
      if (!isUniversityEmail(email)) {
        toast.error(getUniversityEmailError());
        setIsLoading(false);
        return;
      }

      if (isSignUp) {
        const validation = signupSchema.safeParse({ email, password, confirmPassword, fullName, role });
        if (!validation.success) {
          toast.error(validation.error.errors[0].message);
          setIsLoading(false);
          return;
        }

        const { error } = await signUp(email, password, fullName, role as AppRole);
        if (error) {
          if (error.message.includes("already registered")) {
            toast.error("This email is already registered. Please sign in instead.");
          } else {
            toast.error(error.message);
          }
        } else {
          toast.success("Account created! Please check your email to verify your account.", {
            description: "You can sign in after email verification.",
          });
          setIsSignUp(false);
          setPassword("");
          setConfirmPassword("");
          setRole("");
        }
      } else {
        const validation = loginSchema.safeParse({ email, password });
        if (!validation.success) {
          toast.error(validation.error.errors[0].message);
          setIsLoading(false);
          return;
        }

        const { error } = await signIn(email, password);
        if (error) {
          if (error.message.includes("Invalid login credentials")) {
            toast.error("Invalid email or password");
          } else if (error.message.includes("Email not confirmed")) {
            toast.error("Email not confirmed. Please check your inbox.");
            setShowResend(true);
          } else {
            toast.error(error.message);
          }
        } else {
          toast.success("Welcome back!");
        }
      }
    } catch (err) {
      toast.error("An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen noise-texture">
      <Navbar />
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4">
          <div className="max-w-md mx-auto">
            <div className="glass-panel-dark p-8 rounded-3xl animate-fade-in border-emerald-400/35 shadow-[0_15px_50px_rgba(0,0,0,0.7),0_0_45px_rgba(52,211,153,0.3)]">
              {/* Header */}
              <div className="text-center mb-10">
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[#2ECC71] via-[#164340] to-[#1F3F73] mx-auto flex items-center justify-center mb-6 shadow-[0_0_45px_rgba(52,211,153,0.55)] border border-emerald-400/50">
                  <Shield className="w-10 h-10 text-[#EDE3CC]" />
                </div>
                <h1 className="text-3xl font-bold text-white mb-2 tracking-tight">
                  {isSignUp ? t('auth.signup') : t('dashboard.welcome')}
                </h1>
                <p className="text-[#A9B5AC] text-sm tracking-wide">
                  {isSignUp ? "Register for a UNICARE account" : "Sign in to your premium portal"}
                </p>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-6">
                {isSignUp && (
                  <div>
                    <Label className="flex items-center gap-2 mb-2 text-white">
                      <User className="w-4 h-4 text-[#C2A05A]" />
                      Full Name
                    </Label>
                    <Input
                      type="text"
                      placeholder="Enter your full name"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      required
                      className="glass-input h-12 rounded-xl"
                    />
                  </div>
                )}

                <div>
                  <Label className="flex items-center gap-2 mb-2 text-white">
                    <Mail className="w-4 h-4 text-[#C2A05A]" />
                    University Email
                  </Label>
                  <Input
                    type="email"
                    placeholder="your.email@paruluniversity.ac.in"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="glass-input h-12 rounded-xl"
                  />
                </div>

                <div>
                  <Label className="flex items-center gap-2 mb-2 text-white">
                    <Lock className="w-4 h-4 text-[#C2A05A]" />
                    Password
                  </Label>
                  <div className="relative">
                    <Input
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="glass-input h-12 rounded-xl pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {isSignUp && (
                  <div>
                    <Label className="flex items-center gap-2 mb-2 text-white">
                      <Lock className="w-4 h-4 text-[#C2A05A]" />
                      Confirm Password
                    </Label>
                    <Input
                      type="password"
                      placeholder="Confirm your password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                      className="glass-input h-12 rounded-xl"
                    />
                  </div>
                )}

                {isSignUp && (
                  <div>
                    <Label className="flex items-center gap-2 mb-2 text-white">
                      <User className="w-4 h-4 text-[#C2A05A]" />
                      Role
                    </Label>
                    <select
                      value={role}
                      onChange={(e) => setRole(e.target.value as AppRole)}
                      className="w-full h-12 px-3 border border-white/20 rounded-xl bg-black/40 text-white focus:outline-none focus:ring-2 focus:ring-amber-400/50 backdrop-blur-md"
                      required
                    >
                      <option value="" className="bg-slate-900 text-slate-300">Select your role</option>
                      <option value="faculty" className="bg-slate-900">Faculty</option>
                      <option value="maintenance_staff" className="bg-slate-900">Maintenance Staff</option>
                      <option value="hod" className="bg-slate-900">Head of Department</option>
                      <option value="principal" className="bg-slate-900">Principal</option>
                      <option value="admin" className="bg-slate-900">Admin</option>
                    </select>
                  </div>
                )}

                {!isSignUp && (
                  <div className="flex items-center justify-between text-sm">
                    <label className="flex items-center gap-2 cursor-pointer group">
                      <input type="checkbox" className="rounded border-white/30 bg-transparent checked:bg-amber-400" />
                      <span className="text-slate-300 group-hover:text-white transition-colors">Remember me</span>
                    </label>
                    <Link to="/forgot-password" className="text-amber-400 hover:text-amber-300 hover:underline">Forgot password?</Link>
                  </div>
                )}

                <div className="space-y-3">
                  <Button
                    type="submit"
                    className="w-full h-12 text-lg font-bold bg-gradient-to-r from-[#C2A05A] via-[#E0C88B] to-[#C2A05A] hover:from-[#d2ba7a] hover:via-[#f5e6b8] hover:to-[#d2ba7a] text-[#060F10] shadow-[0_0_40px_rgba(224,200,139,0.55)] transition-all hover:scale-[1.02] hover:shadow-[0_0_65px_rgba(224,200,139,0.85)] rounded-xl"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <span className="flex items-center justify-center gap-2">
                        <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                        Please wait...
                      </span>
                    ) : (isSignUp ? "Create Account" : "Sign In")}
                  </Button>

                  {showResend && !isSignUp && (
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full h-12 text-white border-amber-500/50 hover:bg-amber-500/10 hover:text-amber-400"
                      onClick={handleResendVerification}
                      disabled={isLoading}
                    >
                      Resend Verification Email
                    </Button>
                  )}
                </div>
              </form>

              {/* Footer */}
              <p className="text-center text-sm text-slate-400 mt-8">
                {isSignUp ? (
                  <>
                    Already have an account?{" "}
                    <button
                      onClick={() => setIsSignUp(false)}
                      className="text-amber-400 hover:text-amber-300 hover:underline font-bold"
                    >
                      Sign In
                    </button>
                  </>
                ) : (
                  <>
                    Don't have an account?{" "}
                    <button
                      onClick={() => setIsSignUp(true)}
                      className="text-amber-400 hover:text-amber-300 hover:underline font-bold"
                    >
                      Sign Up
                    </button>
                  </>
                )}
              </p>
            </div>
          </div>
        </div>
      </main>
      {showRoleSelection && (
        <RoleSelection roles={roles} onRoleSelect={handleRoleSelect} />
      )}
      <Footer />
    </div>
  );
};

export default Login;
