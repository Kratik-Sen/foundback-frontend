import { useRef } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { gsap, ScrollTrigger, useGSAP } from '../lib/gsap'

export default function AnimatedOutlet() {
  const location = useLocation()
  const scope = useRef(null)

  useGSAP(() => {
    const root = scope.current
    if (!root) return undefined

    const media = gsap.matchMedia()

    media.add('(prefers-reduced-motion: no-preference)', () => {
      const revealed = new WeakSet()

      gsap.fromTo(root,
        { autoAlpha: 0, y: 10 },
        { autoAlpha: 1, y: 0, duration: 0.38, ease: 'power3.out', clearProps: 'opacity,visibility,transform' },
      )

      const revealCards = (nodes) => {
        const cards = []

        nodes.forEach((node) => {
          if (!(node instanceof Element)) return
          if (node.matches('.card') && !revealed.has(node)) cards.push(node)
          node.querySelectorAll?.('.card').forEach((card) => {
            if (!revealed.has(card)) cards.push(card)
          })
        })

        const uniqueCards = [...new Set(cards)]
        uniqueCards.forEach((card) => revealed.add(card))

        uniqueCards.forEach((card, index) => {
          const scrollArea = card.closest('.results-scroll')
          const usesCustomScroller = scrollArea && /(auto|scroll)/.test(getComputedStyle(scrollArea).overflowY)

          gsap.fromTo(card,
            { autoAlpha: 0, y: 24, scale: 0.98 },
            {
              autoAlpha: 1,
              y: 0,
              scale: 1,
              duration: 0.5,
              delay: (index % 3) * 0.045,
              ease: 'power3.out',
              clearProps: 'opacity,visibility,transform',
              overwrite: 'auto',
              scrollTrigger: {
                trigger: card,
                scroller: usesCustomScroller ? scrollArea : undefined,
                start: 'top 94%',
                once: true,
                invalidateOnRefresh: true,
              },
            },
          )
        })

        if (uniqueCards.length) requestAnimationFrame(() => ScrollTrigger.refresh())
      }

      revealCards([root])

      const observer = new MutationObserver((records) => {
        revealCards(records.flatMap((record) => [...record.addedNodes]))
      })

      observer.observe(root, { childList: true, subtree: true })
      return () => observer.disconnect()
    })

    return () => media.revert()
  }, { scope, dependencies: [location.pathname], revertOnUpdate: true })

  return (
    <div ref={scope} key={location.pathname} className="page-transition">
      <Outlet />
    </div>
  )
}
