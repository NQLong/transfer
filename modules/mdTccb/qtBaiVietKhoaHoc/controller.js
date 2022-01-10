module.exports = app => {
    const menu = {
        parentMenu: app.parentMenu.tccb,
        menus: {
            3025: { title: 'Quá trình bài viết khoa học', link: '/user/tccb/qua-trinh/bai-viet-khoa-hoc', icon: 'fa-quote-right', backgroundColor: '#23a0b0', groupIndex: 4 },
        },
    };
    app.permission.add(
        { name: 'qtBaiVietKhoaHoc:read', menu },
        { name: 'qtBaiVietKhoaHoc:write' },
        { name: 'qtBaiVietKhoaHoc:delete' },
    );
    app.get('/user/tccb/qua-trinh/bai-viet-khoa-hoc/:id', app.permission.check('qtBaiVietKhoaHoc:read'), app.templates.admin);
    app.get('/user/tccb/qua-trinh/bai-viet-khoa-hoc', app.permission.check('qtBaiVietKhoaHoc:read'), app.templates.admin);
    app.get('/user/tccb/qua-trinh/bai-viet-khoa-hoc/group_bvkh/:loaiDoiTuong/:ma', app.permission.check('qtBaiVietKhoaHoc:read'), app.templates.admin);

    // APIs -----------------------------------------------------------------------------------------------------------------------------------------
    app.get('/api/tccb/qua-trinh/bai-viet-khoa-hoc/page/:pageNumber/:pageSize', app.permission.check('qtBaiVietKhoaHoc:read'), (req, res) => {
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
        app.model.qtBaiVietKhoaHoc.searchPage(pageNumber, pageSize, loaiDoiTuong, searchTerm, (error, page) => {
            if (error || page == null) {
                res.send({ error });
            } else {
                const { totalitem: totalItem, pagesize: pageSize, pagetotal: pageTotal, pagenumber: pageNumber, rows: list } = page;
                res.send({ error, page: { totalItem, pageSize, pageTotal, pageNumber, list } });
            }
        });
    });

    app.get('/api/tccb/qua-trinh/bai-viet-khoa-hoc/group/page/:pageNumber/:pageSize', app.permission.check('qtBaiVietKhoaHoc:read'), (req, res) => {
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
        app.model.qtBaiVietKhoaHoc.groupPage(pageNumber, pageSize, loaiDoiTuong, searchTerm, (error, page) => {
            if (error || page == null) {
                res.send({ error });
            } else {
                const { totalitem: totalItem, pagesize: pageSize, pagetotal: pageTotal, pagenumber: pageNumber, rows: list } = page;
                res.send({ error, page: { totalItem, pageSize, pageTotal, pageNumber, list } });
            }
        });
    });
    app.get('/api/tccb/qua-trinh/bai-viet-khoa-hoc/group_bvkh/page/:loaiDoiTuong/:pageNumber/:pageSize', app.permission.check('qtBaiVietKhoaHoc:read'), (req, res) => {
        const pageNumber = parseInt(req.params.pageNumber),
            pageSize = parseInt(req.params.pageSize),
            loaiDoiTuong = req.params.loaiDoiTuong,
            searchTerm = typeof req.query.condition === 'string' ? req.query.condition : '';
        app.model.qtBaiVietKhoaHoc.groupPageMa(pageNumber, pageSize, loaiDoiTuong, searchTerm, (error, page) => {
            if (error || page == null) {
                res.send({ error });
            } else {
                const { totalitem: totalItem, pagesize: pageSize, pagetotal: pageTotal, pagenumber: pageNumber, rows: list } = page;
                res.send({ error, page: { totalItem, pageSize, pageTotal, pageNumber, list } });
            }
        });
    });
    app.post('/api/qua-trinh/bai-viet-khoa-hoc', app.permission.check('staff:write'), (req, res) =>
        app.model.qtBaiVietKhoaHoc.create(req.body.data, (error, item) => res.send({ error, item })));

    app.put('/api/qua-trinh/bai-viet-khoa-hoc', app.permission.check('staff:write'), (req, res) =>
        app.model.qtBaiVietKhoaHoc.update({ id: req.body.id }, req.body.changes, (error, item) => res.send({ error, item })));

    app.delete('/api/qua-trinh/bai-viet-khoa-hoc', app.permission.check('staff:write'), (req, res) =>
        app.model.qtBaiVietKhoaHoc.delete({ id: req.body.id }, (error) => res.send(error)));

    app.post('/api/user/qua-trinh/bai-viet-khoa-hoc', app.permission.check('staff:login'), (req, res) => {
        if (req.body.data && req.session.user) {
            const data = app.clone(req.body.data, { shcc: req.session.user.shcc });
            app.model.qtBaiVietKhoaHoc.create(data, (error, item) => res.send({ error, item }));
        } else {
            res.status(400).send({ error: 'Invalid parameter!' });
        }
    });

    app.put('/api/user/qua-trinh/bai-viet-khoa-hoc', app.permission.check('staff:login'), (req, res) => {
        if (req.body.changes && req.session.user) {
            app.model.qtBaiVietKhoaHoc.get({ id: req.body.id }, (error, item) => {
                if (error || item == null) {
                    res.status(400).send({ error: 'Not found!' });
                } else {
                    if (item.shcc === req.cookies.personId) {
                        const changes = req.body.changes;
                        app.model.qtBaiVietKhoaHoc.update({ id: req.body.id }, changes, (error, item) => res.send({ error, item }));
                    } else {
                        res.status(400).send({ error: 'Not found!' });
                    }
                }
            });
        } else {
            res.status(400).send({ error: 'Invalid parameter!' });
        }
    });

    app.delete('/api/user/qua-trinh/bai-viet-khoa-hoc', app.permission.check('staff:login'), (req, res) => {
        if (req.session.user) {
            app.model.qtBaiVietKhoaHoc.get({ id: req.body.id }, (error, item) => {
                if (error || item == null) {
                    res.status(400).send({ error: 'Not found!' });
                } else {
                    if (item.shcc === req.cookies.personId) {
                        app.model.qtBaiVietKhoaHoc.delete({ id: req.body.id }, (error) => res.send(error));
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