module.exports = app => {
    const menu = {
        parentMenu: app.parentMenu.tccb,
        menus: {
            3010: { title: 'Hợp đồng lao động', link: '/user/tccb/qua-trinh/hop-dong-lao-dong', icon: 'fa-file-text-o', backgroundColor: '#524e4e', groupIndex: 1 },
        },
    };
    app.permission.add(
        { name: 'staff:login', menu: { parentMenu: { index: 1000, title: 'Thông tin cá nhân', icon: 'fa-user', link: '/user' } }, },
        { name: 'qtHopDongLaoDong:read', menu },
        { name: 'qtHopDongLaoDong:write' },
        { name: 'qtHopDongLaoDong:delete' },
    );
    app.get('/user/tccb/qua-trinh/hop-dong-lao-dong/:ma', app.permission.check('qtHopDongLaoDong:read'), app.templates.admin);
    app.get('/user/tccb/qua-trinh/hop-dong-lao-dong', app.permission.check('qtHopDongLaoDong:read'), app.templates.admin);

    // APIs -----------------------------------------------------------------------------------------------------------------------------------------
    const checkGetStaffPermission = (req, res, next) => app.isDebug ? next() : app.permission.check('staff:login')(req, res, next);

    app.get('/api/tccb/qua-trinh/hop-dong-lao-dong/page/:pageNumber/:pageSize', app.permission.check('qtHopDongLaoDong:read'), (req, res) => {
        const pageNumber = parseInt(req.params.pageNumber),
            pageSize = parseInt(req.params.pageSize),
            searchTerm = typeof req.query.condition === 'string' ? req.query.condition : '';
        app.model.qtHopDongLaoDong.searchPage(pageNumber, pageSize, searchTerm, (error, page) => {
            if (error || page == null) {
                res.send({ error });
            } else {
                const { totalitem: totalItem, pagesize: pageSize, pagetotal: pageTotal, pagenumber: pageNumber, rows: list } = page;
                res.send({ error, page: { totalItem, pageSize, pageTotal, pageNumber, list } });
            }
        });
    });

    app.get('/api/tccb/qua-trinh/hop-dong-lao-dong/group/page/:pageNumber/:pageSize', app.permission.check('qtHopDongLaoDong:read'), (req, res) => {
        const pageNumber = parseInt(req.params.pageNumber),
            pageSize = parseInt(req.params.pageSize),
            searchTerm = typeof req.query.condition === 'string' ? req.query.condition : '';
        app.model.qtHopDongLaoDong.groupPage(pageNumber, pageSize, searchTerm, (error, page) => {
            if (error || page == null) {
                res.send({ error });
            } else {
                const { totalitem: totalItem, pagesize: pageSize, pagetotal: pageTotal, pagenumber: pageNumber, rows: list } = page;
                res.send({ error, page: { totalItem, pageSize, pageTotal, pageNumber, list } });
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
        app.model.qtHopDongLaoDong.get({ ma: req.params.ma }, (error, item) => res.send({ error, item }));
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
                    let hopDong = item.rows[0];
                    const source = app.path.join(__dirname, 'resource', 'Mau-HD-LaoDong.docx');

                    new Promise(resolve => {
                        const data = {
                            hoTenNguoiKy: hopDong.hoNguoiKy + ' ' + hopDong.tenNguoiKy,
                            chucVuNguoiKy: hopDong.chucVuNguoiKy,
                            hoTen: hopDong.ho + ' ' + hopDong.ten,
                            quocTich: hopDong.quocTich ? hopDong.quocTich : '',
                            tonGiao: hopDong.tonGiao ? hopDong.tonGiao : '',
                            danToc: hopDong.danToc ? hopDong.danToc : '',
                            ngaySinh: hopDong.ngaySinh ? app.date.viDateFormat(new Date(hopDong.ngaySinh)) : '',
                            noiSinh: hopDong.noiSinh ? hopDong.noiSinh : '',
                            nguyenQuan: hopDong.nguyenQuan ? hopDong.nguyenQuan : '',
                            cuTru: hopDong.soNhaCuTru ? hopDong.soNhaCuTru + ', ' : ''
                                + hopDong.xaCuTru ? hopDong.xaCuTru + ', ' : ''
                                    + hopDong.huyenCuTru ? hopDong.huyenCuTru + ', ' : ''
                                        + hopDong.tinhCuTru ? hopDong.tinhCuTru : '',
                            thuongTru: hopDong.soNhaThuongTru ? hopDong.soNhaThuongTru + ', ' : ''
                                + hopDong.xaThuongTru ? hopDong.xaThuongTru + ', ' : ''
                                    + hopDong.huyenThuongTru ? hopDong.huyenThuongTru + ', ' : ''
                                        + hopDong.tinhThuongTru ? hopDong.tinhThuongTru : '',
                            
                            dienThoai: hopDong.dienThoai ? hopDong.dienThoai : '',
                            hocVanTrinhDo: hopDong.trinhDoHocVan ? hopDong.trinhDoHocVan : '',
                            hocVanChuyenNganh: hopDong.hocVanChuyenNganh ? hopDong.hocVanChuyenNganh : '',
    
                            cmnd: hopDong.cmnd ? hopDong.cmnd : '',
                            cmndNgayCap: hopDong.ngayCap ? app.date.viDateFormat(new Date(hopDong.ngayCap)) : '',
                            cmndNoiCap: hopDong.noiCap ? hopDong.noiCap : '',
    
                            loaiHopDong: hopDong.loaiHopDong ? hopDong.tenLoaiHopDong : '',
                            batDauLamViec: hopDong.batDauLamViec ? app.date.viDateFormat(new Date(hopDong.batDauLamViec)) : '',
                            ketThucHopDong: hopDong.ketThucHopDong ? app.date.viDateFormat(new Date(hopDong.ketThucHopDong)) : '',
                            diaDiemLamViec: hopDong.diaDiemLamViec ? hopDong.diaDiemLamViec : '',
                            chucDanhChuyenMon: hopDong.chucDanhChuyenMon ? hopDong.chucDanhChuyenMon : '',
                            chiuSuPhanCong: hopDong.chiuSuPhanCong ? hopDong.chiuSuPhanCong : '',
    
                            bac: hopDong.bac ? hopDong.bac : '',
                            heSo: hopDong.heSo ? hopDong.heSo : '',
    
                            ngayKyHopDong: hopDong.ngayKyHopDong ? hopDong.ngayKyHopDong : ''
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
};