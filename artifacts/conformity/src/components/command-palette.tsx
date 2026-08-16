import { useEffect, useState, useCallback } from "react";
import { useLocation } from "wouter";
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import {
  LayoutDashboard,
  Book,
  Layers,
  ListTree,
  Grid3x3,
  Database,
  ClipboardCheck,
  GitBranch,
  Users,
  UserCircle,
  Search,
} from "lucide-react";
import {
  useListConformityProducts,
  useListRegulations,
  useListRequirements,
  useListConformityFlows,
  useListTeamMembers,
  useGetAdminSession,
  getListConformityProductsQueryKey,
  getListRegulationsQueryKey,
  getListRequirementsQueryKey,
  getListConformityFlowsQueryKey,
  getListTeamMembersQueryKey,
} from "@workspace/api-client-react";

// The nine destinations (task 7.1) plus surfaces still awaiting re-homing.
const SECTIONS = [
  { value: "/", label: "Home", keywords: ["dashboard", "overview", "portfolio"], icon: LayoutDashboard },
  { value: "/incidents", label: "Incidents", keywords: ["psirt", "vulnerability", "csirt", "reporting"], icon: ClipboardCheck },
  { value: "/authorities", label: "Authorities", keywords: ["market surveillance", "msa", "competent authority"], icon: Database },
  { value: "/signatures", label: "Signatures", keywords: ["attestations", "signing", "provenance"], icon: UserCircle },
  { value: "/products", label: "Products", keywords: ["assessments", "portfolio", "product file"], icon: ClipboardCheck },
  { value: "/projects", label: "Projects", keywords: ["open source", "steward", "foss"], icon: ListTree },
  { value: "/organisation", label: "Organisation", keywords: ["org profile", "roles", "declarations", "obligations"], icon: Grid3x3 },
  { value: "/library", label: "Library", keywords: ["wiki", "statute", "articles", "recitals", "cra", "nis2"], icon: Book },
  { value: "/settings", label: "Settings", keywords: ["team", "members", "assessors", "accounts"], icon: Users },
  { value: "/regulations", label: "Regulations", keywords: ["cra", "ai act", "nis2", "machinery"], icon: Book },
  { value: "/requirements", label: "Requirements", keywords: ["catalogue", "rules"], icon: ListTree },
  { value: "/mappings", label: "Matrix", keywords: ["cross-regulation", "mapping"], icon: Grid3x3 },
  { value: "/themes", label: "Themes", keywords: ["cross-cutting", "categories"], icon: Layers },
  { value: "/sources", label: "Sources", keywords: ["documents", "legal"], icon: Database },
  { value: "/flows", label: "Flows", keywords: ["process", "workflow"], icon: GitBranch },
  { value: "/profile", label: "Profile", keywords: ["account", "password", "my"], icon: UserCircle },
];

interface CommandPaletteProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CommandPalette({ open, onOpenChange }: CommandPaletteProps) {
  const [, setLocation] = useLocation();
  const [search, setSearch] = useState("");

  const { data: session } = useGetAdminSession();
  const isAdmin = session?.role === "admin";

  // Fetch entities only when palette is open
  const { data: products } = useListConformityProducts({
    query: { enabled: open, queryKey: getListConformityProductsQueryKey() },
  });
  const { data: regulations } = useListRegulations({
    query: { enabled: open, queryKey: getListRegulationsQueryKey() },
  });
  const { data: requirements } = useListRequirements(undefined, {
    query: { enabled: open, queryKey: getListRequirementsQueryKey(undefined) },
  });
  const { data: flows } = useListConformityFlows({
    query: { enabled: open, queryKey: getListConformityFlowsQueryKey() },
  });
  const { data: teamMembers } = useListTeamMembers({
    query: { enabled: open && isAdmin, queryKey: getListTeamMembersQueryKey() },
  });

  const navigate = useCallback(
    (path: string) => {
      setLocation(path);
      onOpenChange(false);
      setSearch("");
    },
    [setLocation, onOpenChange]
  );

  // Filter client-side. Item `value` strings below contain the same searchable
  // text, so cmdk's built-in matching agrees with this filter.
  const lowerSearch = search.toLowerCase();
  const availableSections = isAdmin
    ? SECTIONS
    : SECTIONS.filter((s) => s.value !== "/settings");
  const filteredSections = availableSections.filter(
    (s) =>
      s.label.toLowerCase().includes(lowerSearch) ||
      s.keywords.some((k) => k.includes(lowerSearch))
  );

  const filteredProducts = products?.filter((p) =>
    (p.name ?? "").toLowerCase().includes(lowerSearch)
  );

  const filteredRegulations = regulations?.filter(
    (r) =>
      (r.name ?? "").toLowerCase().includes(lowerSearch) ||
      (r.shortName ?? "").toLowerCase().includes(lowerSearch) ||
      (r.key ?? "").toLowerCase().includes(lowerSearch)
  );

  const filteredRequirements = requirements?.filter(
    (r) =>
      (r.title ?? "").toLowerCase().includes(lowerSearch) ||
      (r.refCode ?? "").toLowerCase().includes(lowerSearch)
  );

  const filteredFlows = flows?.filter((f) =>
    (f.name ?? "").toLowerCase().includes(lowerSearch)
  );

  const filteredTeam = teamMembers?.filter(
    (m) =>
      (m.displayName ?? "").toLowerCase().includes(lowerSearch) ||
      (m.username ?? "").toLowerCase().includes(lowerSearch)
  );

