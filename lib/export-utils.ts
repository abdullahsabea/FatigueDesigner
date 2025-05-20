import type { SpecimenType, SpecimenParams } from "./types"
import { generateSpecimenProfile } from "./specimen-generator"

// We'll use dynamic imports for Three.js to avoid SSR issues
export async function exportToSTL(type: SpecimenType, params: SpecimenParams) {
  try {
    // Dynamically import Three.js and STLExporter only on the client side
    const THREE = await import("three")
    const { STLExporter } = await import("three/examples/jsm/exporters/STLExporter")

    // Generate the specimen profile
    const profile = generateSpecimenProfile("circular", params)

    // Create a 3D model based on the profile
    const model = await createThreeJSModel("circular", profile)

    // Use Three.js STLExporter to generate STL data
    const exporter = new STLExporter()
    const stlString = exporter.parse(model, { binary: true })

    // Create a blob from the STL data
    const blob = new Blob([stlString], { type: "application/octet-stream" })

    // Download the file
    const fileName = `fatigue-specimen-circular-${Date.now()}.stl`
    downloadBlob(blob, fileName)

    console.log(`Exporting circular specimen to STL with parameters:`, params)
  } catch (error) {
    console.error("Error exporting STL:", error)
    // Fallback to text export if Three.js export fails
    exportAsText("circular", params, "stl")
  }
}

export function exportToSTEP(type: SpecimenType, params: SpecimenParams) {
  // Export as text information
  exportAsText("circular", params, "step")
}

export function exportToIGES(type: SpecimenType, params: SpecimenParams) {
  // Export as text information
  exportAsText("circular", params, "iges")
}

function exportAsText(type: SpecimenType, params: SpecimenParams, format: string) {
  const profile = generateSpecimenProfile(type, params)
  const fileName = `fatigue-specimen-${type}-${Date.now()}.${format}`

  // Create an informative placeholder
  const infoText = `
${format.toUpperCase()} export information:
------------------------
This is a placeholder for ${format.toUpperCase()} file export.

In a production environment, ${format.toUpperCase()} export would be implemented using:
1. A server-side component with OpenCascade, FreeCAD, or similar CAD libraries
2. A specialized JavaScript CAD kernel like opencascade.js

Specimen Parameters:
${JSON.stringify(params, null, 2)}

Profile Information:
- Total Length: ${profile.totalLength.toFixed(2)} mm
- Gauge Length: ${profile.gaugeLength.toFixed(2)} mm
- ${profile.isCircular ? "Diameter" : "Width"}: ${(profile.isCircular ? profile.gaugeDiameter : profile.gaugeWidth).toFixed(2)} mm
- Transition Type: ${params.useTaperedTransition ? `Tapered (${params.taperAngle}°)` : params.transitionType}
`

  const blob = new Blob([infoText], { type: "text/plain" })
  downloadBlob(blob, fileName)

  console.log(`Exporting ${type} specimen to ${format.toUpperCase()} with parameters:`, params)
}

async function createThreeJSModel(type: SpecimenType, profile: any) {
  // Dynamically import Three.js
  const THREE = await import("three")

  const model = new THREE.Group()

  // Create a lathe geometry for circular specimens
  const points = profile.points.map((p) => new THREE.Vector2(p.y, p.x))
  const geometry = new THREE.LatheGeometry(points, 64)
  const material = new THREE.MeshStandardMaterial({ color: "#8c9db5", metalness: 0.8, roughness: 0.2 })
  const mesh = new THREE.Mesh(geometry, material)
  model.add(mesh)

  // Add grip holes if specified
  if (profile.hasHole) {
    const holeGeometry = new THREE.CylinderGeometry(
      profile.holeDiameter / 2,
      profile.holeDiameter / 2,
      profile.gripDiameter * 1.5,
      32,
    )
    const holeMaterial = new THREE.MeshStandardMaterial({ color: "#333" })

    const leftHole = new THREE.Mesh(holeGeometry, holeMaterial)
    leftHole.position.set(-profile.totalLength / 2 + profile.gripLength / 2, 0, 0)
    leftHole.rotation.set(0, 0, Math.PI / 2)
    model.add(leftHole)

    const rightHole = new THREE.Mesh(holeGeometry, holeMaterial)
    rightHole.position.set(profile.totalLength / 2 - profile.gripLength / 2, 0, 0)
    rightHole.rotation.set(0, 0, Math.PI / 2)
    model.add(rightHole)
  }

  return model
}

function downloadBlob(blob: Blob, fileName: string) {
  const link = document.createElement("a")
  link.href = URL.createObjectURL(blob)
  link.download = fileName
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}
