module.exports = app => {
    const menu = {
        parentMenu: app.parentMenu.tccb,
        menus: {
            3020: { title: 'Hợp đồng Đơn vị', link: '/user/tccb/qua-trinh/hop-dong-dvtl', icon: 'fa-pencil-square-o', backgroundColor: '#fecc2c', groupIndex: 2 },
        },
    };
    app.permission.add(
        { name: 'qtHopDongDvtl:read', menu },
        { name: 'qtHopDongDvtl:write' },
        { name: 'qtHopDongDvtl:delete' },
    );
    app.get('/user/tccb/qua-trinh/hop-dong-dvtl/:id', app.permission.check('qtHopDongDvtl:read'), app.templates.admin);
    app.get('/user/tccb/qua-trinh/hop-dong-dvtl', app.permission.check('qtHopDongDvtl:read'), app.templates.admin);

    // APIs -----------------------------------------------------------------------------------------------------------------------------------------
    app.get('/api/tccb/qua-trinh/hop-dong-dvtl/page/:pageNumber/:pageSize', app.permission.check('qtHopDongDvtl:read'), (req, res) => {
        const pageNumber = parseInt(req.params.pageNumber),
            pageSize = parseInt(req.params.pageSize),
            searchTerm = typeof req.query.condition === 'string' ? req.query.condition : '';
        let filter = '{}';
        try {
            filter = JSON.stringify(req.query.filter || {});
        } catch (error) {
            console.log(error);
        }
        app.model.qtHopDongDonViTraLuong.searchPage(pageNumber, pageSize, filter, searchTerm, (error, page) => {
            if (error || page == null) {
                res.send({ error });
            } else {
                const { totalitem: totalItem, pagesize: pageSize, pagetotal: pageTotal, pagenumber: pageNumber, rows: list } = page;
                const pageCondition = searchTerm;
                res.send({ error, page: { totalItem, pageSize, pageTotal, pageNumber, pageCondition, list } });
            }
        });
    });

    app.get('/api/tccb/qua-trinh/hop-dong-dvtl/group/page/:pageNumber/:pageSize', app.permission.check('qtHopDongDvtl:read'), (req, res) => {
        const pageNumber = parseInt(req.params.pageNumber),
            pageSize = parseInt(req.params.pageSize),
            searchTerm = typeof req.query.condition === 'string' ? req.query.condition : '';
        let filter = '{}';
        try {
            filter = JSON.stringify(req.query.filter || {});
        } catch (error) {
            console.log(error);
        }
        app.model.qtHopDongDonViTraLuong.groupPage(pageNumber, pageSize, filter, searchTerm, (error, page) => {
            if (error || page == null) {
                res.send({ error });
            } else {
                const { totalitem: totalItem, pagesize: pageSize, pagetotal: pageTotal, pagenumber: pageNumber, rows: list } = page;
                const pageCondition = searchTerm;
                res.send({ error, page: { totalItem, pageSize, pageTotal, pageNumber, pageCondition, list } });
            }
        });
    });

    app.get('/api/tccb/qua-trinh/hop-dong-dvtl/all', app.permission.check('qtHopDongDonViTraLuong:read'), (req, res) => {
        let condition = { statement: null };
        if (req.query.shcc) {
            condition = {
                statement: 'shcc = :searchText',
                parameter: { searchText: req.query.shcc },
            };
        }
        app.model.qtHopDongDonViTraLuong.getAll(condition, (error, items) => res.send({ error, items }));
    });

    app.get('/api/tccb/qua-trinh/hop-dong-dvtl/edit/item/:id', app.permission.check('qtHopDongDvtl:read'), (req, res) => {
        app.model.qtHopDongDonViTraLuong.get({ id: req.params.id }, (error, item) => res.send({ error, item }));
    });

    app.post('/api/tccb/qua-trinh/hop-dong-dvtl', app.permission.check('qtHopDongDvtl:write'), (req, res) => {
        app.model.qtHopDongDonViTraLuong.create(req.body.item, (error, item) => {
            app.tccbSaveCRUD(req.session.user.email, 'C', 'Hợp đồng đơn vị trả lương');
            res.send({ error, item });
        });
    });

    app.put('/api/tccb/qua-trinh/hop-dong-dvtl', app.permission.check('qtHopDongDvtl:write'), (req, res) => {
        app.model.qtHopDongDonViTraLuong.update({ id: req.body.id }, req.body.changes, (error, item) => {
            app.tccbSaveCRUD(req.session.user.email, 'U', 'Hợp đồng đơn vị trả lương');
            res.send({ error, item });
        });
    });
    app.delete('/api/tccb/qua-trinh/hop-dong-dvtl', app.permission.check('qtHopDongDvtl:write'), (req, res) => {
        app.model.qtHopDongDonViTraLuong.delete({ id: req.body.id }, (error) => {
            app.tccbSaveCRUD(req.session.user.email, 'D', 'Hợp đồng đơn vị trả lương');
            res.send({ error });
        });
    });

    // app.get('/api/tccb/qua-trinh/hop-dong-dvtl-tn/download-word/:ma', app.permission.check('qtHopDongDonViTraLuong:read'), (req, res) => {
    //     if (req.params && req.params.ma) {
    //         app.model.qtHopDongDonViTraLuong.download(req.params.ma, (error, item) => {
    //             if (error || !item) {
    //                 res.send({ error });
    //             } else {
    //                 let filename = 'Mau-HD-TN.docx';
    //                 if (item.kieuHopDong == 'DVTL') filename = 'Mau-HD-DVTL.docx';
    //                 const source = app.path.join(__dirname, 'resource', filename);

    //                 new Promise(resolve => {
    //                     let hopDong = item.rows[0];
    //                     const data = {
    //                         soHopDong: hopDong.soHopDong,
    //                         hoTenNguoiKy: hopDong.hoNguoiKy + ' ' + hopDong.tenNguoiKy,
    //                         chucVuNguoiKy: hopDong.maChucVuNguoiKy == '003' ? (hopDong.chucVuNguoiKy + ' ' + hopDong.donViNguoiKy) : hopDong.chucVuNguoiKy,
    //                         hoTen: hopDong.ho + ' ' + hopDong.ten,
    //                         quocTich: hopDong.quocTich ? hopDong.quocTich : '',
    //                         tonGiao: hopDong.tonGiao ? hopDong.tonGiao : '',
    //                         danToc: hopDong.danToc ? hopDong.danToc : '',
    //                         ngaySinh: hopDong.ngaySinh ? app.date.viDateFormat(new Date(hopDong.ngaySinh)) : '',
    //                         noiSinh: hopDong.noiSinh ? hopDong.noiSinh : '',
    //                         nguyenQuan: hopDong.nguyenQuan ? hopDong.nguyenQuan : '',
    //                         cuTru: (hopDong.soNhaCuTru ? hopDong.soNhaCuTru + ', ' : '')
    //                             + (hopDong.xaCuTru ? hopDong.xaCuTru + ', ' : '')
    //                             + (hopDong.huyenCuTru ? hopDong.huyenCuTru + ', ' : '')
    //                             + (hopDong.tinhCuTru ? hopDong.tinhCuTru : ''),
    //                         thuongTru: (hopDong.soNhaThuongTru ? hopDong.soNhaThuongTru + ', ' : '')
    //                             + (hopDong.xaThuongTru ? hopDong.xaThuongTru + ', ' : '')
    //                             + (hopDong.huyenThuongTru ? hopDong.huyenThuongTru + ', ' : '')
    //                             + (hopDong.tinhThuongTru ? hopDong.tinhThuongTru : ''),

    //                         dienThoai: hopDong.dienThoai ? hopDong.dienThoai : '',
    //                         hocVanTrinhDo: hopDong.trinhDoHocVan ? hopDong.trinhDoHocVan : '',
    //                         hocVanChuyenNganh: hopDong.hocVanChuyenNganh ? hopDong.hocVanChuyenNganh : '',

    //                         khoaHocChucDanh: hopDong.chucDanhKhoaHoc ? hopDong.chucDanhKhoaHoc : '',
    //                         khoaHocChuyenNganh: hopDong.khoaHocChuyenNganh ? hopDong.khoaHocChuyenNganh : '',

    //                         cmnd: hopDong.cmnd ? hopDong.cmnd : '',
    //                         cmndNgayCap: hopDong.ngayCap ? app.date.viDateFormat(new Date(hopDong.ngayCap)) : '',
    //                         cmndNoiCap: hopDong.cmndNoiCap ? hopDong.cmndNoiCap : '',

    //                         loaiHopDong: hopDong.loaiHopDong ? hopDong.loaiHopDong : '',
    //                         batDauLamViec: hopDong.batDauLamViec ? app.date.viDateFormat(new Date(hopDong.batDauLamViec)) : '',
    //                         ketThucHopDong: hopDong.ketThucHopDong ? app.date.viDateFormat(new Date(hopDong.ketThucHopDong)) : '',
    //                         hieuLucHopDong: hopDong.hieuLucHopDong ? app.date.viDateFormat(new Date(hopDong.hieuLucHopDong)) : '',
    //                         diaDiemLamViec: hopDong.diaDiemLamViec ? hopDong.diaDiemLamViec : '',
    //                         chucDanhChuyenMon: hopDong.chucDanhChuyenMon ? hopDong.chucDanhChuyenMon : '',
    //                         chiuSuPhanCong: hopDong.chiuSuPhanCong ? hopDong.chiuSuPhanCong : '',

    //                         bac: hopDong.bac ? hopDong.bac : '',
    //                         heSo: hopDong.heSo ? hopDong.heSo : '',

    //                         tienLuong: hopDong.tienLuong ? hopDong.tienLuong : '',
    //                         donViChiTra: hopDong.donViChiTra ? hopDong.donViChiTra : '',
    //                         ngayKyHopDong: hopDong.ngayKyHopDong ? app.date.viDateFormat(new Date(hopDong.ngayKyHopDong)) : ''
    //                     };
    //                     resolve(data);
    //                 }).then((data) => {
    //                     app.docx.generateFile(source, data, (error, data) => {
    //                         if (error)
    //                             res.send({ error });
    //                         else {
    //                             res.send({ data });
    //                         }
    //                     });
    //                 });
    //             }
    //         });
    //     }
    // });

    app.get('/api/tccb/qua-trinh/hop-dong-dvtl/suggested-shd', app.permission.check('qtHopDongDvtl:write'), (req, res) => {
        app.model.qtHopDongDonViTraLuong.getAll({}, 'soHopDong', 'soHopDong DESC', (error, items) => {
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