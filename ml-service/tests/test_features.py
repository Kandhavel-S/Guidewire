from types import SimpleNamespace

from app.services.feature_service import anomaly_features, late_payment_features


def test_anomaly_feature_order_and_values() -> None:
    request = SimpleNamespace(
        payment_amount=12000,
        expected_amount=50000,
        difference_amount=38000,
        difference_percentage=76,
        days_late=12,
        previous_payment_average=49800,
        previous_payment_std=850,
        previous_payment_count=12,
        previous_failed_payment_count=0,
        previous_exception_count=1,
    )
    assert anomaly_features(request) == [12000, 50000, 38000, 76, 12, 49800, 850, 12, 0, 1]


def test_late_payment_features_are_numeric() -> None:
    request = SimpleNamespace(
        average_payment_delay=5.2,
        previous_late_payment_count=4,
        previous_payment_count=12,
        previous_failed_payment_count=1,
        previous_exception_count=2,
        payment_amount=50000,
        invoice_amount=50000,
        payment_to_invoice_ratio=1,
        recent_payment_delay=7,
        payment_frequency=30,
    )
    assert late_payment_features(request)[0] == 5.2
    assert len(late_payment_features(request)) == 9
