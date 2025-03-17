import {uniqBy} from 'lodash'
import {create} from 'zustand'
import {persist} from 'zustand/middleware'

export type LocalSchema = {
  name: string
  cddl: string
}

export type LocalSchemasState = {
  localSchemas: LocalSchema[]
  addSchema: (schema: LocalSchema) => void
  editSchema: (name: string, schema: LocalSchema) => void
  deleteSchema: (name: string) => void

  isRehydrated?: boolean
}

export const useLocalSchemasStore = create<LocalSchemasState>()(
  persist(
    (set) => ({
      localSchemas: [],
      addSchema: (schema) =>
        set((state) => ({localSchemas: uniqBy([...state.localSchemas, schema], (s) => s.name)})),
      deleteSchema: (name) =>
        set((state) => ({
          localSchemas: state.localSchemas.filter((schema) => schema.name !== name),
        })),
      editSchema: (name, schema) =>
        set((state) => ({
          localSchemas: state.localSchemas.map((s) => (s.name === name ? schema : s)),
        })),
    }),
    {
      name: 'local-schemas',
      onRehydrateStorage: () => {
        return (state) => {
          if (state) state.isRehydrated = true
        }
      },
      partialize: (state) => ({localSchemas: state.localSchemas}),
    },
  ),
)
