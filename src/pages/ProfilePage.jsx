import { KeyRound, LoaderCircle, Save, ShieldCheck, UserRound } from 'lucide-react'
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import api from '../api/client'
import { FormField } from '../components/FormField'
import PageHeader from '../components/PageHeader'
import { useAuth } from '../context/AuthContext'
import { initials } from '../utils/format'

export default function ProfilePage() {
  const { user, refresh } = useAuth()
  const profile = useForm({ defaultValues: user })
  const password = useForm()
  const resetProfile = profile.reset
  useEffect(() => { resetProfile(user) }, [user, resetProfile])

  const save = async (values) => {
    const payload = new FormData()
    Object.entries(values).forEach(([key, value]) => {
      if (key === 'profileImage') {
        if (value?.[0]) payload.append(key, value[0])
      } else if (['name', 'phone', 'course', 'branch', 'semester'].includes(key) && value !== undefined) {
        payload.append(key, value)
      }
    })
    try {
      const { data } = await api.patch('/auth/profile', payload)
      await refresh()
      toast.success(data.message)
    } catch (error) { toast.error(error.message) }
  }

  const changePassword = async (values) => {
    try {
      const { data } = await api.patch('/auth/change-password', values)
      toast.success(data.message)
      password.reset()
    } catch (error) { toast.error(error.message) }
  }

  return <>
    <PageHeader eyebrow="Account" title="Profile & security" description="Manage your college details and keep your password secure." />
    <div className="grid gap-6 xl:grid-cols-[.7fr_1.3fr]">
      <aside className="card h-fit p-6 text-center">
        {user.profileImage?.url ? <img src={user.profileImage.url} alt="" className="mx-auto size-24 rounded-3xl object-cover" /> : <span className="mx-auto grid size-24 place-items-center rounded-3xl bg-brand-100 text-3xl font-black text-brand-700 dark:bg-brand-500/20 dark:text-brand-300">{initials(user.name)}</span>}
        <h2 className="mt-4 text-xl font-extrabold text-slate-950 dark:text-white">{user.name}</h2>
        <p className="mt-1 text-sm text-slate-500">{user.email}</p>
        <span className="mt-4 inline-flex rounded-full bg-brand-50 px-3 py-1 text-xs font-bold capitalize text-brand-700 dark:bg-brand-500/10 dark:text-brand-300">{user.role}</span>
        <div className="mt-6 space-y-3 border-t border-slate-100 pt-5 text-left text-xs dark:border-slate-800">
          <p className="flex justify-between"><span className="text-slate-400">Enrollment</span><strong>{user.enrollmentNumber || '—'}</strong></p>
          <p className="flex justify-between"><span className="text-slate-400">Email verified</span><strong className={user.emailVerified ? 'text-emerald-600' : 'text-amber-600'}>{user.emailVerified ? 'Verified' : 'Pending'}</strong></p>
          <p className="flex justify-between"><span className="text-slate-400">Account</span><strong className="capitalize">{user.accountStatus}</strong></p>
        </div>
      </aside>
      <div className="space-y-6">
        <form onSubmit={profile.handleSubmit(save)} className="card p-6">
          <h2 className="flex items-center gap-2 font-extrabold text-slate-950 dark:text-white"><UserRound size={18} className="text-brand-600" /> Personal details</h2>
          <div className="mt-6 grid gap-5 sm:grid-cols-2">
            <FormField label="Full name" required><input className="input" {...profile.register('name', { required: true })} /></FormField>
            <FormField label="Phone number"><input className="input" {...profile.register('phone')} /></FormField>
            <FormField label="Course"><input className="input" {...profile.register('course')} /></FormField>
            <FormField label="Branch"><input className="input" {...profile.register('branch')} /></FormField>
            <FormField label="Semester"><input type="number" min="1" max="12" className="input" {...profile.register('semester')} /></FormField>
            <FormField label="College email"><input disabled className="input opacity-60" value={user.email} readOnly /></FormField>
            <FormField label="Profile image" hint="Optional JPG, PNG, or WebP"><input type="file" accept="image/jpeg,image/png,image/webp" className="input" {...profile.register('profileImage')} /></FormField>
          </div>
          <button disabled={profile.formState.isSubmitting} className="btn-primary mt-6">{profile.formState.isSubmitting ? <LoaderCircle className="animate-spin" size={16} /> : <Save size={16} />} Save changes</button>
        </form>
        <form onSubmit={password.handleSubmit(changePassword)} className="card p-6">
          <h2 className="flex items-center gap-2 font-extrabold text-slate-950 dark:text-white"><KeyRound size={18} className="text-brand-600" /> Change password</h2>
          <div className="mt-6 grid gap-5 sm:grid-cols-2">
            <FormField label="Current password" required><input type="password" className="input" {...password.register('currentPassword', { required: true })} /></FormField>
            <FormField label="New password" required error={password.formState.errors.newPassword}><input type="password" className="input" {...password.register('newPassword', { required: true, minLength: { value: 8, message: 'Use at least 8 characters' } })} /></FormField>
          </div>
          <button disabled={password.formState.isSubmitting} className="btn-secondary mt-6"><ShieldCheck size={16} /> Update password</button>
        </form>
      </div>
    </div>
  </>
}
