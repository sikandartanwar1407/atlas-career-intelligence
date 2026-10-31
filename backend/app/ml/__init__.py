"""ATLAS Machine Learning & NLP Package.

Contains:
- resume_parser: Extract skills and metadata from PDF/DOCX/text resumes.
- semantic_matcher: Compute semantic embeddings and cosine similarity between resumes and job descriptions.
- recommender: Content-based recommendation of learning pathways and custom projects.
"""

from app.ml.resume_parser import ResumeParser
from app.ml.semantic_matcher import SemanticMatcher
from app.ml.recommender import PathwayRecommender

__all__ = ["ResumeParser", "SemanticMatcher", "PathwayRecommender"]

