class Process {
    static processes: Process[] = [];

    onerror(error: Error) {
        console.error(error);
    }

    running = false;
    forzen = false;

    cpuTime = 0;

	name: string;
	version: string;
	libraries: Library[] = [];
	main: string;

	worker: Worker;

    ping: {
        time?: DOMHighResTimeStamp,
        timeout?: number,
        handler?: () => void
    } = {};

	constructor(public fs: FileSystem, public path: string) {
        Process.processes.push(this);
    }

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
		
		this.worker = new Worker(URL.createObjectURL(blob));
		
		this.worker.onmessage = async event => {
			const message = event.data;
			
            if (message == "ping") { 
                this.ping.handler();
            } else if ("exit" in message) {
				this.exit(message.exit);
			} else if (message.interface) {
				const iface = Loader.interfaces[message.interface];
				
                if (!iface) {
                    this.exit(new Error(`'${this.name}' tried to access undefined interface '${message.interface}'.`));
                }

				const resolved = await iface(LoaderContext.from(this, this.path), ...message.arguments);

				this.worker.postMessage({
					id: message.id,
					result: resolved
				});
			}
		}

		this.worker.onerror = error => {
			console.log("ERROR", error);
		};

		this.worker.postMessage("start");
        this.sendPing();

        this.running = true;
	}

    exit(error) {
        this.worker.terminate();
        this.running = false;

        if (error) {
            this.onerror(error);
        }
    }

    async sendPing() {
        const start = performance.now();

        this.ping.time = start;
        this.ping.handler = () => {
            if (this.running) {
                this.forzen = false;
                this.cpuTime = performance.now() - start;

                clearInterval(this.ping.timeout);

                setTimeout(() => {
                    if (this.running) {
                        this.sendPing();
                    }
                }, 1000);
            }
        }

        this.ping.timeout = setInterval(() => {
            this.forzen = true;
            this.cpuTime = performance.now() - start;
        }, 1000);

        this.worker.postMessage("ping");
    }

	async build() {
		return `
			${Library.global}

			async function main(library) {
				${this.libraries.map(l => l.build()).join("\n")}

				const symbols = Object.keys(Library.symbols);

				const scopedMain = new Function(...symbols, ${JSON.stringify(`(async () => {
					${this.main}

					typeof main !== "undefined" && main();
				})()`)});

				for (let i = 0; i < symbols.length; i++) {
					symbols[i] = await library(symbols[i]);
				}

				scopedMain(...symbols);
			}

			onmessage = async event => {
				const message = event.data;

				if (message == "start") {
					await main(name => {
						return Library.symbols[name].value(LoaderContext.from(${JSON.stringify(this.name)}, ${JSON.stringify(this.path)}));
					});
				} else if (message == "ping") {
                    postMessage("ping");
                } else {
					Library.handle(message);
				}
			};
		`;
	}
}