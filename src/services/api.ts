import axios, { AxiosInstance } from 'axios'
import type { 
  ApiResponse, 
  User, 
  LoginResponse, 
  Account, 
  Transaction, 
  Role, 
  Permission, 
  Bank,
  DashboardData,
  PaginationInfo
} from '@/types'

class ApiService {
  private api: AxiosInstance
  private baseURL = process.env.NEXT_PUBLIC_API_URL || 'https://cuzbsibackend.imtaqin.id'

  constructor() {
    this.api = axios.create({
      baseURL: this.baseURL,
      headers: {
        'Content-Type': 'application/json',
      },
    })

    // Request interceptor to add auth token
    this.api.interceptors.request.use(
      (config) => {
        if (typeof window !== 'undefined') {
          const token = localStorage.getItem('accessToken')
          if (token) {
            config.headers.Authorization = `Bearer ${token}`
          }
        }
        return config
      },
      (error) => Promise.reject(error)
    )

    // Response interceptor to handle token expiration
    this.api.interceptors.response.use(
      (response) => response,
      async (error) => {
        if (error.response?.status === 401 && typeof window !== 'undefined') {
          localStorage.removeItem('accessToken')
          localStorage.removeItem('refreshToken')
          localStorage.removeItem('user')
          window.location.href = '/login'
        }
        return Promise.reject(error)
      }
    )
  }

  // Authentication
  async login(email: string, password: string): Promise<ApiResponse<LoginResponse>> {
    const response = await this.api.post<ApiResponse<LoginResponse>>('/api/auth/login', {
      email,
      password,
    })
    return response.data
  }

  async logout(): Promise<ApiResponse<null>> {
    const response = await this.api.post<ApiResponse<null>>('/api/auth/logout')
    return response.data
  }

  // Dashboard
  async getDashboard(): Promise<ApiResponse<DashboardData>> {
    const response = await this.api.get<ApiResponse<DashboardData>>('/api/dashboard')
    return response.data
  }

  // Users Management
  async getUsers(params?: {
    page?: number
    limit?: number
    search?: string
  }): Promise<ApiResponse<{ users: User[]; pagination: PaginationInfo }>> {
    const response = await this.api.get<ApiResponse<{ users: User[]; pagination: PaginationInfo }>>('/api/users', {
      params,
    })
    return response.data
  }

  async getUser(id: number): Promise<ApiResponse<{ user: User }>> {
    const response = await this.api.get<ApiResponse<{ user: User }>>(`/api/users/${id}`)
    return response.data
  }

  async createUser(userData: {
    email: string
    password: string
    firstName: string
    lastName: string
    roleIds: number[]
  }): Promise<ApiResponse<{ user: User }>> {
    const response = await this.api.post<ApiResponse<{ user: User }>>('/api/users', userData)
    return response.data
  }

  async updateUser(id: number, userData: {
    email?: string
    firstName?: string
    lastName?: string
    isActive?: boolean
    roleIds?: number[]
  }): Promise<ApiResponse<{ user: User }>> {
    const response = await this.api.put<ApiResponse<{ user: User }>>(`/api/users/${id}`, userData)
    return response.data
  }

  async deleteUser(id: number): Promise<ApiResponse<null>> {
    const response = await this.api.delete<ApiResponse<null>>(`/api/users/${id}`)
    return response.data
  }


  // Roles Management
  async getRoles(params?: {
    page?: number
    limit?: number
    search?: string
    includeUsers?: boolean
  }): Promise<ApiResponse<{ roles: Role[]; pagination: PaginationInfo }>> {
    const response = await this.api.get<ApiResponse<{ roles: Role[]; pagination: PaginationInfo }>>('/api/roles', {
      params,
    })
    return response.data
  }

  async getRole(id: number): Promise<ApiResponse<{ role: Role }>> {
    const response = await this.api.get<ApiResponse<{ role: Role }>>(`/api/roles/${id}`)
    return response.data
  }

  async createRole(roleData: {
    name: string
    description: string
    permissionIds: number[]
  }): Promise<ApiResponse<{ role: Role }>> {
    const response = await this.api.post<ApiResponse<{ role: Role }>>('/api/roles', roleData)
    return response.data
  }

  async updateRole(id: number, roleData: {
    name?: string
    description?: string
    permissionIds?: number[]
  }): Promise<ApiResponse<{ role: Role }>> {
    const response = await this.api.put<ApiResponse<{ role: Role }>>(`/api/roles/${id}`, roleData)
    return response.data
  }

