"use client"

import { WebGLShader } from "@/components/ui/web-gl-shader";
import { LiquidButton } from '@/components/ui/liquid-glass-button' 

export function ShaderDemo() {
  return (
    <div className="relative flex w-full h-[600px] flex-col items-center justify-center overflow-hidden rounded-3xl">
      <WebGLShader/> 
      <div className="relative z-10 border border-[#27272a] p-2 w-full mx-auto max-w-3xl bg-black/40 backdrop-blur-sm rounded-xl">
        <main className="relative border border-[#27272a] py-16 overflow-hidden rounded-lg">
            <h1 className="mb-6 text-white text-center text-5xl md:text-7xl font-extrabold tracking-tighter leading-none">
                Design is <br className="md:hidden" /> Everything
            </h1>
            <p className="text-white/70 px-8 text-center text-sm md:text-lg lg:text-xl max-w-2xl mx-auto">
                Unleashing creativity through bold visuals, seamless interfaces, and limitless possibilities for your retail empire.
            </p>
            <div className="my-10 flex items-center justify-center gap-2">
                <span className="relative flex h-3 w-3 items-center justify-center">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-500 opacity-75"></span>
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-green-500"></span>
                </span>
                <p className="text-xs font-semibold text-green-500 uppercase tracking-widest">Available for New Projects</p>
            </div>
            
            <div className="flex justify-center"> 
                <LiquidButton className="text-white border border-white/20 hover:border-white/40" size={'xl'}>
                    Let's Go
                </LiquidButton> 
            </div> 
        </main>
      </div>
    </div>
  )
}
