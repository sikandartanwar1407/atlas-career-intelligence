from typing import Any, Dict, List, Optional
from fastapi import HTTPException, status
from app.database import get_supabase_client
from app.schemas.roadmap import RoadmapActionItem, RoadmapResponse, RoadmapStepItem


def calculate_skill_hours_allocation(
    availability_hours: float,
    diagnostics: List[Dict[str, Any]],
) -> Dict[str, float]:
    """Calculates weighted hours allocation per skill based on diagnostic deficit gaps."""
    if not diagnostics:
        return {}

    weights: Dict[str, float] = {}
    total_weight = 0.0

    for d in diagnostics:
        gap = float(d.get("gap", 0))
        weight = gap if gap > 0 else 5.0
        if d.get("priority_level") == "HIGH PRIORITY":
            weight *= 1.4
        weights[d["skill_name"]] = weight
        total_weight += weight

    allocations: Dict[str, float] = {}
    allocated_sum = 0.0

    for d in diagnostics:
        s_name = d["skill_name"]
        raw = (weights[s_name] / max(total_weight, 1.0)) * availability_hours
        rounded = round(raw * 2.0) / 2.0
        allocations[s_name] = max(0.5, rounded)
        allocated_sum += allocations[s_name]

    # Reconcile rounding to match availability_hours
    diff = round((availability_hours - allocated_sum) * 2.0) / 2.0
    first_skill = diagnostics[0]["skill_name"]
    if diff != 0.0 and first_skill in allocations:
        allocations[first_skill] = max(0.5, allocations[first_skill] + diff)

    return allocations


