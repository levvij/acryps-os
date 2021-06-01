# Kernel modules
The system kernel is located in `/system/boot/` and will be compiled into `main.kernel`. The main kernel will load all `.kernel` files from `/system/boot/modules`. 

The modules run on the main page and **every call requires a asynchronous [onmessage / postMessage](https://developer.mozilla.org/en-US/docs/Web/API/Worker/onmessage)**. Each roundtrip **takes around 0.5ms to resolve**.

## Default Modules
| Name                                              | Purpose                                         |
|---------------------------------------------------|-------------------------------------------------|
| [bios.ts](../../source/system/boot/bios.ts)       | Reads or creates BIOS-Memory                    |
| [console.ts](../../source/system/boot/console.ts) | Outputs messages to the startup console         |
| [fs.ts](../../source/system/boot/fs.ts)           | Provides [file system](../file-system/index.md) |
| [loader.ts](../../source/system/boot/loader.ts)   | Responsible for library and application loading |
| [logo.ts](../../source/system/boot/logo.ts)       | Draws the acryps logo at startup                |
| [main.ts](../../source/system/boot/main.ts)       | Contains the kernels `main()` function          |

## Exported Kernel Interfaces
A kernel module can export an `interface`
```
Loader.expose("my-interface", async (context, argument1) => console.log(context, argument1));
```

Which can be called from a library loaded in a WebWorker
```
await library.callKernelInterface("my-interface", "Test value for argument 1");
```

All arguments must be serializeable and every call is asynchronous.
Use `URL.createObjectURL` to transfer `Blob`s.

The library should provide *easy to use* methods which call kernel interfaces as rarely as possible, as shown in the example below.

Kernel module:
```
class Counter {
	static counters = {};

	id: string;
	count: number;

	constuctor() {
		this.id = Math.random().toString();
		this.count = 0;

		Counter.counters[this.id] = this;
	}

	increment() {
		this.count++;
	}
}

Loader.expose("counter.create", async (context) => (new Counter()).id);
Loader.expose("counter.read", async (context, id) => Counter.counters[id].count);
Loader.expose("counter.increment", async (context, id) => Counter.counters[id].increment());
```

Library side
```
class Counter {
	private id: string;
	private start: Promise<string>;

	constructor() {
		this.start = library.callKernelInterface("counter.create").then(id => this.id = id);
	}

	async read() {
		await this.start; // wait for counter.create to resolve

		return await library.callKernelInterface("counter.read", this.id);
	}

	async increment() {
		await this.start; // wait for counter.create to resolve

		await library.callKernelInterface("counter.increment", this.id);
	}
}

const counter = new Counter();
console.log(await counter.read()); // -> 0

await counter.increment();
console.log(await counter.read()); // -> 1
```

## Creating kernel modules
Modules located in `/system/boot/modules` with the extension `.kernel` will automatically be loaded when the system starts. The `.kernel` file must be a JavaScript file. 

Kernel modules have unrestricted access to `window`.
The modules get access to these kernel globals:

| Global                     | Purpose                                         |
|----------------------------|-------------------------------------------------|
| `loader: Loader`           | Kernels main loader used to start processes     |
| `fs: FileSystem`           | File System                                     |
| `bios: BIOS`               | BIOS interface                                  |
| `Loader: typeof Loader`    | Loader class                                    |
| `Console: typeof Console`  | Global startup console                          |
| `Process: typeof Process`  | Process class                                   |
| `Library: typeof Library`  | Library class                                   |
| `module: string`           | Path of current module                          |