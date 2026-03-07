import type { Metadata } from 'next'
import { Space_Grotesk, Public_Sans } from 'next/font/google'
import AuthProvider from '@/lib/auth/AuthProvider'
import './globals.css'

const spaceGrotesk = Space_Grotesk({ 
  subsets: ['latin'],
  variable: '--font-space-grotesk',
  display: 'swap',
})

const publicSans = Public_Sans({
  subsets: ['latin'],
  variable: '--font-public-sans',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'HealthPassport - The Future of Healthcare',
  description: 'Revolutionary AI-powered health passport system with quantum-grade security, instant global access, and seamless provider integration. Secure your health data instantly.',
  keywords: 'health passport, quantum security healthcare, medical records, AI health insights, secure health data, digital health, electronic health records',
  generator: 'HealthPassport',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`${spaceGrotesk.variable} ${publicSans.variable} font-sans antialiased selection:bg-black selection:text-white`}>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  )
}
