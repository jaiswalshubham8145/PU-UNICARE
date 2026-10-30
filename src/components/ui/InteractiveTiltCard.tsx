import React, { useState, useRef, useCallback } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { cn } from "@/lib/utils";

interface InteractiveTiltCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  maxTilt?: number;
  scaleOnHover?: number;
  glowColor?: string;
  enableTilt?: boolean;
}

export function InteractiveTiltCard({
  children,
  className,
  maxTilt = 8,
  scaleOnHover = 1.02,
  glowColor = "rgba(52, 211, 153, 0.22)",
  enableTilt = true,
  ...props
}: InteractiveTiltCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  // Spring physics for smooth tilt
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const mouseXSpring = useSpring(x, { stiffness: 280, damping: 25 });
  const mouseYSpring = useSpring(y, { stiffness: 280, damping: 25 });

  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], [maxTilt, -maxTilt]);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], [-maxTilt, maxTilt]);

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!cardRef.current) return;
      const rect = cardRef.current.getBoundingClientRect();

      const clientX = e.clientX - rect.left;
      const clientY = e.clientY - rect.top;

      setMousePos({ x: clientX, y: clientY });

      if (enableTilt) {
        const xPct = clientX / rect.width - 0.5;
        const yPct = clientY / rect.height - 0.5;
        x.set(xPct);
        y.set(yPct);
      }
    },
    [enableTilt, x, y]
  );

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      whileHover={scaleOnHover ? { scale: scaleOnHover } : undefined}
      transition={{ type: "spring", stiffness: 350, damping: 25 }}
      style={{
        rotateX: enableTilt ? rotateX : 0,
        rotateY: enableTilt ? rotateY : 0,
        transformPerspective: 1000,
        WebkitFontSmoothing: "antialiased",
      }}
      className={cn(
        "relative rounded-3xl transition-shadow duration-300 overflow-hidden",
        className
      )}
      {...(props as any)}
    >
      {/* Radial Cursor Spotlight Layer */}
      <div
        className="pointer-events-none absolute -inset-px rounded-3xl opacity-0 transition-opacity duration-300"
        style={{
          opacity: isHovered ? 1 : 0,
          background: `radial-gradient(400px circle at ${mousePos.x}px ${mousePos.y}px, ${glowColor}, transparent 75%)`,
        }}
      />

      {/* Card Content with Crisp Vector Rendering */}
      <div className="relative z-10 w-full h-full [backface-visibility:hidden]">{children}</div>
    </motion.div>
  );
}

export default InteractiveTiltCard;
