from . import tags, image, payments, solutions, registries, organizations
from src import auth
from fastapi import Depends, APIRouter

router = APIRouter(dependencies=[Depends(auth.authmember)])

# Require active Organization membership before running scoped endpoints.
router.include_router(image.router)
router.include_router(tags.router)
router.include_router(payments.router)
router.include_router(solutions.router)
router.include_router(registries.router)
router.include_router(organizations.router)
