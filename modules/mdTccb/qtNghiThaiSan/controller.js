module.exports = app => {
    const menu = {
        parentMenu: app.parentMenu.tccb,
        menus: {
            3015: { title: 'Danh sách Nghỉ thai sản', link: '/user/tccb/qua-trinh/nghi-thai-san', icon: 'fa-bed', backgroundColor: '#515659', groupIndex: 4 },
        },
    };
    const menuStaff = {
        parentMenu: app.parentMenu.user,
        menus: {
            1013: { title: 'Nghỉ thai sản', link: '/user/nghi-thai-san', icon: 'fa-bed', backgroundColor: '#515659', groupIndex: 3 },
        },
    };

    app.permission.add(
        { name: 'staff:female', menu: menuStaff },
        { name: 'qtNghiThaiSan:read', menu },
        { name: 'qtNghiThaiSan:write' },
        { name: 'qtNghiThaiSan:delete' },
    );
    app.get('/user/tccb/qua-trinh/nghi-thai-san/group/:shcc', app.permission.check('qtNghiThaiSan:read'), app.templates.admin);
    app.get('/user/tccb/qua-trinh/nghi-thai-san', app.permission.check('qtNghiThaiSan:read'), app.templates.admin);
    app.get('/user/nghi-thai-san', app.permission.check('staff:female'), app.templates.admin);

    // APIs -----------------------------------------------------------------------------------------------------------------------------------------
    const checkGetStaffPermission = (req, res, next) => app.isDebug ? next() : app.permission.check('staff:login')(req, res, next);

    app.get('/api/qua-trinh/nghi-thai-san/page/:pageNumber/:pageSize', checkGetStaffPermission, (req, res) => {
        const pageNumber = parseInt(req.params.pageNumber),
            pageSize = parseInt(req.params.pageSize),
            searchTerm = typeof req.query.condition === 'string' ? req.query.condition : '';
        const { fromYear, toYear, listShcc, listDv, timeType, tinhTrang } = (req.query.filter && req.query.filter != '%%%%%%%%') ? req.query.filter : { fromYear: null, toYear: null, listShcc: null, listDv: null, timeType: 0, tinhTrang: null };
        app.model.qtNghiThaiSan.searchPage(pageNumber, pageSize, listShcc, listDv, fromYear, toYear, timeType, tinhTrang, searchTerm, (error, page) => {
            if (error || page == null) {
                res.send({ error });
            } else {
                const { totalitem: totalItem, pagesize: pageSize, pagetotal: pageTotal, pagenumber: pageNumber, rows: list } = page;
                const pageCondition = searchTerm;
                res.send({ error, page: { totalItem, pageSize, pageTotal, pageNumber, pageCondition, list } });
            }
        });
    });

    app.get('/api/tccb/qua-trinh/nghi-thai-san/group/page/:pageNumber/:pageSize', app.permission.check('qtNghiThaiSan:read'), (req, res) => {
        const pageNumber = parseInt(req.params.pageNumber),
            pageSize = parseInt(req.params.pageSize),
            searchTerm = typeof req.query.condition === 'string' ? req.query.condition : '';
        const { fromYear, toYear, listShcc, listDv, timeType, tinhTrang } = (req.query.filter && req.query.filter != '%%%%%%%%%%') ? req.query.filter : { fromYear: null, toYear: null, listShcc: null, listDv: null, timeType: 0, tinhTrang: null };
        app.model.qtNghiThaiSan.groupPage(pageNumber, pageSize, listShcc, listDv, fromYear, toYear, timeType, tinhTrang, searchTerm, (error, page) => {
            if (error || page == null) {
                res.send({ error });
            } else {
                const { totalitem: totalItem, pagesize: pageSize, pagetotal: pageTotal, pagenumber: pageNumber, rows: list } = page;
                const pageCondition = searchTerm;
                res.send({ error, page: { totalItem, pageSize, pageTotal, pageNumber, pageCondition, list } });
            }
        });
    });

    app.get('/api/qua-trinh/nghi-thai-san/all', checkGetStaffPermission, (req, res) => {
        app.model.qtNghiThaiSan.getAll((error, items) => res.send({ error, items }));
    });

    app.post('/api/qua-trinh/nghi-thai-san', app.permission.check('qtNghiThaiSan:write'), (req, res) => {
        app.model.qtNghiThaiSan.create(req.body.data, (error, item) => {
            app.tccbSaveCRUD(req.session.user.email, 'C', 'Nghỉ thai sản');
            res.send({ error, item });
        });
    });

    app.put('/api/qua-trinh/nghi-thai-san', app.permission.check('qtNghiThaiSan:write'), (req, res) => {
        app.model.qtNghiThaiSan.update({ id: req.body.id }, req.body.changes, (error, item) => {
            app.tccbSaveCRUD(req.session.user.email, 'U', 'Nghỉ thai sản');
            res.send({ error, item });
        });
    });
    app.delete('/api/qua-trinh/nghi-thai-san', app.permission.check('qtNghiThaiSan:delete'), (req, res) => {
        app.model.qtNghiThaiSan.delete({ id: req.body.id }, (error) => {
            app.tccbSaveCRUD(req.session.user.email, 'D', 'Nghỉ thai sản');
            res.send({ error });
        });
    });

    // //User Actions:
    app.post('/api/user/qua-trinh/nghi-thai-san', app.permission.check('staff:female'), (req, res) => {
        if (req.body.data && req.session.user) {
            const data = req.body.data;
            app.model.qtNghiThaiSan.create(data, (error, item) => res.send({ error, item }));
        } else {
            res.send({ error: 'Invalid parameter!' });
        }
    });

    app.put('/api/user/qua-trinh/nghi-thai-san', app.permission.check('staff:female'), (req, res) => {
        if (req.body.changes && req.session.user) {
            app.model.qtNghiThaiSan.get({ id: req.body.id }, (error, item) => {
                if (error || item == null) {
                    res.send({ error: 'Not found!' });
                } else {
                    app.model.canBo.get({ shcc: item.shcc }, (e, r) => {
                        if (e || r == null) res.send({ error: 'Staff not found!' }); else {
                            const changes = req.body.changes;
                            app.model.qtNghiThaiSan.update({ id: req.body.id }, changes, (error, item) => res.send({ error, item }));
                        }
                    });
                }
            });
        } else {
            res.send({ error: 'Invalid parameter!' });
        }
    });

    app.delete('/api/user/qua-trinh/nghi-thai-san', app.permission.check('staff:female'), (req, res) => {
        if (req.session.user) {
            app.model.qtNghiThaiSan.get({ id: req.body.id }, (error, item) => {
                if (error || item == null) {
                    res.send({ error: 'Not found!' });
                } else {
                    app.model.canBo.get({ shcc: item.shcc }, (e, r) => {
                        if (e || r == null) res.send({ error: 'Staff not found!' }); else {
                            app.model.qtNghiThaiSan.delete({ id: req.body.id }, (error, item) => res.send({ error, item }));
                        }
                    });
                }
            });
        } else {
            res.send({ error: 'Invalid parameter!' });
        }
    });

    app.get('/api/user/qua-trinh/nghi-thai-san/page/:pageNumber/:pageSize', app.permission.check('staff:female'), (req, res) => {
        const pageNumber = parseInt(req.params.pageNumber),
            pageSize = parseInt(req.params.pageSize),
            searchTerm = typeof req.query.condition === 'string' ? req.query.condition : '';
        const { fromYear, toYear, listShcc, listDv, timeType, tinhTrang } = (req.query.filter && req.query.filter != '%%%%%%%%') ? req.query.filter : { fromYear: null, toYear: null, listShcc: null, listDv: null, timeType: 0, tinhTrang: null };
        app.model.qtNghiThaiSan.searchPage(pageNumber, pageSize, listShcc, listDv, fromYear, toYear, timeType, tinhTrang, searchTerm, (error, page) => {
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
    app.get('/api/qua-trinh/nghi-thai-san/download-excel/:listShcc/:listDv/:fromYear/:toYear/:timeType/:tinhTrang', app.permission.check('qtNghiThaiSan:read'), (req, res) => {
        let { listShcc, listDv, fromYear, toYear, timeType, tinhTrang } = req.params ? req.params : { listShcc: null, listDv: null, toYear: null, timeType: 0, tinhTrang: null };
        if (listShcc == 'null') listShcc = null;
        if (listDv == 'null') listDv = null;
        if (fromYear == 'null') fromYear = null;
        if (toYear == 'null') toYear = null;
        if (tinhTrang == 'null') tinhTrang = null;
        app.model.qtNghiThaiSan.download(listShcc, listDv, fromYear, toYear, timeType, tinhTrang, (error, result) => {
            if (error || !result) {
                res.send({ error });
            } else {
                const workbook = app.excel.create(),
                    worksheet = workbook.addWorksheet('nghithaisan');
                new Promise(resolve => {
                    let cells = [
                        // Table name: QT_NGHI_THAI_SAN { id, shcc, batDau, batDauType, ketThuc, ketThucType, noiDung, troLaiCongTac }
                        { cell: 'A1', value: 'STT', bold: true, border: '1234' },
                        { cell: 'B1', value: 'HỌC VỊ', bold: true, border: '1234' },
                        { cell: 'C1', value: 'MÃ THẺ CÁN BỘ', bold: true, border: '1234' },
                        { cell: 'D1', value: 'HỌ', bold: true, border: '1234' },
                        { cell: 'E1', value: 'TÊN', bold: true, border: '1234' },
                        { cell: 'F1', value: 'CHỨC VỤ', bold: true, border: '1234' },
                        { cell: 'G1', value: 'ĐƠN VỊ', bold: true, border: '1234' },
                        { cell: 'H1', value: 'TỪ NGÀY', bold: true, border: '1234' },
                        { cell: 'I1', value: 'ĐẾN NGÀY', bold: true, border: '1234' },
                        { cell: 'J1', value: 'NỘI DUNG', bold: true, border: '1234' },
                        { cell: 'K1', value: 'NGÀY TRỞ LẠI CÔNG TÁC', bold: true, border: '1234' },
                    ];
                    result.rows.forEach((item, index) => {
                        cells.push({ cell: 'A' + (index + 2), border: '1234', number: index + 1 });
                        cells.push({ cell: 'B' + (index + 2), border: '1234', value: item.tenHocVi });
                        cells.push({ cell: 'C' + (index + 2), border: '1234', value: item.shcc });
                        cells.push({ cell: 'D' + (index + 2), border: '1234', value: item.hoCanBo });
                        cells.push({ cell: 'E' + (index + 2), border: '1234', value: item.tenCanBo });
                        cells.push({ cell: 'F' + (index + 2), border: '1234', value: item.tenChucVu });
                        cells.push({ cell: 'G' + (index + 2), border: '1234', value: item.tenDonVi });
                        cells.push({ cell: 'H' + (index + 2), alignment: 'center', border: '1234', value: item.batDau ? app.date.dateTimeFormat(new Date(item.batDau), item.batDauType ? item.batDauType : 'dd/mm/yyyy') : '' });
                        cells.push({ cell: 'I' + (index + 2), alignment: 'center', border: '1234', value: (item.ketThuc != null && item.ketThuc != -1) ? app.date.dateTimeFormat(new Date(item.ketThuc), item.ketThucType ? item.ketThucType : 'dd/mm/yyyy') : '' });
                        cells.push({ cell: 'J' + (index + 2), border: '1234', value: item.noiDung });
                        cells.push({ cell: 'K' + (index + 2), alignment: 'center', border: '1234', value: item.troLaiCongTac ? app.date.dateTimeFormat(new Date(item.troLaiCongTac), 'dd/mm/yyyy') : '' });
                    });
                    resolve(cells);
                }).then((cells) => {
                    app.excel.write(worksheet, cells);
                    app.excel.attachment(workbook, res, 'nghithaisan.xlsx');
                }).catch((error) => {
                    res.send({ error });
                });
            }
        });
    });
};