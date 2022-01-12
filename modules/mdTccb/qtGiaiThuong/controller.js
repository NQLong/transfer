module.exports = app => {
    const menu = {
        parentMenu: app.parentMenu.tccb,
        menus: {
            3027: { title: 'Quá trình giải thưởng', link: '/user/tccb/qua-trinh/giai-thuong', icon: 'fa-trophy', backgroundColor: '#fc7b5d', groupIndex: 4 },
        },
    };
    app.permission.add(
        { name: 'qtGiaiThuong:read', menu },
        { name: 'qtGiaiThuong:write' },
        { name: 'qtGiaiThuong:delete' },
    );
    app.get('/user/tccb/qua-trinh/giai-thuong/:id', app.permission.check('qtGiaiThuong:read'), app.templates.admin);
    app.get('/user/tccb/qua-trinh/giai-thuong', app.permission.check('qtGiaiThuong:read'), app.templates.admin);
    app.get('/user/tccb/qua-trinh/giai-thuong/group_gt/:loaiDoiTuong/:ma', app.permission.check('qtGiaiThuong:read'), app.templates.admin);

    // APIs -----------------------------------------------------------------------------------------------------------------------------------------
    app.get('/api/tccb/qua-trinh/giai-thuong/page/:pageNumber/:pageSize', app.permission.check('qtGiaiThuong:read'), (req, res) => {
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
        app.model.qtGiaiThuong.searchPage(pageNumber, pageSize, loaiDoiTuong, searchTerm, (error, page) => {
            if (error || page == null) {
                res.send({ error });
            } else {
                const { totalitem: totalItem, pagesize: pageSize, pagetotal: pageTotal, pagenumber: pageNumber, rows: list } = page;
                res.send({ error, page: { totalItem, pageSize, pageTotal, pageNumber, list } });
            }
        });
    });

    app.get('/api/tccb/qua-trinh/giai-thuong/group/page/:pageNumber/:pageSize', app.permission.check('qtGiaiThuong:read'), (req, res) => {
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
        app.model.qtGiaiThuong.groupPage(pageNumber, pageSize, loaiDoiTuong, searchTerm, (error, page) => {
            if (error || page == null) {
                res.send({ error });
            } else {
                const { totalitem: totalItem, pagesize: pageSize, pagetotal: pageTotal, pagenumber: pageNumber, rows: list } = page;
                res.send({ error, page: { totalItem, pageSize, pageTotal, pageNumber, list } });
            }
        });
    });
    app.get('/api/tccb/qua-trinh/giai-thuong/group_gt/page/:loaiDoiTuong/:pageNumber/:pageSize', app.permission.check('qtGiaiThuong:read'), (req, res) => {
        const pageNumber = parseInt(req.params.pageNumber),
            pageSize = parseInt(req.params.pageSize),
            loaiDoiTuong = req.params.loaiDoiTuong,
            searchTerm = typeof req.query.condition === 'string' ? req.query.condition : '';
        app.model.qtGiaiThuong.groupPageMa(pageNumber, pageSize, loaiDoiTuong, searchTerm, (error, page) => {
            if (error || page == null) {
                res.send({ error });
            } else {
                const { totalitem: totalItem, pagesize: pageSize, pagetotal: pageTotal, pagenumber: pageNumber, rows: list } = page;
                res.send({ error, page: { totalItem, pageSize, pageTotal, pageNumber, list } });
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
            const data = app.clone(req.body.data, { shcc: req.session.user.shcc });
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