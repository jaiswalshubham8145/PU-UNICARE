import { Link, useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Menu, X, Shield, ChevronDown, LogOut, User, Settings, Package, Calendar, Sparkles, Search, Download } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/hooks/useAuth";
import { getPrimaryDashboard } from "@/utils/authUtils";
import NotificationBell from "@/components/notifications/NotificationBell";
import { ThemeToggle } from "@/components/ThemeToggle";
import { LanguageSwitcher } from "@/components/layout/LanguageSwitcher";
import { useI18n } from "@/hooks/useI18n";
import { useTourContext } from "@/components/tour/SiteTourContext";
import { usePWAInstall } from "@/hooks/usePWAInstall";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, roles, signOut, loading } = useAuth();
  const { t } = useI18n();
  const { openTour } = useTourContext();
  const { canInstall, promptInstall, isInstalled } = usePWAInstall();

  const navLinks = [
    { name: t('nav.home'), path: "/" },
    { name: t('nav.maintenance'), path: "/maintenance" },
    { name: t('nav.track'), path: "/track" },
    { name: t('nav.help'), path: "/help" },
    { name: t('nav.contact'), path: "/contact" },
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
    <nav className="fixed top-0 left-0 right-0 z-50 glass-panel border-b-0 rounded-2xl mx-3 lg:mx-6 mt-3 shadow-2xl dark:shadow-[0_8px_32px_rgba(0,0,0,0.5),0_0_30px_rgba(52,211,153,0.25)] backdrop-blur-md bg-background/80 supports-[backdrop-filter]:bg-background/40 border-white/20 dark:border-emerald-400/30">
      <div className="w-full max-w-[1500px] mx-auto px-3 sm:px-4 lg:px-6">
        <div className="flex items-center justify-between h-16 gap-3">
          {/* Logo */}
          <Link to="/" data-tour="navbar-brand" className="flex items-center gap-2.5 shrink-0 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#2ECC71] via-[#164340] to-[#1F3F73] flex items-center justify-center shadow-lg shadow-black/40 border border-emerald-400/50 group-hover:scale-105 group-hover:shadow-[0_0_25px_rgba(52,211,153,0.6)] transition-all duration-300">
              <Shield className="w-6 h-6 text-[#EDE3CC]" />
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-bold text-gradient-gold leading-none tracking-tight">UNICARE</span>
              <span className="text-[10px] text-muted-foreground font-bold tracking-widest uppercase">Parul University</span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div data-tour="navbar-links" className="hidden lg:flex items-center gap-1 xl:gap-2">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`px-3 py-1.5 rounded-full text-xs xl:text-sm font-semibold transition-all duration-200 whitespace-nowrap ${
                  isActive(link.path)
                    ? "bg-[#E0C88B]/15 text-[#E0C88B] border border-[#E0C88B]/40 shadow-[0_0_14px_rgba(224,200,139,0.25)] font-bold"
                    : "text-foreground/80 hover:text-white hover:bg-white/5 border border-transparent"
                }`}
              >
                {link.name}
              </Link>
            ))}
            {user && (
              <Link
                to={getDashboardLink()}
                className={`px-3 py-1.5 rounded-full text-xs xl:text-sm font-semibold transition-all duration-200 whitespace-nowrap ${
                  location.pathname.startsWith("/dashboard")
                    ? "bg-[#E0C88B]/15 text-[#E0C88B] border border-[#E0C88B]/40 shadow-[0_0_14px_rgba(224,200,139,0.25)] font-bold"
                    : "text-foreground/80 hover:text-white hover:bg-white/5 border border-transparent"
                }`}
              >
                Dashboard
              </Link>
            )}
          </div>

          {/* Right CTA & Utilities */}
          <div className="hidden lg:flex items-center gap-1.5 xl:gap-2 shrink-0">
            {/* Quick Command */}
            <button
              onClick={() => window.dispatchEvent(new CustomEvent('unicare:toggle-palette'))}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-xs font-semibold text-muted-foreground hover:text-[#E0C88B] bg-white/5 hover:bg-white/10 border border-white/15 hover:border-[#E0C88B]/40 transition-all shadow-sm group whitespace-nowrap"
              title="Quick Search & Actions (Ctrl+K or ⌘K)"
              aria-label="Open command palette"
            >
              <Search className="w-3.5 h-3.5 text-[#E0C88B] group-hover:scale-110 transition-transform" />
              <span className="hidden xl:inline text-[11px]">Command</span>
              <kbd className="text-[10px] bg-[#E0C88B]/15 text-[#E0C88B] px-1.5 py-0.5 rounded border border-[#E0C88B]/30 font-mono shadow-inner">⌘K</kbd>
            </button>

            {/* Tour */}
            <button
              onClick={openTour}
              data-tour="tour-btn"
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-full text-xs font-bold text-[#E0C88B] border border-[#E0C88B]/40 bg-[#E0C88B]/10 hover:bg-[#E0C88B]/20 hover:border-[#E0C88B]/70 shadow-[0_0_12px_rgba(224,200,139,0.2)] transition-all whitespace-nowrap"
              aria-label="Open site tour"
              title="Interactive Tour"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Tour</span>
            </button>

            {/* PWA Install Button */}
            {canInstall && !isInstalled && (
              <button
                onClick={() => promptInstall()}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-full text-xs font-bold text-emerald-400 border border-emerald-400/40 bg-emerald-400/10 hover:bg-emerald-400/20 hover:border-emerald-400/70 shadow-[0_0_12px_rgba(52,211,153,0.2)] transition-all whitespace-nowrap"
                aria-label="Install PU UNICARE App"
                title="Install PU UNICARE App on your device"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Install</span>
              </button>
            )}

            {/* Language */}
            <div data-tour="lang-switcher">
              <LanguageSwitcher />
            </div>

            {/* Theme */}
            <div data-tour="theme-toggle">
              <ThemeToggle />
            </div>

            {/* Divider */}
            <div className="h-5 w-[1px] bg-border/60 mx-0.5 shrink-0" />

            {!loading && (
              <>
                {user && <NotificationBell userId={user.id} />}

                {user ? (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-9 px-2 gap-1.5 rounded-full hover:bg-accent/10 text-foreground hover:text-primary border border-transparent hover:border-border/50 transition-all shrink-0"
                        aria-label="User menu"
                      >
                        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#E0C88B]/30 to-emerald-400/20 flex items-center justify-center border border-[#E0C88B]/40 shadow-inner">
                          <User className="w-4 h-4 text-[#E0C88B]" />
                        </div>
                        <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-60 glass-panel border-border text-foreground bg-background/95 backdrop-blur-xl p-1.5">
                      <div className="px-3 py-2 border-b border-border/50 mb-1">
                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Signed in as</p>
                        <p className="text-xs font-semibold text-foreground truncate">{user.email}</p>
                      </div>
                      <DropdownMenuItem asChild className="focus:bg-accent/10 focus:text-primary cursor-pointer rounded-lg">
                        <Link to={getDashboardLink()}>
                          {t('nav.dashboard')}
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild className="focus:bg-accent/10 focus:text-primary cursor-pointer rounded-lg">
                        <Link to="/profile">
                          <User className="w-4 h-4 mr-2" />
                          {t('nav.profile')}
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild className="focus:bg-accent/10 focus:text-primary cursor-pointer rounded-lg">
                        <Link to="/dashboard/inventory">
                          <Package className="w-4 h-4 mr-2" />
                          Inventory
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild className="focus:bg-accent/10 focus:text-primary cursor-pointer rounded-lg">
                        <Link to="/dashboard/calendar">
                          <Calendar className="w-4 h-4 mr-2" />
                          Calendar
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild className="focus:bg-accent/10 focus:text-primary cursor-pointer rounded-lg">
                        <Link to="/settings">
                          <Settings className="w-4 h-4 mr-2" />
                          {t('nav.settings')}
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator className="bg-border my-1" />
                      <DropdownMenuItem
                        onClick={handleSignOut}
                        className="text-destructive cursor-pointer focus:bg-destructive/10 focus:text-destructive rounded-lg"
                      >
                        <LogOut className="w-4 h-4 mr-2" />
                        {t('nav.logout')}
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                ) : (
                  <Button variant="ghost" size="sm" asChild className="text-xs font-bold text-foreground hover:text-[#E0C88B] hover:bg-white/5 rounded-full h-8 px-3">
                    <Link to="/login">{t('nav.login')}</Link>
                  </Button>
                )}

                {/* CTA Report Issue Button */}
                <Button
                  data-tour="nav-cta-report"
                  asChild
                  size="sm"
                  className="bg-gradient-to-r from-[#C2A05A] via-[#E0C88B] to-[#C2A05A] hover:from-[#d2ba7a] hover:via-[#f5e6b8] hover:to-[#d2ba7a] text-[#060F10] border-none shadow-[0_0_20px_rgba(224,200,139,0.45)] hover:shadow-[0_0_30px_rgba(224,200,139,0.7)] transition-all rounded-full px-4 xl:px-5 h-9 font-extrabold text-xs whitespace-nowrap shrink-0"
                >
                  <Link to="/register-complaint">{t('home.hero.cta')}</Link>
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
                  {t('nav.dashboard')}
                </Link>
              )}
              <div className="flex flex-col gap-2 mt-4 px-4">
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsOpen(false);
                    window.dispatchEvent(new CustomEvent('unicare:toggle-palette'));
                  }}
                  className="justify-start gap-2 border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/10 font-semibold"
                >
                  <Search className="w-4 h-4 text-emerald-400" />
                  Quick Command (⌘K)
                </Button>
                <Button
                  variant="outline"
                  onClick={() => { setIsOpen(false); openTour(); }}
                  className="justify-start gap-2 border-primary/30 text-primary hover:bg-primary/10 font-semibold"
                >
                  <Sparkles className="w-4 h-4" />
                  Site Tour
                </Button>
                {canInstall && !isInstalled && (
                  <Button
                    variant="outline"
                    onClick={() => {
                      setIsOpen(false);
                      promptInstall();
                    }}
                    className="justify-start gap-2 border-emerald-400/40 text-emerald-400 hover:bg-emerald-400/10 font-bold"
                  >
                    <Download className="w-4 h-4" />
                    Install App (PWA)
                  </Button>
                )}
                {!loading && (
                  <>
                    {user ? (
                      <Button variant="outline" onClick={handleSignOut} className="justify-start border-border text-foreground hover:bg-destructive/10 hover:text-destructive hover:border-destructive/50">
                        <LogOut className="w-4 h-4 mr-2" />
                        {t('nav.logout')}
                      </Button>
                    ) : (
                      <Button variant="outline" asChild className="justify-start border-border text-foreground hover:bg-accent/10">
                        <Link to="/login" onClick={() => setIsOpen(false)}>
                          {t('nav.login')}
                        </Link>
                      </Button>
                    )}
                    <Button asChild className="justify-start bg-primary text-primary-foreground hover:bg-primary/90">
                      <Link to="/register-complaint" onClick={() => setIsOpen(false)}>
                        {t('home.hero.cta')}
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
