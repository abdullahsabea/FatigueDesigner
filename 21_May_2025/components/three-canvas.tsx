"use client"

import { Canvas } from "@react-three/fiber"
import {
  OrbitControls,
  Environment,
  Grid,
  Center,
  PerspectiveCamera,
  GizmoHelper,
  GizmoViewport,
  Html,
  Text,
  Line,
  Lathe,
} from "@react-three/drei"
import type { SpecimenType, SpecimenProfile } from "@/lib/types"
import { getMaterialProperties } from "@/lib/materials"
import * as THREE from "three"
import { Suspense, useEffect, useMemo, useState } from "react"
import { createLatticeGaugeSection } from "@/lib/lattice-generators"

interface ThreeCanvasProps {
  type: SpecimenType
  profile: SpecimenProfile
  material: string
  zoom: number
  showDimensions: boolean
  viewMode: "full" | "cross-section" | "wireframe" | "profile"
  controlsRef: any
}

export default function ThreeCanvas({
  type,
  profile,
  material,
  zoom,
  showDimensions,
  viewMode,
  controlsRef,
}: ThreeCanvasProps) {
  return (
    <Canvas>
      <PerspectiveCamera makeDefault position={[0, 0, 200]} zoom={zoom} />
      <ambientLight intensity={0.5} />
      <spotLight position={[100, 100, 100]} angle={0.15} penumbra={1} intensity={1} castShadow />
      <spotLight position={[-100, -100, -100]} angle={0.15} penumbra={1} intensity={0.5} />
      <Center>
        <Suspense fallback={<SimplifiedSpecimen profile={profile} material={material} />}>
          <SpecimenModel
            type={type}
            profile={profile}
            showDimensions={showDimensions}
            viewMode={viewMode}
            material={material}
          />
        </Suspense>
      </Center>
      <Grid
        args={[300, 300]}
        cellSize={10}
        cellThickness={0.6}
        cellColor="#6e6e6e"
        sectionSize={30}
        sectionThickness={1}
        sectionColor="#9d4b4b"
        fadeDistance={400}
        fadeStrength={1}
        position={[0, -50, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
      />
      <OrbitControls ref={controlsRef} />
      <Environment preset="studio" />
      <GizmoHelper alignment="bottom-right" margin={[80, 80]}>
        <GizmoViewport labelColor="white" axisColors={["#ff3653", "#0adb50", "#2c8fdf"]} />
      </GizmoHelper>
    </Canvas>
  )
}

// Simplified specimen for loading state
function SimplifiedSpecimen({ profile, material }: { profile: SpecimenProfile; material: string }) {
  // Get material properties
  const materialProps = getMaterialProperties(material)

  // Convert profile points to THREE.js Vector2 for Lathe geometry
  const points = profile.points.map((p) => new THREE.Vector2(p.y, p.x))

  return (
    <group>
      <Lathe args={[points, 64, 0, Math.PI * 2]}>
        <meshStandardMaterial
          color={materialProps.color}
          wireframe={true}
          metalness={materialProps.metalness * 0.5}
          roughness={materialProps.roughness * 1.5}
        />
      </Lathe>
      <Text position={[0, 0, 30]} fontSize={8} color="black" anchorX="center" anchorY="middle">
        Loading lattice structure...
      </Text>
    </group>
  )
}

function SpecimenModel({
  type,
  profile,
  showDimensions,
  viewMode,
  material,
}: {
  type: SpecimenType
  profile: SpecimenProfile
  showDimensions: boolean
  viewMode: "full" | "cross-section" | "wireframe" | "profile"
  material: string
}) {
  if (viewMode === "profile") {
    return <ProfileView profile={profile} />
  }

  return <CircularSpecimen profile={profile} showDimensions={showDimensions} viewMode={viewMode} material={material} />
}

function ProfileView({ profile }: { profile: SpecimenProfile }) {
  // Draw the 2D profile as lines
  const points = profile.points.map((p) => [p.x, p.y, 0])

  return (
    <group rotation={[0, 0, Math.PI / 2]}>
      <Line points={points as any} color="black" lineWidth={2} />
      <Line points={points.map((p) => [p[0], -p[1], 0]) as any} color="black" lineWidth={2} />

      {/* Central axis line */}
      <Line
        points={[
          [profile.points[0].x, 0, 0],
          [profile.points[profile.points.length - 1].x, 0, 0],
        ]}
        color="red"
        lineWidth={1}
        dashed
      />

      {/* Add labels */}
      <Text position={[0, 30, 0]} fontSize={8} color="black" anchorX="center" anchorY="middle">
        2D Profile
      </Text>

      <Text position={[0, -30, 0]} fontSize={5} color="black" anchorX="center" anchorY="middle">
        This profile is revolved/extruded to create the 3D specimen
      </Text>

      {profile.useTaperedTransition && (
        <Text
          position={[-profile.gaugeLength / 2 - profile.transitionLength / 2, 20, 0]}
          fontSize={5}
          color="black"
          anchorX="center"
          anchorY="middle"
        >
          Taper Angle: {profile.taperAngle}°
        </Text>
      )}

      {profile.latticeType !== "none" && (
        <Text position={[0, 20, 0]} fontSize={5} color="blue" anchorX="center" anchorY="middle">
          Gauge with {profile.latticeType.replace("-", " ")} lattice structure
        </Text>
      )}
    </group>
  )
}

function CircularSpecimen({
  profile,
  showDimensions,
  viewMode,
  material,
}: {
  profile: SpecimenProfile
  showDimensions: boolean
  viewMode: "full" | "cross-section" | "wireframe" | "profile"
  material: string
}) {
  // Get material properties
  const materialProps = getMaterialProperties(material)

  // Convert profile points to THREE.js Vector2 for Lathe geometry
  const points = profile.points.map((p) => new THREE.Vector2(p.y, p.x))

  // For cross-section, we'll use only half of the revolution
  const segments = viewMode === "cross-section" ? 32 : 64
  const phiStart = 0
  const phiLength = viewMode === "cross-section" ? Math.PI : Math.PI * 2

  // Reference for the gauge section mesh
  const [latticeGaugeMesh, setLatticeGaugeMesh] = useState<THREE.Mesh | null>(null)
  const [isLoading, setIsLoading] = useState(profile.latticeType !== "none")
  const [error, setError] = useState<string | null>(null)

  // Create lattice gauge section if needed
  useEffect(() => {
    if (profile.latticeType === "none") {
      setLatticeGaugeMesh(null)
      setIsLoading(false)
      setError(null)
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      // Create the lattice gauge section
      const latticeMesh = createLatticeGaugeSection(profile.latticeType as any, {
        size: profile.latticeSize,
        thickness: profile.latticeThickness,
        offset: profile.latticeOffset,
        radius: profile.gaugeDiameter / 2,
        length: profile.gaugeLength,
      })

      // Apply material properties to the lattice mesh
      if (latticeMesh.material) {
        const material = latticeMesh.material as THREE.MeshStandardMaterial
        material.color.set(materialProps.color)
        material.metalness = materialProps.metalness
        material.roughness = materialProps.roughness
        material.envMapIntensity = materialProps.envMapIntensity
      }

      setLatticeGaugeMesh(latticeMesh)
      setIsLoading(false)
    } catch (error) {
      console.error("Error creating lattice gauge section:", error)
      setError("Failed to create lattice structure")
      setIsLoading(false)
    }
  }, [
    profile.latticeType,
    profile.latticeSize,
    profile.latticeThickness,
    profile.latticeOffset,
    profile.gaugeDiameter,
    profile.gaugeLength,
    material, // Add material as a dependency to update when it changes
    materialProps, // Add materialProps as a dependency
  ])

  // Create a simplified lattice visualization for preview
  const simplifiedLattice = useMemo(() => {
    if (profile.latticeType === "none" || !isLoading) return null

    // Create a simple visualization of the lattice pattern
    const geometry = new THREE.CylinderGeometry(
      (profile.gaugeDiameter / 2) * 0.95,
      (profile.gaugeDiameter / 2) * 0.95,
      profile.gaugeLength * 0.95,
      32,
      32,
      false,
    )

    // Apply a wireframe material to show the lattice pattern
    const material = new THREE.MeshBasicMaterial({
      color: materialProps.color,
      wireframe: true,
      transparent: true,
      opacity: 0.3,
    })

    return { geometry, material }
  }, [profile.latticeType, profile.gaugeDiameter, profile.gaugeLength, isLoading, materialProps.color])

  return (
    <group>
      {/* Main specimen body */}
      <Lathe args={[points, segments, phiStart, phiLength]}>
        {viewMode === "wireframe" ? (
          <meshStandardMaterial color={materialProps.color} wireframe={true} />
        ) : (
          <meshStandardMaterial
            color={materialProps.color}
            metalness={materialProps.metalness}
            roughness={materialProps.roughness}
            envMapIntensity={materialProps.envMapIntensity}
          />
        )}
      </Lathe>

      {/* Lattice gauge section */}
      {profile.latticeType !== "none" && (
        <>
          {/* Simplified lattice visualization while loading */}
          {isLoading && simplifiedLattice && (
            <mesh
              position={[0, 0, 0]}
              rotation={[0, 0, 0]} // No rotation needed, lattice is already aligned with X axis
            >
              <primitive object={simplifiedLattice.geometry} attach="geometry" />
              <primitive object={simplifiedLattice.material} attach="material" />
            </mesh>
          )}

          {/* Error message if lattice creation failed */}
          {error && (
            <Html position={[0, 0, 0]} center>
              <div className="bg-red-100 text-red-800 px-3 py-2 rounded-md">{error}</div>
            </Html>
          )}

          {/* Actual lattice gauge section when loaded */}
          {!isLoading && !error && latticeGaugeMesh && <primitive object={latticeGaugeMesh} />}
        </>
      )}

      {showDimensions && <DimensionLabels profile={profile} material={material} />}
    </group>
  )
}

function DimensionLabels({ profile, material }: { profile: SpecimenProfile; material: string }) {
  // Get material properties
  const materialProps = getMaterialProperties(material)

  return (
    <group>
      {/* Material info */}
      <Html position={[0, profile.gripDiameter / 2 + 35, 0]} center>
        <div className="bg-white/80 px-3 py-2 rounded text-xs">
          <div className="font-bold capitalize">{material}</div>
          <div>{materialProps.description}</div>
        </div>
      </Html>

      {/* Grip diameter/width */}
      <Html position={[0, profile.gripDiameter / 2 + 10, 0]} center>
        <div className="bg-white/80 px-2 py-1 rounded text-xs">
          {profile.isCircular ? `Ø${profile.gripDiameter.toFixed(1)}mm` : `W=${profile.gripWidth.toFixed(1)}mm`}
        </div>
      </Html>

      {/* Gauge diameter/width */}
      <Html position={[0, profile.gaugeDiameter / 2 + 10, 0]} center>
        <div className="bg-white/80 px-2 py-1 rounded text-xs">
          {profile.isCircular ? `Ø${profile.gaugeDiameter.toFixed(1)}mm` : `W=${profile.gaugeWidth.toFixed(1)}mm`}
        </div>
      </Html>

      {/* Gauge length */}
      <Html position={[0, -profile.gaugeDiameter / 2 - 10, 0]} center>
        <div className="bg-white/80 px-2 py-1 rounded text-xs">L={profile.gaugeLength.toFixed(1)}mm</div>
      </Html>

      {/* Total length */}
      <Html position={[0, -profile.gripDiameter / 2 - 20, 0]} center>
        <div className="bg-white/80 px-2 py-1 rounded text-xs">Total L={profile.totalLength.toFixed(1)}mm</div>
      </Html>

      {/* Section labels */}
      <Text
        position={[-profile.totalLength / 2 + profile.gripLength / 2, 0, 30]}
        fontSize={8}
        color="black"
        anchorX="center"
        anchorY="middle"
      >
        Grip
      </Text>
      <Text position={[0, 0, 30]} fontSize={8} color="black" anchorX="center" anchorY="middle">
        Gauge {profile.latticeType !== "none" && `(${profile.latticeType.replace("-", " ")})`}
      </Text>
      <Text
        position={[profile.totalLength / 2 - profile.gripLength / 2, 0, 30]}
        fontSize={8}
        color="black"
        anchorX="center"
        anchorY="middle"
      >
        Grip
      </Text>
      <Text
        position={[-profile.gaugeLength / 2 - profile.transitionLength / 2, 0, 30]}
        fontSize={8}
        color="black"
        anchorX="center"
        anchorY="middle"
      >
        Transition
      </Text>
      <Text
        position={[profile.gaugeLength / 2 + profile.transitionLength / 2, 0, 30]}
        fontSize={8}
        color="black"
        anchorX="center"
        anchorY="middle"
      >
        Transition
      </Text>

      {/* Transition details */}
      {profile.useTaperedTransition ? (
        <Html
          position={[-profile.gaugeLength / 2 - profile.transitionLength / 2, profile.gaugeDiameter / 2 + 20, 0]}
          center
        >
          <div className="bg-white/80 px-2 py-1 rounded text-xs">Taper: {profile.taperAngle.toFixed(1)}°</div>
        </Html>
      ) : (
        <Html
          position={[-profile.gaugeLength / 2 - profile.transitionLength / 2, profile.gaugeDiameter / 2 + 20, 0]}
          center
        >
          <div className="bg-white/80 px-2 py-1 rounded text-xs">R={profile.filletRadius.toFixed(1)}mm</div>
        </Html>
      )}

      {/* Lattice details */}
      {profile.latticeType !== "none" && (
        <Html position={[0, profile.gaugeDiameter / 2 + 25, 0]} center>
          <div className="bg-white/80 px-2 py-1 rounded text-xs">
            Lattice: {profile.latticeType.replace("-", " ")} (Cell: {profile.latticeSize.toFixed(1)}mm)
          </div>
        </Html>
      )}
    </group>
  )
}
