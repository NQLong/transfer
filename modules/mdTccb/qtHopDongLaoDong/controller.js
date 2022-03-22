module.exports = app => {
    const menu = {
        parentMenu: app.parentMenu.tccb,
        menus: {
            3007: { title: 'Hợp đồng lao động', link: '/user/tccb/qua-trinh/hop-dong-lao-dong', icon: 'fa-briefcase', backgroundColor: '#1a76b8', groupIndex: 2 },
        },
    };
    app.permission.add(
        { name: 'qtHopDongLaoDong:read', menu },
        { name: 'qtHopDongLaoDong:write' },
        { name: 'qtHopDongLaoDong:delete' },
    );
    app.get('/user/tccb/qua-trinh/hop-dong-lao-dong/:ma', app.permission.check('qtHopDongLaoDong:read'), app.templates.admin);
    app.get('/user/tccb/qua-trinh/hop-dong-lao-dong', app.permission.check('qtHopDongLaoDong:read'), app.templates.admin);
    app.get('/user/tccb/qua-trinh/hop-dong-lao-dong/group/:shcc', app.permission.check('qtHopDongLaoDong:read'), app.templates.admin);

    // APIs -----------------------------------------------------------------------------------------------------------------------------------------
    const checkGetStaffPermission = (req, res, next) => app.isDebug ? next() : app.permission.check('staff:login')(req, res, next);

    app.get('/api/tccb/qua-trinh/hop-dong-lao-dong/page/:pageNumber/:pageSize', app.permission.check('qtHopDongLaoDong:read'), (req, res) => {
        const pageNumber = parseInt(req.params.pageNumber),
            pageSize = parseInt(req.params.pageSize),
            searchTerm = typeof req.query.condition === 'string' ? req.query.condition : '';
        const { fromYear, toYear, listShcc, listDv } = (req.query.filter && req.query.filter != '%%%%%%%%') ? req.query.filter : { fromYear: null, toYear: null, listShcc: null, listDv: null };
        app.model.qtHopDongLaoDong.searchPage(pageNumber, pageSize, listShcc, listDv, fromYear, toYear, searchTerm, (error, page) => {
            if (error || page == null) {
                res.send({ error });
            } else {
                const { totalitem: totalItem, pagesize: pageSize, pagetotal: pageTotal, pagenumber: pageNumber, rows: list } = page;
                const pageCondition = searchTerm;
                res.send({ error, page: { totalItem, pageSize, pageTotal, pageNumber, pageCondition, list } });
            }
        });
    });

    app.get('/api/tccb/qua-trinh/hop-dong-lao-dong/group/page/:pageNumber/:pageSize', app.permission.check('qtHopDongLaoDong:read'), (req, res) => {
        const pageNumber = parseInt(req.params.pageNumber),
            pageSize = parseInt(req.params.pageSize),
            searchTerm = typeof req.query.condition === 'string' ? req.query.condition : '';
        const { fromYear, toYear, listShcc, listDv } = (req.query.filter && req.query.filter != '%%%%%%%%') ? req.query.filter : { fromYear: null, toYear: null, listShcc: null, listDv: null };
        app.model.qtHopDongLaoDong.groupPage(pageNumber, pageSize, listShcc, listDv, fromYear, toYear, searchTerm, (error, page) => {
            if (error || page == null) {
                res.send({ error });
            } else {
                const { totalitem: totalItem, pagesize: pageSize, pagetotal: pageTotal, pagenumber: pageNumber, rows: list } = page;
                const pageCondition = searchTerm;
                res.send({ error, page: { totalItem, pageSize, pageTotal, pageNumber, pageCondition, list } });
            }
        });
    });

    app.get('/api/tccb/qua-trinh/hop-dong-lao-dong/groupShcc/page/:pageNumber/:pageSize', app.permission.check('qtHopDongLaoDong:read'), (req, res) => {
        const pageNumber = parseInt(req.params.pageNumber),
            pageSize = parseInt(req.params.pageSize),
            searchTerm = typeof req.query.condition === 'string' ? req.query.condition : '';
        const { fromYear, toYear, listShcc, listDv } = (req.query.filter && req.query.filter != '%%%%%%%%') ? req.query.filter : { fromYear: null, toYear: null, listShcc: null, listDv: null };
        app.model.qtHopDongLaoDong.searchPage(pageNumber, pageSize, listShcc, listDv, fromYear, toYear, searchTerm, (error, page) => {
            if (error || page == null) {
                res.send({ error });
            } else {
                const { totalitem: totalItem, pagesize: pageSize, pagetotal: pageTotal, pagenumber: pageNumber, rows: list } = page;
                const pageCondition = searchTerm;
                res.send({ error, page: { totalItem, pageSize, pageTotal, pageNumber, pageCondition, list } });
            }
        });
    });

    app.get('/api/tccb/qua-trinh/hop-dong-lao-dong/all', checkGetStaffPermission, (req, res) => {
        app.model.qtHopDongLaoDong.getAll((error, items) => res.send({ error, items }));
    });

    app.get('/api/tccb/qua-trinh/hop-dong-lao-dong/item/:ma', checkGetStaffPermission, (req, res) => {
        app.model.qtHopDongLaoDong.get({ ma: req.params.ma }, (error, item) => res.send({ error, item }));
    });

    app.get('/api/tccb/qua-trinh/hop-dong-lao-dong/edit/item/:ma', checkGetStaffPermission, (req, res) => {
        app.model.qtHopDongLaoDong.get({ ma: req.params.ma }, (error, qtHopDongLaoDong) => {
            if (error || qtHopDongLaoDong == null) {
                res.send({ error });
            } else {
                app.model.canBo.get({ shcc: qtHopDongLaoDong.nguoiDuocThue }, (error, canBoDuocThue) => {
                    if (error || canBoDuocThue == null) {
                        res.send({ error });
                    } else {
                        app.model.canBo.get({ shcc: qtHopDongLaoDong.nguoiKy }, (error, daiDien) => {
                            if (error || daiDien == null) {
                                res.send({ item: app.clone({ qtHopDongLaoDong }, { canBoDuocThue }, { canBo: null }) });
                            } else {
                                res.send({ item: app.clone({ qtHopDongLaoDong: qtHopDongLaoDong }, { canBoDuocThue }, { daiDien }) });
                            }
                        });
                    }
                });
            }
        });
    });

    app.get('/api/tccb/qua-trinh/hop-dong-lao-dong/get-dai-dien/:shcc', checkGetStaffPermission, (req, res) => {
        app.model.canBo.get({ shcc: req.params.shcc }, (error, item) => {
            if (error) res.send({ error });
            else {
                app.model.qtChucVu.get({ shcc: item.shcc, chucVuChinh: 1 }, (e, result) => {
                    if (e) res.send({ error: e });
                    else res.send({ item: app.clone(item, { chucVu: result.maChucVu }) });
                });
            }
        });
    });

    app.get('/api/tccb/qua-trinh/hop-dong-lao-dong/newest/:shcc', app.permission.check('staff:login'), (req, res) => {
        app.model.qtHopDongLaoDong.get({ nguoiDuocThue: req.params.shcc }, 'ngayKyHopDong', 'ngayKyHopDong DESC', (error, result) => res.send({ error, result }));
    });
    
    app.post('/api/tccb/qua-trinh/hop-dong-lao-dong', app.permission.check('qtHopDongLaoDong:write'), (req, res) => {
        app.model.qtHopDongLaoDong.create(req.body.item, (error, item) => res.send({ error, item }));
    });

    app.put('/api/tccb/qua-trinh/hop-dong-lao-dong', app.permission.check('qtHopDongLaoDong:write'), (req, res) => {
        app.model.qtHopDongLaoDong.update({ ma: req.body.ma }, req.body.changes, (error, items) => res.send({ error, items }));
    });

    app.delete('/api/tccb/qua-trinh/hop-dong-lao-dong', app.permission.check('qtHopDongLaoDong:delete'), (req, res) => {
        app.model.qtHopDongLaoDong.delete({ ma: req.body.ma }, errors => res.send({ errors }));
    });

    app.get('/api/tccb/qua-trinh/hop-dong-lao-dong/download-word/:ma', app.permission.check('qtHopDongLaoDong:read'), (req, res) => {
        if (req.params && req.params.ma) {
            app.model.qtHopDongLaoDong.download(req.params.ma, (error, item) => {
                if (error || !item) {
                    res.send({ error });
                }
                else {
                    const source = app.path.join(__dirname, 'resource', 'hdld_word.docx');

                    new Promise(resolve => {
                        let hopDong = item.rows[0];
                        const data = {
                            soHopDong: hopDong.soHopDong,
                            daiDienKy: (hopDong.hoNguoiKy + ' ' + hopDong.tenNguoiKy).normalizedName(),
                            chucVuDaiDienKy: hopDong.chucVuNguoiKy === '003' ? (hopDong.chucVuNguoiKy.normalizedName() + ' ' + hopDong.donViNguoiKy.normalizedName()) : hopDong.chucVuNguoiKy.normalizedName(),
                            phaiNK: hopDong.phaiNK,
                            quocTichKy: hopDong.quocTichKy ? hopDong.quocTichKy : 'Việt Nam',
                            hoTenCanBo: (hopDong.ho + ' ' + hopDong.ten).normalizedName(),
                            phai: hopDong.phai,
                            quocTichCanBo: hopDong.quocTich ? hopDong.quocTich : '',
                            tonGiao: hopDong.tonGiao ? hopDong.tonGiao : '',
                            danToc: hopDong.danToc ? hopDong.danToc : '',
                            ngaySinh: hopDong.ngaySinh ? app.date.viDateFormat(new Date(hopDong.ngaySinh)) : '',
                            noiSinh: hopDong.noiSinh ? hopDong.noiSinh : '',
                            nguyenQuan: hopDong.nguyenQuan ? hopDong.nguyenQuan : '',
                            hienTai: (hopDong.soNhaCuTru ? hopDong.soNhaCuTru + ', ' : '')
                                + (hopDong.xaCuTru ? hopDong.xaCuTru + ', ' : '')
                                + (hopDong.huyenCuTru ? hopDong.huyenCuTru + ', ' : '')
                                + (hopDong.tinhCuTru ? hopDong.tinhCuTru : ''),
                            thuongTru: (hopDong.soNhaThuongTru ? hopDong.soNhaThuongTru + ', ' : '')
                                + (hopDong.xaThuongTru ? hopDong.xaThuongTru + ', ' : '')
                                + (hopDong.huyenThuongTru ? hopDong.huyenThuongTru + ', ' : '')
                                + (hopDong.tinhThuongTru ? hopDong.tinhThuongTru : ''),

                            dienThoai: hopDong.dienThoai ? hopDong.dienThoai : '',
                            hocVi: hopDong.trinhDoHocVan ? hopDong.trinhDoHocVan : '',
                            chuyenNganh: hopDong.hocVanChuyenNganh ? hopDong.hocVanChuyenNganh : '',

                            cmnd: hopDong.cmnd ? hopDong.cmnd : '',
                            cmndNgayCap: hopDong.ngayCap ? app.date.viDateFormat(new Date(hopDong.ngayCap)) : '',
                            cmndNoiCap: hopDong.cmndNoiCap ? hopDong.cmndNoiCap : '',

                            loaiHopDong: hopDong.loaiHopDong ? hopDong.loaiHopDong : '',
                            batDauLamViec: hopDong.batDauLamViec ? app.date.viDateFormat(new Date(hopDong.batDauLamViec)) : '',
                            ketThucHopDong: hopDong.ketThucHopDong ? app.date.viDateFormat(new Date(hopDong.ketThucHopDong)) : '',
                            diaDiemLamViec: hopDong.diaDiemLamViec ? hopDong.diaDiemLamViec.normalizedName() : '',
                            ngach: hopDong.tenNgach ? hopDong.tenNgach : '',
                            chiuSuPhanCong: hopDong.chiuSuPhanCong ? (hopDong.chiuSuPhanCong.length < 15 ? 'Theo sự phân công của Trưởng đơn vị: ' + hopDong.diaDiemLamViec.normalizedName() : hopDong.chiuSuPhanCong) : '',
                            chiuTrachNhiem: 'Trưởng đơn vị: ' + hopDong.diaDiemLamViec.normalizedName(),
                            bac: hopDong.bac ? hopDong.bac : '',
                            heSo: hopDong.heSo ? hopDong.heSo : '',
                            ngayKyHopDong: hopDong.ngayKyHopDong ? app.date.viDateFormat(new Date(hopDong.ngayKyHopDong)) : '',
                            phanTramHuong: hopDong.phanTramHuong ? hopDong.phanTramHuong : '',
                            hieuTruong: hopDong.maChucVuNguoiKy === '003' ? 'TL. HIỆU TRƯỞNG' : 'HIỆU TRƯỞNG',
                            truongPhongTCCB: hopDong.maChucVuNguoiKy === '003' ? 'TRƯỞNG PHÒNG TC-CB' : '',
                            isThuViec: hopDong.loaiHopDong.includes('thử việc') ? '(Thử việc)' : ''
                        };
                        resolve(data);
                    }).then((data) => {
                        app.docx.generateFile(source, data, (error, data) => {
                            if (error)
                                res.send({ error });
                            else {
                                res.send({ data });
                            }
                        });
                    });
                }
            });
        }
    });

    const formatDate = (date) => {
        const fdate = date && date != 0 ? new Date(date) : '';
        return fdate !== '' ? (fdate.getDate()) + '/' + (fdate.getMonth() + 1) + '/' + fdate.getFullYear() : '';
    };

    app.get('/api/tccb/qua-trinh/hop-dong-lao-dong/download-excel', app.permission.check('qtHopDongLaoDong:read'), (req, res) => {
        const pageNumber = 0,
            pageSize = 1000000,
            searchTerm = '';
        app.model.qtHopDongLaoDong.downloadExcel(pageNumber, pageSize, searchTerm, (error, page) => {
            if (error) {
                res.send({ error });
            } else {
                const workbook = app.excel.create(),
                    worksheet = workbook.addWorksheet('HDLD');
                new Promise(resolve => {
                    let cells = [
                        { cell: 'A1', value: '#', bold: true, border: '1234' },
                        { cell: 'B1', value: 'SHCC', bold: true, border: '1234' },
                        { cell: 'C1', value: 'Họ', bold: true, border: '1234' },
                        { cell: 'D1', value: 'Tên', bold: true, border: '1234' },
                        { cell: 'E1', value: 'Phái', bold: true, border: '1234' },
                        { cell: 'F1', value: 'Ngày sinh', bold: true, border: '1234' },
                        { cell: 'G1', value: 'Nơi sinh', bold: true, border: '1234' },
                        { cell: 'H1', value: 'Nguyên quán', bold: true, border: '1234' },
                        { cell: 'I1', value: 'Thường trú', bold: true, border: '1234' },
                        { cell: 'J1', value: 'Nơi ở hiện nay', bold: true, border: '1234' },
                        { cell: 'K1', value: 'Điện thoại', bold: true, border: '1234' },
                        { cell: 'L1', value: 'Số CMND/CCCD', bold: true, border: '1234' },
                        { cell: 'M1', value: 'Ngày cấp', bold: true, border: '1234' },
                        { cell: 'N1', value: 'Nơi cấp', bold: true, border: '1234' },
                        { cell: 'O1', value: 'Người ký', bold: true, border: '1234' },
                        { cell: 'P1', value: 'Chức vụ người ký', bold: true, border: '1234' },
                        { cell: 'Q1', value: 'Loại hợp đồng', bold: true, border: '1234' },
                        { cell: 'R1', value: 'Số hợp đồng', bold: true, border: '1234' },
                        { cell: 'S1', value: 'Ngày ký hợp đồng', bold: true, border: '1234' },
                        { cell: 'T1', value: 'Bắt đầu làm việc', bold: true, border: '1234' },
                        { cell: 'U1', value: 'Kết thúc hợp đồng', bold: true, border: '1234' },
                        { cell: 'V1', value: 'Ngày ký hợp đồng tiếp theo', bold: true, border: '1234' },
                        { cell: 'W1', value: 'Địa điểm làm việc', bold: true, border: '1234' },
                        { cell: 'X1', value: 'Chịu sự phân công', bold: true, border: '1234' },
                        { cell: 'Y1', value: 'Ngạch', bold: true, border: '1234' },
                        { cell: 'Z1', value: 'Trình độ', bold: true, border: '1234' },
                        { cell: 'AA1', value: 'Chuyên ngành', bold: true, border: '1234' },
                        { cell: 'AB1', value: 'Hệ số lương', bold: true, border: '1234' },
                        { cell: 'AC1', value: 'Bậc lương', bold: true, border: '1234' },
                        { cell: 'AD1', value: 'Phần trăm hưởng', bold: true, border: '1234' },
                    ];
                    page.rows.forEach((item, index) => {
                        let thuongTru = (item.soNhaThuongTru ? item.soNhaThuongTru + ', ' : '')
                            + (item.xaThuongTru ? item.xaThuongTru + ', ' : '')
                            + (item.huyenThuongTru ? item.huyenThuongTru + ', ' : '')
                            + (item.tinhThuongTru ? item.tinhThuongTru : ''),

                            cuTru = (item.soNhaCuTru ? item.soNhaCuTru + ', ' : '')
                                + (item.xaCuTru ? item.xaCuTru + ', ' : '')
                                + (item.huyenCuTru ? item.huyenCuTru + ', ' : '')
                                + (item.tinhCuTru ? item.tinhCuTru : ''),

                            chucVuNK = item.maChucVuNguoiKy == '003' ? (item.chucVuNguoiKy + ' ' + item.donViNguoiKy) : item.chucVuNguoiKy;
                        cells.push({ cell: 'A' + (index + 2), border: '1234', number: index + 1 });
                        cells.push({ cell: 'B' + (index + 2), border: '1234', value: item.shcc });
                        cells.push({ cell: 'C' + (index + 2), border: '1234', value: item.ho });
                        cells.push({ cell: 'D' + (index + 2), border: '1234', value: item.ten });
                        cells.push({ cell: 'E' + (index + 2), border: '1234', value: JSON.parse(item.gioiTinh).vi });
                        cells.push({ cell: 'F' + (index + 2), border: '1234', value: item.ngaySinh ? formatDate(item.ngaySinh) : '' });
                        cells.push({ cell: 'G' + (index + 2), border: '1234', value: item.noiSinh });
                        cells.push({ cell: 'H' + (index + 2), border: '1234', value: item.nguyenQuan });
                        cells.push({ cell: 'I' + (index + 2), border: '1234', value: thuongTru });
                        cells.push({ cell: 'J' + (index + 2), border: '1234', value: cuTru });
                        cells.push({ cell: 'K' + (index + 2), border: '1234', value: item.dienThoai });
                        cells.push({ cell: 'L' + (index + 2), border: '1234', value: item.cmnd });
                        cells.push({ cell: 'M' + (index + 2), border: '1234', value: item.ngayCap ? formatDate(item.ngayCap) : '' });
                        cells.push({ cell: 'N' + (index + 2), border: '1234', value: item.noiCap });
                        cells.push({ cell: 'O' + (index + 2), border: '1234', value: item.hoNguoiKy + ' ' + item.tenNguoiKy });
                        cells.push({ cell: 'P' + (index + 2), border: '1234', value: chucVuNK });
                        cells.push({ cell: 'Q' + (index + 2), border: '1234', value: item.loaiHopDong });
                        cells.push({ cell: 'R' + (index + 2), border: '1234', value: item.soHopDong });
                        cells.push({ cell: 'S' + (index + 2), border: '1234', value: item.ngayKyHopDong ? formatDate(item.ngayKyHopDong) : '' });
                        cells.push({ cell: 'T' + (index + 2), border: '1234', value: item.batDauLamViec ? formatDate(item.batDauLamViec) : '' });
                        cells.push({ cell: 'U' + (index + 2), border: '1234', value: item.ketThucHopDong ? formatDate(item.ketThucHopDong) : '' });
                        cells.push({ cell: 'V' + (index + 2), border: '1234', value: item.ngayKyHdTiepTheo ? formatDate(item.ngayKyHdTiepTheo) : '' });
                        cells.push({ cell: 'W' + (index + 2), border: '1234', value: item.diaDiemLamViec });
                        cells.push({ cell: 'X' + (index + 2), border: '1234', value: item.chiuSuPhanCong });
                        cells.push({ cell: 'Y' + (index + 2), border: '1234', value: item.ngach });
                        cells.push({ cell: 'Z' + (index + 2), border: '1234', value: item.trinhDoHocVan });
                        cells.push({ cell: 'AA' + (index + 2), border: '1234', value: item.hocVanChuyenNganh });
                        cells.push({ cell: 'AB' + (index + 2), border: '1234', value: item.heSo });
                        cells.push({ cell: 'AC' + (index + 2), border: '1234', value: item.bac });
                        cells.push({ cell: 'AD' + (index + 2), border: '1234', value: item.phanTramHuong });
                    });
                    resolve(cells);
                }).then((cells) => {
                    app.excel.write(worksheet, cells);
                    app.excel.attachment(workbook, res, 'HDLD.xlsx');
                }).catch((error) => {
                    res.send({ error });
                });


            }
        });
    });

    app.get('/api/tccb/qua-trinh/hop-dong-lao-dong/get-truong-phong-tccb', app.permission.check('qtHopDongLaoDong:read'), (req, res) => {
        app.model.dmChucVu.get({ ten: 'Trưởng phòng' }, (error, result) => {
            if (error) res.send({ error });
            else {
                app.model.qtChucVu.get({ maChucVu: result.ma, maDonVi: 30, chucVuChinh: 1 }, (er, truongPhongTCCB) => {
                    if (er) res.send({ error: er });
                    else {
                        
                        res.send({ truongPhongTCCB });
                    }
                });
            }
        });
    });

    app.get('/api/tccb/qua-trinh/hop-dong-lao-dong/suggested-shd', app.permission.check('qtHopDongLaoDong:write'), (req, res) => {
        app.model.qtHopDongLaoDong.getAll({}, 'soHopDong', 'soHopDong DESC', (error, items) => {
            let maxSoHD = 0, curYear = new Date().getFullYear();
            items.forEach((item) => {
                let soHopDong = Number(item.soHopDong.substring(0, item.soHopDong.indexOf('/'))),
                    hopDongYear = Number(item.soHopDong.substring(item.soHopDong.indexOf('/') + 1, item.soHopDong.lastIndexOf('/')));
                if (curYear == hopDongYear) {
                    if (soHopDong > maxSoHD) maxSoHD = soHopDong;
                }
            });
            res.send({ error, soHopDongSuggested: maxSoHD + 1 });
        });
    });
};