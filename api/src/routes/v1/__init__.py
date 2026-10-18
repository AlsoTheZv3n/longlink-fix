from . import mcp, auth, image, proxy, users, health, computes, payments, solutions, operations, registries, organizations
from fastapi import APIRouter

router = APIRouter(prefix="/api/v1")

# Compose the internal Platform routes under one prefix.
router.include_router(auth.router)
router.include_router(mcp.router)
router.include_router(solutions.router)
router.include_router(proxy.router)
router.include_router(computes.router)
router.include_router(health.router)
router.include_router(image.router)
router.include_router(operations.router)
router.include_router(organizations.router)
router.include_router(users.router)
router.include_router(registries.router)
router.include_router(payments.router)
