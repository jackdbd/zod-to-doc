# Zod to Doc

{{badges}}

{{pkg.description}}

<!-- toc -->

{{pkg.installation}}

{{pkg.docs}}

## Examples

Here are some tables generated using a couple of Zod schemas exported by [fixtures/schemas.mjs](./fixtures/schemas.mjs).

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

Zod to Doc can also be used as a library. For example, the [readme.ts](./readme.ts) file in this repository uses `markdownTableFromZodSchema` to replace a mustache-style placeholder with this markdown table:

#### Car tire table

{{table.car_tire}}

<!-- include troubleshooting.md -->

{{pkg.deps}}

{{pkg.license}}
