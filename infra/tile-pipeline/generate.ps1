param (
    [string]$S3Bucket = "example-detourist-tiles",
    [string]$Region = "bosnia-herzegovina",
    [string]$GeofabrikUrl = "https://download.geofabrik.de/europe/bosnia-herzegovina-latest.osm.pbf",
    [string]$S3Key = "regions/bih.pmtiles"
)

$ErrorActionPreference = "Stop"

$DataDir = Join-Path $PSScriptRoot "data"
if (-not (Test-Path $DataDir)) {
    New-Item -ItemType Directory -Path $DataDir | Out-Null
}

$PbfFile = Join-Path $DataDir "$Region-latest.osm.pbf"
$PmtilesFile = Join-Path $DataDir "$Region.pmtiles"

if (-not (Test-Path $PbfFile)) {
    Write-Host "Downloading OSM extract for $Region from Geofabrik..."
    Invoke-WebRequest -Uri $GeofabrikUrl -OutFile $PbfFile
} else {
    Write-Host "Using cached $PbfFile"
}

Write-Host "Running Planetiler to generate PMTiles..."
# The memory settings might need to be adjusted depending on your host machine
docker run --rm -v "${DataDir}:/data" -e JAVA_TOOL_OPTIONS="-Xmx2g" ghcr.io/onthegomap/planetiler:latest --osm-path="/data/$Region-latest.osm.pbf" --output="/data/$Region.pmtiles"

Write-Host "Uploading to S3..."
aws s3 cp $PmtilesFile "s3://$S3Bucket/$S3Key"

Write-Host "Pipeline complete!"
