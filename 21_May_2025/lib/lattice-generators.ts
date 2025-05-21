import * as THREE from "three"
import { CSG } from "three-csg-ts"
import { getMaterialProperties } from "@/lib/materials"

export type LatticeType =
  | "none"
  | "vertical-grid"
  | "vertical-cross"
  | "vertical-diamond"
  | "vertical-gyroid"
  | "simple-vertical"
  | "vertical"

interface LatticeParams {
  size: number
  thickness: number
  offset: number
  radius: number
  length: number
}

// Calculate the approximate volume reduction for a lattice type
export function calculateLatticeVolumeReduction(latticeType: LatticeType, params: LatticeParams): number {
  if (latticeType === "none") {
    return 0 // No reduction for solid gauge
  }

  const { size, thickness, offset, radius, length } = params
  const gaugeVolume = Math.PI * radius * radius * length

  // Estimate volume reduction based on lattice type
  switch (latticeType) {
    case "simple-vertical":
      // Simple vertical struts - calculate number of struts and their volume
      const spacing = size * 2
      const numStruts = Math.floor(length / spacing) - 1
      const strutVolume = Math.PI * thickness * thickness * (radius * 2)
      return ((numStruts * strutVolume) / gaugeVolume) * 0.5 // Adjust for overlap

    case "vertical":
      // Vertical holes - calculate number of holes and their volume
      const holeSpacing = size * 2
      const numHoles = Math.floor(length / holeSpacing) - 1
      const holeVolume = Math.PI * thickness * thickness * (radius * 2)
      return ((numHoles * holeVolume) / gaugeVolume) * 0.8 // Adjust for effective removal

    case "vertical-grid":
      // Grid pattern - more complex structure
      return 0.25 + offset * 0.2 // Base 25% with adjustment for density

    case "vertical-cross":
      // Cross pattern - more complex structure
      return 0.3 + offset * 0.25 // Base 30% with adjustment for density

    case "vertical-diamond":
      // Diamond pattern - more complex structure
      return 0.35 + offset * 0.3 // Base 35% with adjustment for density

    case "vertical-gyroid":
      // Gyroid pattern - most complex structure
      return 0.4 + offset * 0.35 // Base 40% with adjustment for density

    default:
      return 0.2 // Default reduction
  }
}

// Main function to create a latticed gauge section
export function createLatticeGaugeSection(latticeType: LatticeType, params: LatticeParams): THREE.Mesh {
  try {
    // Create the solid gauge cylinder
    const gaugeGeometry = new THREE.CylinderGeometry(params.radius, params.radius, params.length, 32, 1, false)

    // Get material properties from the current material (default to steel)
    const materialProps = getMaterialProperties("steel")

    const gaugeMaterial = new THREE.MeshStandardMaterial({
      color: materialProps.color,
      metalness: materialProps.metalness,
      roughness: materialProps.roughness,
      envMapIntensity: materialProps.envMapIntensity,
    })

    // Rotate to align with X axis
    gaugeGeometry.rotateZ(Math.PI / 2)
    const gaugeMesh = new THREE.Mesh(gaugeGeometry, gaugeMaterial)

    // If no lattice, return the solid gauge
    if (latticeType === "none") {
      return gaugeMesh
    }

    // For simple vertical lattice, use a direct approach without CSG
    if (latticeType === "simple-vertical") {
      return createSimpleVerticalLattice(params)
    }

    // For vertical lattice, use a simplified approach
    if (latticeType === "vertical") {
      return createDirectVerticalLattice(params)
    }

    // For vertical grid lattice
    if (latticeType === "vertical-grid") {
      return createVerticalGridLattice(params)
    }

    // For vertical cross lattice
    if (latticeType === "vertical-cross") {
      return createVerticalCrossLattice(params)
    }

    // For vertical diamond lattice
    if (latticeType === "vertical-diamond") {
      return createVerticalDiamondLattice(params)
    }

    // For vertical gyroid lattice
    if (latticeType === "vertical-gyroid") {
      return createVerticalGyroidLattice(params)
    }

    // Return the original gauge mesh if no lattice type matched
    return gaugeMesh
  } catch (error) {
    console.error("Error creating lattice gauge section:", error)

    // Return a simple gauge section as fallback
    const fallbackGeometry = new THREE.CylinderGeometry(params.radius, params.radius, params.length, 32, 1, false)
    fallbackGeometry.rotateZ(Math.PI / 2) // Align with X axis

    // Get material properties from the current material (default to steel)
    const materialProps = getMaterialProperties("steel")

    const fallbackMaterial = new THREE.MeshStandardMaterial({
      color: materialProps.color,
      metalness: materialProps.metalness,
      roughness: materialProps.roughness,
      envMapIntensity: materialProps.envMapIntensity,
      wireframe: true,
    })

    const fallbackMesh = new THREE.Mesh(fallbackGeometry, fallbackMaterial)

    return fallbackMesh
  }
}

