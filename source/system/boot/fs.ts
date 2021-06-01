class FileSystem {
	console = new Console("fs");

	layers: Layer[] = [];

	async createLayer(name, endpoint, mount) {
		this.console.log("create layer");

		const res = await fetch(`${FileSystem.resolveEndpoint(endpoint)}/layer`, {
			method: "POST",
			headers: {
				"x-aoss-name": name
			}
		}).then(r => r.json());

		const layer = new Layer(name, endpoint, res.id, mount, res.keys.read, res.keys.write);
		this.loadLayer(layer);

		this.console.log("created layer");

		return layer;
	}

	async loadLayer(layer) {
		this.layers.unshift(layer);
	}

	dispatch(operation: keyof Layer, mountPath: string, args: any[], error: string) {
		// filter layers by mounting point if a path argument is present
		if (mountPath) {
			return this.dispatchOnLayer(operation, args, error, this.layers.filter(layer => mountPath.startsWith(layer.mount)), 0);
		} else {
			return this.dispatchOnLayer(operation, args, error, this.layers, 0);
		}
	}

	dispatchOnLayer(operation: string, args: any[], error: string, layers: Layer[], layerIndex: number) {
		return new Promise(done => {
			if (!layers[layerIndex]) {
				throw new FileSystemError(error);
			}

			layers[layerIndex][operation](
				...args,
				res => done(res),
				() => {
					this.dispatchOnLayer(operation, args, error, layers, layerIndex + 1).then(res => done(res))
				}
			);
		});
	}

	static resolveEndpoint(name) {
		return name
			.replace("aoss+http://", "http://")
			.replace("aoss+https://", "https://")
			.replace("aoss://", "https://")
	}

	write(path, content) {
		if (path.endsWith("/")) {
			throw new FileSystemError("File name must not end in '/'!");
		}

		return this.dispatch("write", path, [path, content], `Cannot write '${path}'`); 
	}

	append(path, content) {
		if (path.endsWith("/")) {
			throw new FileSystemError("File name must not end in '/'!");
		}

		return this.dispatch("append", path, [path, content], `Cannot append to '${path}'`); 
	}

	read(path) {
		if (path.endsWith("/")) {
			throw new FileSystemError("File name must not end in '/'!");
		}

		return this.dispatch("read", path, [path], `Cannot read '${path}'`) as Promise<Blob>; 
	}

	createDirectory(path) {
		if (!path.endsWith("/")) {
			throw new FileSystemError("Directory name must end in '/'!");
		}

		return this.dispatch("createDirectory", path, [path], `Cannot create directory '${path}'`); 
	}

	exists(path) {
		return this.dispatch("exists", null, [path], `Cannot check '${path}' if exists`) as Promise<boolean>; 
	}

	list(path) {
		return this.dispatch("list", path, [path], `Cannot list '${path}'`) as Promise<string[]>;
	}

	nextHost() {
		return this.dispatch("nextHost", null, [], `Cannot find next host`) as Promise<string>;
	}

	async expose() {
		Loader.expose("fs.read", async (context, path) => URL.createObjectURL(await this.read(path)));
		Loader.expose("fs.write", async (context, path, data) => await this.write(path, await fetch(data).then(r => r.blob())));
		Loader.expose("fs.append", async (context, path, data) => await this.append(path, await fetch(data).then(r => r.blob())));
		Loader.expose("fs.create.directory", async (context, path) => await this.createDirectory(path));
		Loader.expose("fs.exists", async (context, path) => await this.exists(path));
		Loader.expose("fs.list", async (context, path) => await this.list(path));
	}
}

class Layer {
	endpoint: string;

	keys: {
		read: string,
		write?: string
	};

	constructor(public name: string, endpoint: string, public id: string, public mount: string, readKey, writeKey?) {
		this.keys = {
			read: readKey,
			write: writeKey
		};

		this.endpoint = FileSystem.resolveEndpoint(endpoint);
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

	async nextHost(done, next) {
		await fetch(`${this.endpoint}/next`, {
			method: "GET"
		}).then(res => res.json()).then(res => {
			if (res) {
				done(res);
			} else {
				next();
			}
		});
	}
}

class FileSystemError extends Error {}
class RemoteFileSystemError extends FileSystemError {}