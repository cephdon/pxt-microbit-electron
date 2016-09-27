# PXT micro:bit Electron app

A prototype for an offline (not quite there yet) standalone client of PXT.

This is an electron wrapper around the web app.

## Installation
```
git clone https://github.com/Microsoft/pxt-microbit-electron.git
```

If you want to link your local repos:
```
npm link ../pxt
npm link ../pxt-microbit
```

Finally:
```
npm install
```

Please see the Error section below if you get errors during installation.

To remove links to your local repos, uninstall them from node_modules and reinstall them from NPM:
```
npm uninstall pxt-core
npm uninstall pxt-microbit
npm install
```

## Launching the Electron app
```
npm start
```

Please see the Error section below if you get errors while running the app (such as weird DLL errors).

## Errors while installing or running
If your Node version differs from Electron's Node version, you will need to rebuild some native modules in the dependencies of the web app.

#### Requirements
- [Python 2.x](https://www.python.org/downloads/) (__NOT 3.x__); make sure `python` is in your global Path
- (Windows only) Visual Studio; any of the newer versions will do (Community 2015 works fine)

#### Rebuilding the native modules
Once you have the above dependencies:
```
npm run rebuild-native
```