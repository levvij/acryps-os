main = async () => {
	class Process {
		exit(error?: Error | string) {
			(postMessage as any)({
				exit: error
			});
		}
	}

	library.export("process", context => new Process());
};