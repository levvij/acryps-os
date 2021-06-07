declare const dom: {
    createElement(tag: string, children: (DOMElement | string)[]): DOMElement;
    addStyles(styles: string);

    root: DOMElement;
}

declare class DOMElement {
    tag: string;
    children: (string | DOMElement)[];

    appendTo(parent: DOMElement);
    appendChild(child: DOMElement);
    appendText(text: string);
}