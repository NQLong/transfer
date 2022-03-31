module.exports = app => {
    const menu = {
        parentMenu: app.parentMenu.tccb,
        menus: {
            3005: { title: 'Quá trình khen thưởng', link: '/user/tccb/qua-trinh/khen-thuong-all', icon: 'fa-gift', backgroundColor: '#2559ba', groupIndex: 3 },
        },
    };

    const menuStaff = {
        parentMenu: app.parentMenu.user,
        menus: {
            1004: {
                title: 'Khen thưởng', link: '/user/khen-thuong-all', icon: 'fa-gift', color: '#000000',
                backgroundColor: '#ec91ba', groupIndex: 2
            },
        },
    };

    app.permission.add(
        { name: 'staff:login', menu: menuStaff },
        { name: 'qtKhenThuongAll:read', menu },
        { name: 'qtKhenThuongAll:write' },
        { name: 'qtKhenThuongAll:delete' },
    );
    app.get('/user/tccb/qua-trinh/khen-thuong-all', app.permission.check('qtKhenThuongAll:read'), app.templates.admin);
    app.get('/user/tccb/qua-trinh/khen-thuong-all/groupDt/:loaiDoiTuong/:ma', app.permission.check('qtKhenThuongAll:read'), app.templates.admin);
    app.get('/user/khen-thuong-all', app.permission.check('staff:login'), app.templates.admin);

    // APIs -----------------------------------------------------------------------------------------------------------------------------------------
    // //User Actions:
    app.post('/api/user/qua-trinh/khen-thuong-all', app.permission.check('staff:login'), (req, res) => {
        if (req.body.data && req.session.user) {
            const data = req.body.data;
            app.model.qtKhenThuongAll.create(data, (error, item) => res.send({ error, item }));
        } else {
            res.send({ error: 'Invalid parameter!' });
        }
    });

    app.put('/api/user/qua-trinh/khen-thuong-all', app.permission.check('staff:login'), (req, res) => {
        if (req.body.changes && req.session.user) {
            app.model.qtKhenThuongAll.get({ id: req.body.id }, (error, item) => {
                if (error || item == null) {
                    res.send({ error: 'Not found!' });
                } else {
                    app.model.canBo.get({ shcc: item.ma }, (e, r) => {
                        if (e || r == null) res.send({ error: 'Staff not found!' }); else {
                            const changes = req.body.changes;
                            app.model.qtKhenThuongAll.update({ id: req.body.id }, changes, (error, item) => res.send({ error, item }));
                        }
                    });
                }
            });
        } else {
            res.send({ error: 'Invalid parameter!' });
        }
    });

    app.delete('/api/user/qua-trinh/khen-thuong-all', app.permission.check('staff:login'), (req, res) => {
        if (req.session.user) {
            app.model.qtKhenThuongAll.get({ id: req.body.id }, (error, item) => {
                if (error || item == null) {
                    res.send({ error: 'Not found!' });
                } else {
                    app.model.canBo.get({ shcc: item.ma }, (e, r) => {
                        if (e || r == null) res.send({ error: 'Staff not found!' }); else {
                            app.model.qtKhenThuongAll.delete({ id: req.body.id }, (error, item) => res.send({ error, item }));
                        }
                    });
                }
            });
        } else {
            res.send({ error: 'Invalid parameter!' });
        }
    });

    app.get('/api/user/qua-trinh/khen-thuong-all/page/:pageNumber/:pageSize', app.permission.check('staff:login'), (req, res) => {
        const pageNumber = parseInt(req.params.pageNumber),
            pageSize = parseInt(req.params.pageSize),
            searchTerm = typeof req.query.condition === 'string' ? req.query.condition : '';
        const filter = JSON.stringify(req.query.filter || {});
        app.model.qtKhenThuongAll.searchPage(pageNumber, pageSize, filter, searchTerm, (error, page) => {
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

    app.get('/api/tccb/qua-trinh/khen-thuong-all/page/:pageNumber/:pageSize', app.permission.check('qtKhenThuongAll:read'), (req, res) => {
        const pageNumber = parseInt(req.params.pageNumber),
            pageSize = parseInt(req.params.pageSize),
            searchTerm = typeof req.query.condition === 'string' ? req.query.condition : '';
        const filter = JSON.stringify(req.query.filter || {});
        app.model.qtKhenThuongAll.searchPage(pageNumber, pageSize, filter, searchTerm, (error, page) => {
            if (error || page == null) {
                res.send({ error });
            } else {
                const { totalitem: totalItem, pagesize: pageSize, pagetotal: pageTotal, pagenumber: pageNumber, rows: list } = page;
                const pageCondition = searchTerm;
                res.send({ error, page: { totalItem, pageSize, pageTotal, pageNumber, pageCondition, list } });
            }
        });
    });

    app.get('/api/tccb/qua-trinh/khen-thuong-all/group/page/:pageNumber/:pageSize', app.permission.check('qtKhenThuongAll:read'), (req, res) => {
        const pageNumber = parseInt(req.params.pageNumber),
            pageSize = parseInt(req.params.pageSize),
            searchTerm = typeof req.query.condition === 'string' ? req.query.condition : '';
        const filter = JSON.stringify(req.query.filter || {});
        app.model.qtKhenThuongAll.groupPage(pageNumber, pageSize, filter, searchTerm, (error, page) => {
            if (error || page == null) {
                res.send({ error });
            } else {
                const { totalitem: totalItem, pagesize: pageSize, pagetotal: pageTotal, pagenumber: pageNumber, rows: list } = page;
                const pageCondition = searchTerm;
                res.send({ error, page: { totalItem, pageSize, pageTotal, pageNumber, pageCondition, list } });
            }
        });
    });
    app.get('/api/tccb/qua-trinh/khen-thuong-all/all', app.permission.check('qtKhenThuongAll:read'), (req, res) => {
        let condition = { statement: null };
        if (req.query.ma) {
            condition = {
                statement: 'ma = :searchText',
                parameter: { searchText: req.query.ma },
            };
        }
        app.model.qtKhenThuongAll.getAll(condition, (error, items) => res.send({ error, items }));
    });

    app.get('/api/tccb/qua-trinh/khen-thuong-all/item/:id', app.permission.check('qtKhenThuongAll:read'), (req, res) => {
        app.model.qtKhenThuongAll.get({ id: req.params.id }, (error, item) => res.send({ error, item }));
    });

    app.post('/api/tccb/qua-trinh/khen-thuong-all', app.permission.check('staff:write'), (req, res) => {
        app.model.qtKhenThuongAll.create(req.body.items, (error, item) => res.send({ error, item }));
    });

    app.put('/api/tccb/qua-trinh/khen-thuong-all', app.permission.check('staff:write'), (req, res) =>
        app.model.qtKhenThuongAll.update({ id: req.body.id }, req.body.changes, (error, item) => res.send({ error, item })));

    app.delete('/api/tccb/qua-trinh/khen-thuong-all', app.permission.check('staff:write'), (req, res) =>
        app.model.qtKhenThuongAll.delete({ id: req.body.id }, (error) => res.send(error)));

    app.get('/api/qua-trinh/khen-thuong-all/download-excel/:filter', app.permission.check('qtKhenThuongAll:read'), (req, res) => {
        app.model.qtKhenThuongAll.download(req.params.filter, (error, page) => {
            if (error) {
                res.send({ error });
            } else {
                const workbook = app.excel.create(),
                    worksheet = workbook.addWorksheet('Worksheet');
                new Promise(resolve => {
                    let cols = [];
                    cols = ['STT', 'SỐ QUYẾT ĐỊNH', 'LOẠI ĐỐI TƯỢNG', 'CÁ NHÂN', 'TẬP THỂ', 'NĂM ĐẠT ĐƯỢC', 'THÀNH TÍCH', 'CHÚ THÍCH', 'ĐIỂM THI ĐUA'];
                    let cells = [];
                    for (let idx = 0; idx < cols.length; idx++) {
                        let chr = String.fromCharCode(65 + idx); // where n is 0, 1, 2 ...                            
                        cells.push({ cell: chr + '1', value: cols[idx], bold: true, border: '1234' });
                    }
                    page.rows.forEach((item, index) => {
                        cells.push({ cell: 'A' + (index + 2), border: '1234', number: index + 1 });
                        for (let idx = 1; idx < cols.length; idx++) {
                            let chr = String.fromCharCode(65 + idx); // where n is 0, 1, 2 ...                            
                            let value = null;
                            let type = cols[idx];
                            if (type == 'SỐ QUYẾT ĐỊNH') value = item.soQuyetDinh;
                            if (type == 'LOẠI ĐỐI TƯỢNG') value = item.tenLoaiDoiTuong;
                            if (type == 'CÁ NHÂN') {
                                if (item.maLoaiDoiTuong == '02') value = item.hoCanBo + ' ' + item.tenCanBo + ' - ' + item.maCanBo;
                                if (item.maLoaiDoiTuong == '04') value = item.tenBoMon;
                            }
                            if (type == 'TẬP THỂ') {
                                if (item.maLoaiDoiTuong == '01') value = 'Trường Đai học Khoa học Xã Hội và Nhân Văn - Đại học Quốc Gia TP.HCM';
                                if (item.maLoaiDoiTuong == '02') value = item.tenDonViCanBo;
                                if (item.maLoaiDoiTuong == '03') value = item.tenDonVi;
                                if (item.maLoaiDoiTuong == '04') value = item.tenDonViBoMon;
                            }
                            if (type == 'NĂM ĐẠT ĐƯỢC') value = item.namDatDuoc;
                            if (type == 'THÀNH TÍCH') {
                                value = item.tenThanhTich;
                                if (item.tenChuThich) value += ' (' + item.tenChuThich + ')';
                            }
                            if (type == 'CHÚ THÍCH') value = item.tenChuThich;
                            if (type == 'ĐIỂM THI ĐUA') value = item.diemThiDua;
                            let add = {
                                cell: chr + (index + 2),
                                border: '1234',
                                value: value
                            };
                            cells.push(add);
                        }
                    });
                    resolve(cells);
                }).then((cells) => {
                    app.excel.write(worksheet, cells);
                    app.excel.attachment(workbook, res, 'khenthuong.xlsx');
                }).catch((error) => {
                    res.send({ error });
                });
            }
        });
    });
};