  async deleteRole(id: number): Promise<ApiResponse<null>> {
    const response = await this.api.delete<ApiResponse<null>>(`/api/roles/${id}`)
    return response.data
  }

  async getPermissions(): Promise<ApiResponse<{ permissions: Permission[] }>> {
    const response = await this.api.get<ApiResponse<{ permissions: Permission[] }>>('/api/permissions')
    return response.data
  }

  // Accounts Management
  async getAccounts(): Promise<ApiResponse<{ accounts: Account[] }>> {
    const response = await this.api.get<ApiResponse<{ accounts: Account[] }>>('/api/accounts')
    return response.data
  }

  async createAccount(accountData: {
    accountNumber: string
    companyId: string
    username: string
    password: string
    bankId: number
    autoSync: boolean
    isActive: boolean
  }): Promise<ApiResponse<{ account: Account }>> {
    const response = await this.api.post<ApiResponse<{ account: Account }>>('/api/accounts', accountData)
    return response.data
  }

  async updateAccount(id: number, accountData: {
    accountNumber?: string
    companyId?: string
    username?: string
    password?: string
    bankId?: number
    autoSync?: boolean
    isActive?: boolean
  }): Promise<ApiResponse<{ account: Account }>> {
    const response = await this.api.put<ApiResponse<{ account: Account }>>(`/api/accounts/${id}`, accountData)
    return response.data
  }

  async deleteAccount(id: number): Promise<ApiResponse<null>> {
    const response = await this.api.delete<ApiResponse<null>>(`/api/accounts/${id}`)
    return response.data
  }

  async createBank(bankData: {
    code: string
    name: string
    fullName: string
    country?: string
    currency?: string
    logoUrl?: string
    websiteUrl?: string
    supportedFeatures?: {
      scraping?: boolean
      realtime?: boolean
      api?: boolean
    }
    configuration?: Record<string, any>
  }): Promise<ApiResponse<{ bank: Bank }>> {
    const response = await this.api.post<ApiResponse<{ bank: Bank }>>('/api/banks', bankData)
    return response.data
  }

  async updateBank(id: number, bankData: {
    code?: string
    name?: string
    fullName?: string
    country?: string
    currency?: string
    logoUrl?: string
    websiteUrl?: string
    supportedFeatures?: {
      scraping?: boolean
      realtime?: boolean
      api?: boolean
    }
    configuration?: Record<string, any>
  }): Promise<ApiResponse<{ bank: Bank }>> {
    const response = await this.api.put<ApiResponse<{ bank: Bank }>>(`/api/banks/${id}`, bankData)
    return response.data
  }

  async deleteBank(id: number): Promise<ApiResponse<null>> {
    const response = await this.api.delete<ApiResponse<null>>(`/api/banks/${id}`)
    return response.data
  }

  async getBanks(): Promise<ApiResponse<{ banks: Bank[] }>> {
    const response = await this.api.get<ApiResponse<{ banks: Bank[] }>>('/api/banks')
    return response.data
  }

  async getAllBanks(): Promise<ApiResponse<{ banks: Bank[] }>> {
    const response = await this.api.get<ApiResponse<{ banks: Bank[] }>>('/api/banks/all')
    return response.data
  }

  // Flags Management
  async getFlags(params?: {
    page?: number
    limit?: number
    search?: string
  }): Promise<ApiResponse<{ flags: any[]; pagination: PaginationInfo }>> {
    const response = await this.api.get<ApiResponse<{ flags: any[]; pagination: PaginationInfo }>>('/api/flags', {
      params,
    })
    return response.data
  }

  async getFlag(id: number): Promise<ApiResponse<{ flag: any }>> {
    const response = await this.api.get<ApiResponse<{ flag: any }>>(`/api/flags/${id}`)
    return response.data
  }

  async createFlag(flagData: {
    name: string
    description: string
    color: string
    icon: string
    severity: string
    notificationTemplateId?: number
  }): Promise<ApiResponse<{ flag: any }>> {
    const response = await this.api.post<ApiResponse<{ flag: any }>>('/api/flags', flagData)
    return response.data
  }

  async updateFlag(id: number, flagData: {
    name?: string
    description?: string
    color?: string
    icon?: string
    severity?: string
    notificationTemplateId?: number
  }): Promise<ApiResponse<{ flag: any }>> {
    const response = await this.api.put<ApiResponse<{ flag: any }>>(`/api/flags/${id}`, flagData)
    return response.data
  }

