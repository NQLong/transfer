module.exports = app => {
    const menu = {
        parentMenu: app.parentMenu.tccb,
        menus: {
            3023: { title: 'Sách giáo trình', link: '/user/tccb/sach-giao-trinh', icon: 'fa-wpexplorer', backgroundColor: '#c400a7', groupIndex: 4 },
        },
    };
    app.permission.add(
        { name: 'sachGiaoTrinh:read', menu },
        { name: 'sachGiaoTrinh:write' },
        { name: 'sachGiaoTrinh:delete' },
    );
    app.get('/user/tccb/sach-giao-trinh/:id', app.permission.check('sachGiaoTrinh:read'), app.templates.admin);
    app.get('/user/tccb/sach-giao-trinh', app.permission.check('sachGiaoTrinh:read'), app.templates.admin);

    // APIs -----------------------------------------------------------------------------------------------------------------------------------------
    app.get('/api/tccb/sach-giao-trinh/page/:pageNumber/:pageSize', app.permission.check('sachGiaoTrinh:read'), (req, res) => {
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
        app.model.sachGiaoTrinh.searchPage(pageNumber, pageSize, loaiDoiTuong, searchTerm, (error, page) => {
            if (error || page == null) {
                res.send({ error });
            } else {
                const { totalitem: totalItem, pagesize: pageSize, pagetotal: pageTotal, pagenumber: pageNumber, rows: list } = page;
                res.send({ error, page: { totalItem, pageSize, pageTotal, pageNumber, list } });
            }
        });
    });

    app.get('/api/tccb/sach-giao-trinh/group/page/:pageNumber/:pageSize', app.permission.check('sachGiaoTrinh:read'), (req, res) => {
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
        app.model.sachGiaoTrinh.groupPage(pageNumber, pageSize, loaiDoiTuong, searchTerm, (error, page) => {
            if (error || page == null) {
                res.send({ error });
            } else {
                const { totalitem: totalItem, pagesize: pageSize, pagetotal: pageTotal, pagenumber: pageNumber, rows: list } = page;
                res.send({ error, page: { totalItem, pageSize, pageTotal, pageNumber, list } });
            }
        });
    });

    app.get('/api/tccb/sach-giao-trinh/group_sgt/page/:loaiDoiTuong/:pageNumber/:pageSize', app.permission.check('sachGiaoTrinh:read'), (req, res) => {
        const pageNumber = parseInt(req.params.pageNumber),
            pageSize = parseInt(req.params.pageSize),
            loaiDoiTuong = req.params.loaiDoiTuong,
            searchTerm = typeof req.query.condition === 'string' ? req.query.condition : '';
        app.model.sachGiaoTrinh.groupPageMa(pageNumber, pageSize, loaiDoiTuong, searchTerm, (error, page) => {
            if (error || page == null) {
                res.send({ error });
            } else {
                const { totalitem: totalItem, pagesize: pageSize, pagetotal: pageTotal, pagenumber: pageNumber, rows: list } = page;
                res.send({ error, page: { totalItem, pageSize, pageTotal, pageNumber, list } });
            }
        });
    });
    app.post('/api/staff/sach-giao-trinh', app.permission.check('staff:write'), (req, res) =>
        app.model.sachGiaoTrinh.create(req.body.data, (error, item) => res.send({ error, item })));

    app.put('/api/staff/sach-giao-trinh', app.permission.check('staff:write'), (req, res) =>
        app.model.sachGiaoTrinh.update({ id: req.body.id }, req.body.changes, (error, item) => res.send({ error, item })));

    app.delete('/api/staff/sach-giao-trinh', app.permission.check('staff:write'), (req, res) =>
        app.model.sachGiaoTrinh.delete({ id: req.body.id }, (error) => res.send(error)));

    app.post('/api/user/staff/sach-giao-trinh', app.permission.check('staff:login'), (req, res) => {
        if (req.body.data && req.session.user) {
            const data = app.clone(req.body.data, { shcc: req.session.user.shcc });
            app.model.sachGiaoTrinh.create(data, (error, item) => res.send({ error, item }));
        } else {
            res.status(400).send({ error: 'Invalid parameter!' });
        }
    });

    app.put('/api/user/staff/sach-giao-trinh', app.permission.check('staff:login'), (req, res) => {
            if (req.body.changes && req.session.user) {
            app.model.sachGiaoTrinh.get({ id: req.body.id }, (error, item) => {
                if (error || item == null) {
                    res.status(400).send({ error: 'Not found!' });
                } else {
                    if (item.shcc === req.cookies.personId) {
                        const changes = req.body.changes;
                        app.model.sachGiaoTrinh.update({ id: req.body.id }, changes, (error, item) => res.send({ error, item }));
                    } else {
                        res.status(400).send({ error: 'Not found!' });
                    }
                }
            });
        } else {
            res.status(400).send({ error: 'Invalid parameter!' });
        }
    });

    app.delete('/api/user/staff/sach-giao-trinh', app.permission.check('staff:login'), (req, res) => {
        if (req.session.user) {
            app.model.sachGiaoTrinh.get({ id: req.body.id }, (error, item) => {
                if (error || item == null) {
                    res.status(400).send({ error: 'Not found!' });
                } else {
                    if (item.shcc === req.cookies.personId) {
                        app.model.sachGiaoTrinh.delete({ id: req.body.id }, (error) => res.send(error));
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