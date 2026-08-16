import { Bookmark, CalendarDays, MapPin, PackageSearch, ShieldCheck } from 'lucide-react'
import { Link } from 'react-router-dom'
import { formatDate } from '../utils/format'
import StatusBadge from './StatusBadge'

export default function ItemCard({ item, score, onBookmark, saved = false }) {
  return <article className="card group relative cursor-pointer overflow-hidden transition duration-200 hover:-translate-y-1 hover:shadow-xl hover:shadow-slate-900/8">
    <Link
      to={`/items/${item._id}`}
      className="absolute inset-0 z-10 rounded-[inherit] focus-visible:outline focus-visible:outline-3 focus-visible:outline-offset-[-3px] focus-visible:outline-brand-500"
      aria-label={`View ${item.title}`}
    />
    <div className="relative h-44 overflow-hidden bg-slate-100 dark:bg-slate-800">
      {item.images?.[0]?.url ? <img src={item.images[0].url} alt="" className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.04]" /> : <div className="grid h-full place-items-center bg-gradient-to-br from-brand-50 to-sky-50 text-brand-300 dark:from-slate-800 dark:to-slate-900 dark:text-slate-600"><PackageSearch size={46} strokeWidth={1.4} /></div>}
      <div className="absolute inset-x-0 top-0 flex items-start justify-between p-3"><span className={`rounded-full px-2.5 py-1 text-[.68rem] font-extrabold uppercase tracking-wider text-white ${item.reportType === 'lost' ? 'bg-rose-600' : 'bg-emerald-600'}`}>{item.reportType}</span>{onBookmark && <button onClick={() => onBookmark(item)} className="relative z-20 grid size-8 place-items-center rounded-full bg-white/95 text-slate-700 shadow-sm hover:text-brand-600" aria-label={saved ? 'Remove bookmark' : 'Save item'}><Bookmark size={15} fill={saved ? 'currentColor' : 'none'} /></button>}</div>
      {score != null && <div className="absolute bottom-3 left-3 rounded-lg bg-slate-950/80 px-2.5 py-1.5 text-xs font-bold text-white backdrop-blur"><span className="text-emerald-300">{score}%</span> match</div>}
    </div>
    <div className="p-5">
      <div className="flex items-center justify-between gap-3"><span className="text-xs font-bold text-brand-600 dark:text-brand-400">{item.category}</span><StatusBadge status={item.status} /></div>
      <h2 className="mt-2 text-base font-extrabold text-slate-950 transition-colors group-hover:text-brand-600 dark:text-white dark:group-hover:text-brand-400">{item.title}</h2>
      <p className="line-clamp-2 mt-1.5 min-h-10 text-sm leading-5 text-slate-500 dark:text-slate-400">{item.description}</p>
      <div className="mt-4 flex flex-wrap gap-x-4 gap-y-2 border-t border-slate-100 pt-4 text-xs text-slate-500 dark:border-slate-800 dark:text-slate-400"><span className="flex items-center gap-1.5"><MapPin size={13} /> {item.location}</span><span className="flex items-center gap-1.5"><CalendarDays size={13} /> {formatDate(item.date, 'dd MMM')}</span>{item.securityOfficeSubmitted && <span className="flex items-center gap-1.5 text-emerald-600"><ShieldCheck size={13} /> Security</span>}</div>
    </div>
  </article>
}
