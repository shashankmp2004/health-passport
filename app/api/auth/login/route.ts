import { NextRequest, NextResponse } from 'next/server'
import { signIn } from 'next-auth/react'

export async function POST(request: NextRequest) {
  try {
    const { userType, ...credentials } = await request.json()
    
    let result
    
    switch (userType) {
      case 'patient':
        result = await signIn('patient', {
          healthPassportId: credentials.healthPassportId,
          password: credentials.password,
          redirect: false
        })
        break
        
      case 'doctor':
        result = await signIn('doctor', {
          email: credentials.email,
          password: credentials.password,
          redirect: false
        })
        break
        
      case 'hospital':
        result = await signIn('hospital', {
          email: credentials.email,
          password: credentials.password,
          redirect: false
        })
        break
        
      default:
        return NextResponse.json(
          { error: 'Invalid user type' },
          { status: 400 }
        )
    }
    
    if (result?.error) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      )
    }
    
    return NextResponse.json(
      { 
        success: true,
        message: 'Login successful',
        redirectUrl: getRedirectUrl(userType)
      },
      { status: 200 }
    )
    
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

function getRedirectUrl(userType: string): string {
  switch (userType) {
    case 'patient':
      return '/patient/dashboard'
    case 'doctor':
      return '/hospital/dashboard' // Doctors use hospital portal
    case 'hospital':
      return '/hospital/dashboard'
    default:
      return '/'
  }
}
