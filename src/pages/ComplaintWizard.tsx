import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft, CheckCircle2 } from "lucide-react";
import Navbar from "@/components/layout/Navbar";

const ComplaintWizard = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-secondary/30 relative">
            <Navbar />
            <div className="container mx-auto px-4 py-24">
                <Button
                    variant="ghost"
                    onClick={() => navigate(-1)}
                    className="mb-6 hover:bg-white/50"
                >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back
                </Button>

                <div className="bg-white border border-slate-200 shadow-sm max-w-2xl mx-auto p-8 rounded-xl text-center">
                    <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                        <CheckCircle2 className="w-8 h-8 text-primary" />
                    </div>
                    <h1 className="text-3xl font-bold text-slate-900 mb-4">Complaint Wizard</h1>
                    <p className="text-slate-600 mb-8">This feature is coming soon. The wizard will guide you through a step-by-step complaint registration process.</p>

                    <Button onClick={() => navigate('/register-complaint')} className="w-full">
                        Go to Standard Form
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default ComplaintWizard;
