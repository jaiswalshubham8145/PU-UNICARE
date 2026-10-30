import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { Plus, Trash2, Loader2, Layers, Building2, MapPin, Tag, AlertTriangle } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useDepartments, useCategories, useBuildings, useComplaints } from "@/hooks/useComplaints";
import { ALLOWED_ROLES_FOR_COMPLAINTS } from "@/config/constants";

const complaintSchema = z.object({
  title: z.string().optional(),
  department: z.string().min(1, "Department is required"),
  building: z.string().min(1, "Building is required"),
  location: z.string().min(1, "Specific location is required"),
  category: z.string().min(1, "Category is required"),
  priority: z.enum(["critical", "high", "medium", "low"] as const, {
    required_error: "Priority is required",
  }),
  description: z.string().min(10, "Description must be at least 10 characters"),
});

const batchFormSchema = z.object({
  complaints: z.array(complaintSchema).min(1, "At least one complaint is required"),
});

const priorities = [
  { value: "critical", label: "Critical", color: "bg-destructive" },
  { value: "high", label: "High", color: "bg-priority-high" },
  { value: "medium", label: "Medium", color: "bg-warning" },
  { value: "low", label: "Low", color: "bg-success" },
] as const;

const BatchComplaint = () => {
  const navigate = useNavigate();
  const { user, roles } = useAuth();
  const { data: departments, isLoading: loadingDepts } = useDepartments();
  const { data: categories, isLoading: loadingCats } = useCategories();
  const { data: buildings, isLoading: loadingBuildings } = useBuildings();
  const { submitComplaint } = useComplaints();
  
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<z.infer<typeof batchFormSchema>>({
    resolver: zodResolver(batchFormSchema),
    defaultValues: {
      complaints: [{ title: "", department: "", building: "", location: "", category: "", priority: "medium", description: "" }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "complaints",
  });

  const onSubmit = async (values: z.infer<typeof batchFormSchema>) => {
    if (!user) {
      toast.error("Please login to submit complaints");
      navigate("/login");
      return;
    }

    if (!roles.some(role => ALLOWED_ROLES_FOR_COMPLAINTS.includes(role))) {
      toast.error("Permission denied", {
        description: "Your account does not have permission to submit complaints.",
      });
      return;
    }

    setIsSubmitting(true);
    let successCount = 0;

    try {
      // Execute all submissions in parallel
      const submissionPromises = values.complaints.map(complaint => 
        submitComplaint.mutateAsync({
          title: complaint.title || "Batch Upload Issue",
          description: complaint.description,
          location: complaint.location,
          department_id: complaint.department,
          category_id: complaint.category,
          priority: complaint.priority,
          building_id: complaint.building,
        })
      );

      await Promise.all(submissionPromises);
      successCount = submissionPromises.length;
      
      toast.success(`Successfully registered ${successCount} complaints!`);
      navigate("/dashboard/faculty"); // Or navigate to their respective dashboard
    } catch (error: any) {
      console.error("Batch submit error:", error);
      toast.error(`Failed to submit some or all complaints: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="relative z-10 min-h-screen noise-texture">
      <Navbar />
      <main className="pt-16 pb-24">
        <section className="py-12 glass-section noise-texture">
          <div className="container mx-auto px-4 max-w-5xl">
            <div className="mb-8 text-center">
              <div className="inline-flex items-center gap-2 bg-accent/20 px-4 py-2 rounded-full mb-4">
                <Layers className="w-4 h-4 text-accent" />
                <span className="text-accent text-sm font-medium">Batch Upload</span>
              </div>
              <h1 className="text-3xl font-bold mb-2">Register Multiple Complaints</h1>
              <p className="text-muted-foreground">Submit multiple related issues across the campus in one go.</p>
            </div>

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                {fields.map((field, index) => (
                  <div key={field.id} className="p-6 rounded-xl border bg-card shadow-sm relative space-y-4">
                    <div className="flex justify-between items-center mb-2">
                      <h3 className="font-semibold text-lg flex items-center gap-2">
                        <span className="bg-primary/10 text-primary w-6 h-6 rounded-full flex items-center justify-center text-xs">
                          {index + 1}
                        </span>
                        Complaint Details
                      </h3>
                      {fields.length > 1 && (
                        <Button 
                          type="button" 
                          variant="ghost" 
                          size="icon" 
                          className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                          onClick={() => remove(index)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Department */}
                      <FormField control={form.control} name={`complaints.${index}.department`} render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center gap-2"><Building2 className="w-3 h-3" /> Department *</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value} disabled={loadingDepts}>
                            <FormControl><SelectTrigger><SelectValue placeholder="Select department" /></SelectTrigger></FormControl>
                            <SelectContent>
                              {departments?.map((dept) => <SelectItem key={dept.id} value={dept.id}>{dept.name}</SelectItem>)}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )} />

                      {/* Building */}
                      <FormField control={form.control} name={`complaints.${index}.building`} render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center gap-2"><Building2 className="w-3 h-3" /> Building *</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value} disabled={loadingBuildings}>
                            <FormControl><SelectTrigger><SelectValue placeholder="Select building" /></SelectTrigger></FormControl>
                            <SelectContent className="max-h-80">
                              {buildings?.map((building) => <SelectItem key={building.id} value={building.id}>{building.name}</SelectItem>)}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )} />

                      {/* Location */}
                      <FormField control={form.control} name={`complaints.${index}.location`} render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center gap-2"><MapPin className="w-3 h-3" /> Specific Location *</FormLabel>
                          <FormControl><Input placeholder="e.g., Room 301" {...field} /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )} />

                      {/* Category */}
                      <FormField control={form.control} name={`complaints.${index}.category`} render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center gap-2"><Tag className="w-3 h-3" /> Category *</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value} disabled={loadingCats}>
                            <FormControl><SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger></FormControl>
                            <SelectContent>
                              {categories?.map((cat) => <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>)}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )} />

                      {/* Priority */}
                      <FormField control={form.control} name={`complaints.${index}.priority`} render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center gap-2"><AlertTriangle className="w-3 h-3" /> Priority *</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl><SelectTrigger><SelectValue placeholder="Select priority" /></SelectTrigger></FormControl>
                            <SelectContent>
                              {priorities.map((p) => (
                                <SelectItem key={p.value} value={p.value}>
                                  <div className="flex items-center gap-2"><span className={`w-2 h-2 rounded-full ${p.color}`} />{p.label}</div>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )} />
                      
                      {/* Description */}
                      <FormField control={form.control} name={`complaints.${index}.description`} render={({ field }) => (
                        <FormItem className="md:col-span-2">
                          <FormLabel>Issue Description *</FormLabel>
                          <FormControl><Textarea placeholder="Describe the issue..." rows={2} {...field} /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )} />
                    </div>
                  </div>
                ))}

                <div className="flex flex-col sm:flex-row gap-4 items-center justify-between pt-4 border-t">
                  <Button 
                    type="button" 
                    variant="outline" 
                    className="w-full sm:w-auto"
                    onClick={() => append({ title: "", department: "", building: "", location: "", category: "", priority: "medium", description: "" })}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Another Complaint
                  </Button>

                  <Button 
                    type="submit" 
                    variant="accent" 
                    size="lg"
                    className="w-full sm:w-auto min-w-[200px]"
                    disabled={isSubmitting || fields.length === 0}
                  >
                    {isSubmitting ? (
                      <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Submitting Batch...</>
                    ) : (
                      `Submit ${fields.length} Complaint${fields.length > 1 ? 's' : ''}`
                    )}
                  </Button>
                </div>
              </form>
            </Form>

          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default BatchComplaint;
