module.exports = app => {
    const menu = {
        parentMenu: app.parentMenu.tccb,
        menus: {
            3040: { title: 'Quá trình làm việc ngoài', link: '/user/tccb/qua-trinh/lam-viec-ngoai', icon: 'fa fa-fax', color: '#000000', backgroundColor: '#f4fc03', groupIndex: 1 },
        },
    };
    const menuStaff = {
        parentMenu: app.parentMenu.user,
        menus: {
            1025: { title: 'Làm việc ngoài', link: '/user/lam-viec-ngoai', icon: 'fa fa-fax', backgroundColor: '#f4fc03', groupIndex: 1 },
        },
    };

    app.permission.add(
        { name: 'staff:login', menu: menuStaff },
        { name: 'qtLamViecNgoai:read', menu },
        { name: 'qtLamViecNgoai:write' },
        { name: 'qtLamViecNgoai:delete' },
    );
    app.get('/user/tccb/qua-trinh/lam-viec-ngoai', app.permission.check('qtLamViecNgoai:read'), app.templates.admin);
    app.get('/user/tccb/qua-trinh/lam-viec-ngoai/group/:shcc', app.permission.check('qtLamViecNgoai:read'), app.templates.admin);
    app.get('/user/lam-viec-ngoai', app.permission.check('staff:login'), app.templates.admin);

    // APIs -----------------------------------------------------------------------------------------------------------------------------------------
    // //User Actions:
    app.post('/api/user/qua-trinh/lam-viec-ngoai', app.permission.check('staff:login'), (req, res) => {
        if (req.body.data && req.session.user) {
            const data = req.body.data;
            app.model.qtLamViecNgoai.create(data, (error, item) => res.send({ error, item }));
        } else {
            res.send({ error: 'Invalid parameter!' });
        }
    });

    app.put('/api/user/qua-trinh/lam-viec-ngoai', app.permission.check('staff:login'), (req, res) => {
        if (req.body.changes && req.session.user) {
            app.model.qtLamViecNgoai.get({ id: req.body.id }, (error, item) => {
                if (error || item == null) {
                    res.send({ error: 'Not found!' });
                } else {
                    app.model.canBo.get({ shcc: item.shcc }, (e, r) => {
                        if (e || r == null) res.send({ error: 'Staff not found!' }); else {
                            const changes = req.body.changes;
                            app.model.qtLamViecNgoai.update({ id: req.body.id }, changes, (error, item) => res.send({ error, item }));
                        }
                    });
                }
            });
        } else {
            res.send({ error: 'Invalid parameter!' });
        }
    });

    app.delete('/api/user/qua-trinh/lam-viec-ngoai', app.permission.check('staff:login'), (req, res) => {
        if (req.session.user) {
            app.model.qtLamViecNgoai.get({ id: req.body.id }, (error, item) => {
                if (error || item == null) {
                    res.send({ error: 'Not found!' });
                } else {
                    app.model.canBo.get({ shcc: item.shcc }, (e, r) => {
                        if (e || r == null) res.send({ error: 'Staff not found!' }); else {
                            app.model.qtLamViecNgoai.delete({ id: req.body.id }, (error, item) => res.send({ error, item }));
                        }
                    });
                }
            });
        } else {
            res.send({ error: 'Invalid parameter!' });
        }
    });

    app.get('/api/user/qua-trinh/lam-viec-ngoai/page/:pageNumber/:pageSize', app.permission.check('staff:login'), (req, res) => {
        const pageNumber = parseInt(req.params.pageNumber),
            pageSize = parseInt(req.params.pageSize),
            searchTerm = typeof req.query.condition === 'string' ? req.query.condition : '';
        const { fromYear, toYear, list_shcc, list_dv, tinhTrang } = (req.query.filter && req.query.filter != '%%%%%%%%') ? req.query.filter : { fromYear: null, toYear: null, list_shcc: null, list_dv: null, tinhTrang: null };
        app.model.qtLamViecNgoai.searchPage(pageNumber, pageSize, list_shcc, list_dv, fromYear, toYear, tinhTrang, searchTerm, (error, page) => {
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
    
    app.get('/api/tccb/qua-trinh/lam-viec-ngoai/page/:pageNumber/:pageSize', app.permission.check('qtLamViecNgoai:read'), (req, res) => {
        const pageNumber = parseInt(req.params.pageNumber),
            pageSize = parseInt(req.params.pageSize),
            searchTerm = typeof req.query.condition === 'string' ? req.query.condition : '';
        const { fromYear, toYear, list_shcc, list_dv, tinhTrang } = (req.query.filter && req.query.filter != '%%%%%%%%%%') ? req.query.filter : { fromYear: null, toYear: null, list_shcc: null, list_dv: null, tinhTrang: null };
        app.model.qtLamViecNgoai.searchPage(pageNumber, pageSize, list_shcc, list_dv, fromYear, toYear, tinhTrang, searchTerm, (error, page) => {
            if (error || page == null) {
                res.send({ error });
            } else {
                const { totalitem: totalItem, pagesize: pageSize, pagetotal: pageTotal, pagenumber: pageNumber, rows: list } = page;
                const pageCondition = searchTerm;
                res.send({ error, page: { totalItem, pageSize, pageTotal, pageNumber, pageCondition, list } });
            }
        });
    });

    app.get('/api/tccb/qua-trinh/lam-viec-ngoai/group/page/:pageNumber/:pageSize', app.permission.check('qtLamViecNgoai:read'), (req, res) => {
        const pageNumber = parseInt(req.params.pageNumber),
            pageSize = parseInt(req.params.pageSize),
            searchTerm = typeof req.query.condition === 'string' ? req.query.condition : '';
        const { fromYear, toYear, list_shcc, list_dv, tinhTrang } = (req.query.filter && req.query.filter != '%%%%%%%%%%') ? req.query.filter : { fromYear: null, toYear: null, list_shcc: null, list_dv: null, tinhTrang: null };
        app.model.qtLamViecNgoai.groupPage(pageNumber, pageSize, list_shcc, list_dv, fromYear, toYear, tinhTrang, searchTerm, (error, page) => {
            if (error || page == null) {
                res.send({ error });
            } else {
                const { totalitem: totalItem, pagesize: pageSize, pagetotal: pageTotal, pagenumber: pageNumber, rows: list } = page;
                const pageCondition = searchTerm;
                res.send({ error, page: { totalItem, pageSize, pageTotal, pageNumber, pageCondition, list } });
            }
        });
    });
    
    app.post('/api/qua-trinh/lam-viec-ngoai', app.permission.check('staff:write'), (req, res) =>
        app.model.qtLamViecNgoai.create(req.body.data, (error, item) => res.send({ error, item })));

    app.put('/api/qua-trinh/lam-viec-ngoai', app.permission.check('staff:write'), (req, res) =>
        app.model.qtLamViecNgoai.update({ id: req.body.id }, req.body.changes, (error, item) => res.send({ error, item })));

    app.delete('/api/qua-trinh/lam-viec-ngoai', app.permission.check('staff:write'), (req, res) =>
        app.model.qtLamViecNgoai.delete({ id: req.body.id }, (error) => res.send(error)));

};