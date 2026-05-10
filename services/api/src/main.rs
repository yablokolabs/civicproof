use axum::{
    extract::{Path, State},
    http::StatusCode,
    routing::get,
    Json, Router,
};
use serde::Serialize;
use std::{net::SocketAddr, sync::Arc};
use tower_http::cors::{Any, CorsLayer};

#[derive(Clone, Serialize)]
#[serde(rename_all = "camelCase")]
struct EvidenceLink {
    label: &'static str,
    source: &'static str,
    url: &'static str,
}

#[derive(Clone, Copy, Serialize, PartialEq, Eq)]
#[serde(rename_all = "snake_case")]
enum PromiseStatus {
    OnTrack,
    AtRisk,
    Fulfilled,
    Blocked,
}

#[derive(Clone, Serialize)]
#[serde(rename_all = "camelCase")]
struct CivicPromise {
    id: &'static str,
    title: &'static str,
    owner: &'static str,
    district: &'static str,
    status: PromiseStatus,
    deadline: &'static str,
    progress: u8,
    claim: &'static str,
    evidence: Vec<EvidenceLink>,
    blockers: Vec<&'static str>,
}

#[derive(Clone, Copy, Serialize)]
#[serde(rename_all = "snake_case")]
enum VerificationKind {
    MachineChecked,
    SourceChecked,
    NeedsReview,
}

#[derive(Clone, Serialize)]
#[serde(rename_all = "camelCase")]
struct PolicyClaim {
    id: &'static str,
    statement: &'static str,
    verification: VerificationKind,
    confidence: f32,
    receipts: Vec<EvidenceLink>,
}

#[derive(Clone)]
struct AppState {
    promises: Vec<CivicPromise>,
    claims: Vec<PolicyClaim>,
}

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
struct DashboardStats {
    total_promises: usize,
    fulfilled: usize,
    on_track: usize,
    at_risk: usize,
    blocked: usize,
    average_progress: u8,
}

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
struct DashboardResponse {
    promises: Vec<CivicPromise>,
    claims: Vec<PolicyClaim>,
    stats: DashboardStats,
}

#[derive(Serialize)]
struct HealthResponse {
    ok: bool,
    service: &'static str,
    version: &'static str,
}

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
struct VerificationResponse {
    claim: PolicyClaim,
    proof_hint: &'static str,
    next_step: &'static str,
}

#[tokio::main]
async fn main() {
    let port = std::env::var("PORT")
        .ok()
        .and_then(|value| value.parse::<u16>().ok())
        .unwrap_or(8787);
    let addr = SocketAddr::from(([127, 0, 0, 1], port));

    let listener = tokio::net::TcpListener::bind(addr)
        .await
        .expect("bind CivicProof API listener");

    println!("CivicProof API listening on http://{addr}");

    axum::serve(listener, app(seed_state()))
        .await
        .expect("run CivicProof API");
}

fn app(state: AppState) -> Router {
    let cors = CorsLayer::new()
        .allow_origin(Any)
        .allow_methods(Any)
        .allow_headers(Any);

    Router::new()
        .route("/health", get(health))
        .route("/api/dashboard", get(dashboard))
        .route("/api/promises", get(promises))
        .route("/api/claims/:id/verification", get(verify_claim))
        .layer(cors)
        .with_state(Arc::new(state))
}

async fn health() -> Json<HealthResponse> {
    Json(HealthResponse {
        ok: true,
        service: "civicproof-api",
        version: env!("CARGO_PKG_VERSION"),
    })
}

async fn dashboard(State(state): State<Arc<AppState>>) -> Json<DashboardResponse> {
    Json(DashboardResponse {
        promises: state.promises.clone(),
        claims: state.claims.clone(),
        stats: dashboard_stats(&state.promises),
    })
}

async fn promises(State(state): State<Arc<AppState>>) -> Json<Vec<CivicPromise>> {
    Json(state.promises.clone())
}

async fn verify_claim(
    Path(id): Path<String>,
    State(state): State<Arc<AppState>>,
) -> Result<Json<VerificationResponse>, StatusCode> {
    let claim = state
        .claims
        .iter()
        .find(|claim| claim.id == id)
        .cloned()
        .ok_or(StatusCode::NOT_FOUND)?;

    let proof_hint = match claim.verification {
        VerificationKind::MachineChecked => "Lean proof artifact available in proofs/lean.",
        VerificationKind::SourceChecked => "Receipts point to public source material; machine proof pending.",
        VerificationKind::NeedsReview => "Claim requires human review before public verification.",
    };

    Ok(Json(VerificationResponse {
        claim,
        proof_hint,
        next_step: "Attach signed receipt hash and publish changelog entry.",
    }))
}

fn dashboard_stats(promises: &[CivicPromise]) -> DashboardStats {
    let count = promises.len();
    let average_progress = if count == 0 {
        0
    } else {
        (promises.iter().map(|promise| promise.progress as usize).sum::<usize>() / count) as u8
    };

    DashboardStats {
        total_promises: count,
        fulfilled: count_status(promises, PromiseStatus::Fulfilled),
        on_track: count_status(promises, PromiseStatus::OnTrack),
        at_risk: count_status(promises, PromiseStatus::AtRisk),
        blocked: count_status(promises, PromiseStatus::Blocked),
        average_progress,
    }
}

