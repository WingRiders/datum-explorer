'use client'

import {Box} from '@mui/material'
import type {ReactNode} from 'react'

type ExternalLinkProps = {
  href: string
  children?: ReactNode
}

export const ExternalLink = ({href, children}: ExternalLinkProps) => {
  return (
    <Box
      component="a"
      href={href}
      target="_blank"
      rel="noreferrer"
      sx={{
        color: ({palette}) => palette.text.primary,
        textDecoration: 'none',
        '&:hover': {
          color: ({palette}) => palette.text.secondary,
        },
      }}
    >
      {children}
    </Box>
  )
}
