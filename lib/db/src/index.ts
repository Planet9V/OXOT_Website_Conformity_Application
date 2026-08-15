import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "./schema";

const { Pool } = pg;

type Db = ReturnType<typeof drizzle<typeof schema>>;

let cachedPool: pg.Pool | undefined;
let cachedDb: Db | undefined;

/**
 * The connection is opened on first use, not on import.
 *
 * This module used to throw at import time when DATABASE_URL was unset. Because
 * every route file imports it, that made 27 of 51 test files fail to collect —
 * they could not even be parsed, let alone run, so any real assertion failure
 * inside them was invisible. Deferring the check means a suite that never
 * touches the database runs fine, and one that does still fails loudly and with
 * the same message.
 */
function connect(): { pool: pg.Pool; db: Db } {
  if (!cachedDb || !cachedPool) {
    if (!process.env.DATABASE_URL) {
      throw new Error(
        "DATABASE_URL must be set. Did you forget to provision a database?",
      );
    }
    cachedPool = new Pool({ connectionString: process.env.DATABASE_URL });
    cachedDb = drizzle(cachedPool, { schema });
  }
  return { pool: cachedPool, db: cachedDb };
}

/**
 * Lazy stand-ins. Call sites keep using `db.select(...)` and `pool.query(...)`
 * unchanged; the connection is established the moment a property is read.
 */
function lazy<T extends object>(get: () => T): T {
  return new Proxy({} as T, {
    get(_target, prop, receiver) {
      const real = get() as any;
      const value = Reflect.get(real, prop, receiver);
      return typeof value === "function" ? value.bind(real) : value;
    },
    set(_target, prop, value) {
      return Reflect.set(get() as any, prop, value);
    },
    has(_target, prop) {
      return prop in (get() as any);
    },
  });
}

export const pool: pg.Pool = lazy(() => connect().pool);
export const db: Db = lazy(() => connect().db);

/** For tests and scripts that need to close cleanly. */
export async function closeDb(): Promise<void> {
  if (cachedPool) {
    await cachedPool.end();
    cachedPool = undefined;
    cachedDb = undefined;
  }
}

export * from "./schema";
