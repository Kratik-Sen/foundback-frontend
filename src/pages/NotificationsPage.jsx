import { Bell, CheckCheck, Trash2 } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import api from '../api/client'
import { connectRealtime } from '../api/realtime'
import PageHeader from '../components/PageHeader'
import { EmptyState, ErrorState, Spinner } from '../components/States'
import { timeAgo } from '../utils/format'

export default function NotificationsPage() {
  const [data, setData] = useState(null); const [error, setError] = useState('')
  const load = useCallback(async () => {
    setError('')
    try {
      const { data: value } = await api.get('/notifications?limit=50')
      setData({ ...value, notifications: Array.isArray(value.notifications) ? value.notifications : [], unread: Number(value.unread) || 0 })
    } catch (err) {
      setError(err.message || 'Unable to load notifications')
    }
  }, [])
  useEffect(() => { load() }, [load])
  useEffect(() => {
    const socket = connectRealtime({ withCredentials: true })
    if (!socket) {
      const polling = window.setInterval(load, 15000)
      return () => window.clearInterval(polling)
    }
    socket.on('notification:new', (notification) => setData((current) => {
      if (!current || current.notifications.some((item) => item._id === notification._id)) return current
      return { ...current, notifications: [notification, ...current.notifications].slice(0, 50), unread: current.unread + 1 }
    }))
    return () => socket.disconnect()
  }, [load])
  if (error) return <ErrorState message={error} onRetry={load} />
  if (!data) return <Spinner />
  const readAll = async () => { try { await api.patch('/notifications/read-all'); await load() } catch (err) { toast.error(err.message) } }
  const readOne = async (id) => { try { await api.patch(`/notifications/${id}/read`); await load() } catch (err) { toast.error(err.message) } }
  const remove = async (id) => { try { await api.delete(`/notifications/${id}`); toast.success('Notification deleted'); await load() } catch (err) { toast.error(err.message) } }
  return <><PageHeader eyebrow="Activity centre" title="Notifications" description={`${data.unread} unread update${data.unread === 1 ? '' : 's'} across reports, complaints, matches, claims, chats, and handovers.`} actions={<button onClick={readAll} className="btn-secondary"><CheckCheck size={16} /> Mark all read</button>} />{data.notifications.length ? <div className="card divide-y divide-slate-100 overflow-hidden dark:divide-slate-800">{data.notifications.map((item) => <article key={item._id} onClick={() => !item.read && readOne(item._id)} className={`flex cursor-pointer gap-4 p-5 hover:bg-slate-50 dark:hover:bg-slate-800/50 ${item.read ? '' : 'bg-brand-50/50 dark:bg-brand-500/5'}`}><span className={`grid size-10 shrink-0 place-items-center rounded-xl ${item.read ? 'bg-slate-100 text-slate-400 dark:bg-slate-800' : 'bg-brand-100 text-brand-600 dark:bg-brand-500/20'}`}><Bell size={18} /></span><div className="min-w-0 flex-1"><div className="flex items-start justify-between gap-3"><h2 className="text-sm font-bold text-slate-900 dark:text-white">{item.title}</h2><span className="shrink-0 text-[.65rem] text-slate-400">{timeAgo(item.createdAt)}</span></div><p className="mt-1 text-sm leading-6 text-slate-500">{item.message}</p></div><button onClick={(event) => { event.stopPropagation(); remove(item._id) }} className="self-center p-2 text-slate-300 hover:text-rose-500"><Trash2 size={16} /></button></article>)}</div> : <EmptyState title="You’re all caught up" message="New complaint responses, matches, claims, chats, and handover updates will arrive here in real time." />}</>
}
