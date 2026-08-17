import { ImagePlus, LoaderCircle, LockKeyhole, ShieldCheck } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { useNavigate, useParams } from 'react-router-dom'
import api from '../api/client'
import { FormField } from '../components/FormField'
import PageHeader from '../components/PageHeader'
import { Spinner } from '../components/States'

export default function ClaimPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [item, setItem] = useState(null)
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm()
  useEffect(() => {
    api.get(`/items/${id}`).then(({ data }) => {
      if (['returned', 'closed', 'expired', 'rejected'].includes(data.item.status)) {
        toast.error('This item has already been returned and is no longer accepting claims.')
        navigate(`/items/${id}`, { replace: true })
        return
      }
      setItem(data.item)
    }).catch((err) => { toast.error(err.message); navigate(`/items/${id}`) })
  }, [id, navigate])
  const submit = async (values) => {
    const form = new FormData()
    const answers = (item.verificationQuestions || []).map((question, index) => ({ questionId: question._id, question: question.question, answer: values[`question_${index}`] }))
    Object.entries(values).filter(([key]) => !key.startsWith('question_') && key !== 'proofImages').forEach(([key, value]) => form.append(key, value))
    form.append('verificationAnswers', JSON.stringify(answers))
    Array.from(values.proofImages || []).forEach((file) => form.append('proofImages', file))
    try { const { data } = await api.post(`/claims/item/${id}`, form); toast.success(data.message); navigate('/claims') } catch (err) { toast.error(err.message) }
  }
  if (!item) return <Spinner label="Preparing secure claim" />
  return <div className="mx-auto max-w-4xl"><PageHeader eyebrow="Secure ownership claim" title={`Claim “${item.title}”`} description="Your answers and proof are visible only to the reporter and authorized college staff. They are never added to the public listing." /><div className="mb-6 flex gap-3 rounded-2xl bg-brand-700 p-5 text-sm text-brand-50"><LockKeyhole className="shrink-0" /><p><strong className="block text-white">Tell us what the public report cannot.</strong>Specific private details help reviewers distinguish a real owner from someone who only read the listing.</p></div><form onSubmit={handleSubmit(submit)} className="card space-y-6 p-6 sm:p-8"><FormField label="Why do you believe this item belongs to you?" required error={errors.reason}><textarea rows="4" className="input" {...register('reason', { required: 'Explain why this item is yours', minLength: { value: 10, message: 'Please add more detail' } })} /></FormField><FormField label="Describe unique marks that are not visible in the listing" required error={errors.uniqueIdentificationAnswer}><textarea rows="4" className="input" {...register('uniqueIdentificationAnswer', { required: 'Unique identification details are required' })} /></FormField><div className="grid gap-5 sm:grid-cols-3"><FormField label="Where exactly did you lose it?" required error={errors.locationAnswer}><input className="input" {...register('locationAnswer', { required: 'Exact location is required' })} /></FormField><FormField label="Approximate date" required error={errors.dateAnswer}><input type="date" className="input" {...register('dateAnswer', { required: 'Date is required' })} /></FormField><FormField label="Approximate time"><input type="time" className="input" {...register('approximateTime')} /></FormField></div>{item.verificationQuestions?.length > 0 && <section className="rounded-2xl border border-brand-200 bg-brand-50/50 p-5 dark:border-brand-500/20 dark:bg-brand-500/5"><h2 className="flex items-center gap-2 font-extrabold text-brand-900 dark:text-brand-200"><ShieldCheck size={18} /> Finder’s private questions</h2><p className="mt-1 text-xs text-brand-700/70 dark:text-brand-300/70">The expected answers are encrypted from the public response and available only during review.</p><div className="mt-5 space-y-4">{item.verificationQuestions.map((question, index) => <FormField key={question._id} label={question.question} required error={errors[`question_${index}`]}><input className="input" {...register(`question_${index}`, { required: 'Answer this verification question' })} /></FormField>)}</div></section>}<div className="grid gap-5 sm:grid-cols-2"><FormField label="Device serial number (optional)"><input className="input" {...register('deviceSerialNumber')} /></FormField><FormField label="Proof of ownership images" hint="Receipt, old item photo, or related proof."><label className="flex h-[46px] cursor-pointer items-center justify-center gap-2 rounded-xl border-2 border-dashed border-slate-200 text-sm text-slate-500 dark:border-slate-700"><ImagePlus size={17} /> Choose up to 3 images<input type="file" multiple accept="image/jpeg,image/png,image/webp" className="hidden" {...register('proofImages')} /></label></FormField></div><FormField label="Additional information"><textarea rows="3" className="input" {...register('additionalInformation')} /></FormField><div className="flex justify-end gap-3"><button type="button" onClick={() => navigate(-1)} className="btn-secondary">Cancel</button><button disabled={isSubmitting} className="btn-primary px-6">{isSubmitting && <LoaderCircle size={17} className="animate-spin" />} Submit secure claim</button></div></form></div>
}
