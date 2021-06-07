// show boot logo
document.body.textContent = "";

renderLogo();

Console.root = document.createElement("ui-console");
document.body.appendChild(Console.root);

async function main() {
	const console = new Console("main");

	// load bios
	const bios = new BIOS();
	await bios.load();

	const fs = new FileSystem();
	fs.loadLayer(new Layer("system", bios.data.system.endpoint, bios.data.system.id, "/", bios.data.system.key));

	if (!bios.data.fslbs) {
		// create fslbs layer
		// this layer contains all the keys for the user layers
		const fslbs = await fs.createLayer(
			`fslbs ${new Date().toISOString()}`, 
			await fetch("system/boot/layers/fslbs.endpoint").then(r => r.text()),
			"/system/boot/layers"
		);

		// save fslbs layer to the bios
		bios.data.fslbs = {
			id: fslbs.id,
			endpoint: fslbs.endpoint,
			keys: {
				read: fslbs.keys.read,
				write: fslbs.keys.write
			}
		};

		console.log(`created fslbs ${fslbs.id}`);

		// let fslbs choose a new aoss node for us
		const node = await fs.nextHost();
		console.log(`picked aoss node ${node}`);

		// create new user layer in aoss node
		const user = await fs.createLayer(`user @ ${fslbs.id}`, node, "/");
		console.log(`created user layer ${user.id}`);

		// save layer to fslbs
		await fs.createDirectory("/system/boot/layers/");

		await fs.write(`/system/boot/layers/user@${user.id}.layer`, JSON.stringify({
			id: fslbs.id,
			endpoint: node,
			name: `user @ ${fslbs.id}`,
			mount: "/",
			keys: {
				read: user.keys.read,
				write: user.keys.write
			}
		}));

		console.log(`saved user layer to fslbs`);

		// save bios memory
		await bios.save();
	} else {
		// load fslbs layer
		await fs.loadLayer(new Layer("fslbs", bios.data.fslbs.endpoint, bios.data.fslbs.id, bios.data.fslbs.keys.read, bios.data.fslbs.keys.write));

		// load all layers
		for (let layer of await fs.list("/system/boot/layers/")) {
			const configuration = JSON.parse(await fs.read(layer).then(r => r.text()));
			
			await fs.loadLayer(new Layer(configuration.name, configuration.endpoint, configuration.id, configuration.mount, configuration.keys.read, configuration.keys.write));
		}
	}

	// start loader
	const loader = new Loader(fs);

	console.log([1, ...await fs.list("/system/boot/modules/"), 2].join(" - "));

	// load kernel modules from /system/boot/modules
	for (let file of await fs.list("/system/boot/modules")) {
		if (file.endsWith(".kernel")) {
			console.log(`loading '${file}'`);

			const kernelGlobals = {
				loader,
				fs,
				bios,
				Loader,
				Console,
				Process,
				Library,
				module: file
			};

			const id = Math.random().toString(16).substring(2);
			const kernel = await fs.read(file).then(file => file.text());
			const exposedKeys = Object.keys(kernelGlobals);

			const script = document.createElement("script");
			script.textContent = `window[${JSON.stringify(`${id}_main`)}] = async (${exposedKeys}) => { eval(${JSON.stringify(kernel)}) }; window[${JSON.stringify(`${id}_ready`)}]()`;

			window[`${id}_ready`] = () => {
				window[`${id}_main`](...exposedKeys.map(k => kernelGlobals[k]));
			};

			document.head.appendChild(script);
		}
	}

	const dom = new DOM(document.body);

	// expose kernel interfaces
	Console.expose();
	fs.expose();
	dom.expose();

	// start desktop
	loader.start("/system/applications/desktop.app");
}

main();