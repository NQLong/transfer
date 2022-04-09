function getKey(input) {
    if (!input.includes(':')) return null;
    return input.split(':')[0];
}

// source: https://en.wikipedia.org/wiki/Longest_common_subsequence_problem
function lcs(a, b) {
    let m = a.length, n = b.length, C = [], i, j;
    for (i = 0; i <= m; i++) C.push([0]);
    for (j = 0; j < n; j++) C[0].push(0);
    for (i = 0; i < m; i++)
        for (j = 0; j < n; j++)
            C[i + 1][j + 1] = a[i] === b[j] ? C[i][j] + 1 : Math.max(C[i + 1][j], C[i][j + 1]);
    return C[m][n];
}

function bestChoice(s, t) {
    if (!s || !t) return 0;
    let n = s.length, m = t.length, cost = -1;
    if (m < n) {
        cost = lcs(s, t);
    } else {
        let i;
        for (i = 0; i < m - n + 1; i++) {
            let subT = t.substring(i, i + n);
            cost = Math.max(cost, lcs(s, subT));
        }
    }
    return cost;
}

module.exports = app => {
    const menu = {
        parentMenu: app.parentMenu.tccb,
        menus: {
            3005: { title: 'Quá trình khen thưởng', link: '/user/tccb/qua-trinh/khen-thuong-all', icon: 'fa-gift', backgroundColor: '#2559ba', groupIndex: 3 }
        }
    };

    const menuStaff = {
        parentMenu: app.parentMenu.user,
        menus: {
            1004: {
                title: 'Khen thưởng', link: '/user/khen-thuong-all', icon: 'fa-gift', color: '#000000',
                backgroundColor: '#ec91ba', groupIndex: 2
            }
        }
    };

    app.permission.add(
        { name: 'staff:login', menu: menuStaff },
        { name: 'qtKhenThuongAll:read', menu },
        { name: 'qtKhenThuongAll:write' },
        { name: 'qtKhenThuongAll:delete' },
        { name: 'qtKhenThuongAll:upload' }
    );
    app.get('/user/tccb/qua-trinh/khen-thuong-all', app.permission.check('qtKhenThuongAll:read'), app.templates.admin);
    app.get('/user/tccb/qua-trinh/khen-thuong-all/upload', app.permission.check('qtKhenThuongAll:write'), app.templates.admin);
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
        const filter = app.stringify(req.query.filter);
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
        const filter = app.stringify(req.query.filter);
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
        const filter = app.stringify(req.query.filter);
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
                parameter: { searchText: req.query.ma }
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

    app.post('/api/tccb/qua-trinh/khen-thuong-all/multiple', app.permission.check('qtKhenThuongAll:write'), (req, res) => {
        const qtKhenThuongAll = req.body.qtKhenThuongAll, errorList = [];
        for (let i = 0; i <= qtKhenThuongAll.length; i++) {
            if (i == qtKhenThuongAll.length) {
                res.send({ error: errorList });
            } else {
                const item = qtKhenThuongAll[i];
                app.model.qtKhenThuongAll.create(item, (error) => {
                    if (error) errorList.push(error);
                });
            }
        }
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

    const khenThuongImportData = (fields, files, done) => {
        let worksheet = null;
        new Promise((resolve, reject) => {
            if (fields.userData && fields.userData[0] && fields.userData[0] == 'KhenThuongAllDataFile' && files.KhenThuongAllDataFile && files.KhenThuongAllDataFile.length) {
                const srcPath = files.KhenThuongAllDataFile[0].path;
                const workbook = app.excel.create();
                workbook.xlsx.readFile(srcPath).then(() => {
                    app.deleteFile(srcPath);
                    worksheet = workbook.getWorksheet(1);
                    worksheet ? resolve() : reject('File dữ liệu không hợp lệ!');
                });
            }
        }).then(() => {
            const pendingLoaiDoiTuong = new Promise(resolve => app.model.dmKhenThuongLoaiDoiTuong.getAll((error, items) => resolve((items || []).map(item => item.ma + ':' + item.ten))));
            const pendingThanhTich = new Promise(resolve => app.model.dmKhenThuongKyHieu.getAll((error, items) => resolve((items || []).map(item => item.ma + ':' + item.ten))));
            const pendingChuThich = new Promise(resolve => app.model.dmKhenThuongChuThich.getAll((error, items) => resolve((items || []).map(item => item.ma + ':' + item.ten))));
            Promise.all([pendingLoaiDoiTuong, pendingThanhTich, pendingChuThich])
                .then(([danhSachLoaiDoiTuong, danhSachThanhTich, danhSachChuThich]) => {
                    let items = [];
                    const solve = (index = 2) => {
                        let soQuyetDinh = (worksheet.getCell('A' + index).value || '').toString().trim();
                        let loaiDoiTuong = (worksheet.getCell('B' + index).value || '').toString().trim();
                        let shcc = (worksheet.getCell('C' + index).value || '').toString().trim();
                        let donVi = (worksheet.getCell('D' + index).value || '').toString().trim();
                        let boMon = (worksheet.getCell('E' + index).value || '').toString().trim();
                        let namDatDuoc = (worksheet.getCell('F' + index).value || '').toString().trim();
                        let thanhTich = (worksheet.getCell('G' + index).value || '').toString().trim();
                        let chuThich = (worksheet.getCell('H' + index).value || '').toString().trim();
                        let diemThiDua = (worksheet.getCell('I' + index).value || '').toString().trim();

                        loaiDoiTuong = getKey(loaiDoiTuong);
                        let maDonVi = getKey(donVi);
                        let maBoMon = getKey(boMon);
                        let maThanhTich = getKey(thanhTich);
                        let maChuThich = getKey(chuThich);
                        if (soQuyetDinh.length == 0) {
                            done({ items });
                            return;
                        }
                        if (namDatDuoc.length != 4) {
                            done({ error: `Sai định dạng cột năm đạt được ở dòng ${index}` });
                            return;
                        }
                        const pendingMaThanhTich = new Promise(resolve => { //find ma thanh tich
                            let ansMaThanhTich = null;
                            if (thanhTich != '') {
                                let bestScore = -1;
                                for (let idx = 0; idx < danhSachThanhTich.length; idx++) {
                                    let arr = danhSachThanhTich[idx].split(':');
                                    let ma = arr[0], ten = arr[1];
                                    if (ma == maThanhTich) {
                                        ansMaThanhTich = idx;
                                        break;
                                    }
                                    let score = bestChoice(thanhTich.toLowerCase(), ten.toLowerCase());
                                    if (score > bestScore) {
                                        bestScore = score;
                                        ansMaThanhTich = idx;
                                    }
                                }
                            }
                            resolve(ansMaThanhTich);
                        });
                        const pendingMaChuThich = new Promise(resolve => { ///find ma thanh tich chú thích
                            let ansMaChuThich = null;
                            if (chuThich != '') {
                                let bestScore = -1;
                                for (let idx = 0; idx < danhSachChuThich.length; idx++) {
                                    let arr = danhSachChuThich[idx].split(':');
                                    let ma = arr[0], ten = arr[1];
                                    if (ma == maChuThich) {
                                        ansMaChuThich = idx;
                                        break;
                                    }
                                    let score = bestChoice(chuThich.toLowerCase(), ten.toLowerCase());
                                    if (score > bestScore) {
                                        bestScore = score;
                                        ansMaChuThich = idx;
                                    }
                                }
                            }
                            resolve(ansMaChuThich);
                        });
                        const pendingMaLoaiDoiTuong = new Promise(resolve => { ///find mã loại đối tượng
                            let ansMaLoaiDoiTuong = '-1';
                            for (let idx = 0; idx < danhSachLoaiDoiTuong.length; idx++) {
                                let arr = danhSachLoaiDoiTuong[idx].split(':');
                                let ma = arr[0];
                                if (ma == loaiDoiTuong) {
                                    ansMaLoaiDoiTuong = idx;
                                    break;
                                }
                            }
                            resolve(ansMaLoaiDoiTuong);
                        });
                        Promise.all([pendingMaThanhTich, pendingMaChuThich, pendingMaLoaiDoiTuong])
                            .then(([ansMaThanhTich, ansMaChuThich, ansMaLoaiDoiTuong]) => {
                                let hoCanBo = '', tenCanBo = '', maCanBo = '', tenBoMon = '', tenDonViBoMon = '', tenDonViCanBo = '', tenDonVi = '';
                                if (ansMaLoaiDoiTuong == '-1') {
                                    done({ error: `Sai định dạng cột loại đối tượng ở dòng ${index}` });
                                    return;
                                }
                                if (ansMaThanhTich == null) {
                                    done({ error: `Dữ liệu cột thành tích bị trống ở dòng ${index}` });
                                    return;
                                }
                                if (loaiDoiTuong == '01') {
                                    items.push({
                                        soQuyetDinh, diemThiDua, ma: '-1', namDatDuoc,
                                        loaiDoiTuong, thanhTich: danhSachThanhTich[ansMaThanhTich].split(':')[0], chuThich: ansMaChuThich ? danhSachChuThich[ansMaChuThich].split(':')[0] : '',
                                        hoCanBo, tenCanBo, maCanBo, tenBoMon, tenDonViBoMon, tenDonViCanBo, tenDonVi,
                                        tenLoaiDoiTuong: danhSachLoaiDoiTuong[ansMaLoaiDoiTuong].split(':')[1],
                                        tenThanhTich: danhSachThanhTich[ansMaThanhTich].split(':')[1],
                                        tenChuThich: ansMaChuThich ? danhSachChuThich[ansMaChuThich].split(':')[1] : ''
                                    });
                                    solve(index + 1);
                                }
                                if (loaiDoiTuong == '02') {
                                    app.model.canBo.get({ shcc }, (error, item) => {
                                        if (error || item == null) {
                                            done({ error: `Sai định dạng cột cán bộ ở dòng ${index}` });
                                            return;
                                        } else {
                                            hoCanBo = item.ho;
                                            tenCanBo = item.ten;
                                            maCanBo = shcc;
                                            app.model.dmDonVi.get({ ma: item.maDonVi }, (error, itemDonVi) => {
                                                if (itemDonVi) tenDonViCanBo = itemDonVi.ten;
                                                items.push({
                                                    soQuyetDinh, diemThiDua, ma: shcc, namDatDuoc,
                                                    loaiDoiTuong, thanhTich: danhSachThanhTich[ansMaThanhTich].split(':')[0], chuThich: ansMaChuThich ? danhSachChuThich[ansMaChuThich].split(':')[0] : '',
                                                    hoCanBo, tenCanBo, maCanBo, tenBoMon, tenDonViBoMon, tenDonViCanBo, tenDonVi,
                                                    tenLoaiDoiTuong: danhSachLoaiDoiTuong[ansMaLoaiDoiTuong].split(':')[1],
                                                    tenThanhTich: danhSachThanhTich[ansMaThanhTich].split(':')[1],
                                                    tenChuThich: ansMaChuThich ? danhSachChuThich[ansMaChuThich].split(':')[1] : ''
                                                });
                                                solve(index + 1);
                                            });
                                        }
                                    });
                                }
                                if (loaiDoiTuong == '03') {
                                    app.model.dmDonVi.get({ ma: maDonVi }, (error, item) => {
                                        if (error || item == null) {
                                            done({ error: `Sai định dạng cột đơn vị ở dòng ${index}` });
                                        } else {
                                            tenDonVi = item.ten;
                                            items.push({
                                                soQuyetDinh, diemThiDua, ma: maDonVi, namDatDuoc,
                                                loaiDoiTuong, thanhTich: danhSachThanhTich[ansMaThanhTich].split(':')[0], chuThich: ansMaChuThich ? danhSachChuThich[ansMaChuThich].split(':')[0] : '',
                                                hoCanBo, tenCanBo, maCanBo, tenBoMon, tenDonViBoMon, tenDonViCanBo, tenDonVi,
                                                tenLoaiDoiTuong: danhSachLoaiDoiTuong[ansMaLoaiDoiTuong].split(':')[1],
                                                tenThanhTich: danhSachThanhTich[ansMaThanhTich].split(':')[1],
                                                tenChuThich: ansMaChuThich ? danhSachChuThich[ansMaChuThich].split(':')[1] : ''
                                            });
                                            solve(index + 1);
                                        }
                                    });
                                }
                                if (loaiDoiTuong == '04') {
                                    app.model.dmBoMon.get({ ma: maBoMon }, (error, item) => {
                                        if (error || item == null) {
                                            done({ error: `Sai định dạng cột bộ môn ở dòng ${index}` });
                                        } else {
                                            tenBoMon = item.ten;
                                            items.push({
                                                soQuyetDinh, diemThiDua, ma: maBoMon, namDatDuoc,
                                                loaiDoiTuong, thanhTich: danhSachThanhTich[ansMaThanhTich].split(':')[0], chuThich: ansMaChuThich ? danhSachChuThich[ansMaChuThich].split(':')[0] : '',
                                                hoCanBo, tenCanBo, maCanBo, tenBoMon, tenDonViBoMon, tenDonViCanBo, tenDonVi,
                                                tenLoaiDoiTuong: danhSachLoaiDoiTuong[ansMaLoaiDoiTuong].split(':')[1],
                                                tenThanhTich: danhSachThanhTich[ansMaThanhTich].split(':')[1],
                                                tenChuThich: ansMaChuThich ? danhSachChuThich[ansMaChuThich].split(':')[1] : ''
                                            });
                                            solve(index + 1);
                                        }
                                    });
                                }
                            }).catch(error => done({ error }));
                    };
                    solve();
                });
        }).catch(error => done({ error }));
    };

    app.uploadHooks.add('KhenThuongAllDataFile', (req, fields, files, params, done) =>
        app.permission.has(req, () => khenThuongImportData(fields, files, done), done, 'qtKhenThuongAll:write'));

    app.get('/api/qua-trinh/khen-thuong-all/download-template', app.permission.check('qtKhenThuongAll:write'), (req, res) => {
        const workBook = app.excel.create();
        const ws = workBook.addWorksheet('Khen_thuong_Template');
        const defaultColumns = [
            { header: 'SỐ QUYẾT ĐỊNH', key: 'soQuyetDinh', width: 15 },
            { header: 'LOẠI ĐỐI TƯỢNG', key: 'loaiDoiTuong', width: 20 },
            { header: 'CÁN BỘ', key: 'canBo', width: 15 },
            { header: 'ĐƠN VỊ', key: 'donVi', width: 40 },
            { header: 'BỘ MÔN', key: 'boMon', width: 60 },
            { header: 'NĂM ĐẠT ĐƯỢC', key: 'namDatDuoc', width: 15 },
            { header: 'THÀNH TÍCH', key: 'thanhTich', width: 30 },
            { header: 'CHÚ THÍCH', key: 'chuThich', width: 30 },
            { header: 'ĐIỂM THI ĐUA', key: 'diemThiDua', width: 15 }
        ];
        ws.columns = defaultColumns;
        ws.getRow(1).alignment = { ...ws.getRow(1).alignment, vertical: 'middle', horizontal: 'center' };
        const pendingLoaiDoiTuong = new Promise(resolve => app.model.dmKhenThuongLoaiDoiTuong.getAll({}, '*', 'ma', (error, items) => resolve((items || []).map(item => item.ma + ': ' + item.ten))));
        const pendingBoMon = new Promise(resolve => app.model.dmBoMon.getAll({}, '*', 'ma', (error, items) => {
            let data = [];
            const traverse = (idx = 0) => {
                if (idx == items.length) {
                    resolve(data);
                    return;
                }
                app.model.dmDonVi.get({ ma: items[idx].maDv }, (error, itemDonVi) => {
                    data.push(items[idx].ma + ': ' + items[idx].ten + ' - ' + 'Khoa ' + itemDonVi.ten);
                    traverse(idx + 1);
                });
            };
            traverse();
        }));
        const pendingDonVi = new Promise(resolve => app.model.dmDonVi.getAll({}, '*', 'ma', (error, items) => resolve((items || []).map(item => item.ma + ': ' + item.ten))));
        const pendingThanhTich = new Promise(resolve => app.model.dmKhenThuongKyHieu.getAll((error, items) => resolve((items || []).map(item => item.ma + ': ' + item.ten))));
        const pendingChuThich = new Promise(resolve => app.model.dmKhenThuongChuThich.getAll((error, items) => resolve((items || []).map(item => item.ma + ': ' + item.ten))));
        Promise.all([pendingLoaiDoiTuong, pendingBoMon, pendingDonVi, pendingThanhTich, pendingChuThich])
            .then(([danhSachLoaiDoiTuong, danhSachBoMon, danhSachDonVi, danhSachThanhTich, danhSachChuThich]) => {
                const rows = ws.getRows(2, 1000);
                const { dataRange: loaiDoiTuongRange } = workBook.createRefSheet('KHEN_THUONG_LOAI_DOI_TUONG', danhSachLoaiDoiTuong);
                const { dataRange: donViRange } = workBook.createRefSheet('DON_VI', danhSachDonVi);
                const { dataRange: boMonRange } = workBook.createRefSheet('BO_MON', danhSachBoMon);
                const { dataRange: thanhTichRange } = workBook.createRefSheet('KHEN_THUONG_THANH_TICH', danhSachThanhTich);
                const { dataRange: chuThichRange } = workBook.createRefSheet('KHEN_THUONG_CHU_THICH', danhSachChuThich);
                rows.forEach((row) => {
                    row.getCell('loaiDoiTuong').dataValidation = { type: 'list', allowBlank: true, formulae: [loaiDoiTuongRange] };
                    row.getCell('donVi').dataValidation = { type: 'list', allowBlank: true, formulae: [donViRange] };
                    row.getCell('boMon').dataValidation = { type: 'list', allowBlank: true, formulae: [boMonRange] };
                    row.getCell('thanhTich').dataValidation = { type: 'list', allowBlank: true, formulae: [thanhTichRange] };
                    row.getCell('chuThich').dataValidation = { type: 'list', allowBlank: true, formulae: [chuThichRange] };
                });
                app.excel.attachment(workBook, res, 'Khen_thuong_Template.xlsx');
            });
    });
};
