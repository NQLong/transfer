module.exports = app => {
    const menu = {
        parentMenu: app.parentMenu.tccb,
        menus: {
            // 3011: { title: 'Quá trình khen thưởng cá nhân', link: '/user/tccb/qua-trinh/khen-thuong-ca-nhan', icon: 'fa-pencil', backgroundColor: '#e07b91', groupIndex: 3 },
        },
    };
    app.permission.add(
        { name: 'staff:login', menu: { parentMenu: { index: 1000, title: 'Thông tin cá nhân', icon: 'fa-user', link: '/user' } }, },
        { name: 'qtKhenThuongCaNhan:read', menu },
        { name: 'qtKhenThuongCaNhan:write' },
        { name: 'qtKhenThuongCaNhan:delete' },
    );
    app.get('/user/tccb/qua-trinh/khen-thuong-ca-nhan/:id', app.permission.check('qtKhenThuongCaNhan:read'), app.templates.admin);
    app.get('/user/tccb/qua-trinh/khen-thuong-ca-nhan', app.permission.check('qtKhenThuongCaNhan:read'), app.templates.admin);

    // APIs -----------------------------------------------------------------------------------------------------------------------------------------
    app.get('/api/tccb/qua-trinh/khen-thuong-ca-nhan/page/:pageNumber/:pageSize', app.permission.check('qtKhenThuongCaNhan:read'), (req, res) => {
        const pageNumber = parseInt(req.params.pageNumber),
            pageSize = parseInt(req.params.pageSize),
            searchTerm = typeof req.query.condition === 'string' ? req.query.condition : '';
        app.model.qtKhenThuongCaNhan.searchPage(pageNumber, pageSize, searchTerm, (error, page) => {
            if (error || page == null) {
                res.send({ error });
            } else {
                const { totalitem: totalItem, pagesize: pageSize, pagetotal: pageTotal, pagenumber: pageNumber, rows: list } = page;
                res.send({ error, page: { totalItem, pageSize, pageTotal, pageNumber, list } });
            }
        });
    });

    app.get('/api/tccb/qua-trinh/khen-thuong-ca-nhan/all', app.permission.check('qtKhenThuongCaNhan:read'), (req, res) => {
        let condition = { statement: null };
        if (req.query.shcc) {
            condition = {
                statement: 'shcc = :searchText',
                parameter: { searchText: req.query.shcc },
            };
        }
        app.model.qtKhenThuongCaNhan.getAll(condition, (error, items) => res.send({ error, items }));
    });

    app.get('/api/tccb/qua-trinh/khen-thuong-ca-nhan/item/:id', app.permission.check('qtKhenThuongCaNhan:read'), (req, res) => {
        app.model.qtKhenThuongCaNhan.get({ id: req.params.id }, (error, item) => res.send({ error, item }));
    });

    app.post('/api/tccb/qua-trinh/khen-thuong-ca-nhan', app.permission.check('staff:write'), (req, res) => {
        app.model.qtKhenThuongCaNhan.create(req.body.items, (error, item) => res.send({ error, item }));
    });

    app.put('/api/tccb/qua-trinh/khen-thuong-ca-nhan', app.permission.check('staff:write'), (req, res) =>
        app.model.qtKhenThuongCaNhan.update({ id: req.body.id }, req.body.changes, (error, item) => res.send({ error, item })));

    app.delete('/api/tccb/qua-trinh/khen-thuong-ca-nhan', app.permission.check('staff:write'), (req, res) =>
        app.model.qtKhenThuongCaNhan.delete({ id: req.body.id }, (error) => res.send(error)));

    app.post('/api/user/qua-trinh/khen-thuong-ca-nhan', app.permission.check('staff:login'), (req, res) => {
        if (req.body.data && req.session.user) {
            const data = app.clone(req.body.data, { shcc: req.session.user.shcc });
            app.model.qtKhenThuongCaNhan.create(data, (error, item) => res.send({ error, item }));
        } else {
            res.status(400).send({ error: 'Invalid parameter!' });
        }
    });

    app.put('/api/user/qua-trinh/khen-thuong-ca-nhan', app.permission.check('staff:login'), (req, res) => {
        if (req.body.changes && req.session.user) {
            app.model.qtKhenThuongCaNhan.get({ id: req.body.id }, (error, item) => {
                if (error || item == null) {
                    res.status(400).send({ error: 'Not found!' });
                } else {
                    if (item.shcc === req.cookies.personId) {
                        const changes = req.body.changes;
                        app.model.qtKhenThuongCaNhan.update({ id: req.body.id }, changes, (error, item) => res.send({ error, item }));
                    } else {
                        res.status(400).send({ error: 'Not found!' });
                    }
                }
            });
        } else {
            res.status(400).send({ error: 'Invalid parameter!' });
        }
    });

    app.delete('/api/user/qua-trinh/khen-thuong-ca-nhan', app.permission.check('staff:login'), (req, res) => {
        if (req.session.user) {
            app.model.qtKhenThuongCaNhan.get({ id: req.body.id }, (error, item) => {
                if (error || item == null) {
                    res.status(400).send({ error: 'Not found!' });
                } else {
                    if (item.shcc === req.cookies.personId) {
                        app.model.qtKhenThuongCaNhan.delete({ id: req.body.id }, (error) => res.send(error));
                    } else {
                        res.status(400).send({ error: 'Not found!' });
                    }
                }
            });
        } else {
            res.status(400).send({ error: 'Invalid parameter!' });
        }
    });

    app.get('/api/user/qua-trinh/khen-thuong-ca-nhan/item/:id', app.permission.check('staff:login'), (req, res) => {
        app.model.qtKhenThuongCaNhan.get({ id: req.params.id }, (error, item) => {
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
    app.get('/api/tccb/qua-trinh/khen-thuong-ca-nhan/edit/item/:id', app.permission.check('staff:login') && app.permission.check('qtKhenThuongCaNhan:read'), (req, res) => {
        app.model.qtKhenThuongCaNhan.get({ id: req.params.id }, (error, qtKhenThuongCaNhan) => {
            if (error || qtKhenThuongCaNhan == null) {
                res.send({ error });
            } else {
                app.model.tchcCanBoHopDongDvtlTn.get({ shcc: qtKhenThuongCaNhan.nguoiDuocThue }, (error, canBoDuocThue) => {
                    if (error || canBoDuocThue == null) {
                        res.send({ error });
                    } else {
                        app.model.canBo.get({ shcc: qtKhenThuongCaNhan.nguoiKy }, (error, canBo) => {
                            if (error || canBo == null) {
                                res.send({ item: app.clone({ qtKhenThuongCaNhan: qtKhenThuongCaNhan }, { canBoDuocThue: canBoDuocThue }, { canBo: null }) });
                            } else {
                                res.send({ item: app.clone({ qtKhenThuongCaNhan: qtKhenThuongCaNhan }, { canBoDuocThue: canBoDuocThue }, { canBo: canBo }) });
                            }
                        });
                    }
                });
            }
        });
    });
};
