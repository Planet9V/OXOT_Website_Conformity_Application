import { db, pagesTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { reindexContent } from "./artifacts/api-server/src/lib/rag";

async function run() {
  console.log("Checking pages in DB...");
  const pages = await db.select().from(pagesTable);
  console.log(`Total pages in DB: ${pages.length}`);

  for (const page of pages) {
    console.log(`Page: id=${page.id}, slug=${page.slug}, status=${page.status}, title="${page.title}"`);
    if (page.status !== "published") {
      await db.update(pagesTable).set({ status: "published" }).where(eq(pagesTable.id, page.id));
      console.log(`Updated page ${page.id} to status='published'`);
    }
  }

  console.log("Triggering reindexContent()...");
  const count = await reindexContent();
  console.log(`Reindex complete! Total indexed chunks: ${count}`);

  process.exit(0);
}

run().catch((err) => {
  console.error("Error:", err);
  process.exit(1);
});
