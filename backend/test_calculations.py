import pytest

from models import AuditFormData, EpcGrade
from calculations import estimate_sap_score, sap_score_to_grade


def make_form(**overrides):
    values = {
        "wallType": "Cavity Wall",
        "insulationThicknessMm": 100,
        "infillMaterial": "Mineral Wool",
        "floorAreaM2": 80,
        "floorConstruction": "Suspended Timber",
        "windowType": "Double Glazing",
        "frameMaterial": "uPVC",
        "glazingYear": 2022,
        "primaryHeatSystem": "Gas Combi Boiler",
        "thermostatType": "Smart TPI Thermostat",
    }
    values.update(overrides)
    return AuditFormData(**values)


def test_sap_score_to_grade_boundaries():
    assert sap_score_to_grade(100) == EpcGrade.A
    assert sap_score_to_grade(81) == EpcGrade.B
    assert sap_score_to_grade(69) == EpcGrade.C
    assert sap_score_to_grade(55) == EpcGrade.D
    assert sap_score_to_grade(39) == EpcGrade.E
    assert sap_score_to_grade(21) == EpcGrade.F
    assert sap_score_to_grade(1) == EpcGrade.G


@pytest.mark.parametrize(
    "overrides",
    [
        {"wallType": "Solid Brick", "windowType": "Single Glazing", "thermostatType": "No Controls"},
        {"wallType": "Cavity Wall", "insulationThicknessMm": 0, "windowType": "Single Glazing"},
        {"primaryHeatSystem": "Electric Storage Heaters", "thermostatType": "No Controls"},
    ],
)
def test_degraded_inputs_reduce_or_bound_estimate(overrides):
    estimate = estimate_sap_score(make_form(**overrides))
    assert 1 <= estimate.sapScore <= 100
    assert estimate.epcGrade in set(EpcGrade)


def test_optimal_inputs_are_clamped_to_valid_range():
    estimate = estimate_sap_score(make_form(
        wallType="Cavity Wall",
        insulationThicknessMm=200,
        windowType="Triple Glazing",
        glazingYear=2024,
        primaryHeatSystem="Heat Pump (Air Source)",
        thermostatType="Smart TPI Thermostat",
    ))
    assert estimate.sapScore == 100
    assert estimate.epcGrade == EpcGrade.A
    assert estimate.improvementPotentialPoints == 0


def test_blank_and_negative_numeric_inputs_are_safe():
    estimate = estimate_sap_score(make_form(
        insulationThicknessMm=-10,
        floorAreaM2=-20,
        glazingYear="not-a-year",
    ))
    assert 1 <= estimate.sapScore <= 100
    assert estimate.co2EmissionsTYear >= 0
