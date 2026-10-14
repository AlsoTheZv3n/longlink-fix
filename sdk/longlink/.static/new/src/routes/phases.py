from fastapi import APIRouter
from src.schemas.projects import PhaseRead

router = APIRouter(prefix="/api/phases")

# Describe the same illustrative construction lifecycle as the landing-page demo.
phases = [
    PhaseRead.model_validate(phase)
    for phase in [
        {
            "label": "Strategic planning",
            "description": "Define what you want to build, the budget, and your objectives.",
            "documents": [
                {"name": "Client brief", "available": True},
                {"name": "Room schedule", "available": True},
                {"name": "Financial budget", "available": False},
                {"name": "Preliminary schedule", "available": False},
            ],
        },
        {
            "label": "Preliminary studies",
            "description": "Check the feasibility and select the project team.",
            "documents": [
                {"name": "Site and zoning assessment", "available": True},
                {"name": "Feasibility study", "available": True},
                {"name": "Preliminary costs", "available": False},
                {"name": "Architect and engineer contracts", "available": False},
            ],
        },
        {
            "label": "Project design",
            "description": "Design the house and obtain planning permission.",
            "documents": [
                {"name": "Architectural plans", "available": True},
                {"name": "Engineering concepts", "available": True},
                {"name": "Building description", "available": True},
                {"name": "Detailed cost estimate", "available": False},
                {"name": "Permit application and approvals", "available": False},
            ],
        },
        {
            "label": "Tendering",
            "description": "Request quotations, compare contractors, and award contracts.",
            "documents": [
                {"name": "Tender drawings", "available": True},
                {"name": "Bills of quantities", "available": True},
                {"name": "Specifications", "available": True},
                {"name": "Contractor bids", "available": False},
                {"name": "Comparison", "available": False},
                {"name": "Construction contracts", "available": False},
            ],
        },
        {
            "label": "Realization",
            "description": "Prepare construction drawings, build, inspect, and hand over the house.",
            "documents": [
                {"name": "Execution drawings", "available": True},
                {"name": "Construction and inspection records", "available": True},
                {"name": "Acceptance protocol", "available": False},
                {"name": "As-built documentation", "available": False},
                {"name": "Commissioning records", "available": False},
                {"name": "Final account", "available": False},
            ],
        },
        {
            "label": "Operation and maintenance",
            "description": "Operate, inspect, maintain, and repair the completed property.",
            "documents": [
                {"name": "Building manual", "available": True},
                {"name": "Warranties", "available": True},
                {"name": "Inspection and service plans", "available": True},
                {"name": "Maintenance records", "available": False},
                {"name": "Repair documentation", "available": False},
            ],
        },
    ]
]


@router.get("", response_model=list[PhaseRead])
def phases_get_endpoint() -> list[PhaseRead]:
    """Return the read-only example phases and document checklists."""

    # Expose illustrative checklist entries, not claims about uploaded files.
    return phases
