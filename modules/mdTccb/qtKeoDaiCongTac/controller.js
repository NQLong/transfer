module.exports = app => {
    const menu = {
        parentMenu: app.parentMenu.tccb,
        menus: {
            3035: { title: 'Quá trình kéo dài công tác', link: '/user/tccb/qua-trinh/keo-dai-cong-tac', icon: 'fa-hourglass-start', backgroundColor: '#C68C2A', groupIndex: 1 },
        },
    };
    const menuStaff = {
        parentMenu: app.parentMenu.user,
        menus: {
            // 1005: { title: 'Kéo dài công tác', link: '/user/keo-dai-cong-tac', icon: 'fa-hourglass-start', color: '#000000', backgroundColor: '#eab676', groupIndex: 1 },
        },
    };

    app.permission.add(
        { name: 'doctor:login', menu: menuStaff },
        { name: 'qtKeoDaiCongTac:read', menu },
        { name: 'qtKeoDaiCongTac:write' },
        { name: 'qtKeoDaiCongTac:delete' },
    );

    app.get('/user/tccb/qua-trinh/keo-dai-cong-tac/create-list', app.permission.check('qtKeoDaiCongTac:read'), app.templates.admin);
    app.get('/user/tccb/qua-trinh/keo-dai-cong-tac', app.permission.check('qtKeoDaiCongTac:read'), app.templates.admin);
    app.get('/user/tccb/qua-trinh/keo-dai-cong-tac/:shcc', app.permission.check('qtKeoDaiCongTac:read'), app.templates.admin);
    app.get('/user/keo-dai-cong-tac', app.permission.check('doctor:login'), app.templates.admin);

    // APIs -----------------------------------------------------------------------------------------------------------------------------------------
    // //User Actions:
    app.post('/api/user/qua-trinh/keo-dai-cong-tac', app.permission.check('doctor:login'), (req, res) => {
        if (req.body.data && req.session.user) {
            const data = req.body.data;
            app.model.qtKeoDaiCongTac.create(data, (error, item) => res.send({ error, item }));
        } else {
            res.send({ error: 'Invalid parameter!' });
        }
    });

    app.put('/api/user/qua-trinh/keo-dai-cong-tac', app.permission.check('doctor:login'), (req, res) => {
        if (req.body.changes && req.session.user) {
            app.model.qtKeoDaiCongTac.get({ id: req.body.id }, (error, item) => {
                if (error || item == null) {
                    res.send({ error: 'Not found!' });
                } else {
                    app.model.canBo.get({ shcc: item.shcc }, (e, r) => {
                        if (e || r == null) res.send({ error: 'Staff not found!' }); else {
                            const changes = req.body.changes;
                            app.model.qtKeoDaiCongTac.update({ id: req.body.id }, changes, (error, item) => res.send({ error, item }));
                        }
                    });
                }
            });
        } else {
            res.send({ error: 'Invalid parameter!' });
        }
    });

    app.delete('/api/user/qua-trinh/keo-dai-cong-tac', app.permission.check('doctor:login'), (req, res) => {
        if (req.session.user) {
            app.model.qtKeoDaiCongTac.get({ id: req.body.id }, (error, item) => {
                if (error || item == null) {
                    res.send({ error: 'Not found!' });
                } else {
                    app.model.canBo.get({ shcc: item.shcc }, (e, r) => {
                        if (e || r == null) res.send({ error: 'Staff not found!' }); else {
                            app.model.qtKeoDaiCongTac.delete({ id: req.body.id }, (error, item) => res.send({ error, item }));
                        }
                    });
                }
            });
        } else {
            res.send({ error: 'Invalid parameter!' });
        }
    });

    app.get('/api/user/qua-trinh/keo-dai-cong-tac/page/:pageNumber/:pageSize', app.permission.check('doctor:login'), (req, res) => {
        const pageNumber = parseInt(req.params.pageNumber),
            pageSize = parseInt(req.params.pageSize),
            searchTerm = typeof req.query.condition === 'string' ? req.query.condition : '';
        const filter = app.stringify(req.query.filter);
        app.model.qtKeoDaiCongTac.searchPage(pageNumber, pageSize, filter, searchTerm, (error, page) => {
            if (error || page == null) {
                res.send({ error });
            } else {
                let rows = page.rows;
                const solve = (index = 0) => {
                    if (index >= rows.length) {
                        const { totalitem: totalItem, pagesize: pageSize, pagetotal: pageTotal, pagenumber: pageNumber } = page;
                        const list = rows;
                        const pageCondition = searchTerm;
                        res.send({ error, page: { totalItem, pageSize, pageTotal, pageNumber, pageCondition, list } });
                        return;
                    }
                    const item = rows[index];
                    app.model.dmNghiHuu.getTuoiNghiHuu({ phai: item.phai, ngaySinh: new Date(item.ngaySinh) }, (error, itemNghiHuu) => {
                        if (itemNghiHuu) {
                            rows[index].ngayNghiHuu = new Date(itemNghiHuu.resultDate).getTime();
                        }
                        solve(index + 1);
                    });
                };
                solve();
            }
        });
    });
    ///END USER ACTIONS

    app.get('/api/tccb/qua-trinh/keo-dai-cong-tac/page/:pageNumber/:pageSize', app.permission.check('qtKeoDaiCongTac:read'), (req, res) => {
        const pageNumber = parseInt(req.params.pageNumber),
            pageSize = parseInt(req.params.pageSize),
            searchTerm = typeof req.query.condition === 'string' ? req.query.condition : '';
        const filter = app.stringify(req.query.filter);
        app.model.qtKeoDaiCongTac.searchPage(pageNumber, pageSize, filter, searchTerm, (error, page) => {
            if (error || page == null) {
                res.send({ error });
            } else {
                let rows = page.rows;
                const solve = (index = 0) => {
                    if (index >= rows.length) {
                        const { totalitem: totalItem, pagesize: pageSize, pagetotal: pageTotal, pagenumber: pageNumber } = page;
                        const list = rows;
                        const pageCondition = searchTerm;
                        res.send({ error, page: { totalItem, pageSize, pageTotal, pageNumber, pageCondition, list } });
                        return;
                    }
                    const item = rows[index];
                    app.model.dmNghiHuu.getTuoiNghiHuu({ phai: item.phai, ngaySinh: new Date(item.ngaySinh) }, (error, itemNghiHuu) => {
                        if (itemNghiHuu) {
                            rows[index].ngayNghiHuu = new Date(itemNghiHuu.resultDate).getTime();
                        }
                        solve(index + 1);
                    });
                };
                solve();
            }
        });
    });

    app.get('/api/tccb/qua-trinh/keo-dai-cong-tac/group/page/:pageNumber/:pageSize', app.permission.check('qtKeoDaiCongTac:read'), (req, res) => {
        const pageNumber = parseInt(req.params.pageNumber),
            pageSize = parseInt(req.params.pageSize),
            searchTerm = typeof req.query.condition === 'string' ? req.query.condition : '';
        const filter = app.stringify(req.query.filter);
        app.model.qtKeoDaiCongTac.groupPage(pageNumber, pageSize, filter, searchTerm, (error, page) => {
            if (error || page == null) {
                res.send({ error });
            } else {
                let rows = page.rows;
                const solve = (index = 0) => {
                    if (index >= rows.length) {
                        const { totalitem: totalItem, pagesize: pageSize, pagetotal: pageTotal, pagenumber: pageNumber } = page;
                        const list = rows;
                        const pageCondition = searchTerm;
                        res.send({ error, page: { totalItem, pageSize, pageTotal, pageNumber, pageCondition, list } });
                        return;
                    }
                    const item = rows[index];
                    app.model.dmNghiHuu.getTuoiNghiHuu({ phai: item.phai, ngaySinh: new Date(item.ngaySinh) }, (error, itemNghiHuu) => {
                        if (itemNghiHuu) {
                            rows[index].ngayNghiHuu = new Date(itemNghiHuu.resultDate).getTime();
                        }
                        solve(index + 1);
                    });
                };
                solve();
            }
        });
    });
    app.post('/api/tccb/qua-trinh/keo-dai-cong-tac', app.permission.check('qtKeoDaiCongTac:write'), (req, res) => {
        app.model.qtKeoDaiCongTac.create(req.body.data, (error, item) => {
            app.tccbSaveCRUD(req.session.user.email, 'C', 'Kéo dài công tác');
            res.send({ error, item });
        });
    });

    app.put('/api/tccb/qua-trinh/keo-dai-cong-tac', app.permission.check('qtKeoDaiCongTac:write'), (req, res) => {
        app.model.qtKeoDaiCongTac.update({ id: req.body.id }, req.body.changes, (error, item) => {
            app.tccbSaveCRUD(req.session.user.email, 'U', 'Kéo dài công tác');
            res.send({ error, item });
        });
    });
    app.delete('/api/tccb/qua-trinh/keo-dai-cong-tac', app.permission.check('qtKeoDaiCongTac:write'), (req, res) => {
        app.model.qtKeoDaiCongTac.delete({ id: req.body.id }, (error) => {
            app.tccbSaveCRUD(req.session.user.email, 'D', 'Kéo dài công tác');
            res.send({ error });
        });
    });

    app.post('/api/tccb/qua-trinh/keo-dai-cong-tac/multiple', app.permission.check('qtKeoDaiCongTac:write'), (req, res) => {
        const listData = req.body.listData, errorList = [];
        const solve = (index = 0) => {
            if (index == listData.length) {
                res.send({ error: errorList });
                return;
            }
            const item = listData[index];
            const data = {
                shcc: item.shcc,
                batDau: item.batDau,
                batDauType: item.batDauType,
                ketThuc: item.ketThuc,
                ketThucType: item.ketThucType,
            };
            app.model.qtKeoDaiCongTac.create(data, (error) => {
                if (error) errorList.push(error);
                solve(index + 1);
            });
        };
        solve();
    });

    app.get('/api/tccb/qua-trinh/keo-dai-cong-tac/get-list-year', app.permission.check('qtKeoDaiCongTac:read'), (req, res) => {
        const yearCalc = req.query.year;
        const firstYear = new Date(yearCalc, 0, 1, 0, 0, 0, 0);
        const endYear = new Date(yearCalc, 11, 31, 23, 59, 59, 999);
        // 1419120000000 = 45 * 365 * 24 * 3600 * 10000 (45 năm)
        // bắt buộc phải là giảng viên có trình độ tiến sĩ trở lên
        app.model.canBo.getAll({
            statement: '(ngayNghi IS NULL) AND (ngaySinh IS NULL OR ngaySinh + 1419120000000 <= :year) AND (ngach IN (\'V.07.01.03\', \'15.109\', \'15.110\', \'V.07.01.01\', \'V.07.01.02\', \'15.111\')) AND (hocVi IN (\'01\', \'02\') OR chucDanh IN (\'01\', \'02\'))',
            parameter: { year: endYear.getTime() }
        }, '*', 'ten,ho', (error, data) => {
            if (error) {
                res.send({ error, items: null });
                return;
            }
            let items = [];
            const solve = (index = 0) => {
                if (index >= data.length) {
                    res.send({ error: null, items });
                    return;
                }
                const item = data[index];
                app.model.dmNghiHuu.getTuoiNghiHuu({ phai: item.phai, ngaySinh: new Date(item.ngaySinh) }, (error, data) => {
                    if (data) {
                        let canExtend = item.chucDanh == '01' ? 10 : item.chucDanh == '02' ? 7 : (item.hocVi == '01' || item.hocVi == '02') ? 5 : 0;
                        let start = new Date(data.resultDate);
                        let end = new Date(data.prevResultDate);
                        end.setFullYear(end.getFullYear() + canExtend);
                        if (start.getFullYear() < yearCalc) start = firstYear;

                        if (data.resultDate.getFullYear() <= yearCalc && end.getFullYear() >= yearCalc) {
                            if (end.getFullYear() > yearCalc) end = endYear;

                            let tenChucDanh = '', tenHocVi = '', tenChucDanhNgheNghiep = '', tenChucVu = '', tenDonVi = '';
                            app.model.dmChucDanhKhoaHoc.get({ ma: item.chucDanh }, (error, itemCD) => {
                                app.model.dmTrinhDo.get({ ma: item.hocVi }, (error, itemHV) => {
                                    app.model.dmNgachCdnn.get({ ma: item.ngach }, (error, itemCDNN) => {
                                        app.model.qtChucVu.get({ shcc: item.shcc, chucVuChinh: 1 }, (error, itemCV) => {
                                            app.model.dmChucVu.get({ ma: itemCV?.maChucVu || '' }, (error, chucVu) => {
                                                app.model.dmDonVi.get({ ma: item.maDonVi }, (error, itemDV) => {
                                                    if (itemCD) tenChucDanh = itemCD.ten;
                                                    if (itemHV) tenHocVi = itemHV.ten;
                                                    if (itemCDNN) tenChucDanhNgheNghiep = itemCDNN.ten;
                                                    if (chucVu) tenChucVu = chucVu.ten;
                                                    if (itemDV) tenDonVi = itemDV.ten;

                                                    let dataAdd = {
                                                        shcc: item.shcc,
                                                        hoCanBo: item.ho,
                                                        tenCanBo: item.ten,
                                                        tenChucDanh,
                                                        tenHocVi,
                                                        tenChucVu,
                                                        tenDonVi,
                                                        tenChucDanhNgheNghiep,
                                                        batDau: start.getTime(),
                                                        ketThuc: end.getTime(),
                                                        batDauType: 'dd/mm/yyyy',
                                                        ketThucType: 'dd/mm/yyyy',
                                                        ngayNghiHuu: data.resultDate,
                                                        ngaySinh: item.ngaySinh,
                                                        phai: item.phai,
                                                    };
                                                    items.push(dataAdd);
                                                    solve(index + 1);
                                                });
                                            });

                                        });
                                    });
                                });
                            });
                        } else solve(index + 1);
                    } else solve(index + 1);
                });
            };
            solve();
        });
    });

    app.put('/api/tccb/qua-trinh/keo-dai-cong-tac/update-quyet-dinh', app.permission.check('qtKeoDaiCongTac:write'), (req, res) => {
        const items = req.body.items, errorList = [];
        const solve = (index = 0) => {
            if (index == items.length) {
                res.send({ error: errorList });
                return;
            }
            const item = items[index];
            const data = {
                shcc: item.shcc,
                batDau: item.batDau,
                batDauType: item.batDauType,
                ketThuc: item.ketThuc,
                ketThucType: item.ketThucType,
                soQuyetDinh: item.soQuyetDinh,
                ngayQuyetDinh: item.ngayQuyetDinh,
            };
            app.model.qtKeoDaiCongTac.update({ id: item.id }, data, (error) => {
                if (error) errorList.push(error);
                solve(index + 1);
            });
        };
        solve();
    });

    app.get('/api/tccb/qua-trinh/keo-dai-cong-tac/download-excel-all', app.permission.check('qtKeoDaiCongTac:read'), (req, res) => {
        const searchTerm = typeof req.query.condition === 'string' ? req.query.condition : '';
        const filter = app.stringify(req.query.filter);
        app.model.qtKeoDaiCongTac.download(filter, searchTerm, (error, page) => {
            if (error || page == null) {
                res.send({ error });
            } else {
                res.send({ error, items: page.rows });
            }
        });
    });

    app.get('/api/tccb/qua-trinh/keo-dai-cong-tac/download-excel/:filter/:searchTerm', app.permission.check('qtKeoDaiCongTac:read'), (req, res) => {
        let searchTerm = req.params.searchTerm;
        if (searchTerm == 'null') searchTerm = '';
        app.model.qtKeoDaiCongTac.download(req.params.filter, searchTerm, (err, result) => {
            if (err || !result) {
                res.send({ error: err });
            } else {
                const workbook = app.excel.create(),
                    worksheet = workbook.addWorksheet('KEO DAI CONG TAC');
                new Promise(resolve => {
                    let cells = [
                        // Table name: QT_KEO_DAI_CONG_TAC { id, batDau, batDauType, ketThuc, ketThucType, soQuyetDinh, shcc, ho, ten, ngayQuyetDinh }

                        { cell: 'A1', value: 'STT', bold: true, border: '1234' },
                        { cell: 'B1', value: 'Số quyết định', bold: true, border: '1234' },
                        { cell: 'C1', value: 'Ngày quyết định', bold: true, border: '1234' },
                        { cell: 'D1', value: 'Mã thẻ cán bộ', bold: true, border: '1234' },
                        { cell: 'E1', value: 'Họ và tên', bold: true, border: '1234' },
                        { cell: 'F1', value: 'Nam', bold: true, border: '1234' },
                        { cell: 'G1', value: 'Nữ', bold: true, border: '1234' },
                        { cell: 'H1', value: 'Chức danh GS, PGS', bold: true, border: '1234' },
                        { cell: 'I1', value: 'Trình độ chuyên môn', bold: true, border: '1234' },
                        { cell: 'J1', value: 'Chức danh nghề nghiệp', bold: true, border: '1234' },
                        { cell: 'K1', value: 'Chức vụ', bold: true, border: '1234' },
                        { cell: 'L1', value: 'Đơn vị công tác', bold: true, border: '1234' },
                        { cell: 'M1', value: 'Từ ngày', bold: true, border: '1234' },
                        { cell: 'N1', value: 'Đến ngày', bold: true, border: '1234' },
                    ];
                    result.rows.forEach((item, index) => {
                        let hoTenCb = (item.hoCanBo ? item.hoCanBo.normalizedName() : '') + ' ' + (item.tenCanBo ? item.tenCanBo.normalizedName() : '');
                        let gioiTinhNam = item.phai == '01' && item.ngaySinh ? app.date.dateTimeFormat(new Date(item.ngaySinh), 'dd/mm/yyyy') : '';
                        let gioiTinhNu = item.phai == '02' && item.ngaySinh ? app.date.dateTimeFormat(new Date(item.ngaySinh), 'dd/mm/yyyy') : '';
                        let chucDanh = item.tenChucDanh ? item.tenChucDanh.getFirstLetters() + '.' : '';
                        let hocVi = item.tenHocVi ? item.tenHocVi.getFirstLetters() : '';

                        cells.push({ cell: 'A' + (index + 2), border: '1234', number: index + 1 });
                        cells.push({ cell: 'B' + (index + 2), border: '1234', value: item.soQuyetDinh });
                        cells.push({ cell: 'C' + (index + 2), alignment: 'center', border: '1234', value: item.ngayQuyetDinh ? app.date.dateTimeFormat(new Date(item.ngayQuyetDinh), 'dd/mm/yyyy') : '' });
                        cells.push({ cell: 'D' + (index + 2), border: '1234', value: item.shcc });
                        cells.push({ cell: 'E' + (index + 2), border: '1234', value: hoTenCb });
                        cells.push({ cell: 'F' + (index + 2), border: '1234', value: gioiTinhNam });
                        cells.push({ cell: 'G' + (index + 2), border: '1234', value: gioiTinhNu });
                        cells.push({ cell: 'H' + (index + 2), border: '1234', value: chucDanh });
                        cells.push({ cell: 'I' + (index + 2), border: '1234', value: hocVi });
                        cells.push({ cell: 'J' + (index + 2), border: '1234', value: item.tenChucDanhNgheNghiep });
                        cells.push({ cell: 'K' + (index + 2), border: '1234', value: item.tenChucVu });
                        cells.push({ cell: 'L' + (index + 2), border: '1234', value: item.tenDonVi });
                        cells.push({ cell: 'M' + (index + 2), alignment: 'center', border: '1234', value: item.batDau ? app.date.dateTimeFormat(new Date(item.batDau), item.batDauType ? item.batDauType : 'dd/mm/yyyy') : '' });
                        cells.push({ cell: 'N' + (index + 2), alignment: 'center', border: '1234', value: item.ketThuc ? app.date.dateTimeFormat(new Date(item.ketThuc), item.ketThucType ? item.ketThucType : 'dd/mm/yyyy') : '' });
                    });
                    resolve(cells);
                }).then((cells) => {
                    app.excel.write(worksheet, cells);
                    app.excel.attachment(workbook, res, 'KEO DAI CONG TAC.xlsx');
                }).catch((error) => {
                    res.send({ error });
                });
            }
        });
    });
};