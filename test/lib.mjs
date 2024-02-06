import assert from 'node:assert'
import { describe, it } from 'node:test'
import { z } from 'zod'
import {
  arrayFromZodSchema,
  markdownTableFromZodSchema,
  stringify
} from '../dist/lib.js'
import {
  car,
  car_manufacturer,
  car_model,
  car_tire,
  dealership,
  employee,
  year
} from '../fixtures/schemas.mjs'

// TODO: add tests that use zod schemas generated by zodock or another mocking library
// https://zod.dev/?id=mocking

const escapedString = (s) => {
  return s
    .replaceAll('`', '\\`')
    .replaceAll('|', '\\|')
    .replaceAll('[', '\\[')
    .replaceAll(']', '\\]')
    .replaceAll('(', '\\(')
    .replaceAll(')', '\\)')
}

const escapedRegExp = (s) => new RegExp(escapedString(s))

const owner = { name: 'Mark' }

const bob = { name: 'Bob', job_title: 'mechanic' }
const john = { name: 'John', job_title: 'salesman' }
const employees = [bob, john]

const car_tires = [
  { manufacturer: 'Pirelli' },
  { manufacturer: 'Pirelli', pressure: 37 },
  { manufacturer: 'Pirelli', pressure: 38 },
  { manufacturer: 'Pirelli', pressure: 39 }
]

const honda_civic = {
  manufacturer: 'Honda',
  model: 'Civic',
  year: 2016,
  tires: car_tires
}

const cars = [
  honda_civic,
  {
    manufacturer: 'Toyota',
    model: 'Corolla',
    year: 2015,
    tires: car_tires
  }
]

const motorcycle_tires = [
  { manufacturer: 'Pirelli', pressure: 36 },
  { manufacturer: 'Pirelli', pressure: 42 }
]

const kawasaki_ninja = {
  manufacturer: 'Kawasaki',
  model: 'Ninja 300',
  year: 2016,
  tires: motorcycle_tires
}

const motorcycles = [
  kawasaki_ninja,
  {
    manufacturer: 'Yamaha',
    model: 'FZ-07',
    year: 2015,
    tires: motorcycle_tires
  },
  {
    manufacturer: 'Suzuki',
    model: 'GSX-R600',
    year: 2014,
    tires: motorcycle_tires
  }
]

const japanese_dealership = { owner, employees, cars, motorcycles }

describe('stringify', () => {
  //
  describe('boolean', () => {
    it('returns the string `true` for true', () => {
      assert.equal(stringify(true), '`true`')
    })

    describe('array', () => {
      it('returns the string `[]` for an empty array', () => {
        assert.equal(stringify([]), '`[]`')
      })

      it('returns a string with 4 newslines for an array that has 3 elements', () => {
        const arr = ['FOO', 'BAR', 'BAZ']
        assert.equal(stringify(arr), '`[\n  "FOO",\n  "BAR",\n  "BAZ"\n]`')
      })
    })

    describe('object', () => {
      it('returns the string `{}` for an empty object', () => {
        assert.equal(stringify({}), '`{}`')
      })

      it('returns a string with 3 newlines for an object that has 2 properties', () => {
        assert.equal(Object.keys(bob).length, 2)

        const splits = stringify(bob).split('\n')
        assert.equal(splits.length - 1, 3)
      })
    })
  })
})

describe('arrayFromZodSchema', () => {
  it('returns an error when the schema is a z.number()', () => {
    const res = arrayFromZodSchema(year)

    assert.notEqual(res.error, undefined)
    assert.equal(res.value, undefined)
  })

  it('returns an error when the schema is a z.string()', () => {
    const res = arrayFromZodSchema(car_model)

    assert.notEqual(res.error, undefined)
    assert.equal(res.value, undefined)
  })

  it('returns an array with the expected keys, and no error, when the schema is a z.object()', () => {
    const { error, value: arr } = arrayFromZodSchema(car_tire)

    assert.equal(error, undefined)
    assert.notEqual(arr, undefined)
    assert.equal(arr.length, 2)
    const keys = arr.map((d) => d.key)
    assert.equal(keys.includes('manufacturer'), true)
    assert.equal(keys.includes('pressure'), true)
  })

  it('mentions the length of an array in the description', () => {
    const { error, value: arr } = arrayFromZodSchema(car)

    assert.equal(error, undefined)
    assert.notEqual(arr, undefined)

    assert.equal(arr.length, 4)
    const keys = arr.map((d) => d.key)
    assert.equal(keys.includes('manufacturer'), true)
    assert.equal(keys.includes('model'), true)
    assert.equal(keys.includes('tires'), true)
    assert.equal(keys.includes('year'), true)

    const desc = arr.find((d) => d.key === 'tires').description
    assert.match(desc, /4 elements/)
  })
})

