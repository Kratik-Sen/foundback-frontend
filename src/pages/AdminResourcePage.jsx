import { Ban, Check, Download, Edit3, ExternalLink, FileText, LoaderCircle, Plus, Search, Send, ShieldCheck, Trash2, X } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { Link } from 'react-router-dom'
import api from '../api/client'
import { FormField } from '../components/FormField'
import Modal from '../components/Modal'
import PageHeader from '../components/PageHeader'
import StatusBadge from '../components/StatusBadge'
import { EmptyState, ErrorState, Spinner } from '../components/States'
import { useAuth } from '../context/AuthContext'
import { formatDate, titleCase } from '../utils/format'

const config = {
  users: ['User management', 'Manage students and account access.', '/admin/users'],
  staff: ['Staff accounts', 'Create and manage college staff and security access.', '/admin/users?role=staff'],
  listings: ['Listing management', 'View, inspect, or remove lost and found reports. New reports publish automatically.', '/admin/items'],
  claims: ['Claim management', 'Review ownership claims and enforce one approved claim per item.', '/admin/claims'],
  complaints: ['Reports & complaints', 'Investigate suspicious listings, claims, users, and reported chats.', '/admin/complaints'],
  contacts: ['Support inbox', 'Read and resolve messages sent from the public contact page.', '/admin/contact-messages'],
  categories: ['Item categories', 'Add, rename, disable, or safely remove report categories.', '/admin/categories'],
  locations: ['Campus locations', 'Maintain structured buildings, rooms, floors, and landmarks.', '/admin/locations'],
  announcements: ['Announcements', 'Send trusted updates to the whole community or one role.', '/admin/announcements'],
  logs: ['Admin activity logs', 'Audit sensitive moderation and configuration actions.', '/admin/logs'],
  settings: ['Portal settings', 'Manage runtime-visible configuration stored in MongoDB.', '/admin/settings'],
  reports: ['Export & printable reports', 'Download filtered item records as CSV or print the current report page.', '/admin/stats'],
  security: ['Security-office items', 'Items physically submitted to or recorded by campus security.', '/items?securityOffice=true&limit=100'],
  staffClaims: ['Claim verification queue', 'Review private ownership evidence before approving a handover.', '/claims'],
}

function Table({ headers, children }) {
  return <div className="card overflow-x-auto"><table className="w-full min-w-[760px] text-left"><thead className="border-b border-slate-100 bg-slate-50 text-[.68rem] uppercase tracking-wider text-slate-400 dark:border-slate-800 dark:bg-slate-900"><tr>{headers.map((header) => <th key={header} className="px-5 py-3 font-extrabold">{header}</th>)}</tr></thead><tbody className="divide-y divide-slate-100 text-sm dark:divide-slate-800">{children}</tbody></table></div>
}

