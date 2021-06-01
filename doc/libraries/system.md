# System
Provides system information and includes common libraries.

| Path          | `/system/libraries/fs.lib`                                          |
|:--------------|:--------------------------------------------------------------------|
| Requires      | `console`, `fs`, `process`                                          |
| Exports       | await `system`                                                      |
| Source        | [system.ts](../../source/system/libraries/system.ts)                |

## Exported asynchronous Symbol `system`
```
os: {
	name: string,
	version: string,

	build: {
		id: string,
		time: Date
	}
}

context: LibraryContext
```

## Example
```
async function main() {
	console.log(`Running ${system.os.name} version ${system.os.version}`);
}
```