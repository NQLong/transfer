module.exports = app => {
    // const menu = {
    //     parentMenu: app.parentMenu.tccb,
    //     menus: {
    //         3019: { title: 'Quá trình đi nước ngoài', link: '/user/tccb/qua-trinh/nuoc-ngoai', icon: 'fa-fighter-jet', color: '#000000', backgroundColor: '#4297ff', groupIndex: 1 },
    //     },
    // };
    // const menuStaff = {
    //     parentMenu: app.parentMenu.user,
    //     menus: {
    //         1008: { title: 'Đi nước ngoài', link: '/user/nuoc-ngoai', icon: 'fa-fighter-jet', backgroundColor: '#4297ff', groupIndex: 1 },
    //     },
    // };

    // app.permission.add(
    //     { name: 'staff:login', menu: menuStaff },
    //     { name: 'qtNuocNgoai:read', menu },
    //     { name: 'qtNuocNgoai:write' },
    //     { name: 'qtNuocNgoai:delete' },
    // );
    // app.get('/user/tccb/qua-trinh/nuoc-ngoai', app.permission.check('qtNuocNgoai:read'), app.templates.admin);
    // app.get('/user/tccb/qua-trinh/nuoc-ngoai/group/:shcc', app.permission.check('qtNuocNgoai:read'), app.templates.admin);
    // app.get('/user/nuoc-ngoai', app.permission.check('staff:login'), app.templates.admin);


    // APIs -----------------------------------------------------------------------------------------------------------------------------------------
    // //User Actions:
    app.post('/api/user/qua-trinh/nuoc-ngoai', app.permission.check('staff:login'), (req, res) => {
        if (req.body.data && req.session.user) {
            const data = req.body.data;
            app.model.qtNuocNgoai.create(data, (error, item) => res.send({ error, item }));
        } else {
            res.send({ error: 'Invalid parameter!' });
        }
    });

    app.put('/api/user/qua-trinh/nuoc-ngoai', app.permission.check('staff:login'), (req, res) => {
        if (req.body.changes && req.session.user) {
            app.model.qtNuocNgoai.get({ id: req.body.id }, (error, item) => {
                if (error || item == null) {
                    res.send({ error: 'Not found!' });
                } else {
                    app.model.canBo.get({ shcc: item.shcc }, (e, r) => {
                        if (e || r == null) res.send({ error: 'Staff not found!' }); else {
                            const changes = req.body.changes;
                            app.model.qtNuocNgoai.update({ id: req.body.id }, changes, (error, item) => res.send({ error, item }));
                        }
                    });
                }
            });
        } else {
            res.send({ error: 'Invalid parameter!' });
        }
    });

    app.delete('/api/user/qua-trinh/nuoc-ngoai', app.permission.check('staff:login'), (req, res) => {
        if (req.session.user) {
            app.model.qtNuocNgoai.get({ id: req.body.id }, (error, item) => {
                if (error || item == null) {
                    res.send({ error: 'Not found!' });
                } else {
                    app.model.canBo.get({ shcc: item.shcc }, (e, r) => {
                        if (e || r == null) res.send({ error: 'Staff not found!' }); else {
                            app.model.qtNuocNgoai.delete({ id: req.body.id }, (error, item) => res.send({ error, item }));
                        }
                    });
                }
            });
        } else {
            res.send({ error: 'Invalid parameter!' });
        }
    });

    app.get('/api/user/qua-trinh/nuoc-ngoai/page/:pageNumber/:pageSize', app.permission.check('staff:login'), (req, res) => {
        const pageNumber = parseInt(req.params.pageNumber),
            pageSize = parseInt(req.params.pageSize),
            searchTerm = typeof req.query.condition === 'string' ? req.query.condition : '';
        const { fromYear, toYear, list_shcc, list_dv, timeType } = (req.query.filter && req.query.filter != '%%%%%%%%') ? req.query.filter : { fromYear: null, toYear: null, list_shcc: null, list_dv: null, timeType: 0 };
        app.model.qtNuocNgoai.searchPage(pageNumber, pageSize, list_shcc, list_dv, fromYear, toYear, timeType, searchTerm, (error, page) => {
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

    app.get('/api/tccb/qua-trinh/nuoc-ngoai/page/:pageNumber/:pageSize', app.permission.check('qtNuocNgoai:read'), (req, res) => {
        const pageNumber = parseInt(req.params.pageNumber),
            pageSize = parseInt(req.params.pageSize),
            searchTerm = typeof req.query.condition === 'string' ? req.query.condition : '';
        const { fromYear, toYear, list_shcc, list_dv, timeType } = (req.query.filter && req.query.filter != '%%%%%%%%') ? req.query.filter : { fromYear: null, toYear: null, list_shcc: null, list_dv: null, timeType: 0 };
        app.model.qtNuocNgoai.searchPage(pageNumber, pageSize, list_shcc, list_dv, fromYear, toYear, timeType, searchTerm, (error, page) => {
            if (error || page == null) {
                res.send({ error });
            } else {
                const { totalitem: totalItem, pagesize: pageSize, pagetotal: pageTotal, pagenumber: pageNumber, rows: list } = page;
                const pageCondition = searchTerm;
                res.send({ error, page: { totalItem, pageSize, pageTotal, pageNumber, pageCondition, list } });
            }
        });
    });

    app.get('/api/tccb/qua-trinh/nuoc-ngoai/group/page/:pageNumber/:pageSize', app.permission.check('qtNuocNgoai:read'), (req, res) => {
        const pageNumber = parseInt(req.params.pageNumber),
            pageSize = parseInt(req.params.pageSize),
            searchTerm = typeof req.query.condition === 'string' ? req.query.condition : '';
        const { fromYear, toYear, list_shcc, list_dv, timeType } = (req.query.filter && req.query.filter != '%%%%%%%%') ? req.query.filter : { fromYear: null, toYear: null, list_shcc: null, list_dv: null, timeType: 0 };
        app.model.qtNuocNgoai.groupPage(pageNumber, pageSize, list_shcc, list_dv, fromYear, toYear, timeType, searchTerm, (error, page) => {
            if (error || page == null) {
                res.send({ error });
            } else {
                const { totalitem: totalItem, pagesize: pageSize, pagetotal: pageTotal, pagenumber: pageNumber, rows: list } = page;
                const pageCondition = searchTerm;
                res.send({ error, page: { totalItem, pageSize, pageTotal, pageNumber, pageCondition, list } });
            }
        });
    });
    app.post('/api/qua-trinh/nuoc-ngoai', app.permission.check('staff:write'), (req, res) =>
        app.model.qtNuocNgoai.create(req.body.data, (error, item) => res.send({ error, item })));

    app.put('/api/qua-trinh/nuoc-ngoai', app.permission.check('staff:write'), (req, res) =>
        app.model.qtNuocNgoai.update({ id: req.body.id }, req.body.changes, (error, item) => res.send({ error, item })));

    app.delete('/api/qua-trinh/nuoc-ngoai', app.permission.check('staff:write'), (req, res) =>
        app.model.qtNuocNgoai.delete({ id: req.body.id }, (error) => res.send(error)));

    app.post('/api/user/qua-trinh/nuoc-ngoai', app.permission.check('staff:login'), (req, res) => {
        if (req.body.data && req.session.user) {
            const data = req.body.data;
            app.model.qtNuocNgoai.create(data, (error, item) => res.send({ error, item }));
        } else {
            res.send({ error: 'Invalid parameter!' });
        }
    });

    app.put('/api/user/qua-trinh/nuoc-ngoai', app.permission.check('staff:login'), (req, res) => {
        if (req.body.changes && req.session.user) {
            app.model.qtNuocNgoai.get({ id: req.body.id }, (error, item) => {
                if (error || item == null) {
                    res.send({ error: 'Not found!' });
                } else {
                    app.model.canBo.get({ shcc: item.shcc }, (e, r) => {
                        if (e || r == null) res.send({ error: 'Not found!' }); else {
                            const changes = req.body.changes;
                            app.model.qtNuocNgoai.update({ id: req.body.id }, changes, (error, item) => res.send({ error, item }));
                        }
                    });
                }
            });
        } else {
            res.send({ error: 'Invalid parameter!' });
        }
    });

    app.delete('/api/user/qua-trinh/nuoc-ngoai', app.permission.check('staff:login'), (req, res) => {
        if (req.session.user) {
            app.model.qtNuocNgoai.get({ id: req.body.id }, (error, item) => {
                if (error || item == null) {
                    res.send({ error: 'Not found!' });
                } else {
                    app.model.canBo.get({ shcc: item.shcc }, (e, r) => {
                        if (e || r == null) res.send({ error: 'Not found!' }); else {
                            app.model.qtNuocNgoai.delete({ id: req.body.id }, (error, item) => res.send({ error, item }));
                        }
                    });
                }
            });
        } else {
            res.send({ error: 'Invalid parameter!' });
        }
    });
};