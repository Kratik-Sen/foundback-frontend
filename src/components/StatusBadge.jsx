import { titleCase } from '../utils/format'

const styles = {
  active: 'bg-emerald-50 text-emerald-700 ring-emerald-600/15 dark:bg-emerald-500/10 dark:text-emerald-300',
  approved: 'bg-emerald-50 text-emerald-700 ring-emerald-600/15 dark:bg-emerald-500/10 dark:text-emerald-300',
  returned: 'bg-sky-50 text-sky-700 ring-sky-600/15 dark:bg-sky-500/10 dark:text-sky-300',
  completed: 'bg-sky-50 text-sky-700 ring-sky-600/15 dark:bg-sky-500/10 dark:text-sky-300',
  resolved: 'bg-sky-50 text-sky-700 ring-sky-600/15 dark:bg-sky-500/10 dark:text-sky-300',
  read: 'bg-slate-100 text-slate-600 ring-slate-500/15 dark:bg-slate-700 dark:text-slate-300',
  pending: 'bg-amber-50 text-amber-700 ring-amber-600/15 dark:bg-amber-500/10 dark:text-amber-300',
  pending_approval: 'bg-amber-50 text-amber-700 ring-amber-600/15 dark:bg-amber-500/10 dark:text-amber-300',
  under_review: 'bg-violet-50 text-violet-700 ring-violet-600/15 dark:bg-violet-500/10 dark:text-violet-300',
  claim_requested: 'bg-violet-50 text-violet-700 ring-violet-600/15 dark:bg-violet-500/10 dark:text-violet-300',
  possible_match: 'bg-brand-50 text-brand-700 ring-brand-600/15 dark:bg-brand-500/10 dark:text-brand-300',
  rejected: 'bg-rose-50 text-rose-700 ring-rose-600/15 dark:bg-rose-500/10 dark:text-rose-300',
  blocked: 'bg-rose-50 text-rose-700 ring-rose-600/15 dark:bg-rose-500/10 dark:text-rose-300',
  expired: 'bg-slate-100 text-slate-600 ring-slate-500/15 dark:bg-slate-700 dark:text-slate-300',
  closed: 'bg-slate-100 text-slate-600 ring-slate-500/15 dark:bg-slate-700 dark:text-slate-300',
}

export default function StatusBadge({ status, children }) {
  return <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-[.69rem] font-bold ring-1 ring-inset ${styles[status] || styles.pending}`}>{children || titleCase(status)}</span>
}
