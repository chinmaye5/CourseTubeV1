import { ClerkProvider } from '@clerk/nextjs'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'CourseTube - Learn from YouTube',
  description: 'Transform YouTube videos into structured learning courses with progress tracking and smart notes.',
  icons: {
    icon: [
      {
        url: '/logo.png',
        href: '/logo.png',
      },
    ],
    apple: [
      {
        url: '/logo.png',
        href: '/logo.png',
      },
    ],
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ClerkProvider>
      <html lang="en">
        <head>
          <link rel="icon" href="/logo.png" />
        </head>
        <body className={inter.className}>
          {children}
        </body>
      </html>
    </ClerkProvider>
  )
}