module.exports = app => {
    const menu = {
        parentMenu: app.parentMenu.tccb,
        menus: {
            3041: { title: 'Danh sách Nghỉ phép', link: '/user/tccb/qua-trinh/nghi-phep', icon: 'fa fa-pause', color: '#000000', backgroundColor: '#e6e48a', groupIndex: 4 },
        },
    };
    const menuStaff = {
        parentMenu: app.parentMenu.user,
        menus: {
            1026: { title: 'Nghỉ phép', link: '/user/nghi-phep', icon: 'fa fa-pause', backgroundColor: '#322f01', groupIndex: 3 },
        },
    };

    app.permission.add(
        { name: 'staff:login', menu: menuStaff },
        { name: 'qtNghiPhep:read', menu },
        { name: 'qtNghiPhep:write' },
        { name: 'qtNghiPhep:delete' },
    );
    app.get('/user/tccb/qua-trinh/nghi-phep', app.permission.check('qtNghiPhep:read'), app.templates.admin);
    app.get('/user/tccb/qua-trinh/nghi-phep/group/:shcc', app.permission.check('qtNghiPhep:read'), app.templates.admin);
    app.get('/user/nghi-phep', app.permission.check('staff:login'), app.templates.admin);

    // APIs -----------------------------------------------------------------------------------------------------------------------------------------
    // //User Actions:
    app.post('/api/user/qua-trinh/nghi-phep', app.permission.check('staff:login'), (req, res) => {
        if (req.body.data && req.session.user) {
            const data = req.body.data;
            app.model.qtNghiPhep.create(data, (error, item) => res.send({ error, item }));
        } else {
            res.send({ error: 'Invalid parameter!' });
        }
    });

    app.put('/api/user/qua-trinh/nghi-phep', app.permission.check('staff:login'), (req, res) => {
        if (req.body.changes && req.session.user) {
            app.model.qtNghiPhep.get({ id: req.body.id }, (error, item) => {
                if (error || item == null) {
                    res.send({ error: 'Not found!' });
                } else {
                    app.model.canBo.get({ shcc: item.shcc }, (e, r) => {
                        if (e || r == null) res.send({ error: 'Staff not found!' }); else {
                            const changes = req.body.changes;
                            app.model.qtNghiPhep.update({ id: req.body.id }, changes, (error, item) => res.send({ error, item }));
                        }
                    });
                }
            });
        } else {
            res.send({ error: 'Invalid parameter!' });
        }
    });

    app.delete('/api/user/qua-trinh/nghi-phep', app.permission.check('staff:login'), (req, res) => {
        if (req.session.user) {
            app.model.qtNghiPhep.get({ id: req.body.id }, (error, item) => {
                if (error || item == null) {
                    res.send({ error: 'Not found!' });
                } else {
                    app.model.canBo.get({ shcc: item.shcc }, (e, r) => {
                        if (e || r == null) res.send({ error: 'Staff not found!' }); else {
                            app.model.qtNghiPhep.delete({ id: req.body.id }, (error, item) => res.send({ error, item }));
                        }
                    });
                }
            });
        } else {
            res.send({ error: 'Invalid parameter!' });
        }
    });

    app.get('/api/user/qua-trinh/nghi-phep/page/:pageNumber/:pageSize', app.permission.check('staff:login'), (req, res) => {
        const pageNumber = parseInt(req.params.pageNumber),
            pageSize = parseInt(req.params.pageSize),
            searchTerm = typeof req.query.condition === 'string' ? req.query.condition : '';
        const filter = app.stringify(req.query.filter);
        app.model.qtNghiPhep.searchPage(pageNumber, pageSize, filter, searchTerm, (error, page) => {
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
    
    app.get('/api/tccb/qua-trinh/nghi-phep/page/:pageNumber/:pageSize', app.permission.check('qtNghiPhep:read'), (req, res) => {
        const pageNumber = parseInt(req.params.pageNumber),
            pageSize = parseInt(req.params.pageSize),
            searchTerm = typeof req.query.condition === 'string' ? req.query.condition : '';
        const filter = app.stringify(req.query.filter);
        app.model.qtNghiPhep.searchPage(pageNumber, pageSize, filter, searchTerm, (error, page) => {
            if (error || page == null) {
                res.send({ error });
            } else {
                const { totalitem: totalItem, pagesize: pageSize, pagetotal: pageTotal, pagenumber: pageNumber, rows: list } = page;
                const pageCondition = searchTerm;
                res.send({ error, page: { totalItem, pageSize, pageTotal, pageNumber, pageCondition, list } });
            }
        });
    });

    app.get('/api/tccb/qua-trinh/nghi-phep/group/page/:pageNumber/:pageSize', app.permission.check('qtNghiPhep:read'), (req, res) => {
        const pageNumber = parseInt(req.params.pageNumber),
            pageSize = parseInt(req.params.pageSize),
            searchTerm = typeof req.query.condition === 'string' ? req.query.condition : '';
        const filter = app.stringify(req.query.filter);
        app.model.qtNghiPhep.groupPage(pageNumber, pageSize, filter, searchTerm, (error, page) => {
            if (error || page == null) {
                res.send({ error });
            } else {
                const { totalitem: totalItem, pagesize: pageSize, pagetotal: pageTotal, pagenumber: pageNumber, rows: list } = page;
                const pageCondition = searchTerm;
                res.send({ error, page: { totalItem, pageSize, pageTotal, pageNumber, pageCondition, list } });
            }
        });
    });

    app.get('/api/tccb/qua-trinh/nghi-phep/all', app.permission.check('qtNghiPhep:read'), (req, res) => {
        let condition = { statement: null };
        if (req.query.shcc) {
            condition = {
                statement: 'shcc = :shcc',
                parameter: { shcc: req.query.shcc },
            };
        }
        app.model.qtNghiPhep.getAll(condition, (error, items) => res.send({ error, items }));
    });

    app.get('/api/user/qua-trinh/nghi-phep/all', app.permission.check('staff:login'), (req, res) => {
        let condition = { statement: null };
        if (req.query.shcc) {
            condition = {
                statement: 'shcc = :shcc',
                parameter: { shcc: req.query.shcc },
            };
        }
        app.model.qtNghiPhep.getAll(condition, (error, items) => res.send({ error, items }));
    });
    
    app.post('/api/qua-trinh/nghi-phep', app.permission.check('staff:write'), (req, res) =>
        app.model.qtNghiPhep.create(req.body.data, (error, item) => {
            app.tccbSaveCRUD(req.session.user.email, 'C', 'Nghỉ phép');
            res.send({ error, item });
        })
    );

    app.put('/api/qua-trinh/nghi-phep', app.permission.check('staff:write'), (req, res) =>
        app.model.qtNghiPhep.update({ id: req.body.id }, req.body.changes, (error, item) => {
            app.tccbSaveCRUD(req.session.user.email, 'U', 'Nghỉ phép');
            res.send({ error, item });
        })
    );

    app.delete('/api/qua-trinh/nghi-phep', app.permission.check('staff:write'), (req, res) =>
        app.model.qtNghiPhep.delete({ id: req.body.id }, (error) => {
            app.tccbSaveCRUD(req.session.user.email, 'D', 'Nghỉ phép');
            res.send(error);
        })
    );

    const calcSoNgayPhepConLai = (shcc, ngayBatDauCongTac, current, danhSachNgayLe, done) => {
        new Promise(resolve => {
            let result = 12 + current;
            if (ngayBatDauCongTac) { //+ thâm niên
                let thamnien = parseInt(app.monthDiff(new Date(ngayBatDauCongTac), new Date()) / 12 / 5);
                result += thamnien;
            }
            let currentYear = new Date().getFullYear();
            app.model.qtNghiPhep.getAll({
                statement: 'shcc = :shcc',
                parameter: shcc,
            }, (error, items) => {
                const solve = (idx = 0) => {
                    if (idx == items.length)  {
                        resolve(result);
                        return;
                    }
                    let year = new Date(items[idx].batDau).getFullYear();
                    if (year == currentYear) {
                        app.model.dmNghiPhep.get({ ma: items[idx].lyDo }, (error, itemNghiPhep ) => {
                            let value = Math.max(app.numberNgayNghi(new Date(items[idx].batDau), new Date(items[idx].ketThuc), danhSachNgayLe) - itemNghiPhep.soNgayPhep, 0);
                            result -= value;
                            solve(idx + 1);
                        });
                    }
                };
                solve();
            });
        }).then(data => {
            done && done(data);
        });
    };

    app.get('/api/qua-trinh/nghi-phep/download-excel/:filter', app.permission.check('qtNghiPhep:read'), (req, res) => {
        app.model.qtNghiPhep.downloadExcel(req.params.filter, (error, result) => {
            if (error || !result) {
                res.send({ error });
            } else {
                app.model.dmNgayLe.getAll({}, (error, items) => {
                    const danhSachNgayLe = (items || []).map(item => item.ngay);
                    const workbook = app.excel.create(), worksheet = workbook.addWorksheet('nghiphep');
                    new Promise(resolve => {
                        let cells = [
                            { cell: 'A1', value: '#', bold: true, border: '1234' },
                            { cell: 'B1', value: 'Học vị', bold: true, border: '1234' },
                            { cell: 'C1', value: 'Mã thẻ cán bộ', bold: true, border: '1234' },
                            { cell: 'D1', value: 'Họ', bold: true, border: '1234' },
                            { cell: 'E1', value: 'Tên', bold: true, border: '1234' },
                            { cell: 'F1', value: 'Chức vụ', bold: true, border: '1234' },
                            { cell: 'G1', value: 'Đơn vị', bold: true, border: '1234' },
                            { cell: 'H1', value: 'Lý do nghỉ', bold: true, border: '1234' },
                            { cell: 'I1', value: 'Nơi đến', bold: true, border: '1234' },
                            { cell: 'J1', value: 'Bắt đầu', bold: true, border: '1234' },
                            { cell: 'K1', value: 'Kết thúc',   bold: true, border: '1234' },
                            { cell: 'L1', value: 'Tổng ngày được nghỉ',   bold: true, border: '1234' },
                            { cell: 'M1', value: 'Số ngày xin nghỉ',   bold: true, border: '1234' },
                            { cell: 'N1', value: 'Số ngày tính phép',   bold: true, border: '1234' },
                            { cell: 'O1', value: 'Thâm niên',   bold: true, border: '1234' },
                        ];
                        const solve = (index = 0) => {
                            if (index == result.rows.length) {
                                resolve(cells);
                                return;
                            }
                            let item = result.rows[index];
                            calcSoNgayPhepConLai(item.shcc, item.ngayBatDauCongTac, item.ngayNghiPhep, danhSachNgayLe, soNgayPhepConLai => {
                                cells.push({ cell: 'A' + (index + 2), border: '1234', number: index + 1 });
                                cells.push({ cell: 'B' + (index + 2), border: '1234', value: item.tenHocVi });
                                cells.push({ cell: 'C' + (index + 2), border: '1234', value: item.shcc });
                                cells.push({ cell: 'D' + (index + 2), border: '1234', value: item.hoCanBo });
                                cells.push({ cell: 'E' + (index + 2), border: '1234', value: item.tenCanBo });
                                cells.push({ cell: 'F' + (index + 2), border: '1234', value: item.tenChucVu });
                                cells.push({ cell: 'G' + (index + 2), border: '1234', value: item.tenDonVi });
                                cells.push({ cell: 'H' + (index + 2), border: '1234', value: item.lyDo == '99' ? item.lyDoKhac : item.tenNghiPhep });
                                cells.push({ cell: 'I' + (index + 2), border: '1234', value: item.noiDen });
                                cells.push({ cell: 'J' + (index + 2), border: '1234', value: item.batDau ? app.date.dateTimeFormat(new Date(item.batDau), item.batDauType) : '' });
                                cells.push({ cell: 'K' + (index + 2), border: '1234', value: item.ketThuc ? app.date.dateTimeFormat(new Date(item.ketThuc), item.ketThucType) : '' });
                                cells.push({ cell: 'L' + (index + 2), border: '1234', value: soNgayPhepConLai });
                                cells.push({ cell: 'M' + (index + 2), border: '1234', value: app.numberNgayNghi(new Date(item.batDau), new Date(item.ketThuc), danhSachNgayLe) });
                                cells.push({ cell: 'N' + (index + 2), border: '1234', value: Math.max(app.numberNgayNghi(new Date(item.batDau), new Date(item.ketThuc), danhSachNgayLe) - item.ngayNghiPhep, 0) });
                                cells.push({ cell: 'O' + (index + 2), border: '1234', value: parseInt(app.monthDiff(new Date(item.ngayBatDauCongTac), new Date()) / 12 / 5) + 'tn' });
                                solve(index + 1);
                            });
                        };
                        solve();
                    }).then((cells) => {
                        app.excel.write(worksheet, cells);
                        app.excel.attachment(workbook, res, 'nghiphep.xlsx');
                    }).catch((error) => {
                        res.send({ error });
                    });
                });
            }
        });

    });

};