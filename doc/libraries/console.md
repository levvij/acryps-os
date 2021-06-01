# Console
Provides global console output.

| Path          | `/system/libraries/fs.lib`                                          |
|:--------------|:--------------------------------------------------------------------|
| Requires      | *none*                                                              |
| Exports       | `console`                                                           |
| Source        | [console.ts](../../source/system/libraries/console.ts)              |

## Exported Symbol `console`

```
log(message: string);
```

## Example
```
async function main() {
	const console = library("console");

	console.log("hello!");
}
```