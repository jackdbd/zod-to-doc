<!-- Do not edit this file. It is automatically generated by API Documenter. -->

[Home](./index.md) &gt; [@jackdbd/zod-to-doc](./zod-to-doc.md) &gt; [arrayFromZodSchema](./zod-to-doc.arrayfromzodschema.md)

## arrayFromZodSchema variable

Converts a Zod schema into an array of objects.

**Signature:**

```typescript
arrayFromZodSchema: <S extends z.AnyZodObject>(schema: S) => {
    error: Error;
    value?: undefined;
} | {
    value: {
        key: string;
        default: any;
        description: string;
    }[];
    error?: undefined;
}
```
