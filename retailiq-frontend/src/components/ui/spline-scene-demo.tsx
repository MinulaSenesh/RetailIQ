'use client'

import { SplineScene } from "@/components/ui/splite";
import { Card } from "@/components/ui/card"
import { Spotlight } from "@/components/ui/spotlight"
 
export function SplineSceneBasic() {
  return (
    <Card className="w-full h-[500px] bg-black/[0.96] relative overflow-hidden border-0 rounded-none sm:rounded-3xl shadow-2xl">
      <Spotlight
        className="-top-40 left-0 md:left-60 md:-top-20"
        fill="white"
      />
      
      <div className="flex flex-col md:flex-row h-full">
        {/* Left content */}
        <div className="flex-1 p-8 sm:p-12 relative z-10 flex flex-col justify-center text-center md:text-left">
          <h1 className="text-4xl md:text-6xl font-bold bg-clip-text text-transparent bg-gradient-to-b from-neutral-50 to-neutral-400 leading-tight">
            The Future of <br /> Retail is Here
          </h1>
          <p className="mt-6 text-neutral-400 max-w-lg mx-auto md:mx-0 text-lg">
            Experience the next generation of e-commerce with RetailIQ. 
            Immersive 3D shopping, AI-driven insights, and lightning-fast performance.
          </p>
          <div className="mt-10 flex flex-wrap gap-4 justify-center md:justify-start">
             <button className="px-8 py-3 bg-white text-black font-semibold rounded-full hover:bg-neutral-200 transition-colors">
               Explore Collection
             </button>
             <button className="px-8 py-3 bg-transparent border border-neutral-700 text-white font-semibold rounded-full hover:bg-white/5 transition-colors">
               Learn More
             </button>
          </div>
        </div>

        {/* Right content */}
        <div className="flex-1 relative h-[300px] md:h-full">
          <SplineScene 
            scene="https://prod.spline.design/kZDDjO5HuC9GJUM2/scene.splinecode"
            className="w-full h-full"
          />
        </div>
      </div>
    </Card>
  )
}
