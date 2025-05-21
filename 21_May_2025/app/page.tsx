import SpecimenDesigner from "@/components/specimen-designer"
import Image from "next/image"

export default function Home() {
  return (
    <main className="container mx-auto py-6 px-4">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Circular Fatigue Specimen Designer</h1>
          <p className="text-muted-foreground mt-2">
            Design standardized circular dog-bone specimens for axial fatigue testing based on ASTM standards
          </p>
        </div>
        <div className="flex-shrink-0">
          <Image src="/images/logo.png" alt="AS Engineering & Technology" width={120} height={120} className="h-auto" />
        </div>
      </div>
      <SpecimenDesigner />
    </main>
  )
}
