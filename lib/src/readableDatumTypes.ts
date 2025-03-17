export type ReadableDatum = {
  type: string
  value: DatumValue
}
export type DatumValue = PrimitiveValue | ReadableDatum | Struct | GenericArray
export type PrimitiveValue = number | string
export type Struct = ({name: string} & ReadableDatum)[]
export type GenericArray = DatumValue[]
