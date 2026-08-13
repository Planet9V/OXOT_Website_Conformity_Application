# CLAUDE.md — OXOT Website Conformity Application

## The project brain (binding — query before you explore)

This repo is wired to its own dedicated gbrain database,
`oxot_web_conformity`, via `.mcp.json` (`mcp__gbrain__*` tools). It is **not**
the personal `gbrain` brain and not shared with OXOT_Website_JULY2026 (that
repo has its own database, `oxot_web`) — each project's brain holds only that
project's markdown docs, embedded via OpenRouter (`qwen/qwen3-embedding-4b`,
truncated to 1536 dims; pgvector HNSW index).

- **At the start of any non-trivial task, query the brain first**, before
  grepping or reading files broadly: `mcp__gbrain__query` (hybrid semantic
  search, preferred) or `mcp__gbrain__search` (keyword). Fall back to file
  search only when the brain has no answer.
- Cite what you find by slug, e.g. `[docs/scoring]`.
- The brain covers **markdown only** — gbrain cannot index source code
  (`isSyncable()` accepts `.md`/`.mdx` only). For code, search the tree.
- The brain is a **snapshot**, not live. After changing docs, re-sync:
  `gbrain sync --repo .` (with `GBRAIN_DATABASE_URL` pointed at
  `oxot_web_conformity`). If a doc answer contradicts the working tree, the
  working tree wins.
- Requires `OPENROUTER_API_KEY` set in the shell that starts Claude Code
  (see `~/.zshrc`) — the MCP server can't embed queries without it.

## Stack

Runs as the `oxot_website_conformity_application` Docker stack (web on :8088,
api, pgvector db, migrate + seed one-shots). Develop against the running stack
rather than spinning up ad-hoc servers.
