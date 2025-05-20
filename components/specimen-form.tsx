"use client"

import type React from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Download, FileDown, RefreshCw } from "lucide-react"
import type { SpecimenParams, ASTMStandard, TransitionType, LatticeType } from "@/lib/types"
import { exportToSTL, exportToSTEP, exportToIGES } from "@/lib/export-utils"
import { getStandardTemplate } from "@/lib/standard-templates"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Slider } from "@/components/ui/slider"

interface SpecimenFormProps {
  type: "circular"
  params: SpecimenParams
  standard: ASTMStandard
  onChange: (params: Partial<SpecimenParams>) => void
  onStandardChange: (standard: ASTMStandard) => void
}

export default function SpecimenForm({ type, params, standard, onChange, onStandardChange }: SpecimenFormProps) {
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    onChange({ [name]: Number.parseFloat(value) })
  }

  const handleSwitchChange = (name: string, checked: boolean) => {
    onChange({ [name]: checked })
  }

  const handleStandardChange = (value: string) => {
    onStandardChange(value as ASTMStandard)
  }

  const handleResetToStandard = () => {
    const template = getStandardTemplate(standard, type)
    onChange(template)
  }

  const handleExportSTL = () => {
    exportToSTL(type, params)
  }

  const handleExportSTEP = () => {
    exportToSTEP(type, params)
  }

  const handleExportIGES = () => {
    exportToIGES(type, params)
  }

  const handleMaterialChange = (value: string) => {
    onChange({ material: value })
  }

  const handleTransitionTypeChange = (value: string) => {
    onChange({ transitionType: value as TransitionType })
  }

  const handleTaperAngleChange = (value: number[]) => {
    onChange({ taperAngle: value[0] })
  }

  const handleLatticeTypeChange = (value: string) => {
    onChange({ latticeType: value as LatticeType })
  }

  const handleLatticeSliderChange = (name: string, value: number[]) => {
    onChange({ [name]: value[0] })
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <Label htmlFor="standard">ASTM Standard</Label>
          <Select value={standard} onValueChange={handleStandardChange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select standard" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="E606">ASTM E606</SelectItem>
              <SelectItem value="E8">ASTM E8</SelectItem>
              <SelectItem value="E466">ASTM E466</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button variant="outline" size="sm" onClick={handleResetToStandard}>
          <RefreshCw className="mr-2 h-4 w-4" />
          Reset to Standard
        </Button>
      </div>

      <Separator />

      <div className="space-y-2">
        <Label htmlFor="material">Material</Label>
        <RadioGroup
          defaultValue="steel"
          value={params.material}
          onValueChange={handleMaterialChange}
          className="flex space-x-4"
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="steel" id="steel" />
            <Label htmlFor="steel">Steel</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="aluminum" id="aluminum" />
            <Label htmlFor="aluminum">Aluminum</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="titanium" id="titanium" />
            <Label htmlFor="titanium">Titanium</Label>
          </div>
        </RadioGroup>
      </div>

      <Separator />

      <Accordion type="single" collapsible defaultValue="grip">
        <AccordionItem value="grip">
          <AccordionTrigger>Grip Section</AccordionTrigger>
          <AccordionContent>
            <div className="grid grid-cols-2 gap-4 pt-2">
              <div className="space-y-2">
                <Label htmlFor="gripLength">Length (mm)</Label>
                <Input
                  id="gripLength"
                  name="gripLength"
                  type="number"
                  value={params.gripLength}
                  onChange={handleInputChange}
                  min={10}
                  step={1}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="gripDiameter">Diameter (mm)</Label>
                <Input
                  id="gripDiameter"
                  name="gripDiameter"
                  type="number"
                  value={params.gripDiameter}
                  onChange={handleInputChange}
                  min={5}
                  step={0.5}
                />
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="gauge">
          <AccordionTrigger>Gauge Section</AccordionTrigger>
          <AccordionContent>
            <div className="grid grid-cols-2 gap-4 pt-2">
              <div className="space-y-2">
                <Label htmlFor="gaugeLength">Length (mm)</Label>
                <Input
                  id="gaugeLength"
                  name="gaugeLength"
                  type="number"
                  value={params.gaugeLength}
                  onChange={handleInputChange}
                  min={10}
                  step={1}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="gaugeDiameter">Diameter (mm)</Label>
                <Input
                  id="gaugeDiameter"
                  name="gaugeDiameter"
                  type="number"
                  value={params.gaugeDiameter}
                  onChange={handleInputChange}
                  min={2}
                  step={0.5}
                />
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="lattice">
          <AccordionTrigger>Lattice Structure</AccordionTrigger>
          <AccordionContent>
            <div className="space-y-4 pt-2">
              <div className="space-y-2">
                <Label htmlFor="latticeType">Lattice Type</Label>
                <Select value={params.latticeType} onValueChange={handleLatticeTypeChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select lattice type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None (Solid)</SelectItem>
                    <SelectItem value="vertical">Vertical Struts</SelectItem>
                    <SelectItem value="bcc">BCC (Body-Centered Cubic)</SelectItem>
                    <SelectItem value="fcc">FCC (Face-Centered Cubic)</SelectItem>
                    <SelectItem value="gyroid">Gyroid</SelectItem>
                    <SelectItem value="diamond">Diamond</SelectItem>
                    <SelectItem value="octet">Octet Truss</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {params.latticeType !== "none" && (
                <>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <Label htmlFor="latticeSize">Cell Size (mm): {params.latticeSize.toFixed(1)}</Label>
                    </div>
                    <Slider
                      id="latticeSize"
                      min={0.5}
                      max={5.0}
                      step={0.1}
                      value={[params.latticeSize]}
                      onValueChange={(value) => handleLatticeSliderChange("latticeSize", value)}
                    />
                    <p className="text-sm text-muted-foreground mt-1">Size of each lattice cell unit</p>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <Label htmlFor="latticeThickness">Void Size (mm): {params.latticeThickness.toFixed(1)}</Label>
                    </div>
                    <Slider
                      id="latticeThickness"
                      min={0.1}
                      max={1.0}
                      step={0.1}
                      value={[params.latticeThickness]}
                      onValueChange={(value) => handleLatticeSliderChange("latticeThickness", value)}
                    />
                    <p className="text-sm text-muted-foreground mt-1">Size of the lattice voids</p>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <Label htmlFor="latticeOffset">Density Factor: {params.latticeOffset.toFixed(1)}</Label>
                    </div>
                    <Slider
                      id="latticeOffset"
                      min={0.1}
                      max={1.0}
                      step={0.1}
                      value={[params.latticeOffset]}
                      onValueChange={(value) => handleLatticeSliderChange("latticeOffset", value)}
                    />
                    <p className="text-sm text-muted-foreground mt-1">Controls the density of the lattice structure</p>
                  </div>
                </>
              )}

              <div className="bg-blue-50 p-3 rounded-md mt-2">
                <p className="text-sm text-blue-800">
                  Lattice structures are created by subtracting the lattice pattern from the solid gauge section,
                  creating voids in the shape of the selected lattice. This approach is commonly used in additive
                  manufacturing to create lightweight, high-performance structures.
                </p>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="transition">
          <AccordionTrigger>Transition Section</AccordionTrigger>
          <AccordionContent>
            <div className="space-y-4 pt-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="useTaperedTransition">Use Tapered Transition</Label>
                <Switch
                  id="useTaperedTransition"
                  checked={params.useTaperedTransition}
                  onCheckedChange={(checked) =>
                    onChange({
                      useTaperedTransition: checked,
                      transitionType: checked ? "conical" : "tangent-arc",
                    })
                  }
                />
              </div>

              {params.useTaperedTransition ? (
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <Label htmlFor="taperAngle">Taper Angle (°): {params.taperAngle}</Label>
                  </div>
                  <Slider
                    id="taperAngle"
                    min={7}
                    max={10}
                    step={0.5}
                    value={[params.taperAngle]}
                    onValueChange={handleTaperAngleChange}
                  />
                  <p className="text-sm text-muted-foreground mt-2">
                    Creates a linear tapered transition between grip and gauge sections.
                  </p>
                </div>
              ) : (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="transitionType">Transition Type</Label>
                    <Select value={params.transitionType} onValueChange={handleTransitionTypeChange}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select transition type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="spline">Smooth Spline</SelectItem>
                        <SelectItem value="tangent-arc">Tangent Arc</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="filletRadius">Fillet Radius (mm)</Label>
                    <Input
                      id="filletRadius"
                      name="filletRadius"
                      type="number"
                      value={params.filletRadius}
                      onChange={handleInputChange}
                      min={20}
                      step={5}
                    />
                  </div>

                  <div className="text-sm text-muted-foreground mt-2">
                    <p>The transition profile connects the grip and gauge sections with a smooth curve.</p>
                    <p className="mt-1">
                      Larger fillet radius creates a more gradual transition like in the reference image.
                    </p>
                  </div>
                </>
              )}
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      <Separator />

      <div className="space-y-4">
        <h3 className="text-lg font-medium">Export</h3>
        <div className="grid grid-cols-3 gap-2">
          <Button onClick={handleExportSTL} className="w-full">
            <Download className="mr-2 h-4 w-4" />
            STL
          </Button>
          <Button onClick={handleExportSTEP} className="w-full">
            <FileDown className="mr-2 h-4 w-4" />
            STEP
          </Button>
          <Button onClick={handleExportIGES} className="w-full">
            <FileDown className="mr-2 h-4 w-4" />
            IGES
          </Button>
        </div>
      </div>
    </div>
  )
}
