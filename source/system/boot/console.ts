class Console {
	static root: HTMLElement;
	static cursor: HTMLElement;
	static consoles: { [key: string]: Console } = {};

	constructor(private name: string) {
		if (!Console.cursor) {
			Console.cursor = document.createElement("ui-cursor");
		}

		Console.consoles[name] = this;
	}

	log(message: string) {
		Console.root.appendChild(
			document.createTextNode(`${`[ ${this.name.substring(0, 10)} ]`.padEnd(14, " ")} ${message}\n`)
		);

		Console.cursor.parentElement && Console.cursor.remove();
		Console.cursor.textContent = "█";

		Console.root.appendChild(Console.cursor);
	}

	static expose() {
		Loader.expose("console.create", context => new Console(context.from));
		Loader.expose("console.log", (context, message) => Console.consoles[context.from].log(message));
	}
}