import { useState, useMemo } from "react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Users, Search, UserPlus, Shield, Loader2, Building, Mail,
  ChevronLeft, ChevronRight
} from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useDepartments } from "@/hooks/useComplaints";
import { toast } from "sonner";
import { Database } from "@/integrations/supabase/types";

type AppRole = Database['public']['Enums']['app_role'];
type UserWithRoles = Database['public']['Tables']['profiles']['Row'] & {
  user_roles: Database['public']['Tables']['user_roles']['Row'][];
};

const roleLabels: Record<AppRole, string> = {
  admin: "Administrator",
  principal: "Principal",
  hod: "Head of Department",
  faculty: "Faculty",
  cr: "Class Representative",
  maintenance_staff: "Maintenance Staff",
};

const roleColors: Record<string, string> = {
  admin: "bg-destructive/10 text-destructive",
  principal: "bg-accent/10 text-accent",
  hod: "bg-info/10 text-info",
  faculty: "bg-success/10 text-success",
  cr: "bg-warning/10 text-warning",
  maintenance_staff: "bg-primary/10 text-primary",
};

const ITEMS_PER_PAGE = 10;

const AdminUserManagement = () => {
  const queryClient = useQueryClient();
  const { data: departments } = useDepartments();
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [showAddRole, setShowAddRole] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserWithRoles | null>(null);
  const [newRole, setNewRole] = useState<AppRole | "">("");
  const [newDepartment, setNewDepartment] = useState("");

  // Fetch all users with their profiles and roles
  const { data: usersData, isLoading } = useQuery({
    queryKey: ["admin-users"],
    queryFn: async () => {
      // Get all profiles
      const { data: profiles, error: profilesError } = await supabase
        .from("profiles")
        .select("*")
        .order("full_name");

      if (profilesError) throw profilesError;

      // Get all roles
      const { data: roles, error: rolesError } = await supabase
        .from("user_roles")
        .select("*");

      if (rolesError) throw rolesError;

      // Combine data
      return profiles.map((profile) => ({
        ...profile,
        roles: roles.filter((r) => r.user_id === profile.user_id).map((r) => r.role),
      }));
    },
  });

  // Filter users
  const filteredUsers = useMemo(() => {
    if (!usersData) return [];
    return usersData.filter((user) => {
      const matchesSearch = !search ||
        user.full_name.toLowerCase().includes(search.toLowerCase()) ||
        user.email.toLowerCase().includes(search.toLowerCase());
      const matchesRole = roleFilter === "all" || user.roles.includes(roleFilter as AppRole);
      return matchesSearch && matchesRole;
    });
  }, [usersData, search, roleFilter]);

  // Paginate
  const totalPages = Math.ceil(filteredUsers.length / ITEMS_PER_PAGE);
  const paginatedUsers = filteredUsers.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  // Add role mutation
  const addRole = useMutation({
    mutationFn: async ({ userId, role, departmentId }: { userId: string; role: AppRole; departmentId?: string }) => {
      const { error } = await supabase
        .from("user_roles")
        .insert({
          user_id: userId,
          role,
          department_id: departmentId || null,
        });

      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Role added successfully");
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      setShowAddRole(false);
      setSelectedUser(null);
      setNewRole("");
      setNewDepartment("");
    },
    onError: (error: unknown) => {
      const message = error instanceof Error ? error.message : "Failed to add role";
      toast.error(message);
    },
  });

  // Remove role mutation
  const removeRole = useMutation({
    mutationFn: async ({ userId, role }: { userId: string; role: AppRole }) => {
      const { error } = await supabase
        .from("user_roles")
        .delete()
        .eq("user_id", userId)
        .eq("role", role);

      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Role removed successfully");
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
    },
    onError: (error: unknown) => {
      const message = error instanceof Error ? error.message : "Failed to remove role";
      toast.error(message);
    },
  });

  const getDepartmentName = (deptId: string) => {
    const dept = departments?.find((d: Database['public']['Tables']['departments']['Row']) => d.id === deptId);
    return dept?.name || "Not assigned";
  };

  return (
    <div className="relative z-10 min-h-screen transparency-medium noise-texture">
      <Navbar />
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4">
          <div className="mb-8">
            <h1 className="text-2xl md:text-3xl font-bold text-foreground">User Management</h1>
            <p className="text-muted-foreground">Manage users and their roles</p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <div className="card-elevated p-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center">
                  <Users className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{usersData?.length || 0}</p>
                  <p className="text-sm text-muted-foreground">Total Users</p>
                </div>
              </div>
            </div>
            {["admin", "hod", "faculty"].map((role) => (
              <div key={role} className="card-elevated p-6">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-lg ${roleColors[role]?.split(" ")[0] || "bg-secondary"} flex items-center justify-center`}>
                    <Shield className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-foreground">
                      {usersData?.filter((u) => u.roles.includes(role as AppRole)).length || 0}
                    </p>
                    <p className="text-sm text-muted-foreground">{roleLabels[role]}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Users Table */}
          <div className="card-elevated">
            <div className="p-6 border-b border-border">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by name or email..."
                    value={search}
                    onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
                    className="pl-10"
                  />
                </div>
                <Select value={roleFilter} onValueChange={(v) => { setRoleFilter(v); setCurrentPage(1); }}>
                  <SelectTrigger className="w-full sm:w-48">
                    <SelectValue placeholder="Filter by role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Roles</SelectItem>
                    {Object.entries(roleLabels).map(([value, label]) => (
                      <SelectItem key={value} value={value}>{label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="overflow-x-auto">
              {isLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin text-accent" />
                </div>
              ) : paginatedUsers.length === 0 ? (
                <div className="text-center py-12">
                  <Users className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
                  <p className="text-muted-foreground">No users found</p>
                </div>
              ) : (
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border bg-secondary/30">
                      <th className="text-left py-3 px-6 font-medium text-muted-foreground">User</th>
                      <th className="text-left py-3 px-6 font-medium text-muted-foreground">Department</th>
                      <th className="text-left py-3 px-6 font-medium text-muted-foreground">Roles</th>
                      <th className="text-right py-3 px-6 font-medium text-muted-foreground">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedUsers.map((user) => (
                      <tr key={user.id} className="border-b border-border/50 hover:bg-secondary/30">
                        <td className="py-4 px-6">
                          <div>
                            <p className="font-medium text-foreground">{user.full_name}</p>
                            <p className="text-xs text-muted-foreground flex items-center gap-1">
                              <Mail className="w-3 h-3" />
                              {user.email}
                            </p>
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <span className="flex items-center gap-1 text-muted-foreground">
                            <Building className="w-3 h-3" />
                            {getDepartmentName(user.department_id)}
                          </span>
                        </td>
                        <td className="py-4 px-6">
                          <div className="flex flex-wrap gap-1">
                            {user.roles.length > 0 ? (
                              user.roles.map((role: AppRole) => (
                                <Badge
                                  key={role}
                                  className={`${roleColors[role] || "bg-secondary"} cursor-pointer`}
                                  onClick={() => {
                                    if (window.confirm(`Remove ${roleLabels[role]} role from ${user.full_name}?`)) {
                                      removeRole.mutate({ userId: user.user_id, role: role as AppRole });
                                    }
                                  }}
                                >
                                  {roleLabels[role] || role}
                                </Badge>
                              ))
                            ) : (
                              <span className="text-muted-foreground text-xs">No roles</span>
                            )}
                          </div>
                        </td>
                        <td className="py-4 px-6 text-right">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => { setSelectedUser(user); setShowAddRole(true); }}
                          >
                            <UserPlus className="w-4 h-4 mr-1" />
                            Add Role
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between px-6 py-4 border-t border-border">
                <p className="text-sm text-muted-foreground">
                  Showing {(currentPage - 1) * ITEMS_PER_PAGE + 1} to {Math.min(currentPage * ITEMS_PER_PAGE, filteredUsers.length)} of {filteredUsers.length}
                </p>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage((p) => p - 1)}
                    disabled={currentPage === 1}
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                  <span className="text-sm text-muted-foreground">
                    Page {currentPage} of {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage((p) => p + 1)}
                    disabled={currentPage === totalPages}
                  >
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />

      {/* Add Role Dialog */}
      <Dialog open={showAddRole} onOpenChange={setShowAddRole}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add Role to {selectedUser?.full_name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label>Role</Label>
              <Select value={newRole} onValueChange={(v) => setNewRole(v as AppRole)}>
                <SelectTrigger className="mt-2">
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  {(Object.keys(roleLabels) as AppRole[]).map((value) => (
                    <SelectItem
                      key={value}
                      value={value}
                      disabled={selectedUser?.roles.includes(value)}
                    >
                      {roleLabels[value]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {(newRole === "hod" || newRole === "maintenance_staff") && (
              <div>
                <Label>Department (Optional for role)</Label>
                <Select value={newDepartment} onValueChange={setNewDepartment}>
                  <SelectTrigger className="mt-2">
                    <SelectValue placeholder="Select department" />
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
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddRole(false)}>Cancel</Button>
            <Button
              variant="accent"
              onClick={() => {
                if (newRole && selectedUser) {
                  addRole.mutate({
                    userId: selectedUser.user_id,
                    role: newRole,
                    departmentId: newDepartment || undefined,
                  });
                }
              }}
              disabled={!newRole || addRole.isPending}
            >
              {addRole.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Adding...
                </>
              ) : (
                "Add Role"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminUserManagement;