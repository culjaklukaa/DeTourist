import os
import urllib.request
import sys

URL = "https://download.geofabrik.de/europe/bosnia-herzegovina-latest.osm.pbf"
OUTPUT_DIR = os.path.join(os.path.dirname(__file__), "..", "data", "raw")
OUTPUT_FILE = os.path.join(OUTPUT_DIR, "bosnia-herzegovina-latest.osm.pbf")

def download_progress(count, block_size, total_size):
    if total_size == -1:
        return
    
    percent = int(count * block_size * 100 / total_size)
    if percent > 100:
        percent = 100
    
    sys.stdout.write(f"\rDownloading OSM data... {percent}%")
    sys.stdout.flush()

def main():
    print(f"Ensuring output directory exists: {os.path.abspath(OUTPUT_DIR)}")
    os.makedirs(OUTPUT_DIR, exist_ok=True)
    
    print(f"Downloading from: {URL}")
    print(f"Saving to: {os.path.abspath(OUTPUT_FILE)}")
    
    try:
        urllib.request.urlretrieve(URL, OUTPUT_FILE, reporthook=download_progress)
        print("\nDownload completed successfully!")
    except Exception as e:
        print(f"\nError downloading file: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()
