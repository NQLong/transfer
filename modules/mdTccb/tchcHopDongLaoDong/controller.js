module.exports = app => {
    const menu = {
        parentMenu: app.parentMenu.tccb,
        menus: {
            3010: { title: 'Hợp đồng lao động', link: '/user/tchc/hop-dong-lao-dong', icon: 'fa-file-text-o', backgroundColor: '#524e4e', groupIndex: 1},
        },
    };
    app.permission.add(
        { name: 'staff:login', menu: { parentMenu: { index: 1000, title: 'Thông tin cá nhân', icon: 'fa-user', link: '/user' } }, },
        { name: 'tchcHopDongLaoDong:read', menu },
        { name: 'tchcHopDongLaoDong:write' },
        { name: 'tchcHopDongLaoDong:delete' },
    );
    app.get('/user/tchc/hop-dong-lao-dong/:ma', app.permission.check('tchcHopDongLaoDong:read'), app.templates.admin);
    app.get('/user/tchc/hop-dong-lao-dong', app.permission.check('tchcHopDongLaoDong:read'), app.templates.admin);

    // APIs -----------------------------------------------------------------------------------------------------------------------------------------
    const checkGetStaffPermission = (req, res, next) => app.isDebug ? next() : app.permission.check('staff:login')(req, res, next);

    app.get('/api/tchc/hop-dong-lao-dong/page/:pageNumber/:pageSize', checkGetStaffPermission, (req, res) => {
        let pageNumber = parseInt(req.params.pageNumber),
            pageSize = parseInt(req.params.pageSize),
            condition = { statement: null };
        if (req.query.condition) {
            condition = {
                statement: 'lower(ma) LIKE :searchText OR lower(ten) LIKE :searchText',
                parameter: { searchText: `%${req.query.condition.toLowerCase()}%` },
            };
        }
        app.model.tchcHopDongLaoDong.getPage(pageNumber, pageSize, condition, (error, page) => res.send({ error, page }));
    });

    app.get('/api/tchc/hop-dong-lao-dong/all', checkGetStaffPermission, (req, res) => {
        app.model.tchcHopDongLaoDong.getAll((error, items) => res.send({ error, items }));
    });

    app.get('/api/tchc/hop-dong-lao-dong/item/:ma', checkGetStaffPermission, (req, res) => {
        app.model.tchcHopDongLaoDong.get({ ma: req.params.ma }, (error, item) => res.send({ error, item }));
    });

    app.get('/api/tchc/hop-dong-lao-dong/edit/item/:ma', checkGetStaffPermission, (req, res) => {
        app.model.tchcHopDongLaoDong.get({ ma: req.params.ma }, (error, item) => res.send({ error, item }));
    });

    app.post('/api/tchc/hop-dong-lao-dong', app.permission.check('tchcHopDongLaoDong:write'), (req, res) => {
        app.model.tchcHopDongLaoDong.create(req.body.item, (error, item) => res.send({ error, item }));
    });

    app.put('/api/tchc/hop-dong-lao-dong', app.permission.check('tchcHopDongLaoDong:write'), (req, res) => {
        app.model.tchcHopDongLaoDong.update({ ma: req.body.ma }, req.body.changes, (error, items) => res.send({ error, items }));
    });

    app.delete('/api/tchc/hop-dong-lao-dong', app.permission.check('tchcHopDongLaoDong:delete'), (req, res) => {
        app.model.tchcHopDongLaoDong.delete({ ma: req.body.ma }, errors => res.send({ errors }));
    });

    app.get('/user/tchc/hop-dong-lao-dong/:ma/word', app.permission.check('staff:login'), (req, res) => {
        if (req.params && req.params.ma) {
            app.model.tchcHopDongLaoDong.get({ ma: req.params.ma }, (error, hopDong) => {
                if (error || hopDong == null) {
                    res.send({ error });
                } else {
                    const staffMapping = {}, typeContract = {}, donViMapping = {},
                        chucVuMapping = {}, quocGiaMapping = {}, danTocMapping = {}, tonGiaoMapping = {},
                        tinhMapping = {}, xaMapping = {}, huyenMapping = {}, trinhDoMapping = {};
                    const url = 'Mau-HD-LaoDong.docx';
                    const source = app.path.join(__dirname, 'resource', url);
                    new Promise(resolve => {
                        app.model.canBo.getAll((error, items) => {
                            (items || []).forEach(item => staffMapping[item.shcc] = item);
                            resolve();
                        });
                    }).then(() => new Promise(resolve => {
                        app.model.dmChucVu.getAll((error, items) => {
                            (items || []).forEach(item => chucVuMapping[item.ma] = item.ten);
                            resolve();
                        });
                    })).then(() => new Promise(resolve => {
                        app.model.dmDonVi.getAll((error, items) => {
                            (items || []).forEach(item => donViMapping[item.ma] = item.ten);
                            resolve();
                        });
                    })).then(() => new Promise(resolve => {
                        app.model.dmLoaiHopDong.getAll((error, items) => {
                            (items || []).forEach(item => typeContract[item.ma] = item.ten);
                            resolve();
                        });
                    })).then(() => new Promise(resolve => {
                        app.model.dmQuocGia.getAll((error, items) => {
                            (items || []).forEach(item => quocGiaMapping[item.maCode] = item.tenQuocGia);
                            resolve();
                        });
                    })).then(() => new Promise(resolve => {
                        app.model.dmDanToc.getAll((error, items) => {
                            (items || []).forEach(item => danTocMapping[item.ma] = item.ten);
                            resolve();
                        });
                    })).then(() => new Promise(resolve => {
                        app.model.dmTonGiao.getAll((error, items) => {
                            (items || []).forEach(item => tonGiaoMapping[item.ma] = item.ten);
                            resolve();
                        });
                    })).then(() => new Promise(resolve => {
                        app.model.dmTinhThanhPho.getAll((error, items) => {
                            (items || []).forEach(item => tinhMapping[item.ma] = item.ten);
                            resolve();
                        });
                    })).then(() => new Promise(resolve => {
                        app.model.dmQuanHuyen.getAll((error, items) => {
                            (items || []).forEach(item => huyenMapping[item.maQuanHuyen] = item.tenQuanHuyen);
                            resolve();
                        });
                    })).then(() => new Promise(resolve => {
                        app.model.dmPhuongXa.getAll((error, items) => {
                            (items || []).forEach(item => xaMapping[item.maPhuongXa] = item.tenPhuongXa);
                            resolve();
                        });
                    })).then(() => new Promise(resolve => {
                        app.model.dmTrinhDo.getAll((error, items) => {
                            (items || []).forEach(item => trinhDoMapping[item.ma] = item.ten);
                            resolve();
                        });
                    })).then(() => new Promise(resolve => {
                        const curStaff = staffMapping[hopDong.nguoiDuocThue];
                        const data = {
                            hoTen: curStaff.ho + ' ' + curStaff.ten,
                            hoTenNguoiKy: staffMapping[hopDong.nguoiKy].ho + ' ' + staffMapping[hopDong.nguoiKy].ten,
                            chucVuNguoiKy: chucVuMapping[hopDong.chucVu],
                            quocTich: curStaff.quocGia ? quocGiaMapping[curStaff.quocGia] : '',
                            danToc: curStaff.danToc ? danTocMapping[curStaff.danToc] : '',
                            tonGiao: curStaff.tonGiao ? tonGiaoMapping[curStaff.tonGiao] : '',
                            ngaySinh: app.date.viDateFormat(new Date(curStaff.ngaySinh)),
                            noiSinh: curStaff.noiSinhMaTinh ? tinhMapping[curStaff.noiSinhMaTinh] : '',
                            nguyenQuan: curStaff.nguyenQuanMaTinh ? tinhMapping[curStaff.nguyenQuanMaTinh] : '',
                            cuTruMaTinh: curStaff.cuTruMaTinh ? tinhMapping[curStaff.cuTruMaTinh] + ', ' : '',
                            cuTruMaHuyen: curStaff.cuTruMaHuyen ? huyenMapping[curStaff.cuTruMaHuyen] + ', ' : '',
                            cuTruMaXa: curStaff.cuTruMaXa ? xaMapping[curStaff.cuTruMaXa] + ', ' : '',
                            cuTruSoNha: curStaff.cuTruSoNha ? curStaff.cuTruSoNha + ', ' : '',
                            cuTru: '',

                            thuongTruMaTinh: curStaff.thuongTruMaTinh ? tinhMapping[curStaff.thuongTruMaTinh] : '',
                            thuongTruMaHuyen: curStaff.thuongTruMaHuyen ? huyenMapping[curStaff.thuongTruMaHuyen] + ', ' : '',
                            thuongTruMaXa: curStaff.thuongTruMaXa ? xaMapping[curStaff.thuongTruMaXa] + ', ' : '',
                            thuongTruSoNha: curStaff.thuongTruSoNha ? curStaff.thuongTruSoNha + ', ' : '',
                            thuongTru: '',

                            dienThoai: curStaff.dienThoai ? curStaff.dienThoai : '',
                            hocVanTrinhDo: curStaff.hocVanTrinhDo ? trinhDoMapping[curStaff.hocVanTrinhDo] : '',
                            hocVanChuyenNganh: curStaff.hocVanChuyenNganh ? curStaff.hocVanChuyenNganh : '',

                            cmnd: curStaff.cmnd ? curStaff.cmnd : '',
                            cmndNgayCap: curStaff.cmndNgayCap ? app.date.viDateFormat(new Date(curStaff.cmndNgayCap)) : '',
                            cmndNoiCap: curStaff.cmndNoiCap ? curStaff.cmndNoiCap : '',

                            ketThucHopDong: app.date.viDateFormat(new Date(hopDong.ketThucHopDong)),
                            diaDiemLamViec: donViMapping[hopDong.diaDiemLamViec],
                            chucDanhChuyenMon: hopDong.chucDanhChuyenMon ? chucVuMapping[hopDong.chucDanhChuyenMon] : '',
                            // khoaHocChucDanh: curStaff.khoaHocChucDanh ? kHChucDanhMapping[curStaff.khoaHocChucDanh] : '',
                            // khoaHocChuyenNganh: curStaff.khoaHocChuyenNganh ? curStaff.khoaHocChuyenNganh : '',
                            chiuSuPhanCong: hopDong.chiuSuPhanCong,
                            // donViChiTra: hopDong.donViChiTra ? donViMapping[hopDong.donViChiTra] : '',
                            ngayKyHopDong: app.date.viDateFormat(new Date(hopDong.ngayKyHopDong)),

                            heSo: hopDong.heSo ? hopDong.heSo : '',
                            bac: hopDong.bac ? hopDong.bac : '',
                            // tienLuong: hopDong.tienLuong ? hopDong.tienLuong : ''

                        };
                        data.cuTru = data.cuTruSoNha + data.cuTruMaXa + data.cuTruMaHuyen + data.cuTruMaTinh;
                        data.thuongTru = data.thuongTruSoNha + data.thuongTruMaXa + data.thuongTruMaHuyen + data.thuongTruMaTinh;

                        resolve(data);

                    })).then((data) => {
                        app.docx.generateFile(source, data, (error, data) => {
                            if (error) {
                                console.log(error);
                                res.send({ error });
                            }
                            else
                                res.send({ data });
                        });
                    });
                }
            });
        }
    });
};