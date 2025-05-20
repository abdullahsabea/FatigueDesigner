import * as THREE from "three"
import { CSG } from "three-csg-ts"

export type LatticeType = "bcc" | "fcc" | "gyroid" | "diamond" | "octet" | "none" | "vertical"

interface LatticeParams {
  size: number
  thickness: number
  offset: number
  radius: number
  length: number
}

// Main function to create a latticed gauge section
export function createLatticeGaugeSection(latticeType: LatticeType, params: LatticeParams): THREE.Mesh {
  try {
    // Create the solid gauge cylinder with reduced segments
    const gaugeGeometry = new THREE.CylinderGeometry(params.radius, params.radius, params.length, 24, 1, false)
    const gaugeMaterial = new THREE.MeshStandardMaterial({
      color: "#5c7590",
      metalness: 0.7,
      roughness: 0.3,
    })

    // Rotate to align with X axis
    gaugeGeometry.rotateZ(Math.PI / 2)
    const gaugeMesh = new THREE.Mesh(gaugeGeometry, gaugeMaterial)

    // If no lattice, return the solid gauge
    if (latticeType === "none") {
      return gaugeMesh
    }

    // Generate the lattice pattern to subtract
    const latticeGroup = generateLatticeMesh(latticeType, params)

    // Convert the lattice group to a single mesh for CSG operations
    const latticeMaterial = new THREE.MeshBasicMaterial({ color: 0x000000 })
    const latticeMeshes: THREE.Mesh[] = []

    // Extract all meshes from the group
    latticeGroup.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        // Optimize geometry by merging vertices
        child.geometry = child.geometry.clone()
        child.geometry.computeVertexNormals()
        latticeMeshes.push(child)
      }
    })

    // If no meshes were found, return the original gauge
    if (latticeMeshes.length === 0) {
      return gaugeMesh
    }

    // Create a single geometry from all meshes
    let combinedGeometry: THREE.BufferGeometry

    if (latticeMeshes.length === 1) {
      combinedGeometry = latticeMeshes[0].geometry
    } else {
      // Create a single mesh by using CSG union operations
      // Limit the number of CSG operations for better performance
      const maxMeshes = 50 // Limit the number of meshes to combine
      const step = Math.max(1, Math.floor(latticeMeshes.length / maxMeshes))
      let combinedMesh = latticeMeshes[0]

      for (let i = step; i < latticeMeshes.length; i += step) {
        try {
          const csg1 = CSG.fromMesh(combinedMesh)
          const csg2 = CSG.fromMesh(latticeMeshes[i])
          const csgResult = csg1.union(csg2)
          combinedMesh = CSG.toMesh(csgResult, combinedMesh.matrix, latticeMaterial)
        } catch (error) {
          console.error("Error combining lattice meshes:", error)
          // Continue with the current combined mesh
        }
      }

      combinedGeometry = combinedMesh.geometry
    }

    // Create a single lattice mesh
    const latticeMesh = new THREE.Mesh(combinedGeometry, latticeMaterial)

    // Perform CSG subtraction
    const csgGauge = CSG.fromMesh(gaugeMesh)
    const csgLattice = CSG.fromMesh(latticeMesh)
    const csgResult = csgGauge.subtract(csgLattice)

    // Convert back to mesh
    const resultMesh = CSG.toMesh(csgResult, gaugeMesh.matrix, gaugeMaterial)

    // Optimize the final geometry
    resultMesh.geometry = resultMesh.geometry.clone()
    resultMesh.geometry.computeVertexNormals()

    return resultMesh
  } catch (error) {
    console.error("Error creating lattice gauge section:", error)

    // Return a simple gauge section as fallback
    const fallbackGeometry = new THREE.CylinderGeometry(params.radius, params.radius, params.length, 24, 1, false)
    fallbackGeometry.rotateZ(Math.PI / 2) // Align with X axis
    const fallbackMaterial = new THREE.MeshStandardMaterial({
      color: "#5c7590",
      metalness: 0.7,
      roughness: 0.3,
      wireframe: true,
    })
    const fallbackMesh = new THREE.Mesh(fallbackGeometry, fallbackMaterial)

    return fallbackMesh
  }
}

