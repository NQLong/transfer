module.exports = app => {
    app.permission.add(
        { name: 'dashboard:standard', menu: { parentMenu: { index: 100, title: 'Dashboard', icon: 'fa-dashboard', link: '/user/dashboard' } }, },
        { name: 'system:settings', menu: { parentMenu: { index: 2000, title: 'Cấu hình', icon: 'fa-cog' }, menus: { 2010: { title: 'Thông tin chung', link: '/user/settings' } } }, },
    );

    app.get('/user/dashboard', app.permission.check('dashboard:standard'), app.templates.admin);
    app.get('/user/settings', app.permission.check('system:settings'), app.templates.admin);

    // Home -----------------------------------------------------------------------------------------------------------------------------------------
    // '/registered(.htm(l)?)?', '/active-user/:userId', '/forgot-password/:userId/:userToken',
    ['/index.htm(l)?', '/404.htm(l)?', '/request-permissions(/:roleId?)', '/request-login'].forEach(route => app.get(route, app.templates.home));

    // API ------------------------------------------------------------------------------------------------------------------------------------------
    app.put('/api/system', app.permission.check('system:settings'), (req, res) => {
        const changes = {};

        if (req.body.password) {
            changes.emailPassword = req.body.password;
            app.model.setting.setValue(changes, error => {
                if (error) {
                    res.send({ error: 'Lỗi khi cập nhật mật khẩu email!' });
                } else {
                    app.data.emailPassword = req.body.emailPassword;
                    res.send(app.data);
                }
            });
        } else {
            if (req.body.address != null || req.body.address == '') {
                changes.address = req.body.address.trim();
            }
            if (req.body.address2 != null || req.body.address2 == '') {
                changes.address2 = req.body.address2.trim();
            }
            if (req.body.email && req.body.email != '') {
                changes.email = req.body.email.trim();
            }
            if (req.body.mobile != null || req.body.mobile == '') {
                changes.mobile = req.body.mobile.trim();
            }
            if (req.body.fax != null || req.body.fax == '') {
                changes.fax = req.body.fax.trim();
            }
            if (req.body.facebook != null || req.body.facebook == '') {
                changes.facebook = req.body.facebook.trim();
            }
            if (req.body.youtube != null || req.body.youtube == '') {
                changes.youtube = req.body.youtube.trim();
            }
            if (req.body.twitter != null || req.body.twitter == '') {
                changes.twitter = req.body.twitter.trim();
            }
            if (req.body.instagram != null || req.body.instagram == '') {
                changes.instagram = req.body.instagram.trim();
            }
            if (req.body.linkMap != null || req.body.linkMap == '') {
                changes.linkMap = req.body.linkMap.trim();
            }
            // if (req.body.latitude != null || req.body.latitude == '') {
            //     changes.latitude = req.body.latitude.trim();
            // }
            // if (req.body.longitude != null || req.body.longitude == '') {
            //     changes.longitude = req.body.longitude.trim();
            // }

            app.model.setting.setValue(changes, error => {
                if (error) {
                    res.send({ error: 'Lỗi khi cập nhật mật khẩu email!' });
                } else {
                    if (changes.email) {
                        app.data.email = changes.email;
                    }
                    app.data = app.clone(app.data, changes);
                    res.send(app.data);
                }
            });
        }
    });

    app.get('/api/state', (req, res) => {
        const data = app.clone(app.data);
        delete data.emailPassword;

        if (app.isDebug) data.isDebug = true;
        if (req.session.user) data.user = req.session.user;
        app.buildAppMenus();

        const ready = () => {
            if (app.dbConnection && app.model && app.model.fwMenu && app.model.fwSubmenu) {
                app.model.fwMenu.getAll({}, '*', 'priority', (error, menus) => {
                    if (menus) {
                        data.menus = [], data.divisionMenus = [];
                        menus.forEach(menu => {
                            menu.content = '';
                            if (menu.submenus) {
                                menu.submenus.forEach(submenu => submenu.content = '');
                            }
                            if (menu.maDonVi == '00') data.menus.push(menu); else data.divisionMenus.push(menu);
                        });
                    }
                    app.model.fwSubmenu.getAll({ active: 1 }, '*', 'priority ASC', (error, submenus) => {
                        if (submenus) {
                            data.submenus = submenus.slice();
                        }
                        app.model.setting.getValue(['headerTitle', 'headerLink', 'isShowHeaderTitle', 'address2', 'mapLink'], result => {
                            data.headerTitle = result.headerTitle;
                            data.headerLink = result.headerLink;
                            data.address2 = result.address2;
                            data.isShowHeaderTitle = result.isShowHeaderTitle;
                            data.mapLink = result.mapLink;
                            if (data.user && data.user.permissions && data.user.permissions.includes('website:write') &&
                                !data.user.permissions.includes('menu:write')
                            ) {
                                delete data.user.menu['2000'];
                                delete data.user.menu['5100'];
                            }
                            if (data.user && data.user.permissions && data.user.permissions.includes('news:write')) {
                                delete data.user.menu['5000'].menus['5004'];
                                delete data.user.menu['5000'].menus['5005'];
                                delete data.user.menu['5000'].menus['5006'];
                                delete data.user.menu['5000'].menus['5008'];

                            } else if (data.user && data.user.permissions
                                && data.user.permissions.includes('unit:write')
                                && !data.user.permissions.includes('news:write')) {
                                delete data.user.menu['5000'].menus['5001'];
                                delete data.user.menu['5000'].menus['5002'];
                                delete data.user.menu['5000'].menus['5003'];

                            }
                            if (data.user && data.user.permissions
                                && data.user.permissions.includes('website:write')
                                && !data.user.permissions.includes('news:write')) {
                                if (data.user.menu['2000']) delete data.user.menu['2000'].menus['2090'];
                            }
                            res.send(data);
                        });
                    });
                });
            } else {
                setTimeout(ready, 500);
            }
        };
        ready();
    });
    const getComponent = (index, componentIds, components, done) => {
        if (index < componentIds.length) {
            app.model.fwComponent.get({ id: componentIds[index] }, (error, component) => {
                if (error || component == null) {
                    getComponent(index + 1, componentIds, components, done);
                } else {
                    component = app.clone(component);
                    component.components = [];
                    components.push(component);
                    const getNextComponent = view => {
                        if (view) component.view = view;
                        if (component.componentIds) {
                            getComponent(0, component.componentIds.split(','), component.components, () =>
                                getComponent(index + 1, componentIds, components, done));
                        } else {
                            getComponent(index + 1, componentIds, components, done);
                        }
                    };
                    if (component.viewType && component.viewId) {
                        const viewType = component.viewType;
                        if (component.viewId && app.model.fwComponent.viewTypes.indexOf(viewType) !== -1) {
                            let modelName = '';
                            if (viewType === 'carousel' || viewType === 'gallery')
                                modelName = 'homeCarousel';
                            else if (viewType === 'video')
                                modelName = 'homeVideo';
                            else if (viewType === 'feature')
                                modelName = 'homeFeature';
                            else if (viewType === 'content')
                                modelName = 'homeContent';
                            else if (viewType === 'all news' || viewType == 'all events' || viewType === 'tin tức chung' || viewType === 'last events')
                                modelName = 'fwCategory';
                            else if (viewType === 'all divisions')
                                modelName = 'dmLoaiDonVi';
                            if (modelName == 'fwCategory') {
                                app.model.fwCategory.get({ id: component.viewId }, (error, item) => getNextComponent(item));
                            } else if (modelName) {
                                app.model[modelName].get({ viewId: component.viewId }, (error, item) => getNextComponent(item));
                            } else {
                                getNextComponent();
                            }
                        } else {
                            getNextComponent();
                        }
                    } else {
                        getNextComponent();
                    }
                }
            });
        } else {
            done();
        }
    };

    app.get('/api/menu', (req, res) => {
        let pathname = app.url.parse(req.headers.referer).pathname;
        if (pathname.length > 1 && pathname.endsWith('/')) pathname = pathname.substring(0, pathname.length - 1);
        const ready = () => {
            if (app.menus && app.menus[pathname]) {
                const menu = app.menus[pathname] || app.menus['/'];
                if (menu) {
                    const menuComponents = [];
                    if (menu.component) {
                        res.send(menu.component);
                    } else if (menu.componentId) {
                        //TODO
                        getComponent(0, [menu.componentId], menuComponents, () => {
                            const newComponents = menuComponents[0].components.sort((a, b) => a.priority - b.priority);
                            menu.component = Object.assign(menuComponents[0], { components: newComponents });
                            res.send(menu.component);
                        });
                    } else {
                        res.send({ error: 'Menu không hợp lệ! 1' });
                    }
                } else {
                    res.send({ error: 'Link không hợp lệ!' });
                }
            } else if (app.divisionMenus && app.divisionMenus[pathname]) {
                const menu = app.divisionMenus[pathname];
                if (menu) {
                    const menuComponents = [];
                    if (menu.component) {
                        res.send(menu.component);
                    } else if (menu.componentId) {
                        //TODO
                        getComponent(0, [menu.componentId], menuComponents, () => {
                            const newComponents = menuComponents[0].components.sort((a, b) => a.priority - b.priority);
                            menu.component = Object.assign(menuComponents[0], { components: newComponents });
                            res.send(menu.component);
                        });
                    } else {
                        console.log('Menu không hợp lệ! 2');
                        res.send({ error: 'Menu không hợp lệ! 2' });
                    }
                } else {
                    console.log('Menu không hợp lệ! ');
                    res.send({ error: 'Link không hợp lệ!' });
                }
            } else {
                console.log('Menu không hợp lệ! 3');
                res.send({ error: 'Menu không hợp lệ! 3', pathname, divisionMenus: app.divisionMenus, menus: app.menus });
            }
        };
        ready();
    });

    app.delete('/api/clear-session', app.permission.check(), (req, res) => {
        const sessionName = req.body.sessionName;
        req.session[sessionName] = null;
        res.send({});
    });

    // Hook upload images ---------------------------------------------------------------------------------------------------------------------------s
    const uploadSettingImage = (req, fields, files, params, done) => {
        if (files.SettingImage && files.SettingImage.length > 0) {
            console.log('Hook: uploadSettingImage => ' + fields.userData);
            const srcPath = files.SettingImage[0].path;

            if (fields.userData == 'logo') {
                app.deleteImage(app.data.logo);
                let destPath = '/img/favicon' + app.path.extname(srcPath);
                app.fs.rename(srcPath, app.path.join(app.publicPath, destPath), error => {
                    if (error == null) {
                        destPath += '?t=' + (new Date().getTime()).toString().slice(-8);
                        app.model.setting.setValue({ logo: destPath }, error => {
                            if (error == null) app.data.logo = destPath;
                            done({ image: app.data.logo, error });
                        });
                    } else {
                        done({ error });
                    }
                });
            } else if (fields.userData == 'footer' && files.SettingImage && files.SettingImage.length > 0) {
                app.deleteImage(app.data.footer);
                let destPath = '/img/footer' + app.path.extname(srcPath);
                app.fs.rename(srcPath, app.path.join(app.publicPath, destPath), error => {
                    if (error == null) {
                        destPath += '?t=' + (new Date().getTime()).toString().slice(-8);
                        app.model.setting.setValue({ footer: destPath }, error => {
                            if (error == null) app.data.footer = destPath;
                            done({ image: app.data.footer, error });
                        });
                    } else {
                        done({ error });
                    }
                });
            } else if (fields.userData == 'map' && files.SettingImage && files.SettingImage.length > 0) {
                app.deleteImage(app.data.map);
                let destPath = '/img/map' + app.path.extname(srcPath);
                app.fs.rename(srcPath, app.path.join(app.publicPath, destPath), error => {
                    if (error == null) {
                        destPath += '?t=' + (new Date().getTime()).toString().slice(-8);
                        app.model.setting.setValue({ map: destPath }, error => {
                            if (error == null) app.data.map = destPath;
                            done({ image: app.data.map, error });
                        });
                    } else {
                        done({ error });
                    }
                });
            } else if (fields.userData == 'header' && files.SettingImage && files.SettingImage.length > 0) {
                app.deleteImage(app.data.header);
                let destPath = '/img/header' + app.path.extname(srcPath);
                app.fs.rename(srcPath, app.path.join(app.publicPath, destPath), error => {
                    if (error == null) {
                        destPath += '?t=' + (new Date().getTime()).toString().slice(-8);
                        app.model.setting.setValue({ header: destPath }, error => {
                            if (error == null) app.data.header = destPath;
                            done({ image: app.data.header, error });
                        });
                    } else {
                        done({ error });
                    }
                });
            }
        }
    };
    app.uploadHooks.add('uploadSettingImage', (req, fields, files, params, done) =>
        app.permission.has(req, () => uploadSettingImage(req, fields, files, params, done), done, 'system:settings'));
};