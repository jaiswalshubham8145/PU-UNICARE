import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Upload, FileText, Loader2, CheckCircle, AlertTriangle } from "lucide-react";
import Papa from "papaparse";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { useDepartments } from "@/hooks/useComplaints";
import { Database } from "@/integrations/supabase/types";

export const BulkImportModal = () => {
  const { user } = useAuth();
  const { data: departments } = useDepartments();
  const [isOpen, setIsOpen] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [results, setResults] = useState<{ success: number; failed: number } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.csv')) {
      toast.error("Please upload a valid CSV file");
      return;
    }

    if (!user) {
      toast.error("You must be logged in to import complaints");
      return;
    }

    setIsImporting(true);
    setResults(null);
    setProgress(10);

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: async (results) => {
        try {
          setProgress(30);
          const data = results.data as any[];
          let successCount = 0;
          let failCount = 0;

          // Process in batches to not overwhelm Supabase
          const batchSize = 50;
          const defaultDeptId = departments?.[0]?.id || "";

          for (let i = 0; i < data.length; i += batchSize) {
            const batch: Database['public']['Tables']['complaints']['Insert'][] = data.slice(i, i + batchSize).map(row => {
              const matchedDept = departments?.find(
                d => d.id === row.department_id || d.name.toLowerCase() === (row.department || row.department_name || '').toLowerCase()
              );
              return {
                complaint_number: row.complaint_number || `UC-IMP-${Math.floor(Math.random() * 100000)}`,
                title: row.title || 'Imported Complaint',
                description: row.description || 'Imported from legacy system',
                priority: (['low', 'medium', 'high', 'critical'].includes(row.priority?.toLowerCase()) ? row.priority.toLowerCase() : 'medium') as any,
                status: (['pending', 'acknowledged', 'approved', 'in_progress', 'on_hold', 'completed', 'rejected', 'closed'].includes(row.status?.toLowerCase()) ? row.status.toLowerCase() : 'pending') as any,
                location: row.location || 'Unknown',
                department_id: matchedDept?.id || row.department_id || defaultDeptId,
                submitted_by: user.id,
              };
            });

            const { error } = await supabase.from('complaints').insert(batch);
            
            if (error) {
              console.error("Batch insert error:", error);
              failCount += batch.length;
            } else {
              successCount += batch.length;
            }
            setProgress(30 + Math.floor((i / data.length) * 70));
          }

          setResults({ success: successCount, failed: failCount });
          toast.success(`Import complete! ${successCount} inserted, ${failCount} failed.`);
        } catch (error) {
          console.error("Import error:", error);
          toast.error("An error occurred during import");
        } finally {
          setIsImporting(false);
          setProgress(100);
          if (fileInputRef.current) fileInputRef.current.value = '';
        }
      },
      error: (error) => {
        toast.error(`CSV Parsing Error: ${error.message}`);
        setIsImporting(false);
      }
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2 border-primary/20 hover:bg-primary/5">
          <Upload className="w-4 h-4 text-primary" />
          Bulk Import CSV
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Import Legacy Complaints</DialogTitle>
        </DialogHeader>
        
        <div className="py-6 flex flex-col items-center justify-center border-2 border-dashed border-border rounded-xl mt-4 bg-muted/10">
          {!isImporting && !results && (
            <>
              <FileText className="w-12 h-12 text-muted-foreground mb-4 opacity-50" />
              <h3 className="font-medium text-foreground mb-1">Upload CSV File</h3>
              <p className="text-xs text-muted-foreground mb-4 max-w-[250px] text-center">
                CSV must contain headers: title, description, priority, status, location
              </p>
              
              <input 
                type="file" 
                accept=".csv" 
                className="hidden" 
                ref={fileInputRef}
                onChange={handleFileUpload}
              />
              <Button onClick={() => fileInputRef.current?.click()} variant="secondary">
                Select File
              </Button>
            </>
          )}

          {isImporting && (
            <div className="flex flex-col items-center w-full px-8">
              <Loader2 className="w-12 h-12 text-primary animate-spin mb-4" />
              <h3 className="font-medium text-foreground mb-2">Importing Data...</h3>
              <div className="w-full h-2 bg-secondary rounded-full overflow-hidden">
                <div 
                  className="h-full bg-primary transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <p className="text-xs text-muted-foreground mt-2">{progress}% complete</p>
            </div>
          )}

          {results && !isImporting && (
            <div className="flex flex-col items-center">
              {results.failed === 0 ? (
                <CheckCircle className="w-12 h-12 text-success mb-4" />
              ) : (
                <AlertTriangle className="w-12 h-12 text-warning mb-4" />
              )}
              <h3 className="font-medium text-foreground mb-2">Import Complete</h3>
              <div className="flex gap-4 text-sm mt-2">
                <div className="text-center px-4 py-2 bg-success/10 rounded-lg text-success">
                  <span className="block font-bold text-lg">{results.success}</span>
                  Success
                </div>
                <div className="text-center px-4 py-2 bg-destructive/10 rounded-lg text-destructive">
                  <span className="block font-bold text-lg">{results.failed}</span>
                  Failed
                </div>
              </div>
              <Button onClick={() => setResults(null)} variant="outline" className="mt-6">
                Import Another File
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
