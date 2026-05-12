import { useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '@/integrations/supabase/client'
import { useAuthStore } from '@/store/auth-store'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Sparkles, Mail, Lock, Eye, EyeOff, MailCheck } from 'lucide-react'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'

export function LoginPage() {
  const { setUser } = useAuthStore()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [unverifiedEmail, setUnverifiedEmail] = useState<string | null>(null)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setUnverifiedEmail(null)

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        if (error.message.toLowerCase().includes('email not confirmed')) {
          setUnverifiedEmail(email)
          toast.error('Please verify your email before signing in')
          return
        }
        throw error
      }

      if (data.user) {
        setUser({
          id: data.user.id,
          email: data.user.email!,
          created_at: data.user.created_at,
        })
        toast.success('Welcome back!')
        window.location.href = '/dashboard'
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to login')
    } finally {
      setLoading(false)
    }
  }

  const handleResendVerification = async () => {
    if (!unverifiedEmail) return
    setLoading(true)
    try {
      await supabase.auth.resend({
        type: 'signup',
        email: unverifiedEmail,
      })
      toast.success('Verification email resent! Check your inbox.')
    } catch (err: any) {
      toast.error(err.message || 'Failed to resend verification')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-background to-muted/50 p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-sm"
      >
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary shadow-lg shadow-primary/25">
            <Sparkles className="h-6 w-6 text-primary-foreground" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight">Welcome to DevSync</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            AI-powered developer productivity platform
          </p>
        </div>

        {unverifiedEmail ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="rounded-xl border bg-card p-6 shadow-sm text-center"
          >
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-500/10">
              <MailCheck className="h-7 w-7 text-amber-500" />
            </div>
            <h2 className="text-lg font-semibold">Email not verified</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Please verify <strong>{unverifiedEmail}</strong> before signing in.
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              Check your inbox (and spam folder) for the verification link.
            </p>
            <div className="mt-4 flex flex-col gap-2">
              <Button onClick={handleResendVerification} disabled={loading}>
                {loading ? 'Sending...' : 'Resend verification email'}
              </Button>
              <Button variant="outline" onClick={() => setUnverifiedEmail(null)}>
                Use a different email
              </Button>
            </div>
          </motion.div>
        ) : (
          <div className="rounded-xl border bg-card p-6 shadow-sm">
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    className="pl-9"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter your password"
                    className="pl-9 pr-9"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Signing in...' : 'Sign in'}
              </Button>
            </form>

            <div className="mt-4 text-center text-sm text-muted-foreground">
              Don't have an account?{' '}
              <Link to="/register" className="font-medium text-primary hover:underline">
                Create one
              </Link>
            </div>
          </div>
        )}

        <p className="mt-4 text-center text-xs text-muted-foreground">
          By signing in, you agree to our Terms of Service and Privacy Policy.
        </p>
      </motion.div>
    </div>
  )
}
