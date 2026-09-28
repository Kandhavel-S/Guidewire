from pathlib import Path
import sys

import pandas as pd
from sklearn.metrics import accuracy_score, f1_score, precision_score, recall_score, roc_auc_score
from sklearn.model_selection import train_test_split

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from app.models.late_payment_model import save_model, train_model
from app.services.feature_service import LATE_PAYMENT_FEATURES

DATA_PATH = Path(__file__).resolve().parents[1] / "data" / "training" / "payments.csv"


def main() -> None:
    frame = pd.read_csv(DATA_PATH).fillna(0)
    values = frame[LATE_PAYMENT_FEATURES].to_numpy()
    labels = frame["is_late_payment"].to_numpy()
    train_values, test_values, train_labels, test_labels = train_test_split(
        values, labels, test_size=0.2, random_state=42, stratify=labels
    )
    model = train_model(train_values, train_labels)
    predicted = model.predict(test_values)
    probability = model.predict_proba(test_values)[:, 1]
    print(f"accuracy={accuracy_score(test_labels, predicted):.3f}")
    print(f"precision={precision_score(test_labels, predicted, zero_division=0):.3f}")
    print(f"recall={recall_score(test_labels, predicted, zero_division=0):.3f}")
    print(f"f1={f1_score(test_labels, predicted, zero_division=0):.3f}")
    print(f"roc_auc={roc_auc_score(test_labels, probability):.3f}")
    save_model(model)
    print("Saved XGBoost late-payment model")


if __name__ == "__main__":
    main()
