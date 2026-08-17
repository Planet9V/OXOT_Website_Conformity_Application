import express, { type Express, type Request, type Response, type NextFunction } from "express";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import pinoHttp from "pino-http";
import router from "./routes";
import { logger } from "./lib/logger";

const app: Express = express();

// Standard security response headers (CSP, X-Frame-Options,
// X-Content-Type-Options, HSTS, etc.) — this app previously shipped with
// none. Defaults are appropriate here: this server only ever returns JSON
// (the frontend HTML/JS/CSS is served separately by nginx), so helmet's
// default CSP (`default-src 'self'`) and Cross-Origin-Resource-Policy
// (`same-origin`) don't constrain any real document/asset loading — they
// just close off the case where a browser is ever tricked into rendering
// an API response as a document.
app.use(helmet());

// Behind Replit's proxy: trust X-Forwarded-For so req.ip is the real client
// address. Per-IP rate limiting and GDPR consent-IP capture both rely on this.
app.set("trust proxy", true);

app.use(
  pinoHttp({
    logger,
    serializers: {
      req(req) {
        return {
          id: req.id,
          method: req.method,
          url: req.url?.split("?")[0],
        };
      },
      res(res) {
        return {
          statusCode: res.statusCode,
        };
      },
    },
  }),
);
// Echo the per-request id (assigned by pino-http) back to the client so a
// user-reported failure can be traced to its exact server log line. Set before
// any route runs, so even error responses carry it.
app.use((req: Request, res: Response, next: NextFunction) => {
  res.setHeader("X-Request-Id", String(req.id));
  next();
});
// Expose the id to browser JS (CORS hides non-simple response headers by default).
// In every real deployment (local Docker `web`, Railway) nginx reverse-proxies
// /api/ onto the same origin as the frontend, so the browser never makes a
// genuinely cross-origin request — CORS approval is only relevant to local
// non-Docker dev (Vite on a different port than the API) and to any operator-
// configured origin via ALLOWED_ORIGINS. Reflecting any origin with
// credentials:true (the previous config) let any third-party site make
// credentialed requests directly to the API, bypassing that same-origin setup.
const allowedOrigins = (process.env["ALLOWED_ORIGINS"] ?? "")
  .split(",")
  .map((o) => o.trim())
  .filter(Boolean);
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) {
        // No Origin header: same-origin, curl, server-to-server — always allowed.
        callback(null, true);
        return;
      }
      if (process.env["NODE_ENV"] !== "production" || allowedOrigins.includes(origin)) {
        callback(null, true);
        return;
      }
      callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
    exposedHeaders: ["X-Request-Id"],
  }),
);
app.use(cookieParser());
// The local storage backend's upload PUT carries the FILE'S content type —
// which may be application/json (SBOMs). It must receive raw bytes, so it is
// excluded from the JSON body parser rather than parsed and destroyed by it.
const isLocalUploadPut = (req: Request) =>
  req.method === "PUT" &&
  (req.path.startsWith("/api/storage/uploads/local/") ||
    // The supplier door's token-scoped upload PUT (22.1) — same raw-bytes need.
    req.path.startsWith("/api/conformity/supplier-portal/upload/"));
app.use((req, res, next) =>
  isLocalUploadPut(req) ? express.raw({ type: () => true, limit: "55mb" })(req, res, next) : next(),
);
app.use((req, res, next) => (isLocalUploadPut(req) ? next() : express.json()(req, res, next)));
app.use(express.urlencoded({ extended: true }));

app.use("/api", router);

/**
 * Structural ZodError check. zod is not a direct dependency of this package
 * (schemas come pre-built from @workspace/api-zod), so instead of importing
 * the class we detect the stable shape every zod version emits: name
 * "ZodError" plus an `issues` array of { path, message } entries.
 */
function asZodIssues(err: unknown): { path: (string | number)[]; message: string }[] | null {
  if (!(err instanceof Error) || err.name !== "ZodError") return null;
  const issues = (err as unknown as { issues?: unknown }).issues;
  if (!Array.isArray(issues)) return null;
  return issues as { path: (string | number)[]; message: string }[];
}

/** body-parser signals a malformed JSON body as a SyntaxError with a `body` property. */
function isJsonParseError(err: unknown): boolean {
  return err instanceof SyntaxError && "body" in err;
}

// JSON error envelope for unhandled errors so clients always receive a stable
// shape instead of Express's HTML default.
//
// Client-caused failures are mapped to 400 with a readable message, so routes
// can keep their `Schema.parse(req.body)` style without per-route try/catch:
//  - ZodError (request didn't match the schema) -> lists the invalid paths
//  - body-parser SyntaxError (body isn't valid JSON)
// Everything else is a real server fault and stays a 500.
app.use((err: unknown, req: Request, res: Response, next: NextFunction) => {
  if (res.headersSent) {
    req.log.error({ err }, "Unhandled request error");
    next(err);
    return;
  }

  const issues = asZodIssues(err);
  if (issues) {
    // Safe to echo: paths/messages come from our own schemas, never the payload.
    const detail = issues
      .slice(0, 10)
      .map((i) => `${i.path.join(".") || "(body)"}: ${i.message}`)
      .join("; ");
    req.log.info({ issues: issues.length }, "Request failed validation");
    res.status(400).json({ error: `Invalid input — ${detail}` });
    return;
  }

  if (isJsonParseError(err)) {
    req.log.info("Request body is not valid JSON");
    res.status(400).json({ error: "Invalid input — request body is not valid JSON" });
    return;
  }

  req.log.error({ err }, "Unhandled request error");
  res.status(500).json({ error: "Internal server error" });
});

export default app;
