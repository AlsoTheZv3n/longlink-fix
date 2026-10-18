from . import users, computes, solutions, operations, organizations
from src import auth
from fastapi import Depends, APIRouter

router = APIRouter(dependencies=[Depends(auth.authadmin)])

# Apply Platform administrator access to every administrative endpoint.
router.include_router(users.router)
router.include_router(computes.router)
router.include_router(solutions.router)
router.include_router(operations.router)
router.include_router(organizations.router)
