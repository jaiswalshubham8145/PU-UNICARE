import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-heading font-semibold ring-offset-background transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-gradient-primary text-white hover:shadow-lg hover:shadow-primary/25 hover:scale-105",
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90 shadow-md hover:shadow-destructive/25",
        outline: "border-2 border-border bg-card/50 backdrop-blur-xl text-foreground hover:bg-secondary/80 hover:shadow-md",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80 hover:shadow-md",
        ghost: "hover:bg-accent/10 hover:text-accent hover:shadow-sm",
        link: "text-primary underline-offset-4 hover:underline hover:text-primary/80",
        accent: "bg-gradient-accent text-white hover:shadow-glow hover:scale-105 font-bold",
        hero: "bg-gradient-accent text-white font-bold shadow-xl hover:shadow-glow hover:scale-105 rounded-2xl",
        "hero-outline": "border-2 border-white/30 bg-card/20 backdrop-blur-xl text-white hover:bg-white/10 hover:shadow-glass rounded-2xl font-bold",
        success: "bg-success text-success-foreground hover:bg-success/90 shadow-md hover:shadow-success/25",
        "gradient-primary": "bg-gradient-primary text-white hover:shadow-lg hover:shadow-primary/25 hover:scale-105",
        "gradient-accent": "bg-gradient-accent text-white hover:shadow-glow hover:scale-105 font-bold",
        "gradient-teal": "bg-gradient-teal text-white hover:shadow-lg hover:shadow-primary-teal/25 hover:scale-105",
        "glass": "bg-card/60 backdrop-blur-xl border border-border/50 text-foreground hover:bg-card/80 hover:shadow-glass",
        "glass-primary": "bg-primary/20 backdrop-blur-xl border border-primary/30 text-primary hover:bg-primary/30 hover:shadow-lg",
      },
      size: {
        default: "h-11 px-6 py-2",
        sm: "h-9 rounded-lg px-4 text-sm",
        lg: "h-13 rounded-2xl px-8 text-base",
        xl: "h-16 rounded-2xl px-10 text-lg",
        icon: "h-11 w-11",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
  VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />;
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
