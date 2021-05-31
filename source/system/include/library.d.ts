declare const library: ((name: string) => any) & {
	export(name: string, value: (context: LoaderContext) => any);
	callKernelInterface(name: string, ...args);
}

declare class LoaderContext {
	from: string;
}