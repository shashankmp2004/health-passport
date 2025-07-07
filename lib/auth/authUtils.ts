import { signIn } from 'next-auth/react'

export interface LoginFormData {
  userType: 'patient' | 'doctor' | 'hospital'
  healthPassportId?: string
  email?: string
  password: string
}

export async function handleLogin(formData: LoginFormData) {
  try {
    let result

    switch (formData.userType) {
      case 'patient':
        if (!formData.healthPassportId) {
          throw new Error('Health Passport ID is required')
        }
        result = await signIn('patient', {
          healthPassportId: formData.healthPassportId,
          password: formData.password,
          redirect: false
        })
        break

      case 'doctor':
        if (!formData.email) {
          throw new Error('Email is required')
        }
        result = await signIn('doctor', {
          email: formData.email,
          password: formData.password,
          redirect: false
        })
        break

      case 'hospital':
        if (!formData.email) {
          throw new Error('Email is required')
        }
        result = await signIn('hospital', {
          email: formData.email,
          password: formData.password,
          redirect: false
        })
        break

      default:
        throw new Error('Invalid user type')
    }

    if (result?.error) {
      throw new Error('Invalid credentials')
    }

    return {
      success: true,
      redirectUrl: getRedirectUrl(formData.userType)
    }

  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Login failed'
    }
  }
}

function getRedirectUrl(userType: string): string {
  switch (userType) {
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

export async function handleRegistration(userType: string, formData: any) {
  try {
    const endpoint = `/api/${userType}s/register`
    
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(formData),
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error || 'Registration failed')
    }

    return {
      success: true,
      data,
      message: data.message
    }

  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Registration failed'
    }
  }
}
