module.exports = app => {
    const menu = {
        parentMenu: app.parentMenu.tccb,
        menus: {
            3027: { title: 'Danh sách giải thưởng', link: '/user/tccb/qua-trinh/giai-thuong', icon: 'fa-trophy', backgroundColor: '#fc7b5d', groupIndex: 5 },
        },
    };
    app.permission.add(
        { name: 'qtGiaiThuong:read', menu },
        { name: 'qtGiaiThuong:write' },
        { name: 'qtGiaiThuong:delete' },
    );
    app.get('/user/tccb/qua-trinh/giai-thuong/:id', app.permission.check('qtGiaiThuong:read'), app.templates.admin);
    app.get('/user/tccb/qua-trinh/giai-thuong', app.permission.check('qtGiaiThuong:read'), app.templates.admin);
    app.get('/user/tccb/qua-trinh/giai-thuong/group/:shcc', app.permission.check('qtGiaiThuong:read'), app.templates.admin);

    // APIs -----------------------------------------------------------------------------------------------------------------------------------------
    app.get('/api/tccb/qua-trinh/giai-thuong/page/:pageNumber/:pageSize', app.permission.check('qtGiaiThuong:read'), (req, res) => {
        const pageNumber = parseInt(req.params.pageNumber),
            pageSize = parseInt(req.params.pageSize),
            searchTerm = typeof req.query.condition === 'string' ? req.query.condition : '';
        const { fromYear, toYear, list_shcc, list_dv } = (req.query.filter && req.query.filter != '%%%%%%%%') ? req.query.filter : { fromYear: null, toYear: null, list_shcc: null, list_dv: null };
        app.model.qtGiaiThuong.searchPage(pageNumber, pageSize, list_shcc, list_dv, fromYear, toYear, searchTerm, (error, page) => {
            if (error || page == null) {
                res.send({ error });
            } else {
                const { totalitem: totalItem, pagesize: pageSize, pagetotal: pageTotal, pagenumber: pageNumber, rows: list } = page;
                const pageCondition = searchTerm;
                res.send({ error, page: { totalItem, pageSize, pageTotal, pageNumber, pageCondition, list } });
            }
        });
    });

    app.get('/api/tccb/qua-trinh/giai-thuong/group/page/:pageNumber/:pageSize', app.permission.check('qtGiaiThuong:read'), (req, res) => {
        const pageNumber = parseInt(req.params.pageNumber),
            pageSize = parseInt(req.params.pageSize),
            searchTerm = typeof req.query.condition === 'string' ? req.query.condition : '';
        const { fromYear, toYear, list_shcc, list_dv } = (req.query.filter && req.query.filter != '%%%%%%%%') ? req.query.filter : { fromYear: null, toYear: null, list_shcc: null, list_dv: null };
        app.model.qtGiaiThuong.groupPage(pageNumber, pageSize, list_shcc, list_dv, fromYear, toYear, searchTerm, (error, page) => {
            if (error || page == null) {
                res.send({ error });
            } else {
                const { totalitem: totalItem, pagesize: pageSize, pagetotal: pageTotal, pagenumber: pageNumber, rows: list } = page;
                const pageCondition = searchTerm;
                res.send({ error, page: { totalItem, pageSize, pageTotal, pageNumber, pageCondition, list } });
            }
        });
    });
    app.post('/api/qua-trinh/giai-thuong', app.permission.check('staff:write'), (req, res) =>
        app.model.qtGiaiThuong.create(req.body.data, (error, item) => res.send({ error, item })));

    app.put('/api/qua-trinh/giai-thuong', app.permission.check('staff:write'), (req, res) =>
        app.model.qtGiaiThuong.update({ id: req.body.id }, req.body.changes, (error, item) => res.send({ error, item })));

    app.delete('/api/qua-trinh/giai-thuong', app.permission.check('staff:write'), (req, res) =>
        app.model.qtGiaiThuong.delete({ id: req.body.id }, (error) => res.send(error)));

    app.post('/api/user/qua-trinh/giai-thuong', app.permission.check('staff:login'), (req, res) => {
        if (req.body.data && req.session.user) {
            const data = req.body.data;
            app.model.qtGiaiThuong.create(data, (error, item) => res.send({ error, item }));
        } else {
            res.send({ error: 'Invalid parameter!' });
        }
    });

    app.put('/api/user/qua-trinh/giai-thuong', app.permission.check('staff:login'), (req, res) => {
        if (req.body.changes && req.session.user) {
            app.model.qtGiaiThuong.get({ id: req.body.id }, (error, item) => {
                if (error || item == null) {
                    res.send({ error: 'Not found!' });
                } else {
                    app.model.canBo.get({ shcc: item.shcc }, (e, r) => {
                        if (e || r == null) res.send({ error: 'Not found!' }); else {
                            const changes = req.body.changes;
                            app.model.qtGiaiThuong.update({ id: req.body.id }, changes, (error, item) => res.send({ error, item }));
                        }
                    });
                }
            });
        } else {
            res.send({ error: 'Invalid parameter!' });
        }
    });

    app.delete('/api/user/qua-trinh/giai-thuong', app.permission.check('staff:login'), (req, res) => {
        if (req.session.user) {
            app.model.qtGiaiThuong.get({ id: req.body.id }, (error, item) => {
                if (error || item == null) {
                    res.send({ error: 'Not found!' });
                } else {
                    app.model.canBo.get({ shcc: item.shcc }, (e, r) => {
                        if (e || r == null) res.send({ error: 'Not found!' }); else {
                            app.model.qtGiaiThuong.delete({ id: req.body.id }, (error, item) => res.send({ error, item }));
                        }
                    });
                }
            });
        } else {
            res.send({ error: 'Invalid parameter!' });
        }
    });
};