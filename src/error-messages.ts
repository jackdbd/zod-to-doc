import { ERROR_PREFIX, LINK_ISSUE_BUG_REPORT } from './constants.js'

// Call To Action to encourage users to submit a bug report in case of an error
const CTA_BUG = `Do you think this is a bug? Please submit a bug report:\n${LINK_ISSUE_BUG_REPORT}`

export const esModuleNotFound = (filepath: string) => {
  const summary = `${ERROR_PREFIX} ES module not found`
  const details = [
    `Not found: ${filepath}`,
    `TIP: Try double-checking the file path.`,
    CTA_BUG
  ]
  return [summary, ...details].join('\n\n')
}

export const couldNotGenerateTable = (error: Error) => {
  const summary = `${ERROR_PREFIX} Could not generate table from Zod schema`
  const details = [
    `Error: ${error.message}`,
    `TIP: Try double-checking your Zod schema.`,
    CTA_BUG
  ]
  return [summary, ...details].join('\n\n')
}

export const documentNotFound = (filepath: string) => {
  const summary = `${ERROR_PREFIX} Document not found`
  const details = [
    `Not found: ${filepath}`,
    `TIP: Try double-checking the file path.`,
    CTA_BUG
  ]
  return [summary, ...details].join('\n\n')
}

export const schemaNotFound = (name: string, filepath: string) => {
  const summary = `${ERROR_PREFIX} Zod schema not found`
  const details = [
    `Not found: ${name}`,
    `TIP: Try double-checking the name of the Zod schema you want to import from ${filepath}.`,
    CTA_BUG
  ]
  return [summary, ...details].join('\n\n')
}

export const placeholderNotFound = (placeholder: string, filepath: string) => {
  const summary = `${ERROR_PREFIX} Placeholder not found`
  const placeholder_begin = `<!-- BEGIN ${placeholder} -->`
  const placeholder_end = `<!-- END ${placeholder} -->`
  const details = [
    `Not found: ${placeholder}`,
    `TIP: Please make sure to put both ${placeholder_begin} and ${placeholder_end} in ${filepath}`,
    CTA_BUG
  ]
  return [summary, ...details].join('\n\n')
}
