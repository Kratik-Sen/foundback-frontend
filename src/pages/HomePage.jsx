import { ArrowRight, BadgeCheck, BookOpen, CheckCircle2, CircleDollarSign, KeyRound, Package, PackageSearch, Search, ShieldCheck, WalletCards } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import api from '../api/client'
import ItemCard from '../components/ItemCard'
import { SkeletonGrid } from '../components/States'

const featureCards = [
  {
    num: '01',
    title: 'Lost and Found',
    description: 'Report any item lost or found on campus instantly with verified security protocols.',
    path: '/browse/lost',
    buttonText: 'Read more',
  },
  {
    num: '02',
    title: 'Airport & Campus Hub',
    description: 'Centralized verification center backed by campus safety staff and audit logs.',
    path: '/about',
    buttonText: 'Read more',
  },
  {
    num: '03',
    title: 'Lost & found office',
    description: 'OTP-protected handovers ensure retrieved belongings safely return to rightful owners.',
    path: '/report/found',
    buttonText: 'Read more',
  },
]

const faqs = [
  ['Who can use Lost and Found?', 'Students with an approved college email can register. Staff and admin accounts are managed by campus administrators.'],
  ['Will my personal phone number be public?', 'No. Lost and Found uses secure claim-linked chat by default and hides private contact info.'],
  ['Where should a handover happen?', 'Use the college Security Office or another staff-approved campus location. Never meet off campus for a claim.'],
]

