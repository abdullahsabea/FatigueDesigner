"use client"

import { useRef, useState } from "react"
import dynamic from "next/dynamic"
import { Button } from "@/components/ui/button"
import { RotateCw, ZoomIn, ZoomOut, Ruler, Layers } from "lucide-react"
import type { SpecimenType, SpecimenProfile } from "@/lib/types"

// Dynamically import the Three.js components with no SSR
const ThreeCanvas = dynamic(() => import("./three-canvas"), { ssr: false })

interface SpecimenViewerProps {
  type: SpecimenType
  profile: SpecimenProfile
  material: string
}

export default function SpecimenViewer({ type, profile, material }: SpecimenViewerProps) {
  const [zoom, setZoom] = useState(1)
  const [showDimensions, setShowDimensions] = useState(false)
  const [viewMode, setViewMode] = useState<"full" | "cross-section" | "wireframe" | "profile">("full")
  const controlsRef = useRef(null)

  const handleReset = () => {
    if (controlsRef.current) {
      controlsRef.current.reset()
    }
  }

  const handleZoomIn = () => {
    setZoom((prev) => Math.min(prev + 0.2, 2))
  }

  const handleZoomOut = () => {
    setZoom((prev) => Math.max(prev - 0.2, 0.5))
  }

  const toggleDimensions = () => {
    setShowDimensions(!showDimensions)
  }

  const cycleViewMode = () => {
    if (viewMode === "full") {
      setViewMode("cross-section")
    } else if (viewMode === "cross-section") {
      setViewMode("wireframe")
    } else if (viewMode === "wireframe") {
      setViewMode("profile")
    } else {
      setViewMode("full")
    }
  }

  return (
    <div className="relative h-full">
      <div className="absolute top-4 right-4 z-10 flex space-x-2">
        <Button variant="outline" size="icon" onClick={handleReset} title="Reset View">
          <RotateCw className="h-4 w-4" />
        </Button>
        <Button variant="outline" size="icon" onClick={handleZoomIn} title="Zoom In">
          <ZoomIn className="h-4 w-4" />
        </Button>
        <Button variant="outline" size="icon" onClick={handleZoomOut} title="Zoom Out">
          <ZoomOut className="h-4 w-4" />
        </Button>
        <Button variant="outline" size="icon" onClick={toggleDimensions} title="Toggle Dimensions">
          <Ruler className="h-4 w-4" />
        </Button>
        <Button variant="outline" size="icon" onClick={cycleViewMode} title="Cycle View Mode">
          <Layers className="h-4 w-4" />
        </Button>
      </div>

      <div className="absolute top-4 left-4 z-10 bg-white/80 px-3 py-2 rounded text-sm">
        View Mode:{" "}
        {viewMode === "full"
          ? "Full"
          : viewMode === "cross-section"
            ? "Cross-Section"
            : viewMode === "wireframe"
              ? "Wireframe"
              : "Profile"}
      </div>

      <ThreeCanvas
        type={type}
        profile={profile}
        material={material}
        zoom={zoom}
        showDimensions={showDimensions}
        viewMode={viewMode}
        controlsRef={controlsRef}
      />
    </div>
  )
}
