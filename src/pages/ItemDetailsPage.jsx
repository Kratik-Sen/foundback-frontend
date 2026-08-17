import {
  Bookmark,
  CalendarDays,
  ChevronLeft,
  Eye,
  Flag,
  LoaderCircle,
  MapPin,
  MessageCircle,
  QrCode,
  ShieldCheck,
  Tag,
} from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { Link, useNavigate, useParams } from 'react-router-dom'
import api from '../api/client'
import Modal from '../components/Modal'
import StatusBadge from '../components/StatusBadge'
import { ErrorState, Spinner } from '../components/States'
import { useAuth } from '../context/AuthContext'
import { formatDate } from '../utils/format'
import placeholderImage from '../assets/hero.png'

export default function ItemDetailsPage() {
  const { id } = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [item, setItem] = useState(null)
  const [selectedImage, setSelectedImage] = useState('')
  const [error, setError] = useState('')
  const [qr, setQr] = useState(null)
  const [reportOpen, setReportOpen] = useState(false)
  const [report, setReport] = useState({
    reportType: 'fake_listing',
    description: '',
  })
  const [contacting, setContacting] = useState(false)
  const load = useCallback(
    () =>
      api
        .get(`/items/${id}`)
        .then(({ data }) => {
          setItem(data.item)
          setSelectedImage(data.item.images?.[0]?.url || '')
        })
        .catch((err) => setError(err.message)),
    [id],
  )
  useEffect(() => {
    load()
  }, [load])
  if (error)
    return (
      <div className="container-app py-12">
        <ErrorState message={error} onRetry={load} />
      </div>
    )
  if (!item) return <Spinner label="Opening item report" />
  const owner =
    user && String(item.reporter?._id || item.reporter) === String(user._id)
  const bookmark = async () => {
    if (!user) return navigate('/login')
    try {
      await api.post(`/items/${id}/bookmark`)
      toast.success('Item saved')
    } catch (err) {
      toast.error(err.message)
    }
  }
  const contactReporter = async () => {
    if (!user) return navigate('/login')
    setContacting(true)
    try {
      const { data } = await api.post(`/chats/items/${id}/contact`)
      toast.success(data.message)
      navigate(`/chats/${data.chatId}`)
    } catch (err) {
      toast.error(err.message)
    } finally {
      setContacting(false)
    }
  }
  const getQr = async () => {
    try {
      const { data } = await api.get(`/items/${id}/qr`)
      setQr(data.qrCode)
    } catch (err) {
      toast.error(err.message)
    }
  }
  const submitReport = async () => {
    try {
      await api.post('/complaints', {
        ...report,
        item: id,
        reportedUser: item.reporter?._id,
      })
      toast.success('Report sent to the admin team')
      setReportOpen(false)
    } catch (err) {
      toast.error(err.message)
    }
  }
  const image = selectedImage || item.images?.[0]?.url || placeholderImage

  return (
    <div className="container-app py-10">
      <button
        onClick={() => navigate(-1)}
        className="mb-5 inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-brand-600"
      >
        <ChevronLeft size={17} /> Back to results
      </button>
      <div className="mx-auto grid w-full min-w-0 max-w-6xl gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(340px,.78fr)]">
        <div className="min-w-0 overflow-hidden">
          <div className="card min-w-0 max-w-full overflow-hidden bg-slate-100 dark:bg-black">
            <img
              key={image}
              src={image}
              alt={item.title}
              className="block h-[280px] w-full max-w-full object-contain sm:h-[400px]"
            />
            {item.images?.length > 1 && (
              <div className="flex w-full max-w-full gap-2 overflow-x-auto overflow-y-hidden border-t border-slate-200 p-3 overscroll-x-contain dark:border-slate-800">
                {item.images.map((entry, index) => (
                  <button
                    key={entry.url}
                    type="button"
                    onClick={() => setSelectedImage(entry.url)}
                    aria-label={`Show ${item.title} image ${index + 1}`}
                    aria-pressed={image === entry.url}
                    className={`h-16 w-20 flex-none overflow-hidden rounded-lg ring-2 ring-offset-2 ring-offset-slate-100 transition dark:ring-offset-black ${image === entry.url ? 'ring-brand-500' : 'ring-transparent hover:ring-slate-400'}`}
                  >
                    <img
                      src={entry.url}
                      alt=""
                      className="block h-full w-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
        <aside className="card h-fit p-5 sm:p-6">
          <div className="flex items-center justify-between gap-3">
            <span
              className={`rounded-full px-3 py-1 text-xs font-extrabold uppercase tracking-wider text-white ${item.reportType === 'lost' ? 'bg-rose-600' : 'bg-emerald-600'}`}
            >
              {item.reportType} report
            </span>
            <StatusBadge status={item.status} />
          </div>
          <h1 className="mt-4 text-2xl font-black tracking-tight text-slate-950 dark:text-white">
            {item.title}
          </h1>
          <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">
            {item.description}
          </p>
          <div className="mt-5 grid grid-cols-2 gap-2.5">
            {[
              [Tag, 'Category', item.category],
              [
                CalendarDays,
                item.reportType === 'lost' ? 'Date lost' : 'Date found',
                formatDate(item.date),
              ],
              [MapPin, 'Location', item.location],
              [Eye, 'Views', item.views ?? 0],
            ].map(([Icon, label, value]) => (
              <div
                key={label}
                className="rounded-xl bg-slate-50 p-2.5 dark:bg-slate-800/60"
              >
                <p className="flex items-center gap-1.5 text-[.68rem] font-bold uppercase tracking-wider text-slate-400">
                  <Icon size={13} />
                  {label}
                </p>
                <p className="mt-1 truncate text-sm font-bold text-slate-800 dark:text-slate-100">
                  {value}
                </p>
              </div>
            ))}
          </div>
          {(item.brand || item.colour) && (
            <div className="mt-5 border-t border-slate-100 pt-5 text-sm dark:border-slate-800">
              <div className="grid grid-cols-2 gap-4">
                {item.brand && (
                  <p>
                    <span className="block text-xs text-slate-400">Brand</span>
                    <strong>{item.brand}</strong>
                  </p>
                )}
                {item.colour && (
                  <p>
                    <span className="block text-xs text-slate-400">Colour</span>
                    <strong>{item.colour}</strong>
                  </p>
                )}
              </div>
            </div>
          )}
          {item.securityOfficeSubmitted && (
            <div className="mt-5 flex gap-3 rounded-xl bg-emerald-50 p-4 text-sm text-emerald-800 dark:bg-emerald-500/10 dark:text-emerald-200">
              <ShieldCheck className="shrink-0" size={20} />
              <span>
                <strong className="block">
                  Physically available at security
                </strong>
                This item was recorded as submitted to the college Security
                Office.
              </span>
            </div>
          )}
          <div className="mt-6 grid gap-2 sm:grid-cols-2">
            {item.reportType === 'found' && !owner && (
              <Link
                to={`/items/${id}/claim`}
                className="btn-primary sm:col-span-2"
              >
                <ShieldCheck size={17} /> Start secure claim
              </Link>
            )}
            <button onClick={bookmark} className="btn-secondary">
              <Bookmark size={16} /> Save item
            </button>
            {item.reportType === 'found' && (
              <button onClick={getQr} className="btn-secondary">
                <QrCode size={16} /> View QR
              </button>
            )}
          </div>
          <div className="mt-6 flex items-center gap-3 border-t border-slate-100 pt-5 dark:border-slate-800">
            <span className="grid size-10 place-items-center rounded-xl bg-brand-100 font-black text-brand-700 dark:bg-brand-500/20 dark:text-brand-300">
              {item.reporter?.name?.[0] || '?'}
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-xs text-slate-400">Reported by</p>
              <p className="truncate text-sm font-bold">
                {item.privacy?.hideReporter
                  ? 'Campus member'
                  : item.reporter?.name || 'Campus member'}
              </p>
            </div>
            {!owner &&
              !['returned', 'closed', 'expired'].includes(item.status) && (
                <button
                  type="button"
                  onClick={contactReporter}
                  disabled={contacting}
                  className="grid size-10 place-items-center rounded-xl text-slate-400 transition hover:bg-brand-50 hover:text-brand-600 disabled:opacity-60 dark:hover:bg-brand-500/10 dark:hover:text-brand-300"
                  title={
                    item.reportType === 'lost'
                      ? 'Contact the owner'
                      : 'Contact the finder'
                  }
                  aria-label={
                    item.reportType === 'lost'
                      ? 'Contact the owner about this lost item'
                      : 'Contact the finder about this found item'
                  }
                >
                  {contacting ? (
                    <LoaderCircle size={18} className="animate-spin" />
                  ) : (
                    <MessageCircle size={18} />
                  )}
                </button>
              )}
          </div>
          {!owner && (
            <button
              onClick={() => (user ? setReportOpen(true) : navigate('/login'))}
              className="mt-5 flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-rose-600"
            >
              <Flag size={14} /> Report suspicious content
            </button>
          )}
        </aside>
      </div>
      <div className="card mt-7 p-6">
        <h2 className="font-extrabold text-slate-950 dark:text-white">
          Privacy note
        </h2>
        <p className="mt-2 text-sm leading-6 text-slate-500">
          Exact identification marks, verification answers, personal phone
          numbers, and ownership evidence are intentionally absent from this
          page. Use the secure claim workflow instead of asking the reporter to
          share them publicly.
        </p>
      </div>
      <Modal
        open={Boolean(qr)}
        onClose={() => setQr(null)}
        title="Found-item verification QR"
      >
        <div className="text-center">
          <img src={qr} alt="Item QR code" className="mx-auto size-64" />
          <p className="mt-3 text-sm text-slate-500">
            Print this code for the item tag. It opens this privacy-safe
            verification page.
          </p>
        </div>
      </Modal>
      <Modal
        open={reportOpen}
        onClose={() => setReportOpen(false)}
        title="Report this listing"
        footer={
          <>
            <button
              className="btn-secondary"
              onClick={() => setReportOpen(false)}
            >
              Cancel
            </button>
            <button className="btn-primary !bg-rose-600" onClick={submitReport}>
              Submit report
            </button>
          </>
        }
      >
        <label>
          <span className="label">Issue type</span>
          <select
            className="input"
            value={report.reportType}
            onChange={(event) =>
              setReport({ ...report, reportType: event.target.value })
            }
          >
            <option value="fake_listing">Fake listing</option>
            <option value="inappropriate_image">Inappropriate image</option>
            <option value="duplicate_listing">Duplicate listing</option>
            <option value="incorrect_information">Incorrect information</option>
            <option value="suspicious_user">Suspicious user</option>
          </select>
        </label>
        <label className="mt-4 block">
          <span className="label">Describe the concern</span>
          <textarea
            rows="4"
            className="input"
            value={report.description}
            onChange={(event) =>
              setReport({ ...report, description: event.target.value })
            }
          />
        </label>
      </Modal>
    </div>
  )
}
