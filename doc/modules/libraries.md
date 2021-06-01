# Libraries
acryps os provides libraries for common operations.

## Default Libraries
- []

## Loading Libraries
Every process/application defines a list of required libraries, which are [loaded in every process worker](../process/lifecycle.md).
Each library contains a async `main` function which will be called on load.
```
main = async () => {
	// library code
}
```

A library can export a symbol with a library.export resolver. The `context` argument is a [a `LibraryContext` object](../../source/system/include/library.d.ts) and will be automatically created
```
main = async () => {
	class ExampleLibrary {
		test() {}
	}

	library.export("exampleLibrary", context => new ExampleLibrary());
}
```

All exported symbols are automatically available in libraries or processes. Make sure to include the library while *glueing*!

Libraries can communicate with the kernel using [kernel interfaces](kernel.md)