FROM python:3.12-slim

WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY app ./app
COPY scripts ./scripts
COPY data ./data
COPY trained_models ./trained_models
RUN python scripts/generate_training_data.py \
    && python scripts/train_anomaly_model.py \
    && python scripts/train_late_payment_model.py

EXPOSE 8000
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
