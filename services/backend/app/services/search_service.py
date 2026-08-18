import meilisearch
from app.core.config import settings

class SearchService:
    def __init__(self):
        self.client = meilisearch.Client(settings.MEILISEARCH_URL, settings.MEILISEARCH_MASTER_KEY)
        self.poi_index = self.client.index('pois')

    def search_pois(self, query: str, limit: int = 20):
        """
        Perform a full-text, typo-tolerant search across POIs.
        """
        # Ensure geo logic works if 'filter' or 'sort' is needed later.
        # For a basic text search, we just pass the query.
        result = self.poi_index.search(query, {
            'limit': limit
        })
        return result.get('hits', [])

# Singleton instance
search_service = SearchService()
