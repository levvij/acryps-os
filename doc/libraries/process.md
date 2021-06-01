# Process
Provides process management.

| Path          | `/system/libraries/process.lib`                                     |
|:--------------|:--------------------------------------------------------------------|
| Requires      | *none*                                                              |
| Exports       | `process`                                                           |
| Source        | [process.ts](../../source/system/libraries/process.ts)              |

## Exported Symbol `process`

```
exit(error?: Error | string);
```

## Example
```
async function main() {
	process.exit("hello!");
}
```