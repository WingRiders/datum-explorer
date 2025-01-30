export type ReadableDatum = {
  type: string
  value: Value
}
export type Value = PrimitiveValue | ReadableDatum | Struct | GenericArray
export type PrimitiveValue = number | string
export type Struct = ({name: string} & ReadableDatum)[]
export type GenericArray = Value[]
