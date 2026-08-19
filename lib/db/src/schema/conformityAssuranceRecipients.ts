import { pgTable, serial, text, integer, boolean, timestamp, index } from "drizzle-orm/pg-core";

/**
 * Named customer recipients of a product's supplier assurance package (B4) —
 * the publish-to-many door. Unlike the single delivery-manifest link (B3), a
 * supplier can issue one revocable token per customer, each resolving to the
 * FULL package (matrix + manifest + evidence) on the public view. The
 * supply-side, one-to-many mirror of the auditor door. A grant is a
 * distribution record, never a conformity verdict.
 */
export const conformityAssuranceRecipientsTable = pgTable(
  "conformity_assurance_recipients",
  {
    id: serial("id").primaryKey(),
    productId: integer("product_id").notNull(),
    /** The customer organisation this link was issued to. */
    recipientName: text("recipient_name").notNull().default(""),
    accessToken: text("access_token").notNull().unique(),
    isActive: boolean("is_active").notNull().default(true),
    createdBy: text("created_by").notNull().default(""),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("conformity_assurance_recipients_product_idx").on(t.productId)],
);

export type ConformityAssuranceRecipientRow =
  typeof conformityAssuranceRecipientsTable.$inferSelect;
