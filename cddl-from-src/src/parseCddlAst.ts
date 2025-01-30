import {cddlFromSrc} from './cddlFromSrc.ts'
import {type CDDL, cddlSchema} from './cddlSchema.ts'

export const parseCddlAst = async (cddlSchemaRaw: string): Promise<CDDL> => {
  const cddlAstUntyped: unknown = await cddlFromSrc(cddlSchemaRaw)
  return cddlSchema.parse(cddlAstUntyped)
}
