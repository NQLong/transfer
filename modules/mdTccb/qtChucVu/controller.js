module.exports = app => {
    const menu = {
        parentMenu: app.parentMenu.tccb,
        menus: {
            3009: { title: 'Quá trình chức vụ', link: '/user/qua-trinh/chuc-vu', icon: 'fa-table', backgroundColor: '#8bc34a', groupIndex: 2},
        },
    };
    app.permission.add(
        { name: 'staff:login', menu: { parentMenu: { index: 1000, title: 'Thông tin cá nhân', icon: 'fa-user', link: '/user' } }, },
        { name: 'qtChucVu:read', menu },
        { name: 'qtChucVu:write' },
        { name: 'qtChucVu:delete' },
    );
    app.get('/user/qua-trinh/chuc-vu/:ma', app.permission.check('qtChucVu:read'), app.templates.admin);
    app.get('/user/qua-trinh/chuc-vu', app.permission.check('qtChucVu:read'), app.templates.admin);
        
    // APIs -----------------------------------------------------------------------------------------------------------------------------------------

    app.get('/api/qua-trinh/chuc-vu/page/:pageNumber/:pageSize', app.permission.check('qtChucVu:read'), (req, res) => {
        const pageNumber = parseInt(req.params.pageNumber),
            pageSize = parseInt(req.params.pageSize),
            searchTerm = typeof req.query.condition === 'string' ? req.query.condition : '';
        app.model.qtChucVu.searchPage(pageNumber, pageSize, searchTerm, (error, page) => {
            if (error || page == null) {
                res.send({ error });
            } else {
                const { totalitem: totalItem, pagesize: pageSize, pagetotal: pageTotal, pagenumber: pageNumber, rows: list } = page;
                res.send({ error, page: { totalItem, pageSize, pageTotal, pageNumber, list } });
            }
        });
    });

    app.get('/api/qua-trinh/chuc-vu/group/page/:pageNumber/:pageSize', app.permission.check('qtChucVu:read'), (req, res) => {
        const pageNumber = parseInt(req.params.pageNumber),
            pageSize = parseInt(req.params.pageSize),
            searchTerm = typeof req.query.condition === 'string' ? req.query.condition : '';
        app.model.qtChucVu.searchPageGroup(pageNumber, pageSize, searchTerm, (error, page) => {
            if (error || page == null) {
                res.send({ error });
            } else {
                const { totalitem: totalItem, pagesize: pageSize, pagetotal: pageTotal, pagenumber: pageNumber, rows: list } = page;
                res.send({ error, page: { totalItem, pageSize, pageTotal, pageNumber, list } });
            }
        });
    });

    app.get('/api/qua-trinh/chuc-vu/all', app.permission.check('qtChucVu:read'), (req, res) => {
        let condition = { statement: null };
        if (req.query.shcc) {
            condition = {
                statement: 'shcc = :searchText',
                parameter: { searchText: req.query.shcc },
            };
        }
        app.model.qtChucVu.getAll(condition, (error, items) => res.send({ error, items }));
    });

    app.get('/api/qua-trinh/chuc-vu/item/:id', app.permission.check('qtChucVu:read'), (req, res) => {
        app.model.qtChucVu.get({ id: req.params.id }, (error, item) => res.send({ error, item }));
    });

    app.post('/api/qua-trinh/chuc-vu', app.permission.check('staff:write'), (req, res) =>
        app.model.qtChucVu.create(req.body.data, (error, item) => res.send({ error, item })));

    app.put('/api/qua-trinh/chuc-vu', app.permission.check('staff:write'), (req, res) =>
        app.model.qtChucVu.update({ id: req.body.id }, req.body.changes, (error, item) => res.send({ error, item })));

    app.delete('/api/qua-trinh/chuc-vu', app.permission.check('staff:write'), (req, res) =>
        app.model.qtChucVu.delete({ id: req.body.id }, (error) => res.send(error)));

    app.post('/api/user/qua-trinh/chuc-vu', app.permission.check('staff:login'), (req, res) => {
        if (req.body.data && req.session.user) {
            const data = app.clone(req.body.data, { shcc: req.session.user.shcc });
            app.model.qtChucVu.create(data, (error, item) => res.send({ error, item }));
        } else {
            res.status(400).send({ error: 'Invalid parameter!' });
        }
    });

    app.put('/api/user/qua-trinh/chuc-vu', app.permission.check('staff:login'), (req, res) => {
        if (req.body.changes && req.session.user) {
            app.model.qtChucVu.get({ id: req.body.id }, (error, item) => {
                if (error || item == null) {
                    res.status(400).send({ error: 'Not found!' });
                } else {
                    if (item.shcc === req.session.user.shcc) {
                        const changes = app.clone(req.body.changes, { shcc: req.session.user.shcc });
                        app.model.qtChucVu.update({ id: req.body.id }, changes, (error, item) => res.send({ error, item }));
                    } else {
                        res.status(400).send({ error: 'Not found!' });
                    }
                }
            });
        } else {
            res.status(400).send({ error: 'Invalid parameter!' });
        }
    });

    app.delete('/api/user/qua-trinh/chuc-vu', app.permission.check('staff:login'), (req, res) => {
        if (req.session.user) {
            app.model.qtChucVu.get({ id: req.body.id }, (error, item) => {
                if (error || item == null) {
                    res.status(400).send({ error: 'Not found!' });
                } else {
                    if (item.shcc === req.session.user.shcc) {
                        app.model.qtChucVu.delete({ id: req.body.id }, (error) => res.send(error));
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