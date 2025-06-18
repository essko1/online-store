const fs = require("fs");
const path = require("path");

function loadSQL(queryFileName) {
    const filePath = path.join(process.cwd(), "queries", queryFileName);
    return fs.readFileSync(filePath, "utf8");
}

module.exports = loadSQL;
