import type { MaterialType } from "./types"

export function getMaterialColor(material: MaterialType): string {
  switch (material) {
    case "steel":
      return "#5c7590" // Updated to match the blue-gray color in the image
    case "aluminum":
      return "#d6d6d6"
    case "titanium":
      return "#a3a3a3"
    default:
      return "#5c7590" // Default to the blue-gray color
  }
}

export function getMaterialProperties(material: MaterialType) {
  switch (material) {
    case "steel":
      return {
        density: 7.85, // g/cm³
        youngsModulus: 200, // GPa
        poissonsRatio: 0.3,
        yieldStrength: 250, // MPa (typical for mild steel)
      }
    case "aluminum":
      return {
        density: 2.7, // g/cm³
        youngsModulus: 69, // GPa
        poissonsRatio: 0.33,
        yieldStrength: 95, // MPa (typical for 6061-T6)
      }
    case "titanium":
      return {
        density: 4.5, // g/cm³
        youngsModulus: 110, // GPa
        poissonsRatio: 0.34,
        yieldStrength: 880, // MPa (typical for Ti-6Al-4V)
      }
    default:
      return {
        density: 7.85,
        youngsModulus: 200,
        poissonsRatio: 0.3,
        yieldStrength: 250,
      }
  }
}