describe('markdownTableFromZodSchema', () => {
  it('returns an error when the schema is a z.number()', () => {
    const res = markdownTableFromZodSchema(year)

    assert.notEqual(res.error, undefined)
    assert.equal(res.value, undefined)
  })

  it('returns an error when the schema is a z.string()', () => {
    const res = markdownTableFromZodSchema(car_model)

    assert.notEqual(res.error, undefined)
    assert.equal(res.value, undefined)
  })

  it('returns a markdown table with the expected headers and no error, when the schema is a z.object()', () => {
    const { error, value: md } = markdownTableFromZodSchema(car_tire)

    assert.equal(error, undefined)
    assert.notEqual(md, undefined)
    assert.match(md, new RegExp('\\| Key \\| Default \\| Description \\|'))
    assert.match(md, new RegExp('\\|---\\|---\\|---\\|'))
  })

  it('returns the expected table rows and no error, when the schema is a simple z.object()', () => {
    const { error, value: md } = markdownTableFromZodSchema(car_tire)

    assert.equal(error, undefined)
    assert.match(
      md,
      escapedRegExp('| `manufacturer` | `undefined` | Car tire manufacturer |')
    )
    assert.match(
      md,
      escapedRegExp('| `pressure` | `30` | Car tire pressure in PSI |')
    )
  })

  it('returns the expected table rows and no error, when the schema is a complex z.object()', () => {
    const { error, value: md } = markdownTableFromZodSchema(car)

    assert.equal(error, undefined)
    assert.match(
      md,
      escapedRegExp('| `manufacturer` | `undefined` | Car manufacturer |')
    )
    assert.match(md, escapedRegExp('| `model` | `undefined` | Car model |'))
    assert.match(
      md,
      escapedRegExp('| `tires` | `undefined` | Array of 4 elements |')
    )
    assert.match(
      md,
      escapedRegExp(
        '| `year` | `undefined` | Year in which the car was manufactured |'
      )
    )
  })

  it('returns the expected table rows and no error, when the schema is a very nested z.object()', () => {
    const { error, value: md } = markdownTableFromZodSchema(dealership)

    assert.equal(error, undefined)
    assert.match(
      md,
      escapedRegExp('| `owner` | `undefined` | Owner of the dealership |')
    )
    assert.match(
      md,
      escapedRegExp(
        '| `employees` | `undefined` | Employees of the dealership (1 to ∞ elements) |'
      )
    )
    assert.match(
      md,
      escapedRegExp('| `cars` | `[]` | Cars sold by the dealership |')
    )
    assert.match(
      md,
      escapedRegExp(
        '| `motorcycles` | `[]` | Motorcycles sold by the dealership |'
      )
    )
  })

  it('removes the default value from a schema (but not the nested ones)', () => {
    const schema_with_default = z
      .object({
        name: z.string().min(1).default('John').describe('Some name'),
        num: z.string().min(1).max(100).default(42).describe('Some number')
      })
      .default({
        name: 'Luke',
        num: 99
      })

    const schema_without_default = schema_with_default.removeDefault()

    const { value: md_a } = markdownTableFromZodSchema(schema_with_default)
    const { value: md_b } = markdownTableFromZodSchema(schema_without_default)

    assert.match(md_a, escapedRegExp('| `name` | `"John"` | Some name |'))
    assert.match(md_a, escapedRegExp('| `num` | `42` | Some number |'))
    assert.match(md_b, escapedRegExp('| `name` | `"John"` | Some name |'))
    assert.match(md_b, escapedRegExp('| `num` | `42` | Some number |'))
  })
})
