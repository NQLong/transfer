module.exports = (app, appConfig) => {
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
            subMenusRender: false, groups: ['Thông tin cá nhân', 'Công tác', 'Khen thưởng - kỷ luật', 'Nghỉ', 'Chuyên môn', 'Văn phòng điện tử']
        },
        tccb: {
            index: 3000, title: 'Tổ chức cán bộ', link: '/user/tccb', icon: 'fa-pie-chart',
            subMenusRender: false, groups: ['Cán bộ', 'Công tác', 'Hợp đồng', 'Khen thưởng - Kỷ luật', 'Nghỉ', 'Chuyên môn', 'Đánh giá']
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
            subMenusRender: false, groups: ['NGÀNH ĐÀO TẠO', 'CÔNG TÁC ĐÀO TẠO', 'DANH MỤC']
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
            groups: ['Cấu hình', 'Bài viết', 'Sự kiện', 'Tuyển sinh', 'Doanh nghiệp', 'SMS']
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

    // Load services --------------------------------------------------------------------------------------------------
    const axios = require('axios'),
        axiosRequest = async (type, url, data, requestConfig) => {
            try {
                if (!data) data = {};
                if (!requestConfig) requestConfig = {};
                if (type == 'get') {
                    const params = new URLSearchParams(data).toString();
                    if (params.length) url = url + (url.includes('?') ? '&' : '?') + params;
                    data = {};
                } else if (type == 'delete') {
                    data = { data };
                }
                const response = await axios[type](url, data, requestConfig);
                return response ? response.data : null;
            } catch (error) {
                return { error };
            }
        };
    app.service = {
        url: (url, serviceConfig) => {
            if (!app.isDebug) {
                return `http://${serviceConfig.host}:${serviceConfig.port}` + url + '?t=' + new Date().getTime();
            } else if (serviceConfig.isDebug) {
                return `http://localhost:${serviceConfig.port}` + url + '?t=' + new Date().getTime();
            } else {
                return `http://localhost:${app.port}` + url + '?t=' + new Date().getTime();
            }
        },

        clusterGetAll: async (serviceName, done) => {
            const serviceConfig = appConfig.services[serviceName],
                url = app.service.url(`/api/cluster/service/${serviceName}`, serviceConfig),
                response = await app.service.get(url);
            done && done(response);
            return response;
        },
        clusterCreate: async (serviceName, done) => {
            const serviceConfig = appConfig.services[serviceName],
                url = app.service.url(`/api/cluster/service/${serviceName}`, serviceConfig),
                response = await app.service.post(url);
            done && done(response);
            return response;
        },
        clusterReset: async (serviceName, id, done) => {
            const serviceConfig = appConfig.services[serviceName],
                url = app.service.url(`/api/cluster/service/${serviceName}`, serviceConfig),
                response = await app.service.put(url, { id });
            done && done(response);
            return response;
        },
        clusterDelete: async (serviceName, id, done) => {
            const serviceConfig = appConfig.services[serviceName],
                url = app.service.url(`/api/cluster/service/${serviceName}`, serviceConfig),
                response = await app.service.delete(url, { id });
            done && done(response);
            return response;
        },

        clusterImageApply: async (serviceName, filename, done) => {
            const serviceConfig = appConfig.services[serviceName],
                url = app.service.url(`/api/cluster/service/image/${serviceName}`, serviceConfig),
                response = await app.service.put(url, { filename });
            done && done(response);
            return response;
        },
        clusterImageDelete: async (serviceName, filename, done) => {
            const serviceConfig = appConfig.services[serviceName],
                url = app.service.url(`/api/cluster/service/image/${serviceName}`, serviceConfig),
                response = await app.service.delete(url, { filename });
            done && done(response);
            return response;
        },
    };
    ['get', 'post', 'put', 'delete'].forEach(type => app.service[type] = async (url, data, requestConfig) => await axiosRequest(type, url, data, requestConfig));
    if (app.isDebug) {
        app.service.main = {};
        ['get', 'post', 'put', 'delete'].forEach(type => app.service.main[type] = async (url, data, requestConfig) => await axiosRequest(type, `http://localhost:${appConfig.port}${url}`, data, requestConfig));
    }

    app.loadServices = () => {
        app.fs.readdirSync(app.servicesPath, { withFileTypes: true }).forEach(serviceDirectory => {
            if (serviceDirectory.isDirectory() && serviceDirectory.name != 'config') {
                const serviceConfig = appConfig.services[serviceDirectory.name] || {};
                serviceConfig.name = serviceDirectory.name;
                if (!serviceConfig.isDebug) serviceConfig.isDebug = false;

                const mainPath = app.path.join(app.servicesPath, serviceDirectory.name, 'main.js');
                const servicePath = app.path.join(app.servicesPath, serviceDirectory.name, 'service.js');
                if (app.fs.existsSync(mainPath)) {
                    if (app.isDebug) {
                        if (serviceConfig.isDebug) {
                            console.log(` - Debug service ${serviceConfig.name} on ${serviceConfig.host ? 'http://' + serviceConfig.host + ':' + serviceConfig.port : 'Service app!'}`);
                        } else {
                            console.log(` - Debug service ${serviceConfig.name} on Main app!`);
                            if (app.fs.existsSync(servicePath)) require(servicePath)(app, serviceConfig);
                        }
                    }
                    app.fs.existsSync(mainPath) && require(mainPath)(app, serviceConfig);
                }
            }
        });
    };
};