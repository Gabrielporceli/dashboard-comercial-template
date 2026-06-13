import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  // Base — applies to every button
  [
    "inline-flex items-center justify-center gap-2 whitespace-nowrap",
    "rounded-md font-medium transition-all duration-200",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6829c0]",
    "disabled:pointer-events-none disabled:opacity-40",
    "cursor-pointer select-none",
    "[&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  ],
  {
    variants: {
      variant: {
        // ── Porceli OS variants ────────────────────────────────────────────────

        // Primary — main CTA (purple)
        primary:
          "bg-[#6829c0] text-white hover:bg-[#7c35e0] active:scale-95",

        // Default — alias for primary (backward compat)
        default:
          "bg-[#6829c0] text-white hover:bg-[#7c35e0] active:scale-95",

        // Mono — neutral white action
        mono:
          "bg-white text-black hover:bg-white/90 active:scale-95",

        // Destructive — delete / remove
        destructive:
          "bg-red-500/10 text-red-400 border border-red-500/30 hover:bg-red-500/20",

        // Secondary — supporting action
        secondary:
          "bg-white/5 text-white/70 hover:bg-white/10 border border-white/10",

        // Outline — alt to secondary
        outline:
          "border border-white/20 text-white/80 hover:bg-white/5",

        // Dashed — "add item" style
        dashed:
          "border border-dashed border-white/20 text-white/50 hover:border-white/40 hover:text-white/80",

        // Ghost — minimal
        ghost:
          "text-white/60 hover:bg-white/5 hover:text-white",

        // Dim — ghost but slightly more visible
        dim:
          "bg-white/[0.03] text-white/50 hover:bg-white/[0.07]",

        // Foreground — white with subtle border
        foreground:
          "bg-white/10 text-white hover:bg-white/20 border border-white/10",

        // Inverse — white bg for special sections
        inverse:
          "bg-white text-[#121212] hover:bg-white/90",

        // Link
        link:
          "text-[#6829c0] underline-offset-4 hover:underline",

        // ── Legacy aliases (keep backward compat) ─────────────────────────────
        purple:
          "bg-[#6829c0] text-white hover:bg-[#7c35e0] font-semibold active:scale-95",

        "purple-outline":
          "border-2 border-[#6829c0] text-[#6829c0] bg-transparent hover:bg-[#6829c0] hover:text-white font-semibold",

        "purple-ghost":
          "text-[#6829c0] hover:bg-[#6829c0]/10 font-semibold",
      },
      size: {
        lg:      "h-11 px-6 text-base",
        default: "h-10 px-4 text-sm",   // kept for backward compat
        md:      "h-9  px-4 text-sm",
        sm:      "h-9  rounded-md px-3 text-sm",
        xs:      "h-7  px-3 text-xs",
        icon:    "h-9  w-9 p-0",
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
    return (
      <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />
    );
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
