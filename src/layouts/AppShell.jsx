import { ChevronLeft } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import { NavLink } from 'react-router-dom'
import { io } from 'socket.io-client'
import api from '../api/client'
import AnimatedOutlet from '../components/AnimatedOutlet'
import Header from '../components/Header'
import { getWorkspaceNavigation } from '../config/navigation'
import { useAuth } from '../context/AuthContext'

export default function AppShell() {
  const { user } = useAuth()
  const [collapsed, setCollapsed] = useState(false)
  const [chatUnread, setChatUnread] = useState(0)
  const navigation = getWorkspaceNavigation(user.role)

  const loadChatUnread = useCallback(async () => {
    try {
      const { data } = await api.get('/chats/unread-count')
      setChatUnread(Number(data.unread) || 0)
    } catch {
      setChatUnread(0)
    }
  }, [])

  useEffect(() => {
    if (!navigation.some(([, path]) => path === '/chats')) return undefined
    loadChatUnread()
    const socket = io(import.meta.env.VITE_SOCKET_URL || window.location.origin, { withCredentials: true })
    socket.on('chat:unread-changed', loadChatUnread)
    return () => socket.disconnect()
  }, [loadChatUnread, navigation])

  const unreadBadge = (compact = false) => chatUnread > 0 && <span className={`${compact ? 'absolute right-1 top-1' : 'ml-auto'} grid min-w-5 place-items-center rounded-full bg-rose-600 px-1.5 text-[.6rem] font-bold leading-5 text-white`}>{chatUnread > 99 ? '99+' : chatUnread}</span>

  return <div className="min-h-screen">
    <Header />
    <div className="flex">
      <aside className={`sticky top-[72px] hidden h-[calc(100vh-72px)] shrink-0 flex-col overflow-hidden border-r border-slate-200 bg-white p-3 transition-all lg:flex dark:border-slate-800 dark:bg-slate-950 ${collapsed ? 'w-[76px]' : 'w-64'}`}>
        <div className="mb-3 flex shrink-0 items-center justify-between px-2 py-2">
          {!collapsed && <span className="text-[.65rem] font-extrabold uppercase tracking-[.16em] text-slate-400">{user.role} workspace</span>}
          <button onClick={() => setCollapsed((value) => !value)} className="grid size-8 place-items-center rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"><ChevronLeft size={17} className={collapsed ? 'rotate-180' : ''} /></button>
        </div>
        <nav className="workspace-nav min-h-0 flex-1 space-y-1 overflow-y-auto overscroll-contain pb-8 pr-1">
          {navigation.map(([label, path, Icon]) => <NavLink key={path} to={path} end={path === '/dashboard' || path === '/admin' || path === '/staff'} title={collapsed ? label : undefined} className={({ isActive }) => `relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold ${isActive ? 'bg-brand-50 text-brand-700 dark:bg-brand-500/10 dark:text-brand-300' : 'text-slate-600 hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-slate-900'} ${collapsed ? 'justify-center' : ''}`}>
            <Icon size={18} />
            {!collapsed && <span>{label}</span>}
            {path === '/chats' && unreadBadge(collapsed)}
          </NavLink>)}
        </nav>
      </aside>
      <main className="min-w-0 flex-1"><div className="mx-auto max-w-[1360px] p-4 pb-24 pt-5 sm:p-6 sm:pb-24 sm:pt-7 lg:p-7"><AnimatedOutlet /></div></main>
    </div>
    <nav className="fixed inset-x-0 bottom-0 z-30 flex justify-around border-t border-slate-200 bg-white/95 px-2 py-2 backdrop-blur lg:hidden dark:border-slate-800 dark:bg-slate-950/95">
      {navigation.slice(0, 5).map(([label, path, Icon]) => <NavLink key={path} to={path} className={({ isActive }) => `relative flex min-w-14 flex-col items-center gap-1 rounded-lg px-2 py-1 text-[.62rem] font-semibold ${isActive ? 'text-brand-600' : 'text-slate-500'}`}><Icon size={18} /><span className="max-w-16 truncate">{label}</span>{path === '/chats' && unreadBadge(true)}</NavLink>)}
    </nav>
  </div>
}
