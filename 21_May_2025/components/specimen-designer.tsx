"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import SpecimenForm from "./specimen-form"
import SpecimenViewer from "./specimen-viewer"
import AnalysisPanel from "./analysis-panel"
import { generateSpecimenProfile } from "@/lib/specimen-generator"
import type { SpecimenParams, ASTMStandard } from "@/lib/types"
import { getStandardTemplate } from "@/lib/standard-templates"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"
import { validateSpecimen } from "@/lib/specimen-validator"

export default function SpecimenDesigner() {
  const [standard, setStandard] = useState<ASTMStandard>("E606")
  const [specimenParams, setSpecimenParams] = useState<SpecimenParams>({
    // Default values for circular specimen
    gripLength: 50,
    gripDiameter: 15,
    gaugeLength: 30,
    gaugeDiameter: 7, // Slightly smaller gauge diameter for more pronounced transition
    // Transition parameters
    filletRadius: 70, // Increased for smoother transition
    transitionType: "spline", // Changed to spline for smoother transitions
    // Tapered transition parameters
    useTaperedTransition: false,
    taperAngle: 8,
    // Material
    material: "steel",
    // Lattice parameters
    latticeType: "none",
    latticeSize: 2.0,
    latticeThickness: 0.5,
    latticeOffset: 0.5,
  })

  const specimenProfile = generateSpecimenProfile("circular", specimenParams)
  const validationResult = validateSpecimen("circular", specimenParams, standard)

  const handleStandardChange = (newStandard: ASTMStandard) => {
    setStandard(newStandard)
    // Apply template based on the current type and new standard
    const template = getStandardTemplate(newStandard, "circular")
    setSpecimenParams({ ...specimenParams, ...template })
  }

  const handleParamsChange = (params: Partial<SpecimenParams>) => {
    setSpecimenParams({ ...specimenParams, ...params })
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-1">
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Circular Fatigue Specimen</h2>
          <SpecimenForm
            type="circular"
            params={specimenParams}
            onChange={handleParamsChange}
            standard={standard}
            onStandardChange={handleStandardChange}
          />
        </Card>

        {!validationResult.valid && (
          <Alert variant="destructive" className="mt-4">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Validation Warning</AlertTitle>
            <AlertDescription>{validationResult.message}</AlertDescription>
          </Alert>
        )}

        <div className="mt-4">
          <AnalysisPanel params={specimenParams} profile={specimenProfile} />
        </div>
      </div>
      <div className="lg:col-span-2">
        <Card className="p-0 overflow-hidden h-[700px]">
          <SpecimenViewer type="circular" profile={specimenProfile} material={specimenParams.material} />
        </Card>
      </div>
    </div>
  )
}
