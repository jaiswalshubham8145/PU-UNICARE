import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Shield, Loader2, User, Mail, Lock, Briefcase } from "lucide-react";
import { Database } from '@/integrations/supabase/types';

type AppRole = Database['public']['Enums']['app_role'];

const Register = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [fullName, setFullName] = useState("");
    const [role, setRole] = useState<AppRole>("faculty");
    const [loading, setLoading] = useState(false);
    const { signUp } = useAuth();
    const navigate = useNavigate();
    const { toast } = useToast();

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            toast({
                variant: "destructive",
                title: "Passwords do not match",
                description: "Please ensure both passwords are identical.",
            });
            return;
        }

        setLoading(true);
        try {
            const { error } = await signUp(email, password, fullName, role);

            if (error) throw error;

            toast({
                title: "Registration successful",
                description: "Please check your email to verify your account.",
            });
            navigate("/login");
        } catch (error) {
            toast({
                variant: "destructive",
                title: "Registration failed",
                description: error instanceof Error ? error.message : "An error occurred during registration.",
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="relative min-h-screen flex items-center justify-center p-4 animate-fade-in">
            <div className="w-full max-w-md p-8 rounded-2xl glass-panel-dark border-white/10 animate-fade-in relative z-10">
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-tr from-amber-400 to-amber-600 mb-6 shadow-[0_0_20px_rgba(245,158,11,0.3)]">
                        <Shield className="w-10 h-10 text-black" />
                    </div>
                    <h1 className="text-3xl font-bold text-white mb-2">Create Account</h1>
                    <p className="text-slate-300">Join the Parul University Unicare Platform</p>
                </div>

                <form onSubmit={handleRegister} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="fullName" className="text-white">Full Name</Label>
                        <div className="relative">
                            <User className="absolute left-3 top-3 h-5 w-5 text-amber-400" />
                            <Input
                                id="fullName"
                                type="text"
                                placeholder="John Doe"
                                className="pl-10 glass-input h-11 rounded-xl"
                                value={fullName}
                                onChange={(e) => setFullName(e.target.value)}
                                required
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="email" className="text-white">Email Address</Label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-3 h-5 w-5 text-amber-400" />
                            <Input
                                id="email"
                                type="email"
                                placeholder="user@paruluniversity.ac.in"
                                className="pl-10 glass-input h-11 rounded-xl"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="role" className="text-white">Role</Label>
                        <div className="relative">
                            <Briefcase className="absolute left-3 top-3 h-5 w-5 text-amber-400 z-10" />
                            <Select value={role} onValueChange={(val: AppRole) => setRole(val)}>
                                <SelectTrigger className="pl-10 glass-input h-11 rounded-xl">
                                    <SelectValue placeholder="Select Role" />
                                </SelectTrigger>
                                <SelectContent className="bg-black/90 border-white/10 text-white backdrop-blur-xl">
                                    <SelectItem value="faculty" className="focus:bg-amber-500 focus:text-black">Faculty</SelectItem>
                                    <SelectItem value="cr" className="focus:bg-amber-500 focus:text-black">Class Representative (CR)</SelectItem>
                                    <SelectItem value="hod" className="focus:bg-amber-500 focus:text-black">HOD</SelectItem>
                                    <SelectItem value="maintenance_staff" className="focus:bg-amber-500 focus:text-black">Maintenance Staff</SelectItem>
                                    <SelectItem value="principal" className="focus:bg-amber-500 focus:text-black">Principal</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="password" className="text-white">Password</Label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-3 h-5 w-5 text-amber-400" />
                            <Input
                                id="password"
                                type="password"
                                placeholder="••••••••"
                                className="pl-10 glass-input h-11 rounded-xl"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="confirmPassword" className="text-white">Confirm Password</Label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-3 h-5 w-5 text-amber-400" />
                            <Input
                                id="confirmPassword"
                                type="password"
                                placeholder="••••••••"
                                className="pl-10 glass-input h-11 rounded-xl"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                required
                            />
                        </div>
                    </div>

                    <Button type="submit" className="w-full h-11 bg-amber-500 hover:bg-amber-600 text-black font-bold shadow-[0_0_20px_rgba(245,158,11,0.4)] transition-all hover:scale-[1.02] rounded-xl" disabled={loading}>
                        {loading ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Creating Account...
                            </>
                        ) : (
                            "Sign Up"
                        )}
                    </Button>
                </form>

                <div className="mt-6 text-center text-sm">
                    <span className="text-slate-500">Already have an account? </span>
                    <Link to="/login" className="font-semibold text-primary hover:text-primary/80 hover:underline">
                        Sign In
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default Register;
