#!/bin/bash
set -e

# Configuration
S3_BUCKET=${S3_BUCKET:-"example-detourist-tiles"}
REGION=${REGION:-"bosnia-herzegovina"}
GEOFABRIK_URL=${GEOFABRIK_URL:-"https://download.geofabrik.de/europe/bosnia-herzegovina-latest.osm.pbf"}
S3_KEY="regions/bih.pmtiles"

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
DATA_DIR="$SCRIPT_DIR/data"
mkdir -p "$DATA_DIR"

PBF_FILE="$DATA_DIR/${REGION}-latest.osm.pbf"
PMTILES_FILE="$DATA_DIR/${REGION}.pmtiles"

echo "Downloading OSM extract for $REGION from Geofabrik..."
if [ ! -f "$PBF_FILE" ]; then
    curl -L -o "$PBF_FILE" "$GEOFABRIK_URL"
else
    echo "Using cached $PBF_FILE"
fi

echo "Running Planetiler to generate PMTiles..."
# Memory settings might need to be adjusted depending on the host machine
docker run --rm -v "${DATA_DIR}:/data" \
    -e JAVA_TOOL_OPTIONS="-Xmx2g" \
    ghcr.io/onthegomap/planetiler:latest \
    --osm-path="/data/${REGION}-latest.osm.pbf" \
    --output="/data/${REGION}.pmtiles"

echo "Uploading to S3..."
aws s3 cp "$PMTILES_FILE" "s3://${S3_BUCKET}/${S3_KEY}"

echo "Pipeline complete!"
