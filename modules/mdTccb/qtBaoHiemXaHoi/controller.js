module.exports = app => {
    const menu = {
        parentMenu: app.parentMenu.tccb,
        menus: {
            3037: { title: 'Quá trình bảo hiểm xã hội', link: '/user/tccb/qua-trinh/bao-hiem-xa-hoi', icon: 'fa-life-ring', backgroundColor: '#02006e', groupIndex: 1 },
        },
    };
    const menuStaff = {
        parentMenu: app.parentMenu.user,
        menus: {
            1009: { title: 'Bảo hiểm xã hội', link: '/user/bao-hiem-xa-hoi', icon: 'fa-life-ring', backgroundColor: '#395ded', groupIndex: 1 },
        },
    };

    app.permission.add(
        { name: 'staff:login', menu: menuStaff },
        { name: 'qtBaoHiemXaHoi:read', menu },
        { name: 'qtBaoHiemXaHoi:write' },
        { name: 'qtBaoHiemXaHoi:delete' },
    );
    app.get('/user/tccb/qua-trinh/bao-hiem-xa-hoi', app.permission.check('qtBaoHiemXaHoi:read'), app.templates.admin);
    app.get('/user/tccb/qua-trinh/bao-hiem-xa-hoi/group/:shcc', app.permission.check('qtBaoHiemXaHoi:read'), app.templates.admin);
    app.get('/user/bao-hiem-xa-hoi', app.permission.check('staff:login'), app.templates.admin);

    // APIs -----------------------------------------------------------------------------------------------------------------------------------------
    // //User Actions:
    app.post('/api/user/qua-trinh/bao-hiem-xa-hoi', app.permission.check('staff:login'), (req, res) => {
        if (req.body.data && req.session.user) {
            const data = req.body.data;
            app.model.qtBaoHiemXaHoi.create(data, (error, item) => res.send({ error, item }));
        } else {
            res.send({ error: 'Invalid parameter!' });
        }
    });

    app.put('/api/user/qua-trinh/bao-hiem-xa-hoi', app.permission.check('staff:login'), (req, res) => {
        if (req.body.changes && req.session.user) {
            app.model.qtBaoHiemXaHoi.get({ id: req.body.id }, (error, item) => {
                if (error || item == null) {
                    res.send({ error: 'Not found!' });
                } else {
                    app.model.canBo.get({ shcc: item.shcc }, (e, r) => {
                        if (e || r == null) res.send({ error: 'Staff not found!' }); else {
                            const changes = req.body.changes;
                            app.model.qtBaoHiemXaHoi.update({ id: req.body.id }, changes, (error, item) => res.send({ error, item }));
                        }
                    });
                }
            });
        } else {
            res.send({ error: 'Invalid parameter!' });
        }
    });

    app.delete('/api/user/qua-trinh/bao-hiem-xa-hoi', app.permission.check('staff:login'), (req, res) => {
        if (req.session.user) {
            app.model.qtBaoHiemXaHoi.get({ id: req.body.id }, (error, item) => {
                if (error || item == null) {
                    res.send({ error: 'Not found!' });
                } else {
                    app.model.canBo.get({ shcc: item.shcc }, (e, r) => {
                        if (e || r == null) res.send({ error: 'Staff not found!' }); else {
                            app.model.qtBaoHiemXaHoi.delete({ id: req.body.id }, (error, item) => res.send({ error, item }));
                        }
                    });
                }
            });
        } else {
            res.send({ error: 'Invalid parameter!' });
        }
    });

    app.get('/api/user/qua-trinh/bao-hiem-xa-hoi/page/:pageNumber/:pageSize', app.permission.check('staff:login'), (req, res) => {
        const pageNumber = parseInt(req.params.pageNumber),
            pageSize = parseInt(req.params.pageSize),
            searchTerm = typeof req.query.condition === 'string' ? req.query.condition : '';
        const { fromYear, toYear, list_shcc, list_dv, timeType, tinhTrang } = (req.query.filter && req.query.filter != '%%%%%%%%') ? req.query.filter : { fromYear: null, toYear: null, list_shcc: null, list_dv: null, timeType: 0, tinhTrang: null };
        app.model.qtBaoHiemXaHoi.searchPage(pageNumber, pageSize, list_shcc, list_dv, fromYear, toYear, timeType, tinhTrang, searchTerm, (error, page) => {
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

    app.get('/api/tccb/qua-trinh/bao-hiem-xa-hoi/page/:pageNumber/:pageSize', app.permission.check('qtBaoHiemXaHoi:read'), (req, res) => {
        const pageNumber = parseInt(req.params.pageNumber),
            pageSize = parseInt(req.params.pageSize),
            searchTerm = typeof req.query.condition === 'string' ? req.query.condition : '';
        const { fromYear, toYear, list_shcc, list_dv, timeType, tinhTrang } = (req.query.filter && req.query.filter != '%%%%%%%%') ? req.query.filter : { fromYear: null, toYear: null, list_shcc: null, list_dv: null, timeType: 0, tinhTrang: null };
        app.model.qtBaoHiemXaHoi.searchPage(pageNumber, pageSize, list_shcc, list_dv, fromYear, toYear, timeType, tinhTrang, searchTerm, (error, page) => {
            if (error || page == null) {
                res.send({ error });
            } else {
                const { totalitem: totalItem, pagesize: pageSize, pagetotal: pageTotal, pagenumber: pageNumber, rows: list } = page;
                const pageCondition = searchTerm;
                res.send({ error, page: { totalItem, pageSize, pageTotal, pageNumber, pageCondition, list } });
            }
        });
    });

    app.get('/api/tccb/qua-trinh/bao-hiem-xa-hoi/group/page/:pageNumber/:pageSize', app.permission.check('qtBaoHiemXaHoi:read'), (req, res) => {
        const pageNumber = parseInt(req.params.pageNumber),
            pageSize = parseInt(req.params.pageSize),
            searchTerm = typeof req.query.condition === 'string' ? req.query.condition : '';
        const { fromYear, toYear, list_shcc, list_dv, timeType, tinhTrang } = (req.query.filter && req.query.filter != '%%%%%%%%%%') ? req.query.filter : { fromYear: null, toYear: null, list_shcc: null, list_dv: null, timeType: 0, tinhTrang: null };
        app.model.qtBaoHiemXaHoi.groupPage(pageNumber, pageSize, list_shcc, list_dv, fromYear, toYear, timeType, tinhTrang, searchTerm, (error, page) => {
            if (error || page == null) {
                res.send({ error });
            } else {
                const { totalitem: totalItem, pagesize: pageSize, pagetotal: pageTotal, pagenumber: pageNumber, rows: list } = page;
                const pageCondition = searchTerm;
                res.send({ error, page: { totalItem, pageSize, pageTotal, pageNumber, pageCondition, list } });
            }
        });
    });
    app.post('/api/tccb/qua-trinh/bao-hiem-xa-hoi', app.permission.check('staff:write'), (req, res) =>
        app.model.qtBaoHiemXaHoi.create(req.body.data, (error, item) => res.send({ error, item })));

    app.put('/api/tccb/qua-trinh/bao-hiem-xa-hoi', app.permission.check('staff:write'), (req, res) =>
        app.model.qtBaoHiemXaHoi.update({ id: req.body.id }, req.body.changes, (error, item) => res.send({ error, item })));

    app.delete('/api/tccb/qua-trinh/bao-hiem-xa-hoi', app.permission.check('staff:write'), (req, res) =>
        app.model.qtBaoHiemXaHoi.delete({ id: req.body.id }, (error) => res.send(error)));

    app.get('/api/qua-trinh/bao-hiem-xa-hoi/download-excel/:list_shcc/:list_dv/:fromYear/:toYear/:timeType/:tinhTrang', app.permission.check('qtBaoHiemXaHoi:read'), (req, res) => {
        let { list_shcc, list_dv, fromYear, toYear, timeType, tinhTrang } = req.params ? req.params : { list_shcc: null, list_dv: null, toYear: null, timeType: 0, tinhTrang: null};
        if (list_shcc == 'null') list_shcc = null;
        if (list_dv == 'null') list_dv = null;
        if (fromYear == 'null') fromYear = null;
        if (toYear == 'null') toYear = null;
        if (tinhTrang == 'null') tinhTrang = null;
        app.model.qtBaoHiemXaHoi.download(list_shcc, list_dv, fromYear, toYear, timeType, tinhTrang, (err, result) => {
            if (err || !result) {
                res.send({ err });
            } else {
                const workbook = app.excel.create(),
                    worksheet = workbook.addWorksheet('baohiemxahoi');
                new Promise(resolve => {
                    let cells = [
                        // Table name: QT_BAO_HIEM_XA_HOI { id, batDau, batDauType, ketThuc, ketThucType, chucVu, mucDong, phuCapChucVu, phuCapThamNienVuotKhung, phuCapThamNienNghe, tyLeDong, shcc }
                        { cell: 'A1', value: '#', bold: true, border: '1234' },
                        { cell: 'B1', value: 'Mã thẻ cán bộ', bold: true, border: '1234' },
                        { cell: 'C1', value: 'Họ và tên cán bộ', bold: true, border: '1234' },
                        { cell: 'D1', value: 'Hình thức kỷ luật', bold: true, border: '1234' },
                        { cell: 'E1', value: 'Cấp quyết định', bold: true, border: '1234' },
                        { cell: 'F1', value: 'Bắt đầu', bold: true, border: '1234' },
                        { cell: 'G1', value: 'Kết thúc', bold: true, border: '1234' },
                        { cell: 'H1', value: 'Nội dung', bold: true, border: '1234' },
                        { cell: 'I1', value: 'Điểm thi đua', bold: true, border: '1234' },
                    ];
                    result.rows.forEach((item, index) => {
                        let hoTen = item.hoCanBo + ' ' + item.tenCanBo;
                        cells.push({ cell: 'A' + (index + 2), border: '1234', number: index + 1 });
                        cells.push({ cell: 'B' + (index + 2), border: '1234', value: item.maCanBo });
                        cells.push({ cell: 'C' + (index + 2), border: '1234', value: hoTen });
                        cells.push({ cell: 'D' + (index + 2), border: '1234', value: item.tenKyLuat });
                        cells.push({ cell: 'E' + (index + 2), border: '1234', value: item.capQuyetDinh });
                        cells.push({ cell: 'F' + (index + 2), alignment: 'center', border: '1234', value: item.batDau ? app.date.dateTimeFormat(new Date(item.batDau), item.batDauType ? item.batDauType : 'dd/mm/yyyy') : '' });
                        cells.push({ cell: 'G' + (index + 2), alignment: 'center', border: '1234', value: (item.ketThuc != null && item.ketThuc != -1) ? app.date.dateTimeFormat(new Date(item.ketThuc), item.ketThucType ? item.ketThucType : 'dd/mm/yyyy') : '' });
                        cells.push({ cell: 'H' + (index + 2), alignment: 'center', border: '1234', value: item.noiDung });
                        cells.push({ cell: 'I' + (index + 2), border: '1234', value: item.diemThiDua });
                    });
                    resolve(cells);
                }).then((cells) => {
                    app.excel.write(worksheet, cells);
                    app.excel.attachment(workbook, res, 'baohiemxahoi.xlsx');
                }).catch((error) => {
                    res.send({ error });
                });
            }
        });

    });

};