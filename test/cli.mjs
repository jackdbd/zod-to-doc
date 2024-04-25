import assert from 'node:assert'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import * as process from 'node:process'
import { execPath as node } from 'node:process'
import { describe, it } from 'node:test'
import { promisify } from 'node:util'
import { execFile, execFileSync } from 'node:child_process'

const execFileAsync = promisify(execFile)

const filepath = resolve('dist', 'cli.js')
const package_json = JSON.parse(readFileSync(resolve('package.json')))
// const cli_js = readFileSync(filepath, 'utf8')

const onGithub = () => (process.env.GITHUB_SHA ? true : false)

// FIXME: https://github.com/jackdbd/zod-to-doc/issues/3
const skip = onGithub()
  ? `skipped on GitHub because of error: /Users/runner/work/zod-to-doc/zod-to-doc/dist/cli.js EACCES`
  : false

describe('cli', () => {
  it('returns a help message when called with --help', { skip }, () => {
    // This works, but it's not quite as invoking the CLI directly
    // const args = [node, filepath, '--help']
    // const str = execSync(args.join(' ')).toString()
    const str = execFileSync(filepath, ['--help']).toString()
    assert.match(
      str,
      /Generate a markdown table from a Zod schema and write it to a file/
    )
  })

  it(
    'returns the expected version when called with --version',
    { skip },
    () => {
      const str = execFileSync(filepath, ['--version']).toString()

      assert.equal(str.replace('\n', ''), package_json.version)
    }
  )

  it(
    'prints an error to stderr mentioning the missing required arguments, when invoked with no arguments',
    { skip },
    async () => {
      try {
        await execFileAsync(filepath, [])
      } catch (exception) {
        const { stderr, stdout } = exception

        assert.equal(stdout, '')
        assert.match(
          stderr,
          /Missing required arguments: module, schema, placeholder/
        )
      }
    }
  )

  it(
    'prints an error to stderr telling that the ES module does not exist, when the given ES module does not exist',
    { skip },
    async () => {
      try {
        await execFileAsync(filepath, [
          '--module',
          'non-existing-module.mjs',
          '--schema',
          'non_existing_schema',
          '--placeholder',
          'does-not-matter'
        ])
      } catch (exception) {
        const { stderr, stdout } = exception

        assert.equal(stdout, '')
        assert.match(stderr, /module not found/)
      }
    }
  )
})
