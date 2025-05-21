export type SpecimenType = "circular"
export type ASTMStandard = "E466" | "E606" | "E8"
export type MaterialType = "steel" | "aluminum" | "titanium"
export type TransitionType = "tangent-arc" | "spline" | "conical"
export type LatticeType =
  | "none"
  | "vertical-grid"
  | "vertical-cross"
  | "vertical-diamond"
  | "vertical-gyroid"
  | "simple-vertical"
  | "vertical"

export interface Point2D {
  x: number
  y: number
}

export interface SpecimenParams {
  // Circular specimen parameters
  gripLength: number
  gripDiameter: number
  gaugeLength: number
  gaugeDiameter: number

  // Transition parameters
  filletRadius: number
  transitionType: TransitionType

  // Tapered transition parameters
  useTaperedTransition: boolean
  taperAngle: number

  // Material
  material: MaterialType

  // Lattice parameters
  latticeType: LatticeType
  latticeSize: number
  latticeThickness: number
  latticeOffset: number
}

export interface SpecimenProfile {
  // Profile points for the specimen (2D profile)
  points: Point2D[]

  // Key dimensions for reference
  totalLength: number
  gripLength: number
  gaugeLength: number
  transitionLength: number
  gripDiameter: number
  gaugeDiameter: number
  filletRadius: number

  // Type
  isCircular: boolean

  // Tapered transition
  useTaperedTransition: boolean
  taperAngle: number

  // Lattice parameters
  latticeType: LatticeType
  latticeSize: number
  latticeThickness: number
  latticeOffset: number
}

export interface ValidationResult {
  valid: boolean
  message: string
}
