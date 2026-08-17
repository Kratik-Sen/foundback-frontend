import { Bell, CheckCheck } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../api/client'
import { connectRealtime } from '../api/realtime'
import { gsap, useGSAP } from '../lib/gsap'
import { timeAgo } from '../utils/format'

export default function NotificationMenu() {
  const [open, setOpen] = useState(false)
  const [items, setItems] = useState([])
  const [unread, setUnread] = useState(0)
  const menu = useRef(null)

  useGSAP(() => {
    if (!open || !menu.current) return undefined

    const media = gsap.matchMedia()
    media.add('(prefers-reduced-motion: no-preference)', () => {
      gsap.fromTo(menu.current,
        { autoAlpha: 0, y: -6, scale: 0.96, transformOrigin: 'top right' },
        { autoAlpha: 1, y: 0, scale: 1, duration: 0.2, ease: 'power3.out', clearProps: 'opacity,visibility,transform' },
      )
    })

    return () => media.revert()
  }, { dependencies: [open], revertOnUpdate: true })

  const load = async () => {
    try { const { data } = await api.get('/notifications?limit=6'); setItems(data.notifications); setUnread(data.unread) } catch { /* session may be ending */ }
  }
  useEffect(() => {
    load()
    const socket = connectRealtime({ withCredentials: true })
    if (!socket) {
      const polling = window.setInterval(load, 15000)
      return () => window.clearInterval(polling)
    }
    socket.on('notification:new', (notification) => { setItems((current) => [notification, ...current].slice(0, 6)); setUnread((count) => count + 1) })
    return () => socket.disconnect()
  }, [])

  const readAll = async () => { await api.patch('/notifications/read-all'); setUnread(0); setItems((current) => current.map((item) => ({ ...item, read: true }))) }

  return <div className="relative"><button onClick={() => setOpen((value) => !value)} className="relative grid size-9 place-items-center rounded-xl text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800" aria-label="Notifications"><Bell size={19} />{unread > 0 && <span className="absolute right-0.5 top-0.5 grid min-w-4 place-items-center rounded-full bg-rose-600 px-1 text-[.58rem] font-bold leading-4 text-white">{unread > 9 ? '9+' : unread}</span>}</button>{open && <div ref={menu} className="card absolute right-0 top-12 z-50 w-[min(360px,calc(100vw-2rem))] overflow-hidden"><div className="flex items-center justify-between border-b border-slate-100 px-4 py-3 dark:border-slate-800"><p className="text-sm font-bold text-slate-900 dark:text-white">Notifications</p><button onClick={readAll} className="flex items-center gap-1 text-xs font-semibold text-brand-600"><CheckCheck size={14} /> Read all</button></div><div className="max-h-80 overflow-y-auto">{items.length ? items.map((item) => <Link key={item._id} to="/notifications" onClick={() => setOpen(false)} className={`block border-b border-slate-100 px-4 py-3 hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-800/60 ${item.read ? '' : 'bg-brand-50/60 dark:bg-brand-500/5'}`}><p className="text-sm font-semibold text-slate-800 dark:text-slate-100">{item.title}</p><p className="mt-0.5 line-clamp-2 text-xs text-slate-500">{item.message}</p><p className="mt-1 text-[.65rem] text-slate-400">{timeAgo(item.createdAt)}</p></Link>) : <p className="p-8 text-center text-sm text-slate-500">You’re all caught up.</p>}</div><Link to="/notifications" onClick={() => setOpen(false)} className="block px-4 py-3 text-center text-xs font-bold text-brand-600">View all notifications</Link></div>}</div>
}
