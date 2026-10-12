from longlink import LongLink
from src.routes import items, photos

app = LongLink()
app.include_router(items.router)
app.include_router(photos.router)
