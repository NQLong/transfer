module.exports = app => {
    const menu = {
        parentMenu: app.parentMenu.tccb,
        menus: {
            3030: { title: 'Quá trình nghỉ việc', link: '/user/tccb/qua-trinh/nghi-viec', icon: 'fa-sign-out', backgroundColor: '#2a99b8', groupIndex: 1 },
        },
    };
    app.permission.add(
        { name: 'qtNghiViec:read', menu },
        { name: 'qtNghiViec:write' },
        { name: 'qtNghiViec:delete' },
    );
    app.get('/user/tccb/qua-trinh/nghi-viec/:ma', app.permission.check('qtNghiViec:read'), app.templates.admin);
    app.get('/user/tccb/qua-trinh/nghi-viec', app.permission.check('qtNghiViec:read'), app.templates.admin);
    app.get('/user/tccb/qua-trinh/nghi-viec/group/:loaiDoiTuong/:ma', app.permission.check('qtNghiViec:read'), app.templates.admin);

    // APIs -----------------------------------------------------------------------------------------------------------------------------------------
    app.get('/api/tccb/qua-trinh/nghi-viec/page/:pageNumber/:pageSize', app.permission.check('qtNghiViec:read'), (req, res) => {
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
        app.model.qtNghiViec.searchPage(pageNumber, pageSize, loaiDoiTuong, searchTerm, (error, page) => {
            if (error || page == null) {
                res.send({ error });
            } else {
                const { totalitem: totalItem, pagesize: pageSize, pagetotal: pageTotal, pagenumber: pageNumber, rows: list } = page;
                res.send({ error, page: { totalItem, pageSize, pageTotal, pageNumber, list } });
            }
        });
    });

    app.get('/api/tccb/qua-trinh/nghi-viec/group/page/:pageNumber/:pageSize', app.permission.check('qtNghiViec:read'), (req, res) => {
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
        app.model.qtNghiViec.groupPage(pageNumber, pageSize, loaiDoiTuong, searchTerm, (error, page) => {
            if (error || page == null) {
                res.send({ error });
            } else {
                const { totalitem: totalItem, pagesize: pageSize, pagetotal: pageTotal, pagenumber: pageNumber, rows: list } = page;
                res.send({ error, page: { totalItem, pageSize, pageTotal, pageNumber, list } });
            }
        });
    });

    app.get('/api/tccb/qua-trinh/nghi-viec/group/page/:loaiDoiTuong/:pageNumber/:pageSize', app.permission.check('qtNghiViec:read'), (req, res) => {
        const pageNumber = parseInt(req.params.pageNumber),
            pageSize = parseInt(req.params.pageSize),
            loaiDoiTuong = req.params.loaiDoiTuong,
            searchTerm = typeof req.query.condition === 'string' ? req.query.condition : '';
        app.model.qtNghiViec.groupPageMa(pageNumber, pageSize, loaiDoiTuong, searchTerm, (error, page) => {
            if (error || page == null) {
                res.send({ error });
            } else {
                const { totalitem: totalItem, pagesize: pageSize, pagetotal: pageTotal, pagenumber: pageNumber, rows: list } = page;
                res.send({ error, page: { totalItem, pageSize, pageTotal, pageNumber, list } });
            }
        });
    });
    app.post('/api/staff/qua-trinh/nghi-viec', app.permission.check('staff:write'), (req, res) =>
        app.model.qtNghiViec.create(req.body.data, (error, item) => res.send({ error, item })));

    app.put('/api/staff/qua-trinh/nghi-viec', app.permission.check('staff:write'), (req, res) =>
        app.model.qtNghiViec.update({ ma: req.body.ma }, req.body.changes, (error, item) => res.send({ error, item })));

    app.delete('/api/staff/qua-trinh/nghi-viec', app.permission.check('staff:write'), (req, res) =>
        app.model.qtNghiViec.delete({ ma: req.body.ma }, (error) => res.send(error)));

    app.post('/api/user/staff/qua-trinh/nghi-viec', app.permission.check('staff:login'), (req, res) => {
        if (req.body.data && req.session.user) {
            const data = app.clone(req.body.data, { shcc: req.session.user.shcc });
            app.model.qtNghiViec.create(data, (error, item) => res.send({ error, item }));
        } else {
            res.status(400).send({ error: 'Invalid parameter!' });
        }
    });

    app.put('/api/user/staff/qua-trinh/nghi-viec', app.permission.check('staff:login'), (req, res) => {
            if (req.body.changes && req.session.user) {
            app.model.qtNghiViec.get({ ma: req.body.ma }, (error, item) => {
                if (error || item == null) {
                    res.status(400).send({ error: 'Not found!' });
                } else {
                    if (item.shcc === req.cookies.personId) {
                        const changes = req.body.changes;
                        app.model.qtNghiViec.update({ ma: req.body.ma }, changes, (error, item) => res.send({ error, item }));
                    } else {
                        res.status(400).send({ error: 'Not found!' });
                    }
                }
            });
        } else {
            res.status(400).send({ error: 'Invalid parameter!' });
        }
    });

    app.delete('/api/user/staff/qua-trinh/nghi-viec', app.permission.check('staff:login'), (req, res) => {
        if (req.session.user) {
            app.model.qtNghiViec.get({ ma: req.body.ma }, (error, item) => {
                if (error || item == null) {
                    res.status(400).send({ error: 'Not found!' });
                } else {
                    if (item.shcc === req.cookies.personId) {
                        app.model.qtNghiViec.delete({ ma: req.body.ma }, (error) => res.send(error));
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