import type { ASTMStandard, SpecimenType, SpecimenParams } from "./types"

// Templates based on ASTM standards
export function getStandardTemplate(standard: ASTMStandard, type: SpecimenType): Partial<SpecimenParams> {
  // Default values for all standards
  const defaultParams: Partial<SpecimenParams> = {
    transitionType: "spline", // Changed default to spline for smoother transitions
    useTaperedTransition: false,
    taperAngle: 8,
    material: "steel",
    latticeType: "none",
    latticeSize: 2.0,
    latticeThickness: 0.5,
    latticeOffset: 0.5,
  }

  // Standard-specific templates
  if (standard === "E466") {
    // Force-controlled fatigue test specimens
    return {
      ...defaultParams,
      gripLength: 50,
      gripDiameter: 15,
      gaugeLength: 25,
      gaugeDiameter: 8,
      filletRadius: 60, // Increased for smoother transition
    }
  } else if (standard === "E606") {
    // Strain-controlled fatigue test specimens
    return {
      ...defaultParams,
      gripLength: 45,
      gripDiameter: 16,
      gaugeLength: 15,
      gaugeDiameter: 6.35,
      filletRadius: 70, // Increased for smoother transition
      transitionType: "spline",
    }
  } else if (standard === "E8") {
    // Tensile test specimens
    return {
      ...defaultParams,
      gripLength: 60,
      gripDiameter: 20,
      gaugeLength: 50,
      gaugeDiameter: 12.5,
      filletRadius: 50, // Increased for smoother transition
      transitionType: "spline",
    }
  }

  // Fallback to default values
  return {
    ...defaultParams,
    gripLength: 50,
    gripDiameter: 15,
    gaugeLength: 30,
    gaugeDiameter: 8,
    filletRadius: 60, // Increased for smoother transition
  }
}
