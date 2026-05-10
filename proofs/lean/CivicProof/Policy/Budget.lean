namespace CivicProof.Policy

/-- A published budget line with a hard cap and the currently allocated amount. -/
structure Budget where
  cap : Nat
  allocated : Nat
  deriving Repr, DecidableEq

/-- The public guarantee that a budget line has not exceeded its cap. -/
def WithinCap (budget : Budget) : Prop :=
  budget.allocated <= budget.cap

/-- A proposed allocation is safe when the existing allocation plus the addition stays under cap. -/
def AddsWithinCap (budget : Budget) (additional : Nat) : Prop :=
  budget.allocated + additional <= budget.cap

/-- If a new allocation is approved under the cap, the resulting budget is still within cap. -/
theorem approved_allocation_stays_within_cap
    (budget : Budget)
    (additional : Nat)
    (approval : AddsWithinCap budget additional) :
    WithinCap { cap := budget.cap, allocated := budget.allocated + additional } := by
  exact approval

/-- A simple resident model for eligibility-style policy rules. -/
structure Resident where
  age : Nat
  district : Nat
  deriving Repr, DecidableEq

/-- Example rule: youth grants apply to residents age 16+ in district 8. -/
def EligibleForYouthGrant (resident : Resident) : Prop :=
  16 <= resident.age ∧ resident.district = 8

/-- Every verified youth-grant recipient satisfies the published age floor. -/
theorem verified_youth_grant_recipient_meets_age_floor
    (resident : Resident)
    (eligibility : EligibleForYouthGrant resident) :
    16 <= resident.age := by
  exact eligibility.left

/-- Every verified youth-grant recipient belongs to the promised district. -/
theorem verified_youth_grant_recipient_is_in_district
    (resident : Resident)
    (eligibility : EligibleForYouthGrant resident) :
    resident.district = 8 := by
  exact eligibility.right

end CivicProof.Policy
