# Insider Buying Tracker

Next.js + PostgreSQL MVP scaffold for US and ASX insider-disclosure monitoring.

## Current implementation
- Responsive dashboard backed by PostgreSQL.
- Transaction schema stores source IDs, insider roles, founder flag, market, consideration, transaction classification and source URL.
- Filters-ready JSON endpoint: `GET /api/transactions?market=US&q=...`
- Authenticated ingestion endpoint: `POST /api/ingest` with `Authorization: Bearer $INGESTION_TOKEN`.
- Signal logic for repeat buyers, multiple distinct insiders per ticker, and large reported purchases.
- No minimum purchase filter in the data model: all purchase sizes can be retained.
- Dashboard-only alert design; no email or push notifications.

## Important: source adapters are not yet implemented
This is a deployable application scaffold, not a live data subscription. The SEC and ASX ingestion adapters must be implemented and validated before relying on the dashboard. Never describe an empty dashboard as evidence that no insiders bought shares.

### US / SEC
Use SEC EDGAR public filing data and Form 4 XML/JSON filing documents. SEC APIs and archives have fair-access rules and require a descriptive `User-Agent` with contact information. Poll submissions/company filing data on a schedule, identify Form 4 filings, parse non-derivative transactions, and classify transaction codes carefully:
- `P`: open-market or private purchase; inspect footnotes/context to distinguish open-market.
- `A`: grant/award, not a cash purchase.
- `M`: option exercise, not an open-market purchase.
- `S`: sale.
Retain accession number + issuer CIK + owner CIK as a stable source key. Resolve ticker/company and insider role against filing cover page and issuer mapping. Form 4 is generally due within two business days of the transaction, subject to applicable rules/exceptions.

### Australia / ASX
Use the ASX announcements feed/API or an appropriately licensed data vendor that provides announcement metadata and documents. Find Appendix 3Y notices (change in director's interests) and any relevant substantial-holder/other insider disclosures if the product scope includes them. Appendix 3Y only covers directors; it will not by itself capture all founders, executives, employees or other insiders. Obtain rights/permission for automated access and document redistribution; do not assume the public website grants unrestricted bulk scraping or commercial reuse.
Parse each transaction table and distinguish on-market purchases from off-market transfers, grants, rights, vesting and exercises. Stable source key should include ASX announcement ID/document identifier. Preserve original announcement link and document timestamp. For non-director insiders, source coverage must be established with an additional provider/source and role mapping.

### Signals
- Large purchases: configurable currency-specific thresholds (starter dashboard: 500,000 in reported currency).
- Repeat buyer: same normalized person + ticker has at least two qualifying purchases. Production logic should use a rolling period (e.g. 180 days) and deduplicate filings/amendments.
- Cluster: at least two distinct insiders with qualifying purchases in the same ticker within a rolling period (e.g. 30 days).
- Include both gross and net share changes; exclude grants/awards and option exercises from "cash purchases". Label private purchases separately unless verified open-market.
- Currency amounts are not directly comparable. Never aggregate USD and AUD without FX conversion and an explicit FX timestamp/source.

## Run locally
1. Install Node.js 20+ and PostgreSQL 15+.
2. `cp .env.example .env`; set a strong random `INGESTION_TOKEN`, SEC user agent and database URL.
3. `npm install`
4. `npx prisma generate`
5. `npx prisma db push`
6. `npm run dev`
7. Optional demo record: `npm run db:seed`

Open http://localhost:3000.

## Deploy
Recommended: Vercel (Next.js app) + managed PostgreSQL (Neon, Supabase or Railway) + a scheduled worker on GitHub Actions, Render Cron or a small worker service.
- Set all `.env.example` values in the hosting secret manager.
- Run `npx prisma db push` or a reviewed Prisma migration as a release step.
- Deploy the Next.js app.
- Deploy the ingestion worker separately; schedule US checks at least every 15–30 minutes during US filing activity and ASX checks every 15–30 minutes during ASX business hours, subject to provider rate limits and feed latency.
- Use retries with exponential backoff, per-source cursors, filing amendment handling, idempotent upserts, structured logs and ingestion-run monitoring.
- Restrict ingestion endpoint to worker token; rotate secrets. Add authentication and per-user watchlists before exposing to multiple users.
- Add tests against known SEC Form 4 examples and ASX Appendix 3Y examples before production launch.

## Production hardening still required
1. Implement SEC and ASX provider adapters and secure licensed ASX data access.
2. Expand issuer/insider identity resolution (CIK/ASX code, aliases, role history, founder verification).
3. Add rolling-window signal queries and configurable thresholds.
4. Add pagination, interactive search/filter UI, watchlist persistence and user authentication.
5. Add tests, rate limiting, audit logs, monitoring, backups and legal review of data licensing.
6. Do not market as real-time: filings are published after transactions and may be corrected/amended.
