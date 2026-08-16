import { CheckCircle2, Mail, MapPin, ShieldCheck } from 'lucide-react'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import api from '../api/client'
import PageHeader from '../components/PageHeader'
import { FormField } from '../components/FormField'

export default function StaticPage({ type }) {
  const { register, handleSubmit, reset, formState: { errors } } = useForm()
  const submitContact = async (values) => {
    try { const { data } = await api.post('/public/contact', values); toast.success(data.message); reset() } catch (error) { toast.error(error.message) }
  }
  if (type === 'contact') return <div className="container-app py-14"><PageHeader eyebrow="We’re here to help" title="Contact the FoundBack team" description="For urgent item handovers, contact the Security Office directly. For portal support, send a message below." /><div className="grid gap-7 lg:grid-cols-[.7fr_1.3fr]"><div className="card p-6"><div className="space-y-6"><div className="flex gap-3"><MapPin className="text-brand-600" /><div><p className="font-bold">Security Office</p><p className="text-sm text-slate-500">Main Gate, Ground Floor</p></div></div><div className="flex gap-3"><Mail className="text-brand-600" /><div><p className="font-bold">Email</p><p className="text-sm text-slate-500">help@college.edu</p></div></div></div></div><form onSubmit={handleSubmit(submitContact)} className="card space-y-4 p-6"><div className="grid gap-4 sm:grid-cols-2"><FormField label="Name" required error={errors.name}><input className="input" {...register('name', { required: 'Name is required' })} /></FormField><FormField label="College email" required error={errors.email}><input type="email" className="input" {...register('email', { required: 'Email is required' })} /></FormField></div><FormField label="Subject" required error={errors.subject}><input className="input" {...register('subject', { required: 'Subject is required' })} /></FormField><FormField label="Message" required error={errors.message}><textarea rows="5" className="input resize-y" {...register('message', { required: 'Message is required', minLength: { value: 10, message: 'Please add more detail' } })} /></FormField><button className="btn-primary">Send message</button></form></div></div>

  const isPrivacy = type === 'privacy'
  return <div className="container-app py-14"><PageHeader eyebrow={isPrivacy ? 'Privacy & safety' : 'About the project'} title={isPrivacy ? 'Your details are not the listing.' : 'One trusted place for everything lost on campus.'} description={isPrivacy ? 'FoundBack separates public discovery details from private ownership evidence at every stage.' : 'FoundBack replaces scattered chat messages and notice-board posts with structured reports, useful matches, and accountable recoveries.'} /><div className="grid gap-6 lg:grid-cols-3">{(isPrivacy ? [
    ['Public by design', 'Titles, categories, general locations, dates, and non-sensitive descriptions help the community identify a possible item.'],
    ['Private by default', 'Unique marks, serial information, verification answers, claim evidence, emails, and phone numbers are protected.'],
    ['Access with purpose', 'Finders and staff see private claim evidence only for ownership review. Reported chats are visible to admins for complaint resolution.'],
  ] : [
    ['The problem', 'Students currently depend on WhatsApp groups, guards, paper notices, and word of mouth. Reports are fragmented and hard to verify.'],
    ['The solution', 'A searchable campus portal connects lost and found reports using transparent matching, private claim questions, and real-time chat.'],
    ['The outcome', 'Fewer duplicate reports, safer ownership checks, clearer handovers, and useful recovery analytics for the college.'],
  ]).map(([title, copy]) => <div key={title} className="card p-6"><span className="grid size-11 place-items-center rounded-xl bg-brand-50 text-brand-600 dark:bg-brand-500/10"><ShieldCheck /></span><h2 className="mt-5 font-extrabold text-slate-950 dark:text-white">{title}</h2><p className="mt-2 text-sm leading-6 text-slate-500">{copy}</p></div>)}</div><div className="card mt-7 p-7"><h2 className="text-xl font-extrabold text-slate-950 dark:text-white">{isPrivacy ? 'Safety commitments' : 'Core objectives'}</h2><div className="mt-5 grid gap-3 sm:grid-cols-2">{(isPrivacy ? ['No public personal phone numbers', 'No public verification answers', 'Role-protected administrative actions', 'Validated image type and size', 'Claim-linked chat only', 'Audited OTP handovers'] : ['Centralize campus reports', 'Suggest likely lost–found matches', 'Reduce false and duplicate claims', 'Protect sensitive ownership details', 'Support staff-controlled handovers', 'Measure the college recovery rate']).map((text) => <p key={text} className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300"><CheckCircle2 size={16} className="text-emerald-500" />{text}</p>)}</div></div></div>
}
