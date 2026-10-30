import { useState } from "react";
import { Calendar, dateFnsLocalizer } from "react-big-calendar";
import { format, parse, startOfWeek, getDay } from "date-fns";
import { enUS } from "date-fns/locale/en-US";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { Card, CardContent } from "@/components/ui/card";
import Navbar from "@/components/layout/Navbar";
import { PageLoadingSkeleton } from "@/components/ui/skeleton";
import Footer from "@/components/layout/Footer";
import { useComplaints } from "@/hooks/useComplaints";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Calendar as CalendarIcon, Loader2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

const locales = {
  "en-US": enUS,
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

export const CalendarView = () => {
  const { allComplaints, loadingAllComplaints } = useComplaints();
  const [selectedEvent, setSelectedEvent] = useState<any>(null);

  // Fetch Maintenance Windows
  const { data: maintenanceWindows, isLoading: loadingMaintenance } = useQuery({
    queryKey: ["maintenance_windows"],
    queryFn: async () => {
      const { data, error } = await supabase.from("maintenance_windows").select("*");
      if (error) {
        console.error("Error fetching maintenance windows", error);
        return [];
      }
      return data;
    }
  });

  if (loadingAllComplaints || loadingMaintenance) {
    return <PageLoadingSkeleton />;
  }

  // Format events
  const events: any[] = [];

  // Add Complaints (Expected Resolution Date)
  if (allComplaints) {
    allComplaints.forEach((c) => {
      if (c.expected_resolution) {
        events.push({
          id: c.id,
          title: `[${c.priority.toUpperCase()}] ${c.title}`,
          start: new Date(c.created_at),
          end: new Date(c.expected_resolution),
          allDay: true,
          type: "complaint",
          data: c
        });
      }
    });
  }

  // Add Scheduled Maintenance
  if (maintenanceWindows) {
    maintenanceWindows.forEach((m) => {
      events.push({
        id: m.id,
        title: `🔧 ${m.title}`,
        start: new Date(m.start_time),
        end: new Date(m.end_time),
        allDay: false,
        type: "maintenance",
        data: m
      });
    });
  }

  const eventStyleGetter = (event: any) => {
    let backgroundColor = "#3b82f6"; // default blue
    
    if (event.type === "complaint") {
      if (event.data.priority === "critical") backgroundColor = "#ef4444";
      else if (event.data.priority === "high") backgroundColor = "#f97316";
      else if (event.data.priority === "medium") backgroundColor = "#eab308";
      else backgroundColor = "#22c55e";
    } else if (event.type === "maintenance") {
      backgroundColor = "#1F3F73"; // sapphire for maintenance
    }

    return {
      style: {
        backgroundColor,
        borderRadius: "4px",
        opacity: 0.8,
        color: "white",
        border: "0px",
        display: "block"
      }
    };
  };

  return (
    <div className="relative min-h-screen">
      <Navbar />
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4">
          <div className="mb-6">
            <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-2">
              <CalendarIcon className="w-8 h-8 text-primary" />
              SLA & Maintenance Calendar
            </h1>
            <p className="text-muted-foreground">Visualize complaint deadlines and scheduled maintenance</p>
          </div>

          <Card>
            <CardContent className="p-4 h-[700px]">
              <Calendar
                localizer={localizer}
                events={events}
                startAccessor="start"
                endAccessor="end"
                style={{ height: "100%" }}
                eventPropGetter={eventStyleGetter}
                onSelectEvent={(event) => setSelectedEvent(event)}
                views={['month', 'week', 'day']}
              />
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />

      <Dialog open={!!selectedEvent} onOpenChange={() => setSelectedEvent(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{selectedEvent?.title}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            {selectedEvent?.type === "complaint" ? (
              <>
                <p><strong>Status:</strong> <span className="uppercase">{selectedEvent.data.status}</span></p>
                <p><strong>Location:</strong> {selectedEvent.data.location}</p>
                <p><strong>Description:</strong> {selectedEvent.data.description}</p>
              </>
            ) : (
              <>
                <p><strong>Start:</strong> {selectedEvent && format(new Date(selectedEvent.start), "PPpp")}</p>
                <p><strong>End:</strong> {selectedEvent && format(new Date(selectedEvent.end), "PPpp")}</p>
                <p><strong>Description:</strong> {selectedEvent?.data.description}</p>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CalendarView;