fn count_status(promises: &[CivicPromise], status: PromiseStatus) -> usize {
    promises
        .iter()
        .filter(|promise| promise.status == status)
        .count()
}

fn seed_state() -> AppState {
    AppState {
        promises: vec![
            CivicPromise {
                id: "green-buses-2030",
                title: "Convert 60% of city buses to zero-emission vehicles",
                owner: "Mayor Elena Park",
                district: "Metro City",
                status: PromiseStatus::OnTrack,
                deadline: "2030-12-31",
                progress: 42,
                claim: "Procurement contract signed for the first 180 electric buses.",
                evidence: vec![
                    EvidenceLink {
                        label: "Transport committee vote",
                        source: "City Council minutes",
                        url: "https://example.com/transport-vote",
                    },
                    EvidenceLink {
                        label: "Procurement award notice",
                        source: "Open Contracting Portal",
                        url: "https://example.com/procurement-award",
                    },
                ],
                blockers: vec!["Charging depot permitting still pending in two boroughs."],
            },
            CivicPromise {
                id: "clinic-access",
                title: "Open five weekend primary-care clinics",
                owner: "Assembly Member Rowan Iqbal",
                district: "North District 8",
                status: PromiseStatus::Fulfilled,
                deadline: "2026-09-01",
                progress: 100,
                claim: "Five clinics are operating Saturday hours with published schedules.",
                evidence: vec![EvidenceLink {
                    label: "Clinic operating schedules",
                    source: "Health Department",
                    url: "https://example.com/clinic-hours",
                }],
                blockers: vec![],
            },
            CivicPromise {
                id: "youth-grant",
                title: "Launch a youth apprenticeship grant for 10,000 residents",
                owner: "Senator Amara Costa",
                district: "Statewide",
                status: PromiseStatus::OnTrack,
                deadline: "2027-06-30",
                progress: 63,
                claim: "6,325 verified participants enrolled after the second quarterly report.",
                evidence: vec![EvidenceLink {
                    label: "Quarterly enrollment report",
                    source: "Labor Agency",
                    url: "https://example.com/labor-q2",
                }],
                blockers: vec!["Rural employer matching rate below target."],
            },
            CivicPromise {
                id: "housing-permits",
                title: "Cut affordable housing permit review time by 30%",
                owner: "Councilor Priya Menon",
                district: "Westside Ward",
                status: PromiseStatus::AtRisk,
                deadline: "2026-12-31",
                progress: 27,
                claim: "Median review time fell from 142 days to 128 days, short of target pace.",
                evidence: vec![EvidenceLink {
                    label: "Permit dashboard export",
                    source: "Planning Department",
                    url: "https://example.com/permit-dashboard",
                }],
                blockers: vec!["Legacy zoning appeals queue is delaying high-density projects."],
            },
        ],
        claims: vec![
            PolicyClaim {
                id: "budget-cap-youth-grant",
                statement: "The youth apprenticeship grant allocation stays within the published $120M cap.",
                verification: VerificationKind::MachineChecked,
                confidence: 0.99,
                receipts: vec![EvidenceLink {
                    label: "Lean theorem: approved_allocation_stays_within_cap",
                    source: "proofs/lean/CivicProof/Policy/Budget.lean",
                    url: "https://github.com/yablokolabs/civicproof/tree/main/proofs/lean",
                }],
            },
            PolicyClaim {
                id: "clinic-hours-source-check",
                statement: "All five promised weekend clinics publish Saturday operating hours.",
                verification: VerificationKind::SourceChecked,
                confidence: 0.92,
                receipts: vec![EvidenceLink {
                    label: "Public clinic schedule archive",
                    source: "Health Department",
                    url: "https://example.com/clinic-hours",
                }],
            },
            PolicyClaim {
                id: "permit-review-time-needs-review",
                statement: "Affordable housing permit review time is falling fast enough to hit the 30% target.",
                verification: VerificationKind::NeedsReview,
                confidence: 0.61,
                receipts: vec![EvidenceLink {
                    label: "Planning department permit export",
                    source: "Planning Department",
                    url: "https://example.com/permit-dashboard",
                }],
            },
        ],
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn dashboard_counts_match_seed_data() {
        let state = seed_state();
        let stats = dashboard_stats(&state.promises);

        assert_eq!(stats.total_promises, 4);
        assert_eq!(stats.fulfilled, 1);
        assert_eq!(stats.on_track, 2);
        assert_eq!(stats.at_risk, 1);
        assert_eq!(stats.blocked, 0);
        assert_eq!(stats.average_progress, 58);
    }

    #[test]
    fn machine_checked_claim_has_high_confidence() {
        let state = seed_state();
        let claim = state
            .claims
            .iter()
            .find(|claim| claim.id == "budget-cap-youth-grant")
            .expect("seed claim exists");

        assert!(matches!(claim.verification, VerificationKind::MachineChecked));
        assert!(claim.confidence >= 0.95);
    }

    #[test]
    fn all_promise_progress_values_are_percentages() {
        let state = seed_state();
        assert!(state.promises.iter().all(|promise| promise.progress <= 100));
    }
}
