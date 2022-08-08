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
    app.put('/api/system', app.permission.check('system:settings'), async (req, res) => {
        try {
            const { password, address, address2, email, mobile, fax, facebook, youtube, twitter, instagram, linkMap } = req.body;
            if (req.body.password) {
                await app.state.set('emailPassword', password);
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
                await app.state.set(...changes);
            }

            const data = await app.state.get();
            res.send(data);
        } catch (error) {
            res.send({ error });
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

    app.get('/api/state', app.isDebug ? app.permission.check() : (req, res, next) => next(), async (req, res) => {
        try {
            const template = req.query.template, link = req.query.link, maDonVi = req.query.maDonVi;
            const data = await app.state.get();
            if (data == null) {
                res.send({ error: 'System has error!' });
            } else {
                Object.keys(data).forEach(key => {
                    if (key.toLowerCase().indexOf('password') != -1) delete data[key]; // delete data.emailPassword, data.tchcEmailPassword
                });

                if (app.isDebug) data.isDebug = true;
                if (req.session.user) data.user = req.session.user;
                while (!(app.database.oracle.connected && app.model && app.model.fwMenu && app.model.fwSubmenu)) {
                    await app.waiting(500);
                }

                if (template == 'home' || template == 'unit') {
                    if (template == 'home') {
                        const menus = await app.model.fwMenu.homeGetDivisionMenuTree('00');
                        if (menus) {
                            data.menus = menus;
                        }
                    }

                    if (template == 'unit') {
                        data.divisionMenus = [];
                        if (maDonVi) {
                            data.divisionMenus = await app.model.fwMenu.homeGetDivisionMenuTree(maDonVi);
                        } else if (link) {
                            const checkMenu = await app.model.fwMenu.get({ link });
                            if (checkMenu && checkMenu.maDonVi) {
                                data.divisionMenus = await app.model.fwMenu.homeGetDivisionMenuTree(checkMenu.maDonVi);
                            }
                        }
                    }

                    const submenus = await app.model.fwSubmenu.getAll({ active: 1 }, '*', 'priority ASC');
                    if (submenus) {
                        data.submenus = submenus.slice();
                    }

                    data.languageText = await app.model.dmNgonNguTruyenThong.getLanguage();
                }

                app.model.setting.getValue(['headerTitle', 'headerLink', 'isShowHeaderTitle', 'mapLink'], result => {
                    data.headerTitle = result.headerTitle;
                    data.headerLink = result.headerLink;
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
                    if (data.user && data.user.permissions
                        && data.user.permissions.includes('website:write')
                        && !data.user.permissions.includes('news:write')) {
                        if (data.user.menu['2000']) delete data.user.menu['2000'].menus['2090'];
                    }
                    res.send(data);
                });
            }
        } catch (error) {
            res.send({ error });
        }
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
    const uploadSettingImage = async (req, fields, files, params, done) => {
        if (files.SettingImage && files.SettingImage.length > 0) {
            console.log('Hook: uploadSettingImage => ' + fields.userData);
            const srcPath = files.SettingImage[0].path;

            try {
                if (fields.userData == 'logo') {
                    const oldImage = await app.state.get(fields.userData);
                    oldImage && app.deleteImage(oldImage);
                    let destPath = `/img/favicon${app.path.extname(srcPath)}`;
                    app.fs.rename(srcPath, app.path.join(app.publicPath, destPath), async error => {
                        if (error == null) {
                            destPath += '?t=' + new Date().getTime().toString().slice(-8);
                            try {
                                await app.state.set(fields.userData, destPath);
                                done({ image: destPath });
                            } catch (error) {
                                done({ error });
                            }
                        } else {
                            done({ error });
                        }
                    });
                } else if (['footer', 'map', 'header'].includes(fields.userData.toString())) {
                    const oldImage = await app.state.get(fields.userData);
                    oldImage && app.deleteImage(oldImage);
                    let destPath = `/img/${fields.userData}${app.path.extname(srcPath)}`;
                    app.fs.rename(srcPath, app.path.join(app.publicPath, destPath), async error => {
                        if (error == null) {
                            destPath += '?t=' + new Date().getTime().toString().slice(-8);
                            try {
                                await app.state.set(fields.userData, destPath);
                                done({ image: destPath });
                            } catch (error) {
                                done({ error });
                            }
                        } else {
                            done({ error });
                        }
                    });
                } else {
                    app.deleteImage(srcPath);
                }
            } catch (error) {
                done({ error });
            }
        }
    };

    app.uploadHooks.add('uploadSettingImage', (req, fields, files, params, done) =>
        app.permission.has(req, () => uploadSettingImage(req, fields, files, params, done), done, 'system:settings'));
};