// Create a simple vertical lattice directly (no CSG)
function createSimpleVerticalLattice(params: LatticeParams): THREE.Mesh {
  const { radius, length, size, thickness } = params

  // Create the main cylinder
  const gaugeGeometry = new THREE.CylinderGeometry(radius, radius, length, 32, 1, false)
  gaugeGeometry.rotateZ(Math.PI / 2) // Align with X axis

  // Get material properties from the current material (default to steel)
  const materialProps = getMaterialProperties("steel")

  const material = new THREE.MeshStandardMaterial({
    color: materialProps.color,
    metalness: materialProps.metalness,
    roughness: materialProps.roughness,
    envMapIntensity: materialProps.envMapIntensity,
  })

  const gaugeMesh = new THREE.Mesh(gaugeGeometry, material)

  // Calculate spacing between vertical struts
  const spacing = size * 2
  const numStruts = Math.floor(length / spacing) - 1

  // Create a group to hold all meshes
  const group = new THREE.Group()
  group.add(gaugeMesh)

  // Add vertical struts
  for (let i = -numStruts / 2; i <= numStruts / 2; i++) {
    const x = i * spacing

    // Skip if outside the gauge length
    if (x < -length / 2 || x > length / 2) continue

    // Create a vertical cylinder for each strut
    const strutGeometry = new THREE.CylinderGeometry(thickness, thickness, radius * 2.5, 8, 1)
    const strutMaterial = new THREE.MeshStandardMaterial({
      color: materialProps.color,
      metalness: materialProps.metalness,
      roughness: materialProps.roughness,
      envMapIntensity: materialProps.envMapIntensity,
    })

    const strutMesh = new THREE.Mesh(strutGeometry, strutMaterial)

    // Position the strut vertically (perpendicular to gauge axis)
    strutMesh.position.set(x, 0, 0)
    strutMesh.rotation.set(0, 0, Math.PI / 2) // Rotate to make it vertical

    group.add(strutMesh)
  }

  // Return the main gauge mesh with the group attached
  gaugeMesh.add(group)
  return gaugeMesh
}

