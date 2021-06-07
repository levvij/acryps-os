main = async () => {
	class Process {
		name: string;
		path: string;

		constructor(context: LibraryContext) {
			this.name = context.from;
			this.path = context.location;
		}

		exit(error?: Error | string) {
			(postMessage as any)({
				exit: error
			});
		}

		asset(name: string) {
			return `${this.path}/${name.replace(/^\//, "")}`;
		}
	}

	library.export("process", context => new Process(context));
};