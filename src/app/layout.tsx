import './globals.css'
import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Providers } from '@/components/providers'
import { Toaster } from 'sonner'

const inter = Inter({ subsets: ['latin'] })

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: 'white' },
    { media: '(prefers-color-scheme: dark)', color: '#0f172a' }
  ],
}

export const metadata: Metadata = {
  title: 'Workshop Check-in',
  description: 'Sistema de gestión de talleres y eventos',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es" suppressHydrationWarning className="h-full">
      <body className={`${inter.className} min-h-full antialiased bg-background text-foreground`} suppressHydrationWarning>
        <Providers>
          <main className="relative min-h-screen flex flex-col">
            {children}
          </main>
          <Toaster 
            richColors 
            position="top-right"
            toastOptions={{
              classNames: {
                toast: 'glass-card',
                title: 'text-foreground',
                description: 'text-muted-foreground',
                actionButton: 'btn-primary',
                cancelButton: 'btn-secondary',
              },
            }}
          />
        </Providers>
      </body>
    </html>
  )
}
