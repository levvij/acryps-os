const Console = library.loadKernelModule("console");

library.export("console", context => new Console(context.from))