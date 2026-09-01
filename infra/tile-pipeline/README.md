# DeTourist Tile Generation Pipeline

This directory contains the scripts to automate generating offline map vector tiles for a given region (defaulting to the Bosnia and Herzegovina pilot region).

It follows the process defined in Phase 1B:
`Geofabrik OSM extract → Planetiler → PMTiles format → S3`

## Prerequisites

- **Docker:** Required to run the Planetiler image.
- **AWS CLI:** Required to upload the generated `.pmtiles` file to S3. Must be authenticated with permissions to write to the configured bucket.

## Usage

You can run the generation pipeline via Bash (Linux/macOS) or PowerShell (Windows). By default, it generates tiles for Bosnia and Herzegovina and attempts to upload to `example-detourist-tiles`. 

### Windows (PowerShell)

```powershell
.\generate.ps1 -S3Bucket "your-actual-bucket-name"
```

### Linux / macOS (Bash)

```bash
S3_BUCKET="your-actual-bucket-name" ./generate.sh
```

## How it works

1. **Download Data:** Fetches the latest OpenStreetMap `.osm.pbf` extract for the region from [Geofabrik](https://download.geofabrik.de/).
2. **Generate Tiles:** Runs the `ghcr.io/onthegomap/planetiler:latest` Docker image to process the `.pbf` into a `.pmtiles` archive.
3. **Upload:** Uses `aws s3 cp` to copy the generated `.pmtiles` to the configured S3 bucket.

## Memory Configuration

The scripts allocate 2GB of memory to Planetiler via `JAVA_TOOL_OPTIONS="-Xmx2g"`. If you are processing larger regions, you may need to increase this in the script to avoid out-of-memory errors during tile generation.
