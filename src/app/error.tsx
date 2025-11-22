'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import {
  ExclamationTriangleIcon,
  ArrowLeftIcon,
  HomeIcon
} from '@heroicons/react/24/outline'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center">
        {/* Error Icon */}
        <div className="flex justify-center mb-6">
          <div className="relative">
            <div className="h-20 w-20 mx-auto rounded-full bg-red-100 flex items-center justify-center">
              <ExclamationTriangleIcon className="h-10 w-10 text-red-600" />
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="space-y-4">
          <h1 className="text-3xl font-bold text-slate-900">Terjadi Kesalahan</h1>
          <p className="text-slate-600 leading-relaxed">
            Maaf, terjadi kesalahan yang tidak terduga. Tim kami telah diberitahu tentang masalah ini.
          </p>
          {process.env.NODE_ENV === 'development' && error.message && (
            <div className="mt-4 p-3 bg-slate-100 rounded-lg text-left">
              <p className="text-xs font-mono text-slate-600 break-words">
                {error.message}
              </p>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 mt-8">
          <button
            onClick={reset}
            className="flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-red-600 to-orange-600 rounded-lg hover:from-red-700 hover:to-orange-700 transition-colors"
          >
            <ArrowLeftIcon className="h-4 w-4" />
            Coba Lagi
          </button>
          <Link
            href="/admin"
            className="flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
          >
            <HomeIcon className="h-4 w-4" />
            Ke Dasbor
          </Link>
        </div>

        {/* Error Code */}
        {error.digest && (
          <p className="mt-6 text-xs text-slate-500">
            Kode Error: <span className="font-mono">{error.digest}</span>
          </p>
        )}
      </div>
    </div>
  )
}
