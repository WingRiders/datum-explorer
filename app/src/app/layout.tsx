import type {Metadata, Viewport} from 'next'
import './globals.css'
import {ThemeProvider} from '@mui/material'
import {AppRouterCacheProvider} from '@mui/material-nextjs/v15-appRouter'
import CssBaseline from '@mui/material/CssBaseline'
import {AppBackground} from '../components/AppBackground'
import {ErrorBoundary} from '../components/ErrorBoundary'
import {theme} from '../theme'
import {QueryProvider} from './QueryProvider'

export const metadata: Metadata = {
  title: 'Datum Explorer',
  description: 'Explore the Cardano datums',
}

export const viewport: Viewport = {
  initialScale: 1,
  width: 'device-width',
}

const RootLayout = ({
  children,
}: Readonly<{
  children: React.ReactNode
}>) => {
  return (
    <html lang="en">
      <body>
        <AppRouterCacheProvider>
          <QueryProvider>
            <ThemeProvider theme={theme}>
              <CssBaseline />
              <AppBackground />
              <ErrorBoundary>{children}</ErrorBoundary>
            </ThemeProvider>
          </QueryProvider>
        </AppRouterCacheProvider>
      </body>
    </html>
  )
}

export default RootLayout