  async deleteFlag(id: number): Promise<ApiResponse<null>> {
    const response = await this.api.delete<ApiResponse<null>>(`/api/flags/${id}`)
    return response.data
  }

  // Flag Mappings
  async getFlagMappings(params?: {
    page?: number
    limit?: number
  }): Promise<ApiResponse<{ flagMappings: any[]; pagination: PaginationInfo }>> {
    const response = await this.api.get<ApiResponse<{ flagMappings: any[]; pagination: PaginationInfo }>>('/api/flag-mappings', {
      params,
    })
    return response.data
  }

  async upsertFlagMapping(data: {
    transactionId: number
    flagId: number
    notes?: string
  }): Promise<ApiResponse<{ flagMapping: any }>> {
    const response = await this.api.post<ApiResponse<{ flagMapping: any }>>('/api/flag-mappings', data)
    return response.data
  }

  async updateFlagMapping(id: number, data: {
    flagId?: number
    notes?: string
  }): Promise<ApiResponse<{ flagMapping: any }>> {
    const response = await this.api.put<ApiResponse<{ flagMapping: any }>>(`/api/flag-mappings/${id}`, data)
    return response.data
  }

  async deleteFlagMapping(id: number): Promise<ApiResponse<null>> {
    const response = await this.api.delete<ApiResponse<null>>(`/api/flag-mappings/${id}`)
    return response.data
  }

  // Cron Schedules
  async getCronSchedules(params?: {
    page?: number
    limit?: number
  }): Promise<ApiResponse<{ schedules: any[]; pagination: PaginationInfo }>> {
    const response = await this.api.get<ApiResponse<{ schedules: any[]; pagination: PaginationInfo }>>('/api/cron-schedules', {
      params,
    })
    return response.data
  }

  async getCronScheduleStats(): Promise<ApiResponse<{ stats: any }>> {
    const response = await this.api.get<ApiResponse<{ stats: any }>>('/api/cron-schedules/stats')
    return response.data
  }

  async getCronSchedule(id: number): Promise<ApiResponse<{ schedule: any }>> {
    const response = await this.api.get<ApiResponse<{ schedule: any }>>(`/api/cron-schedules/${id}`)
    return response.data
  }

  async getAccountSchedule(accountId: number): Promise<ApiResponse<{ schedule: any }>> {
    const response = await this.api.get<ApiResponse<{ schedule: any }>>(`/api/accounts/${accountId}/schedule`)
    return response.data
  }

  async upsertSchedule(accountId: number, data: {
    cronExpression: string
    enabled: boolean
    description?: string
  }): Promise<ApiResponse<{ schedule: any }>> {
    const response = await this.api.post<ApiResponse<{ schedule: any }>>(`/api/accounts/${accountId}/schedule`, data)
    return response.data
  }

  async updateCronSchedule(id: number, data: {
    cronExpression?: string
    enabled?: boolean
    description?: string
  }): Promise<ApiResponse<{ schedule: any }>> {
    const response = await this.api.put<ApiResponse<{ schedule: any }>>(`/api/cron-schedules/${id}`, data)
    return response.data
  }

  async toggleCronSchedule(id: number): Promise<ApiResponse<{ schedule: any }>> {
    const response = await this.api.patch<ApiResponse<{ schedule: any }>>(`/api/cron-schedules/${id}/toggle`)
    return response.data
  }

  async deleteCronSchedule(id: number): Promise<ApiResponse<null>> {
    const response = await this.api.delete<ApiResponse<null>>(`/api/cron-schedules/${id}`)
    return response.data
  }

  // Notification Templates
  async getNotificationTemplates(params?: {
    page?: number
    limit?: number
  }): Promise<ApiResponse<{ templates: any[]; pagination: PaginationInfo }>> {
    const response = await this.api.get<ApiResponse<{ templates: any[]; pagination: PaginationInfo }>>('/api/notification-templates', {
      params,
    })
    return response.data
  }

  async getTemplateVariables(): Promise<ApiResponse<{ variables: string[] }>> {
    const response = await this.api.get<ApiResponse<{ variables: string[] }>>('/api/notification-templates/variables')
    return response.data
  }

  async getNotificationTemplate(id: number): Promise<ApiResponse<{ template: any }>> {
    const response = await this.api.get<ApiResponse<{ template: any }>>(`/api/notification-templates/${id}`)
    return response.data
  }

