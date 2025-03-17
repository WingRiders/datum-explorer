import {Button, Stack, TextField} from '@mui/material'
import {getAggregateMessage, validateCddl} from '@wingriders/datum-explorer-lib'
import {useEffect} from 'react'
import {useForm} from 'react-hook-form'
import {useShallow} from 'zustand/shallow'
import {getErrorMessage} from '../../helpers/forms'
import {useLocalSchemasStore} from '../../store/localSchemas'

const SCHEMA_NAME_MAX_LENGTH = 100

export type LocalSchemaFormInputs = {
  name: string
  cddl: string
}

type LocalSchemaFormProps = {
  isAddingNew?: boolean
  submitButtonLabel: string
  onSubmit: (data: LocalSchemaFormInputs) => void
  defaultValues?: LocalSchemaFormInputs
}

export const LocalSchemaForm = ({
  isAddingNew,
  submitButtonLabel,
  onSubmit,
  defaultValues,
}: LocalSchemaFormProps) => {
  const {localSchemas} = useLocalSchemasStore(useShallow(({localSchemas}) => ({localSchemas})))

  const {
    register,
    formState: {errors},
    handleSubmit,
    setValue,
    getValues,
  } = useForm<LocalSchemaFormInputs>({defaultValues})

  useEffect(() => {
    const currentValues = getValues()
    const isCurrentValuesEmpty = !currentValues.name && !currentValues.cddl

    if (isCurrentValuesEmpty && defaultValues) {
      setValue('name', defaultValues.name)
      setValue('cddl', defaultValues.cddl)
    }
  }, [defaultValues, getValues, setValue])

  return (
    <Stack spacing={2}>
      <TextField
        label="Schema name"
        variant="filled"
        {...register('name', {
          required: true,
          validate: (value) => {
            if (isAddingNew && localSchemas.some((schema) => schema.name === value)) {
              return 'Schema with this name already exists among your local schemas'
            }
            return true
          },
          maxLength: {
            value: SCHEMA_NAME_MAX_LENGTH,
            message: `Maximum length of the schema name is ${SCHEMA_NAME_MAX_LENGTH} characters`,
          },
        })}
        error={!!errors.name}
        helperText={getErrorMessage(errors.name)}
      />
      <TextField
        label="Schema CDDL"
        variant="filled"
        {...register('cddl', {
          required: true,
          validate: async (value) => {
            try {
              await validateCddl(value)
            } catch (error) {
              return `Invalid CDDL: ${getAggregateMessage(error)}`
            }
          },
        })}
        multiline
        fullWidth
        minRows={10}
        error={!!errors.cddl}
        helperText={getErrorMessage(errors.cddl)}
      />

      <Button variant="contained" onClick={handleSubmit(onSubmit)}>
        {submitButtonLabel}
      </Button>
    </Stack>
  )
}
