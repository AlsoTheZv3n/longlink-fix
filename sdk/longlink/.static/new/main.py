from longlink import LongLink
from src.routes import phases, photos, projects

app = LongLink()
app.include_router(phases.router)
app.include_router(photos.router)
app.include_router(projects.router)
