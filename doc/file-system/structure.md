# File Structure
File structure used in acryps os

| Path                          | Purpose                           | Layer<sup>1</sup> |
|-------------------------------|-----------------------------------|-------------------|
| `/`                           | File System Root                  | system            |
| `/system`                     | System Components                 | system            |
| `/system/boot`                | Main Kernel<sup>2</sup>           | system            |
| `/system/boot/layers`         | Main FS Layer Keys/Endpoints      | fslbs<sup>3</sup> |
| `/system/libraries`           | System Libraries<sup>2</sup>      | system            |
| `/system/properties`          | System Properties<sup>4</sup>     | system            |
| `/system/applications`        | System Applications<sup>2</sup>   | system            |
| `/system/include`<sup>5</sup> | Operating System Type Definitions | system            |
| `/users/`                     | Users Directory                   | system            |
| `/users/joe/applications`     | User Applications                 | user              |
| `/users/joe/documents`        | User Documents                    | user              |
| `/users/joe/desktop`          | User Desktop                      | user              |
| `/users/joe/keys`             | User Keys                         | user              |
| `/users/joe/configuration`    | User Configuration                | user              |

<sup>1</sup>: Default [file system layer](layers) containing files
<sup>2</sup>: Compiled bundles (`.lib`, `.kernel`, ...)
<sup>3</sup>: [File System Layer Bootstrap](layers#fslbs)
<sup>4</sup>: Generated at build time
<sup>5</sup>: Only in source, will not be compiled