// Generate a mesh representing the lattice pattern
function generateLatticeMesh(latticeType: LatticeType, params: LatticeParams): THREE.Group {
  switch (latticeType) {
    case "vertical":
      return generateVerticalLatticeMesh(params)
    case "bcc":
      return generateBCCLatticeMesh(params)
    case "fcc":
      return generateFCCLatticeMesh(params)
    case "gyroid":
      return generateGyroidLatticeMesh(params)
    case "diamond":
      return generateDiamondLatticeMesh(params)
    case "octet":
      return generateOctetLatticeMesh(params)
    default:
      return new THREE.Group()
  }
}

// Vertical lattice pattern (perpendicular to gauge axis)
function generateVerticalLatticeMesh(params: LatticeParams): THREE.Group {
  const { size, thickness, radius, length } = params
  const latticeGroup = new THREE.Group()

  // Calculate spacing between vertical struts
  const spacing = size * 2
  const numStruts = Math.floor(length / spacing) - 1

  // Create vertical struts along the gauge length
  for (let i = -numStruts / 2; i <= numStruts / 2; i++) {
    const x = i * spacing

    // Skip if outside the gauge length
    if (x < -length / 2 || x > length / 2) continue

    // Create a vertical cylinder for each strut
    const strutGeometry = new THREE.CylinderGeometry(thickness, thickness, radius * 2, 8, 1)
    const strutMesh = new THREE.Mesh(strutGeometry)

    // Position the strut vertically (perpendicular to gauge axis)
    strutMesh.position.set(x, 0, 0)
    strutMesh.rotation.set(0, 0, Math.PI / 2) // Rotate to make it vertical

    latticeGroup.add(strutMesh)

    // Add horizontal connecting struts (optional)
    if (i < numStruts / 2) {
      const nextX = (i + 1) * spacing
      if (nextX <= length / 2) {
        // Create horizontal connecting strut
        const connectorGeometry = new THREE.CylinderGeometry(thickness * 0.8, thickness * 0.8, spacing, 8, 1)
        const connectorMesh = new THREE.Mesh(connectorGeometry)

        // Position at the center between two vertical struts
        connectorMesh.position.set(x + spacing / 2, 0, 0)
        connectorMesh.rotation.set(0, 0, 0) // Align with X axis

        latticeGroup.add(connectorMesh)
      }
    }
  }

  return latticeGroup
}

// Body-Centered Cubic lattice with vertical orientation
function generateBCCLatticeMesh(params: LatticeParams): THREE.Group {
  const { size, thickness, radius, length } = params
  const latticeGroup = new THREE.Group()

  // Calculate how many cells we need along each axis
  const cellsX = Math.ceil(length / size)
  const cellsY = Math.ceil((radius * 2) / size)
  const cellsZ = Math.ceil((radius * 2) / size)

  // Generate BCC lattice cells with vertical orientation
  for (let x = -cellsX / 2; x < cellsX / 2; x++) {
    for (let y = -cellsY / 2; y < cellsY / 2; y++) {
      for (let z = -cellsZ / 2; z < cellsZ / 2; z++) {
        // Cell positions
        const x0 = x * size
        const y0 = y * size
        const z0 = z * size

        // Cell center (BCC has atoms at corners and center)
        const center = new THREE.Vector3(x0 + size / 2, y0 + size / 2, z0 + size / 2)

        // Only create cells within the gauge section
        if (center.x < -length / 2 || center.x > length / 2) continue

        // Check if the cell is within the cylinder radius
        const distFromAxis = Math.sqrt(center.y * center.y + center.z * center.z)
        if (distFromAxis > radius) continue

        // Create a sphere at the center of the cell with reduced detail
        const sphereGeometry = new THREE.SphereGeometry(thickness * 0.8, 4, 4)
        const sphereMesh = new THREE.Mesh(sphereGeometry)
        sphereMesh.position.copy(center)
        latticeGroup.add(sphereMesh)

        // Create struts to connect to neighboring cells
        // Prioritize vertical connections and reduce number of connections
        const directions = [
          new THREE.Vector3(0, size, 0), // +Y (vertical)
          new THREE.Vector3(0, 0, size), // +Z (vertical)
          new THREE.Vector3(0, -size, 0), // -Y (vertical)
          new THREE.Vector3(0, 0, -size), // -Z (vertical)
          new THREE.Vector3(size, 0, 0), // +X (horizontal, along gauge)
        ]

        // Only create some connections randomly for better visual balance
        directions.forEach((dir, index) => {
          // Higher chance for vertical connections
          const isVertical = index < 4
          if (isVertical || Math.random() < 0.4) { // Reduced from 0.7 to 0.4
            const endPoint = new THREE.Vector3().addVectors(center, dir)

            // Check if endpoint is within bounds
            if (endPoint.x < -length / 2 || endPoint.x > length / 2) return
            const endDistFromAxis = Math.sqrt(endPoint.y * endPoint.y + endPoint.z * endPoint.z)
            if (endDistFromAxis > radius) return

            // Create strut with adjusted thickness
            const strutThickness = isVertical ? thickness * 0.5 : thickness * 0.3
            const strutGeometry = createStrut(center, endPoint, strutThickness)
            if (strutGeometry) {
              const strutMesh = new THREE.Mesh(strutGeometry)
              latticeGroup.add(strutMesh)
            }
          }
        })
      }
    }
  }

  return latticeGroup
}

