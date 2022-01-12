module.exports = app => {
    const menu = {
        parentMenu: app.parentMenu.tccb,
        menus: {
            3016: { title: 'Quá trình đào tạo', link: '/user/tccb/qua-trinh/dao-tao', icon: 'fa-podcast', backgroundColor: '#635118', groupIndex: 4},
        },
    };

    app.permission.add(
        { name: 'qtDaoTao:read', menu },
        { name: 'qtDaoTao:write' },
        { name: 'qtDaoTao:delete' },
    );
    app.get('/user/tccb/qua-trinh/dao-tao/:stt', app.permission.check('qtDaoTao:read'), app.templates.admin);
    app.get('/user/tccb/qua-trinh/dao-tao', app.permission.check('qtDaoTao:read'), app.templates.admin);

    // APIs -----------------------------------------------------------------------------------------------------------------------------------------
    const checkGetStaffPermission = (req, res, next) => app.isDebug ? next() : app.permission.check('staff:login')(req, res, next);

    app.get('/api/qua-trinh/dao-tao/page/:pageNumber/:pageSize', checkGetStaffPermission, (req, res) => {
        const pageNumber = parseInt(req.params.pageNumber),
            pageSize = parseInt(req.params.pageSize);
        
        let condition = { statement: null };
        if (req.query.condition) {
            condition = {
                statement: 'lower(shcc) LIKE :searchText',
                parameter: { searchText: `%${req.query.condition.toLowerCase()}%` },
            };
        }
        app.model.qtDaoTao.getPage(pageNumber, pageSize, condition, (error, page) => res.send({ error, page }));
    });
    
    app.get('/api/qua-trinh/dao-tao/all', checkGetStaffPermission, (req, res) => {
        app.model.qtDaoTao.getAll((error, items) => res.send({ error, items }));
    });

    app.get('/api/qua-trinh/dao-tao/item/:id', checkGetStaffPermission, (req, res) => {
        app.model.qtDaoTao.get({ stt: req.params.id }, (error, item) => res.send({ error, item }));
    });

    app.post('/api/qua-trinh/dao-tao', app.permission.check('staff:write'), (req, res) =>
        app.model.qtDaoTao.create(req.body.data, (error, item) => res.send({ error, item })));

    app.put('/api/qua-trinh/dao-tao', app.permission.check('staff:write'), (req, res) =>
        app.model.qtDaoTao.update({ id: req.body.id }, req.body.changes, (error, item) => res.send({ error, item })));

    app.delete('/api/qua-trinh/dao-tao', app.permission.check('staff:write'), (req, res) =>
        app.model.qtDaoTao.delete({ id: req.body.id }, (error) => res.send(error)));

    app.post('/api/user/qua-trinh/dao-tao', app.permission.check('staff:login'), (req, res) => {
        if (req.body.data && req.session.user) {
            const data = req.body.data;
            app.model.qtDaoTao.create(data, (error, item) => res.send({ error, item }));
        } else {
            res.send({ error: 'Invalid parameter!' });
        }
    });

    app.put('/api/user/qua-trinh/dao-tao', app.permission.check('staff:login'), (req, res) => {
        if (req.body.changes && req.session.user) {
            app.model.qtDaoTao.get({ id: req.body.id }, (error, item) => {
                if (error || item == null) {
                    res.send({ error: 'Not found!' });
                } else {
                    app.model.canBo.get({ shcc: item.shcc }, (e, r) => {
                        if (e || r == null) res.send({ error: 'Not found!' }); else {
                            const changes = req.body.changes;
                            app.model.qtDaoTao.update({ id: req.body.id }, changes, (error, item) => res.send({ error, item }));
                        }
                    });
                }
            });
        } else {
            res.send({ error: 'Invalid parameter!' });
        }
    });

    app.delete('/api/user/qua-trinh/dao-tao', app.permission.check('staff:login'), (req, res) => {
        if (req.session.user) {
            app.model.qtDaoTao.get({ id: req.body.id }, (error, item) => {
                if (error || item == null) {
                    res.send({ error: 'Not found!' });
                } else {
                    app.model.canBo.get({ shcc: item.shcc }, (e, r) => {
                        if (e || r == null) res.send({ error: 'Not found!' }); else {
                            app.model.qtDaoTao.delete({ id: req.body.id }, (error, item) => res.send({ error, item }));
                        }
                    });
                }
            });
        } else {
            res.send({ error: 'Invalid parameter!' });
        }
    });
};