from typing import Any, Dict, List
from fastapi import HTTPException, status
from app.database import get_supabase_client
from app.schemas.assessment import (
    AssessmentAnswerInput,
    AssessmentSubmitRequest,
    AssessmentSubmissionResponse,
    SkillDiagnosticResponse,
)

# Known answer key map for deterministic question validation (theory MCQ)
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

# Known expected output mapping for coding challenges
KNOWN_CODING_EXPECTED: Dict[str, str] = {
    # Data Analyst & SQL
    "code-sql-01": "2",
    "sql-cd-01": "2",
    "sql-cd-02": "3",
    "sql-cd-03": "250",
    "be-sql-cd-01": "2",
    # Power BI
    "code-pbi-01": "200000",
    "pbi-cd-01": "200000",
    "pbi-cd-02": "20",
    # Excel
    "code-excel-01": "250",
    "xls-cd-01": "250",
    "xls-cd-02": "180",
    # Python
    "code-py-01": "['alpha', 'gamma']",
    "py-cd-01": "['alpha', 'gamma']",
    "py-cd-02": "[1, 9, 25]",
    "py-cd-03": "90",
    # JavaScript / Frontend
    "code-js-01": "50",
    "js-cd-01": "50",
    "js-cd-02": "19",
    "js-cd-03": "50",
    "fe-js-cd-01": "50",
    "fe-js-cd-02": "19",
    "fe-css-cd-01": "250",
    "fe-re-cd-01": "3",
    "fe-ui-cd-01": "40",
    "fe-perf-cd-01": "56.25",
    # REST APIs / Backend
    "code-api-01": "422",
    "api-cd-01": "422",
    "api-cd-02": "token_xyz_77",
    "be-api-cd-01": "422",
    "be-api-cd-02": "token_xyz_77",
    "sys-cd-01": "7",
    "cld-dep-cd-01": "8000",
    # Software Engineering & CS
    "code-ds-01": "[9, 2]",
    "ds-cd-01": "[9, 2]",
    "ds-cd-02": "[10, 20]",
    "sw-oop-cd-01": "36",
    "algo-cd-01": "4",
    "git-cd-01": "2",
    "swe-cd-01": "400",
    # Docker
    "doc-cd-01": "8080",
    "doc-cd-02": "2",
    # Data Storytelling
    "code-story-01": "110",
    "story-cd-01": "110",
    "story-cd-02": "10",
    # Security
    "sec-cd-01": "6",
    "sec-cd-02": "HIGH",
    # ML
    "ml-cd-01": "80",
    "ml-cd-02": "90",
    # Cloud
    "cld-cd-01": "6",
    "cld-cd-02": "43.2",
    # Product
    "pm-cd-01": "600",
    "pm-cd-02": "45",
}


def normalize_code_output(text: Any) -> str:
    """Performs deterministic answer normalization on code output predictions."""
    if text is None:
        return ""
    norm = str(text).replace("\r\n", "\n").replace("\r", "\n").strip()
    # Normalize curly quotes
    norm = norm.replace("“", '"').replace("”", '"').replace("‘", "'").replace("’", "'")
    lines = [line.strip() for line in norm.split("\n")]
    return "\n".join(lines).strip()


def verify_coding_answer(expected: str, submitted: Any) -> bool:
    """Deterministically verifies submitted output against expected output."""
    norm_exp = normalize_code_output(expected)
    norm_sub = normalize_code_output(submitted)
    if not norm_sub:
        return False
    if norm_exp == norm_sub:
        return True
    if norm_exp.lower() == norm_sub.lower():
        return True
    import re
    if re.sub(r"\s+", " ", norm_exp) == re.sub(r"\s+", " ", norm_sub):
        return True
    if norm_exp.replace(",", "").replace(";", "").replace(".", "") == norm_sub.replace(",", "").replace(";", "").replace(".", ""):
        return True
    return False


