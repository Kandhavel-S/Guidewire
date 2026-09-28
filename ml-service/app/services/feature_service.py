ANOMALY_FEATURES = [
    "payment_amount",
    "expected_amount",
    "difference_amount",
    "difference_percentage",
    "days_late",
    "previous_payment_average",
    "previous_payment_std",
    "previous_payment_count",
    "previous_failed_payment_count",
    "previous_exception_count",
]

LATE_PAYMENT_FEATURES = [
    "average_payment_delay",
    "previous_late_payment_count",
    "previous_payment_count",
    "previous_failed_payment_count",
    "previous_exception_count",
    "payment_amount",
    "invoice_amount",
    "payment_to_invoice_ratio",
    "recent_payment_delay",
    "payment_frequency",
]


def anomaly_features(request: object) -> list[float]:
    return [float(getattr(request, name)) for name in ANOMALY_FEATURES]


def late_payment_features(request: object) -> list[float]:
    return [float(getattr(request, name)) for name in LATE_PAYMENT_FEATURES]
