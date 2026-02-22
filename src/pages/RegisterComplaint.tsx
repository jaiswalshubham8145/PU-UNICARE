import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { FileText, Upload, AlertTriangle, MapPin, Building2, Tag, X, Loader2 } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useDepartments, useCategories, useBuildings, useComplaints } from "@/hooks/useComplaints";
import { supabase } from "@/integrations/supabase/client";
import { Database } from "@/integrations/supabase/types";
import { ALLOWED_ROLES_FOR_COMPLAINTS, BUCKETS } from "@/config/constants";

type ComplaintPriority = Database['public']['Enums']['complaint_priority'];

const priorities = [
  { value: "critical" as ComplaintPriority, label: "Critical", color: "bg-destructive" },
  { value: "high" as ComplaintPriority, label: "High", color: "bg-priority-high" },
  { value: "medium" as ComplaintPriority, label: "Medium", color: "bg-warning" },
  { value: "low" as ComplaintPriority, label: "Low", color: "bg-success" },
];

const formSchema = z.object({
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

const RegisterComplaint = () => {
  const navigate = useNavigate();
  const { user, roles } = useAuth();
  const { data: departments, isLoading: loadingDepts } = useDepartments();
  const { data: categories, isLoading: loadingCats } = useCategories();
  const { data: buildings, isLoading: loadingBuildings } = useBuildings();
  const { submitComplaint } = useComplaints();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [files, setFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      department: "",
      building: "",
      location: "",
      category: "",
      priority: undefined,
      description: "",
    },
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    const validFiles = selectedFiles.filter(file => {
      const isValid = file.size <= 10 * 1024 * 1024; // 10MB
      if (!isValid) toast.error(`${file.name} is too large (max 10MB)`);
      return isValid;
    });
    setFiles(prev => [...prev, ...validFiles].slice(0, 5));
  };

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const uploadFiles = async (): Promise<string[]> => {
    if (!user || files.length === 0) return [];

    const urls: string[] = [];
    for (const file of files) {
      const fileExt = file.name.split(".").pop();
      const fileName = `${user.id}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

      const { error } = await supabase.storage
        .from(BUCKETS.COMPLAINT_IMAGES)
        .upload(fileName, file);

      if (error) {
        console.error("Upload error:", error);
        continue;
      }

      const { data: urlData } = supabase.storage
        .from(BUCKETS.COMPLAINT_IMAGES)
        .getPublicUrl(fileName);

      urls.push(urlData.publicUrl);
    }
    return urls;
  };

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (!user) {
      toast.error("Please login to submit a complaint");
      navigate("/login");
      return;
    }

    // Check if user has permission to submit complaints
    if (!roles.some(role => ALLOWED_ROLES_FOR_COMPLAINTS.includes(role))) {
      toast.error("Unable to submit complaint", {
        description: "Your account does not have permission to submit complaints. Please contact an administrator.",
      });
      return;
    }

    setUploading(true);

    try {
      // Upload files first
      const imageUrls = await uploadFiles();

      // Submit complaint
      const result = await submitComplaint.mutateAsync({
        title: values.title || `${categories?.find(c => c.id === values.category)?.name} Issue`,
        description: values.description,
        location: values.location,
        department_id: values.department,
        category_id: values.category,
        priority: values.priority,
        building_id: values.building,
        image_urls: imageUrls.length > 0 ? imageUrls : undefined,
      });

      toast.success("Complaint registered successfully!", {
        description: `Your complaint ID is ${result.complaint_number}`,
      });

      navigate("/track", { state: { complaintNumber: result.complaint_number } });
    } catch (error: unknown) {
      console.error("Submit error:", error);
      const message = error instanceof Error ? error.message : "Unknown error";

      if (message.includes("row-level security policy") || message.includes("violates row-level security")) {
        toast.error("Unable to submit complaint", {
          description: "You may not have permission to submit complaints. Please contact an administrator.",
        });
      } else {
        toast.error("Failed to submit complaint", {
          description: message,
        });
      }
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="relative z-10 min-h-screen noise-texture">
      <Navbar />
      <main className="pt-16">
        {/* Hero Section */}
        <section className="py-16 glass-section noise-texture">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center">
              <div className="inline-flex items-center gap-2 bg-accent/20 px-4 py-2 rounded-full mb-6">
                <FileText className="w-4 h-4 text-accent" />
                <span className="text-accent text-sm font-medium">New Complaint</span>
              </div>
              <h1 className="text-3xl md:text-4xl font-bold mb-4">
                Register Maintenance Complaint
              </h1>
              <p className="text-primary-foreground/80">
                Submit your maintenance request and track its progress in real-time.
              </p>
            </div>
          </div>
        </section>

        {/* Form Section */}
        <section className="py-16 glass-section noise-texture">
          <div className="container mx-auto px-4">
            <div className="max-w-2xl mx-auto">
              {!user && (
                <div className="bg-warning/10 border border-warning/30 rounded-xl p-4 mb-6">
                  <p className="text-foreground text-sm">
                    Please <Button variant="link" className="p-0 h-auto" onClick={() => navigate("/login")}>login</Button> to submit a complaint.
                  </p>
                </div>
              )}

              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  {/* Title */}
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2">
                          <FileText className="w-4 h-4 text-accent" />
                          Issue Title (Optional)
                        </FormLabel>
                        <FormControl>
                          <Input placeholder="Brief title for your complaint" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Department & Building */}
                  <div className="grid md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="department"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center gap-2">
                            <Building2 className="w-4 h-4 text-accent" />
                            Department *
                          </FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value} disabled={loadingDepts}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder={loadingDepts ? "Loading..." : "Select department"} />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {departments?.map((dept) => (
                                <SelectItem key={dept.id} value={dept.id}>
                                  {dept.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="building"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center gap-2">
                            <Building2 className="w-4 h-4 text-accent" />
                            Building *
                          </FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value} disabled={loadingBuildings}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder={loadingBuildings ? "Loading..." : "Select building"} />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {buildings?.map((building) => (
                                <SelectItem key={building.id} value={building.id}>
                                  {building.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Location */}
                  <FormField
                    control={form.control}
                    name="location"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-accent" />
                          Specific Location *
                        </FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., Room 301, Floor 3" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Category & Priority */}
                  <div className="grid md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="category"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center gap-2">
                            <Tag className="w-4 h-4 text-accent" />
                            Issue Category *
                          </FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value} disabled={loadingCats}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder={loadingCats ? "Loading..." : "Select category"} />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {categories?.map((cat) => (
                                <SelectItem key={cat.id} value={cat.id}>
                                  {cat.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="priority"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center gap-2">
                            <AlertTriangle className="w-4 h-4 text-accent" />
                            Priority Level *
                          </FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select priority" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {priorities.map((p) => (
                                <SelectItem key={p.value} value={p.value}>
                                  <div className="flex items-center gap-2">
                                    <span className={`w-2 h-2 rounded-full ${p.color}`} />
                                    {p.label}
                                  </div>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Description */}
                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2">
                          <FileText className="w-4 h-4 text-accent" />
                          Issue Description *
                        </FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Describe the maintenance issue in detail..."
                            rows={5}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* File Upload */}
                  <div>
                    <Label className="flex items-center gap-2 mb-2">
                      <Upload className="w-4 h-4 text-accent" />
                      Photo/Video Evidence (Optional)
                    </Label>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*,video/*"
                      multiple
                      onChange={handleFileChange}
                      className="hidden"
                    />
                    <div
                      onClick={() => fileInputRef.current?.click()}
                      className="border-2 border-dashed border-border rounded-xl p-8 text-center hover:border-accent/50 transition-colors cursor-pointer"
                    >
                      <Upload className="w-10 h-10 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground text-sm">
                        Click to browse or drag & drop files
                      </p>
                      <p className="text-muted-foreground text-xs mt-2">
                        Supports: JPG, PNG, MP4 (Max 10MB each, up to 5 files)
                      </p>
                    </div>

                    {/* File Preview */}
                    {files.length > 0 && (
                      <div className="mt-4 space-y-2">
                        {files.map((file, index) => (
                          <div key={index} className="flex items-center justify-between p-2 bg-secondary rounded-lg">
                            <span className="text-sm text-foreground truncate flex-1">{file.name}</span>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => removeFile(index)}
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Submit */}
                  <Button
                    type="submit"
                    variant="accent"
                    size="lg"
                    className="w-full"
                    disabled={!user || uploading || submitComplaint.isPending}
                  >
                    {uploading || submitComplaint.isPending ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      "Submit Complaint"
                    )}
                  </Button>
                </form>
              </Form>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default RegisterComplaint;
