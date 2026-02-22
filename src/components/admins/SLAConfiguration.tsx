import { useState } from "react";

interface SLARule {
  id: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  category_id: string | null;
  department_id: string | null;
  response_time_hours: number;
  resolution_time_hours: number;
  escalation_time_hours: number;
  created_at?: string;
  updated_at?: string;
}

import { Database } from "@/integrations/supabase/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Clock, Save, AlertTriangle, Loader2, Plus, Trash2, TrendingUp } from "lucide-react";
import { toast } from "sonner";
import { useSLARules, useSaveSLARule, useDeleteSLARule, useSLABreachStats } from "@/hooks/useSLA";
import { useDepartments, useCategories } from "@/hooks/useComplaints";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";

const priorityLabels = {
  critical: { label: "Critical", color: "text-destructive", bg: "bg-destructive/10" },
  high: { label: "High", color: "text-orange-500", bg: "bg-orange-500/10" },
  medium: { label: "Medium", color: "text-warning", bg: "bg-warning/10" },
  low: { label: "Low", color: "text-success", bg: "bg-success/10" },
};

const SLAConfiguration = () => {
  const { data: slaRules = [], isLoading } = useSLARules();
  const { data: departments = [] } = useDepartments();
  const { data: categories = [] } = useCategories();
  const { data: breachStats } = useSLABreachStats();
  const saveSLARule = useSaveSLARule();
  const deleteSLARule = useDeleteSLARule();

  const [showDialog, setShowDialog] = useState(false);
  const [editingRule, setEditingRule] = useState<SLARule | null>(null);

  const [formData, setFormData] = useState<{
    priority: SLARule['priority'];
    category_id: string | null;
    department_id: string | null;
    response_time_hours: number;
    resolution_time_hours: number;
    escalation_time_hours: number;
  }>({
    priority: "medium",
    category_id: null as string | null,
    department_id: null as string | null,
    response_time_hours: 4,
    resolution_time_hours: 24,
    escalation_time_hours: 12,
  });

  const handleOpenDialog = (rule?: SLARule) => {
    if (rule) {
      setEditingRule(rule);
      setFormData({
        priority: rule.priority,
        category_id: rule.category_id,
        department_id: rule.department_id,
        response_time_hours: rule.response_time_hours,
        resolution_time_hours: rule.resolution_time_hours,
        escalation_time_hours: rule.escalation_time_hours,
      });
    } else {
      setEditingRule(null);
      setFormData({
        priority: "medium",
        category_id: null,
        department_id: null,
        response_time_hours: 4,
        resolution_time_hours: 24,
        escalation_time_hours: 12,
      });
    }
    setShowDialog(true);
  };

  const handleSave = async () => {
    try {
      await saveSLARule.mutateAsync({
        id: editingRule?.id,
        ...formData,
      });
      setShowDialog(false);
      setEditingRule(null);
    } catch (error) {
      console.error("Error saving SLA rule:", error);
    }
  };

  const handleDelete = async (ruleId: string) => {
    if (confirm("Are you sure you want to delete this SLA rule?")) {
      await deleteSLARule.mutateAsync(ruleId);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="w-6 h-6 animate-spin text-accent" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* SLA Statistics */}
      {breachStats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="p-4">
            <div className="text-sm text-muted-foreground mb-1">Total Tracked</div>
            <div className="text-2xl font-bold text-foreground">{breachStats.total_tracked}</div>
          </Card>
          <Card className="p-4">
            <div className="text-sm text-muted-foreground mb-1">Compliance Rate</div>
            <div className="text-2xl font-bold text-success flex items-center gap-2">
              {breachStats.compliance_rate.toFixed(1)}%
              <TrendingUp className="w-4 h-4" />
            </div>
          </Card>
          <Card className="p-4">
            <div className="text-sm text-muted-foreground mb-1">Response Breaches</div>
            <div className="text-2xl font-bold text-warning">{breachStats.response_breaches}</div>
          </Card>
          <Card className="p-4">
            <div className="text-sm text-muted-foreground mb-1">Resolution Breaches</div>
            <div className="text-2xl font-bold text-destructive">{breachStats.resolution_breaches}</div>
          </Card>
        </div>
      )}

      {/* SLA Rules */}
      <div className="card-elevated p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
            <Clock className="w-5 h-5 text-accent" />
            SLA Rules
          </h2>
          <Button onClick={() => handleOpenDialog()}>
            <Plus className="w-4 h-4 mr-2" />
            Add Rule
          </Button>
        </div>

        <div className="bg-info/10 border border-info/20 rounded-lg p-4 mb-6">
          <div className="flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 text-info mt-0.5" />
            <p className="text-sm text-muted-foreground">
              SLA defines the maximum time allowed for response and resolution. Rules are matched by priority,
              category, and department. More specific rules override general ones.
            </p>
          </div>
        </div>

        <div className="space-y-4">
          {slaRules.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Clock className="w-12 h-12 mx-auto mb-3 opacity-20" />
              <p>No SLA rules configured yet</p>
              <Button variant="link" onClick={() => handleOpenDialog()}>
                Create your first rule
              </Button>
            </div>
          ) : (
            slaRules.map((rule) => (
              <div key={rule.id} className="p-4 rounded-lg border border-border hover:border-accent/50 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-3">
                      <Badge
                        variant="outline"
                        className={`${priorityLabels[rule.priority as keyof typeof priorityLabels].bg} ${priorityLabels[rule.priority as keyof typeof priorityLabels].color
                          }`}
                      >
                        {priorityLabels[rule.priority as keyof typeof priorityLabels].label}
                      </Badge>
                      {rule.maintenance_categories && (
                        <Badge variant="secondary">
                          {rule.maintenance_categories.name}
                        </Badge>
                      )}
                      {rule.departments && (
                        <Badge variant="secondary">
                          {rule.departments.name}
                        </Badge>
                      )}
                      {!rule.maintenance_categories && !rule.departments && (
                        <Badge variant="secondary">Global Rule</Badge>
                      )}
                    </div>
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Response Time:</span>
                        <span className="ml-2 font-medium text-foreground">{rule.response_time_hours}h</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Resolution Time:</span>
                        <span className="ml-2 font-medium text-foreground">{rule.resolution_time_hours}h</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Escalation:</span>
                        <span className="ml-2 font-medium text-foreground">
                          {rule.escalation_time_hours ? `${rule.escalation_time_hours}h` : "None"}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="ghost" size="sm" onClick={() => handleOpenDialog(rule)}>
                      Edit
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(rule.id)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Add/Edit Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editingRule ? "Edit SLA Rule" : "Add SLA Rule"}</DialogTitle>
            <DialogDescription>
              Configure response and resolution times for complaints based on priority, category, and department.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Priority *</Label>
                <Select value={formData.priority} onValueChange={(v: SLARule['priority']) => setFormData({ ...formData, priority: v })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(priorityLabels).map(([priority, { label }]) => (
                      <SelectItem key={priority} value={priority}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Category (Optional)</Label>
                <Select
                  value={formData.category_id || "none"}
                  onValueChange={(v) => setFormData({ ...formData, category_id: v === "none" ? null : v })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All Categories" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">All Categories</SelectItem>
                    {categories.map((cat: Database['public']['Tables']['maintenance_categories']['Row']) => (
                      <SelectItem key={cat.id} value={cat.id}>
                        {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label>Department (Optional)</Label>
              <Select
                value={formData.department_id || "none"}
                onValueChange={(v) => setFormData({ ...formData, department_id: v === "none" ? null : v })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All Departments" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">All Departments</SelectItem>
                  {departments.map((dept: Database['public']['Tables']['departments']['Row']) => (
                    <SelectItem key={dept.id} value={dept.id}>
                      {dept.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label>Response Time (hours) *</Label>
                <Input
                  type="number"
                  min="1"
                  value={formData.response_time_hours}
                  onChange={(e) =>
                    setFormData({ ...formData, response_time_hours: parseInt(e.target.value) || 1 })
                  }
                  className="mt-1"
                />
                <p className="text-xs text-muted-foreground mt-1">Time to acknowledge</p>
              </div>

              <div>
                <Label>Resolution Time (hours) *</Label>
                <Input
                  type="number"
                  min="1"
                  value={formData.resolution_time_hours}
                  onChange={(e) =>
                    setFormData({ ...formData, resolution_time_hours: parseInt(e.target.value) || 1 })
                  }
                  className="mt-1"
                />
                <p className="text-xs text-muted-foreground mt-1">Time to complete</p>
              </div>

              <div>
                <Label>Escalation Time (hours)</Label>
                <Input
                  type="number"
                  min="0"
                  value={formData.escalation_time_hours}
                  onChange={(e) =>
                    setFormData({ ...formData, escalation_time_hours: parseInt(e.target.value) || 0 })
                  }
                  className="mt-1"
                />
                <p className="text-xs text-muted-foreground mt-1">Time before escalation</p>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={saveSLARule.isPending}>
              {saveSLARule.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              <Save className="w-4 h-4 mr-2" />
              {editingRule ? "Update" : "Create"} Rule
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SLAConfiguration;
