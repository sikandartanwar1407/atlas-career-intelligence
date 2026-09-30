from typing import Any, Dict, List
from fastapi import HTTPException, status
from app.database import get_supabase_client
from app.schemas.assessment import (
    AssessmentAnswerInput,
    AssessmentSubmitRequest,
    AssessmentSubmissionResponse,
    SkillDiagnosticResponse,
)

# Known answer key map for deterministic question validation
KNOWN_ANSWER_KEYS: Dict[str, int] = {
    # Data Analyst questions
    "sql-01": 1,
    "sql-02": 2,
    "sql-03": 1,
    "pbi-01": 1,
    "pbi-02": 2,
    "pbi-03": 1,
    "excel-01": 1,
    "excel-02": 2,
    "excel-03": 1,
    "python-01": 1,
    "python-02": 2,
    "python-03": 1,
    "story-01": 1,
    "story-02": 2,
    "story-03": 1,
}


def evaluate_question_correctness(question_id: str, selected_option: int, explicit_correct: Any = None) -> bool:
    """Evaluates whether the selected answer index is correct based on known question keys."""
    if explicit_correct is not None and isinstance(explicit_correct, bool):
        return explicit_correct

    # Check known question ID map
    if question_id in KNOWN_ANSWER_KEYS:
        return selected_option == KNOWN_ANSWER_KEYS[question_id]

    # Pattern-based generation conventions (-q1 -> 0, -q2 -> 1, -q3 -> 2)
    if question_id.endswith("-q1"):
        return selected_option == 0
    elif question_id.endswith("-q2"):
        return selected_option == 1
    elif question_id.endswith("-q3"):
        return selected_option == 2

    # Default fallback: option index 0
    return selected_option == 0


def submit_assessment(user_id: str, req: AssessmentSubmitRequest) -> AssessmentSubmissionResponse:
    """Evaluates and persists candidate assessment submission and generates skill diagnostics.

    Derived user_id ensures strict candidate isolation.
    """
    supabase = get_supabase_client()

    # 1. Resolve candidate_id from candidate_profiles
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
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Candidate profile not found. Please complete profile setup before submitting an assessment.",
        )

    candidate_id = profile_res.data["id"]

    # 2. Group answers by skill and evaluate correctness
    skill_stats: Dict[str, Dict[str, int]] = {}
    evaluated_answers: List[Dict[str, Any]] = []

    for ans in req.answers:
        is_corr = evaluate_question_correctness(ans.question_id, ans.selected_option, ans.is_correct)
        evaluated_answers.append({
            "question_id": ans.question_id,
            "skill_name": ans.skill_name,
            "selected_option": ans.selected_option,
            "is_correct": is_corr,
        })

        if ans.skill_name not in skill_stats:
            skill_stats[ans.skill_name] = {"correct": 0, "total": 0}

        skill_stats[ans.skill_name]["total"] += 1
        if is_corr:
            skill_stats[ans.skill_name]["correct"] += 1

    # 3. Calculate skill scores and diagnostics
    diagnostics_list: List[Dict[str, Any]] = []
    self_ratings = req.self_ratings or {}

    for skill_name, stats in skill_stats.items():
        total = stats["total"]
        correct = stats["correct"]
        accuracy = (correct / total) if total > 0 else 0.5
        demonstrated_score = max(0, min(100, round(accuracy * 100)))

        baseline_score = self_ratings.get(skill_name, 50)
        role_threshold = 80
        gap = max(role_threshold - demonstrated_score, 0)

        # Priority Level calculation matching scoringService
        if gap >= 25:
            priority_level = "HIGH PRIORITY"
            evidence_status = "Missing"
            desc = f"Critical competency deficit in {skill_name}. Immediate calibration required."
        elif gap >= 12:
            priority_level = "MEDIUM PRIORITY"
            evidence_status = "Moderate"
            desc = f"Moderate capability gap in {skill_name}. Additional practice recommended."
        else:
            priority_level = "LOW PRIORITY"
            evidence_status = "Strong"
            desc = f"Demonstrated competency in {skill_name} meets target threshold."

        strat_note = f"Focus sprint roadmap and evidence artifacts on {skill_name} capabilities."

        diagnostics_list.append({
            "candidate_id": str(candidate_id),
            "skill_name": skill_name,
            "display_name": skill_name,
            "baseline_score": baseline_score,
            "demonstrated_score": demonstrated_score,
            "role_threshold": role_threshold,
            "gap": gap,
            "priority_level": priority_level,
            "evidence_status": evidence_status,
            "description": desc,
            "strategic_note": strat_note,
        })

    # Sort diagnostics by gap descending
    diagnostics_list.sort(key=lambda d: d["gap"], reverse=True)

    if diagnostics_list:
        overall_demonstrated = round(
            sum(d["demonstrated_score"] for d in diagnostics_list) / len(diagnostics_list)
        )
        largest_gap_skill = diagnostics_list[0]["skill_name"]
    else:
        overall_demonstrated = 50
        largest_gap_skill = "General"

    # 4. Save assessment_submissions record
    try:
        sub_payload = {
            "candidate_id": str(candidate_id),
            "role_id": req.role_id,
            "overall_demonstrated": overall_demonstrated,
            "largest_gap_skill": largest_gap_skill,
        }
        sub_resp = supabase.table("assessment_submissions").insert(sub_payload).execute()
        if not sub_resp.data or len(sub_resp.data) == 0:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to record assessment submission.",
            )
        submission_record = sub_resp.data[0]
        submission_id = submission_record["id"]
    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Database error while saving assessment submission.",
        ) from exc

    # 5. Save individual answers to assessment_answers
    try:
        answers_payload = [
            {
                "submission_id": str(submission_id),
                "question_id": a["question_id"],
                "skill_name": a["skill_name"],
                "selected_option": a["selected_option"],
                "is_correct": a["is_correct"],
            }
            for a in evaluated_answers
        ]
        if answers_payload:
            supabase.table("assessment_answers").insert(answers_payload).execute()
    except Exception as exc:
        # Non-fatal logging for answers
        print(f"[AssessmentService] Warning saving assessment answers: {exc}")

    # 6. Save or update candidate_skill_diagnostics
    saved_diagnostics: List[SkillDiagnosticResponse] = []
    try:
        if diagnostics_list:
            diag_resp = (
                supabase.table("candidate_skill_diagnostics")
                .upsert(diagnostics_list, on_conflict="candidate_id,skill_name")
                .execute()
            )
            if diag_resp.data:
                for row in diag_resp.data:
                    saved_diagnostics.append(SkillDiagnosticResponse(**row))
    except Exception as exc:
        print(f"[AssessmentService] Warning updating skill diagnostics: {exc}")
        # Fallback to in-memory diagnostic models
        for diag in diagnostics_list:
            saved_diagnostics.append(SkillDiagnosticResponse(**diag))

    # 7. Update candidate_skill_ratings if self_ratings provided
    if self_ratings:
        try:
            ratings_rows = [
                {
                    "candidate_id": str(candidate_id),
                    "skill_name": skill,
                    "baseline_score": max(0, min(100, score)),
                }
                for skill, score in self_ratings.items()
            ]
            supabase.table("candidate_skill_ratings").upsert(
                ratings_rows, on_conflict="candidate_id,skill_name"
            ).execute()
        except Exception as exc:
            print(f"[AssessmentService] Warning updating candidate skill ratings: {exc}")

    return AssessmentSubmissionResponse(
        id=submission_record["id"],
        candidate_id=submission_record["candidate_id"],
        role_id=submission_record["role_id"],
        overall_demonstrated=submission_record["overall_demonstrated"],
        largest_gap_skill=submission_record["largest_gap_skill"],
        completed_at=submission_record.get("completed_at") or submission_record.get("created_at"),
        created_at=submission_record.get("created_at"),
        skill_diagnostics=saved_diagnostics if saved_diagnostics else [SkillDiagnosticResponse(**d) for d in diagnostics_list],
        answers_count=len(evaluated_answers),
    )


