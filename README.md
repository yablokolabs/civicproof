# CivicProof

**CivicProof** is a public trust platform for politicians, campaigns, journalists, and citizens. It turns campaign promises, policy claims, votes, budgets, and delivery evidence into a transparent ledger anyone can inspect.

> Don't trust me — verify me.

## What this MVP demonstrates

- **Promise ledger** — track public commitments with owners, deadlines, evidence, and status.
- **Evidence-backed claims** — every political claim carries sources and a confidence trail.
- **Verification API** — a Rust service exposes commitments, dashboard stats, and claim verification metadata.
- **Public dashboard** — a React interface for voters and staff to explore promises and receipts.
- **Lean proof layer** — formal policy constraints that demonstrate how budget and eligibility rules can be machine-checked.

## Monorepo layout

```text
apps/web/        React + Vite transparency dashboard
services/api/    Rust API with seeded civic data
proofs/lean/     Lean proof artifacts for policy constraints
.github/         CI for web, API, and proofs
```

## Quick start

### Web dashboard

```bash
pnpm install
pnpm --dir apps/web dev
```

### Rust API

```bash
cargo run --manifest-path services/api/Cargo.toml
```

API defaults to `http://127.0.0.1:8787`.

Useful endpoints:

- `GET /health`
- `GET /api/dashboard`
- `GET /api/promises`
- `GET /api/claims/:id/verification`

### Lean proofs

```bash
cd proofs/lean
lake build
```

## Usage examples

### 1. Run the full local stack

Terminal 1 — start the Rust API:

```bash
cargo run --manifest-path services/api/Cargo.toml
```

Terminal 2 — start the React dashboard:

```bash
pnpm install
VITE_CIVICPROOF_API=http://127.0.0.1:8787 pnpm --dir apps/web dev
```

Open the printed Vite URL, usually `http://localhost:5173`.

### 2. Check API health

```bash
curl http://127.0.0.1:8787/health
```

Example response:

```json
{
  "ok": true,
  "service": "civicproof-api",
  "version": "0.1.0"
}
```

### 3. Pull the public dashboard payload

```bash
curl http://127.0.0.1:8787/api/dashboard | python3 -m json.tool
```

This returns the same structure the React app consumes. To print just the summary stats:

```bash
curl -s http://127.0.0.1:8787/api/dashboard \
  | python3 -c 'import json,sys; print(json.load(sys.stdin)["stats"])'
```

Example output:

```text
{'totalPromises': 4, 'fulfilled': 1, 'onTrack': 2, 'atRisk': 1, 'blocked': 0, 'averageProgress': 58}
```

### 4. Inspect a specific claim verification

```bash
curl http://127.0.0.1:8787/api/claims/budget-cap-youth-grant/verification \
  | python3 -m json.tool
```

Example use case: a journalist, campaign staffer, or civic watchdog can link a public claim to the proof or source trail behind it.

### 5. Add a new tracked promise

Seed data currently lives in `services/api/src/main.rs`. Add a new `CivicPromise` entry with:

- a stable `id`
- a public-facing `title`
- `owner` and `district`
- `status` and `progress`
- at least one evidence receipt
- blockers, if any

Then verify it locally:

```bash
cargo test --manifest-path services/api/Cargo.toml
cargo run --manifest-path services/api/Cargo.toml
curl http://127.0.0.1:8787/api/promises | python3 -m json.tool
```

### 6. Point the web app at another API

```bash
VITE_CIVICPROOF_API=https://api.example.org pnpm --dir apps/web build
```

If the API is offline, the dashboard falls back to bundled demo data so the public concept remains explorable.

### 7. Add a new Lean policy guarantee

Create or edit a file under `proofs/lean/CivicProof/Policy/`, then run:

```bash
cd proofs/lean
lake build
```

A good next theorem would prove that a published benefit rule cannot exclude a resident who satisfies every eligibility condition.

### 8. Run the same gates as CI

```bash
pnpm --dir apps/web typecheck
pnpm --dir apps/web build
cargo test --manifest-path services/api/Cargo.toml
cd proofs/lean && lake build
```

## Why Lean?

Most civic-tech tools visualize promises. CivicProof also aims to verify the rules behind policies:

- Does an allocation stay under a published budget cap?
- Does a benefit apply to every eligible person?
- Does a proposed change conflict with existing constraints?

The current Lean module is intentionally small, but it sketches the contract for a larger verified policy engine.

## Roadmap

- Import bills, votes, and budget documents from official sources.
- Add politician/campaign profiles and public changelogs.
- Build signed evidence receipts for every status update.
- Add district-level constituent issue clustering.
- Expand Lean proofs into reusable policy templates.
- Add authenticated staff workflows and public audit exports.

## License

MIT
