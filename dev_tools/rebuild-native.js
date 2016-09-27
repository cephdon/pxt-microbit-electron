'use strict';

let childProcess = require('child_process');
let electron = require('electron');
let electronRebuild = require('electron-rebuild');
let path = require('path');

let defaultNodeModules = path.join(__dirname, '..', 'node_modules');
let foldersToRebuild = [
    defaultNodeModules
];
let symLinkedFolders = [
    path.join(path.dirname(require.resolve('pxt-core')), '..', 'node_modules')
];

console.log('Rebuilding native modules...');

symLinkedFolders.forEach((f) => {
    if (f.indexOf(defaultNodeModules) !== 0) {
        foldersToRebuild.push(f);
    }
});

electronRebuild.shouldRebuildNativeModules(electron)
    .then((shouldBuild) => {
        if (!shouldBuild) {
            console.log('It doesn\'t look like you need to rebuild');
            return Promise.resolve();
        }

        let electronVersion = childProcess.execSync(`${electron} --version`, {
            encoding: 'utf8',
        });
        electronVersion = electronVersion.match(/v(\d+\.\d+\.\d+)/)[1];

        let hadError = false;

        return foldersToRebuild.reduce((soFar, currentFolder) => {
            return soFar
                .then(() => {
                    console.log(currentFolder);
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
        console.log('Done!')
    }, (e) => {
        console.error('Failed to rebuild some native modules, see above for details');
    });