  async getTemplateByFlag(flagId: number): Promise<ApiResponse<{ template: any }>> {
    const response = await this.api.get<ApiResponse<{ template: any }>>(`/api/notification-templates/flag/${flagId}`)
    return response.data
  }

  async createNotificationTemplate(data: {
    name: string
    message: string
    isActive?: boolean
  }): Promise<ApiResponse<{ template: any }>> {
    const response = await this.api.post<ApiResponse<{ template: any }>>('/api/notification-templates', data)
    return response.data
  }

  async updateNotificationTemplate(id: number, data: {
    name?: string
    message?: string
    isActive?: boolean
  }): Promise<ApiResponse<{ template: any }>> {
    const response = await this.api.put<ApiResponse<{ template: any }>>(`/api/notification-templates/${id}`, data)
    return response.data
  }

  async deleteNotificationTemplate(id: number): Promise<ApiResponse<null>> {
    const response = await this.api.delete<ApiResponse<null>>(`/api/notification-templates/${id}`)
    return response.data
  }

  async previewTemplate(id: number, data: {
    transactionId?: number
    testData?: Record<string, any>
  }): Promise<ApiResponse<{ preview: string }>> {
    const response = await this.api.post<ApiResponse<{ preview: string }>>(`/api/notification-templates/${id}/preview`, data)
    return response.data
  }

  // BSI API
  async getBsiDashboard(): Promise<ApiResponse<{ dashboard: any }>> {
    const response = await this.api.get<ApiResponse<{ dashboard: any }>>('/api/bsi/dashboard')
    return response.data
  }

  async getBsiTransactions(params?: {
    page?: number
    limit?: number
  }): Promise<ApiResponse<{ transactions: any[]; pagination: PaginationInfo }>> {
    const response = await this.api.get<ApiResponse<{ transactions: any[]; pagination: PaginationInfo }>>('/api/bsi/transactions', {
      params,
    })
    return response.data
  }

  async getBsiTransaction(id: number): Promise<ApiResponse<{ transaction: any }>> {
    const response = await this.api.get<ApiResponse<{ transaction: any }>>(`/api/bsi/transactions/${id}`)
    return response.data
  }

  async saveBsiAccount(data: {
    bankId: number
    accountNumber: string
    accountName: string
    username: string
    password: string
    pin: string
  }): Promise<ApiResponse<{ account: any }>> {
    const response = await this.api.post<ApiResponse<{ account: any }>>('/api/bsi/accounts', data)
    return response.data
  }

  async updateBsiAccount(id: number, data: {
    accountName?: string
    username?: string
    password?: string
  }): Promise<ApiResponse<{ account: any }>> {
    const response = await this.api.put<ApiResponse<{ account: any }>>(`/api/bsi/accounts/${id}`, data)
    return response.data
  }

  async getBsiScrapingOption(accountId: number): Promise<ApiResponse<{ option: any }>> {
    const response = await this.api.get<ApiResponse<{ option: any }>>(`/api/bsi/accounts/${accountId}/scraping`)
    return response.data
  }

  async updateBsiScrapingOption(accountId: number, data: {
    isActive?: boolean
    cronExpression?: string
    lookbackDays?: number
    maxRetries?: number
    browserType?: 'chrome' | 'firefox'
    daysOfWeek?: string
    throttleTime?: number
  }): Promise<ApiResponse<{ option: any }>> {
    const response = await this.api.put<ApiResponse<{ option: any }>>(`/api/bsi/accounts/${accountId}/scraping`, data)
    return response.data
  }

  async triggerBsiSync(accountId: number): Promise<ApiResponse<{ sync: any }>> {
    const response = await this.api.post<ApiResponse<{ sync: any }>>(`/api/bsi/accounts/${accountId}/sync`)
    return response.data
  }

  async syncAllBsiAccounts(): Promise<ApiResponse<{ sync: any }>> {
    const response = await this.api.post<ApiResponse<{ sync: any }>>('/api/bsi/accounts/sync-all')
    return response.data
  }

  async flagBsiTransaction(id: number, data: {
    flagId: number
    notes?: string
  }): Promise<ApiResponse<null>> {
    const response = await this.api.post<ApiResponse<null>>(`/api/bsi/transactions/${id}/flag`, data)
    return response.data
  }

