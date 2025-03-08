import {Button, Stack, TextField} from '@mui/material'
import {getAggregateMessage, validateCddl} from '@wingriders/datum-explorer-lib'
import {useEffect} from 'react'
import {useForm} from 'react-hook-form'
import {useShallow} from 'zustand/shallow'
import {getErrorMessage} from '../../helpers/forms'
import {type LocalSchema, useLocalSchemasStore} from '../../store/localSchemas'

const SCHEMA_NAME_MAX_LENGTH = 100

export type LocalSchemaFormInputs = {
  name: string
  cddl: string
}

type LocalSchemaFormProps = {
  submitButtonLabel: string
  onSubmit: (data: LocalSchemaFormInputs) => void
  existingValues?: LocalSchemaFormInputs
}

export const LocalSchemaForm = ({
  submitButtonLabel,
  onSubmit,
  existingValues,
}: LocalSchemaFormProps) => {
  const {localSchemas} = useLocalSchemasStore(useShallow(({localSchemas}) => ({localSchemas})))

  const {
    register,
    formState: {errors},
    handleSubmit,
    setValue,
    getValues,
  } = useForm<LocalSchemaFormInputs>({defaultValues: existingValues})

  useEffect(() => {
    const currentValues = getValues()
    const isCurrentValuesEmpty = !currentValues.name && !currentValues.cddl

    if (isCurrentValuesEmpty && existingValues) {
      setValue('name', existingValues.name)
      setValue('cddl', existingValues.cddl)
    }
  }, [existingValues, getValues, setValue])

  return (
    <Stack spacing={2}>
      <TextField
        label="Schema name"
        variant="filled"
        {...register('name', {
          required: true,
          validate: (value) => {
            if (isDuplicateSchemaName(localSchemas, value, existingValues?.name)) {
              return 'Schema with this name already exists among your local schemas'
            }
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
        slotProps={{
          input: {sx: {fontFamily: 'monospace'}},
        }}
      />

      <Button variant="contained" onClick={handleSubmit(onSubmit)}>
        {submitButtonLabel}
      </Button>
    </Stack>
  )
}

const isDuplicateSchemaName = (
  localSchemas: LocalSchema[],
  newName: string,
  existingName?: string,
) =>
  localSchemas.some(
    (schema) => (!existingName || schema.name !== existingName) && schema.name === newName,
  )
