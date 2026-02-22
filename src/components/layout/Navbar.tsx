import { Link, useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Menu, X, Shield, ChevronDown, LogOut, User, Settings } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth, getPrimaryDashboard } from "@/hooks/useAuth";
import NotificationBell from "@/components/notifications/NotificationBell";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, roles, signOut, loading } = useAuth();

  const navLinks = [
    { name: "Home", path: "/" },
    { name: "About", path: "/about" },
    { name: "Maintenance", path: "/maintenance" },
    { name: "Track Complaint", path: "/track" },
    { name: "Help", path: "/help" },
    { name: "Contact", path: "/contact" },
  ];

  const isActive = (path: string) => location.pathname === path;

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  const getDashboardLink = () => {
    if (roles.length === 0) return "/dashboard/faculty";
    return getPrimaryDashboard(roles);
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass-panel border-b-0 rounded-2xl mx-4 mt-4 shadow-2xl backdrop-blur-md bg-background/60 supports-[backdrop-filter]:bg-background/20">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 via-purple-500 to-violet-600 flex items-center justify-center shadow-lg shadow-violet-500/25 group-hover:scale-105 group-hover:shadow-violet-500/40 transition-all duration-300">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-bold text-gradient-gold leading-none tracking-tight">UNICARE</span>
              <span className="text-[10px] text-muted-foreground font-bold tracking-widest uppercase">Parul University</span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`text-sm font-extrabold transition-all duration-300 hover:text-amber-400 drop-shadow-sm ${isActive(link.path) ? "text-amber-400 border-b-2 border-amber-400" : "text-foreground"
                  }`}
              >
                {link.name}
              </Link>
            ))}
            {user && (
              <Link
                to={getDashboardLink()}
                className={`text-sm font-extrabold transition-all duration-300 hover:text-amber-400 drop-shadow-sm ${location.pathname.startsWith("/dashboard") ? "text-amber-400 border-b-2 border-amber-400" : "text-foreground"
                  }`}
              >
                Dashboard
              </Link>
            )}
          </div>

          {/* CTA Buttons */}
          <div className="hidden lg:flex items-center gap-4">
            {!loading && (
              <>
                {user && <NotificationBell userId={user.id} />}
                {user ? (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="gap-2 text-foreground hover:bg-accent/10 hover:text-primary">
                        <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center border border-border">
                          <User className="w-4 h-4 text-foreground" />
                        </div>
                        <span className="max-w-[100px] truncate font-semibold">
                          {user.email?.split("@")[0]}
                        </span>
                        <ChevronDown className="w-4 h-4 text-muted-foreground" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56 glass-panel border-border text-foreground bg-background/95">
                      <DropdownMenuItem asChild className="focus:bg-accent/10 focus:text-primary cursor-pointer">
                        <Link to={getDashboardLink()}>
                          Dashboard
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild className="focus:bg-accent/10 focus:text-primary cursor-pointer">
                        <Link to="/profile">
                          <User className="w-4 h-4 mr-2" />
                          Profile
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild className="focus:bg-accent/10 focus:text-primary cursor-pointer">
                        <Link to="/settings">
                          <Settings className="w-4 h-4 mr-2" />
                          Settings
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator className="bg-border" />
                      <DropdownMenuItem
                        onClick={handleSignOut}
                        className="text-destructive cursor-pointer focus:bg-destructive/10 focus:text-destructive"
                      >
                        <LogOut className="w-4 h-4 mr-2" />
                        Sign Out
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                ) : (
                  <Button variant="ghost" asChild className="text-foreground font-semibold hover:text-primary hover:bg-accent/10">
                    <Link to="/login">Login</Link>
                  </Button>
                )}
                <Button asChild className="bg-primary hover:bg-primary/90 text-primary-foreground border-none shadow-lg hover:shadow-primary/30 transition-all rounded-full px-6 font-bold">
                  <Link to="/register-complaint">Report Issue</Link>
                </Button>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="lg:hidden p-2 rounded-md hover:bg-accent/10 text-foreground transition-colors"
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="lg:hidden py-4 border-t border-border mt-2 bg-background/95 backdrop-blur-xl rounded-b-xl px-4 shadow-xl">
            <div className="flex flex-col gap-4">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setIsOpen(false)}
                  className={`px-4 py-2 rounded-md text-sm font-bold hover:bg-accent/10 transition-colors ${isActive(link.path) ? "bg-accent/10 text-primary" : "text-muted-foreground"
                    }`}
                >
                  {link.name}
                </Link>
              ))}
              {user && (
                <Link
                  to={getDashboardLink()}
                  onClick={() => setIsOpen(false)}
                  className="px-4 py-2 rounded-md text-sm font-bold text-muted-foreground hover:bg-accent/10 transition-colors"
                >
                  Dashboard
                </Link>
              )}
              <div className="flex flex-col gap-2 mt-4 px-4">
                {!loading && (
                  <>
                    {user ? (
                      <Button variant="outline" onClick={handleSignOut} className="justify-start border-border text-foreground hover:bg-destructive/10 hover:text-destructive hover:border-destructive/50">
                        <LogOut className="w-4 h-4 mr-2" />
                        Sign Out
                      </Button>
                    ) : (
                      <Button variant="outline" asChild className="justify-start border-border text-foreground hover:bg-accent/10">
                        <Link to="/login" onClick={() => setIsOpen(false)}>
                          Login
                        </Link>
                      </Button>
                    )}
                    <Button asChild className="justify-start bg-primary text-primary-foreground hover:bg-primary/90">
                      <Link to="/register-complaint" onClick={() => setIsOpen(false)}>
                        Report Issue
                      </Link>
                    </Button>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
