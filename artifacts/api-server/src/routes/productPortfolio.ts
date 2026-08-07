import { Router, type IRouter } from "express";
import { eq, desc, sql } from "drizzle-orm";
import crypto from "crypto";
import fs from "fs";
import path from "path";
import {
  db,
  conformityProductsTable,
  conformityAssessmentsTable,
  craProductsTable,
  productReleasesTable,
  enterpriseCustomersTable,
  customerDeploymentsTable,
  productDocumentsTable,
  type CraProductRow,
  type EnterpriseCustomerRow,
  type ProductReleaseRow,
  type CustomerDeploymentRow,
  type ProductDocumentRow,
} from "@workspace/db";
import { requireAuth, getSession } from "../lib/adminAuth";

export const productPortfolioRouter: IRouter = Router();

// The product portfolio is part of the gated conformity workbench — only the
// /conformity/ SPA calls /api/portfolio/*. Gate every route behind requireAuth
// (admin, member, or the read-only demo role), matching the rest of the
// conformity execution layer, and block demo writes when DEMO_READONLY=true.
productPortfolioRouter.use((req, res, next): void => {
  if (
    req.method !== "GET" &&
    req.method !== "HEAD" &&
    req.method !== "OPTIONS" &&
    getSession(req)?.role === "demo" &&
    process.env["DEMO_READONLY"] === "true"
  ) {
    res.status(403).json({ error: "The demo workspace is read-only." });
    return;
  }
  next();
});

// Demo Initializer / Seed Data Generator
const DEMO_PRODUCTS = [
  {
    sku: "CRA-HW-8841",
    name: "NovaGuard Smart Home Hub v2",
    category: "Smart Home & IoT",
    description: "CRA Class I certified central gateway connecting home automation Zigbee, Matter, and Thread devices to encrypted cloud services.",
    craClass: "Class I",
    currentStatus: "compliant",
    hasActivePsirtIncident: true,
    activeIncidentCve: "CVE-2026-3891",
    customerGuidance: "### Statutory CRA Security Guidance\n\n- **Firmware Maintenance**: Ensure patch v2.1.4 is applied before 2026-09-01.\n- **Network Isolation**: Restrict inbound WAN traffic on port 8443.\n- **CRA Compliance Certificate**: EU-CRA-2026-8841-CE.",
  },
  {
    sku: "CRA-IIoT-9920",
    name: "Robot Vision System Pro",
    category: "Industrial Robotics",
    description: "Class II High-Risk industrial automated vision controller running real-time AI inference pipelines for manufacturing line quality assurance.",
    craClass: "Class II",
    currentStatus: "compliant",
    hasActivePsirtIncident: false,
    activeIncidentCve: "",
    customerGuidance: "### Industrial CRA Operating Instructions\n\n- **Air-Gapped Operation**: Operating in air-gapped OT networks fulfills NIS2/CRA Art 10 controls.\n- **Cryptographic Boot**: Verify Secure Boot TPM 2.0 signatures during initial power cycle.",
  },
  {
    sku: "CRA-SCADA-4102",
    name: "Test Industrial Controller v3",
    category: "Critical Energy Infrastructure",
    description: "Programmable logic controller (PLC) driver stack deployed across electrical grid substations and water processing plants.",
    craClass: "Class II",
    currentStatus: "under_assessment",
    hasActivePsirtIncident: false,
    activeIncidentCve: "",
    customerGuidance: "### Substation Deployment Guidance\n\n- **VEX Status**: Under active reachability review for IEC 62443-4-2 compliance.\n- **Re-evaluation Date**: Target CRA conformity re-assessment set for Q4 2026.",
  },
  {
    sku: "CRA-EDGE-1055",
    name: "CyberEdge Secure Gateway 5G",
    category: "Telecommunications & Defense",
    description: "Multi-access Edge Computing (MEC) gateway for 5G private cellular networks in defense industrial logistics.",
    craClass: "Class I",
    currentStatus: "compliant",
    hasActivePsirtIncident: false,
    activeIncidentCve: "",
    customerGuidance: "### Telecommunications Security Directive\n\n- **Zero-Trust Tunnels**: Enable WireGuard IPsec mesh interface.\n- **Statutory Audit**: Conformity documentation verified by Notified Body TUV Rheinland.",
  },
];

