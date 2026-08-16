import { X } from 'lucide-react'
import { useRef } from 'react'
import { gsap, useGSAP } from '../lib/gsap'

export default function Modal({ open, title, children, onClose, footer }) {
  const backdrop = useRef(null)
  const panel = useRef(null)

  useGSAP(() => {
    if (!open || !backdrop.current || !panel.current) return undefined

    const media = gsap.matchMedia()
    media.add('(prefers-reduced-motion: no-preference)', () => {
      const timeline = gsap.timeline({ defaults: { ease: 'power3.out' } })
      timeline
        .fromTo(backdrop.current, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.18 })
        .fromTo(panel.current,
          { autoAlpha: 0, y: 18, scale: 0.97 },
          { autoAlpha: 1, y: 0, scale: 1, duration: 0.26, clearProps: 'opacity,visibility,transform' },
          0,
        )
    })

    return () => media.revert()
  }, { dependencies: [open], revertOnUpdate: true })

  if (!open) return null
  return <div ref={backdrop} className="modal-backdrop fixed inset-0 z-[80] grid place-items-center bg-slate-950/50 p-2 backdrop-blur-sm sm:p-4" onMouseDown={(event) => event.target === event.currentTarget && onClose?.()}><div ref={panel} className="card modal-panel max-h-[calc(100dvh-1rem)] w-full max-w-lg overflow-auto sm:max-h-[90vh]"><div className="flex items-center justify-between gap-3 border-b border-slate-100 p-4 dark:border-slate-800 sm:p-5"><h2 className="min-w-0 font-bold text-slate-950 dark:text-white">{title}</h2><button onClick={onClose} className="shrink-0 rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800" aria-label="Close"><X size={19} /></button></div><div className="p-4 sm:p-5">{children}</div>{footer && <div className="flex flex-col-reverse justify-end gap-2 border-t border-slate-100 p-4 sm:flex-row">{footer}</div>}</div></div>
}
