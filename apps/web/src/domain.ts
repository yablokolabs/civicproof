export type PromiseStatus = 'on_track' | 'at_risk' | 'fulfilled' | 'blocked';

export interface EvidenceLink {
  label: string;
  source: string;
  url: string;
}

export interface CivicPromise {
  id: string;
  title: string;
  owner: string;
  district: string;
  status: PromiseStatus;
  deadline: string;
  progress: number;
  claim: string;
  evidence: EvidenceLink[];
  blockers: string[];
}

export interface PolicyClaim {
  id: string;
  statement: string;
  verification: 'machine_checked' | 'source_checked' | 'needs_review';
  confidence: number;
  receipts: EvidenceLink[];
}

export interface DashboardPayload {
  promises: CivicPromise[];
  claims: PolicyClaim[];
  stats: {
    totalPromises: number;
    fulfilled: number;
    onTrack: number;
    atRisk: number;
    blocked: number;
    averageProgress: number;
  };
}
