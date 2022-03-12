module.exports = app => {
    const menu = {
        parentMenu: app.parentMenu.tccb,
        menus: {
            3045: { title: 'Quá trình hỗ trợ học phí', link: '/user/tccb/qua-trinh/ho-tro-hoc-phi', icon: 'fa fa-usd', backgroundColor: '#99ccff', groupIndex: 0 },
        },
    };
    const menuStaff = {
        parentMenu: app.parentMenu.user,
        menus: {
            1033: { title: 'Hỗ trợ học phí', link: '/user/ho-tro-hoc-phi', icon: 'fa fa-usd', color: '#000000', backgroundColor: '#6699ff', groupIndex: 4 },
        },
    };

    app.permission.add(
        { name: 'staff:login', menu: menuStaff },
        { name: 'qtHoTroHocPhi:read', menu },
        { name: 'qtHoTroHocPhi:write' },
        { name: 'qtHoTroHocPhi:delete' },
    );
    app.get('/user/tccb/qua-trinh/ho-tro-hoc-phi', app.permission.check('qtHoTroHocPhi:read'), app.templates.admin);
    app.get('/user/tccb/qua-trinh/ho-tro-hoc-phi/group/:shcc', app.permission.check('qtHoTroHocPhi:read'), app.templates.admin);
    app.get('/user/ho-tro-hoc-phi', app.permission.check('staff:login'), app.templates.admin);


    // APIs -----------------------------------------------------------------------------------------------------------------------------------------
    // //User Actions:
    app.post('/api/user/qua-trinh/ho-tro-hoc-phi', app.permission.check('staff:login'), (req, res) => {
        if (req.body.data && req.session.user) {
            const data = req.body.data;
            app.model.qtHoTroHocPhi.create(data, (error, item) => res.send({ error, item }));
        } else {
            res.send({ error: 'Invalid parameter!' });
        }
    });

    app.put('/api/user/qua-trinh/ho-tro-hoc-phi', app.permission.check('staff:login'), (req, res) => {
        if (req.body.changes && req.session.user) {
            app.model.qtHoTroHocPhi.get({ id: req.body.id }, (error, item) => {
                if (error || item == null) {
                    res.send({ error: 'Not found!' });
                } else {
                    app.model.canBo.get({ shcc: item.shcc }, (e, r) => {
                        if (e || r == null) res.send({ error: 'Staff not found!' }); else {
                            const changes = req.body.changes;
                            app.model.qtHoTroHocPhi.update({ id: req.body.id }, changes, (error, item) => res.send({ error, item }));
                        }
                    });
                }
            });
        } else {
            res.send({ error: 'Invalid parameter!' });
        }
    });

    app.delete('/api/user/qua-trinh/ho-tro-hoc-phi', app.permission.check('staff:login'), (req, res) => {
        if (req.session.user) {
            app.model.qtHoTroHocPhi.get({ id: req.body.id }, (error, item) => {
                if (error || item == null) {
                    res.send({ error: 'Not found!' });
                } else {
                    app.model.canBo.get({ shcc: item.shcc }, (e, r) => {
                        if (e || r == null) res.send({ error: 'Staff not found!' }); else {
                            app.model.qtHoTroHocPhi.delete({ id: req.body.id }, (error, item) => res.send({ error, item }));
                        }
                    });
                }
            });
        } else {
            res.send({ error: 'Invalid parameter!' });
        }
    });

    app.get('/api/user/qua-trinh/ho-tro-hoc-phi/page/:pageNumber/:pageSize', app.permission.check('staff:login'), (req, res) => {
        const pageNumber = parseInt(req.params.pageNumber),
            pageSize = parseInt(req.params.pageSize),
            searchTerm = typeof req.query.condition === 'string' ? req.query.condition : '';
        const { fromYear, toYear, list_shcc, list_dv, timeType, tinhTrang, loaiHocVi } = (req.query.filter && req.query.filter != '%%%%%%%%') ? req.query.filter : { fromYear: null, toYear: null, list_shcc: null, list_dv: null, timeType: 0, tinhTrang: null, loaiHocVi: null };
        app.model.qtHoTroHocPhi.searchPage(pageNumber, pageSize, list_shcc, list_dv, fromYear, toYear, timeType, tinhTrang, loaiHocVi, searchTerm, (error, page) => {
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

    app.get('/api/tccb/qua-trinh/ho-tro-hoc-phi/page/:pageNumber/:pageSize', app.permission.check('qtHoTroHocPhi:read'), (req, res) => {
        const pageNumber = parseInt(req.params.pageNumber),
            pageSize = parseInt(req.params.pageSize),
            searchTerm = typeof req.query.condition === 'string' ? req.query.condition : '';
        const { fromYear, toYear, list_shcc, list_dv, timeType, tinhTrang, loaiHocVi } = (req.query.filter && req.query.filter != '%%%%%%%%%%') ? req.query.filter : { fromYear: null, toYear: null, list_shcc: null, list_dv: null, timeType: 0, tinhTrang: null, loaiHocVi: null };
        app.model.qtHoTroHocPhi.searchPage(pageNumber, pageSize, list_shcc, list_dv, fromYear, toYear, timeType, tinhTrang, loaiHocVi, searchTerm, (error, page) => {
            if (error || page == null) {
                res.send({ error });
            } else {
                const { totalitem: totalItem, pagesize: pageSize, pagetotal: pageTotal, pagenumber: pageNumber, rows: list } = page;
                const pageCondition = searchTerm;
                res.send({ error, page: { totalItem, pageSize, pageTotal, pageNumber, pageCondition, list } });
            }
        });
    });

    app.get('/api/tccb/qua-trinh/ho-tro-hoc-phi/group/page/:pageNumber/:pageSize', app.permission.check('qtHoTroHocPhi:read'), (req, res) => {
        const pageNumber = parseInt(req.params.pageNumber),
            pageSize = parseInt(req.params.pageSize),
            searchTerm = typeof req.query.condition === 'string' ? req.query.condition : '';
        const { fromYear, toYear, list_shcc, list_dv, timeType, tinhTrang, loaiHocVi } = (req.query.filter && req.query.filter != '%%%%%%%%%%') ? req.query.filter : { fromYear: null, toYear: null, list_shcc: null, list_dv: null, timeType: 0, tinhTrang: null, loaiHocVi: null };
        app.model.qtHoTroHocPhi.groupPage(pageNumber, pageSize, list_shcc, list_dv, fromYear, toYear, timeType, tinhTrang, loaiHocVi, searchTerm, (error, page) => {
            if (error || page == null) {
                res.send({ error });
            } else {
                const { totalitem: totalItem, pagesize: pageSize, pagetotal: pageTotal, pagenumber: pageNumber, rows: list } = page;
                const pageCondition = searchTerm;
                res.send({ error, page: { totalItem, pageSize, pageTotal, pageNumber, pageCondition, list } });
            }
        });
    });
    app.post('/api/qua-trinh/ho-tro-hoc-phi', app.permission.check('staff:write'), (req, res) =>
        app.model.qtHoTroHocPhi.create(req.body.data, (error, item) => res.send({ error, item })));

    app.put('/api/qua-trinh/ho-tro-hoc-phi', app.permission.check('staff:write'), (req, res) =>
        app.model.qtHoTroHocPhi.update({ id: req.body.id }, req.body.changes, (error, item) => res.send({ error, item })));

    app.delete('/api/qua-trinh/ho-tro-hoc-phi', app.permission.check('staff:write'), (req, res) =>
        app.model.qtHoTroHocPhi.delete({ id: req.body.id }, (error) => res.send(error)));

    app.get('/api/qua-trinh/ho-tro-hoc-phi/download-excel/:list_shcc/:list_dv/:fromYear/:toYear/:timeType/:tinhTrang/:loaiHocVi', app.permission.check('qtHoTroHocPhi:read'), (req, res) => {
        let { list_shcc, list_dv, fromYear, toYear, timeType, tinhTrang, loaiHocVi } = req.params ? req.params : { list_shcc: null, list_dv: null, toYear: null, timeType: 0, tinhTrang: null, loaiHocVi: null };
        if (list_shcc == 'null') list_shcc = null;
        if (list_dv == 'null') list_dv = null;
        if (fromYear == 'null') fromYear = null;
        if (toYear == 'null') toYear = null;
        if (tinhTrang == 'null') tinhTrang = null;
        if (loaiHocVi == 'null') loaiHocVi = null;
        app.model.qtHoTroHocPhi.download(list_shcc, list_dv, fromYear, toYear, timeType, tinhTrang, loaiHocVi, (err, result) => {
            if (err || !result) {
                res.send({ err });
            } else {
                const workbook = app.excel.create(),
                    worksheet = workbook.addWorksheet('hotrohocphi');
                new Promise(resolve => {
                    let cells = [
                        // Table name: QT_HO_TRO_HOC_PHI { id, ngayLamDon, shcc, noiDung, coSoDaoTao, batDau, batDauType, ketThuc, ketThucType, hocKyHoTro, soTien, hoSo, ghiChu }
                        { cell: 'A1', value: 'STT', bold: true, border: '1234' },
                        { cell: 'B1', value: 'NGÀY QĐ', bold: true, border: '1234' },
                        { cell: 'C1', value: 'HỌ VÀ TÊN', bold: true, border: '1234' },
                        { cell: 'D1', value: 'ĐƠN VỊ', bold: true, border: '1234' },
                        { cell: 'E1', value: 'CHỨC DANH NGHỀ NGHIỆP', bold: true, border: '1234' },
                        { cell: 'F1', value: 'NỘI DUNG XIN HỖ TRỢ', bold: true, border: '1234' },
                        { cell: 'G1', value: 'CHUYÊN NGÀNH HỌC', bold: true, border: '1234' },
                        { cell: 'H1', value: 'CƠ SỞ ĐÀO TẠO', bold: true, border: '1234' },
                        { cell: 'I1', value: 'THỜI GIAN HỌC', bold: true, border: '1234' },
                        { cell: 'J1', value: 'HỌC KỲ HỖ TRỢ', bold: true, border: '1234' },
                        { cell: 'K1', value: 'SỐ TIỀN HỖ TRỢ (ĐỒNG)', bold: true, border: '1234' },
                        { cell: 'L1', value: 'HỒ SƠ ĐI KÈM', bold: true, border: '1234' },
                        { cell: 'M1', value: 'GHI CHÚ', bold: true, border: '1234' },
                    ];
                    result.rows.forEach((item, index) => {
                        let hoten = item.hoCanBo + ' ' + item.tenCanBo;
                        // hoten = hoten.normalizedName(); //failed
                        let timeRange = '';
                        if (item.batDau) {
                            timeRange += app.date.dateTimeFormat(new Date(item.batDau), item.batDauType ? item.batDauType : 'dd/mm/yyyy');
                        }
                        timeRange += ' - ';
                        if (item.ketThuc != null && item.ketThuc != -1) {
                            timeRange += app.date.dateTimeFormat(new Date(item.ketThuc), item.ketThucType ? item.ketThucType : 'dd/mm/yyyy');
                        }
                        cells.push({ cell: 'A' + (index + 2), border: '1234', number: index + 1 });
                        cells.push({ cell: 'B' + (index + 2), alignment: 'center', border: '1234', value: item.ngayLamDon ? app.date.dateTimeFormat(new Date(item.ngayLamDon), 'dd/mm/yyyy') : '' });
                        cells.push({ cell: 'C' + (index + 2), border: '1234', value: hoten });
                        cells.push({ cell: 'D' + (index + 2), border: '1234', value: item.tenDonVi });
                        cells.push({ cell: 'E' + (index + 2), border: '1234', value: item.tenChucDanhNgheNghiep });
                        cells.push({ cell: 'F' + (index + 2), border: '1234', value: item.noiDung });
                        cells.push({ cell: 'G' + (index + 2), border: '1234', value: item.tenChuyenNganh });
                        cells.push({ cell: 'H' + (index + 2), border: '1234', value: item.tenCoSoDaoTao });
                        cells.push({ cell: 'I' + (index + 2), border: '1234', value: timeRange });
                        cells.push({ cell: 'J' + (index + 2), border: '1234', value: item.hocKyHoTro });
                        cells.push({ cell: 'K' + (index + 2), border: '1234', value: item.soTien });
                        cells.push({ cell: 'L' + (index + 2), border: '1234', value: item.hoSo });
                        cells.push({ cell: 'M' + (index + 2), border: '1234', value: item.ghiChu });
                    });
                    resolve(cells);
                }).then((cells) => {
                    app.excel.write(worksheet, cells);
                    app.excel.attachment(workbook, res, 'hotrohocphi.xlsx');
                }).catch((error) => {
                    res.send({ error });
                });
            }
        });

    });
};