  const hasResults =
    filteredSections.length > 0 ||
    (filteredProducts && filteredProducts.length > 0) ||
    (filteredRegulations && filteredRegulations.length > 0) ||
    (filteredRequirements && filteredRequirements.length > 0) ||
    (filteredFlows && filteredFlows.length > 0) ||
    (filteredTeam && filteredTeam.length > 0);

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange}>
      <CommandInput
        placeholder="Search sections, products, regulations..."
        value={search}
        onValueChange={setSearch}
        data-testid="command-palette-input"
      />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>

        {filteredSections.length > 0 && (
          <CommandGroup heading="Sections">
            {filteredSections.map((section) => (
              <CommandItem
                key={section.value}
                value={section.label}
                keywords={section.keywords}
                onSelect={() => navigate(section.value)}
                data-testid={`command-section-${section.value.replace(/\//g, "") || "overview"}`}
              >
                <section.icon className="mr-2 h-4 w-4" />
                <span>{section.label}</span>
              </CommandItem>
            ))}
          </CommandGroup>
        )}

        {filteredProducts && filteredProducts.length > 0 && (
          <>
            {filteredSections.length > 0 && <CommandSeparator />}
            <CommandGroup heading="Products">
              {filteredProducts.slice(0, 5).map((product) => (
                <CommandItem
                  key={product.id}
                  value={`${product.name} ${product.id}`}
                  onSelect={() => navigate(`/products/${product.id}`)}
                  data-testid={`command-product-${product.id}`}
                >
                  <ClipboardCheck className="mr-2 h-4 w-4" />
                  <span>{product.name}</span>
                </CommandItem>
              ))}
              {filteredProducts.length > 5 && (
                <div className="px-2 py-1.5 text-xs text-muted-foreground">
                  +{filteredProducts.length - 5} more
                </div>
              )}
            </CommandGroup>
          </>
        )}

        {filteredRegulations && filteredRegulations.length > 0 && (
          <>
            {(filteredSections.length > 0 ||
              (filteredProducts && filteredProducts.length > 0)) && (
              <CommandSeparator />
            )}
            <CommandGroup heading="Regulations">
              {filteredRegulations.slice(0, 5).map((reg) => (
                <CommandItem
                  key={reg.id}
                  value={`${reg.shortName} ${reg.name} ${reg.key}`}
                  onSelect={() => navigate(`/regulations/${reg.key}`)}
                  data-testid={`command-regulation-${reg.key}`}
                >
                  <Book className="mr-2 h-4 w-4" />
                  <span>
                    {reg.shortName} — {reg.name}
                  </span>
                </CommandItem>
              ))}
              {filteredRegulations.length > 5 && (
                <div className="px-2 py-1.5 text-xs text-muted-foreground">
                  +{filteredRegulations.length - 5} more
                </div>
              )}
            </CommandGroup>
          </>
        )}

        {filteredRequirements && filteredRequirements.length > 0 && (
          <>
            {(filteredSections.length > 0 ||
              (filteredProducts && filteredProducts.length > 0) ||
              (filteredRegulations && filteredRegulations.length > 0)) && (
              <CommandSeparator />
            )}
            <CommandGroup heading="Requirements">
              {filteredRequirements.slice(0, 5).map((req) => (
                <CommandItem
                  key={req.id}
                  value={`${req.refCode} ${req.title} ${req.id}`}
                  onSelect={() => navigate(`/requirements/${req.id}`)}
                  data-testid={`command-requirement-${req.id}`}
                >
                  <ListTree className="mr-2 h-4 w-4" />
                  <span>
                    {req.refCode} — {req.title}
                  </span>
                </CommandItem>
              ))}
              {filteredRequirements.length > 5 && (
                <div className="px-2 py-1.5 text-xs text-muted-foreground">
                  +{filteredRequirements.length - 5} more
                </div>
              )}
            </CommandGroup>
          </>
        )}

        {filteredFlows && filteredFlows.length > 0 && (
          <>
            {(filteredSections.length > 0 ||
              (filteredProducts && filteredProducts.length > 0) ||
              (filteredRegulations && filteredRegulations.length > 0) ||
              (filteredRequirements && filteredRequirements.length > 0)) && (
              <CommandSeparator />
            )}
            <CommandGroup heading="Flows">
              {filteredFlows.slice(0, 5).map((flow) => (
                <CommandItem
                  key={flow.id}
                  value={`${flow.name} ${flow.id}`}
                  onSelect={() => navigate(`/flows`)}
                  data-testid={`command-flow-${flow.id}`}
                >
                  <GitBranch className="mr-2 h-4 w-4" />
                  <span>{flow.name}</span>
                </CommandItem>
              ))}
              {filteredFlows.length > 5 && (
                <div className="px-2 py-1.5 text-xs text-muted-foreground">
                  +{filteredFlows.length - 5} more
                </div>
              )}
            </CommandGroup>
          </>
        )}

        {filteredTeam && filteredTeam.length > 0 && (
          <>
            {hasResults && <CommandSeparator />}
            <CommandGroup heading="Team">
              {filteredTeam.slice(0, 5).map((member) => (
                <CommandItem
                  key={member.id}
                  value={`${member.displayName} ${member.username}`}
                  onSelect={() => navigate(`/team`)}
                  data-testid={`command-team-${member.id}`}
                >
                  <Users className="mr-2 h-4 w-4" />
                  <span>{member.displayName}</span>
                </CommandItem>
              ))}
              {filteredTeam.length > 5 && (
                <div className="px-2 py-1.5 text-xs text-muted-foreground">
                  +{filteredTeam.length - 5} more
                </div>
              )}
            </CommandGroup>
          </>
        )}
      </CommandList>
    </CommandDialog>
  );
}

export function useCommandPalette() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((prev) => !prev);
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  return { open, setOpen };
}
