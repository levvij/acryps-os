class DOM {
    elements: { [key: string]: HTMLElement }

    constructor(public root: HTMLElement) {}

    create(element: DOMElement) {
        const node = document.createElement(element.tag);
        node.id = element.id;

        for (let content of element.content) {
            if (typeof content == "string") {
                node.appendChild(document.createTextNode(content));
            } else {
                node.appendChild(this.create(content));
            }
        }

        if (element.parent) {
            this.elements[element.parent].appendChild(node);
        } else {
            this.root.appendChild(node);
        }

        return node;
    }

    expose() {
        Loader.expose("dom.title", (context, title) => document.title = title);

        Loader.expose("dom.append", (console, element: DOMElement) => {
            this.create(element);
        });

        Loader.expose("dom.style", (context, styles) => {
            const element = document.createElement("style");
            element.textContent = styles;

            this.root.appendChild(element);
        });
    }
}

class DOMElement {
    id: string;
    tag: string;
    content: (DOMElement | string)[];

    parent: string;
}