def generate_candidate_roadmap(user_id: str) -> RoadmapResponse:
    """Generates or regenerates career roadmap milestones and actions from latest skill diagnostics."""
    supabase = get_supabase_client()

    # 1. Resolve candidate profile
    try:
        profile_res = (
            supabase.table("candidate_profiles")
            .select("id, target_role, availability_hours_per_week")
            .eq("user_id", user_id)
            .maybe_single()
            .execute()
        )
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Database error while resolving candidate profile.",
        ) from exc

    if not profile_res or not profile_res.data:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Candidate profile not found.",
        )

    candidate_id = profile_res.data["id"]
    target_role = profile_res.data.get("target_role") or "Data Analyst"
    availability_hours = float(profile_res.data.get("availability_hours_per_week") or 10.0)

    # 2. Fetch diagnostics
    try:
        diag_res = (
            supabase.table("candidate_skill_diagnostics")
            .select("*")
            .eq("candidate_id", candidate_id)
            .order("gap", desc=True)
            .execute()
        )
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Database error while fetching skill diagnostics.",
        ) from exc

    if not diag_res or not diag_res.data or len(diag_res.data) == 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No skill diagnostics found for this candidate. Please complete an assessment before generating a roadmap.",
        )

    diagnostics = diag_res.data
    allocations = calculate_skill_hours_allocation(availability_hours, diagnostics)

    # 3. Build and upsert roadmap steps
    roadmap_steps: List[RoadmapStepItem] = []
    step_records_to_upsert: List[Dict[str, Any]] = []

    for idx, d in enumerate(diagnostics):
        skill_name = d["skill_name"]
        gap = int(d.get("gap", 0))
        priority = d.get("priority_level", "MEDIUM PRIORITY")
        slug = skill_name.lower().replace(" ", "-").replace("/", "-")
        step_id = f"step-{slug}"
        step_number = idx + 1
        allocated = allocations.get(skill_name, 2.5)

        if gap >= 25:
            est_weeks = "3 Weeks"
        elif gap >= 12:
            est_weeks = "2 Weeks"
        else:
            est_weeks = "1 Week"

        title = f"Calibrate {skill_name} Competency"
        description = (
            f"Triage and close the {gap}% competency deficit in {skill_name} through targeted practice, "
            f"portfolio builds, and technical defense."
        )

        step_records_to_upsert.append({
            "candidate_id": str(candidate_id),
            "step_id": step_id,
            "step_number": step_number,
            "skill_name": skill_name,
            "priority": priority,
            "gap": gap,
            "allocated_hours": allocated,
            "estimated_duration_weeks": est_weeks,
            "title": title,
            "description": description,
            "is_completed": False,
        })

    try:
        step_upsert_res = (
            supabase.table("candidate_roadmaps")
            .upsert(step_records_to_upsert, on_conflict="candidate_id,step_id")
            .execute()
        )
        saved_steps = step_upsert_res.data or []
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Database error while saving roadmap steps.",
        ) from exc

    # 4. Generate and upsert 4 standardized actions per step
    all_actions_to_upsert: List[Dict[str, Any]] = []
    actions_by_step: Dict[str, List[RoadmapActionItem]] = {}

    for step_row in saved_steps:
        s_id = step_row["id"]
        s_step_id = step_row["step_id"]
        s_skill = step_row["skill_name"]

        standard_actions = [
            {
                "roadmap_step_id": str(s_id),
                "action_id": f"{s_step_id}-act-1",
                "action_type": "Learn",
                "title": f"Study {s_skill} core principles and specifications",
                "description": f"Deep review of standard architectural conventions and foundational constructs.",
                "estimated_minutes": 45,
                "is_completed": False,
            },
            {
                "roadmap_step_id": str(s_id),
                "action_id": f"{s_step_id}-act-2",
                "action_type": "Practice",
                "title": f"Practice practical {s_skill} drills and problem sets",
                "description": f"Solve 10 industry scenario challenges isolating edge cases and optimizations.",
                "estimated_minutes": 60,
                "is_completed": False,
            },
            {
                "roadmap_step_id": str(s_id),
                "action_id": f"{s_step_id}-act-3",
                "action_type": "Build",
                "title": f"Build production-ready verified {s_skill} portfolio artifact",
                "description": f"Synthesize a complete demonstrable project implementing robust data/code structures.",
                "estimated_minutes": 90,
                "is_completed": False,
            },
            {
                "roadmap_step_id": str(s_id),
                "action_id": f"{s_step_id}-act-4",
                "action_type": "Defend",
                "title": f"Technical walkthrough and {s_skill} documentation defense",
                "description": f"Formulate a technical architectural defense memorandum justifying design tradeoffs.",
                "estimated_minutes": 45,
                "is_completed": False,
            },
        ]
        all_actions_to_upsert.extend(standard_actions)

    try:
        if all_actions_to_upsert:
            act_upsert_res = (
                supabase.table("candidate_roadmap_actions")
                .upsert(all_actions_to_upsert, on_conflict="roadmap_step_id,action_id")
                .execute()
            )
            saved_actions = act_upsert_res.data or []
            for act in saved_actions:
                st_id = str(act["roadmap_step_id"])
                if st_id not in actions_by_step:
                    actions_by_step[st_id] = []
                actions_by_step[st_id].append(RoadmapActionItem(**act))
    except Exception as exc:
        print(f"[RoadmapService] Warning saving roadmap actions: {exc}")

    # Assemble structured response
    for s_row in saved_steps:
        st_id = str(s_row["id"])
        step_item = RoadmapStepItem(
            id=s_row["id"],
            candidate_id=s_row["candidate_id"],
            step_id=s_row["step_id"],
            step_number=s_row["step_number"],
            skill_name=s_row["skill_name"],
            priority=s_row["priority"],
            gap=s_row["gap"],
            allocated_hours=float(s_row["allocated_hours"]),
            estimated_duration_weeks=s_row["estimated_duration_weeks"],
            title=s_row["title"],
            description=s_row["description"],
            is_completed=s_row.get("is_completed", False),
            created_at=s_row.get("created_at"),
            updated_at=s_row.get("updated_at"),
            actions=actions_by_step.get(st_id, []),
        )
        roadmap_steps.append(step_item)

    roadmap_steps.sort(key=lambda x: x.step_number)
    total_allocated = sum(s.allocated_hours for s in roadmap_steps)
    completed_steps = sum(1 for s in roadmap_steps if s.is_completed)

    return RoadmapResponse(
        candidate_id=candidate_id,
        target_role=target_role,
        total_steps=len(roadmap_steps),
        completed_steps=completed_steps,
        total_allocated_hours=total_allocated,
        steps=roadmap_steps,
    )