def evaluate_question_correctness(
    question_id: str,
    selected_option: int,
    explicit_correct: Any = None,
    question_type: str = "theory",
    submitted_text: Any = None,
) -> bool:
    """Evaluates question correctness based on question type, known answer keys, and deterministic normalization."""
    # 1. Check for skipped coding question
    if selected_option == -1 or submitted_text == "__SKIPPED__":
        return False

    # 2. Check explicit boolean override
    if explicit_correct is not None and isinstance(explicit_correct, bool):
        return explicit_correct

    # 3. Handle Coding Challenges
    if question_type == "coding" or question_id.endswith("-coding") or question_id.startswith("code-"):
        # Match against known coding bank
        expected = None
        for k, exp in KNOWN_CODING_EXPECTED.items():
            if k in question_id:
                expected = exp
                break
        if expected is None:
            # Fallback expected for dynamic coding templates
            if "sql" in question_id:
                expected = "2"
            elif "py" in question_id:
                expected = "['alpha', 'gamma']"
            elif "pbi" in question_id or "power-bi" in question_id:
                expected = "200000"
            elif "excel" in question_id:
                expected = "250"
            elif "story" in question_id:
                expected = "110"
            elif "js" in question_id or "javascript" in question_id:
                expected = "50"
            elif "api" in question_id:
                expected = "422"
            elif "ds" in question_id:
                expected = "[9, 2]"
            else:
                expected = "3"

        if submitted_text is not None:
            return verify_coding_answer(expected, submitted_text)
        return selected_option == 1

    # 4. Handle Theory / MCQ Questions
    if question_id in KNOWN_ANSWER_KEYS:
        return selected_option == KNOWN_ANSWER_KEYS[question_id]

    if question_id.endswith("-theory"):
        return selected_option == 0
    if question_id.endswith("-q1"):
        return selected_option == 0
    elif question_id.endswith("-q2"):
        return selected_option == 1
    elif question_id.endswith("-q3"):
        return selected_option == 2

    # Default fallback: option index 0
    return selected_option == 0


