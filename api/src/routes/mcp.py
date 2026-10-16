from src import auth
from uuid import UUID
from typing import Annotated
from fastapi import Form, Query, Request, Response, APIRouter
from src.logger import logger
from src.models import mcp as models
from urllib.parse import urlencode
from collections.abc import Callable, Coroutine
from fastapi.routing import APIRoute
from src.environments import env
from fastapi.responses import JSONResponse, RedirectResponse
from fastapi.exceptions import RequestValidationError
from src.database.services import mcp


class OAuthRoute(APIRoute):
    """Translate OAuth failures at this router's HTTP boundary, not in global application handlers."""

    def get_route_handler(self) -> Callable[[Request], Coroutine[None, None, Response]]:
        """Keep discovery validation and unrelated API error contracts unchanged."""

        handler = super().get_route_handler()

        async def handle(request: Request) -> Response:
            """Return standard OAuth errors without submitted credentials or internal diagnostics."""

            try:
                return await handler(request)
            except RequestValidationError as exc:
                # Resource discovery retains ordinary validation; only OAuth API inputs use OAuth error bodies.
                if not request.url.path.startswith("/api/v1/mcp/"):
                    raise
                code = "invalid_client_metadata" if request.url.path == "/api/v1/mcp/register" else "invalid_request"
                description = "Invalid request parameters"

                # Identify rejected registration fields without logging request values, callbacks, or credentials.
                if request.url.path == "/api/v1/mcp/register":
                    details = ", ".join(
                        f"{issue['loc'][1]} ({issue['type']})"
                        for issue in exc.errors()
                        if len(issue["loc"]) > 1 and issue["loc"][1] in models.ClientRegistration.model_fields
                    )
                    logger.warning("MCP client registration rejected: %s", details or "request body")
                    description = f"Invalid client metadata: {details or 'request body'}"
            except mcp.OAuthError as exc:
                # Preserve the domain-authored OAuth error fields.
                code = exc.error
                description = exc.description

            # Return the selected public fields without constructing another exception.
            return JSONResponse(
                status_code=400,
                content={"error": code, "error_description": description},
                headers={"Pragma": "no-cache"},
            )

        return handle


router = APIRouter(tags=["mcp"], route_class=OAuthRoute, responses={400: {"model": models.OAuthFailure}})


@router.get("/.well-known/oauth-authorization-server", response_model=models.ServerMetadata)
async def server_metadata() -> dict[str, str | list[str]]:
    """Advertise only the implemented public authorization-code and PKCE flow."""

    return {
        "issuer": env.PUBLIC_URL,
        "authorization_endpoint": f"{env.PUBLIC_URL}/api/v1/mcp/authorize",
        "token_endpoint": f"{env.PUBLIC_URL}/api/v1/mcp/token",
        "registration_endpoint": f"{env.PUBLIC_URL}/api/v1/mcp/register",
        "revocation_endpoint": f"{env.PUBLIC_URL}/api/v1/mcp/revoke",
        "scopes_supported": ["mcp"],
        "grant_types_supported": ["authorization_code"],
        "response_types_supported": ["code"],
        "code_challenge_methods_supported": ["S256"],
        "token_endpoint_auth_methods_supported": ["none"],
    }


@router.get("/.well-known/oauth-protected-resource/api/v1/solutions/{solution_id}/proxy/mcp", response_model=models.ResourceMetadata)
async def resource_metadata(solution_id: UUID) -> dict[str, str | list[str]]:
    """Expose authentication discovery without revealing whether a Solution exists."""

    return {"resource": mcp.resource(solution_id), "authorization_servers": [env.PUBLIC_URL], "scopes_supported": ["mcp"]}


@router.post("/api/v1/mcp/register", status_code=201, response_model=models.RegisteredClient)
async def register(payload: models.ClientRegistration, session: auth.Session) -> dict[str, object]:
    """Register immutable callbacks for a public client; registration grants no access."""

    # Persist registration before returning its identifier and validated public metadata.
    client_id = await mcp.register(session, payload)
    await session.commit()
    return {**payload.model_dump(), "client_id": client_id}


@router.get("/api/v1/mcp/authorize", response_model=None)
async def authorize(request: Annotated[models.AuthorizationRequest, Query()], session: auth.Session) -> RedirectResponse:
    """Validate the client request before navigating to first-party login and consent."""

    # Validate the callback and audience before navigating to first-party approval.
    await mcp.validate_request(session, request)
    query = urlencode(request.model_dump(mode="json"))
    return RedirectResponse(f"{env.PUBLIC_URL}/mcp/authorize?{query}", status_code=302)


@router.get("/api/v1/mcp/consent", response_model=models.Consent)
async def consent(
    request: Annotated[models.AuthorizationRequest, Query()], user: auth.CurrentUser, session: auth.Session
) -> dict[str, str]:
    """Describe the registered callback and Solution only after current permission checks."""

    return await mcp.consent(session, user, request)


@router.post("/api/v1/mcp/consent", response_model=models.AuthorizationRedirect)
async def approve(payload: models.Approval, user: auth.CurrentUser, session: auth.Session) -> dict[str, str]:
    """Issue one short-lived PKCE code only after an explicit same-origin browser decision."""

    # Persist approved proof before exposing the code; declined consent remains read-only.
    url = await mcp.approve(session, user, payload)
    if payload.approve:
        await session.commit()
    return {"url": url}


@router.post("/api/v1/mcp/token", response_model=models.AccessToken)
async def exchange(
    session: auth.Session,
    response: Response,
    payload: Annotated[models.TokenExchange, Form()],
) -> dict[str, str | int]:
    """Exchange a single-use code with exact client, resource, redirect, and PKCE binding."""

    # Commit code consumption and token issuance together before returning credentials.
    result = await mcp.exchange(session, payload)
    await session.commit()
    response.headers["Pragma"] = "no-cache"
    return result


@router.post("/api/v1/mcp/revoke", status_code=200, response_model=None)
async def revoke(
    session: auth.Session,
    token: Annotated[str, Form(max_length=128)],
    client_id: Annotated[UUID, Form()],
) -> Response:
    """Let a public client revoke its credential without exposing credential existence."""

    # Persist client-bound revocation before acknowledging the request.
    await mcp.revoke(session, token, client_id)
    await session.commit()
    return Response()


@router.get("/api/v1/mcp/tokens", response_model=list[models.TokenSummary])
async def tokens(user: auth.CurrentUser, session: auth.Session):
    """List the current user's revocation handles without exposing credentials."""

    return await mcp.tokens(session, user.id)


@router.delete("/api/v1/mcp/tokens/{token_id}", status_code=204, response_model=None)
async def delete_token(token_id: UUID, user: auth.CurrentUser, session: auth.Session) -> None:
    """Revoke only grants owned by the authenticated browser user."""

    # Persist owner-bound revocation before acknowledging the request.
    await mcp.delete_token(session, user.id, token_id)
    await session.commit()
