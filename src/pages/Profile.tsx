import { useState, useEffect } from "react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { User, Mail, Phone, Building, IdCard, Save, Loader2, Bell, Moon, Shield } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useDepartments } from "@/hooks/useComplaints";
import { toast } from "sonner";
import type { Database } from "@/integrations/supabase/types";

const Profile = () => {
  const { user, roles } = useAuth();
  const queryClient = useQueryClient();
  const { data: departments } = useDepartments();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [employeeId, setEmployeeId] = useState("");
  const [departmentId, setDepartmentId] = useState("");

  // Settings State
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [twoFactor, setTwoFactor] = useState(false);

  // Initialize dark mode from system/document
  useEffect(() => {
    const isDark = document.documentElement.classList.contains("dark");
    setDarkMode(isDark);
  }, []);

  // Fetch profile
  const { data: profile, isLoading } = useQuery({
    queryKey: ["profile", user?.id],
    queryFn: async () => {
      if (!user) return null;
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", user.id)
        .single();

      if (error && error.code !== "PGRST116") throw error;
      return data;
    },
    enabled: !!user,
  });

  // Set form values when profile loads
  useEffect(() => {
    if (profile) {
      setFullName(profile.full_name || "");
      setEmail(profile.email || user?.email || "");
      setPhone(profile.phone || "");
      setEmployeeId(profile.employee_id || "");
      setDepartmentId(profile.department_id || "");
    } else if (user) {
      setEmail(user.email || "");
    }
  }, [profile, user]);

  // Update profile mutation
  const updateProfile = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error("Not authenticated");

      const profileData = {
        user_id: user.id,
        full_name: fullName,
        email: email,
        phone: phone || null,
        employee_id: employeeId || null,
        department_id: departmentId || null,
      };

      if (profile) {
        const { error } = await supabase
          .from("profiles")
          .update(profileData)
          .eq("user_id", user.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("profiles")
          .insert(profileData);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      toast.success("Profile updated successfully");
      queryClient.invalidateQueries({ queryKey: ["profile"] });
    },
    onError: (error: unknown) => {
      const message = error instanceof Error ? error.message : "Failed to update profile";
      toast.error(message);
    },
  });

  const toggleDarkMode = (checked: boolean) => {
    setDarkMode(checked);
    if (checked) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  };

  const handleSettingChange = (setting: string, value: boolean) => {
    toast.success(`${setting} ${value ? "enabled" : "disabled"}`);
    // Here strictly purely visual for now, would connect to backend for real persistence
  };

  const roleLabels: Record<string, string> = {
    admin: "Administrator",
    principal: "Principal",
    hod: "Head of Department",
    faculty: "Faculty",
    maintenance_staff: "Maintenance Staff",
  };

  return (
    <div className="min-h-screen noise-texture">
      <Navbar />
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto transparency-medium rounded-lg p-6">
            <div className="mb-8">
              <h1 className="text-2xl md:text-3xl font-bold text-foreground">My Profile</h1>
              <p className="text-muted-foreground">Manage your account information and preferences</p>
            </div>

            {isLoading ? (
              <div className="space-y-6">
                <div className="glass-panel p-6 rounded-2xl border border-white/10 space-y-4">
                  <Skeleton className="h-6 w-32" />
                  <Skeleton className="h-4 w-48" />
                  <div className="flex gap-2">
                    <Skeleton className="h-8 w-24 rounded-full" />
                    <Skeleton className="h-8 w-24 rounded-full" />
                  </div>
                </div>
                <div className="glass-panel p-6 rounded-2xl border border-white/10 space-y-4">
                  <Skeleton className="h-6 w-44" />
                  <Skeleton className="h-10 w-full rounded-xl" />
                  <Skeleton className="h-10 w-full rounded-xl" />
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Roles Card */}
                <Card className="animate-fade-in-up" style={{ animationDelay: "0.1s" }}>
                  <CardHeader>
                    <CardTitle className="text-lg">Your Roles</CardTitle>
                    <CardDescription>Assigned roles in the UNICARE system</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {roles.length > 0 ? (
                        roles.map((role) => (
                          <Badge key={role} variant="outline" className="text-sm py-1 px-3">
                            {roleLabels[role] || role}
                          </Badge>
                        ))
                      ) : (
                        <p className="text-muted-foreground text-sm">No roles assigned. Contact admin for access.</p>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Profile Form */}
                <Card className="animate-fade-in-up" style={{ animationDelay: "0.2s" }}>
                  <CardHeader>
                    <CardTitle className="text-lg">Personal Information</CardTitle>
                    <CardDescription>Update your personal details</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                        updateProfile.mutate();
                      }}
                      className="space-y-5"
                    >
                      <div>
                        <Label className="flex items-center gap-2 mb-2">
                          <User className="w-4 h-4 text-accent" />
                          Full Name
                        </Label>
                        <Input
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                          placeholder="Enter your full name"
                          required
                          className="hover-luxury transition-all"
                        />
                      </div>

                      <div>
                        <Label className="flex items-center gap-2 mb-2">
                          <Mail className="w-4 h-4 text-accent" />
                          Email Address
                        </Label>
                        <Input
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="Enter your email"
                          required
                          disabled
                          className="bg-muted/50"
                        />
                        <p className="text-xs text-muted-foreground mt-1">Email cannot be changed</p>
                      </div>

                      <div>
                        <Label className="flex items-center gap-2 mb-2">
                          <Phone className="w-4 h-4 text-accent" />
                          Phone Number
                        </Label>
                        <Input
                          type="tel"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          placeholder="Enter your phone number"
                          className="hover-luxury transition-all"
                        />
                      </div>

                      <div>
                        <Label className="flex items-center gap-2 mb-2">
                          <IdCard className="w-4 h-4 text-accent" />
                          Employee ID
                        </Label>
                        <Input
                          value={employeeId}
                          onChange={(e) => setEmployeeId(e.target.value)}
                          placeholder="Enter your employee ID"
                          className="hover-luxury transition-all"
                        />
                      </div>

                      <div>
                        <Label className="flex items-center gap-2 mb-2">
                          <Building className="w-4 h-4 text-accent" />
                          Department
                        </Label>
                        <Select value={departmentId} onValueChange={setDepartmentId}>
                          <SelectTrigger className="hover-luxury transition-all">
                            <SelectValue placeholder="Select your department" />
                          </SelectTrigger>
                          <SelectContent>
                            {departments?.map((dept: Database['public']['Tables']['departments']['Row']) => (
                              <SelectItem key={dept.id} value={dept.id}>
                                {dept.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <Button
                        type="submit"
                        variant="accent"
                        className="w-full hover-luxury transition-all"
                        disabled={updateProfile.isPending}
                      >
                        {updateProfile.isPending ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Saving...
                          </>
                        ) : (
                          <>
                            <Save className="w-4 h-4 mr-2" />
                            Save Changes
                          </>
                        )}
                      </Button>
                    </form>
                  </CardContent>
                </Card>

                {/* Notifications Settings */}
                <Card className="card-enter" style={{ animationDelay: "0.1s" }}>
                  <CardHeader>
                    <div className="flex items-center gap-2">
                      <Bell className="w-5 h-5 text-accent" />
                      <CardTitle className="text-lg">Notifications</CardTitle>
                    </div>
                    <CardDescription>Configure how you receive updates</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label className="text-base">Email Notifications</Label>
                        <div className="text-sm text-muted-foreground">
                          Receive email updates when complaint status changes
                        </div>
                      </div>
                      <Switch
                        checked={emailNotifications}
                        onCheckedChange={(checked) => {
                          setEmailNotifications(checked);
                          handleSettingChange("Email notifications", checked);
                        }}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label className="text-base">Push Notifications</Label>
                        <div className="text-sm text-muted-foreground">
                          Get push notifications in your browser
                        </div>
                      </div>
                      <Switch
                        checked={pushNotifications}
                        onCheckedChange={(checked) => {
                          setPushNotifications(checked);
                          handleSettingChange("Push notifications", checked);
                        }}
                      />
                    </div>
                  </CardContent>
                </Card>

                {/* Appearance Settings */}
                <Card className="card-enter" style={{ animationDelay: "0.2s" }}>
                  <CardHeader>
                    <div className="flex items-center gap-2">
                      <Moon className="w-5 h-5 text-accent" />
                      <CardTitle className="text-lg">Appearance</CardTitle>
                    </div>
                    <CardDescription>Customize the look of the application</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label className="text-base">Dark Mode</Label>
                        <div className="text-sm text-muted-foreground">
                          Use dark theme for the application
                        </div>
                      </div>
                      <Switch
                        checked={darkMode}
                        onCheckedChange={toggleDarkMode}
                      />
                    </div>
                  </CardContent>
                </Card>

                {/* Security Settings */}
                <Card className="card-enter" style={{ animationDelay: "0.3s" }}>
                  <CardHeader>
                    <div className="flex items-center gap-2">
                      <Shield className="w-5 h-5 text-accent" />
                      <CardTitle className="text-lg">Security</CardTitle>
                    </div>
                    <CardDescription>Manage your security settings</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label className="text-base">Two-Factor Authentication</Label>
                        <div className="text-sm text-muted-foreground">
                          Add an extra layer of security to your account
                        </div>
                      </div>
                      <Switch
                        checked={twoFactor}
                        onCheckedChange={(checked) => {
                          setTwoFactor(checked);
                          handleSettingChange("2FA", checked);
                        }}
                      />
                    </div>
                    <div className="pt-4 border-t border-border">
                      <div className="space-y-1">
                        <Label className="text-sm font-medium">Account Email</Label>
                        <div className="text-sm text-muted-foreground">{email}</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Profile;