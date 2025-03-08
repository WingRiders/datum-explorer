import type {FieldError} from 'react-hook-form'

export const getErrorMessage = (fieldError: FieldError | undefined) => {
  if (!fieldError) return undefined
  if (fieldError.type === 'required') return 'This field is required'
  return fieldError.message
}
