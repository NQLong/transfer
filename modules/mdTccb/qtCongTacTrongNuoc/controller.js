module.exports = app => {
    const menu = {
        parentMenu: app.parentMenu.tccb,
        menus: {
            3043: { title: 'Quá trình công tác trong nước', link: '/user/tccb/qua-trinh/cong-tac-trong-nuoc', icon: 'fa fa-pencil-square-o', color: '#000000', backgroundColor: '#fa0fd3', groupIndex: 1 },
        },
    };
    const menuStaff = {
        parentMenu: app.parentMenu.user,
        menus: {
            1032: { title: 'Công tác trong nước', link: '/user/cong-tac-trong-nuoc', icon: 'fa fa-pencil-square-o', backgroundColor: '#fa0fd3', groupIndex: 1 },
        },
    };

    app.permission.add(
        { name: 'staff:login', menu: menuStaff },
        { name: 'qtCongTacTrongNuoc:read', menu },
        { name: 'qtCongTacTrongNuoc:write' },
        { name: 'qtCongTacTrongNuoc:delete' },
    );
    app.get('/user/tccb/qua-trinh/cong-tac-trong-nuoc', app.permission.check('qtCongTacTrongNuoc:read'), app.templates.admin);
    app.get('/user/tccb/qua-trinh/cong-tac-trong-nuoc/group/:shcc', app.permission.check('qtCongTacTrongNuoc:read'), app.templates.admin);
    app.get('/user/cong-tac-trong-nuoc', app.permission.check('staff:login'), app.templates.admin);


    // APIs -----------------------------------------------------------------------------------------------------------------------------------------
    // //User Actions:
    app.post('/api/user/qua-trinh/cong-tac-trong-nuoc', app.permission.check('staff:login'), (req, res) => {
        if (req.body.data && req.session.user) {
            const data = req.body.data;
            app.model.qtCongTacTrongNuoc.create(data, (error, item) => res.send({ error, item }));
        } else {
            res.send({ error: 'Invalid parameter!' });
        }
    });

    app.put('/api/user/qua-trinh/cong-tac-trong-nuoc', app.permission.check('staff:login'), (req, res) => {
        if (req.body.changes && req.session.user) {
            app.model.qtCongTacTrongNuoc.get({ id: req.body.id }, (error, item) => {
                if (error || item == null) {
                    res.send({ error: 'Not found!' });
                } else {
                    app.model.canBo.get({ shcc: item.shcc }, (e, r) => {
                        if (e || r == null) res.send({ error: 'Staff not found!' }); else {
                            const changes = req.body.changes;
                            app.model.qtCongTacTrongNuoc.update({ id: req.body.id }, changes, (error, item) => res.send({ error, item }));
                        }
                    });
                }
            });
        } else {
            res.send({ error: 'Invalid parameter!' });
        }
    });

    app.delete('/api/user/qua-trinh/cong-tac-trong-nuoc', app.permission.check('staff:login'), (req, res) => {
        if (req.session.user) {
            app.model.qtCongTacTrongNuoc.get({ id: req.body.id }, (error, item) => {
                if (error || item == null) {
                    res.send({ error: 'Not found!' });
                } else {
                    app.model.canBo.get({ shcc: item.shcc }, (e, r) => {
                        if (e || r == null) res.send({ error: 'Staff not found!' }); else {
                            app.model.qtCongTacTrongNuoc.delete({ id: req.body.id }, (error, item) => res.send({ error, item }));
                        }
                    });
                }
            });
        } else {
            res.send({ error: 'Invalid parameter!' });
        }
    });

    app.get('/api/user/qua-trinh/cong-tac-trong-nuoc/page/:pageNumber/:pageSize', app.permission.check('staff:login'), (req, res) => {
        const pageNumber = parseInt(req.params.pageNumber),
            pageSize = parseInt(req.params.pageSize),
            searchTerm = typeof req.query.condition === 'string' ? req.query.condition : '';
        const { fromYear, toYear, list_shcc, list_dv, timeType, tinhTrang } = (req.query.filter && req.query.filter != '%%%%%%%%') ? req.query.filter : { fromYear: null, toYear: null, list_shcc: null, list_dv: null, timeType: 0, tinhTrang: null };
        app.model.qtCongTacTrongNuoc.searchPage(pageNumber, pageSize, list_shcc, list_dv, fromYear, toYear, timeType, tinhTrang, searchTerm, (error, page) => {
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

    app.get('/api/tccb/qua-trinh/cong-tac-trong-nuoc/page/:pageNumber/:pageSize', app.permission.check('qtCongTacTrongNuoc:read'), (req, res) => {
        const pageNumber = parseInt(req.params.pageNumber),
            pageSize = parseInt(req.params.pageSize),
            searchTerm = typeof req.query.condition === 'string' ? req.query.condition : '';
        const { fromYear, toYear, list_shcc, list_dv, timeType, tinhTrang } = (req.query.filter && req.query.filter != '%%%%%%%%%%') ? req.query.filter : { fromYear: null, toYear: null, list_shcc: null, list_dv: null, timeType: 0, tinhTrang: null };
        app.model.qtCongTacTrongNuoc.searchPage(pageNumber, pageSize, list_shcc, list_dv, fromYear, toYear, timeType, tinhTrang, searchTerm, (error, page) => {
            if (error || page == null) {
                res.send({ error });
            } else {
                const { totalitem: totalItem, pagesize: pageSize, pagetotal: pageTotal, pagenumber: pageNumber, rows: list } = page;
                const pageCondition = searchTerm;
                res.send({ error, page: { totalItem, pageSize, pageTotal, pageNumber, pageCondition, list } });
            }
        });
    });

    app.get('/api/tccb/qua-trinh/cong-tac-trong-nuoc/group/page/:pageNumber/:pageSize', app.permission.check('qtCongTacTrongNuoc:read'), (req, res) => {
        const pageNumber = parseInt(req.params.pageNumber),
            pageSize = parseInt(req.params.pageSize),
            searchTerm = typeof req.query.condition === 'string' ? req.query.condition : '';
        const { fromYear, toYear, list_shcc, list_dv, timeType, tinhTrang } = (req.query.filter && req.query.filter != '%%%%%%%%%%') ? req.query.filter : { fromYear: null, toYear: null, list_shcc: null, list_dv: null, timeType: 0, tinhTrang: null };
        app.model.qtCongTacTrongNuoc.groupPage(pageNumber, pageSize, list_shcc, list_dv, fromYear, toYear, timeType, tinhTrang, searchTerm, (error, page) => {
            if (error || page == null) {
                res.send({ error });
            } else {
                const { totalitem: totalItem, pagesize: pageSize, pagetotal: pageTotal, pagenumber: pageNumber, rows: list } = page;
                const pageCondition = searchTerm;
                res.send({ error, page: { totalItem, pageSize, pageTotal, pageNumber, pageCondition, list } });
            }
        });
    });
    app.post('/api/qua-trinh/cong-tac-trong-nuoc', app.permission.check('staff:write'), (req, res) =>
        app.model.qtCongTacTrongNuoc.create(req.body.data, (error, item) => res.send({ error, item })));

    app.put('/api/qua-trinh/cong-tac-trong-nuoc', app.permission.check('staff:write'), (req, res) =>
        app.model.qtCongTacTrongNuoc.update({ id: req.body.id }, req.body.changes, (error, item) => res.send({ error, item })));

    app.delete('/api/qua-trinh/cong-tac-trong-nuoc', app.permission.check('staff:write'), (req, res) =>
        app.model.qtCongTacTrongNuoc.delete({ id: req.body.id }, (error) => res.send(error)));

    app.get('/api/qua-trinh/cong-tac-trong-nuoc/download-excel/:list_shcc/:list_dv/:fromYear/:toYear/:timeType/:tinhTrang', app.permission.check('qtBaoHiemXaHoi:read'), (req, res) => {
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
                        { cell: 'D1', value: 'Chức vụ', bold: true, border: '1234' },
                        { cell: 'E1', value: 'Mức đóng', bold: true, border: '1234' },
                        { cell: 'F1', value: 'Phụ cấp chức vụ', bold: true, border: '1234' },
                        { cell: 'G1', value: 'Phụ cấp thâm niên vượt khung', bold: true, border: '1234' },
                        { cell: 'H1', value: 'Phụ cấp thâm niên nghề', bold: true, border: '1234' },
                        { cell: 'I1', value: 'Tỷ lệ đóng', bold: true, border: '1234' },
                        { cell: 'J1', value: 'Bắt đầu', bold: true, border: '1234' },
                        { cell: 'K1', value: 'Kết thúc', bold: true, border: '1234' },
                    ];
                    result.rows.forEach((item, index) => {
                        let hoTen = item.hoCanBo + ' ' + item.tenCanBo;
                        cells.push({ cell: 'A' + (index + 2), border: '1234', number: index + 1 });
                        cells.push({ cell: 'B' + (index + 2), border: '1234', value: item.shcc });
                        cells.push({ cell: 'C' + (index + 2), border: '1234', value: hoTen });
                        cells.push({ cell: 'D' + (index + 2), border: '1234', value: item.tenChucVu });
                        cells.push({ cell: 'E' + (index + 2), border: '1234', number: item.mucDong });
                        cells.push({ cell: 'F' + (index + 2), border: '1234', number: item.phuCapChucVu });
                        cells.push({ cell: 'G' + (index + 2), border: '1234', number: item.phuCapThamNienVuotKhung });
                        cells.push({ cell: 'H' + (index + 2), border: '1234', number: item.phuCapThamNienNghe });
                        cells.push({ cell: 'I' + (index + 2), border: '1234', number: item.tyLeDong });
                        cells.push({ cell: 'J' + (index + 2), alignment: 'center', border: '1234', value: item.batDau ? app.date.dateTimeFormat(new Date(item.batDau), item.batDauType ? item.batDauType : 'dd/mm/yyyy') : '' });
                        cells.push({ cell: 'K' + (index + 2), alignment: 'center', border: '1234', value: (item.ketThuc != null && item.ketThuc != -1) ? app.date.dateTimeFormat(new Date(item.ketThuc), item.ketThucType ? item.ketThucType : 'dd/mm/yyyy') : '' });
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