def get_candidate_roadmap(user_id: str) -> RoadmapResponse:
    """Retrieves the authenticated candidate's current roadmap and actions."""
    supabase = get_supabase_client()

    # 1. Resolve candidate profile
    try:
        profile_res = (
            supabase.table("candidate_profiles")
            .select("id, target_role")
            .eq("user_id", user_id)
            .maybe_single()
            .execute()
        )
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Database error while resolving candidate profile.",
        ) from exc

    if not profile_res or not profile_res.data:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Candidate profile not found.",
        )

    candidate_id = profile_res.data["id"]
    target_role = profile_res.data.get("target_role") or "Data Analyst"

    # 2. Fetch steps
    try:
        steps_res = (
            supabase.table("candidate_roadmaps")
            .select("*")
            .eq("candidate_id", candidate_id)
            .order("step_number", desc=False)
            .execute()
        )
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Database error while fetching candidate roadmap.",
        ) from exc

    if not steps_res or not steps_res.data or len(steps_res.data) == 0:
        # Check if diagnostics exist to auto-generate roadmap
        diag_res = (
            supabase.table("candidate_skill_diagnostics")
            .select("id")
            .eq("candidate_id", candidate_id)
            .limit(1)
            .execute()
        )
        if diag_res and diag_res.data:
            return generate_candidate_roadmap(user_id)

        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No career roadmap found for this candidate. Please complete an assessment first.",
        )

    step_rows = steps_res.data
    step_ids = [str(r["id"]) for r in step_rows]

    # 3. Fetch actions for all steps
    actions_by_step: Dict[str, List[RoadmapActionItem]] = {}
    try:
        if step_ids:
            act_res = (
                supabase.table("candidate_roadmap_actions")
                .select("*")
                .in_("roadmap_step_id", step_ids)
                .execute()
            )
            if act_res.data:
                for a in act_res.data:
                    s_id = str(a["roadmap_step_id"])
                    if s_id not in actions_by_step:
                        actions_by_step[s_id] = []
                    actions_by_step[s_id].append(RoadmapActionItem(**a))
    except Exception as exc:
        print(f"[RoadmapService] Warning fetching roadmap actions: {exc}")

    roadmap_steps: List[RoadmapStepItem] = []
    for s_row in step_rows:
        st_id = str(s_row["id"])
        step_item = RoadmapStepItem(
            id=s_row["id"],
            candidate_id=s_row["candidate_id"],
            step_id=s_row["step_id"],
            step_number=s_row["step_number"],
            skill_name=s_row["skill_name"],
            priority=s_row["priority"],
            gap=s_row["gap"],
            allocated_hours=float(s_row["allocated_hours"]),
            estimated_duration_weeks=s_row["estimated_duration_weeks"],
            title=s_row["title"],
            description=s_row["description"],
            is_completed=s_row.get("is_completed", False),
            created_at=s_row.get("created_at"),
            updated_at=s_row.get("updated_at"),
            actions=actions_by_step.get(st_id, []),
        )
        roadmap_steps.append(step_item)

    total_allocated = sum(s.allocated_hours for s in roadmap_steps)
    completed_steps = sum(1 for s in roadmap_steps if s.is_completed)

    return RoadmapResponse(
        candidate_id=candidate_id,
        target_role=target_role,
        total_steps=len(roadmap_steps),
        completed_steps=completed_steps,
        total_allocated_hours=total_allocated,
        steps=roadmap_steps,
    )
