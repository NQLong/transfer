module.exports = app => {
    app.permission.add(
        { name: 'dashboard:standard', menu: { parentMenu: app.parentMenu.dashboard }, },
        {
            name: 'system:settings', menu: {
                parentMenu: app.parentMenu.truyenThong,
                menus: { 2010: { title: 'Thông tin chung', link: '/user/truyen-thong/settings', groupIndex: 0, icon: 'fa-gear', backgroundColor: '#2962ff' } }
            },
        },
        { name: 'user:login', menu: { parentMenu: app.parentMenu.user } },
    );

    app.get('/user', app.permission.check('user:login'), app.templates.admin);
    app.get('/user/dashboard', app.permission.check('dashboard:standard'), app.templates.admin);
    app.get('/user/truyen-thong/settings', app.permission.check('system:settings'), app.templates.admin);


    // Home -----------------------------------------------------------------------------------------------------------------------------------------
    // '/registered(.htm(l)?)?', '/active-user/:userId', '/forgot-password/:userId/:userToken',
    ['/index.htm(l)?', '/404.htm(l)?', '/request-permissions(/:roleId?)', '/request-login'].forEach(route => app.get(route, app.templates.home));

    // API ------------------------------------------------------------------------------------------------------------------------------------------
    app.put('/api/system', app.permission.check('system:settings'), (req, res) => {
        const { password, address, address2, email, mobile, fax, facebook, youtube, twitter, instagram, linkMap } = req.body;

        if (req.body.password) {
            app.state.set('emailPassword', password, error => {
                res.send(error ? { error: 'Lỗi khi cập nhật mật khẩu email!' } : app.state.data);
            });
        } else {
            const changes = [];
            if (address || address == '') changes.push('address', address.trim());
            if (address2 || address2 == '') changes.push('address2', address2.trim());
            if (email) changes.push('email', email.trim());
            if (mobile || mobile == '') changes.push('mobile', mobile.trim());
            if (fax || fax == '') changes.push('fax', fax.trim());
            if (facebook || facebook == '') changes.push('facebook', facebook.trim());
            if (youtube || youtube == '') changes.push('youtube', youtube.trim());
            if (twitter || twitter == '') changes.push('twitter', twitter.trim());
            if (instagram || instagram == '') changes.push('instagram', instagram.trim());
            if (linkMap || linkMap == '') changes.push('linkMap', linkMap.trim());

            app.state.set(...changes, error => {
                error && console.log('Error (/api/system):', error);
                app.state.get((error, data) => res.send(error ? { error } : data));
            });
        }
    });

    app.put('/api/fw-setting', app.permission.check('system:settings'), (req, res) => {
        let changes = req.body.changes;
        app.model.setting.setValue(changes, (error) => res.send({ error }));
    });

    app.get('/api/fw-setting', app.permission.check('system:settings'), async (req, res) => {
        let keys = req.query.keys || [];
        app.model.setting.getValue(keys, (items) => {
            res.send(items);
        });
    });

    app.get('/api/state', app.isDebug ? app.permission.check() : (req, res, next) => { next(); }, (req, res) => {
        app.state.get((error, data) => {
            if (error || data == null) {
                res.send({ error: error || 'System has error!' });
            } else {
                Object.keys(data).forEach(key => {
                    if (key.toLowerCase().indexOf('password') != -1) delete data[key]; // delete data.emailPassword, data.tchcEmailPassword
                });

                if (app.isDebug) data.isDebug = true;
                if (req.session.user) data.user = req.session.user;
                const ready = () => {
                    if (app.database.oracle.connected && app.model && app.model.fwMenu && app.model.fwSubmenu) {
                        app.model.fwMenu.getAll({}, '*', 'priority', (error, menus) => {
                            if (menus) {
                                data.menus = [];
                                data.divisionMenus = [];
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
                                app.model.setting.getValue(['header', 'address', 'headerTitle', 'headerLink', 'isShowHeaderTitle', 'address2', 'mapLink'], result => {
                                    // data.header = result.header;
                                    // data.address = result.address;
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
                                        delete data.user.menu['6000'].menus['6004'];
                                        delete data.user.menu['6000'].menus['6005'];
                                        delete data.user.menu['6000'].menus['6006'];
                                        delete data.user.menu['6000'].menus['6008'];

                                    }
                                    // else if (data.user && data.user.permissions
                                    //     && data.user.permissions.includes('unit:write')
                                    //     && !data.user.permissions.includes('news:write') && data.user.menu['6000']) {
                                    //     delete data.user.menu['6000'].menus['6001'];
                                    //     delete data.user.menu['6000'].menus['6002'];
                                    //     delete data.user.menu['6000'].menus['6003'];
                                    // }
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
            }
        });
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

        const promiseMenus = new Promise((resolve, reject) => app.database.redis.get(app.database.redis.menusKey, (error, menus) => {
            error ? reject(error) : resolve(menus ? JSON.parse(menus) : {});
        }));
        const promiseDivisionMenus = new Promise((resolve, reject) => app.database.redis.get(app.database.redis.divisionMenusKey, (error, divisionMenus) => {
            error ? reject(error) : resolve(divisionMenus ? JSON.parse(divisionMenus) : {});
        }));

        Promise.all([promiseMenus, promiseDivisionMenus]).then(([menus, divisionMenus]) => {
            let menu = null, menuType = '';
            if (menus && menus[pathname]) {
                menu = menus[pathname];
                menuType = 'common';
            }
            if (!menu && divisionMenus && divisionMenus[pathname]) {
                menu = divisionMenus[pathname];
                menuType = 'division';
            }

            if (!menu) {
                res.send({ error: 'Link không hợp lệ!' });
            } else if (menu.component) {
                res.send(menu.component);
            } else if (menu.componentId) {
                //TODO
                const menuComponents = [];
                getComponent(0, [menu.componentId], menuComponents, () => {
                    const newComponents = menuComponents[0].components.sort((a, b) => a.priority - b.priority);
                    menu.component = Object.assign(menuComponents[0], { components: newComponents });

                    if (menuType == 'common') {
                        menus[pathname] = menu;
                        app.database.redis.set(app.database.redis.menusKey, JSON.stringify(menus));
                    } else {
                        divisionMenus[pathname] = menu;
                        app.database.redis.set(app.database.redis.divisionMenusKey, JSON.stringify(divisionMenus));
                    }

                    res.send(menu.component);
                });
            } else {
                res.send({ error: 'Menu không hợp lệ! 1' });
            }
        });
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
                app.state.get(fields.userData, (_, oldImage) => {
                    oldImage && app.deleteImage(oldImage);
                    let destPath = `/img/favicon${app.path.extname(srcPath)}`;
                    app.fs.rename(srcPath, app.path.join(app.publicPath, destPath), error => {
                        if (error == null) {
                            destPath += '?t=' + new Date().getTime().toString().slice(-8);
                            app.state.set(fields.userData, destPath, (error) => done({ image: destPath, error }));
                        } else {
                            done({ error });
                        }
                    });
                });
            } else if (['footer', 'map', 'header'].includes(fields.userData.toString())) {
                app.state.get(fields.userData, (_, oldImage) => {
                    oldImage && app.deleteImage(oldImage);
                    let destPath = `/img/${fields.userData}${app.path.extname(srcPath)}`;
                    app.fs.rename(srcPath, app.path.join(app.publicPath, destPath), error => {
                        if (error == null) {
                            destPath += '?t=' + new Date().getTime().toString().slice(-8);
                            app.state.set(fields.userData, destPath, (error) => done({ image: destPath, error }));
                        } else {
                            done({ error });
                        }
                    });
                });
            } else {
                app.deleteImage(srcPath);
            }
        }
    };

    app.uploadHooks.add('uploadSettingImage', (req, fields, files, params, done) =>
        app.permission.has(req, () => uploadSettingImage(req, fields, files, params, done), done, 'system:settings'));
};