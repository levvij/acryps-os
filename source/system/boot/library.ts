class Library {
	id: string;
	name: string;
	version: string;
	main: string;

	libraries: Library[] = [];

	constructor(public fs: FileSystem, public path: string) {}

	async load() {
		const bundle = JSON.parse(await this.fs.read(this.path).then(r => r.text()));

		this.id = bundle[1];
		this.name = bundle[2];
		this.version = bundle[3];
		this.main = bundle[5];

		await this.loadLibraries(bundle[4]);
	}

	async loadLibraries(names: string) {
		for (let lib of names) {
			const library = new Library(this.fs, lib);
			await library.load();

			this.libraries.push(library);
		}
	}

	build() {
		return `
		${this.libraries.map(l => l.build()).join("\n")}
		
		await (async library => {
			const symbols = Object.keys(Library.symbols);

			const scopedMain = new Function(...symbols, ${JSON.stringify(`return new Promise(async done => {
				${this.main}

				typeof main !== "undefined" && await main();
				done();
			})`)});

			await scopedMain(...symbols.map(scope => await library(scope)));
		})(${this.loader})`;
	}

	get loader() {
		return `(() => {
			const load = function (name) {
				return Library.symbols[name].value(LoaderContext.from(${JSON.stringify(this.id)}));
			};

			load.callKernelInterface = (name, ...args) => {
				const id = Math.random().toString();

				return new Promise(done => {
					Library.queue[id] = data => {
						done(data.result);
					};

					postMessage({
						id, 
						interface: name,
						arguments: args
					});
				});
			};

			load.export = (name, value) => {
				Library.symbols[name] = {
					value,
					provider: ${JSON.stringify(this.id)}
				};
			};

			return load;
		})()`;
	}

	static get global() {
		return `
		
		class LoaderContext {
			static from(name) {
				return {
					from: name
				};
			}
		}

		Library = {
			symbols: {},
			queue: {},

			handle(message) {
				Library.queue[message.id](message);
			}
		};
		
		`;
	}
}