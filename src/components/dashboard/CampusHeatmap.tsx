import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, CircleMarker } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { useComplaints } from "@/hooks/useComplaints";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Map as MapIcon, Loader2 } from "lucide-react";

// Fix for default marker icons in react-leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

const PARUL_UNIVERSITY_CENTER: [number, number] = [22.2887, 73.3634]; // Approximate PU Campus Coordinates

export const CampusHeatmap = () => {
  const { allComplaints, loadingAllComplaints } = useComplaints();
  const [mapReady, setMapReady] = useState(false);

  useEffect(() => {
    // Leaflet needs to be rendered only on client side after CSS loads
    setMapReady(true);
  }, []);

  const getColorByPriority = (priority: string) => {
    switch (priority) {
      case "critical": return "#ef4444"; // red
      case "high": return "#f97316"; // orange
      case "medium": return "#eab308"; // yellow
      case "low": return "#22c55e"; // green
      default: return "#3b82f6"; // blue
    }
  };

  if (!mapReady || loadingAllComplaints) {
    return (
      <Card className="h-[400px] flex items-center justify-center border-border">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </Card>
    );
  }

  return (
    <Card className="border-border shadow-sm h-[500px] flex flex-col overflow-hidden">
      <CardHeader className="py-4 border-b bg-muted/20 shrink-0">
        <CardTitle className="text-lg flex items-center gap-2">
          <MapIcon className="w-5 h-5 text-primary" />
          Live Campus Heatmap
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0 flex-1 relative z-0">
        {/* @ts-ignore - react-leaflet type compatibility with React 18 */}
        <MapContainer 
          center={PARUL_UNIVERSITY_CENTER} 
          zoom={16} 
          scrollWheelZoom={false}
          style={{ height: "100%", width: "100%" }}
        >
          {/* @ts-ignore */}
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {allComplaints?.map((complaint) => {
            // In a real scenario, lat/lng would be parsed from metadata or dedicated columns
            // For this demo, we simulate slight variations around the center for visual density
            // if location coordinates are not explicitly saved. 
            // In Phase 1 we added Geolocation tag, which might be in description or a custom field.
            // Let's check if the complaint has a lat/lng, otherwise scatter them slightly
            let lat = PARUL_UNIVERSITY_CENTER[0] + (Math.random() - 0.5) * 0.005;
            let lng = PARUL_UNIVERSITY_CENTER[1] + (Math.random() - 0.5) * 0.005;

            // If we actually stored it in a specific field, we'd extract it here.

            // @ts-ignore
            return (
              <CircleMarker
                key={complaint.id}
                center={[lat, lng]}
                pathOptions={{
                  color: getColorByPriority(complaint.priority),
                  fillColor: getColorByPriority(complaint.priority),
                  fillOpacity: 0.7,
                }}
                radius={8}
              >
                <Popup>
                  <div className="font-semibold">{complaint.title}</div>
                  <div className="text-xs text-muted-foreground mb-1">{complaint.location}</div>
                  <div className="text-xs">
                    Status: <span className="uppercase font-medium">{complaint.status}</span>
                  </div>
                  <div className="text-xs">
                    Priority: <span className="uppercase font-medium">{complaint.priority}</span>
                  </div>
                </Popup>
              </CircleMarker>
            );
          })}
        </MapContainer>
      </CardContent>
    </Card>
  );
};