// Face-Centered Cubic lattice with vertical orientation
function generateFCCLatticeMesh(params: LatticeParams): THREE.Group {
  const { size, thickness, radius, length } = params
  const latticeGroup = new THREE.Group()

  // Calculate how many cells we need along each axis
  const cellsX = Math.ceil(length / size)
  const cellsY = Math.ceil((radius * 2) / size)
  const cellsZ = Math.ceil((radius * 2) / size)

  // Generate FCC lattice cells with vertical orientation
  for (let x = -cellsX / 2; x < cellsX / 2; x++) {
    for (let y = -cellsY / 2; y < cellsY / 2; y++) {
      for (let z = -cellsZ / 2; z < cellsZ / 2; z++) {
        // Cell positions
        const x0 = x * size
        const y0 = y * size
        const z0 = z * size

        // FCC has atoms at corners and face centers
        // Create face centers with emphasis on YZ faces (vertical)
        const faceCenters = [
          new THREE.Vector3(x0, y0 + size / 2, z0 + size / 2), // YZ-face center (vertical)
          new THREE.Vector3(x0 + size, y0 + size / 2, z0 + size / 2), // Opposite YZ-face (vertical)
          new THREE.Vector3(x0 + size / 2, y0, z0), // XY-face center
          new THREE.Vector3(x0 + size / 2, y0 + size, z0), // Opposite XY-face
          new THREE.Vector3(x0 + size / 2, y0, z0 + size), // XZ-face center
          new THREE.Vector3(x0 + size / 2, y0 + size, z0 + size), // Opposite XZ-face
        ]

        faceCenters.forEach((center) => {
          // Only create atoms within the gauge section
          if (center.x < -length / 2 || center.x > length / 2) return

          // Check if the atom is within the cylinder radius
          const distFromAxis = Math.sqrt(center.y * center.y + center.z * center.z)
          if (distFromAxis > radius) return

          // Create a sphere at the face center
          const sphereGeometry = new THREE.SphereGeometry(thickness, 8, 8)
          const sphereMesh = new THREE.Mesh(sphereGeometry)
          sphereMesh.position.copy(center)
          latticeGroup.add(sphereMesh)
        })

        // Connect face centers that are close to each other
        // Prioritize vertical connections
        for (let i = 0; i < faceCenters.length; i++) {
          for (let j = i + 1; j < faceCenters.length; j++) {
            const center1 = faceCenters[i]
            const center2 = faceCenters[j]

            // Skip if either center is outside bounds
            if (center1.x < -length / 2 || center1.x > length / 2 || center2.x < -length / 2 || center2.x > length / 2)
              continue

            const dist1 = Math.sqrt(center1.y * center1.y + center1.z * center1.z)
            const dist2 = Math.sqrt(center2.y * center2.y + center2.z * center2.z)
            if (dist1 > radius || dist2 > radius) continue

            // Only connect if they're close enough (within sqrt(2) * size)
            const distance = center1.distanceTo(center2)
            if (distance <= Math.sqrt(2) * size) {
              // Prioritize vertical connections
              const isVertical = Math.abs(center1.x - center2.x) < 0.01 * size
              if (isVertical || Math.random() < 0.7) {
                // 70% chance to create non-vertical connections
                const strutGeometry = createStrut(center1, center2, thickness * 0.4)
                if (strutGeometry) {
                  const strutMesh = new THREE.Mesh(strutGeometry)
                  latticeGroup.add(strutMesh)
                }
              }
            }
          }
        }
      }
    }
  }

  return latticeGroup
}

