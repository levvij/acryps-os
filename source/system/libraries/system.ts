main = async () => {
	const fs = library("fs");

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
				name: await fs.read("/system/properties/os/name"),
				version: await fs.read("/system/properties/os/version"),
				build: {
					id: await fs.read("/system/properties/os/build/id"),
					time: new Date(await fs.read("/system/properties/os/build/time")),
				}
			}
		}
	}

	library.export("system", async context => {
		const system = new System();
		system.context = context;

		await system.load();

		return system;
	});
}