import { Link } from 'react-router-dom'

function ArrowWordmark({ compact }) {
  if (compact) {
    return (
      <svg viewBox="0 0 56 56" className="size-11" aria-hidden="true">
        <circle cx="45" cy="9" r="5" fill="#f59e0b" />
        <path d="M40 9H16a6 6 0 0 0-6 6v5" fill="none" stroke="#f59e0b" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
        <path d="m5 17 5 5 5-5" fill="none" stroke="#f59e0b" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="11" cy="47" r="5" fill="#f59e0b" />
        <path d="M16 47h24a6 6 0 0 0 6-6v-5" fill="none" stroke="#f59e0b" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
        <path d="m41 39 5-5 5 5" fill="none" stroke="#f59e0b" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
        <text x="28" y="35" textAnchor="middle" fill="currentColor" fontFamily="Inter, ui-sans-serif, system-ui, sans-serif" fontSize="15" fontWeight="900">FB</text>
      </svg>
    )
  }

  return (
    <svg viewBox="0 0 224 60" className="h-10 w-[150px] overflow-visible sm:h-12 sm:w-[190px]" aria-hidden="true">
      <circle cx="209" cy="7" r="5" fill="#f59e0b" />
      <path d="M204 7H21a6 6 0 0 0-6 6v6" fill="none" stroke="#f59e0b" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="m9 16 6 6 6-6" fill="none" stroke="#f59e0b" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      <text x="28" y="41" fill="currentColor" fontFamily="Inter, ui-sans-serif, system-ui, sans-serif" fontSize="29" fontWeight="900" letterSpacing="-1.2">
        Found<tspan fill="currentColor">Back</tspan>
      </text>
      <circle cx="15" cy="53" r="5" fill="#f59e0b" />
      <path d="M20 53h183a6 6 0 0 0 6-6v-6" fill="none" stroke="#f59e0b" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="m203 44 6-6 6 6" fill="none" stroke="#f59e0b" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export default function Brand({ compact = false, inverted = false }) {
  return (
    <Link
      to="/"
      className={`group inline-flex shrink-0 items-center transition-transform duration-300 hover:scale-[1.02] ${inverted ? 'text-white' : 'text-slate-950 dark:text-white'}`}
      aria-label="FoundBack home"
    >
      <ArrowWordmark compact={compact} />
    </Link>
  )
}
