module.exports = app => {
    const menu = {
        parentMenu: app.parentMenu.tccb,
        menus: {
            3002: { title: 'Hợp đồng đơn vị trả lương - trách nhiệm', link: '/user/tchc/hop-dong-dvtl-tn', icon: 'fa-table', backgroundColor: '#8bc34a', },
        },
    };
    app.permission.add(
        { name: 'staff:login', menu: { parentMenu: { index: 1000, title: 'Thông tin cá nhân', icon: 'fa-user', link: '/user' } }, },
        { name: 'tchcHopDongDvtlTn:read', menu },
        { name: 'tchcHopDongDvtlTn:write' },
        { name: 'tchcHopDongDvtlTn:delete' },
    );
    app.get('/user/tchc/hop-dong-dvtl-tn/:ma', app.permission.check('tchcHopDongDvtlTn:read'), app.templates.admin);
    app.get('/user/tchc/hop-dong-dvtl-tn', app.permission.check('tchcHopDongDvtlTn:read'), app.templates.admin);

    // APIs -----------------------------------------------------------------------------------------------------------------------------------------
    const checkGetStaffPermission = (req, res, next) => app.isDebug ? next() : app.permission.check('staff:login')(req, res, next);

    app.get('/api/tchc/hop-dong-dvtl-tn/page/:pageNumber/:pageSize', checkGetStaffPermission, (req, res) => {
        let pageNumber = parseInt(req.params.pageNumber),
            pageSize = parseInt(req.params.pageSize),
            condition = { statement: null };
        if (req.query.condition) {
            condition = {
                statement: 'lower(ma) LIKE :searchText OR lower(ten) LIKE :searchText',
                parameter: { searchText: `%${req.query.condition.toLowerCase()}%` },
            };
        }
        app.model.tchcHopDongDvtlTn.getPage(pageNumber, pageSize, condition, (error, page) => res.send({ error, page }));
    });

    app.get('/api/tchc/hop-dong-dvtl-tn/all', checkGetStaffPermission, (req, res) => {
        app.model.tchcHopDongDvtlTn.getAll((error, items) => res.send({ error, items }));
    });

    app.get('/api/tchc/hop-dong-dvtl-tn/item/:ma', checkGetStaffPermission, (req, res) => {
        app.model.tchcHopDongDvtlTn.get({ ma: req.params.ma }, (error, item) => res.send({ error, item }));
    });

    app.get('/api/tchc/hop-dong-dvtl-tn/edit/item/:ma', checkGetStaffPermission, (req, res) => {
        app.model.tchcHopDongDvtlTn.get({ ma: req.params.ma }, (error, item) => res.send({ error, item }));
    });

    app.post('/api/tchc/hop-dong-dvtl-tn', app.permission.check('tchcHopDongDvtlTn:write'), (req, res) => {
        app.model.tchcHopDongDvtlTn.create(req.body.item, (error, item) => res.send({ error, item }));
    });

    app.put('/api/tchc/hop-dong-dvtl-tn', app.permission.check('tchcHopDongDvtlTn:write'), (req, res) => {
        app.model.tchcHopDongDvtlTn.update({ ma: req.body.ma }, req.body.changes, (error, items) => res.send({ error, items }));
    });

    app.delete('/api/tchc/hop-dong-dvtl-tn', app.permission.check('tchcHopDongDvtlTn:delete'), (req, res) => {
        app.model.tchcHopDongDvtlTn.delete({ ma: req.body.ma }, errors => res.send({ errors }));
    });

    app.get('/user/tchc/hop-dong-dvtl-tn/:ma/word', app.permission.check('staff:login'), (req, res) => {
        if (req.params && req.params.ma) {
            app.model.tchcHopDongDvtlTn.get({ ma: req.params.ma }, (error, hopDong) => {
                if (error || hopDong == null) {
                    res.send({ error });
                } else {
                    const signedStaffMapping = {}, hiredStaffMapping = {}, typeContract = {}, donViMapping = {},
                        chucVuMapping = {}, quocGiaMapping = {}, danTocMapping = {}, tonGiaoMapping = {},
                        tinhMapping = {}, xaMapping = {}, huyenMapping = {}, trinhDoMapping = {}, kHChucDanhMapping = {};
                    const url = hopDong.kieuHopDong == 'DVTL' ? 'Mau-HD-DVTL.docx' : 'Mau-HD-TN.docx';
                    const source = app.path.join(__dirname, 'resource', url);
                    new Promise(resolve => {
                        app.model.tchcCanBoHopDongDvtlTn.getAll((error, items) => {
                            (items || []).forEach(item => hiredStaffMapping[item.shcc] = item);
                            resolve();
                        });
                    }).then(() => new Promise(resolve => {
                        app.model.canBo.getAll((error, items) => {
                            (items || []).forEach(item => signedStaffMapping[item.shcc] = item.ho + ' ' + item.ten);
                            resolve();
                        });
                    })).then(() => new Promise(resolve => {
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
                        app.model.dmChucDanhKhoaHoc.getAll((error, items) => {
                            (items || []).forEach(item => kHChucDanhMapping[item.ma] = item.ten);
                            resolve();
                        });
                    })).then(() => new Promise(resolve => {
                        const curStaff = hiredStaffMapping[hopDong.nguoiDuocThue];
                        const data = {
                            hoTen: curStaff.ho + ' ' + curStaff.ten,
                            hoTenNguoiKy: signedStaffMapping[hopDong.nguoiKy],
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

                            loaiHopDong: typeContract[hopDong.loaiHopDong],
                            hieuLucHopDong: app.date.viDateFormat(new Date(hopDong.hieuLucHopDong)),
                            ketThucHopDong: app.date.viDateFormat(new Date(hopDong.ketThucHopDong)),
                            diaDiemLamViec: donViMapping[hopDong.diaDiemLamViec],
                            chucDanhChuyenMon: hopDong.chucDanhChuyenMon ? chucVuMapping[hopDong.chucDanhChuyenMon] : '',
                            khoaHocChucDanh: curStaff.khoaHocChucDanh ? kHChucDanhMapping[curStaff.khoaHocChucDanh] : '',
                            khoaHocChuyenNganh: curStaff.khoaHocChuyenNganh ? curStaff.khoaHocChuyenNganh : '',
                            chiuSuPhanCong: hopDong.chiuSuPhanCong,
                            donViChiTra: hopDong.donViChiTra ? donViMapping[hopDong.donViChiTra] : '',
                            ngayKyHopDong: app.date.viDateFormat(new Date(hopDong.ngayKyHopDong)),

                            heSo: hopDong.heSo ? hopDong.heSo : '',
                            bac: hopDong.bac ? hopDong.bac : '',
                            tienLuong: hopDong.tienLuong ? hopDong.tienLuong : ''

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