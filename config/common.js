module.exports = app => {
    app.adminRole = {};
    app.clone = function () {
        const length = arguments.length;
        let result = null;
        if (length && Array.isArray(arguments[0])) {
            result = [];
            for (let i = 0; i < length; i++) {
                result = result.concat(arguments[i]);
            }
        } else if (length && typeof arguments[0] == 'object') {
            result = {};
            for (let i = 0; i < length; i++) {
                const obj = JSON.parse(JSON.stringify(arguments[i]));
                Object.keys(obj).forEach(key => result[key] = obj[key]);
            }
        }
        return result;
    };

    // Template html file ---------------------------------------------------------------------------------------------------------------------------
    app.templates = {};
    app.createTemplate = function () {
        for (let i = 0; i < arguments.length; i++) {
            const templateName = arguments[i],
                path = `/${templateName}.template`;
            app.templates[templateName] = (req, res) => {
                const today = new Date().yyyymmdd();
                if (req.session.today != today) {
                    // app.redis.incr(`${appName}:todayViews`);
                    // app.redis.incr(`${appName}:allViews`);
                    app.data.todayViews += 1;
                    app.data.allViews += 1;
                    req.session.today = today;
                }

                if (app.isDebug) {

                    const http = require('http');
                    http.get(`http://localhost:${(app.port + 1) + path}`, response => {
                        let data = '';
                        response.on('data', chunk => data += chunk);
                        response.on('end', () => res.send(data));
                    });
                } else {
                    app.fs.readFile(app.publicPath + path, 'utf8', (error, data) => {
                        res.send(data);
                    });
                }
            };
        }
    };

    // Upload Hook ----------------------------------------------------------------------------------------------------------------------------------
    const uploadHooksList = {};
    app.uploadHooks = {
        add: (name, hook) => uploadHooksList[name] = hook,
        remove: name => uploadHooksList[name] = null,

        run: (req, fields, files, params, sendResponse) =>
            Object.keys(uploadHooksList).forEach(name => uploadHooksList[name] && uploadHooksList[name](req, fields, files, params, data => data && sendResponse(data))),
    };

    // Parent menu ----------------------------------------------------------------------------------------------------------------------------------
    app.parentMenu = {
        setting: {
            index: 100, title: 'Dashboard', link: '/user/dashboard', icon: 'fa-dashboard',
            subMenusRender: false,
        },
        tccb: {
            index: 3000, title: 'Tổ chức cán bộ', link: '/user/tccb', icon: 'fa-list-alt',
            subMenusRender: false,
        },
        category: {
            index: 4000, title: 'Danh mục', link: '/user/category', icon: 'fa-list-alt',
            subMenusRender: false,
        },
        websiteDv: {
            index: 1006, title: 'Website đơn vị', link: '/user/website', icon: 'fa-cog',
            subMenusRender: false,
        },
    };

    // Ready Hook ----------------------------------------------------------------------------------------------------------------------------------
    const readyHookContainer = {};
    let readyHooksId = null;
    app.readyHooks = {
        add: (name, hook) => {
            readyHookContainer[name] = hook;
            app.readyHooks.waiting();
        },
        remove: name => {
            readyHookContainer[name] = null;
            app.readyHooks.waiting();
        },

        waiting: () => {
            if (readyHooksId) clearTimeout(readyHooksId);
            readyHooksId = setTimeout(app.readyHooks.run, 2000);
        },

        run: () => {
            let hookKeys = Object.keys(readyHookContainer),
                ready = true;

            // Check all hooks
            for (let i = 0; i < hookKeys.length; i++) {
                const hook = readyHookContainer[hookKeys[i]];
                if (!hook.ready()) {
                    ready = false;
                    console.log(hookKeys[i]);
                    break;
                }
            }

            if (ready) {
                hookKeys.forEach(hookKey => readyHookContainer[hookKey].run());
                console.log(` - #${process.pid}: The system is ready!`);
            } else {
                app.readyHooks.waiting();
            }
        }
    };
    app.readyHooks.waiting();

    // Load modules ---------------------------------------------------------------------------------------------------------------------------------
    app.loadModules = (loadController = true) => {
        const modulePaths = app.fs.readdirSync(app.modulesPath, { withFileTypes: true }).filter(item => item.isDirectory()).map(item => app.modulesPath + '/' + item.name),
            modelPaths = [],
            controllerPaths = [],
            requireFolder = (loadPath) => app.fs.readdirSync(loadPath).forEach((filename) => {
                const filepath = app.path.join(loadPath, filename);
                if (app.fs.existsSync(filepath) && app.fs.statSync(filepath).isFile() && filepath.endsWith('.js')) {
                    require(filepath)(app);
                }
            });

        modulePaths.forEach(modulePath => {
            app.fs.readdirSync(modulePath).forEach(dirName => {
                const modelFilePath = app.path.join(modulePath, dirName, 'model.js'),
                    controllerFilePath = app.path.join(modulePath, dirName, 'controller.js'),
                    modelFolderPath = app.path.join(modulePath, dirName, 'model'),
                    controllerFolderPath = app.path.join(modulePath, dirName, 'controller');

                if (app.fs.existsSync(modelFilePath) && app.fs.statSync(modelFilePath).isFile())
                    modelPaths.push(modelFilePath);
                if (loadController && app.fs.existsSync(controllerFilePath) && app.fs.statSync(controllerFilePath).isFile())
                    controllerPaths.push(controllerFilePath);

                if (app.fs.existsSync(modelFolderPath) && app.fs.statSync(modelFolderPath).isDirectory())
                    requireFolder(modelFolderPath);
                if (loadController && controllerFolderPath && app.fs.existsSync(controllerFolderPath) && app.fs.statSync(controllerFolderPath).isDirectory())
                    requireFolder(controllerFolderPath);
            });
        });
        modelPaths.forEach(path => require(path)(app));
        if (loadController) controllerPaths.forEach(path => require(path)(app));
    };
};