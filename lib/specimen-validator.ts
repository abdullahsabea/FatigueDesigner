import type { SpecimenType, SpecimenParams, ASTMStandard, ValidationResult } from "./types"

export function validateSpecimen(type: SpecimenType, params: SpecimenParams, standard: ASTMStandard): ValidationResult {
  // Check for basic dimensional validity
  if (params.gaugeDiameter >= params.gripDiameter) {
    return {
      valid: false,
      message: "Gauge diameter must be smaller than grip diameter for proper stress concentration.",
    }
  }

  if (!params.useTaperedTransition) {
    // Check fillet radius for non-tapered transitions
    const minRadius = (params.gripDiameter - params.gaugeDiameter) * 4
    if (params.filletRadius < minRadius) {
      return {
        valid: false,
        message: `Fillet radius should be at least ${minRadius.toFixed(1)}mm for smooth transition.`,
      }
    }
  }

  // Check gauge length to diameter ratio
  const gaugeLengthToDiameterRatio = params.gaugeLength / params.gaugeDiameter

  if (standard === "E466" && gaugeLengthToDiameterRatio < 2) {
    return {
      valid: false,
      message: "For E466, gauge length should be at least 2 times the gauge diameter.",
    }
  }

  if (standard === "E606" && (gaugeLengthToDiameterRatio < 1.5 || gaugeLengthToDiameterRatio > 3)) {
    return {
      valid: false,
      message: "For E606, gauge length should be between 1.5 and 3 times the gauge diameter.",
    }
  }

  // Validate taper angle if using tapered transition
  if (params.useTaperedTransition) {
    if (params.taperAngle < 7 || params.taperAngle > 10) {
      return {
        valid: false,
        message: "Taper angle must be between 7° and 10° for proper transition.",
      }
    }
  }

  // If all checks pass
  return {
    valid: true,
    message: "Specimen design meets ASTM standards.",
  }
}