// Create a direct vertical lattice using a more reliable approach
function createDirectVerticalLattice(params: LatticeParams): THREE.Mesh {
  const { radius, length, size, thickness } = params

  // Create the main cylinder
  const gaugeGeometry = new THREE.CylinderGeometry(radius, radius, length, 32, 1, false)
  gaugeGeometry.rotateZ(Math.PI / 2) // Align with X axis

  // Get material properties from the current material (default to steel)
  const materialProps = getMaterialProperties("steel")

  // Create a material with holes for the vertical struts
  const material = new THREE.MeshStandardMaterial({
    color: materialProps.color,
    metalness: materialProps.metalness,
    roughness: materialProps.roughness,
    envMapIntensity: materialProps.envMapIntensity,
  })

  const gaugeMesh = new THREE.Mesh(gaugeGeometry, material)

  // Calculate spacing between vertical struts
  const spacing = size * 2
  const numStruts = Math.floor(length / spacing) - 1

  // Create vertical holes through the gauge section
  for (let i = -numStruts / 2; i <= numStruts / 2; i++) {
    const x = i * spacing

    // Skip if outside the gauge length
    if (x < -length / 2 || x > length / 2) continue

    try {
      // Create a hole cylinder
      const holeGeometry = new THREE.CylinderGeometry(thickness, thickness, radius * 2.5, 16, 1)
      const holeMaterial = new THREE.MeshBasicMaterial({ color: 0x000000 })
      const holeMesh = new THREE.Mesh(holeGeometry, holeMaterial)

      // Position the hole vertically (perpendicular to gauge axis)
      holeMesh.position.set(x, 0, 0)
      holeMesh.rotation.set(0, 0, Math.PI / 2) // Rotate to make it vertical

      // Perform CSG subtraction for each hole
      const csgGauge = CSG.fromMesh(gaugeMesh)
      const csgHole = CSG.fromMesh(holeMesh)
      const csgResult = csgGauge.subtract(csgHole)

      // Update the gauge mesh with the result
      const newMaterial = gaugeMesh.material.clone()
      const resultMesh = CSG.toMesh(csgResult, gaugeMesh.matrix, newMaterial)

      // Replace the gauge mesh with the result
      gaugeMesh.geometry.dispose()
      gaugeMesh.geometry = resultMesh.geometry
    } catch (error) {
      console.error("Error creating vertical hole:", error)
      // Continue with the next hole if this one fails
    }
  }

  return gaugeMesh
}

// Create a vertical grid lattice
function createVerticalGridLattice(params: LatticeParams): THREE.Mesh {
  const { radius, length, size, thickness, offset } = params

  // Create the main cylinder
  const gaugeGeometry = new THREE.CylinderGeometry(radius, radius, length, 32, 1, false)
  gaugeGeometry.rotateZ(Math.PI / 2) // Align with X axis

  // Get material properties from the current material (default to steel)
  const materialProps = getMaterialProperties("steel")

  const material = new THREE.MeshStandardMaterial({
    color: materialProps.color,
    metalness: materialProps.metalness,
    roughness: materialProps.roughness,
    envMapIntensity: materialProps.envMapIntensity,
  })

  const gaugeMesh = new THREE.Mesh(gaugeGeometry, material)

  // Calculate spacing between grid lines
  const spacing = size * 2
  const numX = Math.floor(length / spacing) - 1
  const numYZ = Math.floor((radius * 2) / spacing)

  // Create holes in X direction (along length)
  for (let i = -numX / 2; i <= numX / 2; i++) {
    const x = i * spacing

    // Skip if outside the gauge length
    if (x < -length / 2 || x > length / 2) continue

    // Create holes in Y direction (vertical)
    for (let j = -numYZ / 2; j <= numYZ / 2; j++) {
      const y = j * spacing

      // Skip if too far from center
      if (Math.abs(y) > radius * 0.9) continue

      try {
        // Create a hole cylinder along Z axis
        const holeGeometry = new THREE.CylinderGeometry(thickness * offset, thickness * offset, radius * 2.5, 16, 1)
        const holeMaterial = new THREE.MeshBasicMaterial({ color: 0x000000 })
        const holeMesh = new THREE.Mesh(holeGeometry, holeMaterial)

        // Position and rotate the hole
        holeMesh.position.set(x, y, 0)
        holeMesh.rotation.set(Math.PI / 2, 0, 0) // Rotate to align with Z axis

        // Perform CSG subtraction
        const csgGauge = CSG.fromMesh(gaugeMesh)
        const csgHole = CSG.fromMesh(holeMesh)
        const csgResult = csgGauge.subtract(csgHole)

        // Update the gauge mesh with the result
        const newMaterial = gaugeMesh.material.clone()
        const resultMesh = CSG.toMesh(csgResult, gaugeMesh.matrix, newMaterial)

        // Replace the gauge mesh with the result
        gaugeMesh.geometry.dispose()
        gaugeMesh.geometry = resultMesh.geometry
      } catch (error) {
        console.error("Error creating grid hole:", error)
        // Continue with the next hole if this one fails
      }
    }

    // Create holes in Z direction (horizontal)
    for (let k = -numYZ / 2; k <= numYZ / 2; k++) {
      const z = k * spacing

      // Skip if too far from center
      if (Math.abs(z) > radius * 0.9) continue

      try {
        // Create a hole cylinder along Y axis
        const holeGeometry = new THREE.CylinderGeometry(thickness * offset, thickness * offset, radius * 2.5, 16, 1)
        const holeMaterial = new THREE.MeshBasicMaterial({ color: 0x000000 })
        const holeMesh = new THREE.Mesh(holeGeometry, holeMaterial)

        // Position and rotate the hole
        holeMesh.position.set(x, 0, z)
        holeMesh.rotation.set(0, 0, Math.PI / 2) // Rotate to align with Y axis

        // Perform CSG subtraction
        const csgGauge = CSG.fromMesh(gaugeMesh)
        const csgHole = CSG.fromMesh(holeMesh)
        const csgResult = csgGauge.subtract(csgHole)

        // Update the gauge mesh with the result
        const newMaterial = gaugeMesh.material.clone()
        const resultMesh = CSG.toMesh(csgResult, gaugeMesh.matrix, newMaterial)

        // Replace the gauge mesh with the result
        gaugeMesh.geometry.dispose()
        gaugeMesh.geometry = resultMesh.geometry
      } catch (error) {
        console.error("Error creating grid hole:", error)
        // Continue with the next hole if this one fails
      }
    }
  }

  return gaugeMesh
}

