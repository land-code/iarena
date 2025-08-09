import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import '../globals.css'
import { Toaster } from '@/components/ui/sonner'
import DashboardHeader from '@/components/layout/dashboard-header'

import { APP_NAME } from '@/consts/app'
import { META, SITE_URL } from '@/consts/meta'
import { auth } from '@/lib/auth'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin']
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin']
})

export const metadata: Metadata = {
  title: {
    default: META.title,
    template: `%s | ${APP_NAME}` // Cada página puede definir su título con esta plantilla
  },
  description: META.description,
  openGraph: {
    title: META.title,
    description: META.description,
    url: SITE_URL,
    siteName: APP_NAME,
    images: [
      {
        url: META.image,
        width: 1200,
        height: 630,
        alt: META.title
      }
    ],
    locale: 'es_ES',
    type: 'website'
  },
  metadataBase: new URL(SITE_URL)
}

export default async function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode
}>) {
  const session = auth.api.getSession({ headers: await headers() })
  if (!session) redirect('/login')
  return (
    <html lang='es'>
      <body
        className={`flex min-h-screen flex-col ${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <DashboardHeader />
        <main className='flex w-full flex-1 flex-col items-center'>{children}</main>
        <Toaster />
      </body>
    </html>
  )
}
