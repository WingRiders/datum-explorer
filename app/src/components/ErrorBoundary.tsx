'use client'

import {Button, Stack, Typography} from '@mui/material'
import {Component, type ReactNode} from 'react'

export class ErrorBoundary extends Component<{children: ReactNode}> {
  state = {hasError: false}

  static getDerivedStateFromError() {
    return {hasError: true}
  }

  render() {
    return this.state.hasError ? <ErrorScreen /> : this.props.children
  }
}

const ErrorScreen = () => {
  return (
    <Stack alignItems="center" pt="10%" spacing={5}>
      <Typography variant="h1">Oops, there has been an unexpected error!</Typography>
      <Button onClick={() => window.location.reload()}>Refresh page</Button>
    </Stack>
  )
}
