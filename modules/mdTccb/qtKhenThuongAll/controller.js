module.exports = app => {
    const menu = {
        parentMenu: app.parentMenu.tccb,
        menus: {
            3005: { title: 'Quá trình khen thưởng', link: '/user/tccb/qua-trinh/khen-thuong-all', icon: 'fa-gift', backgroundColor: '#2559ba', groupIndex: 2 },
        },
    };
    app.permission.add(
        { name: 'staff:login', menu: { parentMenu: { index: 1000, title: 'Thông tin cá nhân', icon: 'fa-user', link: '/user' } }, },
        { name: 'qtKhenThuongAll:read', menu },
        { name: 'qtKhenThuongAll:write' },
        { name: 'qtKhenThuongAll:delete' },
    );
    app.get('/user/tccb/qua-trinh/khen-thuong-all/:id', app.permission.check('qtKhenThuongAll:read'), app.templates.admin);
    app.get('/user/tccb/qua-trinh/khen-thuong-all', app.permission.check('qtKhenThuongAll:read'), app.templates.admin);
    app.get('/user/tccb/qua-trinh/khen-thuong-all/group_dt/:loaiDoiTuong/:ma', app.permission.check('qtKhenThuongAll:read'), app.templates.admin);

    // APIs -----------------------------------------------------------------------------------------------------------------------------------------
    app.get('/api/tccb/qua-trinh/khen-thuong-all/page/:loaiDoiTuong/:pageNumber/:pageSize', app.permission.check('qtKhenThuongAll:read'), (req, res) => {
        const pageNumber = parseInt(req.params.pageNumber),
            pageSize = parseInt(req.params.pageSize),
            loaiDoiTuong = req.params.loaiDoiTuong,
            searchTerm = typeof req.query.condition === 'string' ? req.query.condition : '';
        app.model.qtKhenThuongAll.searchPage(pageNumber, pageSize, loaiDoiTuong, searchTerm, (error, page) => {
            if (error || page == null) {
                res.send({ error });
            } else {
                const { totalitem: totalItem, pagesize: pageSize, pagetotal: pageTotal, pagenumber: pageNumber, rows: list } = page;
                res.send({ error, page: { totalItem, pageSize, pageTotal, pageNumber, list } });
            }
        });
    });

    app.get('/api/tccb/qua-trinh/khen-thuong-all/group/page/:loaiDoiTuong/:pageNumber/:pageSize', app.permission.check('qtKhenThuongAll:read'), (req, res) => {
        const pageNumber = parseInt(req.params.pageNumber),
            pageSize = parseInt(req.params.pageSize),
            loaiDoiTuong = req.params.loaiDoiTuong,
            searchTerm = typeof req.query.condition === 'string' ? req.query.condition : '';
        app.model.qtKhenThuongAll.groupPage(pageNumber, pageSize, loaiDoiTuong, searchTerm, (error, page) => {
            if (error || page == null) {
                res.send({ error });
            } else {
                const { totalitem: totalItem, pagesize: pageSize, pagetotal: pageTotal, pagenumber: pageNumber, rows: list } = page;
                res.send({ error, page: { totalItem, pageSize, pageTotal, pageNumber, list } });
            }
        });
    });
    app.get('/api/tccb/qua-trinh/khen-thuong-all/group_dt/page/:loaiDoiTuong/:pageNumber/:pageSize', app.permission.check('qtKhenThuongAll:read'), (req, res) => {
        const pageNumber = parseInt(req.params.pageNumber),
            pageSize = parseInt(req.params.pageSize),
            loaiDoiTuong = req.params.loaiDoiTuong,
            searchTerm = typeof req.query.condition === 'string' ? req.query.condition : '';
        app.model.qtKhenThuongAll.groupPageMa(pageNumber, pageSize, loaiDoiTuong, searchTerm, (error, page) => {
            if (error || page == null) {
                res.send({ error });
            } else {
                const { totalitem: totalItem, pagesize: pageSize, pagetotal: pageTotal, pagenumber: pageNumber, rows: list } = page;
                res.send({ error, page: { totalItem, pageSize, pageTotal, pageNumber, list } });
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

    app.get('/api/tccb/qua-trinh/khen-thuong-all/download-excel/:loaiDoiTuong/:maDoiTuong', app.permission.check('qtKhenThuongAll:read'), (req, res) => {
        const pageNumber = 0,
            pageSize = 1000000,
            loaiDoiTuong = req.params.loaiDoiTuong,
            maDoiTuong = req.params.maDoiTuong;
        // console.log("Get ", loaiDoiTuong, ' + ', maDoiTuong);
        app.model.qtKhenThuongAll.downloadExcel(pageNumber, pageSize, loaiDoiTuong, maDoiTuong, (error, page) => {
            // console.log("Page = ", page);
            if (error) {
                res.send({ error });
            } else {
                const workbook = app.excel.create(),
                    worksheet = workbook.addWorksheet('Worksheet');
                new Promise(resolve => {
                    let cols = [];
                    if (loaiDoiTuong == '-1') {
                        cols = ['STT', 'LOẠI ĐỐI TƯỢNG', 'ĐỐI TƯỢNG', 'NĂM ĐẠT ĐƯỢC', 'THÀNH TÍCH', 'CHÚ THÍCH', 'ĐIỂM THI ĐUA'];
                    }
                    if (loaiDoiTuong == '01') {
                        cols = ['STT', 'NĂM ĐẠT ĐƯỢC', 'THÀNH TÍCH', 'CHÚ THÍCH', 'ĐIỂM THI ĐUA'];
                    }
                    if (loaiDoiTuong == '02') {
                        cols = ['STT', 'SHCC', 'HỌ', 'TÊN', 'NĂM ĐẠT ĐƯỢC', 'THÀNH TÍCH', 'CHÚ THÍCH', 'ĐIỂM THI ĐUA'];
                    }
                    if (loaiDoiTuong == '03' || loaiDoiTuong == '04') {
                        cols = ['STT', 'ĐƠN VỊ', 'BỘ MÔN', 'NĂM ĐẠT ĐƯỢC', 'THÀNH TÍCH', 'CHÚ THÍCH', 'ĐIỂM THI ĐUA'];
                    }
                    let cells = [];
                    for (let idx = 0; idx < cols.length; idx++) {
                        let chr = String.fromCharCode(65 + idx); // where n is 0, 1, 2 ...                            
                        cells.push({cell: chr + '1', value: cols[idx], bold: true, border: '1234'});
                    }
                    page.rows.forEach((item, index) => {
                        // console.log("item = ", item);
                        cells.push({ cell: 'A' + (index + 2), border: '1234', number: index + 1 });
                        for (let idx = 1; idx < cols.length; idx++) {
                            let chr = String.fromCharCode(65 + idx); // where n is 0, 1, 2 ...                            
                            let value = null;
                            let type = cols[idx];
                            if (type == 'LOẠI ĐỐI TƯỢNG') value = item.tenLoaiDoiTuong;
                            if (type == 'ĐỐI TƯỢNG') {
                                if (item.maLoaiDoiTuong == '01') {
                                    value = 'Trường Đai học Khoa học Xã Hội và Nhân Văn - Đại học Quốc Gia TP.HCM';
                                }
                                if (item.maLoaiDoiTuong == '02') {
                                    value = item.hoCanBo + ' ' + item.tenCanBo + ' - ' + item.maCanBo;
                                }
                                if (item.maLoaiDoiTuong == '03') {
                                    value = item.tenDonVi;
                                }
                                if (item.maLoaiDoiTuong == '04') {
                                    value = item.tenBoMon + ' (' + item.tenDonViBoMon + ')';
                                }
                            }
                            if (type == 'SHCC') value = item.ma;
                            if (type == 'HỌ') value = item.hoCanBo;
                            if (type == 'TÊN') value = item.tenCanBo;
                            if (type == 'ĐƠN VỊ') {
                                if (loaiDoiTuong == '03') value = item.tenDonVi;
                                if (loaiDoiTuong == '04') value = item.tenDonViBoMon;
                            }
                            if (type == 'BỘ MÔN') value = item.tenBoMon;
                            if (type == 'NĂM ĐẠT ĐƯỢC') value = item.namDatDuoc;
                            if (type == 'THÀNH TÍCH') value = item.tenThanhTich;
                            if (type == 'CHÚ THÍCH') value = item.tenChuThich;
                            if (type == 'ĐIỂM THI ĐUA') value = item.diemThiDua;
                            let add = {
                                cell: chr + (index + 2),
                                border: '1234',
                                value: value
                            };
                            // console.log("Add = ", type, add);
                            cells.push(add);
                        }
                    });
                    resolve(cells);
                }).then((cells) => {
                    // console.log("Cells = ", cells);
                    app.excel.write(worksheet, cells);
                    // app.excel.attachment(workbook, res, 'khenthuong.xlsx');
                    // if (loaiDoiTuong == '') app.excel.attachment(workbook, res, 'khenthuong.xlsx');
                    let name = 'khen_thuong';
                    if (loaiDoiTuong == '-1') {
                        name += '_all';
                    }
                    else {
                        if (loaiDoiTuong == '01') {
                            name += '_truong';
                        }
                        else {
                            if (loaiDoiTuong == '02') name += '_canbo_';
                            if (loaiDoiTuong == '03') name += '_donvi_';
                            if (loaiDoiTuong == '04') name += '_bomon_';
                            if (maDoiTuong == '-1') name += 'all';
                            else name += maDoiTuong;
                        }
                    }
                    name += '.xlsx';
                    app.excel.attachment(workbook, res, name);
                    // if (loaiDoiTuong == '01') app.excel.attachment(workbook, res, 'khenthuong-truong.xlsx');
                    // if (loaiDoiTuong == '02') app.excel.attachment(workbook, res, 'khenthuong-canbo-' + maDoiTuong + '.xlsx');
                    // if (loaiDoiTuong == '03') app.excel.attachment(workbook, res, 'khenthuong-donvi-' + maDoiTuong + '.xlsx');
                    // if (loaiDoiTuong == '04') app.excel.attachment(workbook, res, 'khenthuong-bomon-' + maDoiTuong + '.xlsx');
                }).catch((error) => {
                    res.send({ error });
                });
            }
        });
    });
};
