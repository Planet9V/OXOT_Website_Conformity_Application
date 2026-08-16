import type { TeamRole } from "@workspace/db";

/**
 * Which internal team role an obligation lands with BY DEFAULT.
 *
 * This is workflow routing, not law: every act binds the ORGANISATION (the
 * manufacturer, importer, steward...), never a named member of its staff. Who
 * inside the organisation drafts the evidence is the organisation's own
 * choice, so the value is a default for scoping inboxes (task 6.3, D12) and
 * is exposed as `defaultTeamRole` — a starting point an org can re-route, not
 * a statutory assignment.
 *
 * Keyed by themeKey because themes are the act-independent vocabulary shared
 * by every seeded act: a newly seeded act routes without touching this file
 * (same property the status-deriver registry has, D9).
 *
 * Unmapped themes fall through to the compliance coordinator — D12's
 * dispatcher ("deadlines, chasing evidence, clocks"). The safe failure mode
 * is over-notifying the person whose job is routing work; an obligation that
 * appears in nobody's inbox is how a duty goes unnoticed.
 */
const THEME_ROUTING: Record<string, TeamRole> = {
  // Statutory clocks and incident handling — the PSIRT's reason to exist.
  incident_reporting: "psirt",
  vulnerability_handling: "psirt",

  // The EU declaration of conformity is signed for and on behalf of the
  // manufacturer (Annex V), so its preparation routes to the signatory.
  conformity_declaration: "signatory",

  // Product engineering evidence: the technical file and the essential-
  // requirement themes it documents.
  technical_documentation: "engineering_lead",
  secure_by_design: "engineering_lead",
  secure_update: "engineering_lead",
  access_control: "engineering_lead",
  data_protection: "engineering_lead",
  resilience: "engineering_lead",
  logging_monitoring: "engineering_lead",
  sbom_supply_chain: "engineering_lead",

  // Organisational process and governance.
  risk_management: "compliance_coordinator",
  post_market: "compliance_coordinator",
  data_governance: "compliance_coordinator",
  human_oversight: "compliance_coordinator",
};

export function defaultTeamRoleFor(themeKey: string | null | undefined): TeamRole {
  return (themeKey && THEME_ROUTING[themeKey]) || "compliance_coordinator";
}

/** Exposed for the drift-guard test only. */
export function routedThemes(): string[] {
  return Object.keys(THEME_ROUTING).sort();
}
