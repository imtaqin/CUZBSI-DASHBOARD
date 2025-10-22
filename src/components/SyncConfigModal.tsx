'use client'

import { useState } from 'react'
import { Modal, Button, Input } from '@/components/ui'
import { useForm } from 'react-hook-form'
import { 
  CalendarDaysIcon,
  CameraIcon,
  RocketLaunchIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  ClockIcon
} from '@heroicons/react/24/outline'

export interface SyncConfig {
  startDate?: string
  endDate?: string
  enablePreview: boolean
}

interface SyncConfigModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: (config: SyncConfig) => void
  syncType: 'single' | 'all'
  accountName?: string
  isSubmitting?: boolean
}

export function SyncConfigModal({ 
  isOpen, 
  onClose, 
  onConfirm, 
  syncType, 
  accountName,
  isSubmitting = false 
}: SyncConfigModalProps) {
  const [selectedPreset, setSelectedPreset] = useState<'today' | 'week' | 'month' | null>(null)
  const { register, handleSubmit, watch, setValue, formState: { errors }, reset } = useForm<SyncConfig>({
    defaultValues: {
      enablePreview: true
    }
  })

  const watchEnablePreview = watch('enablePreview')

  const onSubmit = (data: SyncConfig) => {
    // Convert dates to DD/MM/YYYY format if provided
    const config: SyncConfig = {
      ...data,
      startDate: data.startDate ? formatDateForAPI(data.startDate) : undefined,
      endDate: data.endDate ? formatDateForAPI(data.endDate) : undefined
    }
    onConfirm(config)
  }

  const formatDateForAPI = (dateString: string) => {
    // Convert from YYYY-MM-DD to DD/MM/YYYY
    const [year, month, day] = dateString.split('-')
    return `${day}/${month}/${year}`
  }

  const handleClose = () => {
    reset()
    setSelectedPreset(null)
    onClose()
  }

  // Quick date presets
  const setQuickDate = (preset: 'today' | 'week' | 'month') => {
    const today = new Date()
    const startDate = new Date()

    switch (preset) {
      case 'today':
        break
      case 'week':
        startDate.setDate(today.getDate() - 7)
        break
      case 'month':
        startDate.setDate(today.getDate() - 30)
        break
    }

    // Set form values using setValue
    const startDateStr = startDate.toISOString().split('T')[0]
    const endDateStr = today.toISOString().split('T')[0]
    
    setValue('startDate', startDateStr)
    setValue('endDate', endDateStr)
    setSelectedPreset(preset)
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Configure Sync"
      size="md"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Compact Sync Info */}
        <div className="bg-slate-50 rounded-md p-3 border border-slate-200">
          <div className="flex items-center gap-2 text-sm">
            <RocketLaunchIcon className="h-4 w-4 text-blue-600" />
            <span className="font-medium text-slate-900">
              {syncType === 'all' ? 'Sync All Accounts' : accountName}
            </span>
          </div>
        </div>

        {/* Compact Date Range */}
        <div className="space-y-3">
          <label className="text-sm font-medium text-slate-700 flex items-center gap-1.5">
            <CalendarDaysIcon className="h-4 w-4" />
            Date Range (Optional)
          </label>

          {/* Quick Presets */}
          <div className="grid grid-cols-3 gap-2">
            <Button
              type="button"
              variant={selectedPreset === 'today' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setQuickDate('today')}
              className="text-xs h-8"
            >
              Today
            </Button>
            <Button
              type="button"
              variant={selectedPreset === 'week' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setQuickDate('week')}
              className="text-xs h-8"
            >
              7 Days
            </Button>
            <Button
              type="button"
              variant={selectedPreset === 'month' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setQuickDate('month')}
              className="text-xs h-8"
            >
              30 Days
            </Button>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Input
              type="date"
              label="Start"
              {...register('startDate')}
              error={errors.startDate?.message}
            />
            <Input
              type="date"
              label="End"
              {...register('endDate')}
              error={errors.endDate?.message}
            />
          </div>
        </div>

        {/* Compact Preview Toggle */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700 flex items-center gap-1.5">
            <CameraIcon className="h-4 w-4" />
            Preview Options
          </label>

          <label className="flex items-center gap-3 p-3 rounded-md border border-slate-200 hover:border-slate-300 cursor-pointer bg-white">
            <input
              type="checkbox"
              {...register('enablePreview')}
              className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
            />
            <div className="flex-1">
              <span className="text-sm font-medium text-slate-900">Enable Live Preview</span>
              <p className="text-xs text-slate-500 mt-0.5">
                Real-time screenshots (captures every 0.5s)
              </p>
            </div>
          </label>

          {watchEnablePreview && (
            <div className="bg-green-50 border border-green-200 rounded-md p-2.5 text-xs text-green-700">
              <p className="font-medium mb-1">Preview enabled:</p>
              <p>Live screenshots • CAPTCHA monitoring • Visual debugging</p>
            </div>
          )}
        </div>

        {/* Compact Info */}
        <div className="bg-blue-50 border border-blue-200 rounded-md p-2.5 text-xs text-blue-700">
          <InformationCircleIcon className="h-4 w-4 inline mr-1" />
          Leave dates empty to sync all transactions. Preview may increase sync time.
        </div>

        {/* Compact Action Buttons */}
        <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleClose}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            size="sm"
            disabled={isSubmitting}
          >
            <RocketLaunchIcon className="h-4 w-4 mr-1" />
            {isSubmitting ? 'Starting...' : 'Start Sync'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}