export default function HomePage() {
  const [data, setData] = useState(null)
  const [query, setQuery] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    api.get('/public/home')
      .then(({ data: result }) => setData(result))
      .catch(() => setData({ recent: [], stats: {}, testimonials: [] }))
  }, [])

  const search = (event) => {
    event.preventDefault()
    navigate(`/browse?search=${encodeURIComponent(query)}`)
  }

  return (
    <>
      {/* 1. HERO SECTION matching Image 1 */}
      <section className="hero-warm-bg relative overflow-hidden border-b border-amber-200/50 py-16 lg:py-24 dark:border-slate-800">
        <div className="container-app relative grid items-center gap-12 lg:grid-cols-[1.1fr_.9fr]">
          
          {/* Left Column: Heading, Subtitle, Lost / Found Action Buttons & Search */}
          <div className="min-w-0">
            <h1 className="max-w-2xl text-4xl font-black leading-[1.08] tracking-tight text-slate-900 sm:text-6xl dark:text-white">
              Find & Recover{' '}
              <span className="bg-gradient-to-r from-rose-700 via-amber-600 to-emerald-700 bg-clip-text text-transparent dark:from-rose-400 dark:to-emerald-400">
                With Ease
              </span>
            </h1>

            <p className="mt-5 max-w-lg text-base leading-relaxed font-semibold text-slate-600 sm:text-lg dark:text-slate-300">
              Experience effortless recovery with our dedicated lost and found service.
            </p>

            {/* Quick Search Bar matching Image 1 */}
            <form
              onSubmit={search}
              className="mt-8 flex max-w-md items-center gap-2 rounded-2xl border border-slate-200 bg-white/90 p-2 shadow-lg shadow-amber-900/5 dark:border-slate-700 dark:bg-slate-900"
            >
              <Search className="ml-3 text-slate-400" size={18} />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search lost belongings, cards, keys..."
                className="min-w-0 flex-1 bg-transparent px-2 text-sm outline-none text-slate-900 dark:text-white"
              />
              <button className="rounded-xl bg-amber-600 px-5 py-2 text-xs font-bold text-white transition hover:bg-amber-700">
                Search
              </button>
            </form>

            {/* Prominent Lost & Found Action Buttons matching Image 1 */}
            <div className="mt-8 flex flex-wrap items-center gap-5">
              {/* Lost Action Button */}
              <Link
                to="/report/lost"
                className="hero-btn-lost flex items-center justify-between gap-6 rounded-2xl px-6 py-4 text-white min-w-[170px]"
              >
                <span className="text-xl font-black tracking-wide">Lost</span>
                <div className="grid size-10 place-items-center rounded-xl bg-white/20 text-white backdrop-blur-sm">
                  <Package size={22} />
                </div>
              </Link>

              {/* Found Action Button */}
              <Link
                to="/report/found"
                className="hero-btn-found flex items-center justify-between gap-6 rounded-2xl px-6 py-4 text-white min-w-[170px]"
              >
                <span className="text-xl font-black tracking-wide">Found</span>
                <div className="grid size-10 place-items-center rounded-xl bg-white/20 text-white backdrop-blur-sm">
                  <Search size={22} />
                </div>
              </Link>
            </div>

            <p className="mt-6 flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400">
              <CheckCircle2 size={15} className="text-emerald-600" />
              Verified claim review · Private questions · OTP campus handovers
            </p>
          </div>

          {/* Right Column: Stacked Image Showcase matching Image 1 */}
          <div className="relative mx-auto flex min-h-[300px] w-full max-w-md items-center justify-center py-6 sm:min-h-[380px] lg:max-w-none">
            <div className="relative aspect-[4/3] w-full max-w-[280px] sm:max-w-[360px]">
              {/* Card 1: Laptop Search */}
              <div className="stacked-card-1 absolute left-0 top-0 w-52 overflow-hidden rounded-2xl border-4 border-white shadow-2xl dark:border-slate-800 sm:w-64">
                <img src="/images/hero1.png" alt="Digital search for lost items" className="h-36 w-full object-cover sm:h-44" />
              </div>

              {/* Card 2: Notice on tree with compass */}
              <div className="stacked-card-2 absolute left-10 top-10 w-52 overflow-hidden rounded-2xl border-4 border-white shadow-2xl dark:border-slate-800 sm:left-16 sm:top-12 sm:w-64">
                <img src="/images/hero2.png" alt="Lost sign on tree" className="h-36 w-full object-cover sm:h-44" />
              </div>

              {/* Card 3: Found items box */}
              <div className="stacked-card-3 absolute left-24 top-20 hidden w-64 overflow-hidden rounded-2xl border-4 border-white shadow-2xl dark:border-slate-800 sm:block sm:left-28 sm:top-24">
                <img src="/images/hero3.png" alt="Found items box" className="h-44 w-full object-cover" />
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* 2. STATS BAR */}
      <section className="border-b border-slate-200 bg-slate-900 py-8 text-white dark:border-slate-800">
        <div className="container-app grid grid-cols-2 gap-6 text-center md:grid-cols-4">
          {[
            ['Active lost reports', data?.stats?.lost ?? '124'],
            ['Items waiting to return', data?.stats?.found ?? '89'],
            ['Successful recoveries', data?.stats?.returned ?? '412'],
            ['Community reporters', data?.stats?.community ?? '1.2k+'],
          ].map(([label, value]) => (
            <div key={label}>
              <p className="text-3xl font-black text-amber-400">{value}</p>
              <p className="mt-1 text-xs font-semibold text-slate-300">{label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 3. ILLUSTRATIVE 4-FEATURE CARDS matching Image 2 */}
      <section className="bg-amber-50/40 py-20 dark:bg-slate-950">
        <div className="container-app">
          <div className="mb-12 text-center">
            <p className="section-kicker">Core features</p>
            <h2 className="mt-2 text-3xl font-black tracking-tight text-slate-950 dark:text-white sm:text-4xl">
              Everything you need to recover lost items
            </h2>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {featureCards.map((card) => (
              <div
                key={card.num}
                className="card relative flex flex-col justify-between overflow-hidden p-6 transition duration-300 hover:-translate-y-1 hover:shadow-xl"
              >
                {/* Yellow Lateral Step Tag matching Image 2 */}
                <div className="yellow-step-badge absolute right-0 top-6 px-3 py-1.5 text-xs font-black rounded-l-md shadow-xs">
                  {card.num}
                </div>

                <div>
                  <h3 className="pr-12 text-xl font-black text-slate-950 dark:text-white">
                    {card.title}
                  </h3>
                  <p className="mt-4 text-xs leading-relaxed font-semibold text-slate-500 dark:text-slate-400">
                    {card.description}
                  </p>
                </div>

                <div className="mt-8">
                  <Link
                    to={card.path}
                    className="inline-flex items-center rounded-full border border-slate-300 bg-white px-4 py-1.5 text-xs font-bold text-slate-800 transition hover:bg-slate-100 hover:border-slate-400 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
                  >
                    {card.buttonText}
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. RECENTLY REPORTED FEED */}
      <section className="container-app py-20">
        <div className="flex items-end justify-between gap-5">
          <div>
            <p className="section-kicker">Recently reported</p>
            <h2 className="mt-2 text-3xl font-black tracking-tight text-slate-950 dark:text-white">
              The latest from campus
            </h2>
            <p className="mt-2 text-sm text-slate-500">
              Sensitive details stay hidden until a verified claim review.
            </p>
          </div>
          <Link to="/browse" className="btn-secondary hidden sm:inline-flex rounded-full">
            Browse all <ArrowRight size={15} />
          </Link>
        </div>

        <div className="mt-8">
          {data ? (
            data.recent?.length ? (
              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
                {data.recent.slice(0, 8).map((item) => (
                  <ItemCard key={item._id} item={item} />
                ))}
              </div>
            ) : (
              <div className="card p-10 text-center text-sm text-slate-500">
                No approved reports yet. Seed the demo database or create the first report.
              </div>
            )
          ) : (
            <SkeletonGrid count={4} />
          )}
        </div>
      </section>

      {/* 5. HIGH-IMPACT WAREHOUSE BANNER matching Image 3 */}
      <section className="container-app pb-20">
        <div className="relative overflow-hidden rounded-3xl bg-slate-900 text-white shadow-2xl">
          <div className="absolute inset-0 opacity-25 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-amber-400 via-slate-900 to-black" />
          
          <div className="relative grid items-center gap-8 p-8 sm:p-14 lg:grid-cols-2">
            <div>
              <span className="text-xs font-black tracking-widest text-amber-400 uppercase">
                Direct Reclaim Portal
              </span>
              <h2 className="mt-3 text-4xl font-black tracking-tight sm:text-5xl">
                Lost <span className="text-amber-400">&</span> Found
              </h2>
              <p className="mt-4 max-w-md text-sm leading-relaxed text-slate-300">
                Found an unclaimed item on campus or lost something important? Our automated matching system ensures fast and safe returns.
              </p>
              <div className="mt-8 flex flex-wrap gap-4">
                <Link
                  to="/report/lost"
                  className="rounded-xl bg-amber-500 px-6 py-3 text-xs font-black uppercase tracking-wider text-slate-950 transition hover:bg-amber-400"
                >
                  Report Item
                </Link>
                <Link
                  to="/browse"
                  className="rounded-xl border border-white/30 px-6 py-3 text-xs font-black uppercase tracking-wider text-white transition hover:bg-white/10"
                >
                  Browse Directory
                </Link>
              </div>
            </div>

            <div className="hidden justify-center lg:flex">
              <div className="grid size-44 place-items-center rounded-3xl bg-gradient-to-tr from-amber-500 to-amber-300 text-slate-950 shadow-2xl float-soft">
                <Package size={72} strokeWidth={1.8} />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. POPULAR CATEGORIES & PROOF BEFORE PICKUP */}
      <section className="container-app pb-20">
        <div className="grid gap-10 lg:grid-cols-2">
          <div>
            <p className="section-kicker">Popular categories</p>
            <h2 className="mt-2 text-3xl font-black tracking-tight text-slate-950 dark:text-white">
              Whatever went missing, start here.
            </h2>
            <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3">
              {[
                [BadgeCheck, 'ID Cards'],
                [WalletCards, 'Wallets'],
                [KeyRound, 'Keys'],
                [BookOpen, 'Books'],
                [CircleDollarSign, 'Calculators'],
                [PackageSearch, 'Other items'],
              ].map(([Icon, label]) => (
                <Link
                  key={label}
                  to={`/browse?category=${encodeURIComponent(label.replace(/s$/, ''))}`}
                  className="card flex items-center gap-3 p-4 text-sm font-bold transition hover:border-amber-400 hover:text-amber-600"
                >
                  <span className="grid size-9 place-items-center rounded-lg bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300">
                    <Icon size={18} />
                  </span>
                  {label}
                </Link>
              ))}
            </div>
          </div>

          <div className="rounded-3xl bg-gradient-to-br from-slate-900 to-amber-950 p-8 text-white sm:p-10 shadow-xl">
            <ShieldCheck size={36} className="text-amber-400" />
            <h2 className="mt-5 text-2xl font-black">Proof before pickup.</h2>
            <p className="mt-3 leading-relaxed text-slate-300 text-sm">
              Lost and Found never treats “that’s mine” as enough. Private questions, proof uploads, staff review, and an OTP-backed handover protect both the finder and the owner.
            </p>
            <ul className="mt-6 space-y-3 text-xs font-semibold text-slate-300">
              {[
                'Unique marks remain private',
                'Only one claim can be approved per item',
                'Chat opens only after claim review',
                'Every handover is auditable',
              ].map((text) => (
                <li key={text} className="flex items-center gap-2">
                  <CheckCircle2 size={16} className="text-amber-400" />
                  {text}
                </li>
              ))}
            </ul>
            <Link
              to="/privacy"
              className="mt-7 inline-flex items-center gap-2 text-xs font-bold text-amber-300 hover:text-amber-200"
            >
              Read safety protocol <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </section>

      {/* 7. FAQs */}
      <section className="container-app pb-24">
        <div className="mx-auto max-w-3xl text-center">
          <p className="section-kicker">Questions answered</p>
          <h2 className="mt-2 text-3xl font-black text-slate-950 dark:text-white">
            Frequently asked questions
          </h2>
        </div>
        <div className="mx-auto mt-9 max-w-3xl divide-y divide-slate-200 rounded-2xl border border-slate-200 bg-white px-6 dark:divide-slate-800 dark:border-slate-800 dark:bg-slate-900">
          {faqs.map(([question, answer]) => (
            <details key={question} className="group py-5">
              <summary className="cursor-pointer list-none font-bold text-slate-900 dark:text-white">
                {question}
                <span className="float-right font-black text-amber-600 group-open:rotate-45">+</span>
              </summary>
              <p className="mt-3 pr-6 text-xs leading-relaxed text-slate-500">{answer}</p>
            </details>
          ))}
        </div>
      </section>
    </>
  )
}
