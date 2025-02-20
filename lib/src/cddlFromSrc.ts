import fs from 'node:fs'
import path from 'node:path'
import {enrichError} from './helpers'
import init, {cddl_from_src, type InitOutput} from './pkg/cddl_from_src'
import type {CddlAst} from './types.ts'

const getWasmFilePath = () => {
  const possibleWasmFilePaths = [
    path.resolve(__dirname, './pkg/cddl_from_src_bg.wasm'), // Used in source (e.g., for tests)
    path.resolve(__dirname, '../cddl_from_src_bg.wasm'), // Used in built npm package (dist/)
  ]
  // Find the first existing file
  const wasmFilePath = possibleWasmFilePaths.find(fs.existsSync)
  if (wasmFilePath == null) {
    throw new Error(`Failed to locate cddl_from_src_bg.wasm at ${possibleWasmFilePaths}`)
  }
  return wasmFilePath
}

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
    let wasmFilePath: string | null = null
    try {
      wasmFilePath = getWasmFilePath()
      const wasmBuffer = await fs.promises.readFile(wasmFilePath)
      initialized = await init({module_or_path: await WebAssembly.compile(wasmBuffer)})
    } catch (e: unknown) {
      initialized = null // Reset if initialization fails
      if (e instanceof Error)
        throw new Error(
          `Failed to initialize WASM module: ${e.message}${wasmFilePath != null ? `, wasmFilePath = ${wasmFilePath}` : ''})`,
        )
      throw e
    }
  }

  return enrichError(() => cddl_from_src(cddlSchema), 'CDDL parsing error') as CddlAst // We assume CddlAst type is defined correctly and the validation is performed in the Rust library
}
