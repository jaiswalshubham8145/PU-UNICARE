import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { ExternalLink } from "lucide-react";
import type { TourStep } from "./tourData";

interface TourStepCardProps {
  step: TourStep;
  onClose: () => void;
}

const TourStepCard = ({ step, onClose }: TourStepCardProps) => {
  const navigate = useNavigate();
  const IconComponent = step.icon;

  const handleNavigate = (path: string) => {
    onClose();
    if (path === "#ai-chat") {
      window.dispatchEvent(new CustomEvent("unicare:open-ai-chat"));
    } else if (path === "#voice-complaint" || path.includes("action=voice-complaint")) {
      window.dispatchEvent(new CustomEvent("unicare:open-voice-assistant"));
    } else if (!path.startsWith("#")) {
      navigate(path);
    }
  };

  return (
    <motion.div
      key={step.id}
      initial={{ opacity: 0, x: 40 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -40 }}
      transition={{ duration: 0.35, ease: [0.4, 0, 0.2, 1] }}
      className="flex flex-col gap-5"
    >
      {/* Step Header */}
      <div className="flex items-start gap-4">
        <div
          className={`flex-shrink-0 w-14 h-14 rounded-2xl bg-gradient-to-br ${step.accentColor} flex items-center justify-center shadow-lg shadow-black/30`}
        >
          <IconComponent className="w-7 h-7 text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-xl font-bold text-foreground leading-tight">
            {step.title}
          </h3>
          <p className="text-sm text-primary/80 font-semibold mt-0.5">
            {step.subtitle}
          </p>
        </div>
      </div>

      {/* Description */}
      <p className="text-sm text-muted-foreground leading-relaxed">
        {step.description}
      </p>

      {/* Highlight List */}
      <ul className="space-y-2">
        {step.highlights.map((highlight, i) => (
          <motion.li
            key={i}
            initial={{ opacity: 0, x: 12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.08 * i, duration: 0.25 }}
            className="flex items-start gap-2.5 text-sm text-foreground/90"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0" />
            <span>{highlight}</span>
          </motion.li>
        ))}
      </ul>

      {/* Action Links */}
      {step.links && step.links.length > 0 && (
        <div className="flex flex-wrap gap-2 pt-1">
          {step.links.map((link) => (
            <Button
              key={link.path}
              variant="outline"
              size="sm"
              onClick={() => handleNavigate(link.path)}
              className="gap-1.5 text-xs font-semibold border-primary/30 text-primary hover:bg-primary/10 hover:border-primary/50 transition-all"
            >
              <ExternalLink className="w-3 h-3" />
              {link.label}
            </Button>
          ))}
        </div>
      )}
    </motion.div>
  );
};

export default TourStepCard;
