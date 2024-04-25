/**
 * Inject your Zod schemas into your docs.
 *
 * @packageDocumentation
 */
import defDebug from 'debug'
import { z } from 'zod'
import type { ZodTypeAny, ZodUnionOptions } from 'zod'
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
 * Converts any Zod type into an array of strings.
 *
 * @public
 * @experimental
 */
export const stringsFromZodAnyType = (x: ZodTypeAny) => {
  if ((x as any).options) {
    // x should be a z.ZodUnion of some type
    const arr: string[] = (x as any).options.map((opt: z.ZodAny) => {
      return stringsFromZodAnyType(opt)
    })
    const strings = arr.flat()
    strings.sort()
    return strings
  }

  if (x instanceof z.ZodBigInt) {
    return x.description ? [x.description] : ['A BigInt']
  } else if (x instanceof z.ZodBoolean) {
    return x.description ? [x.description] : ['A Boolean']
  } else if (x instanceof z.ZodLiteral) {
    if (x.value) {
      if (x.description) {
        return [`${stringify(x.value)} (${x.description})`]
      } else {
        return [stringify(x.value)]
      }
    } else {
      if (x.description) {
        return [`A literal (${x.description})`]
      } else {
        return [`A literal`]
      }
    }
  } else if (x instanceof z.ZodNumber) {
    // TODO: get min,max from these checks?
    // console.log('=== x._def.checks ===', x._def.checks)
    return x.description ? [x.description] : ['A Number']
  } else if (x instanceof z.ZodObject) {
    // const res = arrayFromZodSchema(x as any)
    return x.description ? [x.description] : ['An objects']
  } else if (x instanceof z.ZodString) {
    return x.description ? [x.description] : ['A String']
  } else if (x instanceof z.ZodUnion) {
    const arr: string[] = x.options.map((opt: z.ZodAny) => {
      return stringsFromZodAnyType(opt)
    })
    const strings = arr.flat()
    strings.sort()
    return strings
  } else {
    let not_handled = 'unknown'
    if (x._def && x._def.typeName) {
      not_handled = x._def.typeName
    }
    return x.description ? [`${not_handled} (${x.description})`] : [not_handled]
  }
}

/**
 * Converts a Zod union into an array of strings.
 *
 * @public
 * @experimental
 */
export const arrayFromZodUnion = <S extends z.ZodUnion<ZodUnionOptions>>(
  schema: S
) => {
  if (!schema.options) {
    return { error: new Error(`schema.options is not defined.`) }
  }

  debug(`Zod schema.options => JS array`)
  const arr = schema.options.map(stringsFromZodAnyType).flat()
  arr.sort()

  return { value: arr }
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
  debug(`Zod schema.shape => JS array`)
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

  if (typeof x === 'bigint') {
    // The trailing "n" is not part of the string.
    // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/BigInt/toString
    // https://github.com/GoogleChromeLabs/jsbi/issues/30#issuecomment-521449285
    return x.toString()
  }

  if (typeof x === 'symbol') {
    // Because Symbol has a [@@toPrimitive]() method, that method always takes
    // priority over toString() when a Symbol object is coerced to a string.
    // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Symbol/toString
    return x.toString()
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
