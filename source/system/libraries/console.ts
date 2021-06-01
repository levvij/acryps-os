main = async () => {
    await library.callKernelInterface("console.create");

    class Console {
        constructor() {}

        log(message: string) {
            library.callKernelInterface("console.log", message);
        }
	}

    library.export("console", context => new Console());
}