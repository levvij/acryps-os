class Console {
	static root: HTMLElement;
	static cursor: HTMLElement;

	constructor(private name: string) {
		if (!Console.cursor) {
			Console.cursor = document.createElement("ui-cursor");
		}
	}

	log(message: string) {
		Console.root.appendChild(
			document.createTextNode(`${`[ ${this.name.substring(0, 10)} ]`.padEnd(14, " ")} ${message}\n`)
		);

		Console.cursor.parentElement && Console.cursor.remove();
		Console.cursor.textContent = "█";

		Console.root.appendChild(Console.cursor);
	}
}