
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Download, FileText, Loader2 } from "lucide-react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { format, subDays, startOfMonth, startOfYear, isAfter } from "date-fns";
import { toast } from "sonner";
import { exportToExcel, ExportComplaint } from "@/lib/exportUtils";

// Define a loose type for flexibility
interface ComplaintData {
    id: string;
    complaint_number: string;
    title: string;
    description?: string;
    status: string;
    priority: string;
    created_at: string;
    location?: string;
    departments?: { name: string } | null;
    profiles?: { full_name: string } | null;
    // Add other possible fields
    [key: string]: unknown;
}

interface ReportDownloadButtonProps {
    data: ComplaintData[];
    userRole: string; // "Admin", "HOD", etc.
    userName?: string;
}

export const ReportDownloadButton = ({ data, userRole, userName }: ReportDownloadButtonProps) => {
    const [isGenerating, setIsGenerating] = useState(false);

    const generatePDF = (period: "weekly" | "monthly" | "annually") => {
        setIsGenerating(true);
        try {
            const doc = new jsPDF();

            // Filter data
            const now = new Date();
            let startDate = new Date();
            let periodText = "";

            if (period === "weekly") {
                startDate = subDays(now, 7);
                periodText = `Weekly Report (${format(startDate, "MMM d, yyyy")} - ${format(now, "MMM d, yyyy")})`;
            } else if (period === "monthly") {
                startDate = startOfMonth(now);
                periodText = `Monthly Report (${format(now, "MMMM yyyy")})`;
            } else if (period === "annually") {
                startDate = startOfYear(now);
                periodText = `Annual Report (${format(now, "yyyy")})`;
            }

            const filteredData = data.filter(item => isAfter(new Date(item.created_at), startDate));

            if (filteredData.length === 0) {
                toast.error(`No data found for the selected period (${period})`);
                setIsGenerating(false);
                return;
            }

            // Calculate Stats
            const total = filteredData.length;
            const pending = filteredData.filter(c => c.status === "pending").length;
            const progress = filteredData.filter(c => c.status === "in_progress").length;
            const completed = filteredData.filter(c => ["completed", "closed"].includes(c.status)).length;

            // Header
            doc.setFontSize(20);
            doc.setTextColor(40, 40, 40);
            doc.text(`${userRole} Dashboard Report`, 14, 22);

            doc.setFontSize(12);
            doc.setTextColor(100, 100, 100);
            doc.text(periodText, 14, 32);
            if (userName) {
                doc.text(`Generated for: ${userName}`, 14, 38);
            }
            doc.text(`Generated on: ${format(now, "PPpp")}`, 14, 44);

            // Stats Summary
            doc.setDrawColor(200, 200, 200);
            doc.line(14, 50, 196, 50);

            doc.setFontSize(14);
            doc.setTextColor(60, 60, 60);
            doc.text("Summary", 14, 60);

            const stats = [
                ["Total Complaints", total],
                ["Pending", pending],
                ["In Progress", progress],
                ["Completed/Closed", completed]
            ];

            autoTable(doc, {
                startY: 65,
                head: [['Metric', 'Count']],
                body: stats,
                theme: 'grid',
                headStyles: { fillColor: [66, 66, 66] },
                styles: { fontSize: 10, cellPadding: 2 },
                columnStyles: { 0: { cellWidth: 80 }, 1: { cellWidth: 40 } },
                margin: { left: 14 }
            });

            // Detailed Table
            const finalY = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable?.finalY || 100;
            doc.setFontSize(14);
            doc.text("Detailed Complaints", 14, finalY + 15);

            const tableData = filteredData.map(c => [
                c.complaint_number,
                c.title,
                c.status.replace("_", " ").toUpperCase(),
                c.priority.toUpperCase(),
                format(new Date(c.created_at), "MMM d, yyyy"),
                c.departments?.name || "N/A"
            ]);

            autoTable(doc, {
                startY: finalY + 20,
                head: [['#', 'Title', 'Status', 'Priority', 'Date', 'Dept']],
                body: tableData,
                theme: 'striped',
                headStyles: { fillColor: [41, 128, 185] }, // Blue header
                styles: { fontSize: 9 },
            });

            doc.save(`${userRole}_Report_${period}_${format(now, "yyyy-MM-dd")}.pdf`);
            toast.success("Report downloaded successfully");

        } catch (error) {
            console.error("PDF Generation Error:", error);
            toast.error("Failed to generate PDF report");
        } finally {
            setIsGenerating(false);
        }
    };

    const generateExcel = (period: "weekly" | "monthly" | "annually") => {
        setIsGenerating(true);
        try {
            const now = new Date();
            let startDate = new Date();
            
            if (period === "weekly") {
                startDate = subDays(now, 7);
            } else if (period === "monthly") {
                startDate = startOfMonth(now);
            } else if (period === "annually") {
                startDate = startOfYear(now);
            }

            const filteredData = data.filter(item => isAfter(new Date(item.created_at), startDate));

            if (filteredData.length === 0) {
                toast.error(`No data found for the selected period (${period})`);
                setIsGenerating(false);
                return;
            }

            exportToExcel(filteredData as ExportComplaint[], `${userRole}_Report_${period}`);
            toast.success("Excel report downloaded successfully");
        } catch (error) {
            console.error("Excel Generation Error:", error);
            toast.error("Failed to generate Excel report");
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="outline" className="gap-2">
                    {isGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                    Download Report
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => generatePDF("weekly")}>
                    <FileText className="w-4 h-4 mr-2" />
                    Weekly Report (PDF)
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => generatePDF("monthly")}>
                    <FileText className="w-4 h-4 mr-2" />
                    Monthly Report (PDF)
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => generatePDF("annually")}>
                    <FileText className="w-4 h-4 mr-2" />
                    Annual Report (PDF)
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => generateExcel("monthly")}>
                    <FileText className="w-4 h-4 mr-2" />
                    Monthly Report (Excel)
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
};
