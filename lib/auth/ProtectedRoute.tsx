import { useAuth } from '@/lib/auth/hooks'
import { ReactNode } from 'react'

interface ProtectedRouteProps {
  children: ReactNode
  requiredRole?: 'patient' | 'doctor' | 'hospital' | string[]
  fallback?: ReactNode
}

export default function ProtectedRoute({ 
  children, 
  requiredRole, 
  fallback 
}: ProtectedRouteProps) {
  const { session, isLoading, isAuthenticated } = useAuth()

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return fallback || (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Access Denied
          </h2>
          <p className="text-gray-600">
            Please log in to access this page.
          </p>
        </div>
      </div>
    )
  }

  // Check role-based access
  if (requiredRole) {
    const userRole = session?.user?.role
    const hasAccess = Array.isArray(requiredRole) 
      ? requiredRole.includes(userRole || '')
      : userRole === requiredRole

    if (!hasAccess) {
      return fallback || (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Insufficient Permissions
            </h2>
            <p className="text-gray-600">
              You don't have permission to access this page.
            </p>
          </div>
        </div>
      )
    }
  }

  return <>{children}</>
}