// Create a vertical cross lattice
function createVerticalCrossLattice(params: LatticeParams): THREE.Mesh {
  const { radius, length, size, thickness, offset } = params

  // Create the main cylinder
  const gaugeGeometry = new THREE.CylinderGeometry(radius, radius, length, 32, 1, false)
  gaugeGeometry.rotateZ(Math.PI / 2) // Align with X axis

  // Get material properties from the current material (default to steel)
  const materialProps = getMaterialProperties("steel")

  const material = new THREE.MeshStandardMaterial({
    color: materialProps.color,
    metalness: materialProps.metalness,
    roughness: materialProps.roughness,
    envMapIntensity: materialProps.envMapIntensity,
  })

  const gaugeMesh = new THREE.Mesh(gaugeGeometry, material)

  // Calculate spacing between cross points
  const spacing = size * 3
  const numX = Math.floor(length / spacing) - 1

  // Create cross patterns along the length
  for (let i = -numX / 2; i <= numX / 2; i++) {
    const x = i * spacing

    // Skip if outside the gauge length
    if (x < -length / 2 || x > length / 2) continue

    try {
      // Create vertical hole (Y axis)
      const verticalGeometry = new THREE.CylinderGeometry(thickness * offset, thickness * offset, radius * 2.5, 16, 1)
      const holeMaterial = new THREE.MeshBasicMaterial({ color: 0x000000 })
      const verticalMesh = new THREE.Mesh(verticalGeometry, holeMaterial)

      // Position and rotate the hole
      verticalMesh.position.set(x, 0, 0)
      verticalMesh.rotation.set(0, 0, Math.PI / 2) // Rotate to align with Y axis

      // Perform CSG subtraction
      const csgGauge = CSG.fromMesh(gaugeMesh)
      const csgHole = CSG.fromMesh(verticalMesh)
      const csgResult = csgGauge.subtract(csgHole)

      // Update the gauge mesh with the result
      const newMaterial = gaugeMesh.material.clone()
      const resultMesh = CSG.toMesh(csgResult, gaugeMesh.matrix, newMaterial)

      // Replace the gauge mesh with the result
      gaugeMesh.geometry.dispose()
      gaugeMesh.geometry = resultMesh.geometry
    } catch (error) {
      console.error("Error creating vertical hole:", error)
      // Continue if this hole fails
    }

    try {
      // Create horizontal hole (Z axis)
      const horizontalGeometry = new THREE.CylinderGeometry(thickness * offset, thickness * offset, radius * 2.5, 16, 1)
      const holeMaterial = new THREE.MeshBasicMaterial({ color: 0x000000 })
      const horizontalMesh = new THREE.Mesh(horizontalGeometry, holeMaterial)

      // Position and rotate the hole
      horizontalMesh.position.set(x, 0, 0)
      horizontalMesh.rotation.set(Math.PI / 2, 0, 0) // Rotate to align with Z axis

      // Perform CSG subtraction
      const csgGauge = CSG.fromMesh(gaugeMesh)
      const csgHole = CSG.fromMesh(horizontalMesh)
      const csgResult = csgGauge.subtract(csgHole)

      // Update the gauge mesh with the result
      const newMaterial = gaugeMesh.material.clone()
      const resultMesh = CSG.toMesh(csgResult, gaugeMesh.matrix, newMaterial)

      // Replace the gauge mesh with the result
      gaugeMesh.geometry.dispose()
      gaugeMesh.geometry = resultMesh.geometry
    } catch (error) {
      console.error("Error creating horizontal hole:", error)
      // Continue if this hole fails
    }

    // Add diagonal holes
    const diagonalAngles = [Math.PI / 4, -Math.PI / 4, Math.PI / 4 + Math.PI / 2, -Math.PI / 4 + Math.PI / 2]
    for (let j = 0; j < diagonalAngles.length; j++) {
      try {
        const angle = diagonalAngles[j]
        const diagonalGeometry = new THREE.CylinderGeometry(
          thickness * offset * 0.8,
          thickness * offset * 0.8,
          radius * 2.5,
          12,
          1,
        )
        const holeMaterial = new THREE.MeshBasicMaterial({ color: 0x000000 })
        const diagonalMesh = new THREE.Mesh(diagonalGeometry, holeMaterial)

        // Position and rotate the diagonal hole
        diagonalMesh.position.set(x, 0, 0)
        diagonalMesh.rotation.set(angle, 0, Math.PI / 2) // Rotate to create diagonal

        // Perform CSG subtraction
        const csgGauge = CSG.fromMesh(gaugeMesh)
        const csgHole = CSG.fromMesh(diagonalMesh)
        const csgResult = csgGauge.subtract(csgHole)

        // Update the gauge mesh with the result
        const newMaterial = gaugeMesh.material.clone()
        const resultMesh = CSG.toMesh(csgResult, gaugeMesh.matrix, newMaterial)

        // Replace the gauge mesh with the result
        gaugeMesh.geometry.dispose()
        gaugeMesh.geometry = resultMesh.geometry
      } catch (error) {
        console.error("Error creating diagonal hole:", error)
        // Continue if this hole fails
      }
    }
  }

  return gaugeMesh
}

