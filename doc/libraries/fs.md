# FileSystem
Provides [file system](../file-system/index.md) access.

| Path          | `/system/libraries/fs.lib`                                          |
|:--------------|:--------------------------------------------------------------------|
| Requires      | *none*                                                              |
| Exports       | `fs`                                                                |
| Source        | [fs.ts](../../source/system/libraries/fs.ts)                        |

## Exported Symbol `fs`

```
async read(path: string): Blob;
async write(path: string, content: Blob);
async append(path: string, content: Blob);
async createDirectory(path: string);
async exists(path: string): boolean;
async list(path: string): string[];
```

## Example
```
async function main() {
	const fs = library("fs");
	const console = library("console");

	// write to /test file
	await fs.write("/test", new Blob(["Hello!"]));

	// read /test file
	console.log(await fs.read("/test").then(r => r.text()));
}
```