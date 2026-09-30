from typing import Optional
from supabase import Client, create_client
from app.config import get_settings

_supabase_client: Optional[Client] = None


def get_supabase_client() -> Client:
    """Returns a singleton Supabase client using service-role credentials.

    The Supabase service-role key is intended exclusively for backend operations
    and is never exposed to the client or in API responses.
    """
    global _supabase_client
    if _supabase_client is None:
        settings = get_settings()
        if not settings.SUPABASE_URL or not settings.SUPABASE_SERVICE_ROLE_KEY:
            raise ValueError(
                "SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set in the environment or .env file."
            )
        _supabase_client = create_client(
            settings.SUPABASE_URL,
            settings.SUPABASE_SERVICE_ROLE_KEY,
        )
    return _supabase_client
