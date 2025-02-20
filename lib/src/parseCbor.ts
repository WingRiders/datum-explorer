import {cddlFromSrc} from './cddlFromSrc'
import {decodeCbor} from './decodeCbor'
import {matchCddlWithCbor} from './matchCddlWithCbor'

export const parseCbor = async (cddlSchemaRaw: string, cborStringRaw: string) => {
  const cddl = await cddlFromSrc(cddlSchemaRaw)
  const cbor: unknown = decodeCbor(cborStringRaw)
  return matchCddlWithCbor(cddl, cbor)
}
