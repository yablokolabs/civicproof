import { useEffect, useMemo, useState } from 'react';
import type { CivicPromise, DashboardPayload, PolicyClaim, PromiseStatus } from './domain';
import { demoDashboard } from './mockData';

const API_BASE = import.meta.env.VITE_CIVICPROOF_API ?? 'http://127.0.0.1:8787';

const statusLabels: Record<PromiseStatus, string> = {
  fulfilled: 'Fulfilled',
  on_track: 'On track',
  at_risk: 'At risk',
  blocked: 'Blocked',
};

const statusCopy: Record<PromiseStatus, string> = {
  fulfilled: 'Promise delivered and backed by receipts.',
  on_track: 'Milestones are moving at a credible pace.',
  at_risk: 'Progress exists, but the deadline or target is under pressure.',
  blocked: 'Delivery depends on an unresolved external constraint.',
};

function formatDate(date: string): string {
  return new Intl.DateTimeFormat('en', { month: 'short', day: 'numeric', year: 'numeric' }).format(new Date(date));
}

function statusClass(status: PromiseStatus): string {
  return `status-pill status-${status.replace('_', '-')}`;
}

function App() {
  const [dashboard, setDashboard] = useState<DashboardPayload>(demoDashboard);
  const [selectedPromiseId, setSelectedPromiseId] = useState(demoDashboard.promises[0]?.id ?? '');
  const [apiState, setApiState] = useState<'demo' | 'live' | 'offline'>('demo');

  useEffect(() => {
    const controller = new AbortController();

    async function loadDashboard() {
      try {
        const response = await fetch(`${API_BASE}/api/dashboard`, { signal: controller.signal });
        if (!response.ok) {
          throw new Error(`API returned ${response.status}`);
        }
        const payload = (await response.json()) as DashboardPayload;
        setDashboard(payload);
        setSelectedPromiseId(payload.promises[0]?.id ?? '');
        setApiState('live');
      } catch (error) {
        if (!controller.signal.aborted) {
          setApiState('offline');
        }
      }
    }

    loadDashboard();
    return () => controller.abort();
  }, []);

  const selectedPromise = useMemo(
    () => dashboard.promises.find((item) => item.id === selectedPromiseId) ?? dashboard.promises[0],
    [dashboard.promises, selectedPromiseId],
  );

  return (
    <main className="shell">
      <section className="hero">
        <div className="hero-copy">
          <p className="eyebrow">Civic transparency, with receipts</p>
          <h1>Promise ledgers politicians can campaign on — and citizens can verify.</h1>
          <p className="lede">
            CivicProof tracks commitments, sources every claim, and introduces a Lean-backed path to machine-check
            policy rules like eligibility and budget caps.
          </p>
          <div className="hero-actions">
            <a href="#ledger" className="button primary">Explore ledger</a>
            <a href="https://github.com/yablokolabs/civicproof" className="button secondary">View repo</a>
          </div>
        </div>
        <div className="trust-card" aria-label="Verification summary">
          <div className="trust-card-topline">
            <span>Verification score</span>
            <strong>94%</strong>
          </div>
          <div className="radial-meter" role="presentation">
            <span>Lean + sources</span>
          </div>
          <ul>
            <li>Signed evidence receipts</li>
            <li>Machine-checkable policy constraints</li>
            <li>Public changelog for every status update</li>
          </ul>
        </div>
      </section>

      <section className="stats-grid" aria-label="Ledger statistics">
        <StatCard label="Total promises" value={dashboard.stats.totalPromises.toString()} tone="blue" />
        <StatCard label="Fulfilled" value={dashboard.stats.fulfilled.toString()} tone="green" />
        <StatCard label="On track" value={dashboard.stats.onTrack.toString()} tone="purple" />
        <StatCard label="Average progress" value={`${dashboard.stats.averageProgress}%`} tone="amber" />
      </section>

      <section id="ledger" className="ledger-layout">
        <aside className="promise-list" aria-label="Tracked promises">
          <div className="section-heading-row">
            <div>
              <p className="eyebrow">Public promise ledger</p>
              <h2>Commitments</h2>
            </div>
            <span className={`api-badge api-${apiState}`}>{apiState === 'live' ? 'Live API' : 'Demo data'}</span>
          </div>
          {dashboard.promises.map((promise) => (
            <button
              className={`promise-row ${promise.id === selectedPromise?.id ? 'active' : ''}`}
              key={promise.id}
              type="button"
              onClick={() => setSelectedPromiseId(promise.id)}
            >
              <span className={statusClass(promise.status)}>{statusLabels[promise.status]}</span>
              <strong>{promise.title}</strong>
              <span>{promise.owner} · {promise.district}</span>
            </button>
          ))}
        </aside>

        {selectedPromise ? <PromiseDetail promise={selectedPromise} /> : null}
      </section>

      <section className="verification-grid">
        <div className="panel dark-panel">
          <p className="eyebrow">Lean verification layer</p>
          <h2>Policy claims can become executable public contracts.</h2>
          <p>
            The MVP includes Lean proofs for budget caps and eligibility rules. In production, each verified rule becomes
            a reusable template attached to a bill, manifesto promise, or budget line item.
          </p>
          <code>theorem approved_allocation_stays_within_cap</code>
        </div>
        <div className="claim-stack">
          {dashboard.claims.map((claim) => <ClaimCard claim={claim} key={claim.id} />)}
        </div>
      </section>
    </main>
  );
}

