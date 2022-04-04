module.exports = app => {
    const menu = {
        parentMenu: app.parentMenu.tccb,
        menus: {
            9503: { title: 'Quá trình sáng kiến', link: '/user/tccb/qua-trinh/sang-kien', icon: 'fa fa-lightbulb-o', color: '#000000', backgroundColor: '#ffff19', groupIndex: 3 },
        },
    };
    const menuStaff = {
        parentMenu: app.parentMenu.user,
        menus: {
            1036: { title: 'Danh sách sáng kiến', link: '/user/sang-kien', icon: 'fa fa-lightbulb-o', color: '#000000', backgroundColor: '#ffff19', groupIndex: 2 },
        },
    };

    app.permission.add(
        { name: 'staff:login', menu: menuStaff },
        { name: 'qtSangKien:read', menu },
        { name: 'qtSangKien:write' },
        { name: 'qtSangKien:delete' },
    );
    app.get('/user/tccb/qua-trinh/sang-kien', app.permission.check('qtSangKien:read'), app.templates.admin);
    app.get('/user/sang-kien', app.permission.check('staff:login'), app.templates.admin);

    // APIs -----------------------------------------------------------------------------------------------------------------------------------------
    
    // End APIS -------------------------------------------------------------------------------------------------------------------------------------

    // TCCB APIs ------------------------------------------------------------------------------------------------------------------------------------
    app.get('/api/tccb/qua-trinh/sang-kien/page/:pageNumber/:pageSize', app.permission.check('staff:login'), (req, res) => {
        const pageNumber = parseInt(req.params.pageNumber),
            pageSize = parseInt(req.params.pageSize),
            searchTerm = typeof req.query.condition === 'string' ? req.query.condition : '',
            filter = JSON.stringify(req.query.filter || {});
        app.model.qtSangKien.searchPage(pageNumber, pageSize, filter, searchTerm, (error, page) => {
            if (error || page == null) {
                res.send({ error });
            } else {
                const { totalitem: totalItem, pagesize: pageSize, pagetotal: pageTotal, pagenumber: pageNumber, rows: list } = page;
                const pageCondition = searchTerm;
                res.send({ error, page: { totalItem, pageSize, pageTotal, pageNumber, pageCondition, list } });
            }
        });
    });

    app.post('/api/tccb/qua-trinh/sang-kien', app.permission.check('qtSangKien:write'), (req, res) =>
        app.model.qtSangKien.create(req.body.data, (error, item) => res.send({ error, item })));

    app.put('/api/tccb/qua-trinh/sang-kien', app.permission.check('qtSangKien:write'), (req, res) =>
        app.model.qtSangKien.update({ id: req.body.id }, req.body.changes, (error, item) => res.send({ error, item })));

    app.delete('/api/tccb/qua-trinh/sang-kien', app.permission.check('qtSangKien:write'), (req, res) =>
        app.model.qtSangKien.delete({ id: req.body.id }, (error) => res.send(error)));

    // End TCCB APIs ---------------------------------------------------------------------------------------------------------------------------

    // User APIs -------------------------------------------------------------------------------------------------------------------------------
    app.post('/api/user/qua-trinh/sang-kien', app.permission.check('staff:login'), (req, res) => {
        if (req.body.data && req.session.user) {
            const data = req.body.data;
            app.model.qtSangKien.create(data, (error, item) => res.send({ error, item }));
        } else {
            res.send({ error: 'Invalid parameter!' });
        }
    });

    app.put('/api/user/qua-trinh/sang-kien', app.permission.check('staff:login'), (req, res) => {
        if (req.body.changes && req.session.user) {
            app.model.qtSangKien.get({ id: req.body.id }, (error, item) => {
                if (error || item == null) {
                    res.send({ error: 'Not found!' });
                } else {
                    app.model.canBo.get({ shcc: item.shcc }, (e, r) => {
                        if (e || r == null) res.send({ error: 'Staff not found!' }); else {
                            const changes = req.body.changes;
                            app.model.qtSangKien.update({ id: req.body.id }, changes, (error, item) => res.send({ error, item }));
                        }
                    });
                }
            });
        } else {
            res.send({ error: 'Invalid parameter!' });
        }
    });

    app.delete('/api/user/qua-trinh/sang-kien', app.permission.check('staff:login'), (req, res) => {
        if (req.session.user) {
            app.model.qtSangKien.get({ id: req.body.id }, (error, item) => {
                if (error || item == null) {
                    res.send({ error: 'Not found!' });
                } else {
                    app.model.canBo.get({ shcc: item.shcc }, (e, r) => {
                        if (e || r == null) res.send({ error: 'Staff not found!' }); else {
                            app.model.qtSangKien.delete({ id: req.body.id }, (error, item) => res.send({ error, item }));
                        }
                    });
                }
            });
        } else {
            res.send({ error: 'Invalid parameter!' });
        }
    });

    app.get('/api/user/qua-trinh/sang-kien/page/:pageNumber/:pageSize', app.permission.check('staff:login'), (req, res) => {
        const pageNumber = parseInt(req.params.pageNumber),
            pageSize = parseInt(req.params.pageSize),
            searchTerm = typeof req.query.condition === 'string' ? req.query.condition : '',
            filter = JSON.stringify(req.query.filter || {});
        app.model.qtSangKien.searchPage(pageNumber, pageSize, filter, searchTerm, (error, page) => {
            if (error || page == null) {
                res.send({ error });
            } else {
                const { totalitem: totalItem, pagesize: pageSize, pagetotal: pageTotal, pagenumber: pageNumber, rows: list } = page;
                const pageCondition = searchTerm;
                res.send({ error, page: { totalItem, pageSize, pageTotal, pageNumber, pageCondition, list } });
            }
        });
    });
    // End User APIs ---------------------------------------------------------------------------------------------------------------- 
};