  async getBsiFlagMappings(): Promise<ApiResponse<{ mappings: any[] }>> {
    const response = await this.api.get<ApiResponse<{ mappings: any[] }>>('/api/bsi/flag-mappings')
    return response.data
  }

  async removeBsiFlagMapping(transactionId: number): Promise<ApiResponse<null>> {
    const response = await this.api.delete<ApiResponse<null>>(`/api/bsi/flag-mappings?transactionId=${transactionId}`)
    return response.data
  }

  // Settings
  async getSettings(): Promise<ApiResponse<{ settings: any }>> {
    const response = await this.api.get<ApiResponse<{ settings: any }>>('/api/settings')
    return response.data
  }

  async updateProfile(data: {
    firstName?: string
    lastName?: string
    phone?: string
    avatar?: string
  }): Promise<ApiResponse<{ user: User }>> {
    const response = await this.api.put<ApiResponse<{ user: User }>>('/api/settings/profile', data)
    return response.data
  }

  async changePassword(data: {
    currentPassword: string
    newPassword: string
    confirmPassword: string
  }): Promise<ApiResponse<null>> {
    const response = await this.api.post<ApiResponse<null>>('/api/settings/change-password', data)
    return response.data
  }

  async updateEmailPreferences(data: {
    emailNotifications?: boolean
    transactionAlerts?: boolean
    weeklyReports?: boolean
  }): Promise<ApiResponse<null>> {
    const response = await this.api.put<ApiResponse<null>>('/api/settings/email-preferences', data)
    return response.data
  }

  async updateSecuritySettings(data: {
    twoFactorEnabled?: boolean
    sessionTimeout?: number
  }): Promise<ApiResponse<null>> {
    const response = await this.api.put<ApiResponse<null>>('/api/settings/security', data)
    return response.data
  }

  async updateSystemSettings(data: {
    theme?: string
    language?: string
  }): Promise<ApiResponse<null>> {
    const response = await this.api.put<ApiResponse<null>>('/api/settings/system', data)
    return response.data
  }

  async updateNotificationSettings(data: {
    pushNotifications?: boolean
    soundEnabled?: boolean
  }): Promise<ApiResponse<null>> {
    const response = await this.api.put<ApiResponse<null>>('/api/settings/notifications', data)
    return response.data
  }

  async updateRegionalSettings(data: {
    timezone?: string
    dateFormat?: string
    currency?: string
  }): Promise<ApiResponse<null>> {
    const response = await this.api.put<ApiResponse<null>>('/api/settings/regional', data)
    return response.data
  }

  async updateAdvancedSettings(data: {
    debugMode?: boolean
    apiRateLimit?: number
  }): Promise<ApiResponse<null>> {
    const response = await this.api.put<ApiResponse<null>>('/api/settings/advanced', data)
    return response.data
  }

  async exportData(data: {
    format?: string
    includeTransactions?: boolean
    includeAccounts?: boolean
  }): Promise<ApiResponse<{ exportUrl: string }>> {
    const response = await this.api.post<ApiResponse<{ exportUrl: string }>>('/api/settings/export-data', data)
    return response.data
  }

  // Transactions
  async getTransactions(params?: {
    page?: number
    limit?: number
    accountId?: number
    startDate?: string
    endDate?: string
    type?: string
    flag?: string
  }): Promise<ApiResponse<{ 
    transactions: Transaction[]
    accounts: Account[]
    flags: string[]
    pagination: PaginationInfo
    filters: Record<string, unknown>
  }>> {
    const response = await this.api.get<ApiResponse<{
      transactions: Transaction[]
      accounts: Account[]
      flags: string[]
      pagination: PaginationInfo
      filters: Record<string, unknown>
    }>>('/api/transactions', { params })
    return response.data
  }

  async getFlaggedTransactions(params?: {
    page?: number
    limit?: number
  }): Promise<ApiResponse<{ transactions: any[]; pagination: PaginationInfo }>> {
    const response = await this.api.get<ApiResponse<{ transactions: any[]; pagination: PaginationInfo }>>('/api/transactions/flagged', {
      params,
    })
    return response.data
  }

  async getTransactionFlags(): Promise<ApiResponse<{ flags: any[] }>> {
    const response = await this.api.get<ApiResponse<{ flags: any[] }>>('/api/transactions/flags')
    return response.data
  }

  async flagTransaction(id: number, data: {
    flagId: number
    notes?: string
  }): Promise<ApiResponse<null>> {
    const response = await this.api.post<ApiResponse<null>>(`/api/transactions/${id}/flag`, data)
    return response.data
  }

  async updateTransactionFlag(id: number, data: {
    flagId?: number
    notes?: string
  }): Promise<ApiResponse<null>> {
    const response = await this.api.put<ApiResponse<null>>(`/api/transactions/${id}/flag`, data)
    return response.data
  }

  // BSI Sync
  async syncAccount(accountId: number, params?: {
    startDate?: string
    endDate?: string
    enablePreview?: boolean
  }): Promise<ApiResponse<{
    syncId: string
    accountId: number
    socketRoom: string
    dateRange: { startDate?: string; endDate?: string }
    previewEnabled?: boolean
  }>> {
    const response = await this.api.post<ApiResponse<{
      syncId: string
      accountId: number
      socketRoom: string
      dateRange: { startDate?: string; endDate?: string }
    }>>(`/api/bsi/accounts/${accountId}/sync`, {}, { params })
    return response.data
  }

  async syncAllAccounts(params?: {
    startDate?: string
    endDate?: string
    enablePreview?: boolean
  }): Promise<ApiResponse<{
    syncId: string
    socketRoom: string
    accountCount: number
    accountIds: number[]
    dateRange: { startDate?: string; endDate?: string }
    previewEnabled?: boolean
  }>> {
    const response = await this.api.post<ApiResponse<{
      syncId: string
      socketRoom: string
      accountCount: number
      accountIds: number[]
      dateRange: { startDate?: string; endDate?: string }
    }>>('/api/bsi/accounts/sync-all', {}, { params })
    return response.data
  }

  // Profile
  async getProfile(): Promise<ApiResponse<{ user: User }>> {
    const response = await this.api.get<ApiResponse<{ user: User }>>('/api/profile')
    return response.data
  }

  // Activity Logs and Notifications
  async getActivityLogs(params?: {
    page?: number
    limit?: number
    accountId?: number
    status?: string
    action?: string
  }): Promise<ApiResponse<{
    logs: any[]
    pagination: PaginationInfo
  }>> {
    const response = await this.api.get<ApiResponse<{ logs: any[]; pagination: PaginationInfo }>>('/api/notifications/activity-logs', {
      params,
    })
    return response.data
  }

  async getActivityStats(params?: {
    period?: string
    accountId?: number
  }): Promise<ApiResponse<{
    data: {
      period: string
      totalCount: number
      statsByAction: Record<string, number>
      statsByStatus: Record<string, number>
    }
  }>> {
    const response = await this.api.get<ApiResponse<{ data: any }>>('/api/notifications/activity-stats', {
      params,
    })
    return response.data
  }

  // Notification Read Status Endpoints
  async getUnreadNotifications(params?: {
    accountId?: number
    limit?: number
  }): Promise<ApiResponse<{
    count: number
    notifications: any[]
  }>> {
    const response = await this.api.get<ApiResponse<{ count: number; notifications: any[] }>>('/api/notifications/unread', {
      params,
    })
    return response.data
  }

  async markNotificationAsRead(id: number): Promise<ApiResponse<{
    id: number
    isRead: boolean
    readAt: string
  }>> {
    const response = await this.api.patch<ApiResponse<{ id: number; isRead: boolean; readAt: string }>>(`/api/notifications/${id}/mark-read`)
    return response.data
  }

  async markAllNotificationsAsRead(accountId?: number): Promise<ApiResponse<{
    updatedCount: number
    timestamp: string
  }>> {
    const response = await this.api.patch<ApiResponse<{ updatedCount: number; timestamp: string }>>('/api/notifications/mark-all-read', {}, {
      params: accountId ? { accountId } : undefined,
    })
    return response.data
  }

  async markNotificationAsUnread(id: number): Promise<ApiResponse<{
    id: number
    isRead: boolean
    readAt: string | null
  }>> {
    const response = await this.api.patch<ApiResponse<{ id: number; isRead: boolean; readAt: string | null }>>(`/api/notifications/${id}/mark-unread`)
    return response.data
  }

  async getNotificationStatusSummary(params?: {
    accountId?: number
    period?: string
  }): Promise<ApiResponse<{
    data: {
      total: number
      read: number
      unread: number
      readPercentage: number
      period: string
      lastNotificationDate: string
      statusByAction: Record<string, any>
      dateRange: { startDate: string; endDate: string }
    }
  }>> {
    const response = await this.api.get<ApiResponse<{ data: any }>>('/api/notifications/status-summary', {
      params,
    })
    return response.data
  }

