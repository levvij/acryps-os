main = async () => {
	class System {
		os: {
			name: string;
			version: string;

			build: {
				id: string;
				time: Date;
			}
		}

		context: LibraryContext

		async load() {
			this.os = {
				name: await fs.readString("/system/properties/os/name"),
				version: await fs.readString("/system/properties/os/version"),
				build: {
					id: await fs.readString("/system/properties/os/build/id"),
					time: new Date(await fs.readString("/system/properties/os/build/time")),
				}
			}

			library.callKernelInterface("dom.title", `${this.os.name} ${this.os.version}-${this.os.build.id}`);
		}
	}

	library.export("system", async context => {
		const system = new System();
		system.context = context;

		await system.load();

		return system;
	});
}