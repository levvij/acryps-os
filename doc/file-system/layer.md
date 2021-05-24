# File System Layers
acryps os uses a layered, operation history based file system called `aoss`.

## Operation Based System
Every write to the filesystem is stored in a transation log (layer). 

Example transation log:
| Date    | Path        | Operation        | Content    |
|---------|-------------|------------------|------------|
| 08:00   | `/a`        | create-file      | `Test`     |
| 08:01   | `/b/`       | create-directory | *null*     |
| 08:03   | `/b/1`      | create-file      | `File B 1` |
| 08:05   | `/b/1`      | append           | `is here`  |
| 08:06   | `/a`        | write            | `1234`     |

This transation log would result in
`await fs.list("/")` → `["/a", "/b/"]`<br>
`await fs.read("/a")` → `"1234"`<br>
`await fs.read("/b/1")` → `"File B1is here"`<br>

## Layers
This transation log can be split up into multiple layers. 
Layers can be hosted on separate servers. The url to a server is defined in `endpoint`.
Endpoint urls start with `aoss+http://` for http transfer and `aoss://` / `aoss+https://` for https transfer.

Each layer has a `read-key` and `write-key` which are required to read or write to them.

Example transation log:
| Date    | Path        | Operation        | Content    | Layer                                     |
|---------|-------------|------------------|------------|-------------------------------------------|
| 08:00   | `/a`        | create-file      | `Test`     | <span style="color: blue">layer1</span>   |
| 08:01   | `/b/`       | create-directory | *null*     | <span style="color: orange">layer2</span> |
| 08:03   | `/b/1`      | create-file      | `File B 1` | <span style="color: orange">layer2</span> |
| 08:06   | `/a`        | write            | `1234`     | <span style="color: blue">layer1</span>   |
| 08:06   | `/a`        | append           | `5678`     | <span style="color: orange">layer2</span> |

Output for a file system which has only loaded <span style="color: blue">layer1</span>:
`await fs.list("/")` → `["/a"]`<br>
`await fs.read("/a")` → `"1234"`<br>
`await fs.read("/b/1")` → File does not exist<br>

The file system will emit a different output when <span style="color: blue">layer1</span> and <span style="color: orange">layer2</span> is loaded:
`await fs.list("/")` → <code>["/a"<b>, "/b/"</b>]</code><br>
`await fs.read("/a")` → <code>"1234<b>5678</b>"</code><br>
`await fs.read("/b/1")` → `File B 1`<br>

The file system will always try to write to write from the last loaded layer and will continue upwards if a layer has no write key or trows an exception, for example because it is full.

### Usage in acryps os
Default acryps os layer configuration
| Name    | Usage                             | Mounted on           | Read | Write |
|---------|-----------------------------------|----------------------|------|-------|
| system  | Contains operating system files   | /                    | ✓    | ✗     |
| fslbs   | [fslbs](#fslbs)                   | /system/boot/layers  | ✓    | ✓     |
| user    | User documents, application, ...  | /user/joe            | ✓    | ✓     |

This can be extended like in this example used in a company environnement
| Name        | Usage                                       | Mounted on           | Read | Write                  |
|-------------|---------------------------------------------|----------------------|------|------------------------|
| system      | Contains operating system files             | /                    | ✓    | ✗                      |
| fslbs       | [fslbs](#fslbs)                             | /system/boot/layers  | ✓    | ✓                      |
| cooperation | Company provided applications, documents... | /                    | ✓    | ✗ (Only for admins/IT) |
| user        | User documents, application, ...            | /user/joe            | ✓    | ✓                      |
| team drive  | Shared drive for team, ...                  | /shared/team         | ✓    | ✓                      | 

The read keys for the `system` and the read/write keys for the `user` layer are stored in BIOS memory.

### fslbs
File System Layer Bootstrap contains all keys and endpoint files for the users loaded filesystems.

### Hosting Locations
Default hosting locations
| Layer         | Host                                          |
|---------------|-----------------------------------------------|
| system (prod) | aoss://release.aoss.os.acryps.com             |
| system (test) | aoss://prerelease.aoss.os.acryps.com          |
| fslbs         | aoss://fslbs.aoss.os.acryps.com               |
| user storage  | aoss://n*XX*.s.aoss.os.acryps.com             |