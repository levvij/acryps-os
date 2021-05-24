# File Structure
File structure used in acryps os

| Path                        | Purpose                           | Layer [^1] |
|-----------------------------|-----------------------------------|------------|
| `/`                         | File System Root                  | system     |
| `/system`                   | System Components                 | system     |
| `/system/boot`              | Main Kernel [^2]                  | system     |
| `/system/boot/layers`       | Main FS Layer Keys/Endpoints      | fslbs [^3] |
| `/system/libraries`         | System Libraries [^2]             | system     |
| `/system/properties`        | System Properties [^4]            | system     |
| `/system/applications`      | System Applications [^2]          | system     |
| `/system/include` [^5]      | Operating System Type Definitions | system     |
| `/users/`                   | Users Directory                   | system     |
| `/users/joe/applications`   | User Applications                 | user       |
| `/users/joe/documents`      | User Documents                    | user       |
| `/users/joe/desktop`        | User Desktop                      | user       |
| `/users/joe/keys`           | User Keys                         | user       |
| `/users/joe/configuration`  | User Configuration                | user       |

[^1]: Default [file system layer](layers) containing files
[^2]: Compiled bundles (`.lib`, `.kernel`, ...)
[^3]: [File System Layer Bootstrap](layers#fslbs)
[^4]: Generated at build time
[^5]: Only in source, will not be compiled