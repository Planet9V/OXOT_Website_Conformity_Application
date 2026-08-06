import React from "react";
import { cn } from "@/lib/utils";

interface OxotWordmarkProps {
  variant?: "header" | "footer";
  showTagline?: boolean;
  className?: string;
}

export function OxotWordmark({
  variant = "header",
  showTagline = false,
  className,
}: OxotWordmarkProps) {
  const isHeader = variant === "header";

  return (
    <div className={cn("inline-flex flex-col select-none", className)}>
      <a
        href="/"
        aria-label="OXOT — home"
        className={cn(
          "font-sans font-semibold text-foreground no-underline hover:opacity-95 transition-opacity inline-flex items-center gap-1.5",
          isHeader ? "text-[15px] tracking-[0.28em]" : "text-lg tracking-[0.30em]"
        )}
      >
        <span>
          O<span className="text-primary">X</span>OT
        </span>
        {isHeader && (
          <span className="text-[10px] font-sans font-semibold tracking-widest text-muted-foreground uppercase border-l border-border/60 pl-2">
            Conformity
          </span>
        )}
      </a>

      {showTagline && (
        <span className="font-serif font-medium text-xs sm:text-sm text-foreground/90 mt-1 leading-snug">
          Operational e<span className="text-primary">X</span>cellence in Operational Technology
        </span>
      )}
    </div>
  );
}
