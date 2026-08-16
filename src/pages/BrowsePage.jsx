import { Filter, Search, SlidersHorizontal, X } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { useParams, useSearchParams } from 'react-router-dom'
import api from '../api/client'
import ItemCard from '../components/ItemCard'
import PageHeader from '../components/PageHeader'
import { EmptyState, ErrorState, SkeletonGrid } from '../components/States'
import { useAuth } from '../context/AuthContext'

export default function BrowsePage() {
  const { type } = useParams()
  const [params, setParams] = useSearchParams()
  const { user } = useAuth()
  const [items, setItems] = useState([])
  const [meta, setMeta] = useState({ categories: [], locations: [] })
  const [pageInfo, setPageInfo] = useState({ page: 1, pages: 1, total: 0 })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [filtersOpen, setFiltersOpen] = useState(false)

  const load = useCallback(async () => {
    setLoading(true); setError('')
    try {
      const query = new URLSearchParams(params)
      if (type) query.set('type', type)
      const { data } = await api.get(`/items?${query}`)
      setItems(data.items); setPageInfo(data.pagination)
    } catch (err) { setError(err.message) } finally { setLoading(false) }
  }, [params, type])
  useEffect(() => { load() }, [load])
  useEffect(() => { api.get('/public/metadata').then(({ data }) => setMeta(data)).catch(() => {}) }, [])

  const update = (key, value) => { const next = new URLSearchParams(params); value ? next.set(key, value) : next.delete(key); if (key !== 'page') next.delete('page'); setParams(next) }
  const bookmark = async (item) => {
    if (!user) return toast.error('Sign in to save an item')
    try { await api.post(`/items/${item._id}/bookmark`); toast.success('Saved to your items') } catch (err) { toast.error(err.message) }
  }

  return <div className="container-app py-10"><PageHeader eyebrow="Campus reports" title={type === 'lost' ? 'Browse lost items' : type === 'found' ? 'Browse found items' : 'Search lost & found'} description={`${pageInfo.total || 0} approved reports. Private identifying details are never shown in these results.`} actions={<button className="btn-secondary lg:hidden" onClick={() => setFiltersOpen((value) => !value)}><SlidersHorizontal size={16} /> Filters</button>} /><div className="grid gap-7 lg:h-[calc(100vh-8rem)] lg:min-h-[32rem] lg:grid-cols-[260px_1fr] lg:overflow-hidden"><aside className={`${filtersOpen ? 'block' : 'hidden'} card browse-filter h-fit p-5 lg:block lg:max-h-full lg:overflow-y-auto`}><div className="flex items-center justify-between"><h2 className="flex items-center gap-2 text-sm font-bold text-slate-900 dark:text-white"><Filter size={16} /> Filter results</h2><button onClick={() => setParams({})} className="text-xs font-semibold text-brand-600">Clear</button></div><div className="mt-5 space-y-4"><label><span className="label">Report type</span><select value={type || params.get('type') || ''} onChange={(event) => update('type', event.target.value)} disabled={Boolean(type)} className="input"><option value="">Lost & found</option><option value="lost">Lost items</option><option value="found">Found items</option></select></label><label><span className="label">Category</span><select value={params.get('category') || ''} onChange={(event) => update('category', event.target.value)} className="input"><option value="">All categories</option>{meta.categories?.map((entry) => <option key={entry._id} value={entry.name}>{entry.name}</option>)}</select></label><label><span className="label">Campus location</span><select value={params.get('location') || ''} onChange={(event) => update('location', event.target.value)} className="input"><option value="">Anywhere</option>{meta.locations?.map((entry) => <option key={entry._id} value={entry.name}>{entry.name}</option>)}</select></label><label><span className="label">From date</span><input type="date" value={params.get('from') || ''} onChange={(event) => update('from', event.target.value)} className="input" /></label><label><span className="label">Sort by</span><select value={params.get('sort') || ''} onChange={(event) => update('sort', event.target.value)} className="input"><option value="">Recently added</option><option value="oldest">Oldest first</option><option value="relevant">Most relevant</option></select></label><label className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300"><input type="checkbox" checked={params.get('securityOffice') === 'true'} onChange={(event) => update('securityOffice', event.target.checked ? 'true' : '')} /> At security office</label></div></aside><div className="results-scroll lg:h-full lg:overflow-y-auto lg:overscroll-contain lg:pr-2"><div className="card results-toolbar mb-6 flex items-center gap-2 p-2"><Search className="ml-2 text-slate-400" size={18} /><input className="min-w-0 flex-1 bg-transparent px-2 py-2 text-sm outline-none" value={params.get('search') || ''} onChange={(event) => update('search', event.target.value)} placeholder="Search title, description, brand, colour or location" />{params.get('search') && <button onClick={() => update('search', '')} className="p-2 text-slate-400"><X size={16} /></button>}</div>{loading ? <SkeletonGrid /> : error ? <ErrorState message={error} onRetry={load} /> : items.length ? <><div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">{items.map((item) => <ItemCard key={item._id} item={item} onBookmark={bookmark} />)}</div>{pageInfo.pages > 1 && <div className="mt-8 flex justify-center gap-2">{Array.from({ length: pageInfo.pages }, (_, index) => index + 1).slice(0, 8).map((page) => <button key={page} onClick={() => update('page', page)} className={`grid size-9 place-items-center rounded-lg text-sm font-bold ${pageInfo.page === page ? 'bg-brand-600 text-white' : 'border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900'}`}>{page}</button>)}</div>}</> : <EmptyState title="No matching reports" message="Try removing a filter, using a broader term, or report the item so FoundBack can begin matching it." />}</div></div></div>
}