def submit_assessment(user_id: str, req: AssessmentSubmitRequest) -> AssessmentSubmissionResponse:
    """Evaluates and persists candidate hybrid assessment submission and generates skill diagnostics."""
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

    # 2. Group answers by skill and evaluate correctness across theory and coding questions
    skill_stats: Dict[str, Dict[str, int]] = {}
    evaluated_answers: List[Dict[str, Any]] = []

    total_theory_count = 0
    total_theory_correct = 0
    total_coding_count = 0
    total_coding_correct = 0
    total_coding_skipped = 0

    for ans in req.answers:
        q_type = ans.question_type or ("coding" if "-coding" in ans.question_id or "code-" in ans.question_id else "theory")
        is_skipped = ans.selected_option == -1 or ans.submitted_text == "__SKIPPED__"

        is_corr = evaluate_question_correctness(
            question_id=ans.question_id,
            selected_option=ans.selected_option,
            explicit_correct=ans.is_correct,
            question_type=q_type,
            submitted_text=ans.submitted_text,
        )

        final_option = -1 if is_skipped else (1 if (q_type == "coding" and is_corr) else (0 if (q_type == "coding" and not is_corr) else ans.selected_option))

        evaluated_answers.append({
            "question_id": ans.question_id,
            "skill_name": ans.skill_name,
            "selected_option": final_option,
            "is_correct": is_corr,
            "question_type": q_type,
            "is_skipped": is_skipped,
        })

        if ans.skill_name not in skill_stats:
            skill_stats[ans.skill_name] = {
                "theory_correct": 0,
                "theory_total": 0,
                "coding_correct": 0,
                "coding_skipped": 0,
                "coding_total": 0,
            }

        if q_type == "coding":
            total_coding_count += 1
            skill_stats[ans.skill_name]["coding_total"] += 1
            if is_skipped:
                total_coding_skipped += 1
                skill_stats[ans.skill_name]["coding_skipped"] += 1
            elif is_corr:
                total_coding_correct += 1
                skill_stats[ans.skill_name]["coding_correct"] += 1
        else:
            total_theory_count += 1
            skill_stats[ans.skill_name]["theory_total"] += 1
            if is_corr:
                total_theory_correct += 1
                skill_stats[ans.skill_name]["theory_correct"] += 1

    # 3. Calculate skill scores, performance notes, and diagnostics
    diagnostics_list: List[Dict[str, Any]] = []
    self_ratings = req.self_ratings or {}

    for skill_name, stats in skill_stats.items():
        t_tot = stats["theory_total"]
        t_cor = stats["theory_correct"]
        c_tot = stats["coding_total"]
        c_cor = stats["coding_correct"]
        c_skp = stats["coding_skipped"]

        total_q = t_tot + c_tot
        total_c = t_cor + c_cor

        if total_q > 0:
            demonstrated_score = max(0, min(100, round((total_c / total_q) * 100)))
        else:
            demonstrated_score = self_ratings.get(skill_name, 50)

        baseline_score = self_ratings.get(skill_name, 50)
        role_threshold = 80
        gap = max(role_threshold - demonstrated_score, 0)

        # Performance breakdown summaries
        theory_perf = f"{t_cor}/{t_tot} Demonstrated" if t_tot > 0 else "N/A"
        if c_skp > 0 and c_cor == 0:
            coding_perf = "Skipped — competency not demonstrated"
            competency_status = "skipped"
        elif c_tot > 0 and c_cor == 0:
            coding_perf = f"0/{c_tot} (Skill gap signal)"
            competency_status = "gap_signal"
        elif c_tot > 0 and c_cor > 0:
            coding_perf = f"{c_cor}/{c_tot} Demonstrated"
            competency_status = "demonstrated"
        else:
            coding_perf = "N/A"
            competency_status = "demonstrated" if gap < 15 else "gap_signal"

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
            "theory_performance": theory_perf,
            "coding_performance": coding_perf,
            "competency_status": competency_status,
        })

    # Sort diagnostics by gap descending
    diagnostics_list.sort(key=lambda d: d["gap"], reverse=True)

    theory_score = round((total_theory_correct / total_theory_count) * 100) if total_theory_count > 0 else 0
    coding_score = round((total_coding_correct / total_coding_count) * 100) if total_coding_count > 0 else 0

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
        theory_score=theory_score,
        coding_score=coding_score,
        theory_correct_count=total_theory_correct,
        theory_total_count=total_theory_count,
        coding_correct_count=total_coding_correct,
        coding_skipped_count=total_coding_skipped,
        coding_total_count=total_coding_count,
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

    # 4. Count and analyze submitted answers
    answers_count = 0
    theory_correct = 0
    theory_total = 0
    coding_correct = 0
    coding_skipped = 0
    coding_total = 0

    try:
        ans_res = (
            supabase.table("assessment_answers")
            .select("*")
            .eq("submission_id", latest_sub["id"])
            .execute()
        )
        if ans_res.data:
            answers_count = len(ans_res.data)
            for a in ans_res.data:
                q_id = a.get("question_id", "")
                is_coding = "-coding" in q_id or "code-" in q_id or a.get("selected_option") == -1
                if is_coding:
                    coding_total += 1
                    if a.get("selected_option") == -1:
                        coding_skipped += 1
                    elif a.get("is_correct"):
                        coding_correct += 1
                else:
                    theory_total += 1
                    if a.get("is_correct"):
                        theory_correct += 1
    except Exception:
        pass

    theory_score = round((theory_correct / theory_total) * 100) if theory_total > 0 else None
    coding_score = round((coding_correct / coding_total) * 100) if coding_total > 0 else None

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
        theory_score=theory_score,
        coding_score=coding_score,
        theory_correct_count=theory_correct,
        theory_total_count=theory_total,
        coding_correct_count=coding_correct,
        coding_skipped_count=coding_skipped,
        coding_total_count=coding_total,
    )
