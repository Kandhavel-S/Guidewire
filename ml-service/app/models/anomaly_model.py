from pathlib import Path

import joblib
import numpy as np
from sklearn.ensemble import IsolationForest
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import StandardScaler

from app.services.feature_service import ANOMALY_FEATURES

MODEL_VERSION = "1.0.0"
MODEL_PATH = Path(__file__).resolve().parents[2] / "trained_models" / "isolation_forest.joblib"


def load_model() -> Pipeline:
    if not MODEL_PATH.exists():
        raise FileNotFoundError("Isolation Forest model is not trained")
    return joblib.load(MODEL_PATH)


def train_model(values: np.ndarray, contamination: float = 0.05) -> Pipeline:
    model = Pipeline([
        ("scale", StandardScaler()),
        ("isolation_forest", IsolationForest(
            n_estimators=200,
            contamination=contamination,
            random_state=42,
        )),
    ])
    model.fit(values)
    return model


def save_model(model: Pipeline) -> None:
    MODEL_PATH.parent.mkdir(parents=True, exist_ok=True)
    joblib.dump(model, MODEL_PATH)


def score_model(model: Pipeline, values: list[float]) -> tuple[bool, float]:
    anomaly = int(model.predict([values])[0]) == -1
    raw_score = float(-model.decision_function([values])[0])
    score = float(np.clip(0.5 + raw_score, 0, 1))
    return anomaly, score
