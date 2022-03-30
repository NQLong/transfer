module.exports = app => {
    const menu = {
        parentMenu: app.parentMenu.tccb,
        menus: {
            3006: { title: 'Quá trình kỷ luật', link: '/user/tccb/qua-trinh/ky-luat', icon: 'fa-ban', backgroundColor: '#f03a3a', groupIndex: 3 },
        },
    };

    const menuStaff = {
        parentMenu: app.parentMenu.user,
        menus: {
            1005: { title: 'Kỷ luật', link: '/user/ky-luat', icon: 'fa-ban', backgroundColor: '#f03a3a', groupIndex: 2 },
        },
    };

    app.permission.add(
        { name: 'staff:login', menu: menuStaff },
        { name: 'qtKyLuat:read', menu },
        { name: 'qtKyLuat:write' },
        { name: 'qtKyLuat:delete' },
    );
    app.get('/user/tccb/qua-trinh/ky-luat/:id', app.permission.check('qtKyLuat:read'), app.templates.admin);
    app.get('/user/tccb/qua-trinh/ky-luat', app.permission.check('qtKyLuat:read'), app.templates.admin);
    app.get('/user/tccb/qua-trinh/ky-luat/group/:shcc', app.permission.check('qtKyLuat:read'), app.templates.admin);
    app.get('/user/ky-luat', app.permission.check('staff:login'), app.templates.admin);
    // APIs -----------------------------------------------------------------------------------------------------------------------------------------
    // //User Actions:
    app.post('/api/user/qua-trinh/ky-luat', app.permission.check('staff:login'), (req, res) => {
        if (req.body.data && req.session.user) {
            const data = req.body.data;
            app.model.qtKyLuat.create(data, (error, item) => res.send({ error, item }));
        } else {
            res.send({ error: 'Invalid parameter!' });
        }
    });

    app.put('/api/user/qua-trinh/ky-luat', app.permission.check('staff:login'), (req, res) => {
        if (req.body.changes && req.session.user) {
            app.model.qtKyLuat.get({ id: req.body.id }, (error, item) => {
                if (error || item == null) {
                    res.send({ error: 'Not found!' });
                } else {
                    app.model.canBo.get({ shcc: item.shcc }, (e, r) => {
                        if (e || r == null) res.send({ error: 'Staff not found!' }); else {
                            const changes = req.body.changes;
                            app.model.qtKyLuat.update({ id: req.body.id }, changes, (error, item) => res.send({ error, item }));
                        }
                    });
                }
            });
        } else {
            res.send({ error: 'Invalid parameter!' });
        }
    });

    app.delete('/api/user/qua-trinh/ky-luat', app.permission.check('staff:login'), (req, res) => {
        if (req.session.user) {
            app.model.qtKyLuat.get({ id: req.body.id }, (error, item) => {
                if (error || item == null) {
                    res.send({ error: 'Not found!' });
                } else {
                    app.model.canBo.get({ shcc: item.shcc }, (e, r) => {
                        if (e || r == null) res.send({ error: 'Staff not found!' }); else {
                            app.model.qtKyLuat.delete({ id: req.body.id }, (error, item) => res.send({ error, item }));
                        }
                    });
                }
            });
        } else {
            res.send({ error: 'Invalid parameter!' });
        }
    });

    app.get('/api/user/qua-trinh/ky-luat/page/:pageNumber/:pageSize', app.permission.check('staff:login'), (req, res) => {
        const pageNumber = parseInt(req.params.pageNumber),
            pageSize = parseInt(req.params.pageSize),
            searchTerm = typeof req.query.condition === 'string' ? req.query.condition : '';
        const { fromYear, toYear, listShcc, listDv, listHinhThucKyLuat } = (req.query.filter && req.query.filter != '%%%%%%%%') ? req.query.filter : { fromYear: null, toYear: null, listShcc: null, listDv: null, listHinhThucKyLuat: null };
        app.model.qtKyLuat.searchPage(pageNumber, pageSize, listShcc, listDv, fromYear, toYear, listHinhThucKyLuat, searchTerm, (error, page) => {
            if (error || page == null) {
                res.send({ error });
            } else {
                const { totalitem: totalItem, pagesize: pageSize, pagetotal: pageTotal, pagenumber: pageNumber, rows: list } = page;
                const pageCondition = searchTerm;
                res.send({ error, page: { totalItem, pageSize, pageTotal, pageNumber, pageCondition, list } });
            }
        });
    });
    ///END USER ACTIONS

    app.get('/api/tccb/qua-trinh/ky-luat/page/:pageNumber/:pageSize', app.permission.check('qtKyLuat:read'), (req, res) => {
        const pageNumber = parseInt(req.params.pageNumber),
            pageSize = parseInt(req.params.pageSize),
            searchTerm = typeof req.query.condition === 'string' ? req.query.condition : '';
        const { fromYear, toYear, listShcc, listDv, listHinhThucKyLuat } = (req.query.filter && req.query.filter != '%%%%%%%%') ? req.query.filter : { fromYear: null, toYear: null, listShcc: null, listDv: null, listHinhThucKyLuat: null};
        app.model.qtKyLuat.searchPage(pageNumber, pageSize, listShcc, listDv, fromYear, toYear, listHinhThucKyLuat, searchTerm, (error, page) => {
            if (error || page == null) {
                res.send({ error });
            } else {
                const { totalitem: totalItem, pagesize: pageSize, pagetotal: pageTotal, pagenumber: pageNumber, rows: list } = page;
                const pageCondition = searchTerm;
                res.send({ error, page: { totalItem, pageSize, pageTotal, pageNumber, pageCondition, list } });
            }
        });
    });

    app.get('/api/tccb/qua-trinh/ky-luat/group/page/:pageNumber/:pageSize', app.permission.check('qtKyLuat:read'), (req, res) => {
        const pageNumber = parseInt(req.params.pageNumber),
            pageSize = parseInt(req.params.pageSize),
            searchTerm = typeof req.query.condition === 'string' ? req.query.condition : '';
        const { fromYear, toYear, listShcc, listDv, listHinhThucKyLuat } = (req.query.filter && req.query.filter != '%%%%%%%%%%') ? req.query.filter : { fromYear: null, toYear: null, listShcc: null, listDv: null, listHinhThucKyLuat: null };
        app.model.qtKyLuat.groupPage(pageNumber, pageSize, listShcc, listDv, fromYear, toYear, listHinhThucKyLuat, searchTerm, (error, page) => {
            if (error || page == null) {
                res.send({ error });
            } else {
                const { totalitem: totalItem, pagesize: pageSize, pagetotal: pageTotal, pagenumber: pageNumber, rows: list } = page;
                const pageCondition = searchTerm;
                res.send({ error, page: { totalItem, pageSize, pageTotal, pageNumber, pageCondition, list } });
            }
        });
    });
    app.get('/api/tccb/qua-trinh/ky-luat/all', app.permission.check('qtKyLuat:read'), (req, res) => {
        let condition = { statement: null };
        if (req.query.ma) {
            condition = {
                statement: 'ma = :searchText',
                parameter: { searchText: req.query.ma },
            };
        }
        app.model.qtKyLuat.getAll(condition, (error, items) => res.send({ error, items }));
    });

    app.get('/api/tccb/qua-trinh/ky-luat/item/:id', app.permission.check('qtKyLuat:read'), (req, res) => {
        app.model.qtKyLuat.get({ id: req.params.id }, (error, item) => res.send({ error, item }));
    });

    app.post('/api/tccb/qua-trinh/ky-luat', app.permission.check('staff:write'), (req, res) => {
        app.model.qtKyLuat.create(req.body.data, (error, item) => res.send({ error, item }));
    });

    app.put('/api/tccb/qua-trinh/ky-luat', app.permission.check('staff:write'), (req, res) =>
        app.model.qtKyLuat.update({ id: req.body.id }, req.body.changes, (error, item) => res.send({ error, item })));

    app.delete('/api/tccb/qua-trinh/ky-luat', app.permission.check('staff:write'), (req, res) =>
        app.model.qtKyLuat.delete({ id: req.body.id }, (error) => res.send(error)));

    app.get('/api/qua-trinh/ky-luat/download-excel/:listShcc/:listDv/:fromYear/:toYear/:listHinhThucKyLuat', app.permission.check('qtKyLuat:read'), (req, res) => {
        let { listShcc, listDv, fromYear, toYear, listHinhThucKyLuat } = req.params ? req.params : { listShcc: null, listDv: null, toYear: null, listHinhThucKyLuat: null };
        if (listShcc == 'null') listShcc = null;
        if (listDv == 'null') listDv = null;
        if (fromYear == 'null') fromYear = null;
        if (toYear == 'null') toYear = null;
        if (listHinhThucKyLuat == 'null') listHinhThucKyLuat = null;
        app.model.qtKyLuat.download(listShcc, listDv, fromYear, toYear, listHinhThucKyLuat, (err, result) => {
            if (err || !result) {
                res.send({ err });
            } else {
                const workbook = app.excel.create(),
                    worksheet = workbook.addWorksheet('kyluat');
                new Promise(resolve => {
                    let cells = [
                        { cell: 'A1', value: '#', bold: true, border: '1234' },
                        { cell: 'B1', value: 'Học vị', bold: true, border: '1234' },
                        { cell: 'C1', value: 'Mã thẻ cán bộ', bold: true, border: '1234' },
                        { cell: 'D1', value: 'Họ', bold: true, border: '1234' },
                        { cell: 'E1', value: 'Tên', bold: true, border: '1234' },
                        { cell: 'F1', value: 'Chức vụ', bold: true, border: '1234' },
                        { cell: 'G1', value: 'Đơn vị', bold: true, border: '1234' },
                        { cell: 'H1', value: 'Số quyết định', bold: true, border: '1234' },
                        { cell: 'I1', value: 'Ngày ra quyết định', bold: true, border: '1234' },
                        { cell: 'J1', value: 'Hình thức kỷ luật', bold: true, border: '1234' },
                        { cell: 'K1', value: 'Nội dung', bold: true, border: '1234' },
                        { cell: 'L1', value: 'Điểm thi đua', bold: true, border: '1234' },
                    ];
                    result.rows.forEach((item, index) => {
                        cells.push({ cell: 'A' + (index + 2), border: '1234', number: index + 1 });
                        cells.push({ cell: 'B' + (index + 2), border: '1234', value: item.tenHocVi });
                        cells.push({ cell: 'C' + (index + 2), border: '1234', value: item.maCanBo });
                        cells.push({ cell: 'D' + (index + 2), border: '1234', value: item.hoCanBo });
                        cells.push({ cell: 'E' + (index + 2), border: '1234', value: item.tenCanBo });
                        cells.push({ cell: 'F' + (index + 2), border: '1234', value: item.tenChucVu });
                        cells.push({ cell: 'G' + (index + 2), border: '1234', value: item.tenDonVi });
                        cells.push({ cell: 'H' + (index + 2), border: '1234', value: item.soQuyetDinh });
                        cells.push({ cell: 'I' + (index + 2), border: '1234', value: item.ngayRaQuyetDinh ? app.date.dateTimeFormat(new Date(item.ngayRaQuyetDinh), 'dd/mm/yyyy') : ''  });
                        cells.push({ cell: 'J' + (index + 2), border: '1234', value: item.tenKyLuat });
                        cells.push({ cell: 'K' + (index + 2), alignment: 'center', border: '1234', value: item.noiDung });
                        cells.push({ cell: 'L' + (index + 2), border: '1234', value: item.diemThiDua });
                    });
                    resolve(cells);
                }).then((cells) => {
                    app.excel.write(worksheet, cells);
                    app.excel.attachment(workbook, res, 'kyluat.xlsx');
                }).catch((error) => {
                    res.send({ error });
                });
            }
        });

    });
};