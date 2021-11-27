module.exports = app => {
    const menu = {
        parentMenu: app.parentMenu.tccb,
        menus: {
            3002: { title: 'Hợp đồng Đơn vị trả lương - trách nhiệm', link: '/user/tccb/qua-trinh/hop-dong-dvtl-tn', icon: 'fa-pencil', backgroundColor: '#e07b91', groupIndex: 1 },
        },
    };
    app.permission.add(
        { name: 'staff:login', menu: { parentMenu: { index: 1000, title: 'Thông tin cá nhân', icon: 'fa-user', link: '/user' } }, },
        { name: 'qtHopDongDvtlTn:read', menu },
        { name: 'qtHopDongDvtlTn:write' },
        { name: 'qtHopDongDvtlTn:delete' },
    );
    app.get('/user/tccb/qua-trinh/hop-dong-dvtl-tn/:ma', app.permission.check('qtHopDongDvtlTn:read'), app.templates.admin);
    app.get('/user/tccb/qua-trinh/hop-dong-dvtl-tn', app.permission.check('qtHopDongDvtlTn:read'), app.templates.admin);

    // APIs -----------------------------------------------------------------------------------------------------------------------------------------
    app.get('/api/tccb/qua-trinh/hop-dong-dvtl-tn/page/:pageNumber/:pageSize', app.permission.check('qtHopDongDvtlTn:read'), (req, res) => {
        const pageNumber = parseInt(req.params.pageNumber),
            pageSize = parseInt(req.params.pageSize),
            searchTerm = typeof req.query.condition === 'string' ? req.query.condition : '';
        app.model.qtHopDongDvtlTn.searchPage(pageNumber, pageSize, searchTerm, (error, page) => {
            if (error || page == null) {
                res.send({ error });
            } else {
                const { totalitem: totalItem, pagesize: pageSize, pagetotal: pageTotal, pagenumber: pageNumber, rows: list } = page;
                res.send({ error, page: { totalItem, pageSize, pageTotal, pageNumber, list } });
            }
        });
    });

    app.get('/api/tccb/qua-trinh/hop-dong-dvtl-tn/group/page/:pageNumber/:pageSize', app.permission.check('qtHopDongDvtlTn:read'), (req, res) => {
        const pageNumber = parseInt(req.params.pageNumber),
            pageSize = parseInt(req.params.pageSize),
            searchTerm = typeof req.query.condition === 'string' ? req.query.condition : '';
        app.model.qtHopDongDvtlTn.searchPageGroup(pageNumber, pageSize, searchTerm, (error, page) => {
            if (error || page == null) {
                res.send({ error });
            } else {
                const { totalitem: totalItem, pagesize: pageSize, pagetotal: pageTotal, pagenumber: pageNumber, rows: list } = page;
                res.send({ error, page: { totalItem, pageSize, pageTotal, pageNumber, list } });
            }
        });
    });

    app.get('/api/tccb/qua-trinh/hop-dong-dvtl-tn/all', app.permission.check('qtHopDongDvtlTn:read'), (req, res) => {
        let condition = { statement: null };
        if (req.query.shcc) {
            condition = {
                statement: 'shcc = :searchText',
                parameter: { searchText: req.query.shcc },
            };
        }
        app.model.qtHopDongDvtlTn.getAll(condition, (error, items) => res.send({ error, items }));
    });

    app.get('/api/tccb/qua-trinh/hop-dong-dvtl-tn/item/:ma', app.permission.check('qtHopDongDvtlTn:read'), (req, res) => {
        app.model.qtHopDongDvtlTn.get({ ma: req.params.ma }, (error, item) => res.send({ error, item }));
    });

    app.post('/api/tccb/qua-trinh/hop-dong-dvtl-tn', app.permission.check('staff:write'), (req, res) =>
        app.model.qtHopDongDvtlTn.create(req.body.data, (error, item) => res.send({ error, item })));

    app.put('/api/tccb/qua-trinh/hop-dong-dvtl-tn', app.permission.check('staff:write'), (req, res) =>
        app.model.qtHopDongDvtlTn.update({ ma: req.body.ma }, req.body.changes, (error, item) => res.send({ error, item })));

    app.delete('/api/tccb/qua-trinh/hop-dong-dvtl-tn', app.permission.check('staff:write'), (req, res) =>
        app.model.qtHopDongDvtlTn.delete({ ma: req.body.ma }, (error) => res.send(error)));

    app.post('/api/user/qua-trinh/hop-dong-dvtl-tn', app.permission.check('staff:login'), (req, res) => {
        if (req.body.data && req.session.user) {
            const data = app.clone(req.body.data, { shcc: req.session.user.shcc });
            app.model.qtHopDongDvtlTn.create(data, (error, item) => res.send({ error, item }));
        } else {
            res.status(400).send({ error: 'Invalid parameter!' });
        }
    });

    app.put('/api/user/qua-trinh/hop-dong-dvtl-tn', app.permission.check('staff:login'), (req, res) => {
        if (req.body.changes && req.session.user) {
            app.model.qtHopDongDvtlTn.get({ ma: req.body.ma }, (error, item) => {
                if (error || item == null) {
                    res.status(400).send({ error: 'Not found!' });
                } else {
                    if (item.shcc === req.session.user.shcc) {
                        const changes = app.clone(req.body.changes, { shcc: req.session.user.shcc });
                        app.model.qtHopDongDvtlTn.update({ ma: req.body.ma }, changes, (error, item) => res.send({ error, item }));
                    } else {
                        res.status(400).send({ error: 'Not found!' });
                    }
                }
            });
        } else {
            res.status(400).send({ error: 'Invalid parameter!' });
        }
    });

    app.delete('/api/user/qua-trinh/hop-dong-dvtl-tn', app.permission.check('staff:login'), (req, res) => {
        if (req.session.user) {
            app.model.qtHopDongDvtlTn.get({ ma: req.body.ma }, (error, item) => {
                if (error || item == null) {
                    res.status(400).send({ error: 'Not found!' });
                } else {
                    if (item.shcc === req.session.user.shcc) {
                        app.model.qtHopDongDvtlTn.delete({ ma: req.body.ma }, (error) => res.send(error));
                    } else {
                        res.status(400).send({ error: 'Not found!' });
                    }
                }
            });
        } else {
            res.status(400).send({ error: 'Invalid parameter!' });
        }
    });

    app.get('/api/user/qua-trinh/hop-dong-dvtl-tn/item/:ma', app.permission.check('staff:login'), (req, res) => {
        app.model.qtHopDongDvtlTn.get({ ma: req.params.ma }, (error, item) => {
            if (error || item == null) {
                res.send({ error });
            } else {
                if (req.session.user.shcc.trim() === item.shcc) {
                    res.send({ item });
                } else {
                    res.status(403).send({ error: 'Lấy thông tin bị lỗi' });
                }
            }
        });
    });
    app.get('/api/tccb/qua-trinh/hop-dong-dvtl-tn/edit/item/:ma', app.permission.check('staff:login') && app.permission.check('qtHopDongDvtlTn:read'), (req, res) => {
        app.model.qtHopDongDvtlTn.get({ ma: req.params.ma }, (error, qtHopDongDvtlTn) => {
            if (error || qtHopDongDvtlTn == null) {
                res.send({ error });
            } else {
                app.model.tchcCanBoHopDongDvtlTn.get({ shcc: qtHopDongDvtlTn.nguoiDuocThue }, (error, canBoDuocThue) => {
                    if (error || canBoDuocThue == null) {
                        res.send({ error });
                    } else {
                        app.model.canBo.get({ shcc: qtHopDongDvtlTn.nguoiKy }, (error, canBo) => {
                            if (error || canBo == null) {
                                res.send({ item: app.clone({ qtHopDongDvtlTn: qtHopDongDvtlTn }, { canBoDuocThue: canBoDuocThue }, { canBo: null }) });
                            } else {
                                res.send({ item: app.clone({ qtHopDongDvtlTn: qtHopDongDvtlTn }, { canBoDuocThue: canBoDuocThue }, { canBo: canBo }) });
                            }
                        });
                    }
                });
            }
        });
    });
};