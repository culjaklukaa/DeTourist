import json
import sys
from pathlib import Path

# Add the current directory to sys.path so we can import 'app'
sys.path.insert(0, str(Path(__file__).resolve().parent))

from app.main import app

def export_openapi(output_path: str = "openapi.json"):
    schema = app.openapi()
    with open(output_path, "w", encoding="utf-8") as f:
        json.dump(schema, f, indent=2)
    print(f"OpenAPI schema successfully exported to {output_path}")

if __name__ == "__main__":
    export_path = sys.argv[1] if len(sys.argv) > 1 else "openapi.json"
    export_openapi(export_path)
