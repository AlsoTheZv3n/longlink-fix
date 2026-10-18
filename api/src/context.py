from src import auth
from typing import Annotated
from fastapi import Depends, Request
from dataclasses import dataclass
from sqlalchemy.ext.asyncio import AsyncSession
from src.database.models.users import User


@dataclass(frozen=True, slots=True)
class _Context:
    """Provide request services without requiring an authenticated browser user."""

    request: Request
    database: AsyncSession

    @property
    def user(self) -> User | None:
        """Read the identity after the route's authentication dependencies have run."""

        return getattr(self.request.state, "user", None)


async def _context(request: Request, session: auth.Session) -> _Context:
    """Reuse the request-scoped database dependency without owning its transaction."""

    return _Context(request=request, database=session)


Context = Annotated[_Context, Depends(_context)]