def get_latest_assessment(user_id: str) -> AssessmentSubmissionResponse:
    """Retrieves the latest assessment submission and diagnostics for the authenticated user."""
    supabase = get_supabase_client()

    # 1. Resolve candidate_id
    try:
        profile_res = (
            supabase.table("candidate_profiles")
            .select("id")
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

    # 2. Query latest assessment_submissions record
    try:
        sub_res = (
            supabase.table("assessment_submissions")
            .select("*")
            .eq("candidate_id", candidate_id)
            .order("completed_at", desc=True)
            .limit(1)
            .execute()
        )
        if not sub_res.data or len(sub_res.data) == 0:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="No assessment submissions found for this candidate.",
            )
        latest_sub = sub_res.data[0]
    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Database error while fetching latest assessment.",
        ) from exc

    # 3. Query candidate_skill_diagnostics
    diagnostics: List[SkillDiagnosticResponse] = []
    try:
        diag_res = (
            supabase.table("candidate_skill_diagnostics")
            .select("*")
            .eq("candidate_id", candidate_id)
            .order("gap", desc=True)
            .execute()
        )
        if diag_res.data:
            diagnostics = [SkillDiagnosticResponse(**row) for row in diag_res.data]
    except Exception as exc:
        print(f"[AssessmentService] Warning retrieving diagnostics: {exc}")

    # 4. Count submitted answers
    answers_count = 0
    try:
        ans_res = (
            supabase.table("assessment_answers")
            .select("id", count="exact")
            .eq("submission_id", latest_sub["id"])
            .execute()
        )
        answers_count = ans_res.count if ans_res.count is not None else len(ans_res.data or [])
    except Exception:
        pass

    return AssessmentSubmissionResponse(
        id=latest_sub["id"],
        candidate_id=latest_sub["candidate_id"],
        role_id=latest_sub["role_id"],
        overall_demonstrated=latest_sub["overall_demonstrated"],
        largest_gap_skill=latest_sub["largest_gap_skill"],
        completed_at=latest_sub.get("completed_at") or latest_sub.get("created_at"),
        created_at=latest_sub.get("created_at"),
        skill_diagnostics=diagnostics,
        answers_count=answers_count,
    )
