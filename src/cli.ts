#!/usr/bin/env node

import fs from 'node:fs'
import path from 'node:path'
import defDebug from 'debug'
import yargs from 'yargs/yargs'
import { markdownTableFromZodSchema } from './lib.js'
import {
  CLI_NAME,
  DEBUG_PREFIX,
  INFO_PREFIX,
  LINK_BUGS,
  LINK_ENHANCEMENTS
} from './constants.js'
import {
  couldNotGenerateTable,
  documentNotFound,
  esModuleNotFound,
  placeholderNotFound,
  schemaNotFound
} from './error-messages.js'

const debug = defDebug(`${DEBUG_PREFIX}:cli`)

const argv = await yargs(process.argv.slice(2))
  .usage(
    `$0 - Generate a markdown table from a Zod schema and write it to a file`
  )
  .option('module', {
    alias: 'm',
    demandOption: true,
    describe: 'relative path to a ES module that exports a Zod schema',
    type: 'string'
  })
  .option('schema', {
    alias: 's',
    demandOption: true,
    describe: 'Zod schema you want to generate a markdown table for',
    type: 'string'
  })
  .option('filepath', {
    alias: 'f',
    default: 'README.md',
    describe: 'File where you want to inject the markdown table',
    type: 'string'
  })
  .option('placeholder', {
    alias: 'p',
    demandOption: true,
    describe:
      'Placeholder that identifies where to insert the generated markdown table',
    type: 'string'
  })
  .option('title', {
    alias: 't',
    demandOption: false,
    describe: 'Title of the generated table',
    type: 'string'
  })
  .option('dry-run', {
    boolean: true,
    describe:
      'If true, print the generated markdown to stdout instead of writing it to the specified file'
  })
  .example(
    '$0 --module lib/schemas/foo.js --schema bar',
    `use the 'bar' zod schema from the 'foo.js' ES module to generate a markdown table and update the README.md file`
  )
  .help('help')
  .wrap(80)
  .epilogue(
    [
      `Bugs:\n${LINK_BUGS}`,
      `Feature requests & suggestions:\n${LINK_ENHANCEMENTS}`
    ].join('\n\n')
  ).argv

const module_filepath = path.join(process.env.PWD!, argv.module)
if (!fs.existsSync(module_filepath)) {
  console.error(esModuleNotFound(module_filepath))
  process.exit(1)
}

const es_module = await import(module_filepath)
const schema = es_module[argv.schema]
if (!schema) {
  console.error(schemaNotFound(argv.schema, module_filepath))
  process.exit(1)
}
debug(`import { ${argv.schema} } from '${module_filepath}'`)

const { error, value: table } = markdownTableFromZodSchema(schema)
if (error) {
  console.error(couldNotGenerateTable(error))
  process.exit(1)
}
debug(`table generated from Zod schema`)
debug(table)

const doc_filepath = path.join(process.env.PWD!, argv.filepath)
if (!fs.existsSync(doc_filepath)) {
  console.error(documentNotFound(doc_filepath))
  process.exit(1)
}

debug(`read ${doc_filepath}`)
const str = fs.readFileSync(doc_filepath, 'utf-8')

const placeholder_begin = `<!-- BEGIN ${argv.placeholder} -->`
const placeholder_end = `<!-- END ${argv.placeholder} -->`
debug(`looking for these placeholders in ${doc_filepath} %O`, {
  begin: placeholder_begin,
  end: placeholder_end
})

const tip = `<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN ${CLI_NAME} TO UPDATE -->`
const i_begin = str.indexOf(placeholder_begin)
const i_end = str.indexOf(placeholder_end) + placeholder_end.length
if (i_begin === -1) {
  console.error(placeholderNotFound(argv.placeholder, doc_filepath))
  process.exit(1)
}

const before = str.substring(0, i_begin).trimEnd()
const after = str.substring(i_end).trimStart()

const splits = [before, '\n\n', placeholder_begin, '\n', tip]
if (argv.title) {
  splits.push('\n\n')
  splits.push(argv.title)
}
splits.push('\n\n')
splits.push(table)
splits.push('\n')
splits.push(placeholder_end)
splits.push('\n\n')
splits.push(after)
const md = splits.join('')

if (argv['dry-run']) {
  console.info(
    `${INFO_PREFIX} ${doc_filepath} not modified because of --dry-run. Here is how it would look like:`
  )
  console.log(`=== BEGIN ${doc_filepath} ===`)
  console.log(md)
  console.log(`=== END ${doc_filepath} ===`)
} else {
  fs.writeFileSync(doc_filepath, md)
  console.info(`${INFO_PREFIX} ${doc_filepath} updated`)
}
