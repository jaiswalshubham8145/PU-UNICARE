import { useEffect, useRef, useState } from "react";
import { Html5Qrcode, CameraDevice } from "html5-qrcode";
import { Button } from "@/components/ui/button";
import { X, Camera, RefreshCw } from "lucide-react";
import { toast } from "sonner";

interface QRScannerProps {
  onScanSuccess: (decodedText: string) => void;
  onClose: () => void;
}

export const QRScanner = ({ onScanSuccess, onClose }: QRScannerProps) => {
  const [cameras, setCameras] = useState<CameraDevice[]>([]);
  const [activeCameraId, setActiveCameraId] = useState<string>("");
  const [isScanning, setIsScanning] = useState(false);
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const qrRegionId = "qr-reader-element";

  useEffect(() => {
    // Initialize html5-qrcode and list cameras
    Html5Qrcode.getCameras()
      .then((devices) => {
        if (devices && devices.length > 0) {
          setCameras(devices);
          // Prefer back camera by default
          const backCamera = devices.find((device) =>
            device.label.toLowerCase().includes("back") ||
            device.label.toLowerCase().includes("environment")
          );
          setActiveCameraId(backCamera ? backCamera.id : devices[0].id);
        } else {
          toast.error("No cameras found on your device");
        }
      })
      .catch((err) => {
        console.error("Error getting cameras", err);
        toast.error("Camera permissions are required to scan QR codes");
      });

    return () => {
      stopScanning();
    };
  }, []);

  const startScanning = async (cameraId: string) => {
    if (!cameraId) return;
    
    // Stop any active scans first
    await stopScanning();

    const html5QrCode = new Html5Qrcode(qrRegionId);
    scannerRef.current = html5QrCode;

    setIsScanning(true);
    html5QrCode
      .start(
        cameraId,
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
        },
        (decodedText) => {
          stopScanning();
          onScanSuccess(decodedText);
        },
        (errorMessage) => {
          // Silent failure for matching frames
        }
      )
      .catch((err) => {
        console.error("Start scanning failed", err);
        setIsScanning(false);
        toast.error("Failed to start camera. Please verify permissions.");
      });
  };

  const stopScanning = async () => {
    if (scannerRef.current && scannerRef.current.isScanning) {
      try {
        await scannerRef.current.stop();
      } catch (err) {
        console.error("Stop scanning failed", err);
      }
    }
    setIsScanning(false);
  };

  useEffect(() => {
    if (activeCameraId) {
      startScanning(activeCameraId);
    }
  }, [activeCameraId]);

  const switchCamera = () => {
    if (cameras.length <= 1) return;
    const currentIndex = cameras.findIndex((c) => c.id === activeCameraId);
    const nextIndex = (currentIndex + 1) % cameras.length;
    setActiveCameraId(cameras[nextIndex].id);
  };

  return (
    <div className="flex flex-col items-center justify-center p-4 bg-background border rounded-2xl max-w-sm mx-auto shadow-xl relative overflow-hidden">
      <Button
        variant="ghost"
        size="icon"
        className="absolute top-2 right-2 z-10"
        onClick={() => {
          stopScanning();
          onClose();
        }}
      >
        <X className="w-5 h-5" />
      </Button>

      <div className="flex items-center gap-2 mb-4">
        <Camera className="w-5 h-5 text-accent animate-pulse" />
        <h3 className="font-semibold text-lg">Scan Asset QR Code</h3>
      </div>

      <div
        id={qrRegionId}
        className="w-full aspect-square max-w-[280px] bg-slate-950 rounded-xl overflow-hidden border-2 border-dashed border-accent/40"
      />

      <div className="flex gap-4 mt-6 w-full">
        {cameras.length > 1 && (
          <Button
            type="button"
            variant="outline"
            className="flex-1 flex items-center justify-center gap-2"
            onClick={switchCamera}
          >
            <RefreshCw className="w-4 h-4" />
            Switch Camera
          </Button>
        )}
        <Button
          type="button"
          variant="destructive"
          className="flex-1"
          onClick={() => {
            stopScanning();
            onClose();
          }}
        >
          Cancel
        </Button>
      </div>
    </div>
  );
};