const DEMO_RELEASES = [
  { version: "v2.1.4", releaseDate: "2026-07-15", craReevaluationDate: "2027-07-15", isLatest: true, changelog: "Fixed HMS Anybus driver stack vulnerability CVE-2026-3891. Implemented TLS 1.3 strict ciphers." },
  { version: "v2.1.0", releaseDate: "2026-03-10", craReevaluationDate: "2027-03-10", isLatest: false, changelog: "Added Matter 1.2 protocol support and CISA KEV automated compliance check." },
  { version: "v1.4.2", releaseDate: "2026-05-20", craReevaluationDate: "2027-05-20", isLatest: true, changelog: "Industrial AI vision pipeline optimization and YOLOV8 tensor kernel patch." },
  { version: "v3.0.1", releaseDate: "2026-06-01", craReevaluationDate: "2026-12-01", isLatest: true, changelog: "Modbus TCP/IP buffer overflow mitigation and signed firmware verification." },
  { version: "v1.0.0", releaseDate: "2026-01-10", craReevaluationDate: "2027-01-10", isLatest: true, changelog: "Initial commercial launch with 5G MEC slicing support." },
];

const DEMO_CUSTOMERS = [
  {
    orgName: "Siemens Energy Europe GmbH",
    contactName: "Hans Weber",
    contactTitle: "Chief Information Security Officer (CISO)",
    contactEmail: "h.weber@siemens-energy.de",
    region: "EU-Central (Germany)",
    cisaSector: "Energy",
  },
  {
    orgName: "Airbus Defence & Space SA",
    contactName: "Claire Dubois",
    contactTitle: "Head of Cyber Infrastructure",
    contactEmail: "c.dubois@airbus.com",
    region: "EU-West (France)",
    cisaSector: "Defense Industrial Base",
  },
  {
    orgName: "BASF Industrial Automation BV",
    contactName: "Jan Van Der Meer",
    contactTitle: "OT Security Director",
    contactEmail: "j.vandermeer@basf.com",
    region: "EU-North (Netherlands)",
    cisaSector: "Chemical",
  },
  {
    orgName: "BMW Group Cyber Operations",
    contactName: "Dr. Klaus Richter",
    contactTitle: "VP Automotive Cyber Resilience",
    contactEmail: "klaus.richter@bmw.de",
    region: "EU-Central (Germany)",
    cisaSector: "Critical Manufacturing",
  },
  {
    orgName: "Schneider Electric Grid SAS",
    contactName: "Antoine Laurent",
    contactTitle: "Grid Protection Manager",
    contactEmail: "a.laurent@se.com",
    region: "EU-West (France)",
    cisaSector: "Energy",
  },
  {
    orgName: "Charité Berlin University Hospital",
    contactName: "Dr. Marie Neumann",
    contactTitle: "Medical IT Security Lead",
    contactEmail: "m.neumann@charite.de",
    region: "EU-Central (Germany)",
    cisaSector: "Healthcare & Public Health",
  },
];

// Helper to ensure database is seeded with demo data if empty
async function seedDatabaseIfEmpty() {
  try {
    const existingProducts = await db.select().from(craProductsTable).limit(1);
    if (existingProducts.length === 0) {
      console.log("Seeding CRA Product Portfolio & Enterprise Customers database...");
      // Insert products
      for (const prod of DEMO_PRODUCTS) {
        const [insertedProd] = await db.insert(craProductsTable).values(prod).returning();
        if (insertedProd) {
          // Insert matching releases
          for (const rel of DEMO_RELEASES) {
            await db.insert(productReleasesTable).values({
              productId: insertedProd.id,
              ...rel,
            });
          }
        }
      }
      // Insert customers
      const insertedCusts = [];
      for (const cust of DEMO_CUSTOMERS) {
        const [c] = await db.insert(enterpriseCustomersTable).values(cust).returning();
        if (c) insertedCusts.push(c);
      }

      // Fetch inserted products and releases for mapping
      const prods = await db.select().from(craProductsTable);
      const rels = await db.select().from(productReleasesTable);

      if (prods.length > 0 && insertedCusts.length > 0) {
        // Map customer deployments
        const p1 = prods[0]!;
        const p2 = prods[1]!;
        const c1 = insertedCusts[0]!;
        const c2 = insertedCusts[1]!;
        const c3 = insertedCusts[2]!;

        const r1 = rels.find((r) => r.productId === p1.id && !r.isLatest) || rels[0]!;
        const rLatest = rels.find((r) => r.productId === p1.id && r.isLatest) || rels[0]!;

        // Customer 1 owns outdated version of Product 1 (Siemens Energy owns v2.1.0 outdated)
        await db.insert(customerDeploymentsTable).values({
          customerId: c1.id,
          productId: p1.id,
          releaseId: r1.id,
          deployedVersion: r1.version,
          quantity: 450,
          isOutdatedVersion: true,
          deploymentDate: "2026-03-12",
          notes: "Deployed across 12 Bavarian substation gateways. Requires mandatory v2.1.4 upgrade.",
        });

        // Customer 2 owns Product 2 (Airbus owns Robot Vision System)
        await db.insert(customerDeploymentsTable).values({
          customerId: c2.id,
          productId: p2.id,
          releaseId: rels.find((r) => r.productId === p2.id)?.id || 1,
          deployedVersion: "v1.4.2",
          quantity: 120,
          isOutdatedVersion: false,
          deploymentDate: "2026-05-22",
          notes: "Airbus Toulouse assembly line quality inspection controllers.",
        });

        // Customer 3 owns both Product 1 and Product 3 (BASF owns multiple equipment)
        await db.insert(customerDeploymentsTable).values({
          customerId: c3.id,
          productId: p1.id,
          releaseId: rLatest.id,
          deployedVersion: rLatest.version,
          quantity: 280,
          isOutdatedVersion: false,
          deploymentDate: "2026-07-20",
          notes: "Ludwigshafen chemical plant edge hub fleet.",
        });

        await db.insert(customerDeploymentsTable).values({
          customerId: c3.id,
          productId: prods[2]?.id || p1.id,
          releaseId: rels.find((r) => r.productId === prods[2]?.id)?.id || 1,
          deployedVersion: "v3.0.1",
          quantity: 75,
          isOutdatedVersion: false,
          deploymentDate: "2026-06-05",
          notes: "Process automation PLC controllers.",
        });
      }
    }
  } catch (err) {
    console.error("Error seeding product portfolio DB:", err);
  }
}

