import { CalendarPlus, CheckCircle2, Edit3, ExternalLink, FileSearch, MessageCircle, PackageCheck, Sparkles, Trash2, XCircle } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { Link } from 'react-router-dom'
import api from '../api/client'
import ItemCard from '../components/ItemCard'
import PageHeader from '../components/PageHeader'
import StatusBadge from '../components/StatusBadge'
import { EmptyState, ErrorState, SkeletonGrid, Spinner } from '../components/States'
import { formatDate } from '../utils/format'

const endpoints = { listings: '/items/mine', saved: '/items/bookmarks', matches: '/items/matches', claims: '/claims/mine' }

export default function CollectionsPage({ type }) {
  const [data, setData] = useState(null)
  const [error, setError] = useState('')
  const load = useCallback(() => { setError(''); api.get(endpoints[type]).then(({ data: result }) => setData(result)).catch((err) => setError(err.message)) }, [type])
  useEffect(() => { load() }, [load])
  if (error) return <ErrorState message={error} onRetry={load} />
  if (!data) return type === 'saved' || type === 'matches' ? <SkeletonGrid /> : <Spinner />

  if (type === 'listings') {
    const items = data.items || []
    const remove = async (item) => { if (!window.confirm(`Delete “${item.title}” permanently? This cannot be undone.`)) return; try { await api.delete(`/items/${item._id}`); toast.success('Report deleted'); load() } catch (err) { toast.error(err.message) } }
    const recover = async (item, returned) => { if (!window.confirm(returned ? 'Confirm that this item was successfully recovered?' : 'Close this listing?')) return; try { await api.patch(`/items/${item._id}/recovered`, { returned }); toast.success(returned ? 'Recovery recorded' : 'Listing closed'); load() } catch (err) { toast.error(err.message) } }
    const extend = async (item) => { try { await api.post(`/items/${item._id}/extend`); toast.success('Listing extended'); load() } catch (err) { toast.error(err.message) } }
    return <><PageHeader eyebrow="Your reports" title="My lost & found listings" description="Track matching, claim, and recovery status for every report." actions={<><Link className="btn-secondary" to="/report/found">Report found</Link><Link className="btn-primary" to="/report/lost">Report lost</Link></>} />{items.length ? <div className="space-y-4">{items.map((item) => <article key={item._id} className="card flex flex-col gap-4 p-4 sm:flex-row sm:items-center"><div className="h-24 w-full shrink-0 overflow-hidden rounded-xl bg-slate-100 sm:w-28 dark:bg-slate-800">{item.images?.[0] ? <img src={item.images[0].url} alt="" className="h-full w-full object-cover" /> : <div className="grid h-full place-items-center text-slate-400"><FileSearch /></div>}</div><div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-2"><span className={`text-[.65rem] font-extrabold uppercase ${item.reportType === 'lost' ? 'text-rose-600' : 'text-emerald-600'}`}>{item.reportType}</span><StatusBadge status={item.status} /></div><Link to={`/items/${item._id}`} className="mt-2 block truncate font-extrabold text-slate-950 hover:text-brand-600 dark:text-white">{item.title}</Link><p className="mt-1 text-xs text-slate-500">{item.category} · {item.location} · Reported {formatDate(item.createdAt)}</p>{item.rejectionReason && <p className="mt-2 text-xs font-medium text-rose-600">Reason: {item.rejectionReason}</p>}</div><div className="flex flex-wrap gap-2 sm:max-w-56 sm:justify-end">{!['returned', 'closed'].includes(item.status) && <Link to={`/listings/${item._id}/edit`} className="btn-secondary !p-2.5" title="Edit"><Edit3 size={15} /></Link>}{!['returned', 'closed'].includes(item.status) && <button onClick={() => recover(item, true)} className="btn-secondary !p-2.5" title="Mark recovered"><PackageCheck size={15} /></button>}{item.status === 'expired' && <button onClick={() => extend(item)} className="btn-secondary !p-2.5" title="Extend"><CalendarPlus size={15} /></button>}<button onClick={() => remove(item)} className="btn-secondary !p-2.5 !text-rose-600" title="Delete"><Trash2 size={15} /></button></div></article>)}</div> : <EmptyState title="No reports yet" message="When you report a lost or found item, its matching and recovery progress will appear here." action={<Link to="/report/lost" className="btn-primary">Create your first report</Link>} />}</>
  }

  if (type === 'saved') {
    const bookmarks = data.bookmarks || []
    const remove = async (item) => { try { await api.delete(`/items/${item._id}/bookmark`); toast.success('Removed from saved items'); load() } catch (err) { toast.error(err.message) } }
    return <><PageHeader eyebrow="Bookmarks" title="Saved items" description="Keep promising lost and found reports close while their status changes." />{bookmarks.length ? <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">{bookmarks.map((entry) => <ItemCard key={entry._id} item={entry.item} score={entry.matchingScore} saved onBookmark={remove} />)}</div> : <EmptyState title="No saved items" message="Tap the bookmark icon on any approved listing to keep it here." />}</>
  }

  if (type === 'matches') {
    const matches = data.matches || []
    return <><PageHeader eyebrow="Smart matching" title="Possible matches" description="Scores compare category, colour, brand, location, date, and description keywords. Verify privately before claiming." />{matches.length ? <div className="space-y-7">{matches.map((match) => <section key={match._id} className="card p-5"><div className="mb-4 flex flex-wrap items-center justify-between gap-3"><div><p className="flex items-center gap-2 font-extrabold text-slate-950 dark:text-white"><Sparkles size={18} className="text-brand-600" /> {match.matchingScore}% likely match</p><p className="mt-1 text-xs text-slate-500">Matched: {match.matchedFields?.join(', ')}</p></div><StatusBadge status={match.status} /></div><div className="grid gap-5 sm:grid-cols-2"><ItemCard item={match.lostItem} score={match.matchingScore} /><ItemCard item={match.foundItem} score={match.matchingScore} /></div></section>)}</div> : <EmptyState title="No possible matches yet" message="FoundBack recalculates suggestions when opposite-type reports in the same category are approved." />}</>
  }

  const claims = data.claims || []
  return <><PageHeader eyebrow="Ownership verification" title="My claims" description="Follow staff review and move approved claims into a secure OTP-backed handover." />{claims.length ? <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">{claims.map((claim) => <article key={claim._id} className="card p-5"><div className="flex items-center justify-between"><StatusBadge status={claim.status} /><span className="text-xs text-slate-400">{formatDate(claim.createdAt)}</span></div><h2 className="mt-4 font-extrabold text-slate-950 dark:text-white">{claim.item?.title || 'Removed listing'}</h2><p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-500">{claim.reason}</p>{claim.rejectionReason && <p className="mt-3 rounded-lg bg-rose-50 p-3 text-xs text-rose-700 dark:bg-rose-500/10 dark:text-rose-300">{claim.rejectionReason}</p>}<div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4 dark:border-slate-800"><Link to={`/claims/${claim._id}`} className="text-xs font-bold text-brand-600">View claim details</Link><div className="flex items-center gap-2">{claim.chatId && claim.status !== 'closed' && <Link to={`/chats/${claim.chatId}`} className="grid size-8 place-items-center rounded-lg text-slate-400 hover:bg-brand-50 hover:text-brand-600 dark:hover:bg-brand-500/10" title="Open chat with the finder" aria-label={`Open chat about ${claim.item?.title || 'this claim'}`}><MessageCircle size={17} /></Link>}{claim.status === 'approved' ? <CheckCircle2 size={18} className="text-emerald-500" /> : claim.status === 'rejected' ? <XCircle size={18} className="text-rose-500" /> : <ExternalLink size={16} className="text-slate-400" />}</div></div></article>)}</div> : <EmptyState title="No claims submitted" message="Open an approved found-item listing and use its secure claim form to start ownership verification." />}</>
}
