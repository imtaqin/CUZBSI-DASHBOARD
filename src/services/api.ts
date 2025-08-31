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
  private baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5543'

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

  async changePassword(id: number, passwords: {
    currentPassword: string
    newPassword: string
  }): Promise<ApiResponse<null>> {
    const response = await this.api.patch<ApiResponse<null>>(`/api/users/${id}/password`, passwords)
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

  async getBanks(): Promise<ApiResponse<{ banks: Bank[] }>> {
    const response = await this.api.get<ApiResponse<{ banks: Bank[] }>>('/api/banks')
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

  async flagTransaction(id: number, flag: string): Promise<ApiResponse<null>> {
    const response = await this.api.put(`/transactions/${id}/flag`, { flag })
    return response.data
  }

  async updateTransactionFlag(id: number, data: {
    flagId?: string
    notes?: string
  }): Promise<ApiResponse<null>> {
    const response = await this.api.put(`/transactions/${id}/flag`, data)
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
}

export const apiService = new ApiService()
export default apiService