export default function AdminResourcePage({ type }) {
  const { user } = useAuth(); const [data, setData] = useState(null); const [error, setError] = useState(''); const [query, setQuery] = useState(''); const [modal, setModal] = useState(null)
  const form = useForm(); const [saving, setSaving] = useState(false)
  const [title, description, endpoint] = config[type]
  const load = useCallback(() => { setError(''); api.get(endpoint).then(({ data: result }) => setData(result)).catch((err) => setError(err.message)) }, [endpoint])
  useEffect(() => { setData(null); load() }, [load])
  const searchable = !['announcements', 'settings', 'reports'].includes(type)
  const filterText = (entries) => !query ? entries : entries.filter((entry) => JSON.stringify(entry).toLowerCase().includes(query.toLowerCase()))
  const close = () => { setModal(null); form.reset() }

  const deleteItem = async (item) => { if (!window.confirm(`Delete “${item.title}” and its stored images permanently?`)) return; try { await api.delete(`/items/${item._id}`); toast.success('Listing deleted'); load() } catch (err) { toast.error(err.message) } }
  const toggleUser = async (entry) => { const accountStatus = entry.accountStatus === 'blocked' ? 'active' : 'blocked'; if (!window.confirm(`${accountStatus === 'blocked' ? 'Block' : 'Unblock'} ${entry.name}?`)) return; try { await api.patch(`/admin/users/${entry._id}`, { accountStatus }); toast.success(`User ${accountStatus}`); load() } catch (err) { toast.error(err.message) } }
  const reviewComplaint = async (entry, action = 'resolve') => { const adminAction = window.prompt('Message to the student who submitted this complaint:'); if (!adminAction?.trim()) return; try { const { data: result } = await api.patch(`/admin/complaints/${entry._id}`, { status: 'resolved', adminAction: adminAction.trim(), blockUser: action === 'block', hideListing: action === 'hide' }); toast.success(result.message); load() } catch (err) { toast.error(err.message) } }
  const resolveContact = async (entry) => { try { const { data: result } = await api.patch(`/admin/contact-messages/${entry._id}`, { status: entry.status === 'resolved' ? 'read' : 'resolved' }); toast.success(result.statusMessage); load() } catch (err) { toast.error(err.message) } }
  const saveResource = async (values) => {
    setSaving(true)
    try {
      let result
      if (type === 'staff') result = await api.post('/admin/users', { ...values, role: 'staff' })
      else if (type === 'categories' || type === 'locations') {
        const resource = type; const path = `/admin/${resource}${modal?.record ? `/${modal.record._id}` : ''}`
        result = modal?.record ? await api.patch(path, { ...values, active: values.active !== false }) : await api.post(path, values)
      } else if (type === 'announcements') result = await api.post('/admin/announcements', values)
      else if (type === 'settings') result = await api.put(`/admin/settings/${values.key}`, { value: values.value, description: values.description, public: values.public })
      toast.success(result.data.message); close(); load()
    } catch (err) { toast.error(err.message) } finally { setSaving(false) }
  }
  const deleteResource = async (resource, entry) => { if (!window.confirm(`Delete ${entry.name}?`)) return; try { await api.delete(`/admin/${resource}/${entry._id}`); toast.success('Deleted'); load() } catch (err) { toast.error(err.message) } }
  const exportCsv = async () => { try { const response = await api.get('/admin/export/items.csv', { responseType: 'blob' }); const url = URL.createObjectURL(response.data); const anchor = document.createElement('a'); anchor.href = url; anchor.download = `foundback-items-${new Date().toISOString().slice(0, 10)}.csv`; anchor.click(); URL.revokeObjectURL(url); toast.success('CSV downloaded') } catch (err) { toast.error(err.message) } }

  if (error) return <ErrorState message={error} onRetry={load} />
  if (!data) return <Spinner label={`Loading ${title.toLowerCase()}`} />
  const action = ['staff', 'categories', 'locations', 'announcements', 'settings'].includes(type) ? <button className="btn-primary" onClick={() => { form.reset(type === 'announcements' ? { audience: 'all' } : { active: true }); setModal({ kind: 'create' }) }}><Plus size={16} /> Add {type === 'staff' ? 'staff member' : type.slice(0, -1)}</button> : type === 'reports' ? <><button className="btn-secondary" onClick={() => window.print()}><FileText size={16} /> Print</button><button className="btn-primary" onClick={exportCsv}><Download size={16} /> Download CSV</button></> : null

  const render = () => {
    if (['users', 'staff'].includes(type)) {
      const entries = filterText(data.users || [])
      return entries.length ? <Table headers={['Person', 'Enrollment / department', 'Role', 'Status', 'Joined', 'Actions']}>{entries.map((entry) => <tr key={entry._id}><td className="px-5 py-4"><p className="font-bold text-slate-900 dark:text-white">{entry.name}</p><p className="text-xs text-slate-400">{entry.email}</p></td><td className="px-5 py-4 text-slate-500">{entry.enrollmentNumber || entry.department || '—'}</td><td className="px-5 py-4 capitalize">{entry.role}</td><td className="px-5 py-4"><StatusBadge status={entry.accountStatus} /></td><td className="px-5 py-4 text-xs text-slate-500">{formatDate(entry.createdAt)}</td><td className="px-5 py-4"><button onClick={() => toggleUser(entry)} className={`btn-secondary !p-2 ${entry.accountStatus === 'blocked' ? '!text-emerald-600' : '!text-rose-600'}`}>{entry.accountStatus === 'blocked' ? <Check size={15} /> : <Ban size={15} />}</button></td></tr>)}</Table> : <EmptyState title="No users found" />
    }
    if (['listings', 'security'].includes(type)) {
      const entries = filterText(data.items || [])
      return entries.length ? <Table headers={['Listing', 'Reporter', 'Type', 'Status', 'Reported', 'Actions']}>{entries.map((item) => <tr key={item._id}><td className="px-5 py-4"><Link to={`/items/${item._id}`} className="font-bold text-slate-900 hover:text-brand-600 dark:text-white">{item.title}</Link><p className="text-xs text-slate-400">{item.category} · {item.location}</p></td><td className="px-5 py-4"><p>{item.reporter?.name || '—'}</p><p className="text-xs text-slate-400">{item.reporter?.enrollmentNumber}</p></td><td className={`px-5 py-4 font-bold capitalize ${item.reportType === 'lost' ? 'text-rose-600' : 'text-emerald-600'}`}>{item.reportType}</td><td className="px-5 py-4"><StatusBadge status={item.status} /></td><td className="px-5 py-4 text-xs text-slate-500">{formatDate(item.createdAt)}</td><td className="px-5 py-4"><div className="flex gap-1"><Link to={`/items/${item._id}`} className="btn-secondary !p-2"><ExternalLink size={15} /></Link>{user.role === 'admin' && <button onClick={() => deleteItem(item)} className="btn-secondary !p-2 !text-rose-600"><Trash2 size={15} /></button>}</div></td></tr>)}</Table> : <EmptyState title="No listings in this queue" />
    }
    if (['claims', 'staffClaims'].includes(type)) {
      const entries = filterText(data.claims || [])
      return entries.length ? <Table headers={['Item', 'Claimant', 'Reason', 'Status', 'Submitted', 'Review']}>{entries.map((entry) => <tr key={entry._id}><td className="px-5 py-4 font-bold">{entry.item?.title || 'Removed item'}</td><td className="px-5 py-4"><p>{entry.claimant?.name}</p><p className="text-xs text-slate-400">{entry.claimant?.enrollmentNumber}</p></td><td className="max-w-xs px-5 py-4"><p className="line-clamp-2 text-xs text-slate-500">{entry.reason}</p></td><td className="px-5 py-4"><StatusBadge status={entry.status} /></td><td className="px-5 py-4 text-xs text-slate-500">{formatDate(entry.createdAt)}</td><td className="px-5 py-4"><Link to={`/claims/${entry._id}`} className="btn-secondary !py-2">Verify <ExternalLink size={14} /></Link></td></tr>)}</Table> : <EmptyState title="No claims in this queue" />
    }
    if (type === 'complaints') {
      const entries = filterText(data.complaints || [])
      return entries.length ? <Table headers={['Issue', 'Reported by', 'Related content', 'Status', 'Created', 'Response / actions']}>{entries.map((entry) => <tr key={entry._id}><td className="max-w-sm px-5 py-4"><p className="font-bold">{titleCase(entry.reportType)}</p><p className="line-clamp-2 text-xs text-slate-500">{entry.description}</p></td><td className="px-5 py-4">{entry.reportedBy?.name}</td><td className="px-5 py-4 text-xs">{entry.item?.title || (entry.chat ? `Reported chat (${entry.chatMessages?.length || 0} messages)` : entry.reportedUser?.name) || '—'}</td><td className="px-5 py-4"><StatusBadge status={entry.status} /></td><td className="px-5 py-4 text-xs text-slate-500">{formatDate(entry.createdAt)}</td><td className="max-w-sm px-5 py-4">{entry.adminAction ? <div className="rounded-lg bg-brand-50 p-3 dark:bg-brand-500/10"><p className="text-[.65rem] font-extrabold uppercase tracking-wider text-brand-600 dark:text-brand-300">Admin response</p><p className="mt-1 text-xs leading-5 text-slate-600 dark:text-slate-300">{entry.adminAction}</p></div> : <div className="flex gap-1"><button onClick={() => reviewComplaint(entry)} className="btn-secondary !p-2" title="Resolve and reply"><Check size={15} /></button>{entry.reportedUser && <button onClick={() => reviewComplaint(entry, 'block')} className="btn-secondary !p-2 !text-rose-600" title="Block user and reply"><Ban size={15} /></button>}{entry.item && <button onClick={() => reviewComplaint(entry, 'hide')} className="btn-secondary !p-2 !text-amber-600" title="Hide listing and reply"><X size={15} /></button>}</div>}</td></tr>)}</Table> : <EmptyState title="No complaints" />
    }
    if (type === 'contacts') {
      const entries = filterText(data.messages || [])
      return entries.length ? <Table headers={['Sender', 'Subject & message', 'Status', 'Received', 'Action']}>{entries.map((entry) => <tr key={entry._id}><td className="px-5 py-4"><p className="font-bold">{entry.name}</p><a className="text-xs text-brand-600" href={`mailto:${entry.email}`}>{entry.email}</a></td><td className="max-w-lg px-5 py-4"><p className="font-semibold">{entry.subject}</p><p className="mt-1 text-xs leading-5 text-slate-500">{entry.message}</p></td><td className="px-5 py-4"><StatusBadge status={entry.status === 'new' ? 'pending' : entry.status} /></td><td className="px-5 py-4 text-xs text-slate-500">{formatDate(entry.createdAt, 'dd MMM yyyy HH:mm')}</td><td className="px-5 py-4"><button onClick={() => resolveContact(entry)} className="btn-secondary !py-2">{entry.status === 'resolved' ? 'Reopen' : 'Resolve'}</button></td></tr>)}</Table> : <EmptyState title="No support messages" />
    }
    if (['categories', 'locations'].includes(type)) {
      const entries = filterText(data.data || [])
      return entries.length ? <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">{entries.map((entry) => <article key={entry._id} className="card p-5"><div className="flex items-start justify-between"><span className="grid size-10 place-items-center rounded-xl bg-brand-50 font-bold text-brand-600 dark:bg-brand-500/10">{entry.name[0]}</span><StatusBadge status={entry.active ? 'active' : 'closed'}>{entry.active ? 'Enabled' : 'Disabled'}</StatusBadge></div><h2 className="mt-4 font-extrabold">{entry.name}</h2><p className="mt-1 min-h-10 text-xs leading-5 text-slate-500">{entry.description || [entry.building, entry.floor, entry.landmark].filter(Boolean).join(' · ') || 'No description'}</p><div className="mt-4 flex gap-2 border-t border-slate-100 pt-4 dark:border-slate-800"><button onClick={() => { form.reset(entry); setModal({ kind: 'edit', record: entry }) }} className="btn-secondary !py-2"><Edit3 size={14} /> Edit</button><button onClick={() => deleteResource(type, entry)} className="btn-secondary !py-2 !text-rose-600"><Trash2 size={14} /></button></div></article>)}</div> : <EmptyState title={`No ${type}`} />
    }
    if (type === 'announcements') {
      return data.announcements?.length ? <div className="space-y-4">{data.announcements.map((entry) => <article key={entry._id} className="card flex gap-4 p-5"><span className="grid size-10 shrink-0 place-items-center rounded-xl bg-sky-50 text-sky-600 dark:bg-sky-500/10"><Send size={17} /></span><div><div className="flex flex-wrap items-center gap-2"><h2 className="font-extrabold">{entry.title}</h2><span className="rounded-full bg-slate-100 px-2 py-1 text-[.65rem] font-bold capitalize dark:bg-slate-800">{entry.audience}</span></div><p className="mt-2 text-sm leading-6 text-slate-500">{entry.message}</p><p className="mt-2 text-xs text-slate-400">Sent {formatDate(entry.createdAt)} by {entry.createdBy?.name}</p></div></article>)}</div> : <EmptyState title="No announcements" />
    }
    if (type === 'logs') {
      const entries = filterText(data.logs || [])
      return entries.length ? <Table headers={['Admin', 'Action', 'Target', 'IP address', 'Timestamp']}>{entries.map((entry) => <tr key={entry._id}><td className="px-5 py-4"><p className="font-bold">{entry.admin?.name}</p><p className="text-xs text-slate-400">{entry.admin?.email}</p></td><td className="px-5 py-4 font-semibold">{titleCase(entry.action)}</td><td className="px-5 py-4 text-xs text-slate-500">{entry.targetType} {entry.targetId}</td><td className="px-5 py-4 font-mono text-xs">{entry.ipAddress}</td><td className="px-5 py-4 text-xs text-slate-500">{formatDate(entry.createdAt, 'dd MMM yyyy HH:mm')}</td></tr>)}</Table> : <EmptyState title="No admin activity" />
    }
    if (type === 'settings') {
      return data.settings?.length ? <div className="grid gap-4 sm:grid-cols-2">{data.settings.map((entry) => <article key={entry._id} className="card p-5"><div className="flex items-start justify-between"><div><p className="font-mono text-xs font-bold text-brand-600">{entry.key}</p><p className="mt-2 text-lg font-extrabold">{String(entry.value)}</p></div><button onClick={() => { form.reset({ ...entry, value: String(entry.value) }); setModal({ kind: 'edit', record: entry }) }} className="btn-secondary !p-2"><Edit3 size={15} /></button></div><p className="mt-3 text-xs leading-5 text-slate-500">{entry.description}</p></article>)}</div> : <EmptyState title="No stored settings" action={<button className="btn-primary" onClick={() => setModal({ kind: 'create' })}>Add setting</button>} />
    }
    const stats = data.stats || {}
    return <div className="space-y-6"><div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{Object.entries(stats).map(([key, value]) => <div key={key} className="card p-5"><p className="text-xs font-semibold text-slate-500">{titleCase(key)}</p><p className="mt-2 text-2xl font-black">{value}</p></div>)}</div><div className="card p-8"><ShieldCheck className="text-brand-600" /><h2 className="mt-4 text-xl font-extrabold">Export privacy-safe operational data</h2><p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">The CSV contains listing status, category, location, reporter identity, and timestamps. It deliberately excludes passwords, verification answers, private marks, claim evidence, chat messages, and OTPs.</p><button onClick={exportCsv} className="btn-primary mt-6"><Download size={16} /> Download item report CSV</button></div></div>
  }

  return <><PageHeader eyebrow={user.role === 'staff' ? 'Staff operations' : 'Administration'} title={title} description={description} actions={action} />{searchable && <div className="card mb-5 flex max-w-md items-center gap-2 p-2"><Search size={17} className="ml-2 text-slate-400" /><input value={query} onChange={(event) => setQuery(event.target.value)} className="min-w-0 flex-1 bg-transparent px-2 py-2 text-sm outline-none" placeholder={`Search ${title.toLowerCase()}…`} /></div>}{render()}<Modal open={Boolean(modal)} onClose={close} title={`${modal?.record ? 'Edit' : 'Add'} ${type === 'staff' ? 'staff member' : type.slice(0, -1)}`}><form onSubmit={form.handleSubmit(saveResource)} className="space-y-4">{type === 'staff' && <><FormField label="Full name" required><input className="input" {...form.register('name', { required: true })} /></FormField><FormField label="College email" required><input type="email" className="input" {...form.register('email', { required: true })} /></FormField><FormField label="Department"><input className="input" {...form.register('department')} /></FormField><FormField label="Temporary password" required hint="Share securely and ask the staff member to change it after first login."><input type="password" className="input" {...form.register('password', { required: true, minLength: 8 })} /></FormField></>}{['categories', 'locations'].includes(type) && <><FormField label="Name" required><input className="input" {...form.register('name', { required: true })} /></FormField>{type === 'categories' ? <><FormField label="Icon name"><input className="input" {...form.register('icon')} /></FormField><FormField label="Description"><textarea className="input" rows="3" {...form.register('description')} /></FormField></> : <><FormField label="Building"><input className="input" {...form.register('building')} /></FormField><div className="grid grid-cols-2 gap-3"><FormField label="Floor"><input className="input" {...form.register('floor')} /></FormField><FormField label="Landmark"><input className="input" {...form.register('landmark')} /></FormField></div></>}<label className="flex items-center gap-2 text-sm"><input type="checkbox" {...form.register('active')} /> Enabled</label></>}{type === 'announcements' && <><FormField label="Title" required><input className="input" {...form.register('title', { required: true })} /></FormField><FormField label="Message" required><textarea className="input" rows="4" {...form.register('message', { required: true })} /></FormField><FormField label="Audience"><select className="input" {...form.register('audience')}><option value="all">Everyone</option><option value="student">Students</option><option value="staff">Staff</option></select></FormField><FormField label="Expires at"><input type="date" className="input" {...form.register('expiresAt')} /></FormField></>}{type === 'settings' && <><FormField label="Key" required><input disabled={Boolean(modal?.record)} className="input" {...form.register('key', { required: true })} /></FormField><FormField label="Value" required><input className="input" {...form.register('value', { required: true })} /></FormField><FormField label="Description"><textarea className="input" rows="3" {...form.register('description')} /></FormField><label className="flex items-center gap-2 text-sm"><input type="checkbox" {...form.register('public')} /> Safe to expose in public metadata</label></>}<button disabled={saving} className="btn-primary w-full">{saving ? <LoaderCircle className="animate-spin" size={16} /> : type === 'announcements' ? <Send size={16} /> : <Check size={16} />} Save</button></form></Modal></>
}
