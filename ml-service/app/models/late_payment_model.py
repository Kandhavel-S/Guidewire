from pathlib import Path

import numpy as np

try:
    import xgboost as xgb
except ImportError:  # Optional until the ML service environment is installed.
    xgb = None  # type: ignore[assignment]

MODEL_VERSION = "1.0.0"
MODEL_PATH = Path(__file__).resolve().parents[2] / "trained_models" / "xgboost_late_payment.json"


def load_model():
    if xgb is None:
        raise FileNotFoundError("XGBoost dependency is not installed")
    if not MODEL_PATH.exists():
        raise FileNotFoundError("XGBoost late-payment model is not trained")
    model = xgb.XGBClassifier()
    model.load_model(str(MODEL_PATH))
    return model


def train_model(values: np.ndarray, labels: np.ndarray):
    if xgb is None:
        raise RuntimeError("XGBoost dependency is not installed")
    model = xgb.XGBClassifier(
        n_estimators=160,
        max_depth=4,
        learning_rate=0.05,
        subsample=0.85,
        colsample_bytree=0.85,
        objective="binary:logistic",
        eval_metric="logloss",
        random_state=42,
    )
    model.fit(values, labels)
    return model


def save_model(model) -> None:
    MODEL_PATH.parent.mkdir(parents=True, exist_ok=True)
    model.save_model(str(MODEL_PATH))
