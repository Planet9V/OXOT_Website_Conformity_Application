import { pgTable, serial, text, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

/**
 * The four internal team roles (DESIGN_five_shapes.md, D2/D12). The signatory
 * is legally distinct: Annex V requires the EU declaration of conformity to be
 * signed on behalf of the manufacturer, so who may attest is a data question,
 * not display text. `null` means unassigned — a member nobody has placed in a
 * role. Never default it: an unassigned member must render as unassigned, not
 * as a silently-guessed coordinator.
 */
export const TEAM_ROLES = [
  "compliance_coordinator",
  "engineering_lead",
  "psirt",
  "signatory",
] as const;
export type TeamRole = (typeof TEAM_ROLES)[number];

/**
 * Named assessor accounts for the conformity workbench ("member" role).
 *
 * Admin-managed: the site admin creates each person (display name +
 * username/password) and hands out credentials; there is no self-signup,
 * invite, or reset flow. Members sign in through the same login as the env
 * admin and demo accounts and may drive the execution layer, but never the
 * site-admin/config surfaces.
 *
 * `passwordHash` is scrypt-derived (`saltB64url.hashB64url`) — never a plain
 * password. Accounts are deactivated (active=false), never deleted, so the
 * activity ledger's actor references stay resolvable forever. Deactivation
 * also invalidates existing sessions: member sessions are re-checked against
 * this table on every authenticated request.
 */
export const conformityMembersTable = pgTable("conformity_members", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  displayName: text("display_name").notNull(),
  position: text("position").notNull().default("CRA Compliance Officer"),
  email: text("email").notNull().default("user@oxot.eu"),
  telephone: text("telephone").notNull().default("+31 (0)20 555 0199"),
  department: text("department").notNull().default("Cybersecurity & Product Compliance"),
  organization: text("organization").notNull().default("OXOT Engineering B.V."),
  roleResponsibility: text("role_responsibility").notNull().default("Lead Assessor & PSIRT Coordinator"),
  /** One of TEAM_ROLES, or null while unassigned. Routes validate the value;
   * `roleResponsibility` above stays as free-text description alongside it. */
  teamRole: text("team_role").$type<TeamRole>(),
  // plain_password (a plaintext copy of every member's password) lived here
  // until 2026-08-15. Removed under task 6.2 — the hash below is the only
  // stored credential, and no route may ever return a password.
  passwordHash: text("password_hash").notNull(),
  active: boolean("active").notNull().default(true),
  /**
   * When the member finished (or explicitly completed) the first-login
   * onboarding flow. Null = not yet onboarded → the workbench nudges them
   * through welcome → set-your-own-password → orientation on sign-in.
   * Admin/demo sessions have no row here and never onboard.
   */
  onboardedAt: timestamp("onboarded_at", { withTimezone: true }),
  /**
   * Guided-tour ids this member has already seen (e.g. "workbench",
   * "portfolio"). Stored on the account so the state follows the person
   * across devices; anonymous/demo/admin sessions have no row here and fall
   * back to per-browser localStorage.
   */
  toursSeen: jsonb("tours_seen").$type<string[]>().notNull().default([]),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});

export const insertConformityMemberSchema = createInsertSchema(conformityMembersTable).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export type InsertConformityMember = z.infer<typeof insertConformityMemberSchema>;
export type ConformityMemberRow = typeof conformityMembersTable.$inferSelect;
