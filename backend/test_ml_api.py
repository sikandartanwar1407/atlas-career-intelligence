"""ATLAS Machine Learning & NLP API Test Suite.

Verifies:
1. /api/ml/parse-resume-text (Resume Information Extraction)
2. /api/ml/compare-jd (Sentence-BERT Semantic Matching)
3. /api/ml/recommend-pathway (Content-Based Recommendation Engine)
"""

import sys
import os

# Add backend to sys.path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


def test_health():
    resp = client.get("/")
    assert resp.status_code == 200
    data = resp.json()
    assert "ATLAS" in data.get("system", "") or "running" in data.get("message", "")
    print("PASS: Health check passed")


def test_resume_parser():
    sample_resume = """
    Sikandar Tanwar
    sikandar@example.com | +91 9876543210
    B.Tech Computer Science, 4th Year, ABESIT Ghaziabad
    Skills: Python, PyTorch, Scikit-learn, SQL, PostgreSQL, FastAPI, Git, Docker
    Projects:
    Built ATLAS career intelligence system with React 19 and FastAPI.
    """
    resp = client.post("/api/ml/parse-resume-text", json={"resume_text": sample_resume})
    assert resp.status_code == 200, f"Error: {resp.text}"
    data = resp.json()
    assert "Python" in data["detected_skills"]
    assert "FastAPI" in data["detected_skills"]
    assert data["full_name"] == "Sikandar Tanwar"
    print(f"PASS: Resume Parser extracted {len(data['detected_skills'])} skills for {data['full_name']}")


def test_semantic_matcher():
    sample_jd = """
    Full Stack AI Engineer
    Requirements:
    - Experience in Python, PyTorch, and FastAPI.
    - PostgreSQL database design and query optimization.
    - Containerization with Docker and Kubernetes.
    - Cloud deployment on AWS and CI/CD automation.
    """
    payload = {
        "resume_skills": ["Python", "PyTorch", "FastAPI", "PostgreSQL", "Git"],
        "resume_text": "Experienced Python and FastAPI backend developer with PostgreSQL.",
        "job_description_text": sample_jd,
        "target_role": "Machine Learning Engineer"
    }
    resp = client.post("/api/ml/compare-jd", json=payload)
    assert resp.status_code == 200, f"Error: {resp.text}"
    data = resp.json()
    assert data["match_percentage"] > 0
    assert "Python" in data["direct_matches"]
    print(f"PASS: Semantic Matcher ({data['engine_used']}): Match={data['match_percentage']}%, Direct={data['direct_matches']}, Missing={[m['skill'] for m in data['missing_skills']]}")


def test_pathway_recommender():
    missing_skills = [
        {"skill": "Docker", "category": "DevOps", "priority": "HIGH"},
        {"skill": "Kubernetes", "category": "DevOps", "priority": "HIGH"}
    ]
    payload = {
        "missing_skills": missing_skills,
        "target_role": "DevOps Engineer",
        "available_hours_per_week": 10
    }
    resp = client.post("/api/ml/recommend-pathway", json=payload)
    assert resp.status_code == 200, f"Error: {resp.text}"
    data = resp.json()
    assert len(data["recommended_courses"]) > 0
    assert len(data["milestones"]) > 0
    print(f"PASS: Recommender generated {len(data['recommended_courses'])} courses & {len(data['milestones'])} 4-stage milestones")


if __name__ == "__main__":
    print("--- Running ATLAS ML & NLP API Tests ---")
    test_health()
    test_resume_parser()
    test_semantic_matcher()
    test_pathway_recommender()
    print("--- ALL ML TESTS PASSED SUCCESSFULLY! ---")