// 1. GET /api/portfolio/products - List all products with releases & customer deployments
productPortfolioRouter.get("/products", requireAuth, async (req, res) => {
  try {
    await seedDatabaseIfEmpty();
    let products: any[] = [];
    let userProducts: any[] = [];
    let releases: any[] = [];
    let deployments: any[] = [];
    let customers: any[] = [];
    let assessments: any[] = [];

    try { products = await db.select().from(craProductsTable).orderBy(desc(craProductsTable.id)); } catch (e) { console.error("Error selecting craProductsTable:", e); }
    try { userProducts = await db.select().from(conformityProductsTable).orderBy(desc(conformityProductsTable.id)); } catch (e) { console.error("Error selecting conformityProductsTable:", e); }
    try { assessments = await db.select().from(conformityAssessmentsTable); } catch (e) { console.error("Error selecting conformityAssessmentsTable:", e); }

    // The first (earliest) assessment for a given conformity product id, or null.
    const assessmentFor = (conformityProductId: number): number | null => {
      const match = assessments
        .filter((a) => a.productId === conformityProductId)
        .sort((a, b) => a.id - b.id)[0];
      return match ? match.id : null;
    };
    try { releases = await db.select().from(productReleasesTable); } catch (e) { console.error("Error selecting productReleasesTable:", e); }
    try { deployments = await db.select().from(customerDeploymentsTable); } catch (e) { console.error("Error selecting customerDeploymentsTable:", e); }
    try { customers = await db.select().from(enterpriseCustomersTable); } catch (e) { console.error("Error selecting enterpriseCustomersTable:", e); }

    const mappedUserProducts = userProducts.map((u) => {
      return {
        id: 10000 + u.id,
        userProductId: u.id,
        assessmentId: assessmentFor(u.id),
        sku: `SKU-CRA-USER-${u.id}`,
        name: u.name,
        category: u.productType === "hardware" ? "Hardware & Embedded" : u.productType === "hardware_with_software" ? "Industrial Gateway" : "Software System",
        description: u.description || "Active product assessment registered in CRA platform.",
        craClass: "Class I",
        currentStatus: "under_assessment",
        hasActivePsirtIncident: false,
        activeIncidentCve: "",
        customerGuidance: `### Active CRA Product Assessment Guidance\n\n- **Intended Use**: ${u.intendedUse || "Industrial & Commercial Operations"}\n- **Manufacturer**: ${u.manufacturerName || "Internal Engineering"}\n- **CRA Support Lifecycle**: ${u.supportPeriodStart || "2026-01-01"} to ${u.supportPeriodEnd || "2031-01-01"}`,
        isUserCreated: true,
        releases: [
          {
            id: 9000 + u.id,
            productId: 10000 + u.id,
            version: u.version || "v1.0.0",
            releaseDate: u.supportPeriodStart || "2026-01-15",
            craReevaluationDate: u.supportPeriodEnd || "2027-01-15",
            isLatest: true,
            changelog: "Active production assessment release.",
          },
        ],
        deployments: [],
        totalDeployedQuantity: 1,
        outdatedDeploymentsCount: 0,
      };
    });

    const fullProducts = products.map((prod) => {
      const prodReleases = releases.filter((r) => r.productId === prod.id);
      const prodDeployments = deployments
        .filter((d) => d.productId === prod.id)
        .map((d) => {
          const cust = customers.find((c) => c.id === d.customerId);
          return {
            ...d,
            customerName: cust?.orgName || `Customer #${d.customerId}`,
            cisaSector: cust?.cisaSector || "Energy",
            contactEmail: cust?.contactEmail || "",
            contactName: cust?.contactName || "",
          };
        });

      // Link a catalog product to a real conformity product ONLY by exact name.
      // (Do NOT match by id — a catalog id and a conformity-product id are
      // unrelated; matching them navigated to foreign/nonexistent assessments.)
      const matchingUserProd = userProducts.find((u) => u.name === prod.name);
      const conformityProductId = matchingUserProd?.id ?? null;

      return {
        ...prod,
        // null when this catalog item has no backing conformity record — the UI
        // then offers to start an assessment instead of opening a bogus id.
        userProductId: conformityProductId,
        assessmentId: conformityProductId ? assessmentFor(conformityProductId) : null,
        releases: prodReleases,
        deployments: prodDeployments,
        totalDeployedQuantity: prodDeployments.reduce((sum, d) => sum + d.quantity, 0),
        outdatedDeploymentsCount: prodDeployments.filter((d) => d.isOutdatedVersion).length,
      };
    });

    res.json({ success: true, products: [...mappedUserProducts, ...fullProducts] });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 2. GET /api/portfolio/customers - List enterprise customers with deployed products & flags
productPortfolioRouter.get("/customers", requireAuth, async (req, res) => {
  try {
    await seedDatabaseIfEmpty();
    let customers: any[] = [];
    let deployments: any[] = [];
    let products: any[] = [];
    let releases: any[] = [];

    try { customers = await db.select().from(enterpriseCustomersTable).orderBy(desc(enterpriseCustomersTable.id)); } catch (e) { console.error("Error selecting enterpriseCustomersTable:", e); }
    try { deployments = await db.select().from(customerDeploymentsTable); } catch (e) { console.error("Error selecting customerDeploymentsTable:", e); }
    try { products = await db.select().from(craProductsTable); } catch (e) { console.error("Error selecting craProductsTable:", e); }
    try { releases = await db.select().from(productReleasesTable); } catch (e) { console.error("Error selecting productReleasesTable:", e); }

    const customerFleet = customers.map((cust) => {
      const custDeployments = deployments
        .filter((d) => d.customerId === cust.id)
        .map((d) => {
          const prod = products.find((p) => p.id === d.productId);
          const rel = releases.find((r) => r.id === d.releaseId);
          return {
            ...d,
            productName: prod?.name || `Product #${d.productId}`,
            productSku: prod?.sku || "",
            craClass: prod?.craClass || "Class I",
            latestVersion: rel?.version || d.deployedVersion,
            hasActivePsirtIncident: prod?.hasActivePsirtIncident || false,
            activeIncidentCve: prod?.activeIncidentCve || "",
          };
        });

      const totalQuantity = custDeployments.reduce((sum, d) => sum + d.quantity, 0);
      const hasOutdatedProducts = custDeployments.some((d) => d.isOutdatedVersion);
      const hasImpactedPsirtProducts = custDeployments.some((d) => d.hasActivePsirtIncident);

      return {
        ...cust,
        deployments: custDeployments,
        totalQuantity,
        hasOutdatedProducts,
        hasImpactedPsirtProducts,
        productCount: custDeployments.length,
      };
    });

    res.json({ success: true, customers: customerFleet });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 3. POST /api/portfolio/upload-bulk - Mass CSV / Markdown table bulk parser & upsert
productPortfolioRouter.post("/upload-bulk", requireAuth, async (req, res) => {
  try {
    const { fileContent, fileType } = req.body;
    if (!fileContent || typeof fileContent !== "string") {
      return res.status(400).json({ success: false, error: "Missing or invalid fileContent string" });
    }

    let parsedRows: Array<{
      productName: string;
      sku: string;
      category: string;
      craClass: string;
      customerOrg: string;
      contactEmail: string;
      cisaSector: string;
      version: string;
      quantity: number;
    }> = [];

    // Parse CSV or Markdown table format
    const lines = fileContent.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
    for (const line of lines) {
      if (line.startsWith("|") && line.endsWith("|")) {
        // Markdown table row
        const cols = line.split("|").map((c) => c.trim()).filter((_, idx, arr) => idx > 0 && idx < arr.length - 1);
        if (cols.length >= 4 && !cols[0]!.includes("---") && !cols[0]!.toLowerCase().includes("product")) {
          parsedRows.push({
            productName: cols[0] || "Imported CRA Product",
            sku: cols[1] || `SKU-IMP-${Math.floor(Math.random() * 9000 + 1000)}`,
            category: cols[2] || "Industrial Automation",
            craClass: cols[3] || "Class I",
            customerOrg: cols[4] || "Enterprise Customer",
            contactEmail: cols[5] || "ciso@enterprise.com",
            cisaSector: cols[6] || "Energy",
            version: cols[7] || "v1.0.0",
            quantity: parseInt(cols[8] || "10", 10) || 10,
          });
        }
      } else if (line.includes(",") && !line.toLowerCase().startsWith("product")) {
        // Standard CSV row
        const cols = line.split(",").map((c) => c.trim());
        if (cols.length >= 3) {
          parsedRows.push({
            productName: cols[0] || "Imported CRA Product",
            sku: cols[1] || `SKU-IMP-${Math.floor(Math.random() * 9000 + 1000)}`,
            category: cols[2] || "Industrial Automation",
            craClass: cols[3] || "Class I",
            customerOrg: cols[4] || "Enterprise Customer",
            contactEmail: cols[5] || "ciso@enterprise.com",
            cisaSector: cols[6] || "Energy",
            version: cols[7] || "v1.0.0",
            quantity: parseInt(cols[8] || "10", 10) || 10,
          });
        }
      }
    }

    if (parsedRows.length === 0) {
      return res.status(400).json({ success: false, error: "Could not parse any valid product rows from uploaded file content." });
    }

    // Insert parsed records into Postgres DB
    let importedProductsCount = 0;
    let importedCustomersCount = 0;

    for (const row of parsedRows) {
      // Upsert product
      const [prod] = await db
        .insert(craProductsTable)
        .values({
          name: row.productName,
          sku: row.sku,
          category: row.category,
          craClass: row.craClass,
          currentStatus: "compliant",
          customerGuidance: `### Guidance for ${row.productName}\n\n- Mass imported into CRA Portfolio database.\n- Maintain mandatory support logs for 5 years per CRA Art. 10.`,
        })
        .returning();

      if (prod) {
        importedProductsCount++;
        // Create release
        const [rel] = await db
          .insert(productReleasesTable)
          .values({
            productId: prod.id,
            version: row.version,
            releaseDate: new Date().toISOString().slice(0, 10),
            craReevaluationDate: "2027-08-01",
            isLatest: true,
            changelog: "Mass bulk import baseline release.",
          })
          .returning();

        // Create customer
        const [cust] = await db
          .insert(enterpriseCustomersTable)
          .values({
            orgName: row.customerOrg,
            contactName: "Security Administrator",
            contactTitle: "CISO",
            contactEmail: row.contactEmail,
            region: "Global",
            cisaSector: row.cisaSector,
          })
          .returning();

        if (cust && rel) {
          importedCustomersCount++;
          // Create deployment mapping
          await db.insert(customerDeploymentsTable).values({
            customerId: cust.id,
            productId: prod.id,
            releaseId: rel.id,
            deployedVersion: row.version,
            quantity: row.quantity,
            isOutdatedVersion: false,
            notes: "Mass bulk imported via file upload.",
          });
        }
      }
    }

    res.json({
      success: true,
      message: `Successfully parsed and imported ${importedProductsCount} CRA Products and ${importedCustomersCount} Enterprise Customers into Postgres DB!`,
      parsedRowsCount: parsedRows.length,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 4. PUT /api/portfolio/customers/:id - Update enterprise customer details & deployment
productPortfolioRouter.put("/customers/:id", requireAuth, async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const { orgName, contactName, contactTitle, contactEmail, region, cisaSector, deploymentId, productId, deployedVersion, quantity, isOutdatedVersion } = req.body;

    // Update customer table
    const [updatedCust] = await db
      .update(enterpriseCustomersTable)
      .set({
        ...(orgName && { orgName }),
        ...(contactName && { contactName }),
        ...(contactTitle && { contactTitle }),
        ...(contactEmail && { contactEmail }),
        ...(region && { region }),
        ...(cisaSector && { cisaSector }),
      })
      .where(eq(enterpriseCustomersTable.id, id))
      .returning();

    // If deployment attributes provided, update customer_deployments table
    if (deploymentId || productId) {
      if (deploymentId) {
        await db
          .update(customerDeploymentsTable)
          .set({
            ...(productId && { productId }),
            ...(deployedVersion && { deployedVersion }),
            ...(quantity !== undefined && { quantity }),
            ...(isOutdatedVersion !== undefined && { isOutdatedVersion }),
          })
          .where(eq(customerDeploymentsTable.id, deploymentId));
      } else {
        // Find deployment for customer
        const [existingDepl] = await db
          .select()
          .from(customerDeploymentsTable)
          .where(eq(customerDeploymentsTable.customerId, id));

        if (existingDepl) {
          await db
            .update(customerDeploymentsTable)
            .set({
              ...(productId && { productId }),
              ...(deployedVersion && { deployedVersion }),
              ...(quantity !== undefined && { quantity }),
              ...(isOutdatedVersion !== undefined && { isOutdatedVersion }),
            })
            .where(eq(customerDeploymentsTable.id, existingDepl.id));
        }
      }
    }

    res.json({ success: true, customer: updatedCust, message: "Customer and deployment record updated successfully!" });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 5. POST /api/portfolio/customers - Create new customer and optional deployment
productPortfolioRouter.post("/customers", requireAuth, async (req, res) => {
  try {
    const { orgName, contactName, contactTitle, contactEmail, region, cisaSector, productId, deployedVersion, quantity } = req.body;

    if (!orgName || !contactEmail) {
      return res.status(400).json({ success: false, error: "orgName and contactEmail are required" });
    }

    // Sync sequence generator to max(id) to avoid duplicate primary key collisions
    try {
      await db.execute(sql`SELECT setval(pg_get_serial_sequence('cra_enterprise_customers', 'id'), COALESCE((SELECT max(id) FROM cra_enterprise_customers), 1));`);
    } catch (e) {
      console.warn("Sequence reset warning:", e);
    }

    const [newCust] = await db
      .insert(enterpriseCustomersTable)
      .values({
        orgName,
        contactName: contactName || "Security Administrator",
        contactTitle: contactTitle || "CISO",
        contactEmail,
        region: region || "EU-Central",
        cisaSector: cisaSector || "Energy",
      })
      .returning();

    if (newCust && productId) {
      try {
        await db.execute(sql`SELECT setval(pg_get_serial_sequence('cra_customer_deployments', 'id'), COALESCE((SELECT max(id) FROM cra_customer_deployments), 1));`);
      } catch (e) {
        console.warn("Sequence reset warning for deployments:", e);
      }

      await db.insert(customerDeploymentsTable).values({
        customerId: newCust.id,
        productId,
        releaseId: 1,
        deployedVersion: deployedVersion || "v1.0.0",
        quantity: quantity || 1,
        isOutdatedVersion: false,
        notes: "Directly added via Customer Operations",
      });
    }

    res.json({ success: true, customer: newCust });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 6. DELETE /api/portfolio/customers/:id - Delete customer and deployments
productPortfolioRouter.delete("/customers/:id", requireAuth, async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    await db.delete(customerDeploymentsTable).where(eq(customerDeploymentsTable.customerId, id));
    await db.delete(enterpriseCustomersTable).where(eq(enterpriseCustomersTable.id, id));
    res.json({ success: true, message: `Customer #${id} deleted.` });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 7. POST /api/portfolio/ai-parse-file - Prescriptive AI Parsing for raw text (MD, CSV, Excel text)
productPortfolioRouter.post("/ai-parse-file", requireAuth, async (req, res) => {
  try {
    const { rawText, fileName } = req.body;
    if (!rawText || typeof rawText !== "string") {
      return res.status(400).json({ success: false, error: "rawText string is required" });
    }

    const lines = rawText.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
    const parsedItems: Array<{
      orgName: string;
      contactName: string;
      contactTitle: string;
      contactEmail: string;
      cisaSector: string;
      productName: string;
      deployedVersion: string;
      quantity: number;
    }> = [];

    for (const line of lines) {
      let parts: string[] = [];
      if (line.startsWith("|") && line.endsWith("|")) {
        parts = line.split("|").map((p) => p.trim()).filter((_, idx, arr) => idx > 0 && idx < arr.length - 1);
      } else if (line.includes(",") || line.includes("\t") || line.includes(";")) {
        const sep = line.includes("\t") ? "\t" : line.includes(";") ? ";" : ",";
        parts = line.split(sep).map((p) => p.trim().replace(/^"/, "").replace(/"$/, "").replace(/^'/, "").replace(/'$/, ""));
      }

      if (parts.length >= 2 && !parts[0]!.includes("---") && !parts[0]!.toLowerCase().includes("organization") && !parts[0]!.toLowerCase().includes("customer") && !parts[0]!.toLowerCase().includes("org")) {
        const emailMatch = line.match(/[\w.-]+@[\w.-]+\.\w+/);
        parsedItems.push({
          orgName: parts[0] || "Enterprise Customer",
          contactName: parts[1] && !parts[1].includes("@") ? parts[1] : "CISO Lead",
          contactTitle: parts[2] && !parts[2].includes("@") ? parts[2] : "Security Director",
          contactEmail: emailMatch ? emailMatch[0] : parts[3] || "security@enterprise.com",
          cisaSector: parts.find((p) => ["Energy", "Healthcare & Public Health", "Financial Services", "Critical Manufacturing", "Information Technology", "Transportation Systems", "Defense Industrial Base", "Chemical", "Communications", "Water & Wastewater Systems"].includes(p)) || "Energy",
          productName: parts.find((p) => p.toLowerCase().includes("hub") || p.toLowerCase().includes("vision") || p.toLowerCase().includes("controller") || p.toLowerCase().includes("pro") || p.toLowerCase().includes("system")) || "NovaGuard Smart Home Hub v2",
          deployedVersion: parts.find((p) => /^v?\d+\.\d+/.test(p)) || "v2.1.4",
          quantity: parseInt(parts.find((p) => /^\d+$/.test(p)) || "25", 10) || 25,
        });
      }
    }

    res.json({
      success: true,
      fileName,
      totalExtracted: parsedItems.length,
      parsedItems,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 8. GET /api/portfolio/psirt-impact/:cveId - Returns impacted products and customer accounts
productPortfolioRouter.get("/psirt-impact/:cveId", requireAuth, async (req, res) => {
  try {
    const { cveId } = req.params;
    const products = await db.select().from(craProductsTable);
    const impactedProducts = products.filter(
      (p) => p.hasActivePsirtIncident || (cveId && p.activeIncidentCve.toLowerCase().includes(cveId.toLowerCase()))
    );

    const deployments = await db.select().from(customerDeploymentsTable);
    const customers = await db.select().from(enterpriseCustomersTable);

    const impactedCustomersMap = new Map();
    for (const prod of impactedProducts) {
      const prodDeploys = deployments.filter((d) => d.productId === prod.id);
      for (const d of prodDeploys) {
        const cust = customers.find((c) => c.id === d.customerId);
        if (cust && !impactedCustomersMap.has(cust.id)) {
          impactedCustomersMap.set(cust.id, {
            ...cust,
            impactedProduct: prod.name,
            deployedVersion: d.deployedVersion,
            quantity: d.quantity,
            cveId: prod.activeIncidentCve || cveId,
          });
        }
      }
    }

    res.json({
      success: true,
      cveId,
      impactedProductsCount: impactedProducts.length,
      impactedProducts,
      impactedCustomersCount: impactedCustomersMap.size,
      impactedCustomers: Array.from(impactedCustomersMap.values()),
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ============================================================================
// PRODUCT-SPECIFIC DOCUMENT VAULT & 5-10 YEAR PROVENANCE API ENDPOINTS
// ============================================================================

// 9. GET /api/portfolio/products/:id/documents - List paginated documents for a product
productPortfolioRouter.get("/products/:id/documents", requireAuth, async (req, res) => {
  try {
    const productId = parseInt(req.params.id, 10);
    const page = Math.max(1, parseInt(req.query.page as string, 10) || 1);
    const limit = Math.max(1, parseInt(req.query.limit as string, 10) || 20);
    const category = req.query.category as string;

    // Reset sequence if needed
    try {
      await db.execute(sql`SELECT setval(pg_get_serial_sequence('cra_product_documents', 'id'), COALESCE((SELECT max(id) FROM cra_product_documents), 1));`);
    } catch (e) {
      console.warn("Sequence reset fallback for cra_product_documents:", e);
    }

    let docs: any[] = [];
    try {
      docs = await db
        .select()
        .from(productDocumentsTable)
        .where(eq(productDocumentsTable.productId, productId))
        .orderBy(desc(productDocumentsTable.id));
    } catch (e) {
      console.error("Error selecting productDocumentsTable:", e);
    }

    // Optional category filter
    if (category && category !== "ALL") {
      docs = docs.filter((d) => d.docCategory === category);
    }

    const total = docs.length;
    const totalPages = Math.ceil(total / limit) || 1;
    const startIndex = (page - 1) * limit;
    const paginatedDocs = docs.slice(startIndex, startIndex + limit);

    res.json({
      success: true,
      productId,
      documents: paginatedDocs,
      pagination: {
        total,
        page,
        limit,
        totalPages,
      },
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 10. POST /api/portfolio/products/:id/documents - Upload & register product document with SHA-256 provenance
productPortfolioRouter.post("/products/:id/documents", requireAuth, async (req, res) => {
  try {
    const productId = parseInt(req.params.id, 10);
    const {
      title,
      docCategory,
      description,
      fileVersion,
      originalFileName,
      mimeType,
      fileContentText,
      uploadedBy,
    } = req.body;

    if (!title || !originalFileName) {
      return res.status(400).json({ success: false, error: "title and originalFileName are required" });
    }

    const contentStr = fileContentText || `Official Statutory Compliance Document for Product #${productId}: ${title}`;
    const fileBytes = Buffer.byteLength(contentStr, "utf-8");
    const sha256Hash = crypto.createHash("sha256").update(contentStr).digest("hex");

    // Persistent storage directory path
    const uploadDir = path.join(process.cwd(), "uploads", "products", String(productId));
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const safeFileName = `${Date.now()}_${originalFileName.replace(/[^a-zA-Z0-9_.-]/g, "_")}`;
    const fullStoragePath = path.join(uploadDir, safeFileName);
    fs.writeFileSync(fullStoragePath, contentStr, "utf-8");

    const storagePathRelative = `/uploads/products/${productId}/${safeFileName}`;

    try {
      await db.execute(sql`SELECT setval(pg_get_serial_sequence('cra_product_documents', 'id'), COALESCE((SELECT max(id) FROM cra_product_documents), 1));`);
    } catch (e) {
      console.warn("Sequence reset warning for documents:", e);
    }

    const [newDoc] = await db
      .insert(productDocumentsTable)
      .values({
        productId,
        title,
        docCategory: docCategory || "Product Specification",
        description: description || "Statutory compliance proof file.",
        fileVersion: fileVersion || "v1.0",
        originalFileName,
        mimeType: mimeType || "text/markdown",
        fileSizeBytes: fileBytes,
        fileContentText: contentStr,
        storagePath: storagePathRelative,
        sha256Hash,
        uploadedBy: uploadedBy || "Marcus Vance (Security Lead)",
      })
      .returning();

    res.json({
      success: true,
      document: newDoc,
      message: `Successfully uploaded ${originalFileName} with SHA-256 provenance hash (${sha256Hash.slice(0, 12)}...)`,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 11. DELETE /api/portfolio/documents/:docId - Remove document record and file
productPortfolioRouter.delete("/documents/:docId", requireAuth, async (req, res) => {
  try {
    const docId = parseInt(req.params.docId, 10);
    const [existing] = await db
      .select()
      .from(productDocumentsTable)
      .where(eq(productDocumentsTable.id, docId));

    if (!existing) {
      return res.status(404).json({ success: false, error: "Document not found" });
    }

    // Delete database record
    await db.delete(productDocumentsTable).where(eq(productDocumentsTable.id, docId));

    // Try deleting file from disk if exists
    try {
      if (existing.storagePath) {
        const diskPath = path.join(process.cwd(), existing.storagePath);
        if (fs.existsSync(diskPath)) {
          fs.unlinkSync(diskPath);
        }
      }
    } catch (e) {
      console.warn("Could not delete file from disk:", e);
    }

    res.json({ success: true, message: `Document #${docId} removed from provenance vault.` });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 12. GET /api/portfolio/documents/:docId/download - Stream/download file attachment
productPortfolioRouter.get("/documents/:docId/download", requireAuth, async (req, res) => {
  try {
    const docId = parseInt(req.params.docId, 10);
    const [existing] = await db
      .select()
      .from(productDocumentsTable)
      .where(eq(productDocumentsTable.id, docId));

    if (!existing) {
      return res.status(404).json({ success: false, error: "Document not found" });
    }

    res.setHeader("Content-Type", existing.mimeType || "application/octet-stream");
    res.setHeader("Content-Disposition", `attachment; filename="${existing.originalFileName}"`);

    if (existing.fileContentText) {
      return res.send(existing.fileContentText);
    }

    const diskPath = path.join(process.cwd(), existing.storagePath);
    if (fs.existsSync(diskPath)) {
      return res.sendFile(diskPath);
    }

    res.status(404).json({ success: false, error: "Physical file binary not found on disk" });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});
