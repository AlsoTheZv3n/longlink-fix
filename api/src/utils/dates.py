from datetime import datetime


def next_month(value: datetime) -> datetime:
    """Return the first instant of the following month in the same timezone."""

    return value.replace(year=value.year + value.month // 12, month=value.month % 12 + 1, day=1, hour=0, minute=0, second=0, microsecond=0)
