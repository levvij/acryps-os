main = async () => {
    const element = dom.createElement("ui-desktop", [
        dom.createElement("ui-global-bar", [
            dom.createElement("ui-global-bar-item", ["ACRYPS OS"]),
            dom.createElement("ui-global-bar-item", [new Date().toString()])
        ])
    ]);

    dom.addStyles(await fs.readString(process.asset("styles.css")));

    // load wallpaper
    dom.addStyles(`ui-desktop {
        background-image: url('${URL.createObjectURL(await fs.read(process.asset("default.jpg")))}');
    }`);

    await dom.root.appendChild(element);
}