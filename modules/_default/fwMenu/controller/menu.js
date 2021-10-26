module.exports = app => {
    const menu = {
        parentMenu: app.parentMenu.truyenThong,
        menus: { 2090: { title: 'Menu', link: '/user/menu', groupIndex: 0, icon: 'fa-bars', backgroundColor: '#00b0ff' } }
    };
    app.permission.add(
        { name: 'menu:read', menu },
        { name: 'menu:write', menu },
        { name: 'menu:delete', menu },
    );

    app.get('/user/menu/edit/:id', app.permission.check('system:settings'), app.templates.admin);
    app.get('/user/menu', app.permission.check('system:settings'), app.templates.admin);
    app.get('/user/menu/:divisionId', app.permission.check('menu:read'), app.templates.admin);
    app.get('/user/menu/edit/:divisionId/:id', app.permission.check('menu:read'), app.templates.admin);

    // APIs -----------------------------------------------------------------------------------------------------------------------------------------
    app.buildAppMenus = menuTree => {
        const menus = {}, divisionMenus = {},
            getMenu = (index, items, done) => {
                if (index < items.length) {
                    const item = items[index];
                    if (item.maDonVi == '00') {
                        menus[item.link] = item;
                    } else {
                        divisionMenus[item.link] = item;
                    }
                    if (item.submenus && item.submenus.length > 0) {
                        getMenu(0, item.submenus, () => {
                            getMenu(index + 1, items, done);
                        });
                    } else {
                        getMenu(index + 1, items, done);
                    }
                } else {
                    done();
                }
            };

        if (menuTree) {
            getMenu(0, menuTree, () => {
                app.menus = menus;
                app.divisionMenus = divisionMenus;
            });
        } else {
            app.model.fwMenu.getAll((error, menu) => {
                const menus = {}, divisionMenus = {};
                menu.forEach(item => {
                    item.maDonVi == '00' ? menus[item.link] = item : divisionMenus[item.link] = item;
                });
                app.menus = menus;
                app.divisionMenus = divisionMenus;
            });
            // app.model.fwMenu.getMenuTree((error, menuTree) => {
            //     getMenu(0, menuTree, () => {
            //         app.menus = menus;
            //         app.divisionMenus = divisionMenus;
            //     })
            // });
        }
    };

    // const ready = () => {
    //     if (app.dbConnection && app.dbConnection.buildCondition) {
    //         app.model.fwMenu.get({ link: '/' }, (error, menu) => {
    //             if (error) {
    //                 console.error('Get menu by link has errors!');
    //             } else if (menu == null) {
    //                 app.model.fwMenu.createDefault(null, 'Home', '/', 1, (error) => {
    //                 });
    //             }
    //         });

    //         app.buildAppMenus();
    //     } else {
    //         setTimeout(ready, 1000);
    //     }
    // };
    // ready();

    // Hook readyHooks ------------------------------------------------------------------------------------------------------------------------------
    app.readyHooks.add('readyMenu', {
        ready: () => app.dbConnection && app.dbConnection.buildCondition,
        run: () => app.model.fwMenu.get({ link: '/' }, (error, menu) => {
            if (error) {
                console.error('Get menu by link has errors!');
            } else if (menu == null) {
                app.model.fwMenu.createDefault(null, 'Home', '/', 1, '00', '', () => app.buildAppMenus());
            } else {
                app.buildAppMenus();
            }
        }),
    });

    app.readyHooks.add('readyDivisionMenu', {
        ready: () => app.dbConnection && app.dbConnection.buildCondition,
        run: () => app.model.dvWebsite.getAll((err, dvWebsites) => {
            if (err) {
                console.error('Get unit website has errors!');
            } else if (dvWebsites) {
                const handleCreateDefault = (index = 0) => {
                    if (index < dvWebsites.length) {
                        let dvWebsite = dvWebsites[index];
                        app.model.fwMenu.get({ link: '/' + dvWebsite.shortname }, (error, menu) => {
                            if (error) {
                                console.error('Get menu by link has errors!');
                            } else if (menu == null) {
                                app.model.fwMenu.createDefault(null, dvWebsite.shortname + ' home', '/' + dvWebsite.shortname, 1, dvWebsite.maDonVi, '', () => {
                                    app.buildAppMenus();
                                    handleCreateDefault(index + 1);
                                });
                            } else {
                                app.buildAppMenus();
                                handleCreateDefault(index + 1);
                            }
                        });
                    }
                };
                handleCreateDefault();
            }
        }),
    });


    app.get('/api/menu/all', app.permission.check('menu:read'), (req, res) => {
        app.model.fwMenu.getDivisionMenuTree('00', '', (error, menuTree) => {
            app.buildAppMenus(menuTree);
            res.send({ error, items: menuTree });
        });
    });

    app.get('/api/menu/item/:id', app.permission.check('menu:read'), (req, res) => {
        app.model.fwMenu.get({ id: req.params.id }, (error, menu) => {
            if (error || menu == null) {
                console.log(error);
                res.send({ error: 'Lỗi khi lấy menu!' });
            } else {
                const menuComponentIds = [],
                    menuComponents = [];
                const getComponent = (level, index, componentIds, components, done) => {
                    if (index < componentIds.length) {
                        app.model.fwComponent.get({ id: componentIds[index] }, (error, component) => {
                            if (error || component == null) {
                                res.send({ error: 'Lỗi khi lấy thành phần trang!' });
                            } else {
                                component = app.clone(component);
                                component.components = [];
                                components.push(component);

                                const getNextComponent = (viewName) => {
                                    component.viewName = viewName;
                                    if (component.componentIds) {
                                        const childComponentIds = component.componentIds.split(',').map(id => Number(id));
                                        getComponent(level + 1, 0, childComponentIds, component.components, () => {
                                            getComponent(level, index + 1, componentIds, components, done);
                                        });
                                    } else {
                                        getComponent(level, index + 1, componentIds, components, done);
                                    }
                                };
                                if (component.viewType && component.viewId) {
                                    let viewType = component.viewType;
                                    if (component.viewId && (['carousel', 'news', 'event', 'feature', 'video', 'gallery', 'content', 'all news', 'all divisions'].indexOf(viewType) != -1)) {
                                        if (viewType === 'carousel' || viewType === 'gallery') {
                                            viewType = 'homeCarousel';
                                        } else if (viewType === 'video') {
                                            viewType = 'homeVideo';
                                        } else if (viewType === 'feature') {
                                            viewType = 'homeFeature';
                                        } else if (viewType === 'content') {
                                            viewType = 'homeContent';
                                        } else if (viewType == 'all news') {
                                            viewType = 'fwCategory';
                                        } else if (viewType == 'all divisions') {
                                            viewType = 'dmLoaiDonVi';
                                        } else {
                                            viewType = 'fw' + viewType[0].toUpperCase() + viewType.substring(1);
                                        }
                                        app.model[viewType].get({ id: component.viewId }, (error, item) => getNextComponent(item ? item.title : '<empty>'));
                                    } else if (['all events', 'all jobs', 'last news', 'last events', 'all events', 'hot events', 'last jobs', 'jobs carousel', 'subscribe', 'all staffs', 'contact'].indexOf(viewType) != -1) {
                                        getNextComponent(viewType);
                                    } else {
                                        getNextComponent('<empty>');
                                    }
                                } else {
                                    getNextComponent('<empty>');
                                }
                            }
                        });
                    } else {
                        done();
                    }
                };

                const getAllComponents = () => {
                    menuComponentIds.push(menu.componentId);
                    getComponent(0, 0, menuComponentIds, menuComponents, () => {
                        menu = app.clone(menu);
                        const newComponents = menuComponents[0].components.sort((a, b) => a.priority - b.priority);
                        menu.component = Object.assign(menuComponents[0], { components: newComponents });
                        res.send({ menu });
                    });
                };

                if (menu.componentId == null || menu.componentId == undefined) {
                    app.model.fwComponent.createNew('container', '', '<empty>', null, '', (error, result) => {
                        if (error == null && result && result.outBinds && result.outBinds.ret != null) {
                            menu.componentId = result.outBinds.ret;
                            app.model.fwMenu.update({ id: menu.id }, { componentId: menu.componentId }, (error) => {
                                if (error) {
                                    res.send({ error: 'Tạo danh mục bị lỗi!' });
                                } else {
                                    getAllComponents();
                                }
                            });
                        } else {
                            res.send({ error: 'Tạo danh mục bị lỗi!' });
                        }
                    });
                } else {
                    getAllComponents();
                }
            }
        });
    });

    app.post('/api/menu', app.permission.check('menu:write'), (req, res) => {
        const parentId = req.body.id ? req.body.id : null,
            maDonVi = req.body.maDonVi ? req.body.maDonVi : '00',
            maWebsite = req.body.maWebsite ? req.body.maWebsite : '';
        app.model.fwMenu.createDefault(parentId, 'Menu', '#', 0, maDonVi, maWebsite, (error, result) => {
            if (error == null && result && result.outBinds && result.outBinds.ret != null) {
                app.model.fwMenu.get({ id: result.outBinds.ret }, (error, item) => {
                    if (error == null) app.buildAppMenus();
                    res.send({ error, item });
                });
            } else {
                console.log(error);
                res.send({ error: 'Tạo menu bị lỗi!' });
            }
        });
    });

    app.post('/api/menu/build', app.permission.check('menu:write'), (req, res) => { //TODO: delete
        app.buildAppMenus();
        res.send('OK');
    });

    app.put('/api/menu', app.permission.check('menu:write'), (req, res) => {
        app.model.fwMenu.update({ id: req.body.id }, req.body.changes, (error, item) => res.send({ error, item }));
    });

    app.put('/api/menu/priorities', app.permission.check('menu:write'), (req, res) => {
        let error = null;
        const changes = req.body.changes,
            solve = (index) => {
                if (index < changes.length) {
                    const item = changes[index];
                    if (item) {
                        app.model.fwMenu.update({ id: item.id }, { priority: item.priority }, err => {
                            if (err) error = err;
                            solve(index + 1);
                        });
                    }
                } else {
                    res.send({ error });
                }
            };
        solve(0);
    });

    app.delete('/api/menu', app.permission.check('menu:write'), (req, res) => {
        app.model.fwMenu.get({ id: req.body.id }, (error, item) => {
            if (error || item == null) {
                console.log({ error: 'Id không hợp lệ!' });
            } else {
                const componentId = Number(item.componentId);
                if (!isNaN(componentId)) app.model.fwComponent.deleteComponent(componentId);
                app.model.fwMenu.delete({ id: item.id }, error => res.send({ error }));
            }
        });
    });

    app.put('/api/menu/build', app.permission.check('component:write'), (req, res) => {
        app.buildAppMenus();
        res.send('OK');
    });

    app.get('/api/dvWebsite/menu/:maDonVi', app.permission.check('menu:read'), (req, res) => {
        const maDonVi = req.params.maDonVi,
            maWebsite = req.query.maWebsite;
        app.model.fwMenu.getDivisionMenuTree(maDonVi, maWebsite, (error, menuTree) => {
            res.send({ error, items: menuTree });
        });
    });

    app.get('/home/dvWebsite/menu/:maDonVi', (req, res) => {
        const maDonVi = req.params.maDonVi,
            maWebsite = req.query.maWebsite;
        app.model.fwMenu.homeGetDivisionMenuTree(maDonVi, maWebsite, (error, menuTree) => {
            res.send({ error, items: menuTree });
        });
    });

    app.get('/home/menu', (req, res) => {
        const link = req.query.link;
        app.model.fwMenu.get({ link }, (error, menu) => {
            res.send({ error, menu });
        });
    });

};