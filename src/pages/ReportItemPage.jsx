import { AlertTriangle, EyeOff, LoaderCircle, Plus, ShieldCheck, Trash2 } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useFieldArray, useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { useNavigate, useParams } from 'react-router-dom'
import api from '../api/client'
import { FormField } from '../components/FormField'
import ImagePicker from '../components/ImagePicker'
import Modal from '../components/Modal'
import PageHeader from '../components/PageHeader'
import { Spinner } from '../components/States'

function Section({ title, description, children }) {
  return <section className="card p-5 sm:p-7"><div className="mb-6 border-b border-slate-100 pb-4 dark:border-slate-800"><h2 className="font-extrabold text-slate-950 dark:text-white">{title}</h2>{description && <p className="mt-1 text-xs leading-5 text-slate-500">{description}</p>}</div>{children}</section>
}

export default function ReportItemPage({ reportType: routeType }) {
  const { id } = useParams()
  const navigate = useNavigate()
  const [meta, setMeta] = useState({ categories: [], locations: [] })
  const [initializing, setInitializing] = useState(Boolean(id))
  const [duplicates, setDuplicates] = useState(null)
  const [pendingValues, setPendingValues] = useState(null)
  const [existingImages, setExistingImages] = useState([])
  const [loadedReportType, setLoadedReportType] = useState(routeType)
  const { register, control, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm({
    defaultValues: { reportType: routeType, verificationQuestions: routeType === 'found' ? [{ question: '', answer: '' }] : [], contactPreference: 'chat' },
  })
  const questions = useFieldArray({ control, name: 'verificationQuestions' })

  useEffect(() => { api.get('/public/metadata').then(({ data }) => setMeta(data)).catch(() => {}) }, [])
  useEffect(() => {
    if (!id) return
    api.get(`/items/${id}`).then(({ data }) => {
      const item = data.item
      const { images = [], ...details } = item
      setExistingImages(images)
      setLoadedReportType(item.reportType)
      reset({ ...details, date: item.date?.slice(0, 10), verificationQuestions: item.verificationQuestions || [] })
    }).catch((error) => { toast.error(error.message); navigate('/my-listings') }).finally(() => setInitializing(false))
  }, [id, navigate, reset])

  const send = async (values, acknowledge = false) => {
    const form = new FormData()
    Object.entries(values).forEach(([key, value]) => {
      if (key === 'images') return
      if (key === 'verificationQuestions' || key === 'privacy') form.append(key, JSON.stringify(value))
      else if (value !== undefined && value !== null) form.append(key, value)
    })
    form.set('reportType', routeType || values.reportType)
    form.set('duplicateAcknowledged', acknowledge ? 'true' : 'false')
    if (id) form.set('retainedImageIds', JSON.stringify(existingImages.map((image) => String(image.publicId || image.url))))
    Array.from(values.images || []).forEach((file) => form.append('images', file))
    try {
      const { data } = id ? await api.patch(`/items/${id}`, form) : await api.post('/items', form)
      toast.success(data.message)
      navigate('/my-listings')
    } catch (error) {
      if (error.code === 'POSSIBLE_DUPLICATES') { setDuplicates(error.duplicates); setPendingValues(values); return }
      toast.error(error.message)
    }
  }

  if (initializing) return <Spinner label="Loading your report" />
  const type = routeType || loadedReportType || 'lost'
  return <div className="mx-auto max-w-5xl"><PageHeader eyebrow={id ? 'Edit report' : 'New report'} title={id ? 'Update item details' : `Report a ${type} item`} description={type === 'lost' ? 'Share enough for useful matching. Keep serial numbers and unique marks in the private section.' : 'Describe what others can safely see, then add private questions only the real owner should answer.'} /><form onSubmit={handleSubmit((values) => send(values))} className="space-y-6"><Section title="Item overview" description="These details appear in matching and public listings."><div className="grid gap-5 sm:grid-cols-2"><FormField label="Item title" required error={errors.title}><input className="input" placeholder="e.g. Black leather wallet" {...register('title', { required: 'Title is required', minLength: { value: 3, message: 'Use at least 3 characters' } })} /></FormField><FormField label="Category" required error={errors.category}><select className="input" {...register('category', { required: 'Choose a category' })}><option value="">Select category</option>{meta.categories.map((entry) => <option key={entry._id} value={entry.name}>{entry.name}</option>)}</select></FormField><FormField label="Brand (optional)"><input className="input" placeholder="Apple, Casio, Wildcraft…" {...register('brand')} /></FormField><FormField label="Colour (optional)"><input className="input" placeholder="Navy blue" {...register('colour')} /></FormField><FormField label="Description" required error={errors.description} className="sm:col-span-2"><textarea rows="5" className="input resize-y" placeholder="Describe the item without revealing the private identifying mark…" {...register('description', { required: 'Description is required', minLength: { value: 10, message: 'Use at least 10 characters' } })} /></FormField><FormField label="Other public details (optional)" className="sm:col-span-2"><textarea rows="3" className="input resize-y" placeholder="e.g. Size, material, accessories, or other safe details" {...register('publicDetails')} /></FormField></div></Section><Section title={type === 'lost' ? 'When and where it was lost' : 'When and where it was found'} description="Use a structured campus location; exact GPS is not required."><div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3"><FormField label="Date" required error={errors.date}><input type="date" max={new Date().toISOString().slice(0, 10)} className="input" {...register('date', { required: 'Date is required' })} /></FormField><FormField label="Approximate time (optional)"><input type="time" className="input" {...register('approximateTime')} /></FormField><FormField label="Campus location" required error={errors.location}><select className="input" {...register('location', { required: 'Location is required' })}><option value="">Select location</option>{meta.locations.map((entry) => <option key={entry._id} value={entry.name}>{entry.name}</option>)}</select></FormField><FormField label="Building (optional)"><input className="input" placeholder="e.g. Library Block" {...register('building')} /></FormField><FormField label="Floor (optional)"><input className="input" placeholder="e.g. First floor" {...register('floor')} /></FormField><FormField label="Room / lab (optional)"><input className="input" placeholder="e.g. Lab 204" {...register('room')} /></FormField><FormField label="Landmark (optional)" className="sm:col-span-2 lg:col-span-3"><input className="input" placeholder="Near the east staircase" {...register('landmark')} /></FormField></div></Section><Section title="Private ownership evidence (optional)" description="Optional but recommended. These values are never returned by the public API and are used only during claim review."><div className="mb-5 flex gap-3 rounded-xl bg-brand-50 p-4 text-sm text-brand-800 dark:bg-brand-500/10 dark:text-brand-200"><EyeOff className="shrink-0" size={19} /><p>Add serial fragments, hidden scratches, card-number fragments, or contents here—never in the public description.</p></div><div className="grid gap-5 sm:grid-cols-2"><FormField label="Unique identification marks (optional)"><textarea rows="4" className="input resize-y" placeholder="e.g. Small scratch near the zipper, initials inside, or a hidden sticker" {...register('uniqueMarks')} /></FormField><FormField label="Other private details (optional)"><textarea rows="4" className="input resize-y" placeholder="e.g. Contents, a partial serial number, or another owner-only detail" {...register('privateDetails')} /></FormField></div>{type === 'found' && <div className="mt-6"><div className="mb-3 flex items-center justify-between"><div><h3 className="text-sm font-bold text-slate-900 dark:text-white">Private verification questions (optional)</h3><p className="mt-1 text-xs text-slate-500">Both questions and answers are kept out of public responses.</p></div><button type="button" disabled={questions.fields.length >= 5} onClick={() => questions.append({ question: '', answer: '' })} className="btn-secondary"><Plus size={15} /> Add</button></div><div className="space-y-3">{questions.fields.map((field, index) => <div key={field.id} className="grid gap-3 rounded-xl border border-slate-200 p-4 sm:grid-cols-[1fr_1fr_auto] dark:border-slate-700"><FormField label={`Question ${index + 1}`}><input className="input" placeholder="What sticker is attached?" {...register(`verificationQuestions.${index}.question`, { required: 'Question is required' })} /></FormField><FormField label="Expected answer"><input className="input" placeholder="Keep this private" {...register(`verificationQuestions.${index}.answer`, { required: 'Answer is required' })} /></FormField><button type="button" onClick={() => questions.remove(index)} className="mt-6 grid size-10 place-items-center rounded-lg text-rose-500 hover:bg-rose-50" aria-label="Remove question"><Trash2 size={17} /></button></div>)}</div></div>}</Section><Section title="Images and handover preferences (optional)"><div className="grid gap-5 sm:grid-cols-2"><FormField as="div" label="Item images (optional)" hint="Up to 6 JPG, PNG, or WebP images. Maximum size is configurable."><ImagePicker key={id || type} registration={register('images')} existingImages={existingImages} onExistingChange={setExistingImages} /></FormField><div className="space-y-5"><FormField label="Contact preference (optional)"><select className="input" {...register('contactPreference')}><option value="chat">Secure in-app chat</option><option value="email">Email via FoundBack</option><option value="security_office">Security office only</option></select></FormField>{type === 'lost' ? <FormField label="Reward offered (optional)"><input type="number" min="0" className="input" {...register('reward')} /></FormField> : <><FormField label="Current item location (optional)"><input className="input" placeholder="With me / Security Office" {...register('currentItemLocation')} /></FormField><label className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300"><input type="checkbox" {...register('securityOfficeSubmitted')} /> Submitted to Security Office</label><FormField label="Handover preference (optional)"><input className="input" placeholder="e.g. Security Office, weekdays after 2 PM" {...register('handoverPreference')} /></FormField></>}</div></div></Section><Section title="Privacy settings (optional)"><div className="space-y-3"><label className="flex items-start gap-3 text-sm text-slate-600 dark:text-slate-300"><input type="checkbox" className="mt-1" {...register('privacy.hideReporter')} /><span><strong className="block text-slate-900 dark:text-white">Hide my name</strong>Show the report without your public display name.</span></label><label className="flex items-start gap-3 text-sm text-slate-600 dark:text-slate-300"><input type="checkbox" className="mt-1" {...register('privacy.hideExactLocation')} /><span><strong className="block text-slate-900 dark:text-white">Hide exact room details</strong>Show only the general campus location publicly.</span></label></div></Section><div className="flex flex-col-reverse justify-end gap-3 sm:flex-row"><button type="button" className="btn-secondary" onClick={() => navigate(-1)}>Save later / cancel</button><button disabled={isSubmitting} className="btn-primary px-6">{isSubmitting ? <LoaderCircle size={17} className="animate-spin" /> : <ShieldCheck size={17} />}{id ? 'Save changes' : 'Publish report'}</button></div></form><Modal open={Boolean(duplicates)} onClose={() => setDuplicates(null)} title="Similar reports already exist" footer={<><button className="btn-secondary" onClick={() => setDuplicates(null)}>Review my details</button><button className="btn-primary" onClick={() => { const values = pendingValues; setDuplicates(null); send(values, true) }}>Submit anyway</button></>}><div className="flex gap-3 rounded-xl bg-amber-50 p-4 text-amber-800 dark:bg-amber-500/10 dark:text-amber-200"><AlertTriangle className="shrink-0" /><p className="text-sm">Please check these reports before creating a duplicate. You can continue after acknowledging this warning.</p></div><div className="mt-4 space-y-2">{duplicates?.map((entry) => <div key={entry._id} className="rounded-xl border border-slate-200 p-3 dark:border-slate-700"><p className="text-sm font-bold">{entry.title}</p><p className="text-xs text-slate-500">{entry.location} · {entry.category}</p></div>)}</div></Modal></div>
}