  // Google Sheets
  async getGoogleSheets(): Promise<ApiResponse<{ configs: any[] }>> {
    const response = await this.api.get<ApiResponse<{ configs: any[] }>>('/api/google-sheets')
    return response.data
  }

  async getGoogleSheet(id: number): Promise<ApiResponse<{ config: any }>> {
    const response = await this.api.get<ApiResponse<{ config: any }>>(`/api/google-sheets/${id}`)
    return response.data
  }

  async createGoogleSheet(data: any): Promise<ApiResponse<{ config: any }>> {
    const response = await this.api.post<ApiResponse<{ config: any }>>('/api/google-sheets', data)
    return response.data
  }

  async updateGoogleSheet(id: number, data: any): Promise<ApiResponse<{ config: any }>> {
    const response = await this.api.put<ApiResponse<{ config: any }>>(`/api/google-sheets/${id}`, data)
    return response.data
  }

  async deleteGoogleSheet(id: number): Promise<ApiResponse<any>> {
    const response = await this.api.delete<ApiResponse<any>>(`/api/google-sheets/${id}`)
    return response.data
  }

  async testGoogleSheet(id: number): Promise<ApiResponse<{ message: string }>> {
    const response = await this.api.post<ApiResponse<{ message: string }>>(`/api/google-sheets/${id}/test`)
    return response.data
  }

  async syncGoogleSheet(id: number, data: { transactionIds?: number[] }): Promise<ApiResponse<{ syncedCount: number }>> {
    const response = await this.api.post<ApiResponse<{ syncedCount: number }>>(`/api/google-sheets/${id}/sync`, data)
    return response.data
  }

  async getGoogleSheetHistory(id: number): Promise<ApiResponse<{ history: any[] }>> {
    const response = await this.api.get<ApiResponse<{ history: any[] }>>(`/api/google-sheets/${id}/history`)
    return response.data
  }

  async toggleGoogleSheet(id: number): Promise<ApiResponse<{ config: any }>> {
    const response = await this.api.patch<ApiResponse<{ config: any }>>(`/api/google-sheets/${id}/toggle`)
    return response.data
  }

  // API Keys Management
  async getApiKeys(params?: { serviceName?: string; isActive?: boolean; page?: number; limit?: number }): Promise<ApiResponse<{ apiKeys: any[] }>> {
    const response = await this.api.get<ApiResponse<{ apiKeys: any[] }>>('/api/api-keys', { params })
    return response.data
  }

  async getApiKeyServices(): Promise<ApiResponse<{ services: any[] }>> {
    const response = await this.api.get<ApiResponse<{ services: any[] }>>('/api/api-keys/services')
    return response.data
  }

  async getApiKeyStats(): Promise<ApiResponse<any>> {
    const response = await this.api.get<ApiResponse<any>>('/api/api-keys/stats')
    return response.data
  }

  async getApiKey(id: number): Promise<ApiResponse<{ apiKey: any }>> {
    const response = await this.api.get<ApiResponse<{ apiKey: any }>>(`/api/api-keys/${id}`)
    return response.data
  }

  async createApiKey(data: any): Promise<ApiResponse<{ apiKey: any }>> {
    const response = await this.api.post<ApiResponse<{ apiKey: any }>>('/api/api-keys', data)
    return response.data
  }

  async updateApiKey(id: number, data: any): Promise<ApiResponse<{ apiKey: any }>> {
    const response = await this.api.put<ApiResponse<{ apiKey: any }>>(`/api/api-keys/${id}`, data)
    return response.data
  }

  async deleteApiKey(id: number): Promise<ApiResponse<any>> {
    const response = await this.api.delete<ApiResponse<any>>(`/api/api-keys/${id}`)
    return response.data
  }

  async setApiKeyPrimary(id: number): Promise<ApiResponse<{ apiKey: any }>> {
    const response = await this.api.patch<ApiResponse<{ apiKey: any }>>(`/api/api-keys/${id}/set-primary`)
    return response.data
  }

  async toggleApiKey(id: number): Promise<ApiResponse<{ apiKey: any }>> {
    const response = await this.api.patch<ApiResponse<{ apiKey: any }>>(`/api/api-keys/${id}/toggle`)
    return response.data
  }
}

export const apiService = new ApiService()
export default apiService