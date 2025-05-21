import type { MaterialType } from "./types"

export function getMaterialColor(material: MaterialType): string {
  switch (material) {
    case "steel":
      return "#5c7590" // Blue-gray color for steel
    case "aluminum":
      return "#e0e0e0" // Bright silver color for aluminum
    case "titanium":
      return "#a3a3a3" // Darker silver with slight yellow tint for titanium
    default:
      return "#5c7590" // Default to steel color
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
        // Visual properties
        color: "#5c7590",
        metalness: 0.7,
        roughness: 0.3,
        envMapIntensity: 1.0,
        description: "Carbon steel with machined finish",
      }
    case "aluminum":
      return {
        density: 2.7, // g/cm³
        youngsModulus: 69, // GPa
        poissonsRatio: 0.33,
        yieldStrength: 95, // MPa (typical for 6061-T6)
        // Visual properties
        color: "#e0e0e0",
        metalness: 0.9,
        roughness: 0.2,
        envMapIntensity: 1.2,
        description: "Aluminum 6061-T6 with polished finish",
      }
    case "titanium":
      return {
        density: 4.5, // g/cm³
        youngsModulus: 110, // GPa
        poissonsRatio: 0.34,
        yieldStrength: 880, // MPa (typical for Ti-6Al-4V)
        // Visual properties
        color: "#a3a3a3",
        metalness: 0.8,
        roughness: 0.25,
        envMapIntensity: 0.9,
        description: "Ti-6Al-4V with milled finish",
      }
    default:
      return {
        density: 7.85,
        youngsModulus: 200,
        poissonsRatio: 0.3,
        yieldStrength: 250,
        // Visual properties
        color: "#5c7590",
        metalness: 0.7,
        roughness: 0.3,
        envMapIntensity: 1.0,
        description: "Standard metal finish",
      }
  }
}
