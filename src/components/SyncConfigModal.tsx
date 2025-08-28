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
      title={`Configure Sync - ${syncType === 'all' ? 'All Accounts' : accountName}`}
      size="lg"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Sync Type Info */}
        <div className="bg-slate-800 p-4 rounded-lg border border-slate-600">
          <div className="flex items-center">
            <RocketLaunchIcon className="h-8 w-8 text-blue-500 mr-3" />
            <div>
              <h3 className="text-lg font-medium text-white">
                {syncType === 'all' ? 'Bulk Account Sync' : 'Single Account Sync'}
              </h3>
              <p className="text-sm text-slate-400 mt-1">
                {syncType === 'all' 
                  ? 'Sync all accounts with the selected configuration'
                  : `Sync account: ${accountName}`
                }
              </p>
            </div>
          </div>
        </div>

        {/* Date Range Configuration */}
        <div className="space-y-4">
          <div className="flex items-center">
            <CalendarDaysIcon className="h-5 w-5 text-blue-400 mr-2" />
            <h4 className="text-sm font-medium text-slate-300">Date Range (Optional)</h4>
          </div>
          
          {/* Quick Presets */}
          <div className="grid grid-cols-3 gap-2">
            <Button
              type="button"
              variant={selectedPreset === 'today' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setQuickDate('today')}
              className="text-xs"
              disabled={selectedPreset !== null && selectedPreset !== 'today'}
            >
              Today
            </Button>
            <Button
              type="button"
              variant={selectedPreset === 'week' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setQuickDate('week')}
              className="text-xs"
              disabled={selectedPreset !== null && selectedPreset !== 'week'}
            >
              Last 7 Days
            </Button>
            <Button
              type="button"
              variant={selectedPreset === 'month' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setQuickDate('month')}
              className="text-xs"
              disabled={selectedPreset !== null && selectedPreset !== 'month'}
            >
              Last 30 Days
            </Button>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              type="date"
              label="Start Date"
              {...register('startDate')}
              error={errors.startDate?.message}
            />
            <Input
              type="date"
              label="End Date"
              {...register('endDate')}
              error={errors.endDate?.message}
            />
          </div>

          <div className="bg-blue-900/20 border border-blue-600/30 rounded-lg p-3">
            <div className="flex">
              <InformationCircleIcon className="h-5 w-5 text-blue-400 mr-2 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm text-blue-300 mb-1">Date Range Info</p>
                <p className="text-xs text-blue-200">
                  Leave empty to sync all available transactions. Date range helps focus on specific periods 
                  and reduces sync time for large accounts.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Preview Configuration */}
        <div className="space-y-4">
          <div className="flex items-center">
            <CameraIcon className="h-5 w-5 text-green-400 mr-2" />
            <h4 className="text-sm font-medium text-slate-300">Real-time Preview</h4>
          </div>

          <div className="space-y-3">
            <label className="flex items-center space-x-3 p-4 rounded-lg border border-slate-600 hover:border-slate-500 cursor-pointer transition-colors">
              <input
                type="checkbox"
                {...register('enablePreview')}
                className="rounded border-slate-600 bg-slate-700 text-blue-600 focus:ring-blue-500"
              />
              <div className="flex-1">
                <div className="flex items-center">
                  <CameraIcon className="h-4 w-4 text-green-400 mr-2" />
                  <span className="text-sm font-medium text-white">Enable Screenshot Preview</span>
                </div>
                <p className="text-xs text-slate-400 mt-1">
                  View real-time screenshots of the automation process (captures every 0.5 seconds)
                </p>
              </div>
            </label>

            {watchEnablePreview && (
              <div className="bg-green-900/20 border border-green-600/30 rounded-lg p-3 animate-in slide-in-from-top-2">
                <div className="flex">
                  <CameraIcon className="h-5 w-5 text-green-400 mr-2 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-green-300 mb-2">Preview Features:</p>
                    <ul className="text-xs text-green-200 space-y-1">
                      <li>• Live screenshots every 500ms during automation</li>
                      <li>• Real-time browser interaction visualization</li>
                      <li>• Monitor CAPTCHA solving and form filling</li>
                      <li>• Debug sync issues visually</li>
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {!watchEnablePreview && (
              <div className="bg-yellow-900/20 border border-yellow-600/30 rounded-lg p-3">
                <div className="flex">
                  <ExclamationTriangleIcon className="h-5 w-5 text-yellow-500 mr-2 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-yellow-400">Preview Disabled</p>
                    <p className="text-xs text-yellow-300 mt-1">
                      You won't see real-time screenshots. Enable preview to monitor the automation process visually.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Performance Impact Notice */}
        <div className="bg-slate-800 border border-slate-600 rounded-lg p-3">
          <div className="flex">
            <ClockIcon className="h-5 w-5 text-slate-400 mr-2 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-slate-300 mb-1">Performance Considerations</p>
              <ul className="text-xs text-slate-400 space-y-1">
                <li>• Preview mode may slightly increase sync time due to screenshot processing</li>
                <li>• Date ranges help reduce sync duration and server load</li>
                <li>• Large date ranges with preview enabled may consume more bandwidth</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-600">
          <div className="text-xs text-slate-400">
            {syncType === 'all' ? 'This will sync all accounts' : 'This will sync the selected account'} with your configuration
          </div>
          <div className="flex space-x-3">
            <Button 
              type="button" 
              variant="outline" 
              onClick={handleClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              className="bg-blue-600 hover:bg-blue-700"
              disabled={isSubmitting}
            >
              <RocketLaunchIcon className="h-4 w-4 mr-2" />
              {isSubmitting ? 'Starting...' : 'Start Sync'}
            </Button>
          </div>
        </div>
      </form>
    </Modal>
  )
}