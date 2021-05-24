class FileSystem {
	console = new Console("fs");

	layers = [];

	async createLayer(name, endpoint) {
		this.console.log("create layer");

		const res = await fetch(`${endpoint}/layer`, {
			method: "POST",
			headers: {
				"x-aoss-name": name
			}
		}).then(r => r.json());

		const layer = new Layer(name, endpoint, res.id, res.keys.read, res.keys.write);
		this.loadLayer(layer);

		this.console.log("created layer");

		return layer;
	}

	async loadLayer(layer) {
		this.layers.unshift(layer);
	}

	dispatch(operation, args, error, layerIndex = 0) {
		return new Promise(done => {
			if (!this.layers[layerIndex]) {
				throw new FileSystemError(error);
			}

			this.layers[layerIndex][operation](
				...args,
				res => done(res),
				() => {
					this.dispatch(operation, args, error, layerIndex + 1).then(res => done(res))
				}
			);
		});
	}

	write(path, content) {
		if (path.endsWith("/")) {
			throw new FileSystemError("File name must not end in '/'!");
		}

		return this.dispatch("write", [path, content], `Cannot write '${path}'`); 
	}

	append(path, content) {
		if (path.endsWith("/")) {
			throw new FileSystemError("File name must not end in '/'!");
		}

		return this.dispatch("append", [path, content], `Cannot append to '${path}'`); 
	}

	read(path) {
		if (path.endsWith("/")) {
			throw new FileSystemError("File name must not end in '/'!");
		}

		return this.dispatch("read", [path], `Cannot read '${path}'`) as Promise<Blob>; 
	}

	createDirectory(path) {
		if (!path.endsWith("/")) {
			throw new FileSystemError("Directory name must end in '/'!");
		}

		return this.dispatch("createDirectory", [path], `Cannot create directory '${path}'`); 
	}

	exists(path) {
		return this.dispatch("exists", [path], `Cannot check '${path}' if exists`) as Promise<boolean>; 
	}

	list(path) {
		return this.dispatch("list", [path], `Cannot list '${path}'`) as Promise<string[]>;
	}
}

class Layer {
	id;

	endpoint;
	name;
	keys;

	constructor(name, endpoint, id, readKey, writeKey?) {
		this.name = name;
		this.endpoint = endpoint;
		this.id = id;

		this.keys = {
			read: readKey,
			write: writeKey
		};
	}

	async createDirectory(path, done, next) {
		if (!this.keys.write) {
			return next();
		}

		await fetch(`${this.endpoint}/directory`, {
			method: "POST",
			headers: {
				"x-aoss-path": path,
				"x-aoss-layer": this.id,
				"x-aoss-key": this.keys.write
			}
		}).then(r => r.json());

		done();
	}

	async write(path, content, done, next) {
		if (!this.keys.write) {
			return next();
		}

		content = new Blob([content]);

		await fetch(`${this.endpoint}/write`, {
			method: "POST",
			headers: {
				"x-aoss-path": path,
				"x-aoss-layer": this.id,
				"x-aoss-key": this.keys.write
			},
			body: content
		}).then(r => r.json());

		done();
	}

	async append(path, content, done, next) {
		if (!this.keys.write) {
			return next();
		}

		content = new Blob([content]);

		await fetch(`${this.endpoint}/append`, {
			method: "POST",
			headers: {
				"x-aoss-path": path,
				"x-aoss-layer": this.id,
				"x-aoss-key": this.keys.write
			},
			body: content
		}).then(r => r.json());

		done();
	}

	async read(path, done, next) {
		if (!this.keys.read) {
			return next();
		}

		await fetch(`${this.endpoint}/read?${path}`, {
			method: "POST",
			headers: {
				"x-aoss-path": path,
				"x-aoss-layer": this.id,
				"x-aoss-key": this.keys.read
			}
		}).then(res => {
			if (res.status == 200) {
				done(res.blob());
			} else if (res.status == 204) {
				next();
			} else {
				res.json().then(r => next(new RemoteFileSystemError(r.error)))
			}
		});
	}

	async exists(path, done, next) {
		if (!this.keys.read) {
			return next();
		}

		await fetch(`${this.endpoint}/exists`, {
			method: "POST",
			headers: {
				"x-aoss-path": path,
				"x-aoss-layer": this.id,
				"x-aoss-key": this.keys.read
			}
		}).then(res => res.json()).then(res => {
			if (typeof res == "boolean") {
				done(res);
			} else {
				next(new RemoteFileSystemError(res.error));
			}
		});
	}

	async list(path, done, next) {
		if (!this.keys.read) {
			return next();
		}

		await fetch(`${this.endpoint}/list`, {
			method: "POST",
			headers: {
				"x-aoss-path": path,
				"x-aoss-layer": this.id,
				"x-aoss-key": this.keys.read
			}
		}).then(res => res.json()).then(res => {
			if (res.error) {
				next(new RemoteFileSystemError(res.error));
			} else {
				done(res);
			}
		});
	}
}

class FileSystemError extends Error {}
class RemoteFileSystemError extends FileSystemError {}