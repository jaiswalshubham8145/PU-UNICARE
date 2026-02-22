import { useLocation } from "react-router-dom";
import video1 from "@/assets/Infrastructure.mp4";
import video2 from "@/assets/back ground-1.mp4";
import video3 from "@/assets/back ground-2.mp4";

const BackgroundVideo = () => {
    const location = useLocation();
    const path = location.pathname;

    let currentVideo = video1; // Default to Infrastructure.mp4

    if (path === "/" || path === "/about" || path === "/contact") {
        currentVideo = video1;
    } else if (path === "/login" || path === "/register" || path === "/forgot-password" || path === "/reset-password") {
        currentVideo = video2; // back ground-1.mp4
    } else if (path.startsWith("/dashboard")) {
        currentVideo = video3; // back ground-2.mp4
    }

    return (
        <div className="fixed inset-0 -z-50 pointer-events-none overflow-hidden h-screen w-screen">
            <video
                key={currentVideo} // Key forces re-render when source changes
                autoPlay
                muted
                loop
                playsInline
                className="absolute top-0 left-0 w-full h-full object-cover opacity-100 transition-opacity duration-1000"
            >
                <source src={currentVideo} type="video/mp4" />
            </video>
            {/* Overlay to ensure text readability */}
            <div className="absolute inset-0 bg-white/30 dark:bg-black/70 backdrop-blur-[2px] transition-colors duration-500" />
        </div>
    );
};

export default BackgroundVideo;
