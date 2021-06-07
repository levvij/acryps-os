// Loads libraries
declare const library: ((name: string) => any) & {
	// export symbol
	// @doc modules/library.md
	export(name: string, resolver: (context: LibraryContext) => any);

	// calls kernel interface
	// @doc modules/kernel.md
	callKernelInterface(name: string, ...args);
}

// Passed to export library.export resolver
declare class LibraryContext {
	// Contains process name or library id
	from: string;

	// .app/.lib location
	location: string;
}