const fs = library.loadKernelModule("file-system");

class System {
	name: string;
	version: string;

	build: {
		id: string,
		time: number
	};

	async load() {
		this.name = await (await fs.read("/system/properties/os/name")).text();
		this.version = await (await fs.read("/system/properties/os/version")).text();

		this.build = {
			id: await (await fs.read("/system/properties/os/build/id")).text(),
			time: +(await (await fs.read("/system/properties/os/build/time")).text())
		}

		console.log(`${this.name} ${this.version}-${this.build.id}`);
	}
}

async function main() {
	const system = new System();
	await system.load();

	library.export("system", () => system);
}