import * as fs from 'node:fs'
import {Command} from 'commander'
import {parseCbor} from './parseCbor'
import {validateCddl} from './validateCddl'

const program = new Command()

program.name('cddl-tool').description('A CLI tool for working with CDDL and CBOR')

program
  .command('parse-cbor')
  .description('Parse CBOR data using a CDDL schema')
  .argument('<cddlFile>', 'Path to the CDDL schema file')
  .argument('<cbor>', 'CBOR string to parse')
  .action(async (cddlFile, cbor) => {
    try {
      const cddlSchemaRaw = await fs.promises.readFile(cddlFile, 'utf-8')
      const result = await parseCbor(cddlSchemaRaw, cbor)
      console.log('Parsed CBOR:', result)
    } catch (err) {
      console.error('Error:', err instanceof Error ? err.message : String(err))
      process.exit(1)
    }
  })

program
  .command('validate-cddl')
  .description('Validate a CDDL schema for unsupported features')
  .argument('<cddlFile>', 'Path to the CDDL schema file')
  .action(async (cddlFile) => {
    try {
      const cddlSchemaRaw = await fs.promises.readFile(cddlFile, 'utf-8')
      await validateCddl(cddlSchemaRaw)
      console.log('CDDL schema is valid.')
    } catch (err) {
      console.error('Error:', err instanceof Error ? err.message : String(err))
      process.exit(1)
    }
  })

if (process.argv.length <= 2) {
  program.outputHelp()
  process.exit(0)
}

program.parse(process.argv)
