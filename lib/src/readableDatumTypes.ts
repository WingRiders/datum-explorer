export type TypeWithValue = {
  type: string
  value: Value
}
export type Value = PrimitiveValue | TypeWithValue | Struct | GenericArray
export type PrimitiveValue = number | string
export type Struct = ({name: string} & TypeWithValue)[]
export type GenericArray = Value[]