function StatCard({ label, value, tone }: { label: string; value: string; tone: 'blue' | 'green' | 'purple' | 'amber' }) {
  return (
    <article className={`stat-card stat-${tone}`}>
      <span>{label}</span>
      <strong>{value}</strong>
    </article>
  );
}

function PromiseDetail({ promise }: { promise: CivicPromise }) {
  return (
    <article className="promise-detail">
      <div className="promise-detail-header">
        <span className={statusClass(promise.status)}>{statusLabels[promise.status]}</span>
        <span className="deadline">Deadline {formatDate(promise.deadline)}</span>
      </div>
      <h2>{promise.title}</h2>
      <p className="owner-line">{promise.owner} · {promise.district}</p>
      <p className="claim-box">“{promise.claim}”</p>
      <div className="progress-block">
        <div className="progress-copy">
          <strong>{promise.progress}% complete</strong>
          <span>{statusCopy[promise.status]}</span>
        </div>
        <div className="progress-track" aria-label={`${promise.progress}% complete`}>
          <span style={{ width: `${promise.progress}%` }} />
        </div>
      </div>
      <div className="detail-columns">
        <div>
          <h3>Receipts</h3>
          <ul className="receipt-list">
            {promise.evidence.map((item) => (
              <li key={item.label}>
                <a href={item.url}>{item.label}</a>
                <span>{item.source}</span>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h3>Known blockers</h3>
          {promise.blockers.length > 0 ? (
            <ul className="blocker-list">
              {promise.blockers.map((blocker) => <li key={blocker}>{blocker}</li>)}
            </ul>
          ) : (
            <p className="empty-state">No active blockers reported.</p>
          )}
        </div>
      </div>
    </article>
  );
}

function ClaimCard({ claim }: { claim: PolicyClaim }) {
  return (
    <article className="claim-card">
      <div className="claim-topline">
        <span className={`verification-pill verification-${claim.verification.replace('_', '-')}`}>
          {claim.verification.replace('_', ' ')}
        </span>
        <strong>{Math.round(claim.confidence * 100)}%</strong>
      </div>
      <p>{claim.statement}</p>
      {claim.receipts.map((receipt) => (
        <a className="receipt-chip" href={receipt.url} key={receipt.label}>{receipt.label}</a>
      ))}
    </article>
  );
}

export default App;
