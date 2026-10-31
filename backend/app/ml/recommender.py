"""ATLAS Pathway & Project Recommender System.

Content-based recommendation engine utilizing TF-IDF and Cosine Similarity
to map detected candidate skill gaps to targeted courses, hands-on production
projects, and defensible architectural milestones.
"""

import json
import os
from typing import Any, Dict, List, Optional

from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity


class PathwayRecommender:
    """Ranks courses and synthesizes customized project milestones."""

    def __init__(self, catalog_path: Optional[str] = None):
        if catalog_path is None:
            base_dir = os.path.dirname(os.path.abspath(__file__))
            catalog_path = os.path.join(base_dir, "data", "course_catalog.json")

        self.catalog_path = catalog_path
        self.catalog: List[Dict[str, Any]] = []
        self._load_catalog()

    def _load_catalog(self) -> None:
        if os.path.exists(self.catalog_path):
            try:
                with open(self.catalog_path, "r", encoding="utf-8") as f:
                    self.catalog = json.load(f).get("catalog", [])
            except Exception as exc:
                print(f"[PathwayRecommender] Catalog error: {exc}")

    def recommend_pathway(
        self,
        missing_skills: List[Dict[str, Any]],
        target_role: str = "Software Developer",
        available_hours_per_week: int = 10,
    ) -> Dict[str, Any]:
        """Generates a ranked curriculum and custom project milestone briefs."""
        if not missing_skills:
            return {
                "summary": "No critical skill deficits detected. Candidate matches all target criteria.",
                "total_estimated_weeks": 0,
                "recommended_courses": [],
                "custom_projects": [],
                "milestones": []
            }

        missing_names = [m.get("skill", "") if isinstance(m, dict) else str(m) for m in missing_skills]
        query_text = " ".join(missing_names)

        # 1. Vectorize catalog using TF-IDF
        catalog_corpus = [
            f"{c.get('skill', '')} {c.get('title', '')} {c.get('description', '')} {' '.join(c.get('tags', []))}"
            for c in self.catalog
        ]

        recommended_courses: List[Dict[str, Any]] = []
        if catalog_corpus and query_text.strip():
            vectorizer = TfidfVectorizer(ngram_range=(1, 2), sublinear_tf=True)
            try:
                all_docs = catalog_corpus + [query_text]
                tfidf_matrix = vectorizer.fit_transform(all_docs)
                catalog_vecs = tfidf_matrix[:-1]
                query_vec = tfidf_matrix[-1:]

                sims = cosine_similarity(query_vec, catalog_vecs)[0]
                ranked_indices = sims.argsort()[::-1]

                for idx in ranked_indices:
                    score = float(sims[idx])
                    if score > 0.08 or len(recommended_courses) < 3:
                        c_item = dict(self.catalog[idx])
                        c_item["relevance_score"] = round(score, 2)
                        recommended_courses.append(c_item)
                    if len(recommended_courses) >= 4:
                        break
            except Exception as exc:
                print(f"[PathwayRecommender] Vectorization notice: {exc}")
                recommended_courses = self.catalog[:3]
        else:
            recommended_courses = self.catalog[:3]

        # 2. Time budgeting across missing skills
        total_gaps = len(missing_names)
        hours_per_skill = max(1.5, round((available_hours_per_week / max(1, total_gaps)) * 2) / 2)

        # 3. Generate 4-Stage Pedagogical Milestones (Learn, Practice, Build, Defend)
        milestones: List[Dict[str, Any]] = []
        custom_projects: List[Dict[str, Any]] = []

        for idx, skill in enumerate(missing_names[:4]):
            matched_course = next((c for c in recommended_courses if c.get("skill", "").lower() == skill.lower()), None)
            project_title = matched_course.get("deliverable_project") if matched_course else f"Production-Grade {skill} Micro-Service"

            milestone = {
                "step_number": idx + 1,
                "skill": skill,
                "priority": "HIGH PRIORITY" if idx < 2 else "MEDIUM PRIORITY",
                "allocated_hours_per_week": hours_per_skill,
                "estimated_duration": "2-3 Weeks" if idx < 2 else "1-2 Weeks",
                "focus_area": f"Mastery of {skill} architecture & production standards for {target_role}",
                "actions": [
                    {
                        "stage": "Learn",
                        "title": f"{skill} Core Patterns & Industry Specifications",
                        "description": "Deep-dive into official documentation, design patterns, and anti-pattern mitigation.",
                        "estimated_minutes": 60,
                        "resource_title": matched_course.get("title") if matched_course else f"Official {skill} Guide"
                    },
                    {
                        "stage": "Practice",
                        "title": f"Targeted {skill} Code Drills & Edge Cases",
                        "description": "Hands-on implementation of syntax algorithms, data pipelines, and unit tests.",
                        "estimated_minutes": 90,
                        "resource_title": "Interactive Code Sandbox"
                    },
                    {
                        "stage": "Build",
                        "title": f"Deliverable: {project_title}",
                        "description": "End-to-end portfolio-grade application with automated tests and CI/CD workflow.",
                        "estimated_minutes": 180,
                        "resource_title": "ATLAS Evidence Locker Deliverable"
                    },
                    {
                        "stage": "Defend",
                        "title": f"{skill} Architectural Defense & Code Review",
                        "description": "Prepare a 1-page architecture decision record (ADR) justifying performance trade-offs.",
                        "estimated_minutes": 45,
                        "resource_title": "Evaluation Defense Rubric"
                    }
                ]
            }
            milestones.append(milestone)

            custom_projects.append({
                "skill": skill,
                "project_title": project_title,
                "target_deliverable": "Public GitHub Repository with README, tests, and Dockerfile",
                "recommended_hours": hours_per_skill * 3,
                "evidence_category": "GitHub Repository"
            })

        total_weeks = len(milestones) * 2

        return {
            "summary": f"Generated personalized pathway to bridge {len(missing_names)} identified competency deficits for {target_role}.",
            "target_role": target_role,
            "weekly_study_hours": available_hours_per_week,
            "total_estimated_weeks": total_weeks,
            "missing_competencies_count": len(missing_names),
            "recommended_courses": recommended_courses,
            "custom_projects": custom_projects,
            "milestones": milestones
        }

