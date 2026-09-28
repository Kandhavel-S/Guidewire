from pathlib import Path

import numpy as np
import pandas as pd

RANDOM_SEED = 42
ROW_COUNT = 10_000
OUTPUT = Path(__file__).resolve().parents[1] / "data" / "training" / "payments.csv"


def main() -> None:
    rng = np.random.default_rng(RANDOM_SEED)
    customer_lateness = rng.normal(0, 5, ROW_COUNT)
    previous_count = rng.integers(1, 20, ROW_COUNT)
    invoice_amount = rng.uniform(5_000, 150_000, ROW_COUNT)
    payment_ratio = np.clip(rng.normal(0.98, 0.12, ROW_COUNT), 0.2, 1.4)
    recent_delay = np.maximum(0, customer_lateness + rng.normal(2, 4, ROW_COUNT))
    average_delay = np.maximum(0, customer_lateness + rng.normal(1, 3, ROW_COUNT))
    previous_late = np.maximum(0, np.round(previous_count * np.clip((customer_lateness + 10) / 30, 0, 1))).astype(int)
    failed = rng.poisson(np.clip((customer_lateness + 6) / 20, 0.05, 2), ROW_COUNT)
    exceptions = rng.poisson(np.clip((customer_lateness + 8) / 18, 0.05, 2), ROW_COUNT)
    payment_amount = invoice_amount * payment_ratio
    difference = invoice_amount - payment_amount
    days_late = np.maximum(0, recent_delay + rng.normal(0, 2, ROW_COUNT))
    previous_average = invoice_amount * np.clip(rng.normal(0.99, 0.04, ROW_COUNT), 0.7, 1.2)
    previous_std = np.abs(rng.normal(invoice_amount * 0.04, invoice_amount * 0.02, ROW_COUNT))

    late_logit = (
        -2.0
        + 0.24 * average_delay
        + 0.18 * previous_late
        + 0.28 * failed
        + 0.18 * exceptions
        + 0.08 * recent_delay
    )
    late_probability = 1 / (1 + np.exp(-late_logit))
    is_late = rng.binomial(1, late_probability)

    frame = pd.DataFrame({
        "payment_amount": payment_amount,
        "expected_amount": invoice_amount,
        "difference_amount": difference,
        "difference_percentage": np.abs(difference) / invoice_amount * 100,
        "days_late": days_late,
        "previous_payment_average": previous_average,
        "previous_payment_std": previous_std,
        "previous_payment_count": previous_count,
        "previous_failed_payment_count": failed,
        "previous_exception_count": exceptions,
        "average_payment_delay": average_delay,
        "previous_late_payment_count": previous_late,
        "invoice_amount": invoice_amount,
        "payment_to_invoice_ratio": payment_ratio,
        "recent_payment_delay": recent_delay,
        "payment_frequency": rng.uniform(15, 60, ROW_COUNT),
        "is_late_payment": is_late,
    })
    OUTPUT.parent.mkdir(parents=True, exist_ok=True)
    frame.to_csv(OUTPUT, index=False)
    print(f"Generated {len(frame)} synthetic records at {OUTPUT}")


if __name__ == "__main__":
    main()
