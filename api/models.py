from enum import Enum
from typing import List, Union
from pydantic import BaseModel, field_validator

class EpcGrade(str, Enum):
    A = 'A'
    B = 'B'
    C = 'C'
    D = 'D'
    E = 'E'
    F = 'F'
    G = 'G'

class AuditStatus(str, Enum):
    COMPLIANT = 'Compliant'
    PENDING = 'Pending'
    ACTION_REQUIRED = 'Action Required'

class RemediationStatus(str, Enum):
    NOT_STARTED = 'NOT STARTED'
    IN_PROGRESS = 'IN PROGRESS'
    COMPLETE = 'COMPLETE'

class AlertSeverity(str, Enum):
    ERROR = 'error'
    INFO = 'info'
    SUCCESS = 'success'

class EpcDistribution(BaseModel):
    A: int
    B: int
    C: int
    D: int
    E: int
    F: int
    G: int

class PortfolioSummary(BaseModel):
    totalAudited: int
    totalAuditedTrend: str
    averageEpcScore: int
    averageEpcGrade: EpcGrade
    pendingRemediations: int
    compliancePercent: int
    quarterlyTarget: int
    professionalSummary: str
    epcDistribution: EpcDistribution

class Alert(BaseModel):
    id: str
    severity: AlertSeverity
    title: str
    description: str
    timestamp: str

class PropertyRecord(BaseModel):
    uprn: str
    address: str
    epcGrade: EpcGrade
    lastAuditDate: str
    status: AuditStatus

class AuditLedgerResponse(BaseModel):
    properties: List[PropertyRecord]
    total: int
    page: int
    pageSize: int

class AuditFormData(BaseModel):
    uprn: str = ""
    wallType: str
    insulationThicknessMm: Union[int, str] = ""
    infillMaterial: str
    floorAreaM2: Union[int, float, str] = ""
    floorConstruction: str
    windowType: str
    frameMaterial: str
    glazingYear: Union[int, str] = ""
    primaryHeatSystem: str
    thermostatType: str

    @field_validator('insulationThicknessMm', 'floorAreaM2', 'glazingYear', mode='before')
    @classmethod
    def allow_empty_as_default(cls, v):
        if v == "" or v is None:
            return ""
        return v

class LiveEstimate(BaseModel):
    sapScore: int
    epcGrade: EpcGrade
    thermalLoss: str
    co2EmissionsTYear: float
    improvementPotentialPoints: int

class RemediationProperty(BaseModel):
    uprn: str
    address: str
    currentScore: int
    targetScore: int
    currentGrade: EpcGrade
    epcStatus: str

class RemediationAction(BaseModel):
    id: str
    title: str
    description: str
    icon: str
    epcImpactPoints: int
    estimatedCostLow: int
    estimatedCostHigh: int
    status: RemediationStatus

class FinancialSummary(BaseModel):
    totalBudget: int
    govGrantsAvailable: int
    netInvestment: int
    estimatedPaybackYears: float
    criticalActionCount: int

class RemediationPlan(BaseModel):
    property: RemediationProperty
    actions: List[RemediationAction]
    financial: FinancialSummary

