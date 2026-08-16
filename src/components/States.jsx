import { Inbox, LoaderCircle, RefreshCcw } from 'lucide-react'

export function Spinner({ label = 'Loading' }) {
  return <div className="flex min-h-48 flex-col items-center justify-center gap-3 text-sm text-slate-500"><LoaderCircle className="animate-spin text-brand-600" /><span>{label}</span></div>
}

export function SkeletonGrid({ count = 6 }) {
  return <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{Array.from({ length: count }, (_, index) => <div key={index} className="card overflow-hidden"><div className="skeleton h-44" /><div className="space-y-3 p-5"><div className="skeleton h-4 w-1/3 rounded" /><div className="skeleton h-6 w-3/4 rounded" /><div className="skeleton h-4 rounded" /></div></div>)}</div>
}

export function EmptyState({ title = 'Nothing here yet', message = 'New activity will appear here.', action }) {
  return <div className="card flex min-h-64 flex-col items-center justify-center p-8 text-center"><span className="mb-4 grid size-14 place-items-center rounded-2xl bg-slate-100 text-slate-500 dark:bg-slate-800"><Inbox /></span><h3 className="font-bold text-slate-900 dark:text-white">{title}</h3><p className="mt-1 max-w-md text-sm text-slate-500 dark:text-slate-400">{message}</p>{action && <div className="mt-5">{action}</div>}</div>
}

export function ErrorState({ message = 'Something went wrong.', onRetry }) {
  return <div className="card flex min-h-52 flex-col items-center justify-center p-8 text-center"><p className="text-sm font-semibold text-rose-600">{message}</p>{onRetry && <button className="btn-secondary mt-4" onClick={onRetry}><RefreshCcw size={15} /> Try again</button>}</div>
}
