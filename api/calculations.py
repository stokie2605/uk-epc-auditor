from models import EpcGrade, AuditFormData, LiveEstimate

def sap_score_to_grade(score: int) -> EpcGrade:
    """Map a SAP score (0-100) to an EPC grade."""
    if score >= 92: return EpcGrade.A
    if score >= 81: return EpcGrade.B
    if score >= 69: return EpcGrade.C
    if score >= 55: return EpcGrade.D
    if score >= 39: return EpcGrade.E
    if score >= 21: return EpcGrade.F
    return EpcGrade.G

def estimate_sap_score(form: AuditFormData) -> LiveEstimate:
    """
    Pure heuristic function that estimates the SAP score and thermal metrics 
    based on the form inputs.
    """
    base_score = 45 # Baseline older property
    
    # 1. Wall impact
    if form.wallType == 'Cavity Wall':
        if isinstance(form.insulationThicknessMm, (int, float)) and form.insulationThicknessMm >= 100:
            base_score += 15
        elif form.infillMaterial != 'None (Empty Cavity)':
            base_score += 8
            
    if form.wallType == 'Solid Brick':
        base_score -= 5

    # 2. Glazing impact
    if form.windowType == 'Double Glazing':
        base_score += 8
    elif form.windowType == 'Triple Glazing':
        base_score += 12
    elif form.windowType == 'Single Glazing':
        base_score -= 10
        
    if isinstance(form.glazingYear, int) and form.glazingYear >= 2010:
        base_score += 5
        
    # 3. Heating impact
    if form.primaryHeatSystem == 'Heat Pump (Air Source)':
        base_score += 18
    elif form.primaryHeatSystem == 'Gas Combi Boiler':
        base_score += 10
        
    if form.thermostatType == 'Smart TPI Thermostat':
        base_score += 5
    elif form.thermostatType == 'No Controls':
        base_score -= 5

    # Floor size roughly affecting emissions
    raw_area = form.floorAreaM2 if isinstance(form.floorAreaM2, (int, float)) else 80
    area = max(1, raw_area)
    
    # Clamp SAP score between 1 and 100
    final_score = max(1, min(100, base_score))
    
    # Calculate derived metrics
    grade = sap_score_to_grade(final_score)
    
    # Heuristics for the UI
    thermal_loss = round(max(0.1, 2.5 - (final_score * 0.02)), 2)
    emissions = round((area * max(0.5, 5.0 - (final_score * 0.04))) / 100, 1)
    
    improvement_points = 0
    if final_score < 70:
        improvement_points = 70 - final_score

    return LiveEstimate(
        sapScore=final_score,
        epcGrade=grade,
        thermalLoss=f"{thermal_loss} W/m²K",
        co2EmissionsTYear=emissions,
        improvementPotentialPoints=improvement_points
    )
