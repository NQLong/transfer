module.exports = app => {
    const menu = {
        parentMenu: app.parentMenu.truyenThong,
        menus: { 2100: { title: 'Thành phần giao diện', link: '/user/component', groupIndex: 0, icon: 'fa-object-group', backgroundColor: '#00897b' } }
    };
    app.permission.add(
        { name: 'component:read', menu },
        { name: 'component:write', menu },
        { name: 'component:delete', menu },
    );
    app.get('/user/component', app.permission.check('component:read'), app.templates.admin);
    app.get('/user/content/edit/:id', app.permission.check('component:read'), app.templates.admin);
    app.get('/user/carousel/edit/:carouselId', app.permission.check('component:read'), app.templates.admin);
    app.get('/user/statistic/edit/:id', app.permission.check('component:read'), app.templates.admin);
    app.get('/user/slogan/edit/:id', app.permission.check('component:read'), app.templates.admin);
    app.get('/user/logo/edit/:id', app.permission.check('component:read'), app.templates.admin);
    app.get('/user/testimony/edit/:id', app.permission.check('component:read'), app.templates.admin);
    app.get('/user/staff-group/edit/:id', app.permission.check('component:read'), app.templates.admin);
    app.get('/user/feature/edit/:id', app.permission.check('component:read'), app.templates.admin);

    // APIs -----------------------------------------------------------------------------------------------------------------------------------------
    app.post('/api/menu/component', app.permission.check('staff:login'), (req, res) => {
        const permissions = req.session.user.permissions,
            valid = permissions.includes('component:write') || permissions.includes('news:tuyensinh')
                || permissions.includes('website:write');

        if (valid) app.model.fwComponent.get({ id: req.body.parentId }, (error, parent) => {
            if (error || parent == null) {
                res.send({ error: 'Id không chính xác!' });
            } else {
                let { className, style, viewType, viewId, detail } = req.body.component;
                className = className.trim();
                style = style.trim();
                viewType = viewType.trim();
                detail = detail ? detail.trim() : '';
                if (app.model.fwComponent.viewTypes.indexOf(viewType) == -1) viewType = app.model.fwComponent.viewTypes[0];
                app.model.fwComponent.createNew(className, style, viewType, viewId, detail, (error, result) => {
                    if (error == null && result && result.outBinds && result.outBinds.ret != null) {
                        const componentId = result.outBinds.ret,
                            componentIds = parent.componentIds ? parent.componentIds + ',' + componentId : componentId;
                        app.model.fwComponent.update({ id: parent.id }, { componentIds }, error => {
                            if (error) {
                                res.send({ error: 'Tạo component bị lỗi!' });
                            } else {
                                app.model.fwComponent.get({ id: componentId }, (error, component) => {
                                    if (error == null) app.buildAppMenus();
                                    res.send({ error, component });
                                });
                            }
                        });
                    } else {
                        res.send({ error: 'Tạo component bị lỗi!' });
                    }
                });
            }
        });
    });

    app.put('/api/menu/component', app.permission.check('staff:login'), (req, res) => {
        const permissions = req.session.user.permissions,
            valid = permissions.includes('component:write') || permissions.includes('news:tuyensinh')
                || permissions.includes('website:write');
        if (valid) app.model.fwComponent.update({ id: req.body.id }, req.body.changes, error => {
            if (error == null) app.buildAppMenus();
            res.send({ error });
        });
    });

    app.put('/api/menu/component/priorities', app.permission.check('staff:login'), (req, res) => {
        const permissions = req.session.user.permissions,
            valid = permissions.includes('component:write') || permissions.includes('news:tuyensinh')
                || permissions.includes('website:write');
        if (valid) {
            let error = null;
            const updateOneChange = (index) => {
                if (index < req.body.changes.length) {
                    const item = req.body.changes[index];
                    if (item) {
                        app.model.fwComponent.update({ id: item.id }, { priority: item.priority }, err => {
                            if (err) error = err;
                            updateOneChange(index + 1);
                        });
                    }
                } else {
                    if (error == null) app.buildAppMenus();
                    res.send({ error });
                }
            };
            updateOneChange(0);
        }

    });

    app.delete('/api/menu/component', app.permission.check('staff:login'), (req, res) => {
        const permissions = req.session.user.permissions,
            valid = permissions.includes('component:write') || permissions.includes('news:tuyensinh')
                || permissions.includes('website:write');
        if (valid) {
            app.model.fwComponent.deleteComponent(req.body.id, error => {
                if (error == null) app.buildAppMenus();
                res.send({ error });
            });
        }

    });

    app.get('/api/menu/component/type/:pageType', app.permission.check('component:read'), (req, res) => {
        const pageType = req.params.pageType;
        if (pageType == 'carousel' || pageType == 'gallery') {
            let condition = { active: 1 };
            const permissions = req.session.user.permissions;
            if (permissions.includes('component:write')) {
                condition.maDonVi = '0';
            } else if (req.session.user.maDonVi) {
                condition.maDonVi = req.session.user.maDonVi;
            } else {
                res.send({ error: 'User not have permission' });
                return;
            }

            app.model.homeCarousel.getAll(condition, (error, items) => {
                res.send({ error, items: items.map(item => ({ id: item.id, text: item.title })) });
            });
        } else if (pageType == 'feature') {
            let condition = { active: 1 };
            const permissions = req.session.user.permissions;
            if (permissions.includes('component:write')) {
                condition.maDonVi = '0';
            } else if (req.session.user.maDonVi) {
                condition.maDonVi = req.session.user.maDonVi;
            } else {
                res.send({ error: 'User not have permission' });
                return;
            }

            app.model.homeFeature.getAll(condition, (error, items) => {
                res.send({ error, items: items.map(item => ({ id: item.id, text: item.title })) });
            });
        } else if (pageType == 'video') {
            let condition = { type: 'news', active: 1 };
            const permissions = req.session.user.permissions;
            if (permissions.includes('news:manage')) {
                condition.maDonVi = '0';
            } else if (permissions.includes('website:write') && req.session.user.maDonVi) {
                condition.maDonVi = req.session.user.maDonVi;
            } else {
                res.send({ error: 'User not have permission' });
                return;
            }
            app.model.homeVideo.getAll(condition, (error, items) => {
                res.send({ error, items: items.map(item => ({ id: item.id, text: item.title })) });
            });
        } else if (pageType == 'news') {
            app.model.fwNews.getAll((error, items) => {
                res.send({ error, items: items.map(item => ({ id: item.id, text: item.title })) });
            });
        } else if (pageType == 'event') {
            app.model.fwEvent.getAll((error, items) => {
                res.send({ error, items: items.map(item => ({ id: item.ma, text: item.tieuDe })) });
            });
        } else if (pageType == 'content') {
            let condition = { type: 'news', active: 1 };
            const permissions = req.session.user.permissions;
            if (permissions.includes('news:manage')) {
                condition.maDonVi = '0';
            } else if (permissions.includes('website:write') && req.session.user.maDonVi) {
                condition.maDonVi = req.session.user.maDonVi;
            } else {
                res.send({ error: 'User not have permission' });
                return;
            }
            app.model.homeContent.getAll(condition, (error, items) => {
                res.send({ error, items: items.map(item => ({ id: item.id, text: item.title })) });
            });
        } else if (pageType == 'all-news') {
            let condition = { type: 'news', active: 1 };
            const permissions = req.session.user.permissions;
            if (permissions.includes('news:manage')) {
                condition.maDonVi = '0';
            } else if (permissions.includes('website:write') && req.session.user.maDonVi) {
                condition.maDonVi = req.session.user.maDonVi;
            } else {
                res.send({ error: 'User not have permission' });
                return;
            }
            app.model.fwCategory.getAll(condition, '*', 'priority DESC', (error, items) => {
                res.send({ error, items: items.map(item => ({ id: item.id, text: item.title })) });
            });
        } else if (pageType == 'division') {
            app.model.dmLoaiDonVi.getAll((error, items) => {
                res.send({ error, items: items.map(item => ({ id: item.ma, text: item.ten })) });
            });
        } else if (pageType == 'last events' || pageType == 'all-events') {
            let condition = { type: 'event', active: 1 };
            const permissions = req.session.user.permissions;
            if (permissions.includes('event:manage')) {
                condition.maDonVi = '0';
            } else if (permissions.includes('website:write') && req.session.user.maDonVi) {
                condition.maDonVi = req.session.user.maDonVi;
            } else {
                res.send({ error: 'User not have permission' });
                return;
            }
            app.model.fwCategory.getAll(condition, '*', 'priority DESC', (error, items) => {
                res.send({ error, items: items.map(item => ({ id: item.id, text: JSON.parse(item.title).vi })) });
            });
        } else {
            res.send({ error: 'Invalid page type!' });
        }
    });
};
