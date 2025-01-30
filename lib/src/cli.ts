import * as fs from 'node:fs'
import {Command} from 'commander'
import {parseCbor} from './parseCbor'

const program = new Command()

program
  .name('parse-cbor')
  .description('Parse CBOR data using a CDDL schema')
  .argument('<cddlFile>', 'Path to the CDDL schema file')
  .argument('<cbor>', 'CBOR string to parse')
  .action(async (cddlFile, cbor) => {
    try {
      // Read the contents of the CDDL file
      const cddlSchemaRaw = await fs.promises.readFile(cddlFile, 'utf-8')

      // Call the parseCbor function with the provided arguments
      const result = await parseCbor(cddlSchemaRaw, cbor)

      console.log('Parsed CBOR:', result)
    } catch (err) {
      console.error('Error:', err instanceof Error ? err.message : String(err))
      process.exit(1)
    }
  })

program.parse(process.argv)