// Create a vertical diamond lattice
function createVerticalDiamondLattice(params: LatticeParams): THREE.Mesh {
  const { radius, length, size, thickness, offset } = params

  // Create the main cylinder
  const gaugeGeometry = new THREE.CylinderGeometry(radius, radius, length, 32, 1, false)
  gaugeGeometry.rotateZ(Math.PI / 2) // Align with X axis

  // Get material properties from the current material (default to steel)
  const materialProps = getMaterialProperties("steel")

  const material = new THREE.MeshStandardMaterial({
    color: materialProps.color,
    metalness: materialProps.metalness,
    roughness: materialProps.roughness,
    envMapIntensity: materialProps.envMapIntensity,
  })

  const gaugeMesh = new THREE.Mesh(gaugeGeometry, material)

  // Calculate spacing between diamond points
  const spacing = size * 2.5
  const numX = Math.floor(length / spacing) - 1
  const numAngles = 8 // Number of angles for the diamond pattern

  // Create diamond patterns along the length
  for (let i = -numX / 2; i <= numX / 2; i++) {
    const x = i * spacing

    // Skip if outside the gauge length
    if (x < -length / 2 || x > length / 2) continue

    // Create holes at different angles to form a diamond pattern
    for (let j = 0; j < numAngles; j++) {
      try {
        const angle = (j / numAngles) * Math.PI * 2
        const holeGeometry = new THREE.CylinderGeometry(thickness * offset, thickness * offset, radius * 2.5, 12, 1)
        const holeMaterial = new THREE.MeshBasicMaterial({ color: 0x000000 })
        const holeMesh = new THREE.Mesh(holeGeometry, holeMaterial)

        // Position and rotate the hole
        holeMesh.position.set(x, 0, 0)
        holeMesh.rotation.set(angle, 0, Math.PI / 2) // Rotate to create diamond pattern

        // Perform CSG subtraction
        const csgGauge = CSG.fromMesh(gaugeMesh)
        const csgHole = CSG.fromMesh(holeMesh)
        const csgResult = csgGauge.subtract(csgHole)

        // Update the gauge mesh with the result
        const newMaterial = gaugeMesh.material.clone()
        const resultMesh = CSG.toMesh(csgResult, gaugeMesh.matrix, newMaterial)

        // Replace the gauge mesh with the result
        gaugeMesh.geometry.dispose()
        gaugeMesh.geometry = resultMesh.geometry
      } catch (error) {
        console.error("Error creating diamond hole:", error)
        // Continue if this hole fails
      }
    }
  }

  return gaugeMesh
}

