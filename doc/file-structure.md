# File Structure
| Path                          | Purpose                           | Layer<sup>1</sup> |
|-------------------------------|-----------------------------------|-------------------|
| `/`                           | File System Root                  | system            |
| `/system `                    | System Components                 | system            |
| `/system/boot  `              | Main Kernel<sup>2</sup>           | system            |
| `/system/libraries`           | System Libraries<sup>2</sup>      | system            |
| `/system/properties`          | System Properties<sup>3</sup>     | system            |
| `/system/applications`        | System Applications<sup>2</sup>   | system            |
| `/system/include`<sup>4</sup> | Operating System Type Definitions | system            |
| `/users/`                     | Users Directory                   | system            |
| `/users/joe/applications`     | User Applications                 | user              |
| `/users/joe/documents`        | User Documents                    | user              |
| `/users/joe/desktop`          | User Desktop                      | user              |
| `/users/joe/keys`             | User Keys                         | user              |
| `/users/joe/configuration`    | User Configuration                | user              |

<sup>1</sup>: Default [file system layer](layers) containing files
<sup>2</sup>: Compiled bundles (`.lib`)
<sup>3</sup>: Generated at build time
<sup>4</sup>: Only in source, will not be compiled