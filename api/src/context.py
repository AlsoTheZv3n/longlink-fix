from src import auth
from typing import Annotated
from fastapi import Depends, Request, Response
from dataclasses import dataclass
from sqlalchemy.ext.asyncio import AsyncSession


@dataclass(frozen=True, slots=True)
class _Context:
    """Provide request services without requiring an authenticated browser user."""

    request: Request
    response: Response
    database: AsyncSession


async def _context(request: Request, response: Response, session: auth.Session) -> _Context:
    """Reuse the request-scoped database dependency without owning its transaction."""

    return _Context(request=request, response=response, database=session)


Context = Annotated[_Context, Depends(_context)]
