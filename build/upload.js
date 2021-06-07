const local = require("fs");
const FileSystem = require(`${__dirname}/fs.js`);
FileSystem.fetch = require("node-fetch");

const prefix = "dist/";
const endpoint = process.argv[2];
const fslbs = process.argv[3];

const fs = new FileSystem();

async function scan(layer, path, dest) {
	for (let file of local.readdirSync(`${prefix}${path}`)) {
		if (local.lstatSync(`${prefix}${path}${file}`).isDirectory()) {
			await layer.createDirectory(`/${path}${file.replace(/_$/, "")}/`);
			await scan(layer, `${path}${file}/`, `${dest}${file.replace(/_$/, "")}/`);
		} else {
			await layer.write(`/${dest}${file}`, local.readFileSync(`${prefix}${path}${file}`));
		}
	}
}

fs.createLayer(`ACRYPS OS build ${new Date().toISOString()}`, endpoint).then(async layer => {
	await scan(fs, "", "");

	local.mkdirSync("dist/system/boot/layers", { recursive: true });
	local.writeFileSync("dist/system/boot/layers/root.id", layer.id);
	local.writeFileSync("dist/system/boot/layers/root.read.key", layer.keys.read);
	local.writeFileSync("dist/system/boot/layers/root.endpoint", endpoint);
	local.writeFileSync("dist/system/boot/layers/fslbs.endpoint", fslbs);

	console.log(`[upload] uploaded to ${endpoint} as ${layer.id}`);
});