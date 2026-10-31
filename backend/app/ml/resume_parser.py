"""ATLAS Resume Parser & Information Extraction Engine.

Extracts structured technical competencies, education, and contact metadata
from PDF, DOCX, and plain-text resumes using regex heuristics and canonical
skill ontology mapping (ESCO / O*NET).
"""

import io
import json
import os
import re
from typing import Any, Dict, List, Optional, Set, Tuple

# Optional document parsing libraries
try:
    import pypdf
except ImportError:
    pypdf = None

try:
    import docx
except ImportError:
    docx = None


class ResumeParser:
    """Extracts entities and skills from resume documents and text."""

    def __init__(self, taxonomy_path: Optional[str] = None):
        if taxonomy_path is None:
            base_dir = os.path.dirname(os.path.abspath(__file__))
            taxonomy_path = os.path.join(base_dir, "data", "skills_esco_canonical.json")

        self.taxonomy_path = taxonomy_path
        self.skills_db: List[Dict[str, Any]] = []
        self._load_taxonomy()

    def _load_taxonomy(self) -> None:
        """Loads canonical skills and aliases from local JSON catalog."""
        if os.path.exists(self.taxonomy_path):
            try:
                with open(self.taxonomy_path, "r", encoding="utf-8") as f:
                    data = json.load(f)
                    self.skills_db = data.get("skills", [])
            except Exception as exc:
                print(f"[ResumeParser] Error loading taxonomy: {exc}")
                self.skills_db = []

    def extract_text_from_bytes(self, file_bytes: bytes, filename: str) -> str:
        """Extracts plain text from PDF, DOCX, or TXT file bytes."""
        fn = filename.lower()
        if fn.endswith(".pdf"):
            return self._extract_from_pdf(file_bytes)
        elif fn.endswith(".docx"):
            return self._extract_from_docx(file_bytes)
        else:
            try:
                return file_bytes.decode("utf-8", errors="ignore")
            except Exception:
                return str(file_bytes)

    def _extract_from_pdf(self, file_bytes: bytes) -> str:
        """Extracts text using pypdf."""
        if pypdf is None:
            return ""
        text_parts = []
        try:
            reader = pypdf.PdfReader(io.BytesIO(file_bytes))
            for page in reader.pages:
                pt = page.extract_text()
                if pt:
                    text_parts.append(pt)
        except Exception as exc:
            print(f"[ResumeParser] PDF parsing error: {exc}")
        return "\n".join(text_parts)

    def _extract_from_docx(self, file_bytes: bytes) -> str:
        """Extracts text from DOCX."""
        if docx is None:
            return ""
        try:
            doc = docx.Document(io.BytesIO(file_bytes))
            return "\n".join([p.text for p in doc.paragraphs if p.text])
        except Exception as exc:
            print(f"[ResumeParser] DOCX parsing error: {exc}")
            return ""

    def parse(self, text_or_bytes: Any, filename: Optional[str] = None) -> Dict[str, Any]:
        """Main parsing method. Accepts raw string or file bytes."""
        if isinstance(text_or_bytes, bytes) and filename:
            raw_text = self.extract_text_from_bytes(text_or_bytes, filename)
        elif isinstance(text_or_bytes, str):
            raw_text = text_or_bytes
        else:
            raw_text = str(text_or_bytes or "")

        clean_text = self._clean_text(raw_text)

        email = self._extract_email(clean_text)
        phone = self._extract_phone(clean_text)
        degree, college, year = self._extract_education(clean_text)
        experience_level = self._estimate_experience(clean_text)
        detected_skills, skills_by_cat = self._extract_skills(clean_text)

        full_name = self._extract_name(clean_text, email)

        return {
            "full_name": full_name,
            "email": email or "",
            "phone": phone or "",
            "college": college or "Technical University",
            "degree": degree or "B.Tech Computer Science",
            "year": year or "3rd Year",
            "experience_level": experience_level,
            "detected_skills": detected_skills,
            "skills_by_category": skills_by_cat,
            "raw_text_length": len(raw_text),
            "clean_text_preview": clean_text[:400] + ("..." if len(clean_text) > 400 else ""),
        }

    def _clean_text(self, text: str) -> str:
        """Normalizes whitespace and standardizes common characters."""
        t = re.sub(r"[\r\n]+", "\n", text)
        t = re.sub(r"[ \t]+", " ", t)
        t = t.replace("“", '"').replace("”", '"').replace("’", "'")
        return t.strip()

    def _extract_email(self, text: str) -> Optional[str]:
        m = re.search(r"[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+", text)
        return m.group(0).lower() if m else None

    def _extract_phone(self, text: str) -> Optional[str]:
        m = re.search(r"(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}", text)
        return m.group(0) if m else None

    def _extract_name(self, text: str, email: Optional[str]) -> str:
        """Heuristic name extraction: checks top 3 lines."""
        lines = [line.strip() for line in text.split("\n") if line.strip()]
        for line in lines[:4]:
            if "@" in line or "resume" in line.lower() or "curriculum" in line.lower():
                continue
            words = line.split()
            if 1 <= len(words) <= 4 and all(re.match(r"^[A-Za-z.'-]+$", w) for w in words):
                return line.title()

        if email:
            prefix = email.split("@")[0]
            clean_prefix = re.sub(r"[0-9_.]+", " ", prefix).strip()
            if clean_prefix:
                return clean_prefix.title()

        return "Candidate"

    def _extract_education(self, text: str) -> Tuple[str, str, str]:
        """Detects degree, college, and current year from text."""
        degree = "B.Tech Computer Science"
        college = "Technical Institute"
        year = "3rd Year"

        # Degree heuristics
        deg_patterns = [
            (r"\b(b\.?tech|bachelor of technology)\b", "B.Tech Computer Science"),
            (r"\b(b\.?e\.?|bachelor of engineering)\b", "B.E. Computer Engineering"),
            (r"\b(m\.?tech|master of technology)\b", "M.Tech Software Systems"),
            (r"\b(bca|bachelor of computer applications)\b", "BCA Computer Applications"),
            (r"\b(mca|master of computer applications)\b", "MCA Computer Applications"),
            (r"\b(b\.?sc|bachelor of science)\b", "B.Sc Data Science"),
        ]
        for pat, dname in deg_patterns:
            if re.search(pat, text, re.IGNORECASE):
                degree = dname
                break

        # College heuristics
        col_patterns = [
            r"([A-Z][A-Za-z\s&]+(?:Institute|University|College|Academy|Engineering College)[A-Za-z\s,]*)",
        ]
        for cp in col_patterns:
            m = re.search(cp, text)
            if m:
                found_col = m.group(1).strip()
                if len(found_col) < 60:
                    college = found_col
                    break

        # Year heuristics
        if re.search(r"\b(1st\s*year|first\s*year)\b", text, re.I):
            year = "1st Year"
        elif re.search(r"\b(2nd\s*year|second\s*year)\b", text, re.I):
            year = "2nd Year"
        elif re.search(r"\b(3rd\s*year|third\s*year)\b", text, re.I):
            year = "3rd Year"
        elif re.search(r"\b(4th\s*year|final\s*year|fourth\s*year)\b", text, re.I):
            year = "Final Year"
        elif re.search(r"\b(graduated|alumni|passed\s*out)\b", text, re.I):
            year = "Graduated"

        return degree, college, year

    def _estimate_experience(self, text: str) -> str:
        """Determines candidate seniority level."""
        exp_m = re.search(r"(\d+)\+?\s*(?:years?|yrs?)\s*(?:of\s*)?experience", text, re.I)
        if exp_m:
            try:
                yrs = int(exp_m.group(1))
                if yrs >= 4:
                    return "Experienced"
                elif yrs >= 2:
                    return "Early Career"
                elif yrs >= 1:
                    return "Fresher"
            except Exception:
                pass

        if re.search(r"\b(student|intern|undergraduate|fresher)\b", text, re.I):
            return "Fresher"

        return "Student"

    def _extract_skills(self, text: str) -> Tuple[List[str], Dict[str, List[str]]]:
        """Matches text against ESCO skill ontology with word boundary protection."""
        matched_canonicals: Set[str] = set()
        by_category: Dict[str, List[str]] = {}
        lower_text = text.lower()

        for skill_entry in self.skills_db:
            canonical = skill_entry.get("canonical", "")
            category = skill_entry.get("category", "General")
            aliases = skill_entry.get("aliases", [canonical.lower()])

            is_matched = False
            for alias in aliases:
                a_clean = alias.strip().lower()
                if not a_clean:
                    continue

                # Use regex word boundaries to prevent false positives (e.g. 'c' matching 'can', 'go' matching 'good')
                if len(a_clean) <= 3:
                    pattern = rf"(?:\b|(?<=[^a-zA-Z0-9]))" + re.escape(a_clean) + rf"(?:\b|(?=[^a-zA-Z0-9]))"
                else:
                    pattern = rf"\b" + re.escape(a_clean) + rf"\b"

                if re.search(pattern, lower_text):
                    is_matched = True
                    break

            if is_matched:
                matched_canonicals.add(canonical)
                if category not in by_category:
                    by_category[category] = []
                by_category[category].append(canonical)

        return sorted(list(matched_canonicals)), by_category

