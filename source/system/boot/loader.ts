class Loader {
	console = new Console("loader");

	constructor(private fs: FileSystem) {}
	
	scopes = {};
	kernelModules = {};

	static loaders = {};

	register(name: string, path: string) {
		this.scopes[name] = path;
	}

	registerKernelModule(name: string, value: any) {
		this.kernelModules[name] = value;
	}

	load(name: string, context: LoaderContext) {
		this.console.log(`load ${name}`);

		return new Promise(async done => {
			const path = this.scopes[name] || name;
			const bundle = JSON.parse(await (await this.fs.read(path)).text());

			const library = {
				loadId: Math.random().toString(16).substring(2),
				name: bundle[1],
				imports: bundle[4],
				code: bundle[5]
			};

			this.scopes[library.name] = path;

			const importedLibraries = {};

			for (let lib of library.imports) {
				console.log(lib, await this.fs.exists(lib))

				if (!(lib in this.scopes) || !(await this.fs.exists(lib))) {
					throw new Error(`Library '${name}' requires missing library '${lib}'`);
				}
			}

			const exports = {};

			const script = document.createElement("script");
			
			script.textContent = `
				Loader.loaders[${JSON.stringify(library.loadId)}](async (library, ${Object.keys(globalThis).filter(key => ![
					"Object"
				].includes(key)).join(", ")}) => {
					let exports;

					${library.code}

					await (typeof main == "function" && main());

					return exports;
				});
			`;

			Loader.loaders[library.loadId] = async builder => {
				delete Loader[library.loadId];

				const communicator = (name => {
					if (!library.imports.includes(name)) {
						throw new Error(`Library '${library.name}' tried to access unregistered library '${name}'`);
					}

					return this.load(name, LoaderContext.fromLibrary(library));
				}) as any;

				communicator.export = (name, value) => {
					exports[name] = value(context);
				};

				communicator.loadKernelModule = name => {
					return this.kernelModules[name];
				};

				await builder(communicator);

				done(communicator.exports);
			};

			document.head.appendChild(script);
		});
	}
}

class LoaderContext {
	from: string;

	static fromLibrary(library) {
		const context = new LoaderContext();
		context.from = library.name;

		return context;
	}

	static get systemContext() {
		const context = new LoaderContext();
		context.from = "<kernel>";

		return context;
	}
}