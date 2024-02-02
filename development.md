# Development

Launch both the TypeScript compiler and the [Node.js test runner](https://nodejs.org/api/test.html) in watch mode:

```sh
npm run dev
```

Whenever you change the public API of this project, you need to run api-extractor with the `--local` flag:

```sh
npx api-extractor run --config ./config/api-extractor.json --verbose --local
```
