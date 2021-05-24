// show boot logo
document.body.textContent = "";

renderLogo();

Console.root = document.createElement("ui-console");
document.body.appendChild(Console.root);

async function main() {
	// load bios
	const bios = new BIOS();
	await bios.load();

	const fs = new FileSystem();
	fs.loadLayer(new Layer("system", bios.data.system.endpoint, bios.data.system.id, bios.data.system.key));

	if (!bios.data.user) {
		const layer = await fs.createLayer(
			`User layer ${new Date().toISOString()}`, 
			await fetch("system/boot/layers/user.endpoint").then(r => r.text())
		);

		bios.data.user = {
			id: layer.id,
			endpoint: layer.endpoint,
			keys: {
				read: layer.keys.read,
				write: layer.keys.write
			}
		};

		await bios.save();
	} else {
		fs.loadLayer(new Layer("user", bios.data.user.endpoint, bios.data.user.id, bios.data.user.keys.read, bios.data.user.keys.write));
	}

	// start loader
	const loader = new Loader(fs);
	loader.register("system", "/system/libraries/system.lib");

	loader.registerKernelModule("file-system", fs);
	loader.registerKernelModule("console", Console);

	// load system
	loader.load("system", LoaderContext.systemContext);
}

main();