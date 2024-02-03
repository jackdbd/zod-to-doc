import { readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { z } from 'zod'
import {
  licenseLink,
  compactEmptyLines,
  image,
  link,
  toc,
  transcludeFile,
  preincludeFile
} from '@thi.ng/transclude'
import defDebug from 'debug'
import { DEBUG_PREFIX } from './src/constants.js'
import { markdownTableFromZodSchema } from './src/lib.js'
import { car, car_tire } from './fixtures/schemas.mjs'

const debug = defDebug(`${DEBUG_PREFIX}:readme`)

interface CalloutConfig {
  // https://github.com/ikatyang/emoji-cheat-sheet
  emoji: string
  title: string
  message: string
}

const callout = (cfg: CalloutConfig) => {
  const paragraphs = cfg.message.split('\n\n')
  const body = paragraphs.map((p) => `> ${p}`).join('\n>\n')

  const lines = [`> ${cfg.emoji} **${cfg.title}**`, '\n', `>`, '\n', body]
  return lines.join('')
}

const zodToTable = (schema: z.AnyZodObject) => {
  const { error, value } = markdownTableFromZodSchema(schema)
  if (error) {
    return callout({
      emoji: ':warning:',
      title: `Could not generate table from Zod schema: ${error.name}`,
      message: error.message
    })
  } else {
    return value
  }
}

interface Config {
  pkg_root: string
  project_started_in_year: number
}

const main = async ({ pkg_root, project_started_in_year }: Config) => {
  const outdoc = 'README.md'
  const pkg = JSON.parse(readFileSync(join(pkg_root, 'package.json'), 'utf-8'))

  const author = pkg.author
  const pkg_name = pkg.name as string
  const [npm_scope, unscoped_pkg_name] = pkg_name.split('/')
  const github_username = npm_scope.replace('@', '')

  const now = new Date()
  const year = now.getFullYear()

  const transcluded = transcludeFile(join(pkg_root, 'tpl.readme.md'), {
    pre: [preincludeFile],
    post: [toc(), compactEmptyLines],
    user: author,
    templates: {
      badges: () => {
        // https://shields.io/badges/npm-downloads
        // https://shields.io/badges/npm-downloads-by-package-author

        // https://badge.fury.io/js/@jackdbd%2Feleventy-plugin-text-to-speech.svg

        const npm_package = link(
          image(
            `https://badge.fury.io/js/${npm_scope}%2F${unscoped_pkg_name}.svg`,
            'npm version'
          ),
          `https://badge.fury.io/js/${npm_scope}%2F${unscoped_pkg_name}`
          // `https://www.npmjs.com/package/${npm_scope}/${unscoped_pkg_name}`
        )

        const install_size = link(
          image(
            `https://packagephobia.com/badge?p=${npm_scope}/${unscoped_pkg_name}`,
            'install size'
          ),
          `https://packagephobia.com/result?p=${npm_scope}/${unscoped_pkg_name}`
        )

        const socket = link(
          image(
            `https://socket.dev/api/badge/npm/package/${npm_scope}/${unscoped_pkg_name}`,
            'Socket Badge'
          ),
          `https://socket.dev/npm/package/${npm_scope}/${unscoped_pkg_name}`
        )

        const ci_workflow = link(
          image(
            `https://github.com/${github_username}/${unscoped_pkg_name}/actions/workflows/ci.yaml/badge.svg`,
            'CI'
          ),
          `https://github.com/${github_username}/${unscoped_pkg_name}/actions/workflows/ci.yaml`
        )

        const release_workflow = link(
          image(
            `https://github.com/${github_username}/${unscoped_pkg_name}/actions/workflows/release-to-npmjs.yaml/badge.svg`,
            'Release to npmjs.com'
          ),
          `https://github.com/${github_username}/${unscoped_pkg_name}/actions/workflows/release-to-npmjs.yaml`
        )

        const codecov = link(
          image(
            `https://codecov.io/gh/${github_username}/${unscoped_pkg_name}/graph/badge.svg?token=9jddzo5Dt3`,
            'CodeCov badge'
          ),
          `https://codecov.io/gh/${github_username}/${unscoped_pkg_name}`
        )

        const conventional_commits = link(
          image(
            `https://img.shields.io/badge/Conventional%20Commits-1.0.0-%23FE5196?logo=conventionalcommits&logoColor=white`,
            'Conventional Commits'
          ),
          'https://conventionalcommits.org'
        )

        return [
          npm_package,
          install_size,
          codecov,
          ci_workflow,
          release_workflow,
          socket,
          conventional_commits
        ].join('\n')
      },

      'pkg.deps': (ctx) => {
        const entries = Object.entries(pkg.dependencies)

        const rows = entries.map(
          ([name, version]) =>
            `| ${link(name, `https://www.npmjs.com/package/${name}`)} | \`${version}\` |`
        )
        const table = [
          `| Package | Version |`,
          '|---|---|',
          rows.join('\n')
        ].join('\n')

        return [`## Dependencies`, '\n\n', table].join('')
      },

      'pkg.description': pkg.description,

      'pkg.docs': () => {
        const lines = [
          `## Docs`,
          '\n\n',
          `[Docs generated by TypeDoc](https://${github_username}.github.io/${unscoped_pkg_name}/index.html)`,
          '\n\n',
          callout({
            emoji: ':open_book:', // open_book, page_facing_up, page_with_curl
            title: 'API Docs',
            message: `This project uses [API Extractor](https://api-extractor.com/) and [api-documenter markdown](https://api-extractor.com/pages/commands/api-documenter_markdown/) to generate a bunch of markdown files and a \`.d.ts\` rollup file containing all type definitions consolidated into a single file. I don't find this \`.d.ts\` rollup file particularly useful. On the other hand, the markdown files that api-documenter generates are quite handy when reviewing the public API of this project.\n\n*See [Generating API docs](https://api-extractor.com/pages/setup/generating_docs/) if you want to know more*.`
          })
        ]
        return lines.join('')
      },

      'pkg.installation': () => {
        const lines = [
          `## Installation`,
          '\n\n',
          `\`\`\`sh`,
          '\n',
          `npm install --save-dev ${pkg_name}`,
          '\n',
          `\`\`\``
        ]
        return lines.join('')
      },

      'pkg.license': ({ user }) => {
        // https://gist.github.com/lukas-h/2a5d00690736b4c3a7ba
        const copyright =
          year > project_started_in_year
            ? `&copy; ${project_started_in_year} - ${year}`
            : `&copy; ${year}`

        const lines = [
          `## License`,
          '\n\n',
          `${copyright} ${link(user.name, 'https://www.giacomodebidda.com/')} // ${licenseLink(pkg.license)}`
        ]
        return lines.join('')
      },

      'table.car': zodToTable(car),
      'table.tire': zodToTable(car_tire)
    }
  })

  // console.log(`=== ${outdoc} BEGIN ===`)
  // console.log(transcluded.src)
  // console.log(`=== ${outdoc} END ===`)
  writeFileSync(join(pkg_root, outdoc), transcluded.src)
  debug(`${outdoc} updated`)
}

await main({
  pkg_root: '',
  project_started_in_year: 2024
})
