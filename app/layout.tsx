import type { Metadata } from 'next'
import localFont from 'next/font/local'
import Script from 'next/script'
import './globals.css'
import { ConvexAuthNextjsServerProvider } from '@convex-dev/auth/nextjs/server'
import { Description, Icon, Title } from '@/lib/consts'
import { AppProviders } from './providers'

const inter = localFont({
  src: './fonts/Inter.ttf',
  variable: '--font-inter',
})

export const metadata: Metadata = {
  title: Title,
  description: Description,
  icons: {
    icon: Icon,
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <ConvexAuthNextjsServerProvider>
      <html
        lang='ru'
        className={`${inter.variable} font-inter `}
        suppressHydrationWarning
      >
        <head>
          {process.env.NODE_ENV === 'development' && (
            <Script
              src='//unpkg.com/react-grab/dist/index.global.js'
              crossOrigin='anonymous'
              strategy='beforeInteractive'
            />
          )}
        </head>
        <body className={`antialiased`} suppressHydrationWarning>
          {process.env.NEXT_PUBLIC_DEMO_MODE === 'true' && (
            <div className='bg-amber-100 px-4 py-3 text-center text-sm text-amber-950'>
              Демо проекта Климат22. Магазин прекратил работу. Товары и заявки
              тестовые, продажа и доставка не выполняются. Используйте
              вымышленные контактные данные.
            </div>
          )}
          <AppProviders>{children}</AppProviders>
        </body>
      </html>
    </ConvexAuthNextjsServerProvider>
  )
}
