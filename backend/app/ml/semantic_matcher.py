"""ATLAS Semantic Matcher & Cosine Similarity Engine.

Computes semantic similarity between resume competencies and job description
criteria using Sentence-BERT embeddings (all-MiniLM-L6-v2) with seamless
fallback to scikit-learn TF-IDF + Cosine Similarity.
"""

import json
import os
import re
from typing import Any, Dict, List, Optional, Set, Tuple

import numpy as np

# Embedding model imports with graceful fallback
try:
    from sentence_transformers import SentenceTransformer
    HAVE_SENTENCE_TRANSFORMERS = True
except ImportError:
    HAVE_SENTENCE_TRANSFORMERS = False

from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity


class SemanticMatcher:
    """Computes semantic overlap, direct matches, and competency deficits."""

    _sbert_model = None

    def __init__(self, model_name: str = "all-MiniLM-L6-v2", taxonomy_path: Optional[str] = None):
        self.model_name = model_name
        if taxonomy_path is None:
            base_dir = os.path.dirname(os.path.abspath(__file__))
            taxonomy_path = os.path.join(base_dir, "data", "skills_esco_canonical.json")
        self.taxonomy_path = taxonomy_path
        self.skills_db: List[Dict[str, Any]] = []
        self._load_taxonomy()

    def _load_taxonomy(self) -> None:
        if os.path.exists(self.taxonomy_path):
            try:
                with open(self.taxonomy_path, "r", encoding="utf-8") as f:
                    self.skills_db = json.load(f).get("skills", [])
            except Exception as exc:
                print(f"[SemanticMatcher] Taxonomy error: {exc}")

    @classmethod
    def get_sbert_model(cls, model_name: str = "all-MiniLM-L6-v2"):
        """Lazy loader for SentenceTransformer singleton to save startup time."""
        if cls._sbert_model is None and HAVE_SENTENCE_TRANSFORMERS:
            try:
                cls._sbert_model = SentenceTransformer(model_name)
            except Exception as exc:
                print(f"[SemanticMatcher] SBERT load notice: {exc}. Using TF-IDF fallback.")
                cls._sbert_model = None
        return cls._sbert_model

    def extract_jd_requirements(self, jd_text: str) -> List[Dict[str, Any]]:
        """Extracts required competencies from raw job description text."""
        clean_text = jd_text.lower()
        extracted: List[Dict[str, Any]] = []
        seen: Set[str] = set()

        for skill_entry in self.skills_db:
            canonical = skill_entry.get("canonical", "")
            aliases = skill_entry.get("aliases", [canonical.lower()])
            category = skill_entry.get("category", "General")

            matched = False
            for alias in aliases:
                a_clean = alias.strip().lower()
                if not a_clean:
                    continue
                if len(a_clean) <= 3:
                    pat = rf"(?:\b|(?<=[^a-zA-Z0-9]))" + re.escape(a_clean) + rf"(?:\b|(?=[^a-zA-Z0-9]))"
                else:
                    pat = rf"\b" + re.escape(a_clean) + rf"\b"

                if re.search(pat, clean_text):
                    matched = True
                    break

            if matched and canonical not in seen:
                seen.add(canonical)
                # Check if marked as required vs preferred
                is_preferred = bool(re.search(rf"\b(preferred|plus|nice to have|bonus)\b[^\n]*{re.escape(canonical.lower())}", clean_text))
                extracted.append({
                    "skill": canonical,
                    "category": category,
                    "requirement_type": "preferred" if is_preferred else "required",
                    "min_level": 70 if not is_preferred else 55,
                })

        # Fallback if no canonical skills found: extract sentence clauses
        if not extracted:
            lines = [l.strip() for l in jd_text.split("\n") if len(l.strip()) > 15]
            for idx, line in enumerate(lines[:6]):
                extracted.append({
                    "skill": f"Core Competency {idx+1}",
                    "category": "Core",
                    "requirement_type": "required",
                    "min_level": 65,
                    "raw_clause": line
                })

        return extracted

    def compute_match(
        self,
        resume_skills: List[str],
        resume_text: str,
        jd_text: str,
        custom_requirements: Optional[List[str]] = None,
    ) -> Dict[str, Any]:
        """Calculates semantic alignment between candidate profile and JD."""
        # 1. Identify JD requirements
        if custom_requirements:
            jd_reqs = [{"skill": s, "category": "Required", "requirement_type": "required", "min_level": 70} for s in custom_requirements]
        else:
            jd_reqs = self.extract_jd_requirements(jd_text)

        if not jd_reqs:
            return {
                "match_percentage": 50,
                "direct_matches": resume_skills[:3],
                "semantic_matches": [],
                "missing_skills": [],
                "detailed_comparison": [],
                "engine_used": "heuristic"
            }

        req_names = [r["skill"] for r in jd_reqs]

        # 2. Vector computation: Sentence-BERT or TF-IDF
        model = self.get_sbert_model()
        engine_used = "Sentence-BERT (all-MiniLM-L6-v2)" if model is not None else "TF-IDF N-gram Cosine"

        direct_matches: List[str] = []
        semantic_matches: List[Dict[str, Any]] = []
        missing_skills: List[Dict[str, Any]] = []
        comparison_items: List[Dict[str, Any]] = []

        total_weight = 0.0
        weighted_score = 0.0

        resume_skills_lower = [s.lower() for s in resume_skills]

        if model is not None:
            # Semantic Sentence-BERT path
            candidate_corpus = [f"{s} proficiency, experience, and implementation." for s in resume_skills]
            if not candidate_corpus:
                candidate_corpus = [resume_text[:1000] or "General engineering background"]

            cand_embeddings = model.encode(candidate_corpus, convert_to_numpy=True)
            req_embeddings = model.encode([f"Required skill and proficiency in {s}." for s in req_names], convert_to_numpy=True)

            sim_matrix = cosine_similarity(req_embeddings, cand_embeddings)  # shape: (len(req_names), len(cand))
        else:
            # Scikit-learn TF-IDF path
            corpus = resume_skills + [resume_text[:2000]]
            vectorizer = TfidfVectorizer(ngram_range=(1, 2), sublinear_tf=True)
            try:
                all_docs = corpus + req_names
                tfidf_matrix = vectorizer.fit_transform(all_docs)
                req_vecs = tfidf_matrix[len(corpus):]
                cand_vecs = tfidf_matrix[:len(corpus)]
                sim_matrix = cosine_similarity(req_vecs, cand_vecs)
            except Exception:
                sim_matrix = np.zeros((len(req_names), max(1, len(resume_skills))))

        for i, req in enumerate(jd_reqs):
            skill_name = req["skill"]
            req_type = req.get("requirement_type", "required")
            weight = 1.0 if req_type == "required" else 0.5
            total_weight += weight

            # Check direct exact match first
            is_direct = skill_name.lower() in resume_skills_lower or any(skill_name.lower() in s for s in resume_skills_lower)

            best_sim = float(np.max(sim_matrix[i])) if sim_matrix.shape[1] > 0 else 0.0
            if is_direct:
                best_sim = max(best_sim, 0.95)

            if is_direct or best_sim >= 0.82:
                direct_matches.append(skill_name)
                weighted_score += weight * 1.0
                status_tag = "Direct Match"
            elif best_sim >= 0.58:
                semantic_matches.append({
                    "skill": skill_name,
                    "similarity": round(best_sim, 2),
                    "note": f"Semantically aligned via related domain background ({int(best_sim*100)}% similarity)"
                })
                weighted_score += weight * (best_sim * 0.85)
                status_tag = "Semantic Match"
            else:
                missing_skills.append({
                    "skill": skill_name,
                    "category": req.get("category", "Core"),
                    "priority": "HIGH" if req_type == "required" else "MEDIUM",
                    "deficit_score": int(round((1.0 - best_sim) * 100))
                })
                status_tag = "Missing"

            comparison_items.append({
                "skill": skill_name,
                "category": req.get("category", "Core"),
                "requirement_type": req_type,
                "similarity_score": round(best_sim, 2),
                "status": status_tag
            })

        raw_percentage = (weighted_score / max(0.1, total_weight)) * 100
        # Calibrate overall match score to a realistic candidate readiness scale (15% - 98%)
        match_percentage = int(min(98, max(15, round(raw_percentage))))

        return {
            "match_percentage": match_percentage,
            "engine_used": engine_used,
            "direct_matches": direct_matches,
            "semantic_matches": semantic_matches,
            "missing_skills": missing_skills,
            "detailed_comparison": comparison_items,
            "total_requirements_analyzed": len(jd_reqs)
        }

