// Official Uniswap token list schema from @uniswap/token-lists (package has no dist, so we load the schema from source)
import schema from '@uniswap/token-lists/src/tokenlist.schema.json'
import Ajv from 'ajv'
import addFormats from 'ajv-formats'
import * as fs from 'fs'
import * as path from 'path'

const LIST_PATH = path.join(__dirname, 'st0xTokens.json')

async function validate() {
  console.log('Validating token list...')
  console.log('List path:', LIST_PATH)

  const ajv = new Ajv({ allErrors: true, verbose: true })
  addFormats(ajv)
  const validator = ajv.compile(schema)
  console.log('Schema loaded (Uniswap token list schema)')

  const raw = fs.readFileSync(LIST_PATH, 'utf-8')
  const data = JSON.parse(raw)
  const tokenCount = data.tokens?.length ?? 0
  console.log(`Loaded ${tokenCount} token(s) from list "${data.name ?? 'unknown'}"`)

  const valid = validator(data)
  if (valid) {
    console.log('Validation passed.')
    return valid
  }
  if (validator.errors) {
    const errorCount = validator.errors.length
    console.error(`\nValidation failed: ${errorCount} error(s)\n`)
    throw validator.errors.map((error) => {
      const err = { ...error } as Record<string, unknown>
      delete err.data
      return err
    })
  }
}

validate()
  .then(() => {
    console.log('Valid List.')
    process.exit(0)
  })
  .catch((err) => {
    console.error(err)
    process.exit(1)
  })
