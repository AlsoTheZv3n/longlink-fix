from pydantic import BaseModel

# Included monthly usage and rates in CHF centimes.
FREE_USERS = 5
FREE_DATABASE_BYTES = 100 * 1024**2
FREE_STORAGE_BYTES = 1024**3
USER_MONTHLY_PRICE = 500
DATABASE_GIB_MONTHLY_PRICE = 100
STORAGE_GIB_MONTHLY_PRICE = 10

# Provisioned capacity after a payment method is registered, independent of pricing allowances.
REGISTERED_DATABASE_SIZE_MIB = 5 * 1024
REGISTERED_STORAGE_QUOTA_BYTES = 25 * 1024**3


class UsageRates(BaseModel):
    """Describe included usage and month-end prices in CHF centimes."""

    # Included usage
    free_users: int = FREE_USERS
    free_storage_bytes: int = FREE_STORAGE_BYTES
    free_database_bytes: int = FREE_DATABASE_BYTES

    # Monthly prices
    user_monthly_price: int = USER_MONTHLY_PRICE
    storage_gib_monthly_price: int = STORAGE_GIB_MONTHLY_PRICE
    database_gib_monthly_price: int = DATABASE_GIB_MONTHLY_PRICE
