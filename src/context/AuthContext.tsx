'use client'

import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react'
import { User, LoginResponse } from '@/types'
import { apiService } from '@/services/api'

interface AuthState {
  user: User | null
  accessToken: string | null
  refreshToken: string | null
  isLoading: boolean
  isAuthenticated: boolean
}

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
  updateUser: (user: User) => void
}

type AuthAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'LOGIN_SUCCESS'; payload: LoginResponse }
  | { type: 'LOGOUT' }
  | { type: 'UPDATE_USER'; payload: User }
  | { type: 'SET_INITIAL_STATE'; payload: { user: User; accessToken: string; refreshToken: string } }

const initialState: AuthState = {
  user: null,
  accessToken: null,
  refreshToken: null,
  isLoading: true,
  isAuthenticated: false,
}

function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload }
    
    case 'LOGIN_SUCCESS':
      return {
        ...state,
        user: action.payload.user,
        accessToken: action.payload.accessToken,
        refreshToken: action.payload.refreshToken,
        isAuthenticated: true,
        isLoading: false,
      }
    
    case 'LOGOUT':
      return {
        ...initialState,
        isLoading: false,
      }
    
    case 'UPDATE_USER':
      return {
        ...state,
        user: action.payload,
      }
    
    case 'SET_INITIAL_STATE':
      return {
        ...state,
        user: action.payload.user,
        accessToken: action.payload.accessToken,
        refreshToken: action.payload.refreshToken,
        isAuthenticated: true,
        isLoading: false,
      }
    
    default:
      return state
  }
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(authReducer, initialState)

  // Load user from localStorage on mount
  useEffect(() => {
    const loadUserFromStorage = () => {
      try {
        const accessToken = localStorage.getItem('accessToken')
        const refreshToken = localStorage.getItem('refreshToken')
        const userStr = localStorage.getItem('user')

        if (accessToken && refreshToken && userStr) {
          const user = JSON.parse(userStr) as User
          dispatch({
            type: 'SET_INITIAL_STATE',
            payload: { user, accessToken, refreshToken }
          })
        } else {
          dispatch({ type: 'SET_LOADING', payload: false })
        }
      } catch (error) {
        console.error('Error loading user from storage:', error)
        localStorage.clear()
        dispatch({ type: 'SET_LOADING', payload: false })
      }
    }

    loadUserFromStorage()
  }, [])

  const login = async (email: string, password: string) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true })
      
      const response = await apiService.login(email, password)
      
      if (response.success) {
        const { user, accessToken, refreshToken } = response.data
        
        // Store in localStorage
        localStorage.setItem('accessToken', accessToken)
        localStorage.setItem('refreshToken', refreshToken)
        localStorage.setItem('user', JSON.stringify(user))
        
        dispatch({ type: 'LOGIN_SUCCESS', payload: response.data })
      } else {
        throw new Error(response.message)
      }
    } catch (error) {
      dispatch({ type: 'SET_LOADING', payload: false })
      throw error
    }
  }

  const logout = async () => {
    try {
      // Call logout API (optional, for server-side cleanup)
      await apiService.logout()
    } catch (error) {
      console.error('Logout API call failed:', error)
    } finally {
      // Clear localStorage regardless of API call success
      localStorage.removeItem('accessToken')
      localStorage.removeItem('refreshToken')
      localStorage.removeItem('user')
      
      dispatch({ type: 'LOGOUT' })
    }
  }

  const updateUser = (user: User) => {
    localStorage.setItem('user', JSON.stringify(user))
    dispatch({ type: 'UPDATE_USER', payload: user })
  }

  const contextValue: AuthContextType = {
    ...state,
    login,
    logout,
    updateUser,
  }

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export default AuthContext