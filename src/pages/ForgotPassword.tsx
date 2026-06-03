import { useState } from "react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Link } from "react-router-dom";
import { Mail, ArrowLeft, CheckCircle, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { isUniversityEmail, getUniversityEmailError } from "@/lib/emailValidation";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate university email domain
    if (!isUniversityEmail(email)) {
      toast.error(getUniversityEmailError());
      return;
    }

    setIsLoading(true);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) throw error;

      setIsSuccess(true);
      toast.success("Password reset email sent");
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Failed to send reset email";
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen noise-texture">
      <Navbar />
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4">
          <div className="max-w-md mx-auto">
            <div className="glass-panel-content p-8 rounded-xl">
              {isSuccess ? (
                <div className="text-center">
                  <div className="w-16 h-16 rounded-full bg-success/10 mx-auto flex items-center justify-center mb-4">
                    <CheckCircle className="w-8 h-8 text-success" />
                  </div>
                  <h1 className="text-2xl font-bold text-foreground mb-2">Check Your Email</h1>
                  <p className="text-muted-foreground mb-6">
                    We've sent a password reset link to <strong>{email}</strong>. Click the link in the email to reset your password.
                  </p>
                  <Button variant="outline" asChild className="w-full">
                    <Link to="/login">
                      <ArrowLeft className="w-4 h-4 mr-2" />
                      Back to Login
                    </Link>
                  </Button>
                </div>
              ) : (
                <>
                  <div className="text-center mb-8">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-accent mx-auto flex items-center justify-center mb-4 shadow-lg">
                      <Mail className="w-8 h-8 text-accent-foreground" />
                    </div>
                    <h1 className="text-2xl font-bold text-foreground mb-2">Forgot Password?</h1>
                    <p className="text-muted-foreground text-sm">
                      Enter your email address and we'll send you a link to reset your password.
                    </p>
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                      <Label className="flex items-center gap-2 mb-2">
                        <Mail className="w-4 h-4 text-accent" />
                        Email Address
                      </Label>
                      <Input
                        type="email"
                        placeholder="your.email@paruluniversity.ac.in"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                      />
                    </div>

                    <Button
                      type="submit"
                      variant="accent"
                      className="w-full"
                      size="lg"
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Sending...
                        </>
                      ) : (
                        "Send Reset Link"
                      )}
                    </Button>
                  </form>

                  <div className="text-center mt-6">
                    <Link to="/login" className="text-accent hover:underline text-sm inline-flex items-center gap-1">
                      <ArrowLeft className="w-4 h-4" />
                      Back to Login
                    </Link>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ForgotPassword;