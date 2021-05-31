main = async () => {
    class FileSystem {
        constructor() {}

        async read(path: string): Promise<Blob> {
            return fetch(await library.callKernelInterface("fs.read", path)).then(r => r.blob());
        }
    }

    library.export("fs", context => new FileSystem());
}