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
                preload="metadata"
                className="absolute top-0 left-0 w-full h-full object-cover opacity-100 transition-opacity duration-1000"
            >
                <source src={currentVideo} type="video/mp4" />
            </video>
            {/* Overlay to ensure text readability + rich radiant dark mode ambient glows */}
            <div className="absolute inset-0 bg-[#F6F0E1]/50 dark:bg-[#060F10]/88 transition-colors duration-500" />
            <div className="absolute inset-0 dark:bg-[radial-gradient(circle_at_50%_0%,rgba(52,211,153,0.18),transparent_55%),radial-gradient(circle_at_85%_55%,rgba(224,200,139,0.12),transparent_45%),radial-gradient(circle_at_15%_75%,rgba(52,211,153,0.15),transparent_50%)] pointer-events-none transition-opacity duration-500" />
        </div>
    );
};

export default BackgroundVideo;
