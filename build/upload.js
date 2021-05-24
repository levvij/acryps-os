const local = require("fs");
const FileSystem = require(`${__dirname}/fs.js`);
FileSystem.fetch = require("node-fetch");

const prefix = "dist/";
const endpoint = "http://localhost:5101";

const fs = new FileSystem();

async function scan(layer, path) {
	for (let file of local.readdirSync(`${prefix}${path}`)) {
		if (local.lstatSync(`${prefix}${path}${file}`).isDirectory()) {
			await layer.createDirectory(`/${path}${file}/`);

			await scan(layer, `${path}${file}/`);
		} else {
			await layer.write(`/${path}${file}`, local.readFileSync(`${prefix}${path}${file}`));
		}
	}
}

fs.createLayer(`ACRYPS OS build ${new Date().toISOString()}`, endpoint).then(async layer => {
	await scan(fs, "");

	local.mkdirSync("dist/system/boot/layers", { recursive: true });
	local.writeFileSync("dist/system/boot/layers/root.id", layer.id);
	local.writeFileSync("dist/system/boot/layers/root.read.key", layer.keys.read);
	local.writeFileSync("dist/system/boot/layers/root.endpoint", endpoint);

	local.writeFileSync("dist/system/boot/layers/user.endpoint", endpoint);
});