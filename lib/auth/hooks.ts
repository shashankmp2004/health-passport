import { useSession, signIn, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

// Custom hook for authentication
export function useAuth(requireAuth: boolean = true) {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (requireAuth && status === 'unauthenticated') {
      router.push('/')
    }
  }, [status, requireAuth, router])

  return {
    session,
    status,
    user: session?.user,
    isLoading: status === 'loading',
    isAuthenticated: status === 'authenticated',
  }
}

// Role-specific hooks
export function usePatientAuth() {
  const { session, status } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (status === 'authenticated' && session?.user?.role !== 'patient') {
      router.push('/')
    }
  }, [session, status, router])

  return {
    session,
    patient: session?.user?.role === 'patient' ? session.user : null,
    isLoading: status === 'loading',
    isAuthenticated: status === 'authenticated' && session?.user?.role === 'patient',
  }
}

export function useDoctorAuth() {
  const { session, status } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (status === 'authenticated' && session?.user?.role !== 'doctor') {
      router.push('/')
    }
  }, [session, status, router])

  return {
    session,
    doctor: session?.user?.role === 'doctor' ? session.user : null,
    isLoading: status === 'loading',
    isAuthenticated: status === 'authenticated' && session?.user?.role === 'doctor',
  }
}

export function useHospitalAuth() {
  const { session, status } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (status === 'authenticated' && session?.user?.role !== 'hospital') {
      router.push('/')
    }
  }, [session, status, router])

  return {
    session,
    hospital: session?.user?.role === 'hospital' ? session.user : null,
    isLoading: status === 'loading',
    isAuthenticated: status === 'authenticated' && session?.user?.role === 'hospital',
  }
}

// Login functions for different user types
export async function loginPatient(healthPassportId: string, password: string) {
  const result = await signIn('patient', {
    healthPassportId,
    password,
    redirect: false
  })
  
  return result
}

export async function loginDoctor(email: string, password: string) {
  const result = await signIn('doctor', {
    email,
    password,
    redirect: false
  })
  
  return result
}

export async function loginHospital(email: string, password: string) {
  const result = await signIn('hospital', {
    email,
    password,
    redirect: false
  })
  
  return result
}

// Logout function
export async function logout() {
  await signOut({ callbackUrl: '/' })
}

// Check if user has specific permissions
export function hasPermission(userRole: string, requiredRole: string | string[]): boolean {
  if (Array.isArray(requiredRole)) {
    return requiredRole.includes(userRole)
  }
  return userRole === requiredRole
}

// Get redirect URL based on user role
export function getDefaultRedirectUrl(role: string): string {
  switch (role) {
    case 'patient':
      return '/patient/dashboard'
    case 'doctor':
      return '/hospital/dashboard'
    case 'hospital':
      return '/hospital/dashboard'
    default:
      return '/'
  }
}
