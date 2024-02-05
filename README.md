# Zod to Doc

[![npm package badge](https://badge.fury.io/js/@jackdbd%2Fzod-to-doc.svg)](https://badge.fury.io/js/@jackdbd%2Fzod-to-doc)
[![install size](https://packagephobia.com/badge?p=@jackdbd/zod-to-doc)](https://packagephobia.com/result?p=@jackdbd/zod-to-doc)
[![CI](https://github.com/jackdbd/zod-to-doc/actions/workflows/ci.yaml/badge.svg)](https://github.com/jackdbd/zod-to-doc/actions/workflows/ci.yaml)
[![CodeCov badge](https://codecov.io/gh/jackdbd/zod-to-doc/graph/badge.svg?token=9jddzo5Dt3)](https://codecov.io/gh/jackdbd/zod-to-doc)
[![CodeFactor badge](https://www.codefactor.io/repository/github/jackdbd/zod-to-doc/badge)](https://www.codefactor.io/repository/github/jackdbd/zod-to-doc)
[![Socket Badge](https://socket.dev/api/badge/npm/package/@jackdbd/zod-to-doc)](https://socket.dev/npm/package/@jackdbd/zod-to-doc)
[![Conventional Commits](https://img.shields.io/badge/Conventional%20Commits-1.0.0-%23FE5196?logo=conventionalcommits&logoColor=white)](https://conventionalcommits.org)

Inject your [Zod](https://github.com/colinhacks/zod) schemas into your docs.

- [Installation](#installation)
- [Docs](#docs)
- [Examples](#examples)
  - [Usage as a CLI](#usage-as-a-cli)
    - [Car table](#car-table)
  - [Usage as a library](#usage-as-a-library)
    - [Car tire table](#car-tire-table)
- [Troubleshooting](#troubleshooting)
- [Dependencies](#dependencies)
- [License](#license)

## Installation

```sh
npm install --save-dev @jackdbd/zod-to-doc
```

## Docs

[Docs generated by TypeDoc](https://jackdbd.github.io/zod-to-doc/index.html)

> :open_book: **API Docs**
>
> This project uses [API Extractor](https://api-extractor.com/) and [api-documenter markdown](https://api-extractor.com/pages/commands/api-documenter_markdown/) to generate a bunch of markdown files and a `.d.ts` rollup file containing all type definitions consolidated into a single file. I don't find this `.d.ts` rollup file particularly useful. On the other hand, the markdown files that api-documenter generates are quite handy when reviewing the public API of this project.
>
> *See [Generating API docs](https://api-extractor.com/pages/setup/generating_docs/) if you want to know more*.

## Examples

Here are some tables generated using a couple of Zod schemas exported by [fixtures/schemas.mjs](https://github.com/jackdbd/zod-to-doc/blob/main/fixtures/schemas.mjs).

### Usage as a CLI

Zod to Doc can be used as a CLI. For example, if you run this command and have the correct placeholder in your document (see this `README.md` in raw mode):

```sh
ztd --module ./fixtures/schemas.mjs \
  --schema car \
  --placeholder car-table \
  --title '#### Car table'
```

You get this output:

<!-- BEGIN car-table -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN ztd TO UPDATE -->

#### Car table

| Key | Default | Description |
|---|---|---|
| `manufacturer` | `undefined` | Car manufacturer |
| `model` | `undefined` | Car model |
| `tires` | `undefined` | Array of 4 elements |
| `year` | `undefined` | Year in which the car was manufactured |
<!-- END car-table -->

<!-- Same example, but using [transclude](https://github.com/thi-ng/umbrella/tree/main/packages/transclude). -->

### Usage as a library

Zod to Doc can also be used as a library. For example, the [readme.ts](https://github.com/jackdbd/zod-to-doc/blob/main/readme.ts) file in this repository uses `markdownTableFromZodSchema` to replace a mustache-style placeholder with this markdown table:

#### Car tire table

| Key | Default | Description |
|---|---|---|
| `manufacturer` | `undefined` | Car tire manufacturer |
| `pressure` | `30` | Car tire pressure in PSI |

## Troubleshooting

This package uses the [debug](https://github.com/debug-js/debug) library for logging.
You can control what's logged using the `DEBUG` environment variable.

For example, if you set your environment variables in a `.envrc` file, you can do:

```sh
# print all logging statements
export DEBUG=ztd:*
```

## Dependencies

| Package | Version |
|---|---|
| [zod](https://www.npmjs.com/package/zod) | `^3.22.4` |

## License

&copy; 2024 [Giacomo Debidda](https://www.giacomodebidda.com/) // [MIT License](https://spdx.org/licenses/MIT.html)
