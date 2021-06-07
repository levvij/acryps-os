class Loader {
	console = new Console("loader");

	static interfaces = {};

	constructor(private fs: FileSystem) {}
	
	static expose(name: string, value: (LoaderContext, ...args) => any) {
		Loader.interfaces[name] = value;
	}

	async start(path) {
		const process = new Process(this.fs, path);
		await process.load();
		await process.start();
	}
}

class LoaderContext {
	from: string;
	location: string;

	static from(library: Process, location: string) {
		const context = new LoaderContext();
		context.from = library.name;
		context.location = location;

		return context;
	}
}