import { ChevronDown, LogOut, Menu, Moon, Search, Sun, UserRound, X } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom'
import { getWorkspaceHome, getWorkspaceNavigation } from '../config/navigation'
import { useAuth } from '../context/AuthContext'
import { gsap, useGSAP } from '../lib/gsap'
import Brand from './Brand'
import NotificationMenu from './NotificationMenu'

const navLinks = [
  ['Home', '/'],
  ['Lost', '/browse/lost'],
  ['Report Lost', '/report/lost'],
  ['Found', '/browse/found'],
  ['Report Found', '/report/found'],
  ['Profile', '/profile'],
]

export default function Header() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [mobile, setMobile] = useState(false)
  const [profile, setProfile] = useState(false)
  const [dark, setDark] = useState(() => localStorage.getItem('campusfind-theme') === 'dark')
  const profileMenu = useRef(null)
  const mobileMenu = useRef(null)
  const themeToggle = useRef(null)
  const themeTransition = useRef(null)
  const workspaceNavigation = user ? getWorkspaceNavigation(user.role) : []

  useGSAP(() => {
    const media = gsap.matchMedia()
    media.add('(prefers-reduced-motion: no-preference)', () => {
      if (profile && profileMenu.current) {
        gsap.fromTo(profileMenu.current,
          { autoAlpha: 0, y: -6, scale: 0.96, transformOrigin: 'top right' },
          { autoAlpha: 1, y: 0, scale: 1, duration: 0.2, ease: 'power3.out', clearProps: 'opacity,visibility,transform' },
        )
      }

      if (mobile && mobileMenu.current) {
        gsap.fromTo(mobileMenu.current,
          { autoAlpha: 0, y: -10 },
          { autoAlpha: 1, y: 0, duration: 0.24, ease: 'power3.out', clearProps: 'opacity,visibility,transform' },
        )
      }
    })

    return () => media.revert()
  }, { dependencies: [profile, mobile], revertOnUpdate: true })

  useGSAP(() => {
    const icon = themeToggle.current?.querySelector('svg')
    if (!icon) return undefined

    const media = gsap.matchMedia()
    media.add('(prefers-reduced-motion: no-preference)', () => {
      gsap.fromTo(icon,
        { autoAlpha: 0, rotate: -75, scale: 0.55 },
        { autoAlpha: 1, rotate: 0, scale: 1, duration: 0.42, ease: 'back.out(1.8)', clearProps: 'opacity,visibility,transform' },
      )
    })

    return () => media.revert()
  }, { dependencies: [dark], revertOnUpdate: true })

  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark)
    localStorage.setItem('campusfind-theme', dark ? 'dark' : 'light')
  }, [dark])

  useEffect(() => () => {
    themeTransition.current?.kill()
    document.documentElement.classList.remove('theme-transitioning')
  }, [])

  useEffect(() => {
    setMobile(false)
    setProfile(false)
  }, [location.pathname])

  useEffect(() => {
    if (!mobile) return undefined
    const previousOverflow = document.body.style.overflow
    const closeOnEscape = (event) => { if (event.key === 'Escape') setMobile(false) }
    document.body.style.overflow = 'hidden'
    document.addEventListener('keydown', closeOnEscape)
    return () => {
      document.body.style.overflow = previousOverflow
      document.removeEventListener('keydown', closeOnEscape)
    }
  }, [mobile])

  const toggleTheme = () => {
    const root = document.documentElement
    themeTransition.current?.kill()
    root.classList.add('theme-transitioning')
    void root.offsetWidth
    setDark((value) => !value)
    themeTransition.current = gsap.delayedCall(0.55, () => root.classList.remove('theme-transitioning'))
  }

  const signOut = async () => {
    await logout()
    navigate('/')
    setProfile(false)
    setMobile(false)
  }

  return (
    <>
    <header className="sticky top-0 z-40 border-b border-slate-200/70 bg-slate-50/80 backdrop-blur-md dark:border-slate-800 dark:bg-slate-950/85">
      <div className="container-app flex h-[72px] items-center justify-between gap-1 sm:gap-3">
        <Brand />

        {/* Centralized rounded pill navigation matching Image 1 */}
        <nav className="hidden items-center gap-1 rounded-full bg-slate-200/50 p-1.5 dark:bg-slate-900/60 xl:flex">
          {navLinks.map(([label, path]) => {
            // Require auth for profile or report links if not logged in
            if ((path === '/profile' || path.startsWith('/report')) && !user) {
              return (
                <Link
                  key={path}
                  to="/login"
                  className="rounded-full px-3.5 py-1.5 text-xs font-semibold text-slate-600 transition-colors hover:text-slate-950 dark:text-slate-300 dark:hover:text-white"
                >
                  {label}
                </Link>
              )
            }
            return (
              <NavLink
                key={path}
                to={path}
                end={path === '/'}
                className={({ isActive }) =>
                  `rounded-full px-3.5 py-1.5 text-xs font-bold transition-all ${
                    isActive
                      ? 'bg-white text-slate-950 shadow-sm dark:bg-slate-800 dark:text-white'
                      : 'text-slate-600 hover:text-slate-950 dark:text-slate-300 dark:hover:text-white'
                  }`
                }
              >
                {label}
              </NavLink>
            )
          })}
        </nav>

        {/* Right action tools: Search, Theme Toggle, Sign Out / Sign In Pill */}
        <div className="ml-auto flex shrink-0 items-center gap-1 sm:gap-2">
          <button
            onClick={() => navigate('/browse')}
            className="grid size-9 place-items-center rounded-full text-slate-500 hover:bg-slate-200/60 dark:hover:bg-slate-800"
            aria-label="Search"
          >
            <Search size={17} />
          </button>
          <button
            ref={themeToggle}
            onClick={toggleTheme}
            className="hidden size-9 place-items-center rounded-full text-slate-500 hover:bg-slate-200/60 sm:grid dark:hover:bg-slate-800"
            aria-label={dark ? 'Switch to light theme' : 'Switch to dark theme'}
          >
            {dark ? <Sun size={17} /> : <Moon size={17} />}
          </button>

          {user ? (
            <>
              <NotificationMenu />
              <div className="relative hidden md:block">
                <button
                  onClick={() => setProfile((value) => !value)}
                  className="flex items-center gap-2 rounded-full border border-slate-300/80 bg-white/90 px-3 py-1.5 text-xs font-bold text-slate-700 shadow-sm transition hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
                >
                  <span className="grid size-6 place-items-center rounded-full bg-amber-100 font-black text-amber-800 dark:bg-amber-900/40 dark:text-amber-300">
                    {user.name?.[0]}
                  </span>
                  <span className="hidden max-w-24 truncate lg:block">{user.name}</span>
                  <ChevronDown size={14} className="text-slate-400" />
                </button>

                {profile && (
                  <div ref={profileMenu} className="card absolute right-0 top-12 z-50 w-48 p-2">
                    <Link
                      to="/dashboard"
                      onClick={() => setProfile(false)}
                      className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 dark:text-slate-200 dark:hover:bg-slate-800"
                    >
                      <UserRound size={16} /> Dashboard
                    </Link>
                    <button
                      onClick={signOut}
                      className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-500/10"
                    >
                      <LogOut size={16} /> Sign out
                    </button>
                  </div>
                )}
              </div>

              {/* Sign Out Pill Button matching Image 1 */}
              <button
                onClick={signOut}
                className="hidden rounded-full border border-slate-300 bg-slate-200/70 px-4 py-1.5 text-xs font-bold text-slate-800 transition hover:bg-slate-300 xl:inline-flex dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
              >
                Sign Out
              </button>
            </>
          ) : (
            <div className="hidden items-center gap-2 md:flex">
              <Link
                to="/login"
                className="rounded-full border border-slate-300 bg-slate-200/80 px-4 py-1.5 text-xs font-bold text-slate-800 transition hover:bg-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                className="rounded-full bg-amber-600 px-4 py-1.5 text-xs font-bold text-white shadow-sm transition hover:bg-amber-700"
              >
                Create Account
              </Link>
            </div>
          )}

          <button
            onClick={() => setMobile((value) => !value)}
            className="grid size-9 place-items-center rounded-full text-slate-600 hover:bg-slate-200/60 xl:hidden dark:text-slate-300 dark:hover:bg-slate-800"
            aria-label={mobile ? 'Close menu' : 'Open menu'}
            aria-expanded={mobile}
          >
            {mobile ? <X /> : <Menu />}
          </button>
        </div>
      </div>

    </header>

      {mobile && <div className="fixed inset-x-0 bottom-0 top-[72px] z-50 bg-black/45 xl:hidden" onClick={() => setMobile(false)}>
        <div ref={mobileMenu} onClick={(event) => event.stopPropagation()} className="ml-auto flex h-full w-[min(22rem,calc(100vw-1rem))] flex-col overflow-hidden border-l border-slate-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-black">
          {user && <Link to={getWorkspaceHome(user.role)} className="flex items-center gap-3 border-b border-slate-200 p-4 dark:border-slate-800">
            <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-amber-100 text-sm font-black uppercase text-amber-800 dark:bg-amber-900/40 dark:text-amber-300">{user.name?.[0]}</span>
            <span className="min-w-0"><strong className="block truncate text-sm text-slate-900 dark:text-white">{user.name}</strong><span className="text-xs capitalize text-slate-500">{user.role} workspace</span></span>
          </Link>}

          <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain p-3">
            <p className="px-3 pb-2 text-[.65rem] font-extrabold uppercase tracking-[.16em] text-slate-400">Browse</p>
            <nav className="space-y-1">
              {navLinks.filter(([, path]) => !user || ['/', '/browse/lost', '/browse/found'].includes(path)).map(([label, path]) => {
                const destination = !user && (path === '/profile' || path.startsWith('/report')) ? '/login' : path
                return <NavLink key={path} to={destination} end={path === '/'} className={({ isActive }) => `flex items-center rounded-xl px-3 py-2.5 text-sm font-bold ${isActive ? 'bg-brand-50 text-brand-700 dark:bg-brand-500/10 dark:text-brand-300' : 'text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-900'}`}>{label}</NavLink>
              })}
            </nav>

            {user && <>
              <p className="mt-5 px-3 pb-2 text-[.65rem] font-extrabold uppercase tracking-[.16em] text-slate-400">{user.role} pages</p>
              <nav className="space-y-1">
                {workspaceNavigation.map(([label, path, Icon]) => <NavLink key={path} to={path} end={path === getWorkspaceHome(user.role)} className={({ isActive }) => `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold ${isActive ? 'bg-brand-50 text-brand-700 dark:bg-brand-500/10 dark:text-brand-300' : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-900'}`}><Icon size={18} className="shrink-0" /><span>{label}</span></NavLink>)}
              </nav>
            </>}
          </div>

          <div className="shrink-0 border-t border-slate-200 p-3 dark:border-slate-800">
            <div className="grid grid-cols-2 gap-2">
              <button ref={themeToggle} onClick={toggleTheme} className="btn-secondary !justify-start"><span className="grid size-5 place-items-center">{dark ? <Sun size={17} /> : <Moon size={17} />}</span>{dark ? 'Light theme' : 'Dark theme'}</button>
              <button onClick={() => { navigate('/browse'); setMobile(false) }} className="btn-secondary !justify-start"><Search size={17} /> Search</button>
            </div>
            {user ? <button onClick={signOut} className="mt-2 flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-bold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30"><LogOut size={17} /> Sign out</button> : <Link to="/login" className="btn-primary mt-2 w-full">Sign in / Register</Link>}
          </div>
        </div>
      </div>}
    </>
  )
}
