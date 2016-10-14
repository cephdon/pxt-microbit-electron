"use strict";

let packager = require("electron-packager");
let os = require("os");
let path = require("path");

let options = {
    dir: path.resolve(__dirname, ".."),
    //all: true, // TODO: Enable this, and maybe turn it on/off using a command line arg?
    //"app-copyright": "c Microsoft", // TODO: Ask CELA about this
    //"icon": path.join("path", "to", "our", "icons"), // TODO: Add app icons, see https://github.com/electron-userland/electron-packager/blob/master/docs/api.md#icon for requirements
    ignore: [
        /\.vscode/,
        /dev_tools/,
        /projects/,
        /\.gitignore/,
        /README\.md/
    ],
    //name: "Code the Microbit", // TODO: We can omit this and use what's in package.json, or we can have a kid-friendly name here (package.json uses "-" symbols)
    out: path.resolve(__dirname, "..", "built"),
    overwrite: true,

};

packager(options, (err, appPaths) => {
    if (err) {
        console.error("PACKAGING ERROR(S):");

        if (Array.isArray(err)) {
            err.forEach((e) => {
                console.error(e);
            });
        } else {
            console.error(err);
        }
    } else {
        console.log("Generated the following packaged apps:");
        appPaths.forEach((appPath) => {
            console.log(`    ${appPath}`);
        });
    }
});