class BIOS {
	console = new Console("bios");

	data: {
		firstBoot: string,
		system: {
			id: string,
			key: string,
			endpoint: string
		},
		user?: {
			id: string,
			endpoint: string,
			keys: {
				read: string,
				write: string
			}
		}
	};

	async load() {
		this.console.log("load memory");
		this.data = null; // JSON.parse(localStorage["acryps-bios-memory"] || "null");

		if (!this.data) {
			this.console.log("create empty memory");

			this.data = {
				firstBoot: new Date().toISOString(),
				system: {
					id: await fetch("system/boot/layers/root.id").then(r => r.text()),
					key: await fetch("system/boot/layers/root.read.key").then(r => r.text()),
					endpoint: await fetch("system/boot/layers/root.endpoint").then(r => r.text())
				}
			};

			await this.save();
		}

		this.console.log("loaded memory");
	}

	async save() {
		localStorage["acryps-bios-memory"] = JSON.stringify(this.data);

		this.console.log("saved memory");
	}
}