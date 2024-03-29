/**
 * Inject your Zod schemas into your docs.
 *
 * @packageDocumentation
 */
import defDebug from 'debug'
import { z } from 'zod'
import { DEBUG_PREFIX } from './constants.js'

const debug = defDebug(`${DEBUG_PREFIX}:lib`)

// eslint-disable @typescript-eslint/no-explicit-any
/**
 * @internal
 */
export const defaultZodValue = (value: any) => {
  // eslint-enable @typescript-eslint/no-explicit-any
  if (value instanceof z.ZodDefault) {
    return value._def.defaultValue()
  } else {
    return undefined
  }
}

/**
 * Converts a Zod schema into an array of objects.
 *
 * @public
 * @experimental
 */
export const arrayFromZodSchema = <S extends z.AnyZodObject>(schema: S) => {
  if (!schema.shape) {
    return { error: new Error(`schema.shape is not defined.`) }
  }

  debug(`Zod schema => JS array`)
  const arr = Object.entries(schema.shape).map(([key, value]) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const val = value as any

    // TODO: https://github.com/jackdbd/zod-to-doc/issues/4
    // if (val instanceof z.ZodObject) {
    //   console.log('=== val._def ===', val._def)
    //   console.log('=== val.description ===', val.description)
    // }

    let description: string = ''
    if (val instanceof z.ZodArray) {
      const exactLength = val._def.exactLength && val._def.exactLength.value
      const minLength = val._def.minLength ? `${val._def.minLength.value}` : 0
      const maxLength = val._def.maxLength ? `${val._def.maxLength.value}` : '∞'
      if (exactLength) {
        debug(`ZodArray of ${exactLength} elements`)
      } else {
        debug(`ZodArray ${minLength} to ${maxLength} elements`)
      }

      if (val._def.type instanceof z.ZodObject) {
        if (val.description) {
          description = exactLength
            ? `${val.description} (${exactLength} elements)`
            : `${val.description} (${minLength} to ${maxLength} elements)`
        } else {
          const prefix = exactLength
            ? `Array of ${exactLength} elements`
            : `Array of ${minLength} to ${maxLength} elements`
          const desc = val._def.type.description
            ? `${prefix} of: ${val._def.type.description}`
            : prefix
          description = desc
        }
      } else {
        description = val.description || ''
      }
    } else {
      description = val.description || ''
    }

    return { key, default: defaultZodValue(value), description }
  })

  return { value: arr }
}

// eslint-disable @typescript-eslint/no-explicit-any
/**
 * @internal
 */
export const stringify = (x: any) => {
  // eslint-enable @typescript-eslint/no-explicit-any
  if (x === true || x === false || x === null || x === undefined) {
    return `\`${x}\``
  }

  if (x.length === 0) {
    return `\`[]\``
  } else {
    return `\`${JSON.stringify(x, null, 2)}\``
  }
}

/**
 * Creates a markdown table from a Zod schema.
 *
 * @param schema - The Zod schema to convert.
 *
 * @see [Zod discussions #1953 - Retrieve default values from schema](https://github.com/colinhacks/zod/discussions/1953)
 *
 * @public
 * @experimental
 */
export const markdownTableFromZodSchema = <S extends z.AnyZodObject>(
  schema: S
) => {
  debug(`Zod schema => markdown table`)
  const header = [`| Key | Default | Description |`, `|---|---|---|`]

  // Zod schemas that have a default value lose their .shape property. I find
  // this behavior quite weird and doesn't make much sense to me. I couldn't
  // find any documentation about this behavior, nor the reasoning behind this
  // design decision.
  let schema_without_default: S
  if (schema instanceof z.ZodDefault) {
    schema_without_default = schema.removeDefault()
  } else {
    schema_without_default = schema
  }

  const res = arrayFromZodSchema(schema_without_default)
  if (res.error) {
    return { error: res.error }
  }

  const rows = res.value.map((d) => {
    return `| \`${d.key}\` | ${stringify(d.default)} | ${d.description || ''} |`
  })

  return { value: [...header, ...rows].join('\n') }
}
