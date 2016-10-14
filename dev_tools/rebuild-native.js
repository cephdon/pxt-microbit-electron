"use strict";

let childProcess = require("child_process");
let electron = require("electron");
let electronRebuild = require("electron-rebuild");
let fs = require("fs");
let path = require("path");
let rimraf = require("rimraf");

// KEEP THIS UPDATED: Some modules need to have their built directory cleaned before rebuilding. Put any such known modules in this list.
let knownNativeModules = [
    {
        packageName: "serialport",
        cleanDir: path.join("build", "release")
    }
];

let localNodeModules = path.join(__dirname, "..", "node_modules");
let foldersToRebuild = [
    localNodeModules
];

function findFinalLinkTarget(p) {
    let foundFinal = false;
    let target = p;

    while (!foundFinal) {
        try {
            target = fs.readlinkSync(target);
        } catch (e) {
            foundFinal = true;
        }
    }

    return target;
}

electronRebuild.shouldRebuildNativeModules(electron)
    .then((shouldBuild) => {
        if (!shouldBuild) {
            console.log("It doesn't look like you need to rebuild");
            return Promise.resolve();
        }

        console.log("Detecting linked modules (\"npm link\")...");
        fs.readdirSync(localNodeModules).forEach((m) => {
            let moduleRootPath = path.resolve(localNodeModules, m);
            let stat = fs.statSync(moduleRootPath);

            if (stat.isDirectory()) {
                let target = path.resolve(findFinalLinkTarget(moduleRootPath));

                if (target !== moduleRootPath) {
                    console.log(`    Detected npm link: ${m}`);
                    foldersToRebuild.push(path.join(target, "node_modules"));
                }
            }
        });

        console.log("Cleaning known native modules...");
        // TODO: Also clean up nested dependencies, not just our direct dependencies
        foldersToRebuild.forEach((f) => {
            knownNativeModules.forEach((nm) => {
                let fullPackagePath = path.join(f, nm.packageName);

                if (fs.existsSync(fullPackagePath)) {
                    let fullBuildDir = path.join(fullPackagePath, nm.cleanDir);

                    console.log(`    Cleaning ${fullBuildDir}`);
                    rimraf.sync(fullBuildDir);
                }
            });
        });

        console.log("Rebuilding native modules...");

        let electronVersion = childProcess.execSync(`${electron} --version`, {
            encoding: "utf8",
        });
        electronVersion = electronVersion.match(/v(\d+\.\d+\.\d+)/)[1];

        let hadError = false;

        return foldersToRebuild.reduce((soFar, currentFolder) => {
            return soFar
                .then(() => {
                    console.log(`    ${currentFolder}`);
                    return electronRebuild.rebuildNativeModules(electronVersion, currentFolder);
                })
                .then(() => electronRebuild.preGypFixRun(currentFolder, true, electron))
                .catch((e) => {
                    hadError = true;
                    console.error(e);
                });
        }, electronRebuild.installNodeHeaders(electronVersion))
            .then(() => {
                if (hadError) {
                    throw new Error();
                }
            });
    })
    .then(() => {
        console.log("Done!")
    }, (e) => {
        console.error("Failed to rebuild some native modules, see above for details");
    });
