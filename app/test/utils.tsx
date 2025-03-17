import {ThemeProvider} from '@mui/material'
import {type RenderOptions, render} from '@testing-library/react'
import type React from 'react'
import type {ReactElement} from 'react'
import {QueryProvider} from '../src/app/QueryProvider'
import {theme} from '../src/theme'

const AppWrapper = ({children}: {children: React.ReactNode}) => {
  return (
    <QueryProvider>
      <ThemeProvider theme={theme}>{children}</ThemeProvider>
    </QueryProvider>
  )
}

const customRender = (ui: ReactElement, options?: Omit<RenderOptions, 'wrapper'>) =>
  render(ui, {wrapper: AppWrapper, ...options})

export * from '@testing-library/react'
export {customRender as render}
