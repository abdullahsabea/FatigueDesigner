"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { getMaterialProperties } from "@/lib/materials"
import { calculateLatticeVolumeReduction } from "@/lib/lattice-generators"
import type { SpecimenParams, SpecimenProfile } from "@/lib/types"

interface AnalysisPanelProps {
  params: SpecimenParams
  profile: SpecimenProfile
}

export default function AnalysisPanel({ params, profile }: AnalysisPanelProps) {
  // Get material properties
  const materialProps = getMaterialProperties(params.material)

  // Calculate volumes
  const gripVolume = Math.PI * Math.pow(params.gripDiameter / 2, 2) * params.gripLength * 2
  const gaugeVolume = Math.PI * Math.pow(params.gaugeDiameter / 2, 2) * params.gaugeLength

  // Calculate transition volume (approximation)
  const avgTransitionDiameter = (params.gripDiameter + params.gaugeDiameter) / 2
  const transitionVolume = Math.PI * Math.pow(avgTransitionDiameter / 2, 2) * profile.transitionLength * 2

  // Calculate total solid volume
  const totalSolidVolume = gripVolume + gaugeVolume + transitionVolume

  // Calculate lattice volume reduction
  const latticeVolumeReduction = calculateLatticeVolumeReduction(params.latticeType, {
    size: params.latticeSize,
    thickness: params.latticeThickness,
    offset: params.latticeOffset,
    radius: params.gaugeDiameter / 2,
    length: params.gaugeLength,
  })

  // Calculate actual volume with lattice
  const latticeVolumeReductionAmount = gaugeVolume * latticeVolumeReduction
  const actualVolume = totalSolidVolume - latticeVolumeReductionAmount

  // Calculate mass
  const mass = (actualVolume * materialProps.density) / 1000 // Convert to grams
  const solidMass = (totalSolidVolume * materialProps.density) / 1000

  // Calculate weight saving
  const weightSaving = ((solidMass - mass) / solidMass) * 100

  // Calculate gauge porosity
  const gaugePorosity = latticeVolumeReduction * 100

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">Physical Properties Analysis</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <p className="text-sm font-medium">Material</p>
            <p className="text-lg font-bold capitalize">{params.material}</p>
          </div>
          <div className="space-y-1">
            <p className="text-sm font-medium">Density</p>
            <p className="text-lg font-bold">{materialProps.density.toFixed(2)} g/cm³</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <p className="text-sm font-medium">Volume</p>
            <p className="text-lg font-bold">{actualVolume.toFixed(2)} mm³</p>
            <p className="text-xs text-muted-foreground">Solid: {totalSolidVolume.toFixed(2)} mm³</p>
          </div>
          <div className="space-y-1">
            <p className="text-sm font-medium">Mass</p>
            <p className="text-lg font-bold">{mass.toFixed(2)} g</p>
            <p className="text-xs text-muted-foreground">Solid: {solidMass.toFixed(2)} g</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <p className="text-sm font-medium">Weight Saving</p>
            <p className="text-lg font-bold text-green-600">{weightSaving.toFixed(1)}%</p>
          </div>
          <div className="space-y-1">
            <p className="text-sm font-medium">Gauge Porosity</p>
            <p className="text-lg font-bold">{gaugePorosity.toFixed(1)}%</p>
          </div>
        </div>

        {params.latticeType !== "none" && (
          <div className="bg-blue-50 p-3 rounded-md mt-2">
            <p className="text-sm text-blue-800">
              The {params.latticeType.replace("-", " ")} lattice structure reduces the specimen weight by{" "}
              {weightSaving.toFixed(1)}% while maintaining the overall shape and mechanical integrity of the gauge
              section.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
