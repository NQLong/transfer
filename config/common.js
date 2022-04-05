module.exports = (app) => {
    const fse = require('fs-extra');
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

    app.fs.renameSync = (oldPath, newPath) => {
        fse.copySync(oldPath, newPath);
        fse.removeSync(oldPath);
    };
    // app.fs.renameSync = (oldPath, newPath) => app.fs.copyFileSync(oldPath, newPath) && app.fs.unlinkSync(oldPath);

    // Template html file ---------------------------------------------------------------------------------------------------------------------------
    app.templates = {};
    app.createTemplate = function () {
        for (let i = 0; i < arguments.length; i++) {
            const templateName = arguments[i],
                path = `/${templateName}.template`;
            app.templates[templateName] = (req, res) => {
                const today = new Date().yyyymmdd();
                if (req.session.today != today) {
                    app.database.redis.incr(`${app.appName}_state:todayViews`);
                    app.database.redis.incr(`${app.appName}_state:allViews`);
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
        dashboard: {
            index: 100, title: 'Dashboard', link: '/user/dashboard', icon: 'fa-dashboard',
            subMenusRender: false,
        },
        setting: {
            index: 2000, title: 'Cấu hình', link: '/user/settings', icon: 'fa-cog',
            subMenusRender: false
        },
        user: {
            index: 1000, title: 'Trang cá nhân', link: '/user', icon: 'fa-user',
            subMenusRender: false, groups: ['Thông tin cá nhân', 'Công tác', 'Khen thưởng - kỷ luật', 'Nghỉ', 'Chuyên môn']
        },
        tccb: {
            index: 3000, title: 'Tổ chức cán bộ', link: '/user/tccb', icon: 'fa-pie-chart',
            subMenusRender: false, groups: ['Cán bộ', 'Công tác', 'Hợp đồng', 'Khen thưởng - Kỷ luật', 'Nghỉ', 'Chuyên môn']
        },
        khcn: {
            index: 9500, title: 'Khoa học công nghệ', link: '/user/khcn', icon: 'fa-rocket ',
            subMenusRender: false
        },
        library: {
            index: 8000, title: 'Thư viện', link: '/user/library', icon: 'fa-th-large',
            subMenusRender: false
        },
        students: {
            index: 6100, title: 'Sinh viên', link: '/user/students', icon: 'fa-users',
            subMenusRender: false
        },
        daoTao: {
            index: 7000, title: 'Đào tạo', link: '/user/pdt', icon: 'fa-diamond',
            subMenusRender: false
        },
        category: {
            index: 4000, title: 'Danh mục', link: '/user/category', icon: 'fa-list-alt',
            subMenusRender: false,
        },
        truyenThong: {
            index: 6000, title: 'Truyền thông', link: '/user/truyen-thong', icon: 'fa-comments-o',
            subMenusRender: false,
            groups: ['Cấu hình', 'Bài viết', 'Sự kiện', 'Tuyển sinh', 'Doanh nghiệp']
        },
        websiteDv: {
            index: 1900, title: 'Website đơn vị', link: '/user/website', icon: 'fa-database',
            subMenusRender: false,
        },
        hcth: {
            index: 500, title: 'Hành chính tổng hợp', link: '/user/hcth', icon: 'fa-book',
            subMenusRender: false,
        }

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
                console.log(` - #${process.pid}${app.primaryWorker ? ' (primary)' : ''}: The system is ready!`);
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
