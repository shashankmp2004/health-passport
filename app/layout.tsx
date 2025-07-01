import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'HealthPassport - The Future of Healthcare',
  description: 'Revolutionary AI-powered health passport system with quantum-grade security, instant global access, and seamless provider integration. Secure your health data with blockchain technology.',
  keywords: 'health passport, blockchain healthcare, medical records, AI health insights, secure health data, digital health, electronic health records',
  generator: 'HealthPassport',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  )
}
