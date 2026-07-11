import json
from fastapi import FastAPI, Request
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from typing import List, Dict, Any

from models import (
    EpcGrade, AuditStatus, PortfolioSummary, Alert, AlertSeverity,
    EpcDistribution, PropertyRecord, AuditLedgerResponse, AuditFormData,
    LiveEstimate, RemediationPlan, RemediationProperty, RemediationAction,
    RemediationStatus, FinancialSummary
)
from calculations import estimate_sap_score

app = FastAPI(title="CompliancePro Backend")

# Enable CORS for the Vite dev server
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173", "http://localhost:5174", "http://127.0.0.1:5174", "http://localhost:5177", "http://127.0.0.1:5177", "http://localhost:15177", "http://127.0.0.1:15177"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

from fastapi import Request
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse

@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    return JSONResponse(
        status_code=422,
        content={"success": False, "error": "Invalid form data provided", "details": exc.errors()}
    )

# ---------------------------------------------------------
# Mock Data Constants
# ---------------------------------------------------------
MOCK_PROPERTIES = [
    PropertyRecord(uprn="1880213944", address="24 Baker St, Marylebone", epcGrade=EpcGrade.A, lastAuditDate="14 Oct 2023", status=AuditStatus.COMPLIANT),
    PropertyRecord(uprn="4992813822", address="Apartment 402, Skyline Tower", epcGrade=EpcGrade.C, lastAuditDate="12 Jan 2024", status=AuditStatus.PENDING),
    PropertyRecord(uprn="9283741103", address="92 Victoria Rd, Swindon", epcGrade=EpcGrade.E, lastAuditDate="22 Nov 2023", status=AuditStatus.ACTION_REQUIRED),
    PropertyRecord(uprn="3847291004", address="The Old Rectory, Cotswolds", epcGrade=EpcGrade.G, lastAuditDate="05 Feb 2024", status=AuditStatus.ACTION_REQUIRED),
    PropertyRecord(uprn="5543210988", address="15 Rosewood Terrace", epcGrade=EpcGrade.B, lastAuditDate="28 Dec 2023", status=AuditStatus.COMPLIANT),
]

MOCK_ALERTS = [
    Alert(id="a1", severity=AlertSeverity.ERROR, title="EPC Expired", description="12 High Street â€” 2 hours ago", timestamp="2 hours ago"),
    Alert(id="a2", severity=AlertSeverity.INFO, title="Audit Complete", description="Oxford Business Park â€” 5 hours ago", timestamp="5 hours ago"),
    Alert(id="a3", severity=AlertSeverity.SUCCESS, title="Rating Improved (D â†’ C)", description="Canary Wharf Flat 17 â€” Yesterday", timestamp="Yesterday"),
]

MOCK_REMEDIATION_PLAN = RemediationPlan(
    property=RemediationProperty(
        uprn="1880213944",
        address="24 Baker St, Marylebone",
        currentScore=42,
        targetScore=71,
        currentGrade=EpcGrade.E,
        epcStatus="FAILING"
    ),
    actions=[
        RemediationAction(
            id="act-001",
            title="Install Cavity Wall Insulation",
            description="Internal & external thermal envelope upgrade",
            icon="wall",
            epcImpactPoints=12,
            estimatedCostLow=1500,
            estimatedCostHigh=2500,
            status=RemediationStatus.NOT_STARTED
        ),
        RemediationAction(
            id="act-002",
            title="Upgrade to Low Energy Lighting",
            description="LED replacement for all communal areas",
            icon="lightbulb",
            epcImpactPoints=4,
            estimatedCostLow=150,
            estimatedCostHigh=300,
            status=RemediationStatus.IN_PROGRESS
        ),
        RemediationAction(
            id="act-003",
            title="Replace Single Glazed Windows",
            description="Vacuum-insulated double glazing install",
            icon="window",
            epcImpactPoints=18,
            estimatedCostLow=8000,
            estimatedCostHigh=12000,
            status=RemediationStatus.NOT_STARTED
        )
    ],
    financial=FinancialSummary(
        totalBudget=24500,
        govGrantsAvailable=4200,
        netInvestment=20300,
        estimatedPaybackYears=6.4,
        criticalActionCount=12
    )
)

# ---------------------------------------------------------
# Endpoints
# ---------------------------------------------------------

@app.get("/api/portfolio/summary", response_model=PortfolioSummary)
def get_portfolio_summary():
    return PortfolioSummary(
        totalAudited=1248,
        totalAuditedTrend="+4.2%",
        averageEpcScore=68,
        averageEpcGrade=EpcGrade.C,
        pendingRemediations=24,
        compliancePercent=84,
        quarterlyTarget=90,
        professionalSummary="The current compliance status is steady at 84%. There is a notable cluster of Band D properties in the Midlands region that require reassessment following recent insulation retrofits.",
        epcDistribution=EpcDistribution(
            A=120, B=180, C=340, D=210, E=80, F=30, G=15
        )
    )

@app.get("/api/audits", response_model=AuditLedgerResponse)
def get_audit_ledger(page: int = 1):
    return AuditLedgerResponse(
        properties=MOCK_PROPERTIES,
        total=1248,
        page=page,
        pageSize=5
    )

@app.get("/api/alerts", response_model=List[Alert])
def get_alerts():
    return MOCK_ALERTS

@app.get("/api/remediation/{uprn}", response_model=RemediationPlan)
def get_remediation_plan(uprn: str):
    return MOCK_REMEDIATION_PLAN

@app.post("/api/audits/estimate", response_model=LiveEstimate)
def estimate_audit(form_data: AuditFormData):
    # Pass through pure logic
    return estimate_sap_score(form_data)

@app.post("/api/audits")
def submit_audit(form_data: AuditFormData):
    return {"success": True, "id": "AUD-9921", "message": "Draft saved successfully."}

@app.post("/api/remediation/{action_id}/assign")
def assign_remediation(action_id: str):
    return {"success": True, "actionId": action_id, "status": "IN PROGRESS"}

