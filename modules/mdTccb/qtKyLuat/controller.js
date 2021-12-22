module.exports = app => {
    const menu = {
        parentMenu: app.parentMenu.tccb,
        // menus: {
        //     3017: { title: 'Quá trình kỷ luật', link: '/user/tccb/qua-trinh/ky-luat', icon: 'fa-gift', backgroundColor: '#283dde', groupIndex: 3 },
        // },
    };
    app.permission.add(
        { name: 'staff:login', menu: { parentMenu: { index: 1000, title: 'Thông tin cá nhân', icon: 'fa-user', link: '/user' } }, },
        { name: 'qtKhenThuongAll:read', menu },
        { name: 'qtKhenThuongAll:write' },
        { name: 'qtKhenThuongAll:delete' },
    );
    app.get('/user/tccb/qua-trinh/ky-luat/:id', app.permission.check('qtKhenThuongAll:read'), app.templates.admin);
    app.get('/user/tccb/qua-trinh/ky-luat', app.permission.check('qtKhenThuongAll:read'), app.templates.admin);

    // APIs -----------------------------------------------------------------------------------------------------------------------------------------
    app.get('/api/tccb/qua-trinh/ky-luat/page/:pageNumber/:pageSize', app.permission.check('qtKhenThuongAll:read'), (req, res) => {
        const pageNumber = parseInt(req.params.pageNumber),
            pageSize = parseInt(req.params.pageSize),
            searchTerm = typeof req.query.condition === 'string' ? req.query.condition : '';
        app.model.qtKhenThuongAll.searchPage(pageNumber, pageSize, searchTerm, (error, page) => {
            if (error || page == null) {
                res.send({ error });
            } else {
                const { totalitem: totalItem, pagesize: pageSize, pagetotal: pageTotal, pagenumber: pageNumber, rows: list } = page;
                res.send({ error, page: { totalItem, pageSize, pageTotal, pageNumber, list } });
            }
        });
    });

    app.get('/api/tccb/qua-trinh/ky-luat/group/page/:pageNumber/:pageSize', app.permission.check('qtKhenThuongAll:read'), (req, res) => {
        const pageNumber = parseInt(req.params.pageNumber),
            pageSize = parseInt(req.params.pageSize),
            searchTerm = typeof req.query.condition === 'string' ? req.query.condition : '';
        app.model.qtKhenThuongAll.groupPage(pageNumber, pageSize, searchTerm, (error, page) => {
            if (error || page == null) {
                res.send({ error });
            } else {
                const { totalitem: totalItem, pagesize: pageSize, pagetotal: pageTotal, pagenumber: pageNumber, rows: list } = page;
                res.send({ error, page: { totalItem, pageSize, pageTotal, pageNumber, list } });
            }
        });
    });
    app.get('/api/tccb/qua-trinh/ky-luat/group_dt/page/:pageNumber/:pageSize', app.permission.check('qtKhenThuongAll:read'), (req, res) => {
        const pageNumber = parseInt(req.params.pageNumber),
            pageSize = parseInt(req.params.pageSize),
            searchTerm = typeof req.query.condition === 'string' ? req.query.condition : '';
        app.model.qtKhenThuongAll.groupPageMa(pageNumber, pageSize, searchTerm, (error, page) => {
            if (error || page == null) {
                res.send({ error });
            } else {
                const { totalitem: totalItem, pagesize: pageSize, pagetotal: pageTotal, pagenumber: pageNumber, rows: list } = page;
                res.send({ error, page: { totalItem, pageSize, pageTotal, pageNumber, list } });
            }
        });
    });
    app.get('/api/tccb/qua-trinh/ky-luat/all', app.permission.check('qtKhenThuongAll:read'), (req, res) => {
        let condition = { statement: null };
        if (req.query.ma) {
            condition = {
                statement: 'ma = :searchText',
                parameter: { searchText: req.query.ma},
            };
        }
        app.model.qtKhenThuongAll.getAll(condition, (error, items) => res.send({ error, items }));
    });

    app.get('/api/tccb/qua-trinh/ky-luat/item/:id', app.permission.check('qtKhenThuongAll:read'), (req, res) => {
        app.model.qtKhenThuongAll.get({ id: req.params.id }, (error, item) => res.send({ error, item }));
    });

    app.post('/api/tccb/qua-trinh/ky-luat', app.permission.check('staff:write'), (req, res) => {
        app.model.qtKhenThuongAll.create(req.body.items, (error, item) => res.send({ error, item }));
    });

    app.put('/api/tccb/qua-trinh/ky-luat', app.permission.check('staff:write'), (req, res) =>
        app.model.qtKhenThuongAll.update({ id: req.body.id }, req.body.changes, (error, item) => res.send({ error, item })));

    app.delete('/api/tccb/qua-trinh/ky-luat', app.permission.check('staff:write'), (req, res) =>
        app.model.qtKhenThuongAll.delete({ id: req.body.id }, (error) => res.send(error)));


    //User Actions:
    app.post('/api/user/qua-trinh/ky-luat', app.permission.check('staff:login'), (req, res) => {
        if (req.body.data && req.session.user) {
            const data = app.clone(req.body.data, { shcc: req.session.user.shcc });
            app.model.qtKyLuat.create(data, (error, item) => res.send({ error, item }));
        } else {
            res.status(400).send({ error: 'Invalid parameter!' });
        }
    });

    app.put('/api/user/qua-trinh/ky-luat', app.permission.check('staff:login'), (req, res) => {
        if (req.body.changes && req.session.user) {
            app.model.qtKyLuat.get({ id: req.body.id }, (error, item) => {
                if (error || item == null) {
                    res.status(400).send({ error: 'Not found!' });
                } else {
                    if (item.shcc === req.session.user.shcc) {
                        const changes = app.clone(req.body.changes, { shcc: req.session.user.shcc });
                        app.model.qtKyLuat.update({ id: req.body.id }, changes, (error, item) => res.send({ error, item }));
                    } else {
                        res.status(400).send({ error: 'Not found!' });
                    }
                }
            });
        } else {
            res.status(400).send({ error: 'Invalid parameter!' });
        }
    });

    app.delete('/api/user/qua-trinh/ky-luat', app.permission.check('staff:login'), (req, res) => {
        if (req.session.user) {
            app.model.qtKyLuat.get({ id: req.body.id }, (error, item) => {
                if (error || item == null) {
                    res.status(400).send({ error: 'Not found!' });
                } else {
                    if (item.shcc === req.session.user.shcc) {
                        app.model.qtKyLuat.delete({ id: req.body.id }, (error) => res.send(error));
                    } else {
                        res.status(400).send({ error: 'Not found!' });
                    }
                }
            });
        } else {
            res.status(400).send({ error: 'Invalid parameter!' });
        }
    });
};