'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { useAuth } from '@/context/AuthContext'
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const { login, isAuthenticated, isLoading: authLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (isAuthenticated && !authLoading) {
      router.replace('/admin')
    }
  }, [isAuthenticated, authLoading, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      await login(email, password)
      router.push('/admin')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login gagal')
    } finally {
      setIsLoading(false)
    }
  }

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-3">
          <div className="animate-spin rounded-full h-10 w-10 border-4 border-green-600 border-t-transparent"></div>
          <p className="text-gray-600 text-sm">Memuat...</p>
        </div>
      </div>
    )
  }

  if (isAuthenticated) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo Section */}
        <div className="text-center mb-8">
          <div className="inline-block mb-4">
            <Image
              src="/image/logo-cuzbsi.png"
              alt="CUZBSI Logo"
              width={140}
              height={140}
              className="object-contain"
            />
          </div>
          <h1 className="text-2xl font-bold text-gray-800 mb-1">CUZBSI Dashboard</h1>
          <p className="text-sm text-gray-500">Masuk ke akun Anda</p>
        </div>

        {/* Login Card */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email Input */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                placeholder="admin@multimutasi.com"
              />
            </div>

            {/* Password Input */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-2.5 pr-10 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showPassword ? (
                    <EyeSlashIcon className="h-5 w-5" />
                  ) : (
                    <EyeIcon className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 text-sm p-3 rounded-lg">
                {error}
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={!email || !password || isLoading}
              className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-2.5 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? 'Memproses...' : 'Masuk'}
            </button>
          </form>

          {/* Demo Credentials */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <p className="text-xs text-gray-500 font-medium mb-3">Akun Demo:</p>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Email:</span>
                <code className="bg-gray-100 text-gray-800 px-3 py-1 rounded font-mono">
                  admin@multimutasi.com
                </code>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Password:</span>
                <code className="bg-gray-100 text-gray-800 px-3 py-1 rounded font-mono">
                  admin123
                </code>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-gray-400 mt-6">
          © 2025 CUZBSI. All rights reserved.
        </p>
      </div>
    </div>
  )
}
