import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, Users, Wrench, GraduationCap, UserCheck, Crown } from "lucide-react";
import { getPrimaryDashboard } from "@/utils/authUtils";
import type { Database } from "@/integrations/supabase/types";

type AppRole = Database['public']['Enums']['app_role'];

interface RoleSelectionProps {
  roles: AppRole[];
  onRoleSelect: (role: AppRole) => void;
}

const roleConfig = {
  admin: {
    title: "Administrator",
    description: "Manage users, system settings, and oversee all operations",
    icon: Shield,
    color: "bg-red-500",
  },
  principal: {
    title: "Principal",
    description: "Oversee academic affairs and institutional management",
    icon: Crown,
    color: "bg-purple-500",
  },
  hod: {
    title: "Head of Department",
    description: "Manage department operations and faculty coordination",
    icon: Users,
    color: "bg-blue-500",
  },
  faculty: {
    title: "Faculty Member",
    description: "Access teaching resources and student management",
    icon: GraduationCap,
    color: "bg-green-500",
  },
  cr: {
    title: "Class Representative",
    description: "Represent student interests and manage class activities",
    icon: UserCheck,
    color: "bg-orange-500",
  },
  maintenance_staff: {
    title: "Maintenance Staff",
    description: "Handle maintenance requests and facility management",
    icon: Wrench,
    color: "bg-gray-500",
  },
};

export const RoleSelection = ({ roles, onRoleSelect }: RoleSelectionProps) => {
  const navigate = useNavigate();
  const [selectedRole, setSelectedRole] = useState<AppRole | null>(null);

  const handleContinue = () => {
    if (selectedRole) {
      onRoleSelect(selectedRole);
      // Navigate based on selected role
      const dashboardRoutes = {
        admin: "/dashboard/admin",
        principal: "/dashboard/principal",
        hod: "/dashboard/hod",
        faculty: "/dashboard/faculty",
        cr: "/dashboard/cr",
        maintenance_staff: "/dashboard/maintenance",
      };
      navigate(dashboardRoutes[selectedRole]);
    }
  };

  const handleSkip = () => {
    // Use primary dashboard logic
    navigate(getPrimaryDashboard(roles));
  };

  return (
    <div className="min-h-screen bg-gradient-surface flex items-center justify-center p-4">
      <Card className="w-full max-w-4xl">
        <CardHeader className="text-center">
          <div className="w-16 h-16 rounded-2xl bg-gradient-accent mx-auto flex items-center justify-center mb-4 shadow-lg">
            <Shield className="w-8 h-8 text-accent-foreground" />
          </div>
          <CardTitle className="text-2xl">Select Your Role</CardTitle>
          <CardDescription>
            You have multiple roles assigned. Please select which role you'd like to use for this session.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            {roles.map((role) => {
              const config = roleConfig[role];
              const Icon = config.icon;
              return (
                <Card
                  key={role}
                  className={`cursor-pointer transition-all hover:shadow-lg ${
                    selectedRole === role ? "ring-2 ring-accent border-accent" : ""
                  }`}
                  onClick={() => setSelectedRole(role)}
                >
                  <CardContent className="p-4 text-center">
                    <div className={`w-12 h-12 rounded-lg ${config.color} mx-auto flex items-center justify-center mb-3`}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="font-semibold mb-2">{config.title}</h3>
                    <p className="text-sm text-muted-foreground">{config.description}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
          <div className="flex gap-4 justify-center">
            <Button onClick={handleContinue} disabled={!selectedRole}>
              Continue as {selectedRole ? roleConfig[selectedRole].title : "Selected Role"}
            </Button>
            <Button variant="outline" onClick={handleSkip}>
              Use Default Role
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};