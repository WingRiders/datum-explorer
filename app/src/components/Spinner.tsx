import {Box} from '@mui/material'

type SpinnerProps = {
  size?: 'large' | 'small'
  center?: boolean
}

export const Spinner = ({size = 'large', center = false}: SpinnerProps) => {
  const spinner = (
    <Box
      className={`spinner ${size === 'large' ? 'spinner-large' : 'spinner-small'}`}
      sx={({palette}) => ({'--wr-spinner-color': palette.text.primary})}
    >
      <div className="outer" />
      <div className="inner" />
    </Box>
  )
  return center ? <div className="center">{spinner}</div> : spinner
}
