function renderLogo() {
	document.body.innerHTML = `<svg width="205px" height="28px" viewBox="0 0 205 28">
		<polygon points="93 0 93 9.33333333 83.5 9.33333333 83.5 28 74 28 74 0"></polygon>
		<polygon points="131 28 121.666667 28 121.666667 18.6666667 103 18.6666667 103 0 112.333333 0 112.333333 9.33333333 121.666667 9.33333333 121.666667 0 131 0"></polygon>
		<polygon points="149.333333 28 140 28 140 0 168 0 168 18.6666667 149.333333 18.6666667"></polygon>
		<polygon points="205 0 205 9.33333333 192.561467 9.33333333 204.947267 18.6666667 205 18.6666667 205 28 177 28 177 18.6666667 189.438533 18.6666667 177.0532 9.33333333 177 9.33333333 177 0"></polygon>
		<polygon points="37 28 37 0 65 0 65 9.33333333 46.3333333 9.33333333 46.3333333 18.6666667 65 18.6666667 65 28"></polygon>
		<polygon transform="translate(14.000000, 14.000000) rotate(-270.000000) translate(-14.000000, -14.000000) " points="0 14.737018 0 0 28 0 28 9.33333333 10.551741 9.33333333 28 18.6666667 28 28"></polygon>
	</svg>`;

	const favicon = document.createElement("link");
	favicon.rel = "shortcut icon";
	favicon.type = "image/svg+xml";

	favicon.href = `data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="28px" height="28px" viewBox="-1 -1 30 30">
		<polygon fill="%230F05A0" stroke="white" stroke-width="2" transform="translate(14.000000, 14.000000) rotate(-270.000000) translate(-14.000000, -14.000000) " points="0 14.737018 0 0 28 0 28 9.33333333 10.551741 9.33333333 28 18.6666667 28 28"></polygon>
	</svg>`;

	document.head.appendChild(favicon);
}