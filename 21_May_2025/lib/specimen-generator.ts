import type { SpecimenParams, SpecimenProfile, Point2D, TransitionType } from "./types"

export function generateSpecimenProfile(type: "circular", params: SpecimenParams): SpecimenProfile {
  return generateCircularSpecimenProfile(params)
}

function generateCircularSpecimenProfile(params: SpecimenParams): SpecimenProfile {
  const {
    gripLength,
    gripDiameter,
    gaugeLength,
    gaugeDiameter,
    filletRadius,
    transitionType,
    useTaperedTransition,
    taperAngle,
    latticeType,
    latticeSize,
    latticeThickness,
    latticeOffset,
  } = params

  // Calculate transition length based on the transition type and parameters
  const transitionLength = useTaperedTransition
    ? calculateTaperedTransitionLength(gripDiameter / 2, gaugeDiameter / 2, taperAngle)
    : calculateTransitionLength(gripDiameter / 2, gaugeDiameter / 2, filletRadius, transitionType)

  const totalLength = gripLength * 2 + gaugeLength + transitionLength * 2

  // Generate the profile points (half of the specimen along the x-axis)
  const points: Point2D[] = []

  // Start at the left end of the specimen
  points.push({ x: -totalLength / 2, y: 0 })

  // Left grip outer edge
  points.push({ x: -totalLength / 2, y: gripDiameter / 2 })
  points.push({ x: -gaugeLength / 2 - transitionLength, y: gripDiameter / 2 })

  // Left transition region
  if (useTaperedTransition) {
    // Simple linear taper for tapered transition
    points.push({ x: -gaugeLength / 2, y: gaugeDiameter / 2 })
  } else {
    // Curved transition based on selected type
    const leftTransitionPoints = generateTransitionPoints(
      { x: -gaugeLength / 2 - transitionLength, y: gripDiameter / 2 },
      { x: -gaugeLength / 2, y: gaugeDiameter / 2 },
      filletRadius,
      transitionType,
    )
    points.push(...leftTransitionPoints)
  }

  // Gauge section
  points.push({ x: -gaugeLength / 2, y: gaugeDiameter / 2 })
  points.push({ x: gaugeLength / 2, y: gaugeDiameter / 2 })

  // Right transition region
  if (useTaperedTransition) {
    // Simple linear taper for tapered transition
    points.push({ x: gaugeLength / 2 + transitionLength, y: gripDiameter / 2 })
  } else {
    // Curved transition based on selected type
    const rightTransitionPoints = generateTransitionPoints(
      { x: gaugeLength / 2, y: gaugeDiameter / 2 },
      { x: gaugeLength / 2 + transitionLength, y: gripDiameter / 2 },
      filletRadius,
      transitionType,
    )
    points.push(...rightTransitionPoints)
  }

  // Right grip outer edge
  points.push({ x: gaugeLength / 2 + transitionLength, y: gripDiameter / 2 })
  points.push({ x: totalLength / 2, y: gripDiameter / 2 })
  points.push({ x: totalLength / 2, y: 0 })

  return {
    points,
    totalLength,
    gripLength,
    gaugeLength,
    transitionLength,
    gripDiameter,
    gaugeDiameter,
    filletRadius,
    isCircular: true,
    useTaperedTransition,
    taperAngle,
    latticeType,
    latticeSize,
    latticeThickness,
    latticeOffset,
  }
}

// Update the calculateTransitionLength function to create longer transitions
function calculateTransitionLength(
  gripRadius: number,
  gaugeRadius: number,
  filletRadius: number,
  transitionType: TransitionType,
): number {
  const radiusDifference = gripRadius - gaugeRadius

  // Make transitions longer for a more gradual change like in the image
  return Math.max(radiusDifference * 4, filletRadius * 1.2)
}

function calculateTaperedTransitionLength(gripRadius: number, gaugeRadius: number, taperAngle: number): number {
  // Calculate transition length based on taper angle (in degrees)
  // tan(angle) = opposite / adjacent
  // opposite = radiusDifference, adjacent = transitionLength
  // transitionLength = radiusDifference / tan(angle)
  const radiusDifference = gripRadius - gaugeRadius
  const taperAngleRadians = (taperAngle * Math.PI) / 180
  return radiusDifference / Math.tan(taperAngleRadians)
}

// Update the transition generation to create a smoother profile
function generateTransitionPoints(
  startPoint: Point2D,
  endPoint: Point2D,
  filletRadius: number,
  transitionType: TransitionType,
): Point2D[] {
  const points: Point2D[] = []
  const numPoints = 20 // Increased number of points for smoother curve

  // For all transition types, use a smoother curve that resembles the image
  for (let i = 1; i < numPoints; i++) {
    const t = i / numPoints

    // Use a smoother curve function (modified sine curve)
    // This creates a gradual transition that starts and ends tangentially
    const x = startPoint.x + (endPoint.x - startPoint.x) * t

    // Use a sine-based transition for smoother curve
    const smoothT = (1 - Math.cos(Math.PI * t)) / 2
    const y = startPoint.y + (endPoint.y - startPoint.y) * smoothT

    points.push({ x, y })
  }

  return points
}
