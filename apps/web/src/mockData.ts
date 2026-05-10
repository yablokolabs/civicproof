import type { DashboardPayload } from './domain';

export const demoDashboard: DashboardPayload = {
  stats: {
    totalPromises: 4,
    fulfilled: 1,
    onTrack: 2,
    atRisk: 1,
    blocked: 0,
    averageProgress: 58,
  },
  promises: [
    {
      id: 'green-buses-2030',
      title: 'Convert 60% of city buses to zero-emission vehicles',
      owner: 'Mayor Elena Park',
      district: 'Metro City',
      status: 'on_track',
      deadline: '2030-12-31',
      progress: 42,
      claim: 'Procurement contract signed for the first 180 electric buses.',
      evidence: [
        {
          label: 'Transport committee vote',
          source: 'City Council minutes',
          url: 'https://example.com/transport-vote',
        },
        {
          label: 'Procurement award notice',
          source: 'Open Contracting Portal',
          url: 'https://example.com/procurement-award',
        },
      ],
      blockers: ['Charging depot permitting still pending in two boroughs.'],
    },
    {
      id: 'clinic-access',
      title: 'Open five weekend primary-care clinics',
      owner: 'Assembly Member Rowan Iqbal',
      district: 'North District 8',
      status: 'fulfilled',
      deadline: '2026-09-01',
      progress: 100,
      claim: 'Five clinics are operating Saturday hours with published schedules.',
      evidence: [
        {
          label: 'Clinic operating schedules',
          source: 'Health Department',
          url: 'https://example.com/clinic-hours',
        },
      ],
      blockers: [],
    },
    {
      id: 'youth-grant',
      title: 'Launch a youth apprenticeship grant for 10,000 residents',
      owner: 'Senator Amara Costa',
      district: 'Statewide',
      status: 'on_track',
      deadline: '2027-06-30',
      progress: 63,
      claim: '6,325 verified participants enrolled after the second quarterly report.',
      evidence: [
        {
          label: 'Quarterly enrollment report',
          source: 'Labor Agency',
          url: 'https://example.com/labor-q2',
        },
      ],
      blockers: ['Rural employer matching rate below target.'],
    },
    {
      id: 'housing-permits',
      title: 'Cut affordable housing permit review time by 30%',
      owner: 'Councilor Priya Menon',
      district: 'Westside Ward',
      status: 'at_risk',
      deadline: '2026-12-31',
      progress: 27,
      claim: 'Median review time fell from 142 days to 128 days, short of target pace.',
      evidence: [
        {
          label: 'Permit dashboard export',
          source: 'Planning Department',
          url: 'https://example.com/permit-dashboard',
        },
      ],
      blockers: ['Legacy zoning appeals queue is delaying high-density projects.'],
    },
  ],
  claims: [
    {
      id: 'budget-cap-youth-grant',
      statement: 'The youth apprenticeship grant allocation stays within the published $120M cap.',
      verification: 'machine_checked',
      confidence: 0.99,
      receipts: [
        {
          label: 'Lean theorem: approved_allocation_stays_within_cap',
          source: 'proofs/lean/CivicProof/Policy/Budget.lean',
          url: 'https://github.com/yablokolabs/civicproof/tree/main/proofs/lean',
        },
      ],
    },
    {
      id: 'clinic-hours-source-check',
      statement: 'All five promised weekend clinics publish Saturday operating hours.',
      verification: 'source_checked',
      confidence: 0.92,
      receipts: [
        {
          label: 'Public clinic schedule archive',
          source: 'Health Department',
          url: 'https://example.com/clinic-hours',
        },
      ],
    },
    {
      id: 'permit-review-time-needs-review',
      statement: 'Affordable housing permit review time is falling fast enough to hit the 30% target.',
      verification: 'needs_review',
      confidence: 0.61,
      receipts: [
        {
          label: 'Planning department permit export',
          source: 'Planning Department',
          url: 'https://example.com/permit-dashboard',
        },
      ],
    },
  ],
};
