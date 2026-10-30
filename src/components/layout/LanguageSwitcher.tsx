import { useI18n, type Language } from "@/hooks/useI18n";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Languages } from "lucide-react";

export const LanguageSwitcher = () => {
  const { language, setLanguage } = useI18n();

  const languages: { code: Language; label: string }[] = [
    { code: "en", label: "English" },
    { code: "hi", label: "हिंदी (Hindi)" },
    { code: "gu", label: "ગુજરાતી (Gujarati)" },
  ];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="h-9 w-9 text-foreground/80 hover:text-[#E0C88B] hover:bg-white/5 transition-colors" title="Switch Language">
          <Languages className="h-5 w-5" />
          <span className="sr-only">Toggle language</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="glass-panel-dark border-white/10 dark:border-[#E0C88B]/25 min-w-[170px] p-1.5 shadow-2xl backdrop-blur-2xl">
        {languages.map((lang) => (
          <DropdownMenuItem
            key={lang.code}
            onClick={() => setLanguage(lang.code)}
            className={`cursor-pointer rounded-lg px-3 py-2 text-sm transition-all duration-200 ${
              language === lang.code
                ? "bg-[#E0C88B]/20 text-[#E0C88B] font-semibold border border-[#E0C88B]/30 shadow-[0_0_15px_rgba(224,200,139,0.15)]"
                : "text-foreground/80 hover:text-foreground hover:bg-white/10"
            }`}
          >
            {lang.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
