import { format } from "date-fns";
import type { Database } from "@/integrations/supabase/types";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export interface ExportComplaint {
  complaint_number?: string | null;
  title?: string | null;
  description?: string | null;
  departments?: { name?: string | null } | null;
  maintenance_categories?: { name?: string | null } | null;
  location?: string | null;
  priority?: string | null;
  status?: string | null;
  created_at?: string | number | Date | null;
  updated_at?: string | number | Date | null;
  expected_resolution?: string | number | Date | null;
  resolved_at?: string | number | Date | null;
  department_name?: string | null;
  category_name?: string | null;

}

export const exportToCSV = (data: ExportComplaint[], filename: string) => {
  if (!data || data.length === 0) return;

  const headers = [
    "Complaint Number",
    "Title",
    "Description",
    "Department",
    "Category",
    "Location",
    "Priority",
    "Status",
    "Submitted Date",
    "Last Updated",
    "Expected Resolution",
    "Resolved Date",
  ];

  const rows = data.map((item) => [
    item.complaint_number || "",
    `"${(item.title || "").replace(/"/g, '""')}"`,
    `"${(item.description || "").replace(/"/g, '""')}"`,
    item.departments?.name || "",
    item.maintenance_categories?.name || "",
    `"${(item.location || "").replace(/"/g, '""')}"`,
    item.priority || "",
    item.status || "",
    item.created_at ? format(new Date(item.created_at), "yyyy-MM-dd HH:mm") : "",
    item.updated_at ? format(new Date(item.updated_at), "yyyy-MM-dd HH:mm") : "",
    item.expected_resolution ? format(new Date(item.expected_resolution), "yyyy-MM-dd") : "",
    item.resolved_at ? format(new Date(item.resolved_at), "yyyy-MM-dd HH:mm") : "",
  ]);

  const csvContent = [headers.join(","), ...rows.map((row) => row.join(","))].join("\n");

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);

  link.setAttribute("href", url);
  link.setAttribute("download", `${filename}-${format(new Date(), "yyyy-MM-dd")}.csv`);
  link.style.visibility = "hidden";

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export const exportToPDF = (data: ExportComplaint[], filename: string, title: string = "Complaint Report") => {
  if (!data || data.length === 0) return;

  const doc = new jsPDF();

  // Title
  doc.setFontSize(18);
  doc.text(title, 14, 22);

  // Date
  doc.setFontSize(10);
  doc.text(`Generated on: ${format(new Date(), "PPpp")}`, 14, 30);

  // Filter Data for Table
  const tableData = data.map(item => [
    item.complaint_number || "-",
    item.title || "-",
    item.departments?.name || item.department_name || "-",
    item.maintenance_categories?.name || item.category_name || "-",
    item.priority?.toUpperCase() || "-",
    item.status?.replace("_", " ").toUpperCase() || "-",
    item.created_at ? format(new Date(item.created_at), "MMM d, yyyy") : "-"
  ]);

  // Table Columns
  const tableColumns = [
    "Complaint #", "Title", "Department", "Category", "Priority", "Status", "Date"
  ];

  autoTable(doc, {
    head: [tableColumns],
    body: tableData,
    startY: 35,
    theme: 'grid',
    styles: { fontSize: 8 },
    headStyles: { fillColor: [41, 128, 185] }, // Blue header
  });

  // Save
  doc.save(`${filename}-${format(new Date(), "yyyy-MM-dd")}.pdf`);
};