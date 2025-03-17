import {Box, styled} from '@mui/material'
import type {OverrideProps} from '@mui/material/OverridableComponent'
import type {BoxTypeMap} from '@mui/system'

export const AbsoluteFill = styled('div', {
  shouldForwardProp: (prop) => prop !== 'center',
})<{
  center?: boolean
}>(({center}) => [
  {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },
  center && {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
])

export const Center = styled(Box)({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
})

export const Span = (props: OverrideProps<BoxTypeMap, 'span'>) => (
  <Box component="span" {...props} />
)
