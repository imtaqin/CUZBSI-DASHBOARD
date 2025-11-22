'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  ExclamationTriangleIcon,
  ArrowLeftIcon,
  HomeIcon
} from '@heroicons/react/24/outline'

export default function NotFound() {
  const router = useRouter()

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center">
        {/* 404 Icon */}
        <div className="flex justify-center mb-6">
          <div className="relative">
            <div className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-green-600">
              404
            </div>
            <div className="absolute inset-0 flex items-center justify-center opacity-20">
              <ExclamationTriangleIcon className="h-24 w-24 text-slate-400" />
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="space-y-4">
          <h1 className="text-3xl font-bold text-slate-900">Halaman Tidak Ditemukan</h1>
          <p className="text-slate-600 leading-relaxed">
            Maaf, halaman yang Anda cari tidak tersedia. Mungkin halaman telah dipindahkan atau URL yang Anda masukkan tidak benar.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 mt-8">
          <button
            onClick={() => router.back()}
            className="flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
          >
            <ArrowLeftIcon className="h-4 w-4" />
            Kembali
          </button>
          <Link
            href="/admin"
            className="flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-green-600 rounded-lg hover:from-blue-700 hover:to-green-700 transition-colors"
          >
            <HomeIcon className="h-4 w-4" />
            Ke Dasbor
          </Link>
        </div>

        {/* Help Text */}
        <div className="mt-12 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <p className="text-xs text-blue-700">
            <span className="font-semibold">Butuh bantuan?</span> Hubungi administrator jika masalah berlanjut.
          </p>
        </div>
      </div>
    </div>
  )
}
