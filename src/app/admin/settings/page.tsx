'use client'

import { AdminLayout } from '@/components/layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui'
import {
  CogIcon,
  UserIcon,
  ShieldCheckIcon,
  ServerIcon,
  BellIcon,
  GlobeAltIcon
} from '@heroicons/react/24/outline'

export default function SettingsPage() {
  return (
    <AdminLayout title="Pengaturan" description="Konfigurasi pengaturan sistem dan preferensi">
      <div className="space-y-6">
        {/* Settings Categories */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <UserIcon className="h-5 w-5 mr-2 text-blue-600" />
                Pengaturan Akun
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-slate-300 mb-4">
                Kelola profil, kata sandi, dan preferensi pribadi Anda.
              </p>
              <div className="space-y-2">
                <div className="text-sm text-slate-400">• Informasi Profil</div>
                <div className="text-sm text-slate-400">• Ubah Kata Sandi</div>
                <div className="text-sm text-slate-400">• Preferensi Email</div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <ShieldCheckIcon className="h-5 w-5 mr-2 text-green-600" />
                Pengaturan Keamanan
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-slate-300 mb-4">
                Konfigurasi opsi keamanan dan izin akses.
              </p>
              <div className="space-y-2">
                <div className="text-sm text-slate-400">• Autentikasi Dua Faktor</div>
                <div className="text-sm text-slate-400">• Manajemen Sesi</div>
                <div className="text-sm text-slate-400">• Token Akses API</div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <ServerIcon className="h-5 w-5 mr-2 text-purple-600" />
                Pengaturan Sistem
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">
                Konfigurasi pengaturan sistem dan integrasi.
              </p>
              <div className="space-y-2">
                <div className="text-sm text-gray-500">• Konfigurasi API BSI</div>
                <div className="text-sm text-gray-500">• Jadwal Sinkronisasi</div>
                <div className="text-sm text-gray-500">• Retensi Data</div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <BellIcon className="h-5 w-5 mr-2 text-orange-600" />
                Notifikasi
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">
                Kelola preferensi notifikasi dan peringatan.
              </p>
              <div className="space-y-2">
                <div className="text-sm text-gray-500">• Notifikasi Email</div>
                <div className="text-sm text-gray-500">• Peringatan Sinkronisasi</div>
                <div className="text-sm text-gray-500">• Notifikasi Error</div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <GlobeAltIcon className="h-5 w-5 mr-2 text-indigo-600" />
                Pengaturan Regional
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">
                Konfigurasi pengaturan bahasa, zona waktu, dan mata uang.
              </p>
              <div className="space-y-2">
                <div className="text-sm text-gray-500">• Bahasa: Indonesia</div>
                <div className="text-sm text-gray-500">• Zona Waktu: Asia/Jakarta</div>
                <div className="text-sm text-gray-500">• Mata Uang: IDR</div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <CogIcon className="h-5 w-5 mr-2 text-gray-600" />
                Pengaturan Lanjutan
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">
                Opsi konfigurasi lanjutan untuk pengguna mahir.
              </p>
              <div className="space-y-2">
                <div className="text-sm text-gray-500">• Mode Debug</div>
                <div className="text-sm text-gray-500">• Ekspor Data</div>
                <div className="text-sm text-gray-500">• Log Sistem</div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* System Information */}
        <Card>
          <CardHeader>
            <CardTitle>Informasi Sistem</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Aplikasi</h4>
                <div className="space-y-1 text-sm text-gray-600">
                  <div>Versi: 1.0.0</div>
                  <div>Build: 2025.01.001</div>
                  <div>Lingkungan: Development</div>
                </div>
              </div>
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Status Server</h4>
                <div className="space-y-1 text-sm text-gray-600">
                  <div className="flex items-center">
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                    Database: Terhubung
                  </div>
                  <div className="flex items-center">
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                    Socket.IO: Terhubung
                  </div>
                  <div className="flex items-center">
                    <div className="w-2 h-2 bg-yellow-500 rounded-full mr-2"></div>
                    BSI API: Perlu Pengujian
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  )
}