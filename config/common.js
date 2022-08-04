module.exports = (app, appConfig) => {
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

    app.fs.rename = (oldPath, newPath, done) => {
        try {
            fse.copySync(oldPath, newPath);
            fse.removeSync(oldPath);
            done && done();
        } catch (error) {
            done && done(error);
        }
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
            subMenusRender: false, groups: ['Thông tin cá nhân', 'Công tác', 'Khen thưởng - kỷ luật', 'Nghỉ', 'Chuyên môn', 'Văn bản']
        },
        tccb: {
            index: 3000, title: 'Tổ chức cán bộ', link: '/user/tccb', icon: 'fa-pie-chart',
            subMenusRender: false, groups: ['Cán bộ', 'Công tác', 'Hợp đồng', 'Khen thưởng - Kỷ luật', 'Nghỉ', 'Chuyên môn']
        },
        finance: {
            index: 5000, title: 'Kế hoạch - Tài chính', link: '/user/finance', icon: 'fa-credit-card',
            subMenusRender: true
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
            index: 6100, title: 'Công tác sinh viên', link: '/user/students', icon: 'fa-users',
            subMenusRender: false
        },
        hocPhi: {
            index: 6200, title: 'Học phí', link: '/user/hoc-phi', icon: 'fa-credit-card',
            subMenusRender: false
        },
        daoTao: {
            index: 7000, title: 'Đào tạo', link: '/user/dao-tao', icon: 'fa-diamond',
            subMenusRender: false, groups: ['NGÀNH ĐÀO TẠO', 'CÔNG TÁC ĐÀO TẠO', 'DANH SÁCH']
        },
        sdh: {
            index: 7500, title: 'Sau đại học', link: '/user/sau-dai-hoc', icon: 'fa-graduation-cap ',
            subMenusRender: true
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
        if (loadController) controllerPaths.forEach(path => require(path)(app, appConfig));
    };

    //Utils-----------------------------------------------------------------------------------------------------------------------
    app.stringify = (value, defaultValue = '') => {
        try {
            return JSON.stringify(value);
        } catch (exception) {
            return defaultValue;
        }
    };

    app.parse = (value, defaultValue = {}) => {
        try {
            return JSON.parse(value);
        } catch (exception) {
            return defaultValue;
        }
    };

    app.toIsoString = (date) => {
        let tzo = -date.getTimezoneOffset(),
            dif = tzo >= 0 ? '+' : '-',
            pad = function (num) {
                return (num < 10 ? '0' : '') + num;
            };

        return date.getFullYear() +
            '-' + pad(date.getMonth() + 1) +
            '-' + pad(date.getDate()) +
            'T' + pad(date.getHours()) +
            ':' + pad(date.getMinutes()) +
            ':' + pad(date.getSeconds()) +
            dif + pad(Math.floor(Math.abs(tzo) / 60)) +
            ':' + pad(Math.abs(tzo) % 60);
    };

    app.numberToVnText = (so) => {
        const doc1so = (so) => {
            let arr_chuhangdonvi = ['không', 'một', 'hai', 'ba', 'bốn', 'năm', 'sáu', 'bảy', 'tám', 'chín'];
            let resualt = '';
            resualt = arr_chuhangdonvi[so];
            return resualt;
        };

        const doc2so = (so) => {
            so = so.replace(' ', '');
            let arr_chubinhthuong = ['không', 'một', 'hai', 'ba', 'bốn', 'năm', 'sáu', 'bảy', 'tám', 'chín'];
            let arr_chuhangdonvi = ['mươi', 'mốt', 'hai', 'ba', 'bốn', 'lăm', 'sáu', 'bảy', 'tám', 'chín'];
            let arr_chuhangchuc = ['', 'mười', 'hai mươi', 'ba mươi', 'bốn mươi', 'năm mươi', 'sáu mươi', 'bảy mươi', 'tám mươi', 'chín mươi'];
            let resualt = '';
            let sohangchuc = so.substr(0, 1);
            let sohangdonvi = so.substr(1, 1);
            resualt += arr_chuhangchuc[sohangchuc];
            if (sohangchuc == 1 && sohangdonvi == 1)
                resualt += ' ' + arr_chubinhthuong[sohangdonvi];
            else if (sohangchuc == 1 && sohangdonvi > 1)
                resualt += ' ' + arr_chuhangdonvi[sohangdonvi];
            else if (sohangchuc > 1 && sohangdonvi > 0)
                resualt += ' ' + arr_chuhangdonvi[sohangdonvi];

            return resualt;
        };

        const doc3so = (so) => {
            let resualt = '';
            let arr_chubinhthuong = ['không', 'một', 'hai', 'ba', 'bốn', 'năm', 'sáu', 'bảy', 'tám', 'chín'];
            let sohangtram = so.substr(0, 1);
            let sohangchuc = so.substr(1, 1);
            let sohangdonvi = so.substr(2, 1);
            resualt = arr_chubinhthuong[sohangtram] + ' trăm';
            if (sohangchuc == 0 && sohangdonvi != 0)
                resualt += ' linh ' + arr_chubinhthuong[sohangdonvi];
            else if (sohangchuc != 0)
                resualt += ' ' + doc2so(sohangchuc + ' ' + sohangdonvi);
            return resualt;
        };

        const docsonguyen = (so) => {
            let result = '';
            if (so != undefined) {
                let arr_So = [{ ty: '' }, { trieu: '' }, { nghin: '' }, { tram: '' }];
                let sochuso = so.length;
                for (let i = (sochuso - 1); i >= 0; i--) {
                    if ((sochuso - i) <= 3) {
                        if (arr_So['tram'] != undefined)
                            arr_So['tram'] = so.substr(i, 1) + arr_So['tram'];
                        else arr_So['tram'] = so.substr(i, 1);

                    }
                    else if ((sochuso - i) > 3 && (sochuso - i) <= 6) {
                        if (arr_So['nghin'] != undefined)
                            arr_So['nghin'] = so.substr(i, 1) + arr_So['nghin'];
                        else arr_So['nghin'] = so.substr(i, 1);
                    }
                    else if ((sochuso - i) > 6 && (sochuso - i) <= 9) {
                        if (arr_So['trieu'] != undefined)
                            arr_So['trieu'] = so.substr(i, 1) + arr_So['trieu'];
                        else arr_So['trieu'] = so.substr(i, 1);
                    }
                    else {
                        if (arr_So.ty != undefined)
                            arr_So.ty = so.substr(i, 1) + arr_So.ty;
                        else arr_So.ty = so.substr(i, 1);
                    }
                }

                if (arr_So['ty'] > 0)
                    result += doc(arr_So['ty']) + ' tỷ';
                if (arr_So['trieu'] > 0) {
                    if (arr_So['trieu'].length >= 3 || arr_So['ty'] > 0)
                        result += ' ' + doc3so(arr_So['trieu']) + ' triệu';
                    else if (arr_So['trieu'].length >= 2)
                        result += ' ' + doc2so(arr_So['trieu']) + ' triệu';
                    else result += ' ' + doc1so(arr_So['trieu']) + ' triệu';
                }
                if (arr_So['nghin'] > 0) {
                    if (arr_So['nghin'].length >= 3 || arr_So['trieu'] > 0)
                        result += ' ' + doc3so(arr_So['nghin']) + ' nghìn';
                    else if (arr_So['nghin'].length >= 2)
                        result += ' ' + doc2so(arr_So['nghin']) + ' nghìn';
                    else result += ' ' + doc1so(arr_So['nghin']) + ' nghìn';
                }
                if (arr_So['tram'] > 0) {
                    if (arr_So['tram'].length >= 3 || arr_So['nghin'] > 0)
                        result += ' ' + doc3so(arr_So['tram']);
                    else if (arr_So['tram'].length >= 2)
                        result += ' ' + doc2so(arr_So['tram']);
                    else result += ' ' + doc1so(arr_So['tram']);
                }
            }
            return result;
        };

        const doc = (so) => {
            let kytuthapphan = ',';
            let result = '';
            if (so != undefined) {
                so = ' ' + so + ' ';
                so = so.trim();
                let cautrucso = so.split(kytuthapphan);
                if (cautrucso[0] != undefined) {
                    result += docsonguyen(cautrucso[0]);
                }
                if (cautrucso[1] != undefined) {
                    result += ' phẩy ' + docsonguyen(cautrucso[1]);
                }
            }

            return result;
        };

        return doc(so);
    };

    app.arrayToChunk = (array, chunkSize = 10) => {
        const list = [];
        for (let i = 0; i < array.length; i += chunkSize) {
            list.push(array.slice(i, i + chunkSize));
        }
        return list;
    };
};
