import { pgTable, serial, text, integer, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { conversationsTable } from "./conversations";

/**
 * A contact captured inline during a chat conversation. The full transcript is
 * preserved via the linked conversation (kept even if a conversation row is
 * later removed, hence onDelete: set null).
 */
export const leadsTable = pgTable("leads", {
  id: serial("id").primaryKey(),
  conversationId: integer("conversation_id").references(() => conversationsTable.id, {
    onDelete: "set null",
  }),
  name: text("name").notNull(),
  email: text("email").notNull(),
  company: text("company"),
  message: text("message"),
  // CRA-intake attribution: the buyer segment (manufacturer/oem/…) and the
  // capture surface (e.g. "cra_selfcheck"). Nullable — chat-captured leads set
  // neither. Additive columns; no migration beyond the boot schema push.
  segment: text("segment"),
  source: text("source"),
  locale: text("locale").notNull().default("en"),
  status: text("status").notNull().default("new"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertLeadSchema = createInsertSchema(leadsTable).omit({
  id: true,
  createdAt: true,
});
export type InsertLead = z.infer<typeof insertLeadSchema>;
export type LeadRow = typeof leadsTable.$inferSelect;
