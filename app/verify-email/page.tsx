'use client'

export default function VerifyEmail() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center py-2">
      <div className="w-full max-w-md space-y-8 text-center">
        <h2 className="mt-6 text-3xl font-bold tracking-tight">Check your email</h2>
        <p className="mt-2 text-gray-600">
          We've sent you an email with a link to verify your account. Please check your inbox and click
          the link to continue.
        </p>
      </div>
    </div>
  )
}
