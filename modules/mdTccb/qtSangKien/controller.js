module.exports = app => {
    const menu = {
        parentMenu: app.parentMenu.tccb,
        menus: {
            9503: { title: 'Quá trình sáng kiến', link: '/user/tccb/qua-trinh/sang-kien', icon: 'fa fa-lightbulb-o', color: '#000000', backgroundColor: '#ffff19', groupIndex: 3 },
        },
    };
    // const menuStaff = {
    //     parentMenu: app.parentMenu.user,
    //     menus: {
    //         1030: { title: 'Danh sách sáng kiến', link: '/user/sang-kien', icon: 'fa fa-cogs', backgroundColor: '#00e34c', groupIndex: 4 },
    //     },
    // };

    // const menuTCCB = {
    //     parentMenu: app.parentMenu.tccb,
    //     menus: {
    //         3070: { title: 'Danh sách sáng kiến', link: '/user/tccb/qua-trinh/sang-kien', icon: 'fa fa-cogs', backgroundColor: '#00e34c', groupIndex: 3 },
    //     },
    // };

    app.permission.add(
        // { name: 'staff:login', menu: menuStaff },
        // { name: 'qtSangKien:read', menu: menuTCCB },
        { name: 'qtSangKien:read', menu },
        { name: 'qtSangKien:write' },
        { name: 'qtSangKien:delete' },
    );
    app.get('/user/tccb/qua-trinh/sang-kien', app.permission.check('qtSangKien:read'), app.templates.admin);
    // app.get('/user/tccb/qua-trinh/sang-kien/group/:shcc', app.permission.check('qtSangKien:read'), app.templates.admin);
    // app.get('/user/sang-kien', app.permission.check('staff:login'), app.templates.admin);

    // APIs -----------------------------------------------------------------------------------------------------------------------------------------
    // //User Actions:
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
            searchTerm = typeof req.query.condition === 'string' ? req.query.condition : '';
        const { listShcc, listDv } = (req.query.filter && req.query.filter != '%%%%%%%%') ? req.query.filter : { listShcc: null, listDv: null };
        app.model.qtSangKien.searchPage(pageNumber, pageSize, listShcc, listDv, searchTerm, (error, page) => {
            if (error || page == null) {
                res.send({ error });
            } else {
                const { totalitem: totalItem, pagesize: pageSize, pagetotal: pageTotal, pagenumber: pageNumber, rows: list } = page;
                const pageCondition = searchTerm;
                res.send({ error, page: { totalItem, pageSize, pageTotal, pageNumber, pageCondition, list } });
            }
        });
    });
    ///END USER ACTIONS
    
    app.get('/api/tccb/qua-trinh/sang-kien/page/:pageNumber/:pageSize', app.permission.check('qtSangKien:read'), (req, res) => {
        const pageNumber = parseInt(req.params.pageNumber),
            pageSize = parseInt(req.params.pageSize),
            searchTerm = typeof req.query.condition === 'string' ? req.query.condition : '';
        const { listShcc, listDv } = (req.query.filter && req.query.filter != '%%%%%%%%%%') ? req.query.filter : { listShcc: null, listDv: null };
        app.model.qtSangKien.searchPage(pageNumber, pageSize, listShcc, listDv, searchTerm, (error, page) => {
            if (error || page == null) {
                res.send({ error });
            } else {
                const { totalitem: totalItem, pagesize: pageSize, pagetotal: pageTotal, pagenumber: pageNumber, rows: list } = page;
                const pageCondition = searchTerm;
                res.send({ error, page: { totalItem, pageSize, pageTotal, pageNumber, pageCondition, list } });
            }
        });
    });

    app.get('/api/tccb/qua-trinh/sang-kien/group/page/:pageNumber/:pageSize', app.permission.check('qtSangKien:read'), (req, res) => {
        const pageNumber = parseInt(req.params.pageNumber),
            pageSize = parseInt(req.params.pageSize),
            searchTerm = typeof req.query.condition === 'string' ? req.query.condition : '';
        const { listShcc, listDv } = (req.query.filter && req.query.filter != '%%%%%%%%%%') ? req.query.filter : { listShcc: null, listDv: null };
        app.model.qtSangKien.groupPage(pageNumber, pageSize, listShcc, listDv, searchTerm, (error, page) => {
            if (error || page == null) {
                res.send({ error });
            } else {
                const { totalitem: totalItem, pagesize: pageSize, pagetotal: pageTotal, pagenumber: pageNumber, rows: list } = page;
                const pageCondition = searchTerm;
                res.send({ error, page: { totalItem, pageSize, pageTotal, pageNumber, pageCondition, list } });
            }
        });
    });
    
    app.post('/api/qua-trinh/sang-kien', app.permission.check('qtSangKien:write'), (req, res) => 
        app.model.qtSangKien.create(req.body.data, (error, item) => res.send({ error, item })));

    app.put('/api/qua-trinh/sang-kien', app.permission.check('qtSangKien:write'), (req, res) =>
        app.model.qtSangKien.update({ id: req.body.id }, req.body.changes, (error, item) => res.send({ error, item })));

    app.delete('/api/qua-trinh/sang-kien', app.permission.check('qtSangKien:write'), (req, res) =>
        app.model.qtSangKien.delete({ id: req.body.id }, (error) => res.send(error)));

};