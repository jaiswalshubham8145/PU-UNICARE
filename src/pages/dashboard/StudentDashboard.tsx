import Navbar from "@/components/layout/Navbar";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

const StudentDashboard = () => {
    return (
        <div className="min-h-screen">
            <Navbar />
            <div className="container mx-auto px-4 py-24 relative z-10">
                <div className="mb-12 text-center">
                    <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 drop-shadow-md">
                        Student <span className="text-gradient-gold">Dashboard</span>
                    </h1>
                    <p className="text-slate-300 text-lg luxury-border-bottom pb-4 inline-block">Welcome to your premium maintenance portal</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
                    <div className="glass-panel p-8 rounded-3xl card-hover-effect group">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-xl font-bold text-white group-hover:text-amber-400 transition-colors">My Complaints</h3>
                            <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center border border-white/10 group-hover:border-amber-400/50 transition-colors">
                                <span className="w-2 h-2 rounded-full bg-blue-400 shadow-[0_0_10px_rgba(96,165,250,0.8)]"></span>
                            </div>
                        </div>
                        <p className="text-5xl font-bold text-white mb-2">0</p>
                        <p className="text-sm text-slate-400">Total submitted</p>
                    </div>

                    <div className="glass-panel p-8 rounded-3xl card-hover-effect group">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-xl font-bold text-white group-hover:text-amber-400 transition-colors">In Progress</h3>
                            <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center border border-white/10 group-hover:border-amber-400/50 transition-colors">
                                <span className="w-2 h-2 rounded-full bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.8)]"></span>
                            </div>
                        </div>
                        <p className="text-5xl font-bold text-white mb-2">0</p>
                        <p className="text-sm text-slate-400">Currently active</p>
                    </div>

                    <div className="glass-panel p-8 rounded-3xl card-hover-effect group">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-xl font-bold text-white group-hover:text-amber-400 transition-colors">Resolved</h3>
                            <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center border border-white/10 group-hover:border-amber-400/50 transition-colors">
                                <span className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.8)]"></span>
                            </div>
                        </div>
                        <p className="text-5xl font-bold text-white mb-2">0</p>
                        <p className="text-sm text-slate-400">Successfully closed</p>
                    </div>
                </div>

                <div className="glass-panel-dark p-8 rounded-3xl border-white/10">
                    <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                        <span className="w-1 h-8 bg-amber-400 rounded-full shadow-[0_0_15px_rgba(245,158,11,0.8)]"></span>
                        Recent Activity
                    </h2>
                    <div className="text-center py-16">
                        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-white/5 border border-white/10 flex items-center justify-center">
                            <div className="w-2 h-2 bg-slate-500 rounded-full animate-pulse"></div>
                        </div>
                        <p className="text-slate-400 text-lg">No recent activity found on your account.</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StudentDashboard;
