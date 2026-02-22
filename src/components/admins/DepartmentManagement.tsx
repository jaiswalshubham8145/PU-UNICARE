import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Building2, Plus, Edit, Trash2, Loader2 } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useDepartments } from "@/hooks/useComplaints";
import { toast } from "sonner";
import type { Database } from "@/integrations/supabase/types";

const DepartmentManagement = () => {
  const queryClient = useQueryClient();
  const { data: departments, isLoading } = useDepartments();
  const [showAdd, setShowAdd] = useState(false);
  const [editDept, setEditDept] = useState<Database['public']['Tables']['departments']['Row'] | null>(null);
  const [name, setName] = useState("");
  const [code, setCode] = useState("");

  const addDepartment = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from("departments")
        .insert({ name, code: code.toUpperCase() });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Department added");
      queryClient.invalidateQueries({ queryKey: ["departments"] });
      resetForm();
    },
    onError: (e: unknown) => {
      const message = e instanceof Error ? e.message : "Failed to add department";
      toast.error(message);
    },
  });

  const updateDepartment = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from("departments")
        .update({ name, code: code.toUpperCase() })
        .eq("id", editDept.id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Department updated");
      queryClient.invalidateQueries({ queryKey: ["departments"] });
      resetForm();
    },
    onError: (e: unknown) => {
      const message = e instanceof Error ? e.message : "Failed to update department";
      toast.error(message);
    },
  });

  const deleteDepartment = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("departments")
        .delete()
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Department deleted");
      queryClient.invalidateQueries({ queryKey: ["departments"] });
    },
    onError: (e: unknown) => {
      const message = e instanceof Error ? e.message : "Failed to delete department";
      toast.error(message);
    },
  });

  const resetForm = () => {
    setShowAdd(false);
    setEditDept(null);
    setName("");
    setCode("");
  };

  const handleEdit = (dept: Database['public']['Tables']['departments']['Row']) => {
    setEditDept(dept);
    setName(dept.name);
    setCode(dept.code);
  };

  return (
    <div className="card-elevated p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
          <Building2 className="w-5 h-5 text-accent" />
          Department Management
        </h2>
        <Button variant="accent" size="sm" onClick={() => setShowAdd(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Add Department
        </Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin text-accent" />
        </div>
      ) : (
        <div className="space-y-3">
          {departments?.map((dept: Database['public']['Tables']['departments']['Row']) => (
            <div key={dept.id} className="flex items-center justify-between p-4 rounded-lg border border-border">
              <div>
                <p className="font-medium text-foreground">{dept.name}</p>
                <p className="text-sm text-muted-foreground">Code: {dept.code}</p>
              </div>
              <div className="flex gap-2">
                <Button variant="ghost" size="sm" onClick={() => handleEdit(dept)}>
                  <Edit className="w-4 h-4" />
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="text-destructive"
                  onClick={() => {
                    if (confirm(`Delete ${dept.name}?`)) {
                      deleteDepartment.mutate(dept.id);
                    }
                  }}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add/Edit Dialog */}
      <Dialog open={showAdd || !!editDept} onOpenChange={resetForm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editDept ? "Edit Department" : "Add Department"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label>Department Name</Label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., Computer Science"
                className="mt-2"
              />
            </div>
            <div>
              <Label>Department Code</Label>
              <Input
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="e.g., CS"
                className="mt-2"
                maxLength={10}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={resetForm}>Cancel</Button>
            <Button
              variant="accent"
              onClick={() => editDept ? updateDepartment.mutate() : addDepartment.mutate()}
              disabled={!name || !code || addDepartment.isPending || updateDepartment.isPending}
            >
              {(addDepartment.isPending || updateDepartment.isPending) ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                editDept ? "Update" : "Add"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DepartmentManagement;
