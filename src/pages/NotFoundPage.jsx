import { Link } from 'react-router-dom'
import { Rocket, Sparkles } from 'lucide-react'

export default function NotFoundPage() {
  return (
    <div className="cosmic-bg relative flex min-h-screen flex-col items-center justify-center overflow-hidden p-6 text-center text-white">
      {/* Background Orbital Rings & Stars */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 size-[600px] rounded-full border border-slate-700/30" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 size-[420px] rounded-full border border-slate-600/20" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 size-[260px] rounded-full border border-slate-500/20" />
      </div>

      {/* Floating Astronaut & Space SVG Art */}
      <div className="relative z-10 flex flex-col items-center max-w-lg">
        {/* Floating Astronaut Illustration */}
        <div className="relative mb-6 float-soft">
          <div className="relative grid size-28 place-items-center rounded-full bg-gradient-to-tr from-slate-800 to-indigo-900 shadow-2xl border border-indigo-400/30">
            <Rocket size={54} className="text-indigo-300 transform -rotate-45" />
            <Sparkles size={20} className="absolute top-3 right-3 text-amber-300 animate-pulse" />
          </div>
        </div>

        {/* 404 Big Headline */}
        <h1 className="text-7xl font-black tracking-widest text-slate-100 sm:text-8xl drop-shadow-md">
          404
        </h1>

        {/* Subtitle matching Image 4 */}
        <p className="mt-4 text-lg font-semibold tracking-wide text-slate-300">
          It looks like you&apos;re lost...
        </p>

        <p className="mt-2 text-xs text-slate-400 max-w-xs">
          The page or item you are looking for has drifted into deep space.
        </p>

        {/* Crimson Pill Action Button matching Image 4 */}
        <Link
          to="/"
          className="mt-8 rounded-full bg-gradient-to-r from-rose-600 to-red-700 px-8 py-3.5 text-xs font-black uppercase tracking-widest text-white shadow-xl shadow-rose-900/40 transition hover:scale-105 hover:from-rose-500 hover:to-red-600"
        >
          GO BACK HOME
        </Link>
      </div>

      {/* Moon Crater Surface Overlay at bottom */}
      <div className="absolute bottom-0 inset-x-0 h-32 bg-gradient-to-t from-slate-950 via-slate-900/80 to-transparent pointer-events-none" />
    </div>
  )
}
