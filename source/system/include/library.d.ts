declare const library: ((name: string) => any) & {
	export(name, value: (LoaderContext) => any);
	loadKernelModule(name);
}

declare class LoaderContext {
	from: string;
}