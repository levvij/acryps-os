main = async () => {
    class FileSystem {
        constructor() {}

        async read(path: string): Promise<Blob> {
            return fetch(await library.callKernelInterface("fs.read", path)).then(r => r.blob());
		}

		async readString(path: string): Promise<string> {
			return await this.read(path).then(r => r.text());
		}

		async readBuffer(path: string): Promise<string> {
			return await this.read(path).then(r => r.text());
		}

		async readJSON(path: string): Promise<string> {
			return await this.read(path).then(r => r.text()).then(r => JSON.parse(r));
		}

		async write(path: string, content: Blob) {
			await library.callKernelInterface("fs.write", path, URL.createObjectURL(content));
		}

		async writeString(path: string, content: string) {
			await this.write(path, new Blob([content]));
		}

		async writeBuffer(path: string, content: ArrayBuffer) {
			await this.write(path, new Blob([content]));
		}

		async writeJSON(path: string, content: any) {
			await this.write(path, new Blob([JSON.stringify(content)]));
		}

		async append(path: string, content: Blob) {
			await library.callKernelInterface("fs.append", path, URL.createObjectURL(content));
		}

		async appendString(path: string, content: string) {
			await this.append(path, new Blob([content]));
		}

		async appendBuffer(path: string, content: ArrayBuffer) {
			await this.append(path, new Blob([content]));
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