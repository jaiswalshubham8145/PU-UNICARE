import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Search, ExternalLink, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  sitePages,
  pageCategoryLabels,
  type PageCategory,
  type SitePage,
} from "./tourData";

interface TourPageDirectoryProps {
  onClose: () => void;
}

const TourPageDirectory = ({ onClose }: TourPageDirectoryProps) => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<PageCategory | "all">("all");

  const categories = Object.entries(pageCategoryLabels) as [PageCategory, { label: string; emoji: string }][];

  const filteredPages = useMemo(() => {
    return sitePages.filter((page) => {
      const matchesCategory =
        activeCategory === "all" || page.category === activeCategory;
      const matchesSearch =
        searchQuery.trim() === "" ||
        page.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        page.description.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [activeCategory, searchQuery]);

  // Group filtered pages by category
  const groupedPages = useMemo(() => {
    const groups: Record<PageCategory, SitePage[]> = {
      public: [],
      reporting: [],
      dashboards: [],
      facilities: [],
      system: [],
    };
    filteredPages.forEach((page) => {
      groups[page.category].push(page);
    });
    return groups;
  }, [filteredPages]);

  const handleNavigate = (path: string) => {
    onClose();
    if (path === "#ai-chat") {
      window.dispatchEvent(new CustomEvent("unicare:open-ai-chat"));
    } else if (path === "#voice-complaint" || path.includes("action=voice-complaint")) {
      navigate("/");
      setTimeout(() => {
        window.dispatchEvent(new CustomEvent("unicare:open-voice-assistant"));
      }, 150);
    } else if (!path.startsWith("#")) {
      navigate(path);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search pages..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 bg-background/50 border-border/50 focus:border-primary/50 h-9 text-sm"
          />
        </div>
      </div>

      {/* Category Filter Pills */}
      <div className="flex flex-wrap gap-1.5">
        <button
          onClick={() => setActiveCategory("all")}
          className={`px-3 py-1 rounded-full text-xs font-semibold transition-all ${activeCategory === "all"
              ? "bg-primary text-primary-foreground shadow-[0_0_12px_rgba(52,211,153,0.4)]"
              : "bg-accent/10 text-muted-foreground hover:bg-accent/20"
            }`}
        >
          All Pages
        </button>
        {categories.map(([key, { label, emoji }]) => (
          <button
            key={key}
            onClick={() => setActiveCategory(key)}
            className={`px-3 py-1 rounded-full text-xs font-semibold transition-all ${activeCategory === key
                ? "bg-primary text-primary-foreground shadow-[0_0_12px_rgba(52,211,153,0.4)]"
                : "bg-accent/10 text-muted-foreground hover:bg-accent/20"
              }`}
          >
            {emoji} {label}
          </button>
        ))}
      </div>

      {/* Page Directory Grid */}
      <ScrollArea className="h-[340px] sm:h-[380px] pr-3">
        <div className="space-y-5">
          {(Object.entries(groupedPages) as [PageCategory, SitePage[]][])
            .filter(([, pages]) => pages.length > 0)
            .map(([category, pages]) => (
              <div key={category}>
                <h4 className="text-xs font-bold text-primary/70 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
                  <span>{pageCategoryLabels[category].emoji}</span>
                  {pageCategoryLabels[category].label}
                  <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                    {pages.length}
                  </Badge>
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {pages.map((page, i) => {
                    const PageIcon = page.icon;
                    return (
                      <motion.button
                        key={page.path}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.03, duration: 0.2 }}
                        onClick={() => handleNavigate(page.path)}
                        className="group flex items-start gap-3 p-3 rounded-xl border border-border/40 bg-card/30 hover:bg-primary/5 hover:border-primary/30 transition-all text-left cursor-pointer"
                      >
                        <div className="flex-shrink-0 w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                          <PageIcon className="w-4.5 h-4.5 text-primary/70 group-hover:text-primary transition-colors" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className="text-sm font-semibold text-foreground truncate">
                              {page.name}
                            </span>
                            {page.requiresAuth && (
                              <Lock className="w-3 h-3 text-muted-foreground/50 flex-shrink-0" />
                            )}
                            {!page.path.startsWith("#") && (
                              <ExternalLink className="w-3 h-3 text-muted-foreground/30 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
                            )}
                          </div>
                          <p className="text-[11px] text-muted-foreground leading-snug mt-0.5 line-clamp-2">
                            {page.description}
                          </p>
                        </div>
                      </motion.button>
                    );
                  })}
                </div>
              </div>
            ))}

          {filteredPages.length === 0 && (
            <div className="text-center py-12">
              <Search className="w-8 h-8 text-muted-foreground/30 mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">
                No pages match "{searchQuery}"
              </p>
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
};

export default TourPageDirectory;
