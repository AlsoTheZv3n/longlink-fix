from src import auth
from typing import Annotated
from fastapi import Depends, Response
from dataclasses import dataclass
from sqlalchemy.ext.asyncio import AsyncSession


@dataclass(frozen=True, slots=True)
class _Context:
    """Provide request services without requiring an authenticated browser user."""

    response: Response
    database: AsyncSession


async def _context(response: Response, session: auth.Session) -> _Context:
    """Reuse the request-scoped database dependency without owning its transaction."""

    return _Context(response=response, database=session)


Context = Annotated[_Context, Depends(_context)]
