const fs = require("fs");

fs.writeFileSync(`${process.argv[2]}.lib`, JSON.stringify([
	1, 
	process.argv[2].split("/").pop(), 
	process.argv[3], 
	process.argv[4], 
	process.argv.splice(5), 
	fs.readFileSync(`${process.argv[2]}.js`).toString()
]));