// Gyroid lattice with vertical orientation
function generateGyroidLatticeMesh(params: LatticeParams): THREE.Group {
  const { size, thickness, offset, radius, length } = params
  const latticeGroup = new THREE.Group()

  // Reduced resolution for better performance
  const resolution = 6 // Reduced from 10 to 6 points per unit size
  const stepSize = size / resolution

  // Calculate grid dimensions
  const xSteps = Math.ceil(length / stepSize)
  const ySteps = Math.ceil((radius * 2) / stepSize)
  const zSteps = Math.ceil((radius * 2) / stepSize)

  // Use a more efficient sampling strategy
  const threshold = thickness * 1.2 // Slightly increased threshold for better visual quality

  // Sample points where the gyroid function is close to zero
  for (let ix = 0; ix < xSteps; ix++) {
    const x = -length / 2 + ix * stepSize

    for (let iy = 0; iy < ySteps; iy++) {
      const y = -radius + iy * stepSize

      for (let iz = 0; iz < zSteps; iz++) {
        const z = -radius + iz * stepSize

        // Skip points outside the cylinder
        const distFromAxis = Math.sqrt(y * y + z * z)
        if (distFromAxis > radius) continue

        // Evaluate gyroid function with vertical orientation
        const scale = (2 * Math.PI) / size
        const value = gyroidFunction(y, x, z, scale, offset)

        // If close to the surface, add a sphere with reduced detail
        if (Math.abs(value) < threshold) {
          // Use fewer segments for spheres
          const sphereGeometry = new THREE.SphereGeometry(thickness * 0.4, 3, 3)
          const sphereMesh = new THREE.Mesh(sphereGeometry)
          sphereMesh.position.set(x, y, z)
          latticeGroup.add(sphereMesh)

          // Add connections to nearby points for better visual structure
          if (ix < xSteps - 1 && iy < ySteps - 1 && iz < zSteps - 1) {
            const nextX = x + stepSize
            const nextY = y + stepSize
            const nextZ = z + stepSize

            // Only connect if the next point is also part of the surface
            const nextValue = gyroidFunction(nextY, nextX, nextZ, scale, offset)
            if (Math.abs(nextValue) < threshold) {
              const strutGeometry = createStrut(
                new THREE.Vector3(x, y, z),
                new THREE.Vector3(nextX, nextY, nextZ),
                thickness * 0.2
              )
              if (strutGeometry) {
                const strutMesh = new THREE.Mesh(strutGeometry)
                latticeGroup.add(strutMesh)
              }
            }
          }
        }
      }
    }
  }

  return latticeGroup
}

// Gyroid implicit function
function gyroidFunction(x: number, y: number, z: number, scale: number, offset: number): number {
  const scaledX = x * scale
  const scaledY = y * scale
  const scaledZ = z * scale

  return (
    Math.sin(scaledX) * Math.cos(scaledY) +
    Math.sin(scaledY) * Math.cos(scaledZ) +
    Math.sin(scaledZ) * Math.cos(scaledX) -
    offset
  )
}

