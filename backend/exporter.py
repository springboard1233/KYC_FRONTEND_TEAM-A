import os
import shutil
from pathlib import Path
import pandas as pd

ROOT = Path(__file__).resolve().parents[1]
SYN_LABELS = ROOT / "data/synthetic/synthetic_labels.csv"
EXPORTS_DIR = ROOT / "exports"
OUT_CSV = EXPORTS_DIR / "extracted.csv"

def export_to_csv():
    EXPORTS_DIR.mkdir(parents=True, exist_ok=True)
    if not SYN_LABELS.exists():
        raise FileNotFoundError(f"Missing {SYN_LABELS}. Run generate_synthetic_docs.py first.")
    # For Step 1, pass-through synthetic labels as extracted.csv. [2]
    df = pd.read_csv(SYN_LABELS)
    df.to_csv(OUT_CSV, index=False)
    return OUT_CSV

if __name__ == "__main__":
    path = export_to_csv()
    print(f"Exported to {path}")

