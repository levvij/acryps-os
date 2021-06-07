main = async () => {
    class DOM {
        createElement(tag: string, children: (DOMElement | string)[]) {
            return new DOMElement(tag, children);
        }

        static toTransferable(element: DOMElement) {
            return {
                id: element.id,
                tag: element.tag,
                parent: element.parent?.tag != "*" && element.parent?.id,
                content: element.children.map(child => typeof child == "string" ? child : DOM.toTransferable(child))
            }
        }

        addStyles(style: string) {
            library.callKernelInterface("dom.style", style);
        }

        root = new DOMElement("*", []);
    }

    class DOMElement {
        readonly id: string;
        parent: DOMElement;

        constructor(
            public readonly tag: string, 
            public children: (DOMElement | string)[]
        ) {
            this.id = Math.random().toString(16).substr(2);
        }

        appendTo(parent: DOMElement) {
            this.parent = parent;

            library.callKernelInterface("dom.append", DOM.toTransferable(this));
        }

        appendChild(child: DOMElement) {
            this.children.push(child);

            child.appendTo(this);
        }

        appendText(content: string) {
            this.children.push(content);
        }
    }

    library.export("dom", context => new DOM());
}