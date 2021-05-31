class Process {
	name: string;
	version: string;
	libraries: Library[] = [];
	main: string;

	worker: Worker;

	constructor(public fs: FileSystem, public path: string) {}

	async load() {
		const bundle = JSON.parse(await this.fs.read(this.path).then(r => r.text()));

		this.name = bundle[0];
		this.version = bundle[1];
		this.main = bundle[3];
		
		await this.loadLibraries(bundle[2]);
	}

	async loadLibraries(names: string[]) {
		for (let lib of names) {
			const library = new Library(this.fs, lib);
			await library.load();

			this.libraries.push(library);
		}
	}

	async start() {
		const body = await this.build();
		const blob = new Blob([body]);

		console.log("RUNNING", body);
		
		this.worker = new Worker(URL.createObjectURL(blob));
		
		this.worker.onmessage = async event => {
			const message = event.data;
			console.log("MESSAGE", message);

			if ("exit" in message) {
				console.log("EXIT", message.exit);

				this.worker.terminate();
			} else if (message.interface) {
				const iface = Loader.interfaces[message.interface];
				console.log(iface, message.interface);

				const resolved = await iface(LoaderContext.from(this), ...message.arguments);
				console.log(resolved);

				this.worker.postMessage({
					id: message.id,
					result: resolved
				});
			}
		}

		this.worker.onerror = error => {
			console.log("ERROR", error);
		}

		this.worker.postMessage("start");

		console.log(this.worker);
	}

	async build() {
		return `
			${Library.global}

			const process = {
				exit(error) {
					postMessage({exit: error});

					while (true) {}
				}
			}

			async function main(library) {
				${this.libraries.map(l => l.build()).join("\n")}

				eval(${JSON.stringify(this.main)});

				typeof main !== "undefined" && await main();
			}

			onmessage = async event => {
				const message = event.data;

				if (message == "start") {
					await main(name => {
						return Library.symbols[name].value(LoaderContext.from(${JSON.stringify(this.name)}));
					});
				} else {
					Library.handle(message);
				}
			};
		`;
	}
}