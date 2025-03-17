import {enrichError} from './helpers'
import init, {cddl_from_src, type InitOutput} from './pkg/cddl_from_src'
import cddl_from_src_wasm from './pkg/cddl_from_src_bg.wasm'
import type {CddlAst} from './types.ts'

let initialized: InitOutput | null = null

/**
 * Parses a CDDL schema into a JavaScript object using WebAssembly.
 * On the first call, this function initializes the underlying WASM module.
 * Subsequent calls will skip initialization, ensuring minimal overhead.
 *
 * @param cddlSchema - The CDDL schema as a string.
 * @returns A parsed representation of the schema as a JavaScript object.
 * @throws If the initialization or parsing fails.
 */
export const cddlFromSrc = async (cddlSchema: string): Promise<CddlAst> => {
  if (initialized === null) {
    try {
      // @ts-ignore
      initialized = await init({
        module_or_path:
          typeof cddl_from_src_wasm === 'string'
            ? `file:${cddl_from_src_wasm}`
            : // @ts-ignore
              cddl_from_src_wasm(),
      })
    } catch (e: unknown) {
      initialized = null // Reset if initialization fails
      if (e instanceof Error) throw new Error(`Failed to initialize WASM module: ${e.message}`)
      throw e
    }
  }

  return enrichError(() => cddl_from_src(cddlSchema), 'CDDL parsing error') as CddlAst // We assume CddlAst type is defined correctly and the validation is performed in the Rust library
}
