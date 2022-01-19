module.exports = app => {
    const menu = {
        parentMenu: app.parentMenu.tccb,
        menus: {
            3033: { title: 'Quá trình học tập, công tác', link: '/user/tccb/qua-trinh/hoc-tap-cong-tac', icon: 'fa-gift', backgroundColor: '#2559ba', groupIndex: 1},
        },
    };
    app.permission.add(
        { name: 'staff:login', menu: { parentMenu: { index: 1000, title: 'Thông tin cá nhân', icon: 'fa-user', link: '/user' } }, },
        { name: 'qtHocTapCongTac:read', menu },
        { name: 'qtHocTapCongTac:write' },
        { name: 'qtHocTapCongTac:delete' },
    );
    app.get('/user/tccb/qua-trinh/hoc-tap-cong-tac/:id', app.permission.check('qtHocTapCongTac:read'), app.templates.admin);
    app.get('/user/tccb/qua-trinh/hoc-tap-cong-tac', app.permission.check('qtHocTapCongTac:read'), app.templates.admin);
    app.get('/user/tccb/qua-trinh/hoc-tap-cong-tac/:ma', app.permission.check('qtHocTapCongTac:read'), app.templates.admin);

    // APIs -----------------------------------------------------------------------------------------------------------------------------------------
    app.get('/api/tccb/qua-trinh/hoc-tap-cong-tac/page/:pageNumber/:pageSize', app.permission.check('qtHocTapCongTac:read'), (req, res) => {
        const pageNumber = parseInt(req.params.pageNumber),
            pageSize = parseInt(req.params.pageSize),
            searchTerm = typeof req.query.condition === 'string' ? req.query.condition : '';
        const { fromYear, toYear, list_shcc, list_dv } = (req.query.filter && req.query.filter != '%%%%%%%%') ? req.query.filter : { fromYear: null, toYear: null, loaiDoiTuong: '-1' };
        app.model.qtHocTapCongTac.searchPage(pageNumber, pageSize, list_shcc, list_dv, fromYear, toYear, searchTerm, (error, page) => {
            if (error || page == null) {
                res.send({ error });
            } else {
                const { totalitem: totalItem, pagesize: pageSize, pagetotal: pageTotal, pagenumber: pageNumber, rows: list } = page;
                const pageCondition = searchTerm;
                res.send({ error, page: { totalItem, pageSize, pageTotal, pageNumber, pageCondition, list } });
            }
        });
    });

    app.get('/api/tccb/qua-trinh/hoc-tap-cong-tac/group/page/:pageNumber/:pageSize', app.permission.check('qtHocTapCongTac:read'), (req, res) => {
        const pageNumber = parseInt(req.params.pageNumber),
            pageSize = parseInt(req.params.pageSize),
            searchTerm = typeof req.query.condition === 'string' ? req.query.condition : '';
        const { fromYear, toYear, list_shcc, list_dv } = (req.query.filter && req.query.filter != '%%%%%%%%') ? req.query.filter : { fromYear: null, toYear: null, loaiDoiTuong: '-1' };
        app.model.qtHocTapCongTac.groupPage(pageNumber, pageSize, list_shcc, list_dv, fromYear, toYear, searchTerm, (error, page) => {
            if (error || page == null) {
                res.send({ error });
            } else {
                const { totalitem: totalItem, pagesize: pageSize, pagetotal: pageTotal, pagenumber: pageNumber, rows: list } = page;
                const pageCondition = searchTerm;
                res.send({ error, page: { totalItem, pageSize, pageTotal, pageNumber, pageCondition, list } });
            }
        });
    });
    app.post('/api/qua-trinh/htct', app.permission.check('staff:write'), (req, res) =>
        app.model.qtHocTapCongTac.create(req.body.data, (error, item) => res.send({ error, item })));

    app.put('/api/qua-trinh/htct', app.permission.check('staff:write'), (req, res) =>
        app.model.qtHocTapCongTac.update({ id: req.body.id }, req.body.changes, (error, item) => res.send({ error, item })));

    app.delete('/api/qua-trinh/htct', app.permission.check('staff:write'), (req, res) =>
        app.model.qtHocTapCongTac.delete({ id: req.body.id }, (error) => res.send(error)));

    app.post('/api/user/qua-trinh/htct', app.permission.check('staff:login'), (req, res) => {
        if (req.body.data && req.session.user) {
            const data = req.body.data;
            app.model.qtHocTapCongTac.create(data, (error, item) => res.send({ error, item }));
        } else {
            res.send({ error: 'Invalid parameter!' });
        }
    });

    app.put('/api/user/qua-trinh/htct', app.permission.check('staff:login'), (req, res) => {
        if (req.body.changes && req.session.user) {
            app.model.qtHocTapCongTac.get({ id: req.body.id }, (error, item) => {
                if (error || item == null) {
                    res.send({ error: 'Not found!' });
                } else {
                    app.model.canBo.get({ shcc: item.shcc }, (e, r) => {
                        if (e || r == null) res.send({ error: 'Not found!' }); else {
                            const changes = req.body.changes;
                            app.model.qtHocTapCongTac.update({ id: req.body.id }, changes, (error, item) => res.send({ error, item }));
                        }
                    });
                }
            });
        } else {
            res.send({ error: 'Invalid parameter!' });
        }
    });

    app.delete('/api/user/qua-trinh/htct', app.permission.check('staff:login'), (req, res) => {
        if (req.session.user) {
            app.model.qtHocTapCongTac.get({ id: req.body.id }, (error, item) => {
                if (error || item == null) {
                    res.send({ error: 'Not found!' });
                } else {
                    app.model.canBo.get({ shcc: item.shcc }, (e, r) => {
                        if (e || r == null) res.send({ error: 'Not found!' }); else {
                            app.model.qtHocTapCongTac.delete({ id: req.body.id }, (error, item) => res.send({ error, item }));
                        }
                    });
                }
            });
        } else {
            res.send({ error: 'Invalid parameter!' });
        }
    });
};