// Diamond lattice with vertical orientation
function generateDiamondLatticeMesh(params: LatticeParams): THREE.Group {
  const { size, thickness, radius, length } = params
  const latticeGroup = new THREE.Group()

  // Calculate how many cells we need along each axis
  const cellsX = Math.ceil(length / size)
  const cellsY = Math.ceil((radius * 2) / size)
  const cellsZ = Math.ceil((radius * 2) / size)

  // Generate Diamond lattice cells with vertical orientation
  for (let x = -cellsX / 2; x < cellsX / 2; x++) {
    for (let y = -cellsY / 2; y < cellsY / 2; y++) {
      for (let z = -cellsZ / 2; z < cellsZ / 2; z++) {
        // Cell positions
        const x0 = x * size
        const y0 = y * size
        const z0 = z * size

        // Diamond structure has atoms at specific positions within the unit cell
        // These are the fractional coordinates for a diamond lattice
        // Rearranged to emphasize vertical connections
        const positions = [
          [0, 0, 0],
          [0, 0.5, 0.5],
          [0.5, 0, 0.5],
          [0.5, 0.5, 0],
          [0.25, 0.25, 0.25],
          [0.25, 0.75, 0.75],
          [0.75, 0.25, 0.75],
          [0.75, 0.75, 0.25],
        ]

        positions.forEach((pos) => {
          const atomX = x0 + pos[0] * size
          const atomY = y0 + pos[1] * size
          const atomZ = z0 + pos[2] * size

          // Only create atoms within the gauge section
          if (atomX < -length / 2 || atomX > length / 2) return

          // Check if the atom is within the cylinder radius
          const distFromAxis = Math.sqrt(atomY * atomY + atomZ * atomZ)
          if (distFromAxis > radius) return

          // Create a sphere at the atom position
          const sphereGeometry = new THREE.SphereGeometry(thickness, 8, 8)
          const sphereMesh = new THREE.Mesh(sphereGeometry)
          sphereMesh.position.set(atomX, atomY, atomZ)
          latticeGroup.add(sphereMesh)
        })

        // Connect atoms that are close to each other (tetrahedral bonds)
        // Prioritize vertical bonds
        const bonds = [
          [0, 4],
          [1, 5],
          [2, 6],
          [3, 7], // Connect corner atoms to internal atoms
          [4, 5],
          [4, 6],
          [4, 7],
          [5, 6],
          [5, 7],
          [6, 7], // Connect internal atoms
        ]

        bonds.forEach((bond) => {
          const pos1 = positions[bond[0]]
          const pos2 = positions[bond[1]]

          const atom1 = new THREE.Vector3(x0 + pos1[0] * size, y0 + pos1[1] * size, z0 + pos1[2] * size)
          const atom2 = new THREE.Vector3(x0 + pos2[0] * size, y0 + pos2[1] * size, z0 + pos2[2] * size)

          // Skip if either atom is outside bounds
          if (atom1.x < -length / 2 || atom1.x > length / 2 || atom2.x < -length / 2 || atom2.x > length / 2) return

          const dist1 = Math.sqrt(atom1.y * atom1.y + atom1.z * atom1.z)
          const dist2 = Math.sqrt(atom2.y * atom2.y + atom2.z * atom2.z)
          if (dist1 > radius || dist2 > radius) return

          // Prioritize vertical bonds
          const isVertical = Math.abs(atom1.x - atom2.x) < 0.01 * size
          if (isVertical || Math.random() < 0.7) {
            // 70% chance to create non-vertical bonds
            const strutGeometry = createStrut(atom1, atom2, thickness * 0.3)
            if (strutGeometry) {
              const strutMesh = new THREE.Mesh(strutGeometry)
              latticeGroup.add(strutMesh)
            }
          }
        })
      }
    }
  }

  return latticeGroup
}

// Octet truss lattice with vertical orientation
function generateOctetLatticeMesh(params: LatticeParams): THREE.Group {
  const { size, thickness, radius, length } = params
  const latticeGroup = new THREE.Group()

  // Calculate how many cells we need along each axis
  const cellsX = Math.ceil(length / size)
  const cellsY = Math.ceil((radius * 2) / size)
  const cellsZ = Math.ceil((radius * 2) / size)

  // Generate Octet Truss lattice cells with vertical orientation
  for (let x = -cellsX / 2; x < cellsX / 2; x++) {
    for (let y = -cellsY / 2; y < cellsY / 2; y++) {
      for (let z = -cellsZ / 2; z < cellsZ / 2; z++) {
        // Cell positions
        const x0 = x * size
        const y0 = y * size
        const z0 = z * size

        // Octet truss has nodes at the corners of the unit cell
        const corners = [
          new THREE.Vector3(x0, y0, z0),
          new THREE.Vector3(x0 + size, y0, z0),
          new THREE.Vector3(x0, y0 + size, z0),
          new THREE.Vector3(x0 + size, y0 + size, z0),
          new THREE.Vector3(x0, y0, z0 + size),
          new THREE.Vector3(x0 + size, y0, z0 + size),
          new THREE.Vector3(x0, y0 + size, z0 + size),
          new THREE.Vector3(x0 + size, y0 + size, z0 + size),
        ]

        // Add spheres at corners
        corners.forEach((corner) => {
          // Only create nodes within the gauge section
          if (corner.x < -length / 2 || corner.x > length / 2) return

          // Check if the node is within the cylinder radius
          const distFromAxis = Math.sqrt(corner.y * corner.y + corner.z * corner.z)
          if (distFromAxis > radius) return

          // Create a sphere at the corner
          const sphereGeometry = new THREE.SphereGeometry(thickness, 8, 8)
          const sphereMesh = new THREE.Mesh(sphereGeometry)
          sphereMesh.position.copy(corner)
          latticeGroup.add(sphereMesh)
        })

        // Connect corners to form the octet truss
        // First, connect the cube edges with emphasis on vertical edges
        const cubeEdges = [
          // Vertical edges (prioritized)
          [0, 4],
          [1, 5],
          [2, 6],
          [3, 7],
          // Horizontal edges (Y direction)
          [0, 2],
          [1, 3],
          [4, 6],
          [5, 7],
          // Horizontal edges (Z direction)
          [0, 1],
          [2, 3],
          [4, 5],
          [6, 7],
        ]

        cubeEdges.forEach((edge, index) => {
          const corner1 = corners[edge[0]]
          const corner2 = corners[edge[1]]

          // Skip if either corner is outside bounds
          if (corner1.x < -length / 2 || corner1.x > length / 2 || corner2.x < -length / 2 || corner2.x > length / 2)
            return

          const dist1 = Math.sqrt(corner1.y * corner1.y + corner1.z * corner1.z)
          const dist2 = Math.sqrt(corner2.y * corner2.y + corner2.z * corner2.z)
          if (dist1 > radius || dist2 > radius) return

          // Prioritize vertical edges (first 4)
          const isVertical = index < 4
          if (isVertical || Math.random() < 0.7) {
            // 70% chance to create non-vertical edges
            const strutGeometry = createStrut(corner1, corner2, thickness * 0.3)
            if (strutGeometry) {
              const strutMesh = new THREE.Mesh(strutGeometry)
              latticeGroup.add(strutMesh)
            }
          }
        })

        // Then, add the internal diagonals that form the octahedron
        // Skip most diagonals to emphasize vertical structure
        const diagonals = [
          [0, 7],
          [1, 6],
          [2, 5],
          [3, 4], // Main diagonals
        ]

        diagonals.forEach((diagonal) => {
          const corner1 = corners[diagonal[0]]
          const corner2 = corners[diagonal[1]]

          // Skip if either corner is outside bounds
          if (corner1.x < -length / 2 || corner1.x > length / 2 || corner2.x < -length / 2 || corner2.x > length / 2)
            return

          const dist1 = Math.sqrt(corner1.y * corner1.y + corner1.z * corner1.z)
          const dist2 = Math.sqrt(corner2.y * corner2.y + corner2.z * corner2.z)
          if (dist1 > radius || dist2 > radius) return

          // Only create some diagonals (randomly) to emphasize vertical structure
          if (Math.random() < 0.3) {
            // 30% chance to create diagonals
            const strutGeometry = createStrut(corner1, corner2, thickness * 0.3)
            if (strutGeometry) {
              const strutMesh = new THREE.Mesh(strutGeometry)
              latticeGroup.add(strutMesh)
            }
          }
        })
      }
    }
  }

  return latticeGroup
}

// Helper function to create a strut between two points
function createStrut(start: THREE.Vector3, end: THREE.Vector3, radius: number): THREE.BufferGeometry | null {
  try {
    const direction = new THREE.Vector3().subVectors(end, start)
    const length = direction.length()

    // Skip very short struts
    if (length < 0.3) return null // Increased threshold

    // Use minimal segments for better performance
    const cylinderGeometry = new THREE.CylinderGeometry(radius, radius, length, 3, 1)

    // Move the cylinder so its bottom is at the origin
    cylinderGeometry.translate(0, length / 2, 0)

    // Create a matrix to position and orient the cylinder
    const quaternion = new THREE.Quaternion()
    quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), direction.clone().normalize())

    const matrix = new THREE.Matrix4()
    matrix.makeRotationFromQuaternion(quaternion)
    matrix.setPosition(start.x, start.y, start.z)

    // Apply the transformation matrix to the geometry
    cylinderGeometry.applyMatrix4(matrix)

    return cylinderGeometry
  } catch (error) {
    console.error("Error creating strut:", error)
    return null
  }
}
