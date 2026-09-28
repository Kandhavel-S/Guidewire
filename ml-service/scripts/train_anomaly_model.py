import os
import sys
from pathlib import Path

import pandas as pd

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from app.models.anomaly_model import save_model, train_model
from app.services.feature_service import ANOMALY_FEATURES

DATA_PATH = Path(__file__).resolve().parents[1] / "data" / "training" / "payments.csv"


def main() -> None:
    frame = pd.read_csv(DATA_PATH)
    contamination = float(os.getenv("ML_ANOMALY_CONTAMINATION", "0.05"))
    model = train_model(frame[ANOMALY_FEATURES].fillna(0).to_numpy(), contamination)
    save_model(model)
    print(f"Saved Isolation Forest using {len(frame)} records; contamination={contamination}")


if __name__ == "__main__":
    main()
