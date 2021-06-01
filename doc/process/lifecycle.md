# Process Lifecycle
All processes run in a [WebWorker](https://developer.mozilla.org/en-US/docs/Web/API/Worker)

1. Load process bundle (`.app` file)
2. Load required libraries (as referenced in bundle)
3. Create WebWorker
4. Run [libraries `async main()` function](../modules/libraries.md#Loading%20Libraries)
5. Wait for `start` signal from kernel
6. *Run process `async main()` function*
7. Exit process (send `exit` signal to kernel)
8. Terminate WebWorker