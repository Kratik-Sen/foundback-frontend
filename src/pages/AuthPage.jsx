import { ArrowLeft, CheckCircle2, Eye, EyeOff, GraduationCap, LoaderCircle, LockKeyhole, Mail, ShieldCheck } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import api from '../api/client'
import Brand from '../components/Brand'
import { FormField } from '../components/FormField'
import { useAuth } from '../context/AuthContext'

function destination(user, fallback) {
  if (fallback) return fallback
  return user.role === 'admin' ? '/admin' : user.role === 'staff' ? '/staff' : '/dashboard'
}

export default function AuthPage({ mode = 'login' }) {
  const { login, register: createAccount } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [params] = useSearchParams()
  const [showPassword, setShowPassword] = useState(false)
  const [message, setMessage] = useState('')
  const { register, handleSubmit, watch, formState: { errors, isSubmitting } } = useForm()

  useEffect(() => {
    if (mode !== 'verify') return
    const token = params.get('token')
    if (!token) return setMessage('This verification link is missing its token.')
    api.post('/auth/verify-email', { token }).then(({ data }) => setMessage(data.message)).catch((error) => setMessage(error.message))
  }, [mode, params])

  const submit = async (values) => {
    try {
      if (mode === 'login') {
        const data = await login(values)
        toast.success(data.message)
        navigate(destination(data.user, location.state?.from), { replace: true })
      } else if (mode === 'register') {
        const data = await createAccount(values)
        toast.success(data.message)
        navigate('/dashboard')
      } else if (mode === 'forgot') {
        const { data } = await api.post('/auth/forgot-password', values)
        setMessage(data.message)
      } else if (mode === 'reset') {
        const { data } = await api.post('/auth/reset-password', { ...values, token: params.get('token') })
        toast.success(data.message)
        navigate('/dashboard')
      }
    } catch (error) { toast.error(error.message) }
  }

  const content = {
    login: ['Welcome back', 'Sign in with your college account to continue.'],
    register: ['Join your campus community', 'Create your student account with an approved college email.'],
    forgot: ['Forgot your password?', 'Enter your college email and we’ll send a secure reset link.'],
    reset: ['Choose a new password', 'Use at least eight characters and keep it unique.'],
    verify: ['Verify your college email', 'FoundBack uses verification to keep the community trusted.'],
  }[mode]

  return <div className="grid min-h-screen bg-white lg:grid-cols-[.92fr_1.08fr] dark:bg-slate-950"><aside className="relative hidden overflow-hidden bg-slate-950 p-12 text-white lg:flex lg:flex-col"><div className="auth-brand-glow absolute inset-0 bg-[radial-gradient(circle_at_20%_15%,rgba(99,102,241,.35),transparent_35%),radial-gradient(circle_at_80%_85%,rgba(14,165,233,.2),transparent_32%)]" /><div className="relative"><Brand inverted /><div className="mt-28 max-w-lg"><p className="section-kicker !text-brand-300">Secure campus recovery</p><h1 className="mt-4 text-4xl font-black leading-tight tracking-tight">Belongings find their way home when a campus works together.</h1><p className="mt-5 leading-7 text-slate-300">Report privately, receive transparent match scores, and complete staff-verified handovers without exposing your personal phone number.</p><div className="mt-10 space-y-4">{['College-email-only community', 'Private ownership verification', 'Claim-linked real-time chat', 'Audited OTP handovers'].map((text) => <p key={text} className="flex items-center gap-3 text-sm font-semibold text-slate-200"><span className="grid size-8 place-items-center rounded-lg bg-white/8"><CheckCircle2 size={16} className="text-emerald-300" /></span>{text}</p>)}</div></div></div><p className="relative mt-auto text-xs text-slate-500">Smart College Lost & Found Portal</p></aside><main className="flex min-h-screen items-center justify-center p-5 sm:p-10"><div className="w-full max-w-lg"><div className="mb-8 flex items-center justify-between lg:hidden"><Brand /><Link to="/" className="text-sm font-semibold text-slate-500">Back home</Link></div><Link to="/" className="mb-8 hidden items-center gap-2 text-sm font-semibold text-slate-500 lg:inline-flex"><ArrowLeft size={16} /> Back to FoundBack</Link><div className="mb-7"><span className="mb-4 grid size-11 place-items-center rounded-xl bg-brand-50 text-brand-600 dark:bg-brand-500/10 dark:text-brand-300">{mode === 'register' ? <GraduationCap /> : mode === 'verify' ? <ShieldCheck /> : mode === 'forgot' ? <Mail /> : <LockKeyhole />}</span><h1 className="text-3xl font-black tracking-tight text-slate-950 dark:text-white">{content[0]}</h1><p className="mt-2 text-sm leading-6 text-slate-500">{content[1]}</p></div>{mode === 'verify' ? <div className="card p-6"><p className="text-sm leading-6 text-slate-600 dark:text-slate-300">{message || 'Verifying your email…'}</p><Link to="/login" className="btn-primary mt-5">Continue to sign in</Link></div> : message ? <div className="card p-6"><CheckCircle2 className="text-emerald-500" /><p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-300">{message}</p><Link to="/login" className="btn-primary mt-5">Back to sign in</Link></div> : <form onSubmit={handleSubmit(submit)} className="space-y-4">{mode === 'register' && <><div className="grid gap-4 sm:grid-cols-2"><FormField label="Full name" required error={errors.name}><input className="input" {...register('name', { required: 'Full name is required', minLength: { value: 2, message: 'Enter your full name' } })} /></FormField><FormField label="Enrollment number" required error={errors.enrollmentNumber}><input className="input uppercase" {...register('enrollmentNumber', { required: 'Enrollment number is required' })} /></FormField></div><div className="grid gap-4 sm:grid-cols-2"><FormField label="Course"><input className="input" placeholder="B.Tech" {...register('course')} /></FormField><FormField label="Branch"><input className="input" placeholder="Computer Science" {...register('branch')} /></FormField></div><div className="grid gap-4 sm:grid-cols-2"><FormField label="Semester"><select className="input" {...register('semester')}><option value="">Select</option>{Array.from({ length: 12 }, (_, i) => <option key={i + 1}>{i + 1}</option>)}</select></FormField><FormField label="Phone"><input className="input" inputMode="tel" {...register('phone', { pattern: { value: /^[0-9+ -]{7,18}$/, message: 'Enter a valid phone number' } })} /></FormField></div><FormField label="Profile image" hint="Optional JPG, PNG, or WebP"><input type="file" accept="image/jpeg,image/png,image/webp" className="input" {...register('profileImage')} /></FormField></>}<FormField label="College email" required error={errors.email}><input type="email" className="input" placeholder="you@college.edu" {...register('email', { required: 'College email is required', pattern: { value: /^\S+@\S+\.\S+$/, message: 'Enter a valid email' } })} /></FormField>{!['forgot'].includes(mode) && <FormField label={mode === 'reset' ? 'New password' : 'Password'} required error={errors.password}><div className="relative"><input type={showPassword ? 'text' : 'password'} className="input pr-11" {...register('password', { required: 'Password is required', minLength: { value: 8, message: 'Use at least 8 characters' } })} /><button type="button" onClick={() => setShowPassword((value) => !value)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">{showPassword ? <EyeOff size={18} /> : <Eye size={18} />}</button></div></FormField>}{['register', 'reset'].includes(mode) && <FormField label="Confirm password" required error={errors.confirmPassword}><input type={showPassword ? 'text' : 'password'} className="input" {...register('confirmPassword', { required: 'Confirm your password', validate: (value) => value === watch('password') || 'Passwords do not match' })} /></FormField>}{mode === 'login' && <div className="flex items-center justify-between text-sm"><label className="flex items-center gap-2 text-slate-500"><input type="checkbox" /> Remember me</label><Link to="/forgot-password" className="font-semibold text-brand-600">Forgot password?</Link></div>}<button disabled={isSubmitting} className="btn-primary w-full py-3">{isSubmitting && <LoaderCircle size={17} className="animate-spin" />}{mode === 'login' ? 'Sign in securely' : mode === 'register' ? 'Create student account' : mode === 'forgot' ? 'Send reset link' : 'Reset password'}</button>{mode === 'register' && <p className="text-center text-xs leading-5 text-slate-400">By creating an account, you agree to the <Link to="/privacy" className="text-brand-600">privacy and safety policy</Link>.</p>}</form>}{mode === 'login' && <p className="mt-7 text-center text-sm text-slate-500">New to FoundBack? <Link to="/register" className="font-bold text-brand-600">Create student account</Link></p>}{mode === 'register' && <p className="mt-7 text-center text-sm text-slate-500">Already registered? <Link to="/login" className="font-bold text-brand-600">Sign in</Link></p>}</div></main></div>
}
