'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'
import {
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  Input,
  Button,
  Link,
  Divider,
} from '@nextui-org/react'

export default function SignUp() {
  const router = useRouter()
  const [mounted, setMounted] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    setMounted(true)
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${location.origin}/auth/callback`,
          data: {
            full_name: email.split('@')[0], // Default name from email
          },
        },
      })

      if (signUpError) {
        throw signUpError
      }

      if (data?.user) {
        alert('Check your email for the confirmation link!')
        router.push('/login')
      }
    } catch (error: any) {
      console.error('Signup error:', error)
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  if (!mounted) {
    return null
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="flex flex-col gap-1 items-center">
          <h1 className="text-2xl font-bold">Create an account</h1>
          <p className="text-sm text-default-500">
            Already have an account?{' '}
            <Link href="/login" color="primary" size="sm">
              Sign in
            </Link>
          </p>
        </CardHeader>
        <Divider />
        <CardBody>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <Input
              type="email"
              label="Email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              errorMessage={error}
              isInvalid={!!error}
            />
            <Input
              type="password"
              label="Password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="new-password"
            />
            <Button
              type="submit"
              color="primary"
              isLoading={loading}
              className="w-full"
            >
              {loading ? 'Creating account...' : 'Sign up'}
            </Button>
          </form>
        </CardBody>
        <Divider />
        <CardFooter className="justify-center">
          <p className="text-center text-sm text-default-500">
            By signing up, you agree to our{' '}
            <Link href="/terms" size="sm">
              Terms of Service
            </Link>{' '}
            and{' '}
            <Link href="/privacy" size="sm">
              Privacy Policy
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  )
}
