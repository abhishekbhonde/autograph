# Autograph server

Node.js, Express and Postgres API for creating and sharing signatures.

## Setup

```bash
npm install
cp .env.example .env        # then fill in DATABASE_URL
npm run migrate             # creates the table
npm run dev                 # http://localhost:3000
```

## Scripts

| Command | What it does |
|---|---|
| `npm run dev` | Start with auto-restart |
| `npm start` | Start normally |
| `npm run migrate` | Run every file in `migrations/` (safe to repeat) |
| `npm test` | Run the tests |

## Endpoints

| Method | URL | What it does |
|---|---|---|
| GET | `/api/health` | `{ "ok": true }` |
| POST | `/api/signatures` | Create. Returns `201 { id }` |
| GET | `/api/signatures/:id` | One signature, or `404` |
| GET | `/api/signatures?limit=20&cursor=...` | Hall of Fame, newest first. Returns `{ items, nextCursor }` |

`limit` is 1 to 50 (default 20). Pass `nextCursor` back as `cursor` to get the next page. `nextCursor` is `null` on the last page.

Create body:

```json
{
  "name": "Alex Morgan",
  "style": "scripts",
  "seed": 3,
  "settings": { "pen": 1.3, "ps": 0.7, "slant": 6, "shake": 0.6, "rise": 4, "sp": 1, "flo": true, "ink": "#14213d" }
}
```

Errors always come back as JSON: `{ "message": "...", "errors": ["..."] }`.

## Protection

- Validation of every field (unknown fields are rejected)
- 5 create attempts per minute per IP, counting rejected ones too (`429` after that)
- 10 KB body limit, `helmet` headers, CORS limited to `CORS_ORIGIN`
- Name filter (`BLOCKED_WORDS` in `.env` adds more words)
- The database also enforces name length, allowed styles and seed range

## Tests

```bash
npm test
```

Validation tests need no database. The database tests run when `TEST_DATABASE_URL` is set, and it **must be a different database** from `DATABASE_URL` because the tests empty the table.

## Deploying

Set these on the host: `DATABASE_URL`, `CORS_ORIGIN` (your frontend URL), `TRUST_PROXY=1`. Run `npm run migrate` once, then `npm start`.

## Files

```
src/
  server.js                       starts the server
  app.js                          builds the app (middleware and routes)
  config/db.js                    Postgres pool
  middleware/                     rate limiter, error handling
  utils/blockedWords.js           name filter
  modules/signatures/
    signatures.route.js           create, get one, list
    signatures.validation.js      validation rules
migrations/001_create_signatures.sql
scripts/migrate.js
tests/signatures.test.js
```

## Notes

- The list cursor stores the timestamp as text from Postgres, not as a JavaScript date. Postgres keeps microseconds and JavaScript only keeps milliseconds, so a date-based cursor can skip or repeat rows. A test covers this.
- Changing the drawing engine? Bump `ENGINE_VERSION` in `signatures.validation.js` so old entries can still be replayed correctly.
