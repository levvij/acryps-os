# Modules
acryps os contains multiple types of modules

| Type                                | Purpose                         | Access to                 | Integrateable from      | Running in   |
|-------------------------------------|---------------------------------|---------------------------|-------------------------|--------------|
| [kernel modules](kernel.md)         | Low level access                | `window`, DOM, ...        | library, boot           | Main page    |
| [library](libraries.md)             | APIs/Frameworks for general use | kernel modules, libraries | applications, libraries | Each worker  |