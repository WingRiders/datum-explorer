import {enrichError} from './helpers'
import init, {cddl_from_src} from './pkg/cddl_from_src'
import cddl_from_src_wasm from './pkg/cddl_from_src_bg.wasm'
import type {CddlAst} from './types.ts'

let initialized: Promise<void> | null = null

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
    // @ts-ignore
    initialized = init(cddl_from_src_wasm())
      .then(() => void 0)
      .catch((e) => {
        initialized = null // Reset if initialization fails
        throw new Error(`Failed to initialize WASM module: ${e.message}`)
      })
  }
  // Wait for the WASM module to initialize
  await initialized

  return enrichError(() => cddl_from_src(cddlSchema), 'CDDL parsing error') as CddlAst // We assume CddlAst type is defined correctly and the validation is performed in the Rust library
}
