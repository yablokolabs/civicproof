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
