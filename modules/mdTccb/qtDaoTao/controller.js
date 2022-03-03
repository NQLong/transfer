module.exports = app => {
    const menu = {
        parentMenu: app.parentMenu.tccb,
        menus: {
            3016: { title: 'Quá trình đào tạo, bồi dưỡng', link: '/user/tccb/qua-trinh/dao-tao', icon: 'fa-podcast', backgroundColor: '#635118', groupIndex: 5 },
        },
    };

    const menuStaff = {
        parentMenu: app.parentMenu.user,
        menus: {
            1015: { title: 'Đào tạo, bồi dưỡng', subTitle: 'Bằng cấp, chứng nhận, chứng chỉ', link: '/user/dao-tao', icon: 'fa-podcast', color: '#000000', backgroundColor: '#7ae6e6', groupIndex: 0 },
        },
    };

    app.permission.add(
        { name: 'staff:login', menu: menuStaff },
        { name: 'qtDaoTao:read', menu },
        { name: 'qtDaoTao:write' },
        { name: 'qtDaoTao:delete' },
    );
    app.get('/user/tccb/qua-trinh/dao-tao/:stt', app.permission.check('qtDaoTao:read'), app.templates.admin);
    app.get('/user/tccb/qua-trinh/dao-tao', app.permission.check('qtDaoTao:read'), app.templates.admin);
    app.get('/user/tccb/qua-trinh/dao-tao/:ma', app.permission.check('qtHocTapCongTac:read'), app.templates.admin);
    app.get('/user/dao-tao', app.permission.check('staff:login'), app.templates.admin);
    // APIs -----------------------------------------------------------------------------------------------------------------------------------------
    const checkGetStaffPermission = (req, res, next) => app.isDebug ? next() : app.permission.check('staff:login')(req, res, next);

    app.get('/api/qua-trinh/dao-tao/page/:pageNumber/:pageSize', checkGetStaffPermission, (req, res) => {
        const pageNumber = parseInt(req.params.pageNumber),
            pageSize = parseInt(req.params.pageSize),
            searchTerm = typeof req.query.condition === 'string' ? req.query.condition : '';
        const { fromYear, toYear, list_shcc, list_dv, list_loaiBang } = (req.query.filter && req.query.filter != '%%%%%%%%%%') ? req.query.filter : { fromYear: null, toYear: null, loaiDoiTuong: '-1' };
        app.model.qtDaoTao.searchPage(pageNumber, pageSize, list_shcc, list_dv, fromYear, toYear, list_loaiBang, searchTerm, (error, page) => {
            if (error || page == null) {
                res.send({ error });
            } else {
                const { totalitem: totalItem, pagesize: pageSize, pagetotal: pageTotal, pagenumber: pageNumber, rows: list } = page;
                const pageCondition = searchTerm;
                res.send({ error, page: { totalItem, pageSize, pageTotal, pageNumber, pageCondition, list } });
            }
        });
    });

    app.get('/api/tccb/qua-trinh/dao-tao/group/page/:pageNumber/:pageSize', app.permission.check('qtDaoTao:read'), (req, res) => {
        const pageNumber = parseInt(req.params.pageNumber),
            pageSize = parseInt(req.params.pageSize),
            searchTerm = typeof req.query.condition === 'string' ? req.query.condition : '';
        const { fromYear, toYear, list_shcc, list_dv } = (req.query.filter && req.query.filter != '%%%%%%%%') ? req.query.filter : { fromYear: null, toYear: null, loaiDoiTuong: '-1' };
        app.model.qtDaoTao.groupPage(pageNumber, pageSize, list_shcc, list_dv, fromYear, toYear, searchTerm, (error, page) => {
            if (error || page == null) {
                res.send({ error });
            } else {
                const { totalitem: totalItem, pagesize: pageSize, pagetotal: pageTotal, pagenumber: pageNumber, rows: list } = page;
                const pageCondition = searchTerm;
                res.send({ error, page: { totalItem, pageSize, pageTotal, pageNumber, pageCondition, list } });
            }
        });
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