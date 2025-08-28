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