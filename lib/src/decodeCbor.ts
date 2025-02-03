import {Decoder} from 'cbor-x'
import {NotAHexStringError} from './errors'

const isValidHexString = (hexString?: unknown): hexString is string =>
  typeof hexString === 'string' && !!hexString.match(/^([0-9a-fA-F]{2})*$/) /* hex encoded */

export const decodeCbor = (cborStringRaw: string): unknown => {
  if (!isValidHexString(cborStringRaw)) throw new NotAHexStringError()
  const decoder = new Decoder({mapsAsObjects: false})
  return decoder.decode(Buffer.from(cborStringRaw, 'hex'))
}
