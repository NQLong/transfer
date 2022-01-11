module.exports = app => {
    const menu = {
        parentMenu: app.parentMenu.tccb,
        menus: {
            3018: { title: 'Quá trình hướng dẫn luận văn', link: '/user/tccb/qua-trinh/hdlv', icon: 'fa-university', backgroundColor: '#488a37', groupIndex: 4},
        },
    };

    app.permission.add(
        { name: 'qtHuongDanLuanVan:read', menu },
        { name: 'qtHuongDanLuanVan:write' },
        { name: 'qtHuongDanLuanVan:delete' },
    );
    app.get('/user/tccb/qua-trinh/hdlv/:stt', app.permission.check('qtHuongDanLuanVan:read'), app.templates.admin);
    app.get('/user/tccb/qua-trinh/hdlv', app.permission.check('qtHuongDanLuanVan:read'), app.templates.admin);
    app.get('/user/tccb/qua-trinh/hdlv/group/:loaiDoiTuong/:ma', app.permission.check('qtHuongDanLuanVan:read'), app.templates.admin);
    // APIs -----------------------------------------------------------------------------------------------------------------------------------------
    const checkGetStaffPermission = (req, res, next) => app.isDebug ? next() : app.permission.check('staff:login')(req, res, next);
    
    app.get('/api/qua-trinh/hdlv/page/:pageNumber/:pageSize', checkGetStaffPermission, (req, res) => {
        const pageNumber = parseInt(req.params.pageNumber),
            pageSize = parseInt(req.params.pageSize),
            searchTerm = typeof req.query.condition === 'string' ? req.query.condition : '';
        let arr = req.query.parameter;
        if (!Array.isArray(arr)) arr = [];
        let loaiDoiTuong = '-1';
        if (arr.length > 0) {
            loaiDoiTuong = '(';
            for (let idx = 0; idx < arr.length; idx++) {
                if (typeof arr[idx] == 'string') loaiDoiTuong += '\'' + arr[idx] + '\'';
                else loaiDoiTuong += '\'' + arr[idx].toString() + '\'';
                if (idx != arr.length - 1) loaiDoiTuong += ',';
            }
            loaiDoiTuong += ')';
        }
        app.model.qtHuongDanLuanVan.searchPage(pageNumber, pageSize, loaiDoiTuong, searchTerm, (error, page) => {
            if (error || page == null) {
                res.send({ error });
            } else {
                const { totalitem: totalItem, pagesize: pageSize, pagetotal: pageTotal, pagenumber: pageNumber, rows: list } = page;
                res.send({ error, page: { totalItem, pageSize, pageTotal, pageNumber, list } });
            }
        });
    });

    app.get('/api/qua-trinh/hdlv/group/page/:pageNumber/:pageSize', app.permission.check('qtHuongDanLuanVan:read'), (req, res) => {
        const pageNumber = parseInt(req.params.pageNumber),
            pageSize = parseInt(req.params.pageSize),
            searchTerm = typeof req.query.condition === 'string' ? req.query.condition : '';
        let arr = req.query.parameter;
        if (!Array.isArray(arr)) arr = [];
        let loaiDoiTuong = '-1';
        if (arr.length > 0) {
            loaiDoiTuong = '(';
            for (let idx = 0; idx < arr.length; idx++) {
                if (typeof arr[idx] == 'string') loaiDoiTuong += '\'' + arr[idx] + '\'';
                else loaiDoiTuong += '\'' + arr[idx].toString() + '\'';
                if (idx != arr.length - 1) loaiDoiTuong += ',';
            }
            loaiDoiTuong += ')';
        }
        app.model.qtHuongDanLuanVan.groupPage(pageNumber, pageSize, loaiDoiTuong, searchTerm, (error, page) => {
            if (error || page == null) {
                res.send({ error });
            } else {
                const { totalitem: totalItem, pagesize: pageSize, pagetotal: pageTotal, pagenumber: pageNumber, rows: list } = page;
                res.send({ error, page: { totalItem, pageSize, pageTotal, pageNumber, list } });
            }
        });
    });

    app.get('/api/qua-trinh/hdlv/group/page/:loaiDoiTuong/:pageNumber/:pageSize', app.permission.check('qtHuongDanLuanVan:read'), (req, res) => {
        const pageNumber = parseInt(req.params.pageNumber),
            pageSize = parseInt(req.params.pageSize),
            loaiDoiTuong = req.params.loaiDoiTuong,
            searchTerm = typeof req.query.condition === 'string' ? req.query.condition : '';
        app.model.qtHuongDanLuanVan.groupPageMa(pageNumber, pageSize, loaiDoiTuong, searchTerm, (error, page) => {
            if (error || page == null) {
                res.send({ error });
            } else {
                const { totalitem: totalItem, pagesize: pageSize, pagetotal: pageTotal, pagenumber: pageNumber, rows: list } = page;
                res.send({ error, page: { totalItem, pageSize, pageTotal, pageNumber, list } });
            }
        });
    });
    
    app.get('/api/qua-trinh/hdlv/all', checkGetStaffPermission, (req, res) => {
        app.model.qtHuongDanLuanVan.getAll((error, items) => res.send({ error, items }));
    });

    app.post('/api/qua-trinh/hdlv', app.permission.check('staff:write'), (req, res) =>
        app.model.qtHuongDanLuanVan.create(req.body.data, (error, item) => res.send({ error, item })));

    app.put('/api/qua-trinh/hdlv', app.permission.check('staff:write'), (req, res) =>
        app.model.qtHuongDanLuanVan.update({ id: req.body.id }, req.body.changes, (error, item) => res.send({ error, item })));

    app.delete('/api/qua-trinh/hdlv', app.permission.check('staff:write'), (req, res) =>
        app.model.qtHuongDanLuanVan.delete({ id: req.body.id }, (error) => res.send(error)));

    app.post('/api/user/qua-trinh/hdlv', app.permission.check('staff:login'), (req, res) => {
        if (req.body.data && req.session.user) {
            const data = app.clone(req.body.data, { shcc: req.session.user.shcc });
            app.model.qtHuongDanLuanVan.create(data, (error, item) => res.send({ error, item }));
        } else {
            res.status(400).send({ error: 'Invalid parameter!' });
        }
    });

    app.put('/api/user/qua-trinh/hdlv', app.permission.check('staff:login'), (req, res) => {
        if (req.body.changes && req.session.user) {
            app.model.qtHuongDanLuanVan.get({ id: req.body.id }, (error, item) => {
                if (error || item == null) {
                    res.status(400).send({ error: 'Not found!' });
                } else {
                    if (item.shcc === req.cookies.personId) {
                        const changes = req.body.changes;
                        app.model.qtHuongDanLuanVan.update({ id: req.body.id }, changes, (error, item) => res.send({ error, item }));
                    } else {
                        res.status(400).send({ error: 'Not found!' });
                    }
                }
            });
        } else {
            res.status(400).send({ error: 'Invalid parameter!' });
        }
    });

    app.delete('/api/user/qua-trinh/hdlv', app.permission.check('staff:login'), (req, res) => {
        if (req.session.user) {
            app.model.qtHuongDanLuanVan.get({ id: req.body.id }, (error, item) => {
                if (error || item == null) {
                    res.status(400).send({ error: 'Not found!' });
                } else {
                    if (item.shcc === req.cookies.personId) {
                        app.model.qtHuongDanLuanVan.delete({ id: req.body.id }, (error) => res.send(error));
                    } else {
                        res.status(400).send({ error: 'Not found!' });
                    }
                }
            });
        } else {
            res.status(400).send({ error: 'Invalid parameter!' });
        }
    });
};