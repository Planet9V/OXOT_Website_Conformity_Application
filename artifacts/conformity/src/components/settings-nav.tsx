import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { Users, GitBranch } from "lucide-react";

/**
 * The Settings destination's sub-navigation (task 9.2): Team accounts and the
 * admin-authored assessment flows re-homed from the retired /flows surface.
 */
const TABS = [
  { href: "/settings", label: "Team", icon: Users },
  { href: "/settings/flows", label: "Assessment flows", icon: GitBranch },
];

export function SettingsNav() {
  const [location] = useLocation();
  return (
    <nav aria-label="Settings sections" className="flex items-center gap-1 border-b border-border">
      {TABS.map((tab) => {
        const active = location === tab.href;
        const Icon = tab.icon;
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={cn(
              "flex items-center gap-1.5 px-3 py-2 text-xs font-semibold border-b-2 -mb-px transition-colors",
              active
                ? "border-primary text-foreground"
                : "border-transparent text-muted-foreground hover:text-foreground",
            )}
          >
            <Icon className="w-3.5 h-3.5" /> {tab.label}
          </Link>
        );
      })}
    </nav>
  );
}