// Create a vertical gyroid-inspired lattice
function createVerticalGyroidLattice(params: LatticeParams): THREE.Mesh {
  const { radius, length, size, thickness, offset } = params

  // Create the main cylinder
  const gaugeGeometry = new THREE.CylinderGeometry(radius, radius, length, 32, 1, false)
  gaugeGeometry.rotateZ(Math.PI / 2) // Align with X axis

  // Get material properties from the current material (default to steel)
  const materialProps = getMaterialProperties("steel")

  const material = new THREE.MeshStandardMaterial({
    color: materialProps.color,
    metalness: materialProps.metalness,
    roughness: materialProps.roughness,
    envMapIntensity: materialProps.envMapIntensity,
  })

  const gaugeMesh = new THREE.Mesh(gaugeGeometry, material)

  // Calculate spacing for the gyroid pattern
  const spacing = size * 2
  const numX = Math.floor(length / spacing) - 1
  const numAngles = 12 // More angles for a smoother gyroid-like pattern

  // Create gyroid-inspired patterns along the length
  for (let i = -numX / 2; i <= numX / 2; i++) {
    const x = i * spacing

    // Skip if outside the gauge length
    if (x < -length / 2 || x > length / 2) continue

    // Create curved holes at different angles
    for (let j = 0; j < numAngles; j++) {
      try {
        // Create a curved angle based on position
        const baseAngle = (j / numAngles) * Math.PI * 2
        const curveOffset = Math.sin(i * 0.5) * 0.2 // Add some variation based on position
        const angle = baseAngle + curveOffset

        // Create a curved cylinder for the gyroid effect
        const holeGeometry = new THREE.CylinderGeometry(
          thickness * offset * (0.8 + Math.sin(angle) * 0.2), // Vary thickness
          thickness * offset * (0.8 + Math.sin(angle) * 0.2),
          radius * 2.5,
          12,
          1,
          false,
          angle * 0.5, // Start angle
          Math.PI * 1.5, // Length of arc
        )
        const holeMaterial = new THREE.MeshBasicMaterial({ color: 0x000000 })
        const holeMesh = new THREE.Mesh(holeGeometry, holeMaterial)

        // Position and rotate the hole
        holeMesh.position.set(x, 0, 0)
        holeMesh.rotation.set(angle, 0, Math.PI / 2) // Rotate to create gyroid-like pattern

        // Perform CSG subtraction
        const csgGauge = CSG.fromMesh(gaugeMesh)
        const csgHole = CSG.fromMesh(holeMesh)
        const csgResult = csgGauge.subtract(csgHole)

        // Update the gauge mesh with the result
        const newMaterial = gaugeMesh.material.clone()
        const resultMesh = CSG.toMesh(csgResult, gaugeMesh.matrix, newMaterial)

        // Replace the gauge mesh with the result
        gaugeMesh.geometry.dispose()
        gaugeMesh.geometry = resultMesh.geometry
      } catch (error) {
        console.error("Error creating gyroid hole:", error)
        // Continue if this hole fails
      }
    }
  }

  return gaugeMesh
}
