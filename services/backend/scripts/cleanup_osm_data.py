import os
import json
import osmium

INPUT_FILE = os.path.join(os.path.dirname(__file__), "..", "data", "raw", "bosnia-herzegovina-latest.osm.pbf")
OUTPUT_DIR = os.path.join(os.path.dirname(__file__), "..", "data", "processed")
OUTPUT_FILE = os.path.join(OUTPUT_DIR, "cleaned_pois.json")

# Category mapping
CATEGORY_MAP = {
    'restaurant': 'Food & Drink',
    'cafe': 'Food & Drink',
    'fast_food': 'Food & Drink',
    'bar': 'Food & Drink',
    'pub': 'Food & Drink',
    'hotel': 'Accommodation',
    'hostel': 'Accommodation',
    'guest_house': 'Accommodation',
    'motel': 'Accommodation',
    'museum': 'Attraction',
    'gallery': 'Attraction',
    'viewpoint': 'Attraction',
    'artwork': 'Attraction',
    'theme_park': 'Attraction',
    'zoo': 'Attraction',
    'monument': 'Historic',
    'ruins': 'Historic',
    'castle': 'Historic',
    'archaeological_site': 'Historic',
    'supermarket': 'Shopping',
    'convenience': 'Shopping',
    'clothes': 'Shopping',
    'gift': 'Shopping',
}

class POIHandler(osmium.SimpleHandler):
    def __init__(self):
        super(POIHandler, self).__init__()
        self.pois = []
        self.seen_signatures = set()

    def process_element(self, tags, lat, lon, osm_id, elem_type):
        name = tags.get('name')
        if not name:
            return  # Drop low confidence (no name)

        category = None
        for key in ['amenity', 'tourism', 'historic', 'shop']:
            if key in tags and tags[key] in CATEGORY_MAP:
                category = CATEGORY_MAP[tags[key]]
                break
        
        if not category:
            return
        
        # Deduplication based on name and approximate location (~111m precision at eq)
        lat_rounded = round(lat, 3)
        lon_rounded = round(lon, 3)
        signature = f"{name.lower()}_{category}_{lat_rounded}_{lon_rounded}"
        
        if signature in self.seen_signatures:
            return
        self.seen_signatures.add(signature)
        
        # Clean tags (drop low confidence/meta tags)
        drop_keys = ['source', 'note', 'fixme', 'created_by']
        clean_tags = {k: v for k, v in tags if k not in drop_keys}
        
        poi = {
            'id': f"{elem_type}/{osm_id}",
            'name': name,
            'category': category,
            'lat': lat,
            'lon': lon,
            'tags': clean_tags
        }
        self.pois.append(poi)

    def node(self, n):
        self.process_element(n.tags, n.location.lat, n.location.lon, n.id, "node")

    # Ways can be processed if we compute their centroid. But pyosmium SimpleHandler 
    # doesn't automatically compute way centroids unless we use NodeLocationsForWays.
    # We will just process Area for centroids if we want, or just stick to nodes for now.
    # For a simple pipeline, we can use the osmium.geom module or just skip ways if nodes are sufficient.
    # To include areas (multipolygons/ways), we can use the area() callback which provides a centroid-ish via bounding box, 
    # but osmium requires adding a location handler. 
    # Let's keep it simple and just use Nodes for POIs in Phase 0, or we can add Area.
    
    def area(self, a):
        # We can approximate an area's location using the first node if we don't want to build a node cache.
        # Actually, pyosmium doesn't give locations in area without a factory.
        pass

def main():
    os.makedirs(OUTPUT_DIR, exist_ok=True)
    
    print(f"Reading {INPUT_FILE}...")
    handler = POIHandler()
    handler.apply_file(INPUT_FILE, locations=False)
    
    print(f"Extracted {len(handler.pois)} deduplicated POIs.")
    
    with open(OUTPUT_FILE, 'w', encoding='utf-8') as f:
        json.dump(handler.pois, f, ensure_ascii=False, indent=2)
        
    print(f"Saved cleaned data to {OUTPUT_FILE}")

if __name__ == '__main__':
    main()
