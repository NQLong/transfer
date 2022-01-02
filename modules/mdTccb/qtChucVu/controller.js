module.exports = app => {
    const menu = {
        parentMenu: app.parentMenu.tccb,
        menus: {
            3009: { title: 'Chức Vụ', link: '/user/tccb/qua-trinh/chuc-vu', icon: 'fa-street-view', backgroundColor: '#ebcf34', groupIndex: 3},
        },
    };
    app.permission.add(
        { name: 'staff:login', menu: { parentMenu: { index: 1000, title: 'Thông tin cá nhân', icon: 'fa-user', link: '/user' } }, },
        { name: 'qtChucVu:read', menu },
        { name: 'qtChucVu:write' },
        { name: 'qtChucVu:delete' },
    );
    app.get('/user/qua-trinh/chuc-vu/:stt', app.permission.check('qtChucVu:read'), app.templates.admin);
    app.get('/user/qua-trinh/chuc-vu', app.permission.check('qtChucVu:read'), app.templates.admin);
        
    // APIs -----------------------------------------------------------------------------------------------------------------------------------------

    app.get('/api/tccb/qua-trinh/chuc-vu/page/:pageNumber/:pageSize', app.permission.check('qtChucVu:read'), (req, res) => {
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

    app.get('/api/tccb/qua-trinh/chuc-vu/group/page/:pageNumber/:pageSize', app.permission.check('qtChucVu:read'), (req, res) => {
        const pageNumber = parseInt(req.params.pageNumber),
            pageSize = parseInt(req.params.pageSize),
            searchTerm = typeof req.query.condition === 'string' ? req.query.condition : '';
        app.model.qtChucVu.groupPage(pageNumber, pageSize, searchTerm, (error, page) => {
            if (error || page == null) {
                res.send({ error });
            } else {
                const { totalitem: totalItem, pagesize: pageSize, pagetotal: pageTotal, pagenumber: pageNumber, rows: list } = page;
                res.send({ error, page: { totalItem, pageSize, pageTotal, pageNumber, list } });
            }
        });
    });

    app.get('/api/tccb/qua-trinh/chuc-vu/all', app.permission.check('qtChucVu:read'), (req, res) => {
        let condition = { statement: null };
        if (req.query.shcc) {
            condition = {
                statement: 'shcc = :searchText',
                parameter: { searchText: req.query.shcc },
            };
        }
        app.model.qtChucVu.getAll(condition, (error, items) => res.send({ error, items }));
    });

    app.get('/api/tccb/qua-trinh/chuc-vu/item/:stt', app.permission.check('qtChucVu:read'), (req, res) => {
        app.model.qtChucVu.get({ stt: req.params.stt }, (error, item) => res.send({ error, item }));
    });

    app.post('/api/tccb/qua-trinh/chuc-vu', app.permission.check('qtChucVu:write'), (req, res) =>
        app.model.qtChucVu.create(req.body.items, (error, item) => res.send({ error, item })));

    app.put('/api/tccb/qua-trinh/chuc-vu', app.permission.check('qtChucVu:write'), (req, res) =>
        app.model.qtChucVu.update({ stt: req.body.stt }, req.body.changes, (error, item) => res.send({ error, item })));

    app.delete('/api/tccb/qua-trinh/chuc-vu', app.permission.check('qtChucVu:write'), (req, res) =>
        app.model.qtChucVu.delete({ stt: req.body.stt }, (error) => res.send(error)));

    app.post('/api/user/qua-trinh/chuc-vu', app.permission.check('qtChucVu:login'), (req, res) => {
        if (req.body.data && req.session.user) {
            const data = app.clone(req.body.data, { shcc: req.session.user.shcc });
            app.model.qtChucVu.create(data, (error, item) => res.send({ error, item }));
        } else {
            res.status(400).send({ error: 'Invalstt parameter!' });
        }
    });

    app.put('/api/user/qua-trinh/chuc-vu', app.permission.check('staff:login'), (req, res) => {
        if (req.body.changes && req.session.user) {
            app.model.qtChucVu.get({ stt: req.body.stt }, (error, item) => {
                if (error || item == null) {
                    res.status(400).send({ error: 'Not found!' });
                } else {
                    if (item.shcc === req.session.user.shcc) {
                        const changes = app.clone(req.body.changes, { shcc: req.session.user.shcc });
                        app.model.qtChucVu.update({ stt: req.body.stt }, changes, (error, item) => res.send({ error, item }));
                    } else {
                        res.status(400).send({ error: 'Not found!' });
                    }
                }
            });
        } else {
            res.status(400).send({ error: 'Invalstt parameter!' });
        }
    });

    app.delete('/api/user/qua-trinh/chuc-vu', app.permission.check('staff:login'), (req, res) => {
        if (req.session.user) {
            app.model.qtChucVu.get({ stt: req.body.stt }, (error, item) => {
                if (error || item == null) {
                    res.status(400).send({ error: 'Not found!' });
                } else {
                    if (item.shcc === req.session.user.shcc) {
                        app.model.qtChucVu.delete({ stt: req.body.stt }, (error) => res.send(error));
                    } else {
                        res.status(400).send({ error: 'Not found!' });
                    }
                }
            });
        } else {
            res.status(400).send({ error: 'Invalstt parameter!' });
        }
    });

    app.get('/api/tccb/qua-trinh/chuc-vu-by-shcc/:shcc', app.permission.check('staff:login'), (req, res) => {
        app.model.qtChucVu.getByShcc(req.params.shcc, (error, item) => res.send({ error, item: item.rows }));
    });
};