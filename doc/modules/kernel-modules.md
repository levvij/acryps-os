# Kernel modules
Kernel Modules are located in `/system/boot/` and will be compiled into `main.kernel`.
The modules run on the main page and **every call requires serialization of the parameters and return value**

## Default Modules
| Name                                              | Purpose                                         |
|---------------------------------------------------|-------------------------------------------------|
| [bios.ts](../../source/system/boot/bios.ts)       | Reads or creates BIOS-Memory                    |
| [console.ts](../../source/system/boot/console.ts) | Outputs messages to the startup console         |
| [fs.ts](../../source/system/boot/fs.ts)           | Provides [file system](../file-system/index.md) |
| [loader.ts](../../source/system/boot/loader.ts)   | Responsible for library and application loading |
| [logo.ts](../../source/system/boot/logo.ts)       | Draws the acryps logo at startup                |
| [main.ts](../../source/system/boot/main.ts)       | Contains the kernels `main()` function          |

## Serialization
Passing data from workers to kernel modules is expensive because we cannot share memory except thru [onmessage / postMessage](https://developer.mozilla.org/en-US/docs/Web/API/Worker/onmessage).

The data is sent in a serialized format (JSON)
```
[<type id>, <serialized data>]
```

| Data Type            | Serializer                                                                            | Id   |
|----------------------|---------------------------------------------------------------------------------------|------|
| `string`             | JSON                                                                                  | 1    |
| `boolean`            | JSON                                                                                  | 2    |
| `number`             | JSON                                                                                  | 3    |
| `Blob`               | As [object url](https://developer.mozilla.org/en-US/docs/Web/API/URL/createObjectURL) | 4    |
| `async function`     | Proxy with pointer                                                                    | 5    |
| `Date`               | As ISO Date String                                                                    | 6    |
| `Object`             | JSON, all properties serialized                                                       | 7    |
| `Array`              | JSON, all properties serialized                                                       | 8    |