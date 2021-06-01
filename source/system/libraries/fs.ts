main = async () => {
    class FileSystem {
        constructor() {}

        async read(path: string): Promise<Blob> {
            return fetch(await library.callKernelInterface("fs.read", path)).then(r => r.blob());
		}

		async write(path: string, content: Blob) {
			await library.callKernelInterface("fs.write", path, URL.createObjectURL(content));
		}

		async append(path: string, content: Blob) {
			await library.callKernelInterface("fs.append", path, URL.createObjectURL(content));
		}

		async createDirectory(path: string) {
			await library.callKernelInterface("fs.create.directory", path);
		}

		async exists(path: string) {
			return await library.callKernelInterface("fs.exists", path);
		}

		async list(path: string) {
			return await library.callKernelInterface("fs.list", path);
		}
    }

    library.export("fs", context => new FileSystem());
}