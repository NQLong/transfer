module.exports = app => {
    const menu = {
        parentMenu: app.parentMenu.tccb,
        menus: {
            3002: { title: 'Danh sách cán bộ', link: '/user/tccb/staff', icon: 'fa-users', backgroundColor: '#8bc34a', groupIndex: 0 },
        },
    };

    const menuStaff = {
        parentMenu: app.parentMenu.user,
        menus: {
            1001: { title: 'Hồ sơ cán bộ', link: '/user/profile', icon: 'fa-address-card-o', color: '#000000', backgroundColor: '#fbe904', groupIndex: 0 },
        },
    };

    app.permission.add(
        { name: 'staff:login', menu: menuStaff },
        { name: 'staff:read', menu },
        { name: 'staff:write' },
        { name: 'staff:delete' },
    );

    app.get('/user/profile', app.permission.check('staff:login'), app.templates.admin);

    app.get('/user/tccb/staff/:shcc', app.permission.check('staff:read'), app.templates.admin);
    app.get('/user/tccb/staff', app.permission.check('staff:read'), app.templates.admin);
    app.get('/user/tccb/staff/item/upload', app.permission.check('staff:write'), app.templates.admin);

    // APIs -----------------------------------------------------------------------------------------------------------------------------------------
    const checkGetStaffPermission = (req, res, next) => app.isDebug ? next() : app.permission.check('staff:login')(req, res, next);

    app.get('/api/staff/page/:pageNumber/:pageSize', checkGetStaffPermission, (req, res) => {
        let pageNumber = parseInt(req.params.pageNumber),
            pageSize = parseInt(req.params.pageSize),
            condition = { statement: null };
        if (req.query.condition) {
            if (typeof (req.query.condition) == 'object') {
                if (req.query.condition.searchText) {
                    condition = {
                        statement: 'email LIKE :searchText OR lower(shcc) LIKE :searchText OR lower(ho || \' \' || ten) LIKE :searchText',
                        parameter: { searchText: `%${req.query.condition.searchText.toLowerCase()}%` }
                    };
                }
            } else {
                condition = {
                    statement: 'email LIKE :searchText OR lower(shcc) LIKE :searchText OR lower(ho || \' \' || ten) LIKE :searchText',
                    parameter: { searchText: `%${req.query.condition.toLowerCase()}%` }
                };
            }
        }
        if (req.query.filter && req.query.filter.maDonVi) {
            if (req.query.condition) {
                condition.statement += ' AND maDonVi = :maDonVi';
                condition.parameter.maDonVi = req.query.filter.maDonVi;
            } else {
                condition.statement = 'maDonVi = :maDonVi';
                condition.parameter = {
                    maDonVi: req.query.filter.maDonVi
                };
            }
        }
        app.model.canBo.getPage(pageNumber, pageSize, condition, '*', 'SHCC DESC, TEN ASC', (error, page) => {
            res.send({ error, page });
        });
    });
    app.get('/api/staff-female/page/:pageNumber/:pageSize', checkGetStaffPermission, (req, res) => {
        let pageNumber = parseInt(req.params.pageNumber),
            pageSize = parseInt(req.params.pageSize),
            condition = { statement: null };
        if (req.query.condition) {
            if (typeof (req.query.condition) == 'object') {
                if (req.query.condition.searchText) {
                    condition = {
                        statement: 'email LIKE :searchText OR lower(shcc) LIKE :searchText OR lower(ho || \' \' || ten) LIKE :searchText',
                        parameter: { searchText: `%${req.query.condition.searchText.toLowerCase()}%` }
                    };
                }
            } else {
                condition = {
                    statement: 'email LIKE :searchText OR lower(shcc) LIKE :searchText OR lower(ho || \' \' || ten) LIKE :searchText',
                    parameter: { searchText: `%${req.query.condition.toLowerCase()}%` }
                };
            }
        }
        if (req.query.condition) {
            condition.statement += ' AND phai = :phai';
            condition.parameter.phai = '02';
        } else {
            condition.statement = 'phai = :phai';
            condition.parameter = {
                phai: '02'
            };
        }
        app.model.canBo.getPage(pageNumber, pageSize, condition, '*', 'SHCC DESC, TEN ASC', (error, page) => {
            res.send({ error, page });
        });
    });

    app.get('/api/staff/item/:shcc', checkGetStaffPermission, (req, res) => {
        app.model.canBo.get({ shcc: req.params.shcc }, (error, item) => res.send({ error, item }));
    });

    app.get('/api/staff/:maDonVi', checkGetStaffPermission, (req, res) => {
        app.model.canBo.getAll({ maDonVi: req.params.maDonVi }, (error, item) => res.send({ error, item }));
    });

    app.get('/api/staff/all', checkGetStaffPermission, (req, res) => {
        app.model.canBo.getAll((error, items) => res.send({ error, items }));
    });

    app.get('/api/staff/edit/item/:shcc', app.permission.check('staff:read'), async (req, res) => {

        app.model.canBo.get({ shcc: req.params.shcc }, (error, canBo) => {
            if (error || canBo == null) {
                res.send({ error: 'Lỗi khi lấy thông tin cán bộ !' });
            } else {
                let curTime = new Date().getTime();
                app.model.fwUser.get({ email: canBo.email }, (error, user) => {
                    if (error || user == null) {
                        res.send({ error: 'Lỗi khi lấy thông tin cán bộ !' });
                    } else {
                        let result = app.clone(canBo, { image: user.image });
                        new Promise(resolve => {
                            app.model.quanHeCanBo.getQhByShcc(canBo.shcc, (error, items) => {
                                if (error) {
                                    res.send({ error: 'Lỗi khi lấy thông tin quan hệ cán bộ !' });
                                }
                                else if (items == null) {
                                    result = app.clone(result, { items: null });
                                } else {
                                    result = app.clone(result, { items: items.rows });
                                }
                                resolve();
                            });
                        }).then(() => new Promise(resolve => {
                            app.model.tccbToChucKhac.getAll({ shcc: canBo.shcc }, (error, toChucKhac) => {
                                if (error) {
                                    res.send({ error: 'Lỗi khi lấy thông tin tổ chức chính trị - xã hội, nghề nghiệp cán bộ !' });
                                }
                                else if (toChucKhac == null) {
                                    result = app.clone(result, { toChucKhac: null });
                                } else {
                                    result = app.clone(result, { toChucKhac });
                                }
                                resolve();
                            });
                        })).then(() => new Promise(resolve => {
                            app.model.qtDaoTao.getCurrentOfStaff(canBo.shcc, curTime, (error, daoTaoCurrent) => {
                                if (error) {
                                    res.send({ error: 'Lỗi khi lấy thông tin đào tạo hiện tại!' });
                                }
                                else if (daoTaoCurrent == null || daoTaoCurrent.length == 0) {
                                    result = app.clone(result, { daoTaoCurrent: [] });
                                } else {
                                    result = app.clone(result, { daoTaoCurrent: daoTaoCurrent.rows });
                                }
                                resolve();
                            });
                        })).then(() => new Promise(resolve => {
                            app.model.qtDaoTao.getTDCT(canBo.shcc, (error, llct) => {
                                if (error) {
                                    res.send({ error: 'Lỗi khi lấy thông tin trình độ lí luận chính trị cán bộ !' });
                                }
                                else if (llct == null || llct.rows.length == 0) {
                                    result = app.clone(result, { llct: null });
                                } else {
                                    result = app.clone(result, { llct: llct.rows[0] });
                                }
                                resolve();
                            });
                        })).then(() => new Promise(resolve => {
                            app.model.qtDaoTao.getQLNN(canBo.shcc, (error, qlnn) => {
                                if (error) {
                                    res.send({ error: 'Lỗi khi lấy thông tin trình độ quản lý nhà nước cán bộ !' });
                                }
                                else if (qlnn == null || qlnn.length == 0) {
                                    result = app.clone(result, { qlnn: null });
                                } else {
                                    result = app.clone(result, { qlnn: qlnn.rows[0] });
                                }
                                resolve();
                            });
                        })).then(() => new Promise(resolve => {
                            app.model.qtDaoTao.getHV(canBo.shcc, (error, hocViCB) => {
                                if (error) {
                                    res.send({ error: 'Lỗi khi lấy thông tin trình độ học vấn, đào tạo !' });
                                }
                                else if (hocViCB == null || hocViCB.length == 0) {
                                    result = app.clone(result, { hocViCB: null });
                                } else {
                                    result = app.clone(result, { hocViCB: hocViCB.rows });
                                }
                                resolve();
                            });
                        })).then(() => new Promise(resolve => {
                            app.model.qtDaoTao.getCC(canBo.shcc, (error, chungChi) => {
                                if (error) {
                                    res.send({ error: 'Lỗi khi lấy thông tin trình độ cử nhân !' });
                                }
                                else if (chungChi == null || chungChi.length == 0) {
                                    result = app.clone(result, { chungChi: null });
                                } else {
                                    result = app.clone(result, { chungChi: chungChi.rows });
                                }
                                resolve();
                            });
                        })).then(() => new Promise(resolve => {
                            app.model.qtDaoTao.getTH(canBo.shcc, (error, tinHoc) => {
                                if (error) {
                                    res.send({ error: 'Lỗi khi lấy thông tin trình độ tin học cán bộ !' });
                                }
                                else if (tinHoc == null || tinHoc.length == 0) {
                                    result = app.clone(result, { tinHoc: null });
                                } else {
                                    result = app.clone(result, { tinHoc: tinHoc.rows[0] });
                                }
                                resolve();
                            });
                        })).then(() => new Promise(resolve => {
                            app.model.trinhDoNgoaiNgu.getTrinhDoNNByShcc(canBo.shcc, (error, trinhDoNN) => {
                                if (error) {
                                    res.send({ error: 'Lỗi khi lấy thông tin trình độ ngoại ngữ cán bộ !' });
                                }
                                else if (trinhDoNN == null) {
                                    result = app.clone(result, { trinhDoNN: null });
                                } else {
                                    result = app.clone(result, { trinhDoNN: trinhDoNN.rows[0] });
                                }
                                resolve();
                            });
                        })).then(() => new Promise(resolve => {
                            let dataCV = [];
                            app.model.qtChucVu.getByShcc(canBo.shcc, (error, chucVu) => {
                                if (error) {
                                    res.send({ error: 'Lỗi khi lấy thông tin quá trình chức vụ !' });
                                }
                                else if (chucVu == null) {
                                    result = app.clone(result, { chucVu: [] });
                                } else {
                                    chucVu.rows.forEach(i => {
                                        dataCV.push(Object.assign(i, { lcv: i.loaiChucVu == 1 }));
                                    });
                                    result = app.clone(result, { chucVu: dataCV });
                                }
                                resolve();
                            });
                        })).then(() => new Promise(resolve => {
                            app.model.qtNghiViec.get({ shcc: canBo.shcc }, (error, dataNghiViec) => {
                                if (error) {
                                    res.send({ error: 'Lỗi khi lấy thông tin nghỉ việc cán bộ!' });
                                }
                                else if (dataNghiViec == null) {
                                    result = app.clone(result, { dataNghiViec: null });
                                } else {
                                    result = app.clone(result, { dataNghiViec });
                                }
                                resolve();
                            });
                        })).then(() => new Promise(resolve => {
                            app.model.qtDiNuocNgoai.get({ shcc: canBo.shcc, ketThuc: -1 }, (error, dangONuocNgoai) => {
                                if (error) {
                                    res.send({ error: 'Lỗi khi lấy thông tin đi nước ngoài của cán bộ!' });
                                }
                                else if (dangONuocNgoai == null) {
                                    result = app.clone(result, { dangONuocNgoai: null });
                                } else {
                                    result = app.clone(result, { dangONuocNgoai });
                                }
                                resolve();
                            });
                        })).then(() => {
                            res.send({ error, item: result });
                        });
                    }
                });

            }
        });
    });

    app.post('/api/staff', app.permission.check('staff:write'), (req, res) => {
        const newItem = req.body.canBo;
        app.model.canBo.get({ shcc: newItem.shcc }, (error, item) => {
            if (item) {
                res.status(403).send({ error: { exist: true, message: 'Cán bộ ' + newItem.shcc.toString() + ' đã tồn tại' } });
            } else if (error) {
                res.status(500).send({ error });
            } else {
                app.model.canBo.create(newItem, (error, item) => {
                    res.send({ error, item });
                });
            }
        });
    });

    app.put('/api/staff', app.permission.check('staff:write'), (req, res) => {
        app.model.canBo.update({ shcc: req.body.shcc }, req.body.changes, (error, item) => {
            res.send({ error, item });
        });
    });

    app.delete('/api/staff', app.permission.check('staff:delete'), (req, res) => {
        app.model.canBo.delete({ shcc: req.body.shcc }, error => {
            new Promise(resolve => {
                app.model.quanHeCanBo.delete({ shcc: req.body.shcc }, () => {
                    resolve();
                });
            }).then(() => new Promise(resolve => {
                app.model.trinhDoNgoaiNgu.delete({ shcc: req.body.shcc }, () => {
                    resolve();
                });
            })).then(() => new Promise(resolve => {
                app.model.qtHocTapCongTac.delete({ shcc: req.body.shcc }, () => {
                    resolve();
                });
            })).then(() => new Promise(resolve => {
                app.model.qtDaoTao.delete({ shcc: req.body.shcc }, () => {
                    resolve();
                });
            })).then(() => new Promise(resolve => {
                app.model.qtNuocNgoai.delete({ shcc: req.body.shcc }, () => {
                    resolve();
                });
            })).then(() => new Promise(resolve => {
                app.model.qtKhenThuong.delete({ shcc: req.body.shcc }, () => {
                    resolve();
                });
            })).then(() => new Promise(resolve => {
                app.model.qtKyLuat.delete({ shcc: req.body.shcc }, () => {
                    resolve();
                });
            })).then(() => new Promise(resolve => {
                app.model.qtNghienCuuKhoaHoc.delete({ shcc: req.body.shcc }, () => {
                    resolve();
                });
            })).then(() => new Promise(resolve => {
                app.model.qtHuongDanLuanVan.delete({ shcc: req.body.shcc }, () => {
                    resolve();
                });
            })).then(() => new Promise(resolve => {
                app.model.sachGiaoTrinh.delete({ shcc: req.body.shcc }, () => {
                    resolve();
                });
            })).then(() => new Promise(resolve => {
                app.model.qtBaiVietKhoaHoc.delete({ shcc: req.body.shcc }, () => {
                    resolve();
                });
            })).then(() => new Promise(resolve => {
                app.model.qtKyYeu.delete({ shcc: req.body.shcc }, () => {
                    resolve();
                });
            })).then(() => new Promise(resolve => {
                app.model.qtGiaiThuong.delete({ shcc: req.body.shcc }, () => {
                    resolve();
                });
            })).then(() => new Promise(resolve => {
                app.model.qtBangPhatMinh.delete({ shcc: req.body.shcc }, () => {
                    resolve();
                });
            })).then(() => new Promise(resolve => {
                app.model.qtUngDungThuongMai.delete({ shcc: req.body.shcc }, () => {
                    resolve();
                });
            })).then(() => new Promise(resolve => {
                app.model.qtLamViecNgoai.delete({ shcc: req.body.shcc }, () => {
                    resolve();
                });
            })).then(() => {
                res.send({ error });
            });
        });
    });

    app.post('/api/staff/quan-he', app.permission.check('staff:write'), (req, res) =>
        app.model.quanHeCanBo.create(req.body.data, (error, item) => res.send({ error, item })));

    app.put('/api/staff/quan-he', app.permission.check('staff:write'), (req, res) =>
        app.model.quanHeCanBo.update({ id: req.body.id }, req.body.changes, (error, item) => res.send({ error, item })));

    app.delete('/api/staff/quan-he', app.permission.check('staff:write'), (req, res) =>
        app.model.quanHeCanBo.delete({ id: req.body.id }, (error) => res.send(error)));

    app.post('/api/staff/multiple', app.permission.check('staff:write'), (req, res) => {
        const canBoList = req.body.canBoList;
        const danTocMapping = {}, quocGiaMapping = {}, tonGiaoMapping = {}, trinhDoLyLuanChinhTriMapping = {}, donViMapping = {}, chucVuMapping = {},
            tinhMapping = {}, xaMapping = {}, huyenMapping = {}, chucDanhMapping = {}, trinhDoMapping = {}, trinhDoQuanLyNhaNuocMapping = {},
            trinhDoTinHocMapping = {}, quanHeMapping = {}, ngoaiNguMapping = {};

        new Promise(resolve => {
            app.model.dmDanToc.getAll((error, items) => {
                (items || []).forEach(item => danTocMapping[item.ten.toLowerCase()] = item.ma);
                resolve();
            });
        }).then(() => new Promise(resolve => {
            app.model.dmTonGiao.getAll((error, items) => {
                (items || []).forEach(item => tonGiaoMapping[item.ten.toLowerCase()] = item.ma);
                resolve();
            });
        })).then(() => new Promise(resolve => {
            app.model.dmTrinhDoLyLuanChinhTri.getAll((error, items) => {
                (items || []).forEach(item => trinhDoLyLuanChinhTriMapping[item.ten.toLowerCase()] = item.ma);
                resolve();
            });
        })).then(() => new Promise(resolve => {
            app.model.dmDonVi.getAll((error, items) => {
                (items || []).forEach(item => donViMapping[item.ten.toLowerCase()] = item.ma);
                resolve();
            });
        })).then(() => new Promise(resolve => {
            app.model.dmChucVu.getAll((error, items) => {
                (items || []).forEach(item => chucVuMapping[item.ten.toLowerCase()] = item.ma);
                resolve();
            });
        })).then(() => new Promise(resolve => {
            app.model.dmTinhThanhPho.getAll((error, items) => {
                (items || []).forEach(item => tinhMapping[item.ten.toLowerCase()] = item.ma);
                resolve();
            });
        })).then(() => new Promise(resolve => {
            app.model.dmQuanHuyen.getAll((error, items) => {
                (items || []).forEach(item => huyenMapping[item.maTinhThanhPho + ':' + item.tenQuanHuyen.toLowerCase()] = item.ma);
                resolve();
            });
        })).then(() => new Promise(resolve => {
            app.model.dmPhuongXa.getAll((error, items) => {
                (items || []).forEach(item => xaMapping[item.maQuanHuyen + ':' + item.tenPhuongXa.toLowerCase()] = item.ma);
                resolve();
            });
        })).then(() => new Promise(resolve => {
            app.model.dmQuocGia.getAll((error, items) => {
                (items || []).forEach(item => quocGiaMapping[item.tenQuocGia.toLowerCase()] = item.maCode);
                resolve();
            });
        })).then(() => new Promise(resolve => {
            app.model.dmChucDanhKhoaHoc.getAll((error, items) => {
                (items || []).forEach(item => chucDanhMapping[item.ten.toLowerCase()] = item.ma);
                resolve();
            });
        })).then(() => new Promise(resolve => {
            app.model.dmTrinhDo.getAll((error, items) => {
                (items || []).forEach(item => trinhDoMapping[item.ten.toLowerCase()] = item.ma);
                resolve();
            });
        })).then(() => new Promise(resolve => {
            app.model.dmTrinhDoQuanLyNhaNuoc.getAll((error, items) => {
                (items || []).forEach(item => trinhDoQuanLyNhaNuocMapping[item.ten.toLowerCase()] = item.ma);
                resolve();
            });
        })).then(() => new Promise(resolve => {
            app.model.dmTrinhDoTinHoc.getAll((error, items) => {
                (items || []).forEach(item => trinhDoTinHocMapping[item.ten.toLowerCase()] = item.ma);
                resolve();
            });
        })).then(() => new Promise(resolve => {
            app.model.dmQuanHeGiaDinh.getAll((error, items) => {
                (items || []).forEach(item => quanHeMapping[item.ten.toLowerCase()] = item.ma);
                resolve();
            });
        })).then(() => new Promise(resolve => {
            app.model.dmNgoaiNgu.getAll((error, items) => {
                (items || []).forEach(item => ngoaiNguMapping[item.ten.toLowerCase()] = item.ma);
                resolve();
            });
        })).then(() => {
            const handleCanBo = (index = 0) => {
                let item = canBoList[index];
                if (index < canBoList.length) {
                    let canBo = {
                        shcc: item.shcc,
                        ten: item.hoTen.split(' ')[item.hoTen.split(' ').length - 1].toUpperCase(),
                        ho: item.hoTen.substring(0, item.hoTen.indexOf(item.hoTen.split(' ')[item.hoTen.split(' ').length - 1])).toUpperCase().trim(),
                        phai: item.phai.toLowerCase() == 'nam' ? '01' : item.phai.toLowerCase() == 'nữ' ? '02' : null,
                        dienThoaiCaNhan: item.dienThoaiCaNhan,
                        email: item.email,
                        ngaySinh: item.ngaySinh,
                        ngayBatDauCongTac: item.ngayBatDauCongTac,
                        ngayBienChe: item.ngayBienChe,
                        chucVuDoanThe: item.chucVuDoanThe,
                        chucVuDang: item.chucVuDang,
                        chucVuKiemNhiem: item.chucVuKiemNhiem,
                        maTrinhDoLlct: item.trinhDoLlct && trinhDoLyLuanChinhTriMapping[item.trinhDoLlct.toLowerCase()] ? trinhDoLyLuanChinhTriMapping[item.trinhDoLlct.toLowerCase()] : null,
                        maTrinhDoQlnn: item.trinhDoQlnn && trinhDoQuanLyNhaNuocMapping[item.trinhDoQlnn.toLowerCase()] ? trinhDoQuanLyNhaNuocMapping[item.trinhDoQlnn.toLowerCase()] : null,
                        maTrinhDoTinHoc: item.trinhDoTinHoc && trinhDoTinHocMapping[item.trinhDoTinHoc.toLowerCase()] ? trinhDoTinHocMapping[item.trinhDoTinHoc.toLowerCase()] : null,
                        hoKhau: item.hoKhau,
                        diaChiHienTai: item.diaChiHienTai,
                        danToc: item.danToc && danTocMapping[item.danToc.toLowerCase()] ? danTocMapping[item.danToc.toLowerCase()] : null,
                        tonGiao: item.tonGiao && tonGiaoMapping[item.tonGiao.toLowerCase()] ? tonGiaoMapping[item.tonGiao.toLowerCase()] : null,
                        dangVien: item.ngayVaoDang || item.ngayVaoDangChinhThuc || item.noiDangDb || item.noiDangDb ? 1 : 0,
                        maDonVi: item.donVi && donViMapping[item.donVi.toLowerCase().replace('khoa', '').trim()] ? donViMapping[item.donVi.toLowerCase().replace('khoa', '').trim()] : null,
                        emailCaNhan: item.emailCaNhan,
                        biDanh: item.biDanh,
                        dienThoaiBaoTin: item.dienThoaiBaoTin,
                        ngheNghiepCu: item.ngheNghiepCu,
                        cmnd: item.cmnd,
                        cmndNgayCap: item.cmndNgayCap,
                        cmndNoiCap: item.cmndNoiCap,
                        chucVuKhac: item.chucVuKhac,
                        quocGia: item.quocGia && quocGiaMapping[item.quocGia.toLowerCase()] ? quocGiaMapping[item.quocGia.toLowerCase()] : null,
                        chucDanh: item.chucDanh && chucDanhMapping[item.chucDanh.toLowerCase()] ? chucDanhMapping[item.chucDanh.toLowerCase()] : null,
                        trinhDoPhoThong: item.trinhDoPhoThong ? typeof (item.trinhDoPhoThong) == 'object' ? item.trinhDoPhoThong.getDate() + '/' + item.trinhDoPhoThong.getMonth() : item.trinhDoPhoThong.replaceAll('//', '/') : null,
                        hocVi: item.hocVi && trinhDoMapping[item.hocVi.toLowerCase()] ? trinhDoMapping[item.hocVi.toLowerCase()] : null,
                        chuyenNganh: item.chuyenNganh,
                        sucKhoe: item.sucKhoe,
                        canNang: item.canNang,
                        chieuCao: item.chieuCao,
                        ngayNhapNgu: item.ngayNhapNgu,
                        ngayXuatNgu: item.ngayXuatNgu,
                        quanHamCaoNhat: item.quanHam,
                        hangThuongBinh: item.hangThuongBinh,
                        giaDinhChinhSach: item.giaDinhChinhSach,
                        danhHieu: item.danhHieu,
                        ngayVaoDang: item.ngayVaoDang,
                        ngayVaoDangChinhThuc: item.ngayVaoDangChinhThuc,
                        noiDangDb: item.noiDangDb,
                        noiDangCt: item.noiDangCt,
                        ngayVaoDoan: item.ngayVaoDoan,
                        noiVaoDoan: item.noiVaoDoan,
                        soTruong: item.soTruong,
                        nhomMau: item.nhomMau,
                        soBhxh: item.soBhxh,
                        doanVien: item.noiVaoDoan || item.ngayVaoDoan ? 1 : 0,
                        namChucDanh: item.namChucDanh,
                        namHocVi: item.namHocVi,
                        noiSinh: item.noiSinh,
                        queQuan: item.nguyenQuan
                    };
                    // if (item.noiSinh) {
                    //     let dsNoiSinh = item.noiSinh.split(/[-,]/);
                    //     if (dsNoiSinh.length == 1) {
                    //         canBo.maTinhNoiSinh = tinhMapping[dsNoiSinh[0].toLowerCase()] ? tinhMapping[dsNoiSinh[0].toLowerCase()] : null;
                    //     } else if (dsNoiSinh.length == 2) {
                    //         canBo.maTinhNoiSinh = tinhMapping[dsNoiSinh[1].toLowerCase().trim()] ? xaMapping[dsNoiSinh[1].toLowerCase().trim()] : null;
                    //         if (canBo.maTinhNoiSinh) canBo.maHuyenNoiSinh = huyenMapping[canBo.maTinhNoiSinh + ':' + dsNoiSinh[0].toLowerCase().trim()] ? huyenMapping[canBo.maTinhNoiSinh + ':' + dsNoiSinh[0].toLowerCase().trim()] : null;
                    //     } else if (dsNoiSinh.length == 3) {
                    //         canBo.maTinhNoiSinh = tinhMapping[dsNoiSinh[2].toLowerCase().trim()] ? xaMapping[dsNoiSinh[2].toLowerCase().trim()] : null;
                    //         if (canBo.maTinhNoiSinh) canBo.maHuyenNoiSinh = huyenMapping[canBo.maTinhNoiSinh + ':' + dsNoiSinh[1].toLowerCase().trim()] ? huyenMapping[canBo.maTinhNoiSinh + ':' + dsNoiSinh[1].toLowerCase().trim()] : null;
                    //         if (canBo.maHuyenNoiSinh) canBo.maXaNoiSinh = xaMapping[canBo.maHuyenNoiSinh + ':' + dsNoiSinh[0].toLowerCase().trim()] ? xaMapping[canBo.maHuyenNoiSinh + ':' + dsNoiSinh[0].toLowerCase().trim()] : null;
                    //     } else if (dsNoiSinh.length == 4) {
                    //         canBo.maTinhNoiSinh = tinhMapping[dsNoiSinh[3].toLowerCase().trim()] ? xaMapping[dsNoiSinh[3].toLowerCase().trim()] : null;
                    //         if (canBo.maTinhNoiSinh) canBo.maHuyenNoiSinh = huyenMapping[canBo.maTinhNoiSinh + ':' + dsNoiSinh[2].toLowerCase().trim()] ? huyenMapping[canBo.maTinhNoiSinh + ':' + dsNoiSinh[2].toLowerCase().trim()] : null;
                    //         if (canBo.maHuyenNoiSinh) canBo.maXaNoiSinh = xaMapping[canBo.maHuyenNoiSinh + ':' + dsNoiSinh[1].toLowerCase().trim()] ? xaMapping[canBo.maHuyenNoiSinh + ':' + dsNoiSinh[1].toLowerCase().trim()] : null;
                    //     }
                    // }
                    // if (item.nguyenQuan) {
                    //     let dsNguyenQuan = item.nguyenQuan.split(/[-,]/);
                    //     if (dsNguyenQuan.length == 1) {
                    //         canBo.maTinhNguyenQuan = tinhMapping[dsNguyenQuan[0].toLowerCase()] ? tinhMapping[dsNguyenQuan[0].toLowerCase()] : null;
                    //     } else if (dsNguyenQuan.length == 2) {
                    //         canBo.maTinhNguyenQuan = tinhMapping[dsNguyenQuan[1].toLowerCase().trim()] ? xaMapping[dsNguyenQuan[1].toLowerCase().trim()] : null;
                    //         if (canBo.maTinhNguyenQuan) canBo.maHuyenNguyenQuan = huyenMapping[canBo.maTinhNguyenQuan + ':' + dsNguyenQuan[0].toLowerCase().trim()] ? huyenMapping[canBo.maTinhNguyenQuan + ':' + dsNguyenQuan[0].toLowerCase().trim()] : null;
                    //     } else if (dsNguyenQuan.length == 3) {
                    //         canBo.maTinhNguyenQuan = tinhMapping[dsNguyenQuan[2].toLowerCase().trim()] ? xaMapping[dsNguyenQuan[2].toLowerCase().trim()] : null;
                    //         if (canBo.maTinhNguyenQuan) canBo.maHuyenNguyenQuan = huyenMapping[canBo.maTinhNguyenQuan + ':' + dsNguyenQuan[1].toLowerCase().trim()] ? huyenMapping[canBo.maTinhNguyenQuan + ':' + dsNguyenQuan[1].toLowerCase().trim()] : null;
                    //         if (canBo.maHuyenNguyenQuan) canBo.maXaNguyenQuan = xaMapping[canBo.maHuyenNguyenQuan + ':' + dsNguyenQuan[0].toLowerCase().trim()] ? xaMapping[canBo.maHuyenNguyenQuan + ':' + dsNguyenQuan[0].toLowerCase().trim()] : null;
                    //     } else if (dsNguyenQuan.length == 4) {
                    //         canBo.maTinhNguyenQuan = tinhMapping[dsNguyenQuan[3].toLowerCase().trim()] ? xaMapping[dsNguyenQuan[3].toLowerCase().trim()] : null;
                    //         if (canBo.maTinhNguyenQuan) canBo.maHuyenNguyenQuan = huyenMapping[canBo.maTinhNguyenQuan + ':' + dsNguyenQuan[2].toLowerCase().trim()] ? huyenMapping[canBo.maTinhNguyenQuan + ':' + dsNguyenQuan[2].toLowerCase().trim()] : null;
                    //         if (canBo.maHuyenNguyenQuan) canBo.maXaNguyenQuan = xaMapping[canBo.maHuyenNguyenQuan + ':' + dsNguyenQuan[1].toLowerCase().trim()] ? xaMapping[canBo.maHuyenNguyenQuan + ':' + dsNguyenQuan[1].toLowerCase().trim()] : null;
                    //     }
                    // }
                    if (canBo.shcc) {
                        app.model.canBo.get({ shcc: canBo.shcc }, (error, cbItem) => {
                            if (cbItem == null) {
                                app.model.canBo.create(canBo, (error2, newCb) => {
                                    if (!error2 && newCb) {
                                        if (item.quanHe && item.quanHe.length > 0) {
                                            const handleQuanHe = (index = 0) => {
                                                let quanHe = item.quanHe[index];
                                                if (index < item.quanHe.length) {
                                                    let newQuanHe = {
                                                        hoTen: quanHe.hoTen,
                                                        moiQuanHe: quanHeMapping[quanHe.quanHe.toLowerCase()],
                                                        namSinh: new Date(quanHe.namSinh).getTime(),
                                                        queQuan: quanHe.queQuan,
                                                        diaChi: quanHe.diaChi,
                                                        type: quanHe.type,
                                                        shcc: newCb.shcc,
                                                        ngheNghiep: quanHe.ngheNghiep
                                                    };
                                                    app.model.quanHeCanBo.create(newQuanHe, () => {
                                                        handleQuanHe(index + 1);
                                                    });
                                                }
                                            };
                                            handleQuanHe();
                                        }

                                        if (item.trinhDoNgoaiNgu && item.trinhDoNgoaiNgu.length > 0) {
                                            const handleNgoaiNgu = (index = 0) => {
                                                let ngoaiNgu = item.trinhDoNgoaiNgu[index];
                                                if (index < item.trinhDoNgoaiNgu.length) {
                                                    let newNgoaiNgu = {
                                                        loaiNgonNgu: ngoaiNguMapping[ngoaiNgu.loaiNgonNgu.toLowerCase()],
                                                        shcc: newCb.shcc,
                                                        trinhDo: ngoaiNgu.trinhDo
                                                    };
                                                    app.model.trinhDoNgoaiNgu.create(newNgoaiNgu, () => {
                                                        handleNgoaiNgu(index + 1);
                                                    });
                                                }
                                            };
                                            handleNgoaiNgu();
                                        }

                                        if (item.qtHtct && item.qtHtct.length > 0) {
                                            const handleQTHTCT = (index = 0) => {
                                                let htct = item.qtHtct[index];
                                                if (index < item.qtHtct.length) {
                                                    const newHtct = {
                                                        shcc: newCb.shcc,
                                                        batDau: htct.batDau,
                                                        ketThuc: htct.ketThuc,
                                                        batDauType: htct.batDauType,
                                                        ketThucType: htct.ketThucType,
                                                        noiDung: htct.noiDung
                                                    };
                                                    app.model.qtHocTapCongTac.create(newHtct, () => {
                                                        handleQTHTCT(index + 1);
                                                    });
                                                }
                                            };
                                            handleQTHTCT();
                                        }

                                        if (item.qtDaoTao && item.qtDaoTao.length > 0) {
                                            const handleQTDaoTao = (index = 0) => {
                                                let daoTao = item.qtDaoTao[index];
                                                if (index < item.qtDaoTao.length) {
                                                    const newDaoTao = {
                                                        shcc: newCb.shcc,
                                                        batDau: daoTao.batDau,
                                                        ketThuc: daoTao.ketThuc,
                                                        batDauType: daoTao.batDauType,
                                                        ketThucType: daoTao.ketThucType,
                                                        tenTruong: daoTao.tenTruong,
                                                        chuyenNganh: daoTao.chuyenNganh,
                                                        hinhThuc: daoTao.hinhThuc,
                                                        loaiBangCap: daoTao.loaiBangCap,
                                                        thoiGian: daoTao.thoiGian
                                                    };
                                                    app.model.qtDaoTao.create(newDaoTao, () => {
                                                        handleQTDaoTao(index + 1);
                                                    });
                                                }
                                            };
                                            handleQTDaoTao();
                                        }

                                        if (item.qtNuocNgoai && item.qtNuocNgoai.length > 0) {
                                            const handleQTNuocNgoai = (index = 0) => {
                                                let nuocNgoai = item.qtNuocNgoai[index];
                                                if (index < item.qtNuocNgoai.length) {
                                                    const newNuocNgoai = {
                                                        shcc: newCb.shcc,
                                                        batDau: nuocNgoai.batDau,
                                                        ketThuc: nuocNgoai.ketThuc,
                                                        batDauType: nuocNgoai.batDauType,
                                                        ketThucType: nuocNgoai.ketThucType,
                                                        quocGia: nuocNgoai.quocGia,
                                                        noiDung: nuocNgoai.noiDung
                                                    };
                                                    app.model.qtNuocNgoai.create(newNuocNgoai, () => {
                                                        handleQTNuocNgoai(index + 1);
                                                    });
                                                }
                                            };
                                            handleQTNuocNgoai();
                                        }

                                        if (item.qtKhenThuong && item.qtKhenThuong.length > 0) {
                                            const handleQTKhenThuong = (index = 0) => {
                                                let khenThuong = item.qtKhenThuong[index];
                                                if (index < item.qtKhenThuong.length) {
                                                    const newKhenThuong = {
                                                        shcc: newCb.shcc,
                                                        batDau: khenThuong.batDau,
                                                        ketThuc: khenThuong.ketThuc,
                                                        batDauType: khenThuong.batDauType,
                                                        ketThucType: khenThuong.ketThucType,
                                                        capQuyetDinh: khenThuong.capQuyetDinh,
                                                        noiDung: khenThuong.noiDung
                                                    };
                                                    app.model.qtKhenThuong.create(newKhenThuong, () => {
                                                        handleQTKhenThuong(index + 1);
                                                    });
                                                }
                                            };
                                            handleQTKhenThuong();
                                        }

                                        if (item.qtKyLuat && item.qtKyLuat.length > 0) {
                                            const handleQTKyLuat = (index = 0) => {
                                                let kyLuat = item.qtKyLuat[index];
                                                if (index < item.qtKyLuat.length) {
                                                    const newKyLuat = {
                                                        shcc: newCb.shcc,
                                                        batDau: kyLuat.batDau,
                                                        ketThuc: kyLuat.ketThuc,
                                                        batDauType: kyLuat.batDauType,
                                                        ketThucType: kyLuat.ketThucType,
                                                        capQuyetDinh: kyLuat.capQuyetDinh,
                                                        lyDoHinhThuc: kyLuat.lyDoHinhThuc
                                                    };
                                                    app.model.qtKyLuat.create(newKyLuat, () => {
                                                        handleQTKyLuat(index + 1);
                                                    });
                                                }
                                            };
                                            handleQTKyLuat();
                                        }

                                        if (item.qtNCKH && item.qtNCKH.length > 0) {
                                            const handleQTNCKH = (index = 0) => {
                                                let nckh = item.qtNCKH[index];
                                                if (index < item.qtNCKH.length) {
                                                    const newNckh = {
                                                        shcc: newCb.shcc,
                                                        batDau: nckh.batDau,
                                                        ketThuc: nckh.ketThuc,
                                                        batDauType: nckh.batDauType,
                                                        ketThucType: nckh.ketThucType,
                                                        tenDeTai: nckh.tenDeTai,
                                                        maSoCapQuanLy: nckh.maSoCapQuanLy,
                                                        kinhPhi: nckh.kinhPhi,
                                                        vaiTro: nckh.vaiTro,
                                                        ketQua: nckh.ketQua,
                                                        thoiGian: nckh.thoiGian,
                                                        ngayNghiemThu: nckh.ngayNghiemThu,
                                                        ngayNghiemThuType: nckh.ngayNghiemThuType
                                                    };
                                                    app.model.qtNghienCuuKhoaHoc.create(newNckh, () => {
                                                        handleQTNCKH(index + 1);
                                                    });
                                                }
                                            };
                                            handleQTNCKH();
                                        }

                                        if (item.qtHuongDan && item.qtHuongDan.length > 0) {
                                            const handleHuongDan = (index = 0) => {
                                                let huongDan = item.qtHuongDan[index];
                                                if (index < item.qtHuongDan.length) {
                                                    const newHuongDan = {
                                                        shcc: newCb.shcc,
                                                        hoTen: huongDan.hoTen,
                                                        tenLuanVan: huongDan.tenLuanVan,
                                                        namTotNghiep: huongDan.namTotNghiep,
                                                        sanPham: huongDan.sanPham,
                                                        bacDaoTao: huongDan.bacDaoTao
                                                    };
                                                    app.model.qtHuongDanLuanVan.create(newHuongDan, () => {
                                                        handleHuongDan(index + 1);
                                                    });
                                                }
                                            };
                                            handleHuongDan();
                                        }

                                        if (item.sachGiaoTrinh && item.sachGiaoTrinh.length > 0) {
                                            const handleSachGiaoTrinh = (index = 0) => {
                                                let sach = item.sachGiaoTrinh[index];
                                                if (index < item.sachGiaoTrinh.length) {
                                                    const newSach = {
                                                        shcc: newCb.shcc,
                                                        ten: sach.ten,
                                                        theLoai: sach.theLoai,
                                                        nhaSanXuat: sach.nhaSanXuat,
                                                        namSanXuat: sach.namSanXuat,
                                                        chuBien: sach.chuBien,
                                                        sanPham: sach.sanPham,
                                                        butDanh: sach.butDanh,
                                                        quocTe: sach.quocTe
                                                    };
                                                    app.model.sachGiaoTrinh.create(newSach, () => {
                                                        handleSachGiaoTrinh(index + 1);
                                                    });
                                                }
                                            };
                                            handleSachGiaoTrinh();
                                        }

                                        if (item.baiVietKhoaHoc && item.baiVietKhoaHoc.length > 0) {
                                            const handleBaiViet = (index = 0) => {
                                                let baiViet = item.baiVietKhoaHoc[index];
                                                if (index < item.baiVietKhoaHoc.length) {
                                                    const newBaiViet = {
                                                        shcc: newCb.shcc,
                                                        tenTacGia: baiViet.tenTacGia,
                                                        namXuatBan: baiViet.namXuatBan,
                                                        tenBaiViet: baiViet.tenBaiViet,
                                                        tenTapChi: baiViet.tenTapChi,
                                                        soHieuIssn: baiViet.soHieuIssn,
                                                        sanPham: baiViet.sanPham,
                                                        diemIf: baiViet.diemIf,
                                                        quocTe: baiViet.quocTe
                                                    };
                                                    app.model.qtBaiVietKhoaHoc.create(newBaiViet, () => {
                                                        handleBaiViet(index + 1);
                                                    });
                                                }
                                            };
                                            handleBaiViet();
                                        }

                                        if (item.kyYeu && item.kyYeu.length > 0) {
                                            const handleKyYeu = (index = 0) => {
                                                let kYeu = item.kyYeu[index];
                                                if (index < item.kyYeu.length) {
                                                    const newKYeu = {
                                                        shcc: newCb.shcc,
                                                        tenTacGia: kYeu.tenTacGia,
                                                        tenHoiNghi: kYeu.tenHoiNghi,
                                                        tenBaiViet: kYeu.tenBaiViet,
                                                        noiToChuc: kYeu.noiToChuc,
                                                        soHieuIssn: kYeu.soHieuIssn,
                                                        thoiGian: kYeu.thoiGian,
                                                        sanPham: kYeu.sanPham,
                                                        quocTe: kYeu.quocTe
                                                    };
                                                    app.model.qtKyYeu.create(newKYeu, () => {
                                                        handleKyYeu(index + 1);
                                                    });
                                                }
                                            };
                                            handleKyYeu();
                                        }

                                        if (item.giaiThuong && item.giaiThuong.length > 0) {
                                            const handleGiaiThuong = (index = 0) => {
                                                let gt = item.giaiThuong[index];
                                                if (index < item.giaiThuong.length) {
                                                    const newGT = {
                                                        shcc: newCb.shcc,
                                                        tenGiaiThuong: gt.tenGiaiThuong,
                                                        noiDung: gt.noiDung,
                                                        noiCap: gt.noiCap,
                                                        namCap: gt.namCap
                                                    };
                                                    app.model.qtGiaiThuong.create(newGT, () => {
                                                        handleGiaiThuong(index + 1);
                                                    });
                                                }
                                            };
                                            handleGiaiThuong();
                                        }

                                        if (item.bangPMSC && item.bangPMSC.length > 0) {
                                            const handleBangPMSC = (index = 0) => {
                                                let bang = item.bangPMSC[index];
                                                if (index < item.bangPMSC.length) {
                                                    const newBang = {
                                                        shcc: newCb.shcc,
                                                        tenBang: bang.tenBang,
                                                        soHieu: bang.soHieu,
                                                        namCap: bang.namCap,
                                                        noiCap: bang.noiCap,
                                                        tacGia: bang.tacGia,
                                                        sanPham: bang.sanPham,
                                                        loaiBang: bang.loaiBang
                                                    };
                                                    app.model.qtBangPhatMinh.create(newBang, () => {
                                                        handleBangPMSC(index + 1);
                                                    });
                                                }
                                            };
                                            handleBangPMSC();
                                        }

                                        if (item.ungDungThuongMai && item.ungDungThuongMai.length > 0) {
                                            const handleUngDungThuongMai = (index = 0) => {
                                                let ungDung = item.ungDungThuongMai[index];
                                                if (index < item.ungDungThuongMai.length) {
                                                    const newUngDung = {
                                                        shcc: newCb.shcc,
                                                        tenCongNghe: ungDung.tenCongNghe,
                                                        hinhThuc: ungDung.hinhThuc,
                                                        namChuyenGia: ungDung.namChuyenGia,
                                                        sanPham: ungDung.sanPham,
                                                    };
                                                    app.model.qtUngDungThuongMai.create(newUngDung, () => {
                                                        handleUngDungThuongMai(index + 1);
                                                    });
                                                }
                                            };
                                            handleUngDungThuongMai();
                                        }

                                        if (item.lamViecNgoai && item.lamViecNgoai.length > 0) {
                                            const handleLamViecNgoai = (index = 0) => {
                                                let LVN = item.lamViecNgoai[index];
                                                if (index < item.lamViecNgoai.length) {
                                                    const newLVN = {
                                                        shcc: newCb.shcc,
                                                        noiLamViec: LVN.noiLamViec,
                                                        noiDung: LVN.noiDung,
                                                        batDau: LVN.batDau,
                                                        ketThuc: LVN.ketThuc,
                                                        batDauType: LVN.batDauType,
                                                        ketThucType: LVN.ketThucType
                                                    };
                                                    app.model.qtLamViecNgoai.create(newLVN, () => {
                                                        handleLamViecNgoai(index + 1);
                                                    });
                                                }
                                            };
                                            handleLamViecNgoai();
                                        }
                                    }
                                    handleCanBo(index + 1);
                                });
                            } else {
                                handleCanBo(index + 1);
                            }
                        });
                    } else {
                        handleCanBo(index + 1);
                    }
                } else {
                    res.send({ error: null });
                }
            };

            handleCanBo();
        });

    });

    // USER APIs ------------------------------------------------------------------------------------------------------------------------------------
    app.get('/api/staff-profile/:email', (req, res) => {
        app.model.canBo.get({ email: req.params.email }, (error, canBo) => {
            if (error || canBo == null) {
                res.send({ error });
            } else {
                let result = app.clone(canBo),
                    curTime = new Date().getTime();
                new Promise(resolve => {
                    app.model.fwUser.get({ email: canBo.email }, (error, user) => {
                        if (error || user == null) {
                            res.send({ error: 'Lỗi khi lấy thông tin cán bộ !' });
                        } else {
                            result = app.clone(canBo, { image: user.image });
                        }
                        resolve();
                    });
                }).then(() => new Promise(resolve => {
                    app.model.quanHeCanBo.getQhByShcc(canBo.shcc, (error, items) => {
                        if (error) {
                            res.send({ error: 'Lỗi khi lấy thông tin quan hệ cán bộ !' });
                        }
                        else if (items == null) {
                            result = app.clone(result, { items: null });
                        } else {
                            result = app.clone(result, { items: items.rows });
                        }
                        resolve();
                    });
                })).then(() => new Promise(resolve => {
                    app.model.tccbToChucKhac.getAll({ shcc: canBo.shcc }, (error, toChucKhac) => {
                        if (error) {
                            res.send({ error: 'Lỗi khi lấy thông tin tổ chức chính trị - xã hội, nghề nghiệp cán bộ !' });
                        }
                        else if (toChucKhac == null) {
                            result = app.clone(result, { toChucKhac: null });
                        } else {
                            result = app.clone(result, { toChucKhac });
                        }
                        resolve();
                    });
                })).then(() => new Promise(resolve => {
                    app.model.qtDaoTao.getCurrentOfStaff(canBo.shcc, curTime, (error, daoTaoCurrent) => {
                        if (error) {
                            res.send({ error: 'Lỗi khi lấy thông tin đào tạo hiện tại!' });
                        }
                        else if (daoTaoCurrent == null || daoTaoCurrent.length == 0) {
                            result = app.clone(result, { daoTaoCurrent: [] });
                        } else {
                            result = app.clone(result, { daoTaoCurrent: daoTaoCurrent.rows });
                        }
                        resolve();
                    });
                })).then(() => new Promise(resolve => {
                    app.model.qtDaoTao.getTDCT(canBo.shcc, (error, llct) => {
                        if (error) {
                            res.send({ error: 'Lỗi khi lấy thông tin trình độ lí luận chính trị cán bộ !' });
                        }
                        else if (llct == null || llct.rows.length == 0) {
                            result = app.clone(result, { llct: null });
                        } else {
                            result = app.clone(result, { llct: llct.rows[0] });
                        }
                        resolve();
                    });
                })).then(() => new Promise(resolve => {
                    app.model.qtDaoTao.getQLNN(canBo.shcc, (error, qlnn) => {
                        if (error) {
                            res.send({ error: 'Lỗi khi lấy thông tin trình độ quản lý nhà nước cán bộ !' });
                        }
                        else if (qlnn == null || qlnn.length == 0) {
                            result = app.clone(result, { qlnn: null });
                        } else {
                            result = app.clone(result, { qlnn: qlnn.rows[0] });
                        }
                        resolve();
                    });
                })).then(() => new Promise(resolve => {
                    app.model.qtDaoTao.getHV(canBo.shcc, (error, hocViCB) => {
                        if (error) {
                            res.send({ error: 'Lỗi khi lấy thông tin trình độ học vấn, đào tạo !' });
                        }
                        else if (hocViCB == null || hocViCB.length == 0) {
                            result = app.clone(result, { hocViCB: null });
                        } else {
                            result = app.clone(result, { hocViCB: hocViCB.rows });
                        }
                        resolve();
                    });
                })).then(() => new Promise(resolve => {
                    app.model.qtDaoTao.getCC(canBo.shcc, (error, chungChi) => {
                        if (error) {
                            res.send({ error: 'Lỗi khi lấy thông tin trình độ cử nhân !' });
                        }
                        else if (chungChi == null || chungChi.length == 0) {
                            result = app.clone(result, { chungChi: null });
                        } else {
                            result = app.clone(result, { chungChi: chungChi.rows });
                        }
                        resolve();
                    });
                })).then(() => new Promise(resolve => {
                    app.model.qtDaoTao.getTH(canBo.shcc, (error, tinHoc) => {
                        if (error) {
                            res.send({ error: 'Lỗi khi lấy thông tin trình độ tin học cán bộ !' });
                        }
                        else if (tinHoc == null || tinHoc.length == 0) {
                            result = app.clone(result, { tinHoc: null });
                        } else {
                            result = app.clone(result, { tinHoc: tinHoc.rows[0] });
                        }
                        resolve();
                    });
                })).then(() => new Promise(resolve => {
                    app.model.trinhDoNgoaiNgu.getTrinhDoNNByShcc(canBo.shcc, (error, trinhDoNN) => {
                        if (error) {
                            res.send({ error: 'Lỗi khi lấy thông tin trình độ ngoại ngữ cán bộ !' });
                        }
                        else if (trinhDoNN == null) {
                            result = app.clone(result, { trinhDoNN: null });
                        } else {
                            result = app.clone(result, { trinhDoNN: trinhDoNN.rows[0] });
                        }
                        resolve();
                    });
                })).then(() => new Promise(resolve => {
                    let dataCV = [];
                    app.model.qtChucVu.getByShcc(canBo.shcc, (error, chucVu) => {
                        if (error) {
                            res.send({ error: 'Lỗi khi lấy thông tin quá trình chức vụ !' });
                        }
                        else if (chucVu == null) {
                            result = app.clone(result, { chucVu: [] });
                        } else {
                            chucVu.rows.forEach(i => {
                                dataCV.push(Object.assign(i, { lcv: i.loaiChucVu == 1 }));
                            });
                            result = app.clone(result, { chucVu: dataCV });
                        }
                        resolve();
                    });
                })).then(() => {
                    res.send({ error, item: result });
                });
            }
        });
    });

    app.get('/api/can-bo-ky/:shcc', checkGetStaffPermission, (req, res) => {
        app.model.canBo.getCanBoBenA(req.params.shcc, (error, item) => res.send({ error, item }));
    });
    app.put('/api/user/staff', app.permission.check('staff:login'), (req, res) => {
        if (req.body.changes && req.session.user) {
            const changes = req.body.changes;
            app.model.canBo.get({ email: req.session.user.email }, (error, canBo) => {
                if (!canBo) {
                    changes.email = req.session.user.email;
                    app.model.canBo.create(changes, (error, item) => {
                        res.send({ error, item });
                    });
                } else {
                    app.model.canBo.update({ email: req.session.user.email }, changes, (error, item) => {
                        res.send({ error, item });
                    });
                }
            });

        } else {
            res.send({ error: 'Invalid parameter!' });
        }
    });

    app.post('/api/user/staff/quan-he', app.permission.check('staff:login'), (req, res) => {
        if (req.body.data && req.session.user) {
            const data = req.body.data;
            app.model.quanHeCanBo.create(data, (error, item) => res.send({ error, item }));
        } else {
            res.send({ error: 'Invalid parameter!' });
        }
    });

    app.put('/api/user/staff/quan-he', app.permission.check('staff:login'), (req, res) => {
        if (req.body.changes && req.session.user) {
            app.model.quanHeCanBo.get({ id: req.body.id }, (error, item) => {
                if (error || item == null) {
                    res.send({ error: 'Not found!' });
                } else {
                    if (item.shcc === req.session.user.shcc) {
                        console.log(req.body.id);
                        const changes = req.body.changes;
                        app.model.quanHeCanBo.update({ id: req.body.id }, changes, (error, item) => res.send({ error, item }));
                    } else {
                        res.send({ error: 'Not found!' });
                    }
                }
            });
        } else {
            res.send({ error: 'Invalid parameter!' });
        }
    });

    app.delete('/api/user/staff/quan-he', app.permission.check('staff:login'), (req, res) => {
        if (req.session.user) {
            app.model.quanHeCanBo.get({ id: req.body.id }, (error, item) => {
                if (error || item == null) {
                    res.send({ error: 'Not found!' });
                } else {
                    if (item.shcc === req.session.user.shcc) {
                        app.model.quanHeCanBo.delete({ id: req.body.id }, (error) => res.send(error));
                    } else {
                        res.send({ error: 'Not found!' });
                    }
                }
            });
        } else {
            res.send({ error: 'Invalid parameter!' });
        }
    });

    app.get('/user/staff/:shcc/word', app.permission.check('staff:login'), (req, res) => {
        if (req.params && req.params.shcc) {
            app.model.canBo.get({ shcc: req.params.shcc }, (error, canBo) => {
                if (error || canBo == null) {
                    res.send({ error });
                } else {
                    const danTocMapping = {}, quocGiaMapping = {}, tonGiaoMapping = {}, trinhDoLyLuanChinhTriMapping = {}, donViMapping = {}, chucVuMapping = {},
                        tinhMapping = {}, xaMapping = {}, huyenMapping = {}, chucDanhMapping = {}, trinhDoMapping = {}, trinhDoQuanLyNhaNuocMapping = {},
                        trinhDoTinHocMapping = {}, quanHeMapping = {}, ngoaiNguMapping = {};
                    const source = app.path.join(__dirname, 'resource', 'Mau-2C-BNV-2008.docx');

                    new Promise(resolve => {
                        app.model.dmDanToc.getAll((error, items) => {
                            (items || []).forEach(item => danTocMapping[item.ma] = item.ten);
                            resolve();
                        });
                    }).then(() => new Promise(resolve => {
                        app.model.dmTonGiao.getAll((error, items) => {
                            (items || []).forEach(item => tonGiaoMapping[item.ma] = item.ten);
                            resolve();
                        });
                    })).then(() => new Promise(resolve => {
                        app.model.dmTrinhDoLyLuanChinhTri.getAll((error, items) => {
                            (items || []).forEach(item => trinhDoLyLuanChinhTriMapping[item.ma] = item.ten);
                            resolve();
                        });
                    })).then(() => new Promise(resolve => {
                        app.model.dmDonVi.getAll((error, items) => {
                            (items || []).forEach(item => donViMapping[item.ma] = item.ten);
                            resolve();
                        });
                    })).then(() => new Promise(resolve => {
                        app.model.dmChucVu.getAll((error, items) => {
                            (items || []).forEach(item => chucVuMapping[item.ma] = item.ten);
                            resolve();
                        });
                    })).then(() => new Promise(resolve => {
                        app.model.dmTinhThanhPho.getAll((error, items) => {
                            (items || []).forEach(item => tinhMapping[item.ma] = item.ten);
                            resolve();
                        });
                    })).then(() => new Promise(resolve => {
                        app.model.dmQuanHuyen.getAll((error, items) => {
                            (items || []).forEach(item => huyenMapping[item.ma] = item.tenQuanHuyen);
                            resolve();
                        });
                    })).then(() => new Promise(resolve => {
                        app.model.dmPhuongXa.getAll((error, items) => {
                            (items || []).forEach(item => xaMapping[item.ma] = item.tenPhuongXa);
                            resolve();
                        });
                    })).then(() => new Promise(resolve => {
                        app.model.dmQuocGia.getAll((error, items) => {
                            (items || []).forEach(item => quocGiaMapping[item.maCode] = item.tenQuocGia);
                            resolve();
                        });
                    })).then(() => new Promise(resolve => {
                        app.model.dmChucDanhKhoaHoc.getAll((error, items) => {
                            (items || []).forEach(item => chucDanhMapping[item.ma] = item.ten);
                            resolve();
                        });
                    })).then(() => new Promise(resolve => {
                        app.model.dmTrinhDo.getAll((error, items) => {
                            (items || []).forEach(item => trinhDoMapping[item.ma] = item.ten);
                            resolve();
                        });
                    })).then(() => new Promise(resolve => {
                        app.model.dmTrinhDoQuanLyNhaNuoc.getAll((error, items) => {
                            (items || []).forEach(item => trinhDoQuanLyNhaNuocMapping[item.ma] = item.ten);
                            resolve();
                        });
                    })).then(() => new Promise(resolve => {
                        app.model.dmTrinhDoTinHoc.getAll((error, items) => {
                            (items || []).forEach(item => trinhDoTinHocMapping[item.ma] = item.ten);
                            resolve();
                        });
                    })).then(() => new Promise(resolve => {
                        app.model.dmQuanHeGiaDinh.getAll((error, items) => {
                            (items || []).forEach(item => quanHeMapping[item.ma] = item.ten);
                            resolve();
                        });
                    })).then(() => new Promise(resolve => {
                        app.model.dmNgoaiNgu.getAll((error, items) => {
                            (items || []).forEach(item => ngoaiNguMapping[item.ma] = item.ten);
                            resolve();
                        });
                    })).then(() => new Promise(resolve => {
                        const data = {
                            HO_TEN: (canBo.ho + ' ' + canBo.ten).toUpperCase(),
                            otherName: canBo.biDanh ? canBo.biDanh : '',
                            cmnd: canBo.cmnd ? canBo.cmnd : '',
                            ngayCap: app.date.viDateFormat(new Date(canBo.cmndNgayCap)),
                            dob: new Date(canBo.ngaySinh).getDate(),
                            mob: new Date(canBo.ngaySinh).getMonth() + 1,
                            yob: new Date(canBo.ngaySinh).getFullYear(),
                            sex: canBo.phai == '01' ? 'Nam' : canBo.phai == '02' ? 'Nữ' : '',
                            // gioi tinh 00 sua lai -> neu ko co data thi de trong
                            // nsXa: canBo.maXaNoiSinh ? xaMapping[canBo.maXaNoiSinh] + ',' : '',
                            // nsHuyen: canBo.maHuyenNoiSinh ? huyenMapping[canBo.maHuyenNoiSinh] + ',' : '',
                            // nsTinh: canBo.tinhNoiSinh ? tinhMapping[canBo.maTinhNoiSinh] : '',
                            // qqXa: canBo.maXaNguyenQuan ? xaMapping[canBo.xaNguyenQuan] + ',' : '',
                            // qqHuyen: canBo.maHuyenNguyenQuan ? huyenMapping[canBo.maHuyenNguyenQuan] + ',' : '',
                            // qqTinh: canBo.maTinhNguyenQuan ? tinhMapping[canBo.maTinhNguyenQuan] : '',
                            noiSinh: canBo.noiSinh ? canBo.noiSinh : '',
                            queQuan: canBo.queQuan ? canBo.queQuan : '',
                            danToc: canBo.danToc ? danTocMapping[canBo.danToc] : '',
                            tonGiao: canBo.tonGiao ? tonGiaoMapping[canBo.tonGiao] : 'Không',
                            hoKhau: canBo.hoKhau ? canBo.hoKhau : '',
                            diaChiHienTai: canBo.diaChiHienTai ? canBo.diaChiHienTai : '',
                            ngheNghiepCu: canBo.ngheNghiepCu ? canBo.ngheNghiepCu : '',
                            ngayBatDauCongTac: canBo.ngayBatDauCongTac ? app.date.viDateFormat(new Date(canBo.ngayBatDauCongTac)) : '',
                            ngayBienChe: canBo.ngayBienChe ? app.date.viDateFormat(new Date(canBo.ngayBienChe)) : '',
                            // ngach_cong_chuc: canBo.tenNgach ? canBo.tenNgach : '',
                            // ma_ngach: canBo.maNgach ? canBo.maNgach : '',
                            // bac_luong: canBo.bacLuong ? canBo.bacLuong : '',
                            // he_so_luong: canBo.heSoLuong ? canBo.heSoLuong : '',
                            // ngay_huong_luong: canBo.ngayHuongLuong ? app.date.viDateFormat(new Date(canBo.ngayHuongLuong)) : '',
                            // phu_cap_cv: canBo.phuCapCongViec ? canBo.phuCapCongViec : '',
                            trinh_do_llct: canBo.maTrinhDoLlct ? trinhDoLyLuanChinhTriMapping[canBo.maTrinhDoLlct] : '',
                            trinh_do_qlnn: canBo.maTrinhDoQlnn ? trinhDoQuanLyNhaNuocMapping[canBo.maTrinhDoQlnn] : '',
                            trinhDoPhoThong: canBo.trinhDoPhoThong ? canBo.trinhDoPhoThong : '',
                            // trinh_do_nn: canBo.trinhDoNn ? canBo.trinhDoQlnn : '',
                            trinh_do_tin_hoc: canBo.maTrinhDoTinHoc ? trinhDoTinHocMapping[canBo.maTrinhDoTinHoc] : '',
                            trinh_do: canBo.hocVi ? trinhDoMapping[canBo.hocVi] : '',
                            chucVu: canBo.maChucVu ? chucVuMapping[canBo.maChucVu] : '',
                            donVi: canBo.maDonVi ? donViMapping[canBo.maDonVi] : '',
                            quanhe: [],
                            quanHeInLaw: [],
                            ngoaiNgu: [],
                            daoTao: [],
                            htct: [],
                            // chuyenngach0: chuyenngach && chuyenngach[0] ? chuyenngach[0] : null,
                            // chuyenngach1: chuyenngach && chuyenngach[1] ? chuyenngach[1] : null,
                            // chuyenngach2: chuyenngach && chuyenngach[2] ? chuyenngach[2] : null,
                            // chuyenngach3: chuyenngach && chuyenngach[3] ? chuyenngach[3] : null,
                            nhomMau: canBo.nhomMau ? canBo.nhomMau : '',
                            sucKhoe: canBo.sucKhoe ? canBo.sucKhoe : '',
                            canNang: canBo.canNang ? canBo.canNang : '',
                            chieuCao: canBo.chieuCao ? Math.floor(Number(canBo.chieuCao) / 100) + 'm' + (Number(canBo.chieuCao) % 100) : '',
                            ngayVaoDang: canBo.ngayVaoDang ? app.date.viDateFormat(new Date(canBo.ngayVaoDang)) : '',
                            ngayVaoDangChinhThuc: canBo.ngayVaoDangChinhThuc ? app.date.viDateFormat(new Date(canBo.ngayVaoDangChinhThuc)) : '',
                            danhHieu: canBo.danhHieu ? canBo.danhHieu : '',
                            soTruong: canBo.soTruong ? canBo.soTruong : '',
                            bhxh: canBo.soBhxh ? canBo.soBhxh : '',
                            ngayNhapNgu: canBo.ngayNhapNgu ? app.date.viDateFormat(new Date(canBo.ngayNhapNgu)) : '',
                            ngayXuatNgu: canBo.ngayXuatNgu ? app.date.viDateFormat(new Date(canBo.ngayXuatNgu)) : '',
                            quanHam: canBo.quanHam ? canBo.quanHam : '',
                            hangThuongBinh: canBo.hangThuongBinh ? canBo.hangThuongBinh : '',
                            giaDinhChinhSach: canBo.giaDinhChinhSach ? canBo.giaDinhChinhSach : ''
                        };
                        resolve(data);

                    })).then((data) => new Promise(resolve => {
                        app.model.quanHeCanBo.getAll({ shcc: canBo.shcc }, '*', 'id ASC', (error, qhItems) => {
                            if (!error && qhItems && qhItems.length > 0) {
                                const handleQuanHe = (index = 0) => {
                                    let item = qhItems[index];
                                    if (index < qhItems.length) {
                                        if (item.type == 0) data.quanhe.push({
                                            moiQuanHe: item.moiQuanHe ? quanHeMapping[item.moiQuanHe] : '',
                                            hoTen: item.hoTen,
                                            namSinh: item.namSinh ? new Date(item.namSinh).getFullYear() : '',
                                            queQuan: item.queQuan ? item.queQuan : '',
                                            ngheNghiep: item.ngheNghiep ? item.ngheNghiep : '',
                                            diaChi: item.diaChi ? item.diaChi : ''
                                        }); else data.quanHeInLaw.push({
                                            moiQuanHe: item.moiQuanHe ? quanHeMapping[item.moiQuanHe] : '',
                                            hoTen: item.hoTen,
                                            namSinh: item.namSinh ? new Date(item.namSinh).getFullYear() : '',
                                            queQuan: item.queQuan ? item.queQuan : '',
                                            ngheNghiep: item.ngheNghiep ? item.ngheNghiep : '',
                                            diaChi: item.diaChi ? item.diaChi : ''
                                        });
                                        handleQuanHe(index + 1);
                                    }
                                };
                                handleQuanHe();
                            }
                            resolve(data);
                        });
                    })).then((data) => new Promise(resolve => {
                        app.model.trinhDoNgoaiNgu.getAll({ shcc: canBo.shcc }, '*', 'id ASC', (error, nnItems) => {
                            if (!error && nnItems && nnItems.length > 0) {
                                const handleNgoaiNgu = (index = 0) => {
                                    let item = nnItems[index];
                                    if (index < nnItems.length) {
                                        if (item.loaiNgonNgu) data.ngoaiNgu.push({
                                            ngonNgu: ngoaiNguMapping[item.loaiNgonNgu],
                                            trinhDo: item.trinhDo
                                        });
                                        handleNgoaiNgu(index + 1);
                                    }
                                };
                                handleNgoaiNgu();
                            }
                            resolve(data);
                        });
                    })).then((data) => new Promise(resolve => {
                        app.model.qtDaoTao.getAll({ shcc: canBo.shcc }, '*', 'id ASC', (error, dtItems) => {
                            if (!error && dtItems && dtItems.length > 0) {
                                const handleDaoTao = (index = 0) => {
                                    let item = dtItems[index];
                                    if (index < dtItems.length) {
                                        data.daoTao.push({
                                            coSo: item.tenTruong,
                                            chuyenNganh: item.chuyenNganh ? item.chuyenNganh : '',
                                            batDau: item.batDau ? app.date.dateTimeFormat(new Date(item.batDau), item.batDauType ? item.batDauType : 'dd/mm/yyyy') : '',
                                            ketThuc: item.ketThuc ? app.date.dateTimeFormat(new Date(item.ketThuc), item.ketThucType ? item.ketThucType : 'dd/mm/yyyy') : '',
                                            hinhThuc: item.hinhThuc ? item.hinhThuc : '',
                                            vanBang: item.loaiBangCap ? item.loaiBangCap : '',
                                            thoiGian: item.thoiGian ? item.thoiGian + ' tháng' : ''
                                        });
                                        handleDaoTao(index + 1);
                                    }
                                };
                                handleDaoTao();
                            }
                            resolve(data);
                        });
                    })).then((data) => new Promise(resolve => {
                        app.model.qtHocTapCongTac.getAll({ shcc: canBo.shcc }, '*', 'batDau ASC', (error, htctItems) => {
                            if (!error && htctItems && htctItems.length > 0) {
                                const handleHtct = (index = 0) => {
                                    let item = htctItems[index];
                                    if (index < htctItems.length) {
                                        data.htct.push({
                                            noiDung: item.noiDung ? item.noiDung : '',
                                            batDau: item.batDau ? app.date.dateTimeFormat(new Date(item.batDau), item.batDauType ? item.batDauType : 'dd/mm/yyyy') : '',
                                            ketThuc: item.ketThuc ? item.ketThuc == -1 ? 'đến nay' : app.date.dateTimeFormat(new Date(item.ketThuc), item.ketThucType ? item.ketThucType : 'dd/mm/yyyy') : '',
                                        });
                                        handleHtct(index + 1);
                                    }
                                };
                                handleHtct();
                            }
                            resolve(data);
                        });
                    })).then((data) => {
                        app.docx.generateFile(source, data, (error, data) => {
                            if (error)
                                res.send({ error });
                            else
                                res.send({ data });
                        });
                    });
                }
            });
        }
    });

    app.get('/user/staff/:shcc/word-llkh', app.permission.check('staff:login'), (req, res) => {
        if (req.params && req.params.shcc) {
            app.model.canBo.get({ shcc: req.params.shcc }, (error, canBo) => {
                if (error || canBo == null) {
                    res.send({ error });
                } else {
                    const danTocMapping = {}, quocGiaMapping = {}, tonGiaoMapping = {}, trinhDoLyLuanChinhTriMapping = {}, donViMapping = {}, chucVuMapping = {},
                        tinhMapping = {}, xaMapping = {}, huyenMapping = {}, chucDanhMapping = {}, trinhDoMapping = {}, trinhDoQuanLyNhaNuocMapping = {},
                        trinhDoTinHocMapping = {}, quanHeMapping = {}, ngoaiNguMapping = {};
                    const source = app.path.join(__dirname, 'resource', 'Mau-LLKH.docx');

                    new Promise(resolve => {
                        app.model.dmDanToc.getAll((error, items) => {
                            (items || []).forEach(item => danTocMapping[item.ma] = item.ten);
                            resolve();
                        });
                    }).then(() => new Promise(resolve => {
                        app.model.dmTonGiao.getAll((error, items) => {
                            (items || []).forEach(item => tonGiaoMapping[item.ma] = item.ten);
                            resolve();
                        });
                    })).then(() => new Promise(resolve => {
                        app.model.dmTrinhDoLyLuanChinhTri.getAll((error, items) => {
                            (items || []).forEach(item => trinhDoLyLuanChinhTriMapping[item.ma] = item.ten);
                            resolve();
                        });
                    })).then(() => new Promise(resolve => {
                        app.model.dmDonVi.getAll((error, items) => {
                            (items || []).forEach(item => donViMapping[item.ma] = item.ten);
                            resolve();
                        });
                    })).then(() => new Promise(resolve => {
                        app.model.dmChucVu.getAll((error, items) => {
                            (items || []).forEach(item => chucVuMapping[item.ma] = item.ten);
                            resolve();
                        });
                    })).then(() => new Promise(resolve => {
                        app.model.dmTinhThanhPho.getAll((error, items) => {
                            (items || []).forEach(item => tinhMapping[item.ma] = item.ten);
                            resolve();
                        });
                    })).then(() => new Promise(resolve => {
                        app.model.dmQuanHuyen.getAll((error, items) => {
                            (items || []).forEach(item => huyenMapping[item.ma] = item.tenQuanHuyen);
                            resolve();
                        });
                    })).then(() => new Promise(resolve => {
                        app.model.dmPhuongXa.getAll((error, items) => {
                            (items || []).forEach(item => xaMapping[item.ma] = item.tenPhuongXa);
                            resolve();
                        });
                    })).then(() => new Promise(resolve => {
                        app.model.dmQuocGia.getAll((error, items) => {
                            (items || []).forEach(item => quocGiaMapping[item.maCode] = item.tenQuocGia);
                            resolve();
                        });
                    })).then(() => new Promise(resolve => {
                        app.model.dmChucDanhKhoaHoc.getAll((error, items) => {
                            (items || []).forEach(item => chucDanhMapping[item.ma] = item.ten);
                            resolve();
                        });
                    })).then(() => new Promise(resolve => {
                        app.model.dmTrinhDo.getAll((error, items) => {
                            (items || []).forEach(item => trinhDoMapping[item.ma] = item.ten);
                            resolve();
                        });
                    })).then(() => new Promise(resolve => {
                        app.model.dmTrinhDoQuanLyNhaNuoc.getAll((error, items) => {
                            (items || []).forEach(item => trinhDoQuanLyNhaNuocMapping[item.ma] = item.ten);
                            resolve();
                        });
                    })).then(() => new Promise(resolve => {
                        app.model.dmTrinhDoTinHoc.getAll((error, items) => {
                            (items || []).forEach(item => trinhDoTinHocMapping[item.ma] = item.ten);
                            resolve();
                        });
                    })).then(() => new Promise(resolve => {
                        app.model.dmQuanHeGiaDinh.getAll((error, items) => {
                            (items || []).forEach(item => quanHeMapping[item.ma] = item.ten);
                            resolve();
                        });
                    })).then(() => new Promise(resolve => {
                        app.model.dmNgoaiNgu.getAll((error, items) => {
                            (items || []).forEach(item => ngoaiNguMapping[item.ma] = item.ten);
                            resolve();
                        });
                    })).then(() => new Promise(resolve => {
                        const data = {
                            hoTen: (canBo.ho + ' ' + canBo.ten).toUpperCase(),
                            ngaySinh: canBo.ngaySinh ? app.date.viDateFormat(new Date(canBo.ngaySinh)) : '',
                            nam: canBo.phai == '01' ? true : false,
                            nu: canBo.phai == '02' ? true : false,
                            dienThoaiBaoTin: canBo.dienThoaiBaoTin ? canBo.dienThoaiBaoTin : '',
                            dienThoaiCaNhan: canBo.dienThoaiCaNhan ? canBo.dienThoaiCaNhan : '',
                            noiSinh: canBo.noiSinh ? canBo.noiSinh : '',
                            diaChi: canBo.diaChiHienTai ? canBo.diaChiHienTai : '',
                            hocVi: canBo.hocVi ? trinhDoMapping[canBo.hocVi] : '',
                            chucVu: canBo.maChucVu ? chucVuMapping[canBo.maChucVu] : '',
                            donVi: canBo.maDonVi ? donViMapping[canBo.maDonVi] : '',
                            chucDanh: canBo.chucDanh ? chucDanhMapping[canBo.chucDanh] : '',
                            namHocVi: canBo.namHocVi ? new Date(canBo.namHocVi).getFullYear() : '',
                            namChucDanh: canBo.namChucDanh ? new Date(canBo.namChucDanh).getFullYear() : '',
                            emailTruong: canBo.email ? canBo.email : '',
                            emailCaNhan: canBo.emailCaNhan ? canBo.emailCaNhan : '',
                        };
                        let firstMst, lastMst;
                        if (canBo.shcc.includes('.')) {
                            firstMst = canBo.shcc.split('.')[0];
                            lastMst = canBo.shcc.split('.')[1];
                        } else {
                            firstMst = canBo.shcc.substring(0, canBo.shcc.length - 4);
                            lastMst = canBo.shcc.substring(canBo.shcc.length - 4);
                        }
                        if (firstMst.length == 1) {
                            data.m1 = '';
                            data.m2 = '';
                            data.m3 = firstMst;
                        }
                        else if (firstMst.length == 2) {
                            data.m1 = '';
                            data.m2 = firstMst[0];
                            data.m3 = firstMst[1];
                        } else if (firstMst.length == 3) {
                            data.m1 = firstMst[0];
                            data.m2 = firstMst[1];
                            data.m3 = firstMst[2];
                        }
                        data.m4 = lastMst[0];
                        data.m5 = lastMst[1] ? lastMst[1] : '';
                        data.m6 = lastMst[2] ? lastMst[2] : '';
                        data.m7 = lastMst[3] ? lastMst[3] : '';

                        resolve(data);

                    })).then((data) => {
                        app.docx.generateFile(source, data, (error, data) => {
                            if (error) {
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

    // Hook--------------------------------------------------------------------------------------------------------------------------------------------------------
    const staffImportData = (req, fields, files, params, done) => {
        if (fields.userData && fields.userData[0] && fields.userData[0] == 'staffImportData' && files.staffFile && files.staffFile.length > 0) {
            const srcPath = files.staffFile[0].path;
            // Table name: TCHC_CAN_BO { ten, ho, phai, dienThoaiCaNhan, email, ngaySinh, ngayBatDauCongTac, ngayCbgd, ngayBienChe, ngayNghi, ngach, ngachMoi, heSoLuong, bacLuong, mocNangLuong, ngayHuongLuong, tyLeVuotKhung, phuCapCongViec, ngayPhuCapCongViec, maChucVu, chucVuDoanThe, chucVuDang, chucVuKiemNhiem, maTrinhDoLlct, maTrinhDoQlnn, maTrinhDoNn, maTrinhDoTinHoc, hoKhau, diaChiHienTai, danToc, tonGiao, dangVien, maDonVi, phucLoi, nhaGiaoNhanDan, nhaGiaoUuTu, dangONuocNgoai, lyDoONuocNgoai, ghiChu, shcc, emailCaNhan, biDanh, dienThoaiBaoTin, ngheNghiepCu, cmnd, cmndNgayCap, cmndNoiCap, chucVuKhac, quocGia, chucDanh, trinhDoPhoThong, hocVi, chuyenNganh, sucKhoe, canNang, chieuCao, ngayNhapNgu, ngayXuatNgu, quanHamCaoNhat, hangThuongBinh, giaDinhChinhSach, danhHieu, maXaNoiSinh, maHuyenNoiSinh, maTinhNoiSinh, maXaNguyenQuan, maHuyenNguyenQuan, maTinhNguyenQuan, ngayVaoDang, ngayVaoDangChinhThuc, noiDangDb, noiDangCt, ngayVaoDoan, noiVaoDoan, soTheDang, soTruong, nhomMau, soBhxh, doanVien, namChucDanh, namHocVi }
            app.excel.readFile(srcPath, workbook => {
                if (workbook) {
                    const worksheet = workbook.getWorksheet(1), element = [], totalRow = worksheet.lastRow.number;
                    const handleUpload = (index = 5) => {
                        if (index == totalRow + 1) {
                            app.deleteFile(srcPath);
                            done({ element });
                        } else {
                            if (worksheet.getCell('B' + index).value) {
                                let newElement = {
                                    shcc: worksheet.getCell('C' + index).value,
                                    hoTen: worksheet.getCell('D' + index).value ? worksheet.getCell('D' + index).value.trim() : '',
                                    biDanh: worksheet.getCell('E' + index).value ? worksheet.getCell('E' + index).value.trim() : '',
                                    phai: worksheet.getCell('F' + index).value && typeof (worksheet.getCell('F' + index).value) == 'string' ? worksheet.getCell('F' + index).value.trim() : 'Nam',
                                    ngaySinh: worksheet.getCell('G' + index).value ? new Date(worksheet.getCell('G' + index).value).getTime() : null,
                                    noiSinh: worksheet.getCell('H' + index).value ? worksheet.getCell('H' + index).value.trim() : '',
                                    cmnd: worksheet.getCell('I' + index).value,
                                    cmndNgayCap: worksheet.getCell('J' + index).value ? new Date(worksheet.getCell('J' + index).value).getTime() : null,
                                    cmndNoiCap: worksheet.getCell('K' + index).value,
                                    nguyenQuan: worksheet.getCell('L' + index).value ? worksheet.getCell('L' + index).value.trim() : '',
                                    hoKhau: worksheet.getCell('M' + index).value ? worksheet.getCell('M' + index).value.trim() : '',
                                    diaChiHienTai: worksheet.getCell('N' + index).value ? worksheet.getCell('N' + index).value.trim() : '',
                                    dienThoaiCaNhan: worksheet.getCell('O' + index).value,
                                    dienThoaiBaoTin: worksheet.getCell('P' + index).value,
                                    emailCaNhan: worksheet.getCell('Q' + index).value ? typeof (worksheet.getCell('Q' + index).value) == 'string' ? worksheet.getCell('Q' + index).value : worksheet.getCell('Q' + index).value.text : null,
                                    email: worksheet.getCell('R' + index).value ? typeof (worksheet.getCell('R' + index).value) == 'string' ? worksheet.getCell('R' + index).value : worksheet.getCell('R' + index).value.text : null,
                                    quocGia: worksheet.getCell('S' + index).value ? worksheet.getCell('S' + index).value.trim() : '',
                                    danToc: worksheet.getCell('T' + index).value ? worksheet.getCell('T' + index).value.trim() : '',
                                    tonGiao: worksheet.getCell('U' + index).value ? worksheet.getCell('U' + index).value.trim() : '',
                                    ngheNghiepCu: worksheet.getCell('V' + index).value,
                                    ngayBatDauCongTac: worksheet.getCell('W' + index).value ? new Date(worksheet.getCell('W' + index).value).getTime() : null,
                                    ngayBienChe: worksheet.getCell('X' + index).value ? new Date(worksheet.getCell('X' + index).value).getTime() : null,
                                    trinhDoTinHoc: worksheet.getCell('AB' + index).value,
                                    donVi: worksheet.getCell('AC' + index).value ? worksheet.getCell('AC' + index).value.trim() : '',
                                    // chucVu: worksheet.getCell('AD' + index).value,
                                    chucDanh: worksheet.getCell('AI' + index).value ? worksheet.getCell('AI' + index).value : worksheet.getCell('AG' + index).value,
                                    trinhDoPhoThong: worksheet.getCell('AH' + index).value ? worksheet.getCell('AH' + index).value : '',
                                    namChucDanh: worksheet.getCell('AJ' + index).value ? new Date(worksheet.getCell('AJ' + index).value).getTime() : null,
                                    hocVi: worksheet.getCell('AK' + index).value ? worksheet.getCell('AK' + index).value.trim() : '',
                                    chuyenNganh: worksheet.getCell('AL' + index).value,
                                    namHocVi: worksheet.getCell('AM' + index).value ? new Date(worksheet.getCell('AM' + index).value).getTime() : null,
                                    trinhDoLlct: worksheet.getCell('AN' + index).value ? worksheet.getCell('AN' + index).value : '',
                                    trinhDoQlnn: worksheet.getCell('AO' + index).value ? worksheet.getCell('AO' + index).value : '',
                                    soTruong: worksheet.getCell('AP' + index).value,
                                    sucKhoe: worksheet.getCell('AQ' + index).value,
                                    canNang: worksheet.getCell('AR' + index).value ? worksheet.getCell('AR' + index).value.toString().replaceAll('kg', '') : null,
                                    // chieuCao: worksheet.getCell('AS' + index).value, 
                                    nhomMau: worksheet.getCell('AT' + index).value,
                                    ngayVaoDoan: worksheet.getCell('AU' + index).value ? new Date(worksheet.getCell('AU' + index).value).getTime() : null,
                                    noiVaoDang: worksheet.getCell('AV' + index).value,
                                    ngayVaoDang: worksheet.getCell('AW' + index).value ? new Date(worksheet.getCell('AW' + index).value).getTime() : null,
                                    ngayVaoDangChinhThuc: worksheet.getCell('AX' + index).value ? new Date(worksheet.getCell('AX' + index).value).getTime() : null,
                                    // noiVaoDang: worksheet.getCell('AY' + index).value,//TODO
                                    ngayNhapNgu: worksheet.getCell('AZ' + index).value ? new Date(worksheet.getCell('AZ' + index).value).getTime() : null,
                                    ngayXuatNgu: worksheet.getCell('BA' + index).value ? new Date(worksheet.getCell('BA' + index).value).getTime() : null,
                                    quanHam: worksheet.getCell('BB' + index).value,
                                    hangThuongBinh: worksheet.getCell('BC' + index).value,
                                    giaDinhChinhSach: worksheet.getCell('BD' + index).value,
                                    danhHieu: worksheet.getCell('BE' + index).value,
                                    tuNhanXetUuDiem: worksheet.getCell('FG' + index).value,
                                    loiCamDoan: worksheet.getCell('FI' + index).value,
                                };
                                let chieuCao = worksheet.getCell('AS' + index).value ? worksheet.getCell('AS' + index).value.toString() : null;
                                if (chieuCao && chieuCao.includes('cm')) {
                                    newElement.chieuCao = Number(chieuCao.split('cm')[0]);
                                } else if (chieuCao && chieuCao.includes('m')) {
                                    newElement.chieuCao = Number(chieuCao.split('m')[0]) * 100 + Number(chieuCao.split('m')[1]);
                                }
                                const handleChucVu = (cIndex) => {
                                    if (cIndex <= totalRow && (cIndex == index || !worksheet.getCell('B' + cIndex).value)) {
                                        if (worksheet.getCell('AE' + cIndex).value && worksheet.getCell('AF' + cIndex).value) {
                                            if (worksheet.getCell('AE' + cIndex).value.toLowerCase() == 'đoàn thể') newElement.chucVuDoanThe = worksheet.getCell('AF' + cIndex).value;
                                            if (worksheet.getCell('AE' + cIndex).value.toLowerCase() == 'chính quyền') newElement.chucVu = worksheet.getCell('AF' + cIndex).value;
                                            if (worksheet.getCell('AE' + cIndex).value.toLowerCase() == 'đảng') newElement.chucVuDang = worksheet.getCell('AF' + cIndex).value;
                                            if (worksheet.getCell('AE' + cIndex).value.toLowerCase() == 'kiêm nhiệm') newElement.chucVuKiemNhiem = worksheet.getCell('AF' + cIndex).value;
                                            if (worksheet.getCell('AE' + cIndex).value.toLowerCase() == 'khác') newElement.chucVuKhac = worksheet.getCell('AF' + cIndex).value;
                                        }
                                        handleChucVu(cIndex + 1);
                                    }
                                };
                                handleChucVu(index);
                                newElement.quanHe = [];
                                const handleQuanHe1 = (qIndex) => {
                                    if (qIndex <= totalRow && (qIndex == index || !worksheet.getCell('B' + qIndex).value)) {
                                        if (worksheet.getCell('BM' + qIndex).value && worksheet.getCell('BN' + qIndex).value) {
                                            let curQuanHe = {}, nextQIndex;
                                            nextQIndex = qIndex + 1;
                                            while (worksheet.getCell('BN' + qIndex).value == worksheet.getCell('BN' + nextQIndex).value) {
                                                nextQIndex++;
                                            }
                                            curQuanHe.quanHe = worksheet.getCell('BM' + qIndex).value && typeof (worksheet.getCell('BM' + qIndex).value) == 'string' ? worksheet.getCell('BM' + qIndex).value.trim() : '';
                                            curQuanHe.hoTen = worksheet.getCell('BN' + qIndex).value;
                                            curQuanHe.namSinh = worksheet.getCell('BO' + qIndex).value;
                                            curQuanHe.type = 0;

                                            for (let i = qIndex; i < nextQIndex; i++) {
                                                let value = worksheet.getCell('BP' + i).value && typeof (worksheet.getCell('BP' + i).value) == 'string' && worksheet.getCell('BP' + i).value.split(':')[1] ? worksheet.getCell('BP' + i).value.split(':')[1].trim() : null;
                                                if (value && worksheet.getCell('BP' + i).value && worksheet.getCell('BP' + i).value.includes('Quê quán')) curQuanHe.queQuan = value;
                                                else if (value && worksheet.getCell('BP' + i).value && worksheet.getCell('BP' + i).value.includes('Nghề nghiệp')) curQuanHe.ngheNghiep = value;
                                                else if (value && worksheet.getCell('BP' + i).value && worksheet.getCell('BP' + i).value.includes('Nơi ở hiện nay')) curQuanHe.diaChi = value;
                                            }
                                            newElement.quanHe.push(curQuanHe);
                                            qIndex = nextQIndex - 1;
                                        }
                                        handleQuanHe1(qIndex + 1);
                                    }
                                };
                                handleQuanHe1(index);
                                const handleQuanHe2 = (qIndex) => {
                                    if (qIndex <= totalRow && (qIndex == index || !worksheet.getCell('B' + qIndex).value)) {
                                        if (worksheet.getCell('BR' + qIndex).value && worksheet.getCell('BS' + qIndex).value) {
                                            let curQuanHe = {}, nextQIndex;
                                            nextQIndex = qIndex + 1;
                                            while (worksheet.getCell('BS' + qIndex).value == worksheet.getCell('BS' + nextQIndex).value) {
                                                nextQIndex++;
                                            }
                                            curQuanHe.quanHe = worksheet.getCell('BR' + qIndex).value && typeof (worksheet.getCell('BR' + qIndex).value) == 'string' ? worksheet.getCell('BR' + qIndex).value.trim() : '';
                                            curQuanHe.hoTen = worksheet.getCell('BS' + qIndex).value;
                                            curQuanHe.namSinh = worksheet.getCell('BT' + qIndex).value;
                                            curQuanHe.type = 0;

                                            for (let i = qIndex; i < nextQIndex; i++) {
                                                let value = worksheet.getCell('BU' + i).value && typeof (worksheet.getCell('BU' + i).value) == 'string' && worksheet.getCell('BU' + i).value.split(':')[1] ? worksheet.getCell('BU' + i).value.split(':')[1].trim() : null;
                                                if (value && worksheet.getCell('BU' + i).value && worksheet.getCell('BU' + i).value.includes('Quê quán')) curQuanHe.queQuan = value;
                                                else if (value && worksheet.getCell('BU' + i).value && worksheet.getCell('BU' + i).value.includes('Nghề nghiệp')) curQuanHe.ngheNghiep = value;
                                                else if (value && worksheet.getCell('BU' + i).value && worksheet.getCell('BU' + i).value.includes('Nơi ở hiện nay')) curQuanHe.diaChi = value;
                                            }
                                            newElement.quanHe.push(curQuanHe);
                                            qIndex = nextQIndex - 1;
                                        }
                                        handleQuanHe2(qIndex + 1);
                                    }
                                };
                                handleQuanHe2(index);
                                const handleQuanHe3 = (qIndex) => {
                                    if (qIndex <= totalRow && (qIndex == index || !worksheet.getCell('B' + qIndex).value)) {
                                        if (worksheet.getCell('BW' + qIndex).value && worksheet.getCell('BX' + qIndex).value) {
                                            let curQuanHe = {}, nextQIndex;
                                            nextQIndex = qIndex + 1;
                                            while (worksheet.getCell('BX' + qIndex).value == worksheet.getCell('BX' + nextQIndex).value) {
                                                nextQIndex++;
                                            }
                                            curQuanHe.quanHe = worksheet.getCell('BW' + qIndex).value && typeof (worksheet.getCell('BW' + qIndex).value) == 'string' ? worksheet.getCell('BW' + qIndex).value.trim() : '';
                                            curQuanHe.hoTen = worksheet.getCell('BX' + qIndex).value;
                                            curQuanHe.namSinh = worksheet.getCell('BY' + qIndex).value;
                                            curQuanHe.type = 1;

                                            for (let i = qIndex; i < nextQIndex; i++) {
                                                let value = worksheet.getCell('BZ' + i).value && typeof (worksheet.getCell('BZ' + i).value) == 'string' && worksheet.getCell('BZ' + i).value.split(':')[1] ? worksheet.getCell('BZ' + i).value.split(':')[1].trim() : null;
                                                if (value && worksheet.getCell('BZ' + i).value && worksheet.getCell('BZ' + i).value.includes('Quê quán')) curQuanHe.queQuan = value;
                                                else if (value && worksheet.getCell('BZ' + i).value && worksheet.getCell('BZ' + i).value.includes('Nghề nghiệp')) curQuanHe.ngheNghiep = value;
                                                else if (value && worksheet.getCell('BZ' + i).value && worksheet.getCell('BZ' + i).value.includes('Nơi ở hiện nay')) curQuanHe.diaChi = value;
                                            }
                                            newElement.quanHe.push(curQuanHe);
                                            qIndex = nextQIndex - 1;
                                        }
                                        handleQuanHe3(qIndex + 1);
                                    }
                                };
                                handleQuanHe3(index);
                                newElement.trinhDoNgoaiNgu = [];
                                const handleTrinhDoTinHoc = (tIndex) => {
                                    if (tIndex <= totalRow && (tIndex == index || !worksheet.getCell('B' + tIndex).value)) {
                                        if (worksheet.getCell('Z' + tIndex).value && worksheet.getCell('AA' + tIndex).value) {
                                            newElement.trinhDoNgoaiNgu.push({
                                                loaiNgonNgu: worksheet.getCell('Z' + tIndex).value,
                                                trinhDo: worksheet.getCell('AA' + tIndex).value
                                            });
                                        }
                                        handleTrinhDoTinHoc(tIndex + 1);
                                    }
                                };
                                handleTrinhDoTinHoc(index);

                                const getTime = (date, format) => {
                                    if (format == 'yyyy') return new Date(date).getTime();
                                    else if (format == 'mm/yyyy') return new Date(date.split('/')[1] + '/' + date.split('/')[0]).getTime();
                                    else if (format == 'dd/mm/yyyy') return new Date(date.split('/')[2] + '/' + date.split('/')[1] + '/' + date.split('/')[0]).getTime();
                                };

                                newElement.qtHtct = [];
                                const handleQTHTCT = (qtIndex) => {
                                    if (qtIndex <= totalRow && (qtIndex == index || !worksheet.getCell('B' + qtIndex).value)) {
                                        if (worksheet.getCell('CB' + qtIndex).value && worksheet.getCell('CC' + qtIndex).value) {
                                            let time = worksheet.getCell('CB' + qtIndex).value.toString(),
                                                noiDung = worksheet.getCell('CC' + qtIndex).value,
                                                batDau, ketThuc, batDauType, ketThucType,
                                                timeList = time ? time.replaceAll(/\./g, '/').match(/([0-9]?[0-9][/])?([0-9]?[0-9][/])?[0-9][0-9][0-9][0-9]/g) : [],
                                                monthPatt = /[0-9]?[0-9][/][0-9][0-9][0-9][0-9]/,
                                                yearPatt = /[0-9][0-9][0-9][0-9]/;
                                            if (timeList && timeList.length == 1) {
                                                batDau = timeList[0];
                                                batDauType = monthPatt.test(batDau) ? 'mm/yyyy' : yearPatt.test(batDau) ? 'yyyy' : null;
                                            } else if (timeList && timeList.length == 2) {
                                                batDau = timeList[0];
                                                ketThuc = timeList[1];
                                                batDauType = monthPatt.test(batDau) ? 'mm/yyyy' : yearPatt.test(batDau) ? 'yyyy' : null;
                                                ketThucType = monthPatt.test(ketThuc) ? 'mm/yyyy' : yearPatt.test(ketThuc) ? 'yyyy' : null;
                                            }
                                            if (time && (time.toLowerCase().includes('đến nay') || time.toLowerCase().includes('nay'))) {
                                                ketThuc = -1;
                                            }
                                            if (timeList && timeList.length > 0)
                                                newElement.qtHtct.push({
                                                    batDau: batDau ? batDauType == 'yyyy' ? new Date(batDau).getTime() : new Date(batDau.split('/')[1] + '/' + batDau.split('/')[0]).getTime() : null,
                                                    ketThuc: ketThuc && ketThuc != -1 ? ketThucType == 'yyyy' ? new Date(ketThuc).getTime() : new Date(ketThuc.split('/')[1] + '/' + ketThuc.split('/')[0]).getTime() : ketThuc,
                                                    noiDung: noiDung,
                                                    batDauType: batDauType,
                                                    ketThucType: ketThucType
                                                });
                                        }
                                        handleQTHTCT(qtIndex + 1);
                                    }
                                };
                                handleQTHTCT(index);

                                newElement.qtDaoTao = [];
                                const handleQTDaoTao = (qtIndex) => {
                                    if (qtIndex <= totalRow && (qtIndex == index || !worksheet.getCell('B' + qtIndex).value)) {
                                        if (worksheet.getCell('CE' + qtIndex).value && worksheet.getCell('CF' + qtIndex).value) {
                                            let tenTruong = worksheet.getCell('CE' + qtIndex).value,
                                                chuyenNganh = worksheet.getCell('CF' + qtIndex).value,
                                                time = worksheet.getCell('CG' + qtIndex).value,
                                                hinhThuc = worksheet.getCell('CH' + qtIndex).value,
                                                loaiBangCap = worksheet.getCell('CI' + qtIndex).value,
                                                batDau, ketThuc, batDauType, ketThucType, thoiGian,
                                                monthPatt = /[0-9]?[0-9][/][0-9][0-9][0-9][0-9]/,
                                                yearPatt = /[0-9][0-9][0-9][0-9]/,
                                                inTimeMonthPatt = /[0-9]+([.][0-9]+)?[ ]*tháng/,
                                                inTimeYearPatt = /[0-9]+([.][0-9]+)?[ ]*năm/;
                                            if (time && typeof (time) == 'object') {
                                                batDau = new Date(time).getTime();
                                            } else {
                                                if (time && time.toString().toLowerCase().trim().replaceAll(',', '.').match(/[0-9]+([.][0-9]+)?[ ]*(tháng|năm)/g)) {
                                                    if (inTimeMonthPatt.test(time.toLowerCase().trim().replaceAll(',', '.'))) {
                                                        thoiGian = Number(time.toLowerCase().trim().match(/[0-9]+([.][0-9]+)?/g)[0]);
                                                    } else if (inTimeYearPatt.test(time.toLowerCase().trim().replaceAll(',', '.'))) {
                                                        thoiGian = Number(time.toLowerCase().trim().replaceAll(',', '.').match(/[0-9]+([.][0-9]+)?/g)[0]) * 12;
                                                    }
                                                } else {
                                                    let timeList = time ? time.toString().replaceAll(/\./g, '/').match(/([0-9]?[0-9][/])?([0-9]?[0-9][/])?[0-9][0-9][0-9][0-9]/g) : [];
                                                    if (timeList && timeList.length == 1) {
                                                        batDau = timeList[0];
                                                        batDauType = monthPatt.test(batDau) ? 'mm/yyyy' : yearPatt.test(batDau) ? 'yyyy' : null;
                                                    } else if (timeList && timeList.length == 2) {
                                                        batDau = timeList[0];
                                                        ketThuc = timeList[1];
                                                        batDauType = monthPatt.test(batDau) ? 'mm/yyyy' : yearPatt.test(batDau) ? 'yyyy' : null;
                                                        ketThucType = monthPatt.test(ketThuc) ? 'mm/yyyy' : yearPatt.test(ketThuc) ? 'yyyy' : null;
                                                    }
                                                }
                                            }
                                            newElement.qtDaoTao.push({
                                                tenTruong: tenTruong,
                                                chuyenNganh: chuyenNganh,
                                                hinhThuc: hinhThuc,
                                                loaiBangCap: loaiBangCap,
                                                batDau: batDau && typeof (time) != 'object' ? getTime(batDau, batDauType) : batDau,
                                                ketThuc: ketThuc && ketThuc != -1 ? getTime(ketThuc, ketThucType) : ketThuc,
                                                batDauType: batDauType,
                                                ketThucType: ketThucType,
                                                thoiGian: thoiGian
                                            });
                                        }
                                        handleQTDaoTao(qtIndex + 1);
                                    }
                                };
                                handleQTDaoTao(index);

                                newElement.qtNuocNgoai = [];
                                const handleQTNuocNgoai = (qtIndex) => {
                                    if (qtIndex <= totalRow && (qtIndex == index || !worksheet.getCell('B' + qtIndex).value)) {
                                        if (worksheet.getCell('CK' + qtIndex).value && worksheet.getCell('CL' + qtIndex).value) {
                                            let time = worksheet.getCell('CK' + qtIndex).value,
                                                quocGia = worksheet.getCell('CL' + qtIndex).value,
                                                noiDung = worksheet.getCell('CM' + qtIndex).value,
                                                batDau, ketThuc, batDauType, ketThucType,
                                                dayPatt = /[0-9]?[0-9][/][0-9]?[0-9][/][0-9][0-9][0-9][0-9]/,
                                                monthPatt = /[0-9]?[0-9][/][0-9][0-9][0-9][0-9]/,
                                                yearPatt = /[0-9][0-9][0-9][0-9]/;
                                            if (time && typeof (time) == 'object') {
                                                batDau = new Date(time).getTime();
                                            } else {
                                                let timeList = time ? time.toString().replaceAll(/\./g, '/').match(/([0-9]?[0-9][/])?([0-9]?[0-9][/])?[0-9][0-9][0-9][0-9]/g) : [];
                                                if (timeList && timeList.length == 1) {
                                                    batDau = timeList[0];
                                                    batDauType = dayPatt.test(batDau) ? 'dd/mm/yyyy' : monthPatt.test(batDau) ? 'mm/yyyy' : yearPatt.test(batDau) ? 'yyyy' : null;
                                                } else if (timeList && timeList.length == 2) {
                                                    batDau = timeList[0];
                                                    ketThuc = timeList[1];
                                                    batDauType = dayPatt.test(batDau) ? 'dd/mm/yyyy' : monthPatt.test(batDau) ? 'mm/yyyy' : yearPatt.test(batDau) ? 'yyyy' : null;
                                                    ketThucType = dayPatt.test(ketThuc) ? 'dd/mm/yyyy' : monthPatt.test(ketThuc) ? 'mm/yyyy' : yearPatt.test(ketThuc) ? 'yyyy' : null;
                                                }
                                            }

                                            newElement.qtNuocNgoai.push({
                                                quocGia: quocGia,
                                                noiDung: noiDung,
                                                batDau: batDau && typeof (time) != 'object' ? getTime(batDau, batDauType) : batDau,
                                                ketThuc: ketThuc && ketThuc != -1 ? getTime(ketThuc, ketThucType) : ketThuc,
                                                batDauType: batDauType,
                                                ketThucType: ketThucType
                                            });
                                        }
                                        handleQTNuocNgoai(qtIndex + 1);
                                    }
                                };
                                handleQTNuocNgoai(index);

                                newElement.qtKhenThuong = [];
                                const handleQTKhenThuong = (qtIndex) => {
                                    if (qtIndex <= totalRow && (qtIndex == index || !worksheet.getCell('B' + qtIndex).value)) {
                                        if (worksheet.getCell('CO' + qtIndex).value && worksheet.getCell('CP' + qtIndex).value) {
                                            let time = worksheet.getCell('CO' + qtIndex).value,
                                                noiDung = worksheet.getCell('CP' + qtIndex).value,
                                                capQuyetDinh = worksheet.getCell('CQ' + qtIndex).value,
                                                batDau, ketThuc, batDauType, ketThucType,
                                                dayPatt = /[0-9]?[0-9][/][0-9]?[0-9][/][0-9][0-9][0-9][0-9]/,
                                                monthPatt = /[0-9]?[0-9][/][0-9][0-9][0-9][0-9]/,
                                                yearPatt = /[0-9][0-9][0-9][0-9]/;
                                            if (time && typeof (time) == 'object') {
                                                batDau = new Date(time).getTime();
                                            } else {
                                                let timeList = time ? time.toString().replaceAll(/\./g, '/').match(/([0-9]?[0-9][/])?([0-9]?[0-9][/])?[0-9][0-9][0-9][0-9]/g) : [];
                                                if (timeList && timeList.length == 1) {
                                                    batDau = timeList[0];
                                                    batDauType = dayPatt.test(batDau) ? 'dd/mm/yyyy' : monthPatt.test(batDau) ? 'mm/yyyy' : yearPatt.test(batDau) ? 'yyyy' : null;
                                                } else if (timeList && timeList.length == 2) {
                                                    batDau = timeList[0];
                                                    ketThuc = timeList[1];
                                                    batDauType = dayPatt.test(batDau) ? 'dd/mm/yyyy' : monthPatt.test(batDau) ? 'mm/yyyy' : yearPatt.test(batDau) ? 'yyyy' : null;
                                                    ketThucType = dayPatt.test(ketThuc) ? 'dd/mm/yyyy' : monthPatt.test(ketThuc) ? 'mm/yyyy' : yearPatt.test(ketThuc) ? 'yyyy' : null;
                                                }
                                            }

                                            newElement.qtKhenThuong.push({
                                                noiDung: noiDung,
                                                capQuyetDinh: capQuyetDinh,
                                                batDau: batDau && typeof (time) != 'object' ? getTime(batDau, batDauType) : batDau,
                                                ketThuc: ketThuc && ketThuc != -1 ? getTime(ketThuc, ketThucType) : ketThuc,
                                                batDauType: batDauType,
                                                ketThucType: ketThucType
                                            });
                                        }
                                        handleQTKhenThuong(qtIndex + 1);
                                    }
                                };
                                handleQTKhenThuong(index);
                                newElement.qtKyLuat = [];
                                const handleQTKyLuat = (qtIndex) => {
                                    if (qtIndex <= totalRow && (qtIndex == index || !worksheet.getCell('B' + qtIndex).value)) {
                                        if (worksheet.getCell('CS' + qtIndex).value && worksheet.getCell('CT' + qtIndex).value) {
                                            let time = worksheet.getCell('CS' + qtIndex).value,
                                                lyDoHinhThuc = worksheet.getCell('CT' + qtIndex).value,
                                                capQuyetDinh = worksheet.getCell('CU' + qtIndex).value,
                                                batDau, ketThuc, batDauType, ketThucType,
                                                dayPatt = /[0-9]?[0-9][/][0-9]?[0-9][/][0-9][0-9][0-9][0-9]/,
                                                monthPatt = /[0-9]?[0-9][/][0-9][0-9][0-9][0-9]/,
                                                yearPatt = /[0-9][0-9][0-9][0-9]/;
                                            if (time && typeof (time) == 'object') {
                                                batDau = new Date(time).getTime();
                                            } else {
                                                let timeList = time ? time.toString().replaceAll(/\./g, '/').match(/([0-9]?[0-9][/])?([0-9]?[0-9][/])?[0-9][0-9][0-9][0-9]/g) : [];
                                                if (timeList && timeList.length == 1) {
                                                    batDau = timeList[0];
                                                    batDauType = dayPatt.test(batDau) ? 'dd/mm/yyyy' : monthPatt.test(batDau) ? 'mm/yyyy' : yearPatt.test(batDau) ? 'yyyy' : null;
                                                } else if (timeList && timeList.length == 2) {
                                                    batDau = timeList[0];
                                                    ketThuc = timeList[1];
                                                    batDauType = dayPatt.test(batDau) ? 'dd/mm/yyyy' : monthPatt.test(batDau) ? 'mm/yyyy' : yearPatt.test(batDau) ? 'yyyy' : null;
                                                    ketThucType = dayPatt.test(ketThuc) ? 'dd/mm/yyyy' : monthPatt.test(ketThuc) ? 'mm/yyyy' : yearPatt.test(ketThuc) ? 'yyyy' : null;
                                                }
                                            }

                                            newElement.qtKyLuat.push({
                                                lyDoHinhThuc: lyDoHinhThuc,
                                                capQuyetDinh: capQuyetDinh,
                                                batDau: batDau && typeof (time) != 'object' ? getTime(batDau, batDauType) : batDau,
                                                ketThuc: ketThuc && ketThuc != -1 ? getTime(ketThuc, ketThucType) : ketThuc,
                                                batDauType: batDauType,
                                                ketThucType: ketThucType
                                            });
                                        }
                                        handleQTKyLuat(qtIndex + 1);
                                    }
                                };
                                handleQTKyLuat(index);

                                newElement.qtNCKH = [];
                                const handleQTNCKH = (qtIndex) => {
                                    if (qtIndex <= totalRow && (qtIndex == index || !worksheet.getCell('B' + qtIndex).value)) {
                                        if (worksheet.getCell('CW' + qtIndex).value && worksheet.getCell('CX' + qtIndex).value) {
                                            let tenDeTai = worksheet.getCell('CW' + qtIndex).value,
                                                maSoCapQuanLy = worksheet.getCell('CX' + qtIndex).value,
                                                time = worksheet.getCell('CY' + qtIndex).value,
                                                kinhPhi = worksheet.getCell('CZ' + qtIndex).value,
                                                vaiTro = worksheet.getCell('DA' + qtIndex).value,
                                                ngayNghiemThu = worksheet.getCell('DB' + qtIndex).value,
                                                ketQua = worksheet.getCell('DC' + qtIndex).value,
                                                batDau, ketThuc, batDauType, ketThucType, thoiGian, ngayNghiemThuType,
                                                dayPatt = /[0-9]?[0-9][/][0-9]?[0-9][/][0-9][0-9][0-9][0-9]/,
                                                monthPatt = /[0-9]?[0-9][/][0-9][0-9][0-9][0-9]/,
                                                yearPatt = /[0-9][0-9][0-9][0-9]/,
                                                inTimeMonthPatt = /[0-9]+[ ]*tháng/,
                                                inTimeYearPatt = /[0-9]+[ ]*năm/;
                                            if (time && typeof (time) == 'object') {
                                                batDau = new Date(time).getTime();
                                            } else {
                                                if (time && time.toString().toLowerCase().trim().match(/[0-9]+[ ]*(tháng|năm)/g)) {
                                                    if (inTimeMonthPatt.test(time.toLowerCase().trim())) {
                                                        thoiGian = Number(time.toLowerCase().trim().match(/[0-9]+/g)[0]);
                                                    } else if (inTimeYearPatt.test(time.toLowerCase().trim())) {
                                                        thoiGian = Number(time.toLowerCase().trim().match(/[0-9]+/g)[0]) * 12;
                                                    }
                                                } else {
                                                    let timeList = time ? time.toString().replaceAll(/\./g, '/').match(/([0-9]?[0-9][/])?([0-9]?[0-9][/])?[0-9][0-9][0-9][0-9]/g) : [];
                                                    if (timeList && timeList.length == 1) {
                                                        batDau = timeList[0];
                                                        batDauType = dayPatt.test(batDau) ? 'dd/mm/yyyy' : monthPatt.test(batDau) ? 'mm/yyyy' : yearPatt.test(batDau) ? 'yyyy' : null;
                                                    } else if (timeList && timeList.length == 2) {
                                                        batDau = timeList[0];
                                                        ketThuc = timeList[1];
                                                        batDauType = dayPatt.test(batDau) ? 'dd/mm/yyyy' : monthPatt.test(batDau) ? 'mm/yyyy' : yearPatt.test(batDau) ? 'yyyy' : null;
                                                        ketThucType = dayPatt.test(ketThuc) ? 'dd/mm/yyyy' : monthPatt.test(ketThuc) ? 'mm/yyyy' : yearPatt.test(ketThuc) ? 'yyyy' : null;
                                                    }
                                                }
                                            }

                                            if (ngayNghiemThu) {
                                                if (typeof (ngayNghiemThu) == 'object') {
                                                    ngayNghiemThu = new Date(ngayNghiemThu).getTime();
                                                } else {
                                                    ngayNghiemThuType = dayPatt.test(ngayNghiemThu) ? 'dd/mm/yyyy' : monthPatt.test(ngayNghiemThu) ? 'mm/yyyy' : yearPatt.test(ngayNghiemThu) ? 'yyyy' : null;
                                                }
                                            }

                                            newElement.qtNCKH.push({
                                                tenDeTai: tenDeTai,
                                                maSoCapQuanLy: maSoCapQuanLy,
                                                kinhPhi: kinhPhi,
                                                vaiTro: vaiTro,
                                                ketQua: ketQua,
                                                thoiGian: thoiGian,
                                                ngayNghiemThu: ngayNghiemThu ? typeof (ngayNghiemThu) == 'object' ? new Date(ngayNghiemThu).getTime() : getTime(ngayNghiemThu, ngayNghiemThuType) : null,
                                                batDau: batDau && typeof (time) != 'object' ? getTime(batDau, batDauType) : batDau,
                                                ketThuc: ketThuc && ketThuc != -1 ? getTime(ketThuc, ketThucType) : ketThuc,
                                                batDauType: batDauType,
                                                ketThucType: ketThucType,
                                                ngayNghiemThuType: ngayNghiemThuType
                                            });
                                        }
                                        handleQTNCKH(qtIndex + 1);
                                    }
                                };
                                handleQTNCKH(index);
                                newElement.qtHuongDan = [];
                                const handleQTHuongDan = (qtIndex) => {
                                    if (qtIndex <= totalRow && (qtIndex == index || !worksheet.getCell('B' + qtIndex).value)) {
                                        if (worksheet.getCell('DE' + qtIndex).value && worksheet.getCell('DF' + qtIndex).value) {
                                            let hoTen = worksheet.getCell('DE' + qtIndex).value,
                                                tenLuanVan = worksheet.getCell('DF' + qtIndex).value,
                                                time = worksheet.getCell('DG' + qtIndex).value,
                                                bacDaoTao = worksheet.getCell('DH' + qtIndex).value,
                                                sanPham = worksheet.getCell('DI' + qtIndex).value,
                                                namTotNghiep;

                                            if (time && typeof (time) == 'object') {
                                                namTotNghiep = new Date(time).getFullYear();
                                            } else {
                                                let timeList = time ? time.toString().replaceAll(/\./g, '/').match(/[0-9][0-9][0-9][0-9]/i) : [];
                                                namTotNghiep = timeList && timeList.length > 0 ? timeList[0] : null;
                                            }

                                            newElement.qtHuongDan.push({
                                                hoTen: hoTen,
                                                tenLuanVan: tenLuanVan,
                                                namTotNghiep: namTotNghiep,
                                                sanPham: sanPham,
                                                bacDaoTao: bacDaoTao
                                            });
                                        }
                                        handleQTHuongDan(qtIndex + 1);
                                    }
                                };
                                handleQTHuongDan(index);

                                newElement.sachGiaoTrinh = [];
                                const handleSachGiaoTrinh = (qtIndex) => {
                                    if (qtIndex <= totalRow && (qtIndex == index || !worksheet.getCell('B' + qtIndex).value)) {
                                        if (worksheet.getCell('DK' + qtIndex).value && worksheet.getCell('DL' + qtIndex).value) {
                                            let ten = worksheet.getCell('DK' + qtIndex).value,
                                                theLoai = worksheet.getCell('DL' + qtIndex).value,
                                                nhaSanXuat = worksheet.getCell('DM' + qtIndex).value,
                                                namSanXuat = worksheet.getCell('DN' + qtIndex).value,
                                                chuBien = worksheet.getCell('DO' + qtIndex).value,
                                                sanPham = worksheet.getCell('DP' + qtIndex).value,
                                                butDanh = worksheet.getCell('DQ' + qtIndex).value,
                                                quocTe = worksheet.getCell('DR' + qtIndex).value;

                                            newElement.sachGiaoTrinh.push({
                                                ten: ten,
                                                theLoai: theLoai,
                                                nhaSanXuat: nhaSanXuat,
                                                namSanXuat: namSanXuat,
                                                chuBien: chuBien,
                                                sanPham: sanPham,
                                                butDanh: butDanh,
                                                quocTe: quocTe ? quocTe.toLowerCase().trim().includes('trong nước') ? 0 : quocTe.toLowerCase().trim().includes('quốc tế') ? 1 : quocTe.toLowerCase().trim().includes('trong và ngoài nước') ? 2 : null : null
                                            });
                                        }
                                        handleSachGiaoTrinh(qtIndex + 1);
                                    }
                                };
                                handleSachGiaoTrinh(index);

                                newElement.baiVietKhoaHoc = [];
                                const handleBaiVietKhoaHoc = (qtIndex) => {
                                    if (qtIndex <= totalRow && (qtIndex == index || !worksheet.getCell('B' + qtIndex).value)) {
                                        if (worksheet.getCell('DU' + qtIndex).value && worksheet.getCell('DW' + qtIndex).value) {
                                            let tenTacGia = worksheet.getCell('DT' + qtIndex).value,
                                                namXuatBan = worksheet.getCell('DU' + qtIndex).value,
                                                tenBaiViet = worksheet.getCell('DV' + qtIndex).value,
                                                tenTapChi = worksheet.getCell('DW' + qtIndex).value,
                                                soHieuIssn = worksheet.getCell('DX' + qtIndex).value,
                                                diemIf = worksheet.getCell('DY' + qtIndex).value,
                                                sanPham = worksheet.getCell('DZ' + qtIndex).value,
                                                quocTe = worksheet.getCell('EA' + qtIndex).value;
                                            if (tenTapChi) {
                                                if (typeof (tenTapChi) == 'object' && tenTapChi.richText) {
                                                    tenTapChi = tenTapChi.richText[0].text + tenTapChi.richText[1].text;
                                                }
                                            }
                                            newElement.baiVietKhoaHoc.push({
                                                tenTacGia: tenTacGia,
                                                namXuatBan: namXuatBan,
                                                tenBaiViet: tenBaiViet,
                                                tenTapChi: tenTapChi,
                                                soHieuIssn: soHieuIssn,
                                                sanPham: sanPham,
                                                diemIf: diemIf,
                                                quocTe: quocTe ? quocTe.toLowerCase().trim().includes('trong nước') ? 0 : quocTe.toLowerCase().trim().includes('quốc tế') ? 1 : quocTe.toLowerCase().trim().includes('trong và ngoài nước') ? 2 : null : null
                                            });
                                        }
                                        handleBaiVietKhoaHoc(qtIndex + 1);
                                    }
                                };
                                handleBaiVietKhoaHoc(index);

                                newElement.kyYeu = [];
                                const handleKyYeu = (qtIndex) => {
                                    if (qtIndex <= totalRow && (qtIndex == index || !worksheet.getCell('B' + qtIndex).value)) {
                                        if (worksheet.getCell('EC' + qtIndex).value && worksheet.getCell('ED' + qtIndex).value) {
                                            let tenTacGia = worksheet.getCell('EC' + qtIndex).value,
                                                tenBaiViet = worksheet.getCell('ED' + qtIndex).value,
                                                tenHoiNghi = worksheet.getCell('EE' + qtIndex).value,
                                                time = worksheet.getCell('EF' + qtIndex).value,
                                                thoiGian,
                                                noiToChuc = worksheet.getCell('EG' + qtIndex).value,
                                                soHieuIsbn = worksheet.getCell('EH' + qtIndex).value,
                                                sanPham = worksheet.getCell('EI' + qtIndex).value,
                                                quocTe = worksheet.getCell('EJ' + qtIndex).value;
                                            if (time) {
                                                if (typeof (time) == 'object') {
                                                    thoiGian = new Date(time).getFullYear();
                                                } else {
                                                    let timeList = time ? time.toString().replaceAll(/\./g, '/').match(/[0-9][0-9][0-9][0-9]/g) : [];
                                                    thoiGian = timeList && timeList.length > 0 ? timeList[timeList.length - 1] : null;
                                                }
                                            }

                                            newElement.kyYeu.push({
                                                tenTacGia: tenTacGia,
                                                tenHoiNghi: tenHoiNghi,
                                                tenBaiViet: tenBaiViet,
                                                noiToChuc: noiToChuc,
                                                soHieuIsbn: soHieuIsbn,
                                                thoiGian: thoiGian,
                                                sanPham: sanPham,
                                                quocTe: quocTe ? quocTe.toLowerCase().trim().includes('trong nước') ? 0 : quocTe.toLowerCase().trim().includes('quốc tế') ? 1 : quocTe.toLowerCase().trim().includes('trong và ngoài nước') ? 2 : null : null
                                            });
                                        }
                                        handleKyYeu(qtIndex + 1);
                                    }
                                };
                                handleKyYeu(index);

                                newElement.giaiThuong = [];
                                const handleGiaiThuong = (qtIndex) => {
                                    if (qtIndex <= totalRow && (qtIndex == index || !worksheet.getCell('B' + qtIndex).value)) {
                                        if (worksheet.getCell('EL' + qtIndex).value && worksheet.getCell('EM' + qtIndex).value) {
                                            let tenGiaiThuong = worksheet.getCell('EL' + qtIndex).value,
                                                noiDung = worksheet.getCell('EM' + qtIndex).value,
                                                noiCap = worksheet.getCell('EN' + qtIndex).value,
                                                namCap = worksheet.getCell('EO' + qtIndex).value;

                                            newElement.giaiThuong.push({
                                                tenGiaiThuong: tenGiaiThuong,
                                                noiDung: noiDung,
                                                noiCap: noiCap,
                                                namCap: namCap,
                                            });
                                        }
                                        handleGiaiThuong(qtIndex + 1);
                                    }
                                };
                                handleGiaiThuong(index);

                                newElement.bangPMSC = [];
                                const handleBangPMSC = (qtIndex) => {
                                    if (qtIndex <= totalRow && (qtIndex == index || !worksheet.getCell('B' + qtIndex).value)) {
                                        if (worksheet.getCell('EQ' + qtIndex).value && worksheet.getCell('ER' + qtIndex).value) {
                                            let tenBang = worksheet.getCell('EQ' + qtIndex).value,
                                                soHieu = worksheet.getCell('ER' + qtIndex).value,
                                                namCap = worksheet.getCell('ES' + qtIndex).value,
                                                noiCap = worksheet.getCell('ET' + qtIndex).value,
                                                tacGia = worksheet.getCell('EU' + qtIndex).value,
                                                sanPham = worksheet.getCell('EV' + qtIndex).value,
                                                loaiBang = worksheet.getCell('EW' + qtIndex).value;

                                            newElement.bangPMSC.push({
                                                tenBang: tenBang,
                                                soHieu: soHieu,
                                                namCap: namCap,
                                                noiCap: noiCap,
                                                tacGia: tacGia,
                                                sanPham: sanPham,
                                                loaiBang: loaiBang
                                            });
                                        }
                                        handleBangPMSC(qtIndex + 1);
                                    }
                                };
                                handleBangPMSC(index);

                                newElement.ungDungThuongMai = [];
                                const handleUngDungThuongMai = (qtIndex) => {
                                    if (qtIndex <= totalRow && (qtIndex == index || !worksheet.getCell('B' + qtIndex).value)) {
                                        if (worksheet.getCell('EY' + qtIndex).value && worksheet.getCell('EZ' + qtIndex).value) {
                                            let tenCongNghe = worksheet.getCell('EY' + qtIndex).value,
                                                hinhThuc = worksheet.getCell('EZ' + qtIndex).value,
                                                namChuyenGia = worksheet.getCell('FA' + qtIndex).value,
                                                sanPham = worksheet.getCell('FB' + qtIndex).value;

                                            newElement.ungDungThuongMai.push({
                                                tenCongNghe: tenCongNghe,
                                                hinhThuc: hinhThuc,
                                                namChuyenGia: namChuyenGia,
                                                sanPham: sanPham,
                                            });
                                        }
                                        handleUngDungThuongMai(qtIndex + 1);
                                    }
                                };
                                handleUngDungThuongMai(index);

                                newElement.lamViecNgoai = [];
                                const handleLamViecNgoai = (qtIndex) => {
                                    if (qtIndex <= totalRow && (qtIndex == index || !worksheet.getCell('B' + qtIndex).value)) {
                                        if (worksheet.getCell('CB' + qtIndex).value && worksheet.getCell('CC' + qtIndex).value) {
                                            let time = worksheet.getCell('FD' + qtIndex).value,
                                                noiLamViec = worksheet.getCell('FE' + qtIndex).value,
                                                noiDung = worksheet.getCell('FF' + qtIndex).value,
                                                batDau, ketThuc, batDauType, ketThucType,
                                                timeList = time ? time.toString().replaceAll(/\./g, '/').match(/([0-9]?[0-9][/])?([0-9]?[0-9][/])?[0-9][0-9][0-9][0-9]/g) : [],
                                                dayPatt = /[0-9]?[0-9][/][0-9]?[0-9][/][0-9][0-9][0-9][0-9]/,
                                                monthPatt = /[0-9]?[0-9][/][0-9][0-9][0-9][0-9]/,
                                                yearPatt = /[0-9][0-9][0-9][0-9]/;

                                            if (time && typeof (time) == 'object') {
                                                batDau = new Date(time).getTime();
                                            } else {
                                                let timeList = time ? time.toString().replaceAll(/\./g, '/').match(/([0-9]?[0-9][/])?([0-9]?[0-9][/])?[0-9][0-9][0-9][0-9]/g) : [];
                                                if (timeList && timeList.length == 1) {
                                                    batDau = timeList[0];
                                                    batDauType = dayPatt.test(batDau) ? 'dd/mm/yyyy' : monthPatt.test(batDau) ? 'mm/yyyy' : yearPatt.test(batDau) ? 'yyyy' : null;
                                                } else if (timeList && timeList.length == 2) {
                                                    batDau = timeList[0];
                                                    ketThuc = timeList[1];
                                                    batDauType = dayPatt.test(batDau) ? 'dd/mm/yyyy' : monthPatt.test(batDau) ? 'mm/yyyy' : yearPatt.test(batDau) ? 'yyyy' : null;
                                                    ketThucType = dayPatt.test(ketThuc) ? 'dd/mm/yyyy' : monthPatt.test(ketThuc) ? 'mm/yyyy' : yearPatt.test(ketThuc) ? 'yyyy' : null;
                                                }
                                            }
                                            if (time && (time.toString().toLowerCase().includes('đến nay') || time.toString().toLowerCase().includes('nay'))) {
                                                ketThuc = -1;
                                            }
                                            if (timeList && timeList.length > 0)
                                                newElement.lamViecNgoai.push({
                                                    noiLamViec: noiLamViec,
                                                    noiDung: noiDung,
                                                    batDau: batDau && typeof (time) != 'object' ? getTime(batDau, batDauType) : batDau,
                                                    ketThuc: ketThuc && ketThuc != -1 ? getTime(ketThuc, ketThucType) : ketThuc,
                                                    batDauType: batDauType,
                                                    ketThucType: ketThucType
                                                });
                                        }
                                        handleLamViecNgoai(qtIndex + 1);
                                    }
                                };
                                handleLamViecNgoai(index);

                                element.push(newElement);
                            }

                            handleUpload(index + 1);
                        }
                    };
                    handleUpload();
                } else {
                    app.deleteFile(srcPath);
                    done({ error: 'Error' });
                }
            });
        }
    };
    // Hook upload images ---------------------------------------------------------------------------------------------------------------------------
    app.createFolder(app.path.join(app.publicPath, '/img/user'));

    const uploadCanBoImage = (req, fields, files, params, done) => {
        if (fields.userData && fields.userData.length && fields.userData[0].startsWith('CanBoImage:') && files.CanBoImage && files.CanBoImage.length) {
            console.log('Hook: uploadCanBoImage');
            app.model.fwUser.get({ email: fields.userData[0].substring('CanBoImage:'.length) }, (error, item) => {
                if (error || item == null) {
                    done({ error: 'Id không hợp lệ!' });
                } else {
                    app.deleteImage(item.image);
                    let srcPath = files.CanBoImage[0].path,
                        image = '/img/user/' + app.path.basename(srcPath);
                    app.fs.rename(srcPath, app.path.join(app.publicPath, image), error => {
                        if (error) {
                            done({ error });
                        } else {
                            image += '?t=' + (new Date().getTime()).toString().slice(-8);
                            app.model.fwUser.update({ email: item.email }, { image }, (error, item) => {
                                if (error == null && req.session.user.email === item.email) {
                                    app.io.emit('avatar-changed', item);
                                    req.session.user.image = image;
                                }
                                done({ error, item, image });
                            });
                        }
                    });
                }
            });
        }
    };
    app.uploadHooks.add('uploadCanBoImage', (req, fields, files, params, done) =>
        app.permission.has(req, () => uploadCanBoImage(req, fields, files, params, done), done, 'staff:login'));

    app.uploadHooks.add('staffData', (req, fields, files, params, done) =>
        app.permission.has(req, () => staffImportData(req, fields, files, params, done), done, 'staff:write'));
};