# InsureFlow ML Service

This service provides two advisory ML capabilities behind FastAPI:

- `POST /ml/anomaly/predict` uses scikit-learn Isolation Forest to identify unusual payment behavior.
- `POST /ml/predictions/late-payment` uses XGBoost to estimate late-payment risk.

The models never change invoice, payment, or reconciliation values. Express is the only caller from the application; the Python service should remain on the internal network.

## Setup

```powershell
cd ml-service
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
python scripts/generate_training_data.py
python scripts/train_anomaly_model.py
python scripts/train_late_payment_model.py
uvicorn app.main:app --reload --port 8000
```

Set `ML_ANOMALY_CONTAMINATION` to change the Isolation Forest contamination assumption. Both endpoints return `model`, `modelVersion`, risk, and the feature values used for the prediction.

The 10,000-record dataset is synthetic and intentionally correlates late behavior with previous delays, failed payments, and exceptions. Metrics printed by the XGBoost training script demonstrate the workflow only; they are not production performance on real insurance data.
