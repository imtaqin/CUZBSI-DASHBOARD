export interface User {
  id: number
  email: string
  firstName: string
  lastName: string
  isActive: boolean
  createdAt: string
  Roles: Role[]
}

export interface Role {
  id: number
  name: string
  description: string
  createdAt?: string
  Permissions?: Permission[]
  Users?: User[]
}

export interface Permission {
  id: number
  name: string
  description: string
}

export interface Bank {
  id: number
  name: string
  code: string
  fullName: string
  isActive: boolean
}

export interface Account {
  id: number
  accountNumber: string
  companyId: string
  username: string
  isActive: boolean
  lastBalance: string
  createdAt: string
  Bank: Bank
  ScrapingOption?: ScrapingOption
}

export interface ScrapingOption {
  id: number
  accountId: number
  isActive: boolean
  cronExpression: string
  browserType: string
  maxRetries: number
  lastStatus: string
  lastRun: string
  errorMessage?: string
}

export interface Transaction {
  id: number
  tanggal: string
  description: string
  Currency: string
  Amount: string
  type: 'Kredit' | 'Debit'
  Balance: string
  unique: string
  flag?: string
  Account: {
    id: number
    accountNumber: string
    Bank: {
      name: string
    }
  }
}

export interface DashboardStats {
  totalAccounts: number
  activeAccounts: number
  totalTransactions: number
  todayTransactions: number
  flaggedTransactions: number
  totalBalance: number
  newFlags: number
}

export interface ChartData {
  transactionDates: string[]
  transactionCounts: number[]
  balanceLabels: string[]
  balanceData: number[]
}

export interface DashboardData {
  stats: DashboardStats
  accounts: Account[]
  recentTransactions: Transaction[]
  chartData: ChartData
}

export interface PaginationInfo {
  page: number
  limit: number
  total: number
  totalPages: number
}

export interface ApiResponse<T> {
  success: boolean
  message: string
  data: T
}

export interface LoginResponse {
  user: User
  accessToken: string
  refreshToken: string
}

// Socket.IO Event Types
export interface SyncEvent {
  syncId: string
  timestamp: string
  message: string
  data?: unknown
}

export interface SyncStartedEvent extends SyncEvent {
  accountId?: number
  socketRoom: string
  accountCount?: number
}

export interface SyncProgressEvent extends SyncEvent {
  progress?: {
    current: number
    total: number
    percentage: number
  }
  accountId?: number
  status?: string
}

export interface SyncCompletedEvent extends SyncEvent {
  success: boolean
  summary?: unknown
}

export interface SyncErrorEvent extends SyncEvent {
  error: string
}

// Additional types for new features
export interface Flag {
  id: number
  name: string
  description: string
  color: string
  icon: string
  severity: 'low' | 'medium' | 'high'
  notificationTemplateId?: number
  createdAt: string
  updatedAt?: string
}

export interface FlagMapping {
  id: number
  transactionId: number
  flagId: number
  notes?: string
  createdAt: string
  updatedAt?: string
  transaction?: Transaction
  flag?: Flag
}

export interface CronSchedule {
  id: number
  accountId?: number
  cronExpression: string
  enabled: boolean
  description?: string
  lastRun?: string
  nextRun?: string
  status?: string
  createdAt: string
  updatedAt?: string
  account?: Account
}

export interface NotificationTemplate {
  id: number
  name: string
  message: string
  isActive: boolean
  createdAt: string
  updatedAt?: string
}

export interface BsiTransaction {
  id: number
  tanggal: string
  description: string
  Amount: string
  type: 'Kredit' | 'Debit'
  Balance: string
  flag?: string
  accountId?: number
  createdAt?: string
}

export interface BsiDashboard {
  totalAccounts: number
  activeAccounts: number
  totalTransactions: number
  todayTransactions: number
  flaggedTransactions: number
  totalBalance: number
  recentTransactions: BsiTransaction[]
}

export interface UserSettings {
  profile?: {
    firstName?: string
    lastName?: string
    phone?: string
    avatar?: string
  }
  email?: {
    emailNotifications?: boolean
    transactionAlerts?: boolean
    weeklyReports?: boolean
  }
  security?: {
    twoFactorEnabled?: boolean
    sessionTimeout?: number
  }
  system?: {
    theme?: string
    language?: string
  }
  notifications?: {
    pushNotifications?: boolean
    soundEnabled?: boolean
  }
  regional?: {
    timezone?: string
    dateFormat?: string
    currency?: string
  }
  advanced?: {
    debugMode?: boolean
    apiRateLimit?: number
  }
}