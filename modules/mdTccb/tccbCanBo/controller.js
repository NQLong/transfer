module.exports = app => {
    const menu = {
        parentMenu: app.parentMenu.tccb,
        menus: {
            3002: { title: 'Danh sách cán bộ', link: '/user/tccb/staff', icon: 'fa-users', backgroundColor: '#28586F', groupIndex: 0 }
        }
    };

    const menuStaff = {
        parentMenu: app.parentMenu.user,
        menus: {
            1001: { title: 'Thông tin cán bộ', link: '/user/profile', icon: 'fa-address-card-o', backgroundColor: '#456578', pin: true }
        }
    };

    app.permission.add(
        { name: 'staff:login', menu: menuStaff },
        { name: 'staff:read', menu },
        { name: 'staff:write' },
        { name: 'staff:delete' }
    );



    app.get('/user/profile', app.permission.check('staff:login'), app.templates.admin);

    app.get('/user/tccb/staff/:shcc', app.permission.check('staff:read'), app.templates.admin);
    app.get('/user/tccb/staff', app.permission.check('staff:read'), app.templates.admin);
    app.get('/user/tccb/staff/item/upload', app.permission.check('staff:write'), app.templates.admin);

    app.getEmailByShcc = (shcc) => new Promise(resolve => {
        if (!shcc) resolve();
        app.model.canBo.get({ shcc }, 'email', null, (error, item) => {
            if (!error && item) resolve(item.email);
            else resolve();
        });
    });


    //Hook staff-------------------------------------------------------------------------------------------------
    app.permissionHooks.add('staff', 'checkKhoaBoMon', (user, staff) => new Promise(resolve => {
        if (staff.maDonVi) {
            if (staff.maDonVi == '30') {
                app.permissionHooks.pushUserPermission(user, 'staff:read', 'staff:write', 'staff:delete');
            }
            let permissionLoaiDonVi = {
                1: 'faculty:login',
                2: 'department:login',
                3: 'center:login',
                4: 'union:login'
            };
            app.model.dmDonVi.get({ ma: staff.maDonVi }, (error, item) => {
                if (!error && item && item.maPl) {
                    app.permissionHooks.pushUserPermission(user, permissionLoaiDonVi[item.maPl]);
                    resolve();
                } else resolve();
            });
        } else {
            resolve();
        }
    }));
    // APIs -----------------------------------------------------------------------------------------------------------------------------------------
    const checkGetStaffPermission = (req, res, next) => app.isDebug ? next() : app.permission.check('staff:login')(req, res, next);

    app.get('/api/staff/page/:pageNumber/:pageSize', checkGetStaffPermission, (req, res) => {
        let pageNumber = parseInt(req.params.pageNumber),
            pageSize = parseInt(req.params.pageSize),
            searchTerm = typeof req.query.condition === 'string' ? req.query.condition : '';
        let time = req.query.timeCondition || new Date().getTime();
        const filter = JSON.stringify({ ...req.query.filter, time });
        app.model.canBo.searchPage(pageNumber, pageSize, filter, searchTerm, (error, page) => {
            if (error || page == null) {
                res.send({ error });
            } else {
                const { totalitem: totalItem, pagesize: pageSize, pagetotal: pageTotal, pagenumber: pageNumber, rows: list } = page;
                const pageCondition = searchTerm;
                res.send({ error, page: { totalItem, pageSize, pageTotal, pageNumber, pageCondition, list } });
            }
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
        app.model.canBo.get({ shcc: req.params.shcc }, (error, item) => {
            if (error) {
                res.send({ error });
            } else {
                app.model.dmTrinhDo.get({ ma: item.hocVi }, (error, hocVi) => {
                    item = { ...item, trinhDo: hocVi ? hocVi.vietTat : '' };
                    app.model.dmDonVi.get({ ma: item.maDonVi }, (error, donVi) => {
                        item = { ...item, tenDonVi: donVi ? donVi.ten : '' };
                        res.send({ item });
                    });
                });
            }
        });
    });

    app.get('/api/staff/get-giang-vien', app.permission.check('staff:login'), (req, res) => {
        let searchTerm = req.query.searchTerm || '';
        app.model.canBo.getGiangVien(searchTerm, (error, items) => res.send({ items: items.rows }));
    });

    app.get('/api/staff/get-chuyen-nganh-all', app.permission.check('staff:login'), (req, res) => {
        let condition = { statement: 'ngayNghi IS NULL', parameter: {} };
        if (req.query && req.query.condition) {
            if (typeof (req.query.condition) == 'object') {
                if (req.query.condition.searchText) {
                    condition = {
                        statement: 'ngayNghi IS NULL AND lower(chuyenNganh) LIKE :searchText',
                        parameter: { searchText: `%${req.query.condition.searchText.toLowerCase()}%` }
                    };
                }
            } else {
                condition = {
                    statement: 'ngayNghi IS NULL AND lower(chuyenNganh) LIKE :searchText',
                    parameter: { searchText: `%${req.query.condition.toLowerCase()}%` }
                };
            }
        }
        app.model.canBo.getAll(condition, 'chuyenNganh', '', (error, items) => {
            res.send({ error, items });
        });
    });

    // app.get('/api/staff/calc-shcc', checkGetStaffPermission, (req, res) => {
    //     app.model.canBo.getShccCanBo(req.query.item, (error, shcc) => {
    //         res.send({ error, shcc });
    //     });
    // });
    // app.get('/api/staff/:maDonVi', checkGetStaffPermission, (req, res) => {
    //     app.model.canBo.getAll({ maDonVi: req.params.maDonVi }, (error, item) => res.send({ error, item }));
    // });

    app.get('/api/staff/all', app.permission.check('staff:login'), (req, res) => {
        app.model.canBo.getAll({}, (error, items) => {
            res.send({ error, items });
        });
    });

    app.get('/api/staff/edit/item', app.permission.check('staff:login'), async (req, res) => {
        app.model.canBo.get(req.query.condition, (error, canBo) => {
            if (error) {
                res.send({ error: 'Lỗi khi lấy thông tin cán bộ !' });
            } else {
                app.getCanBoProfile(res, canBo);
            }
        });
    });

    app.post('/api/staff', app.permission.check('staff:write'), (req, res) => {
        const newItem = req.body.canBo;
        app.model.canBo.get({ shcc: newItem.shcc }, (error, item) => {
            if (item) {
                res.send({ error: { exist: true, message: 'Cán bộ ' + newItem.shcc.toString() + ' đã tồn tại' } });
            } else if (error) {
                res.send({ error });
            } else {
                app.model.canBo.create(newItem, (error, item) => {
                    app.tccbSaveCRUD(req.session.user.email, 'C', 'Hồ sơ cán bộ');
                    app.model.fwUser.create({
                        email: item.email,
                        active: 1,
                        isStaff: 1,
                        firstName: item.ho,
                        lastName: item.ten,
                        shcc: item.shcc
                    });
                    res.send({ error, item });
                });
            }
        });
    });

    app.put('/api/staff', app.permission.check('staff:login'), (req, res) => {
        let shcc = app.model.canBo.validShcc(req, req.body.shcc);
        shcc ? app.model.canBo.update({ shcc }, req.body.changes, (error, item) => {
            req.session.user.permissions.includes('staff:write') && app.tccbSaveCRUD(req.session.user.email, 'U', 'Hồ sơ cán bộ');
            // if (item && !error) app.notification.send({ toEmail: item.email, title: 'Lý lịch được cập nhật thành công', subTitle: `Bởi ${req.session.user.lastName} ${req.session.user.firstName}`, icon: 'fa-check-square-o', iconColor: 'success' });
            res.send({ error, item });
        }) : res.send({ error: 'No permission' });
    });



    app.delete('/api/staff', app.permission.check('staff:delete'), (req, res) => {
        app.model.canBo.delete({ shcc: req.body.shcc }, error => {
            app.tccbSaveCRUD(req.session.user.email, 'D', 'Hồ sơ cán bộ');
            new Promise(resolve => {
                app.model.quanHeCanBo.delete({ shcc: req.body.shcc }, () => {
                    resolve();
                });
            }).then(() => new Promise(resolve => {
                app.model.trinhDoNgoaiNgu.delete({ shcc: req.body.shcc }, () => {
                    resolve();
                });
            })).then(() => new Promise(resolve => {
                app.model.qtBaoHiemXaHoi.delete({ shcc: req.body.shcc }, () => {
                    resolve();
                });
            })).then(() => new Promise(resolve => {
                app.model.qtChucVu.delete({ shcc: req.body.shcc }, () => {
                    resolve();
                });
            })).then(() => new Promise(resolve => {
                app.model.qtCongTacTrongNuoc.delete({ shcc: req.body.shcc }, () => {
                    resolve();
                });
            })).then(() => new Promise(resolve => {
                app.model.qtDaoTao.delete({ shcc: req.body.shcc }, () => {
                    resolve();
                });
            })).then(() => new Promise(resolve => {
                app.model.qtDiNuocNgoai.delete({ shcc: req.body.shcc }, () => {
                    resolve();
                });
            })).then(() => new Promise(resolve => {
                app.model.qtGiaiThuong.delete({ shcc: req.body.shcc }, () => {
                    resolve();
                });
            })).then(() => new Promise(resolve => {
                app.model.qtHocTapCongTac.delete({ shcc: req.body.shcc }, () => {
                    resolve();
                });
            })).then(() => new Promise(resolve => {
                app.model.qtHopDongLaoDong.delete({ nguoiDuocThue: req.body.shcc }, () => {
                    resolve();
                });
            })).then(() => new Promise(resolve => {
                app.model.qtHopDongVienChuc.delete({ nguoiDuocThue: req.body.shcc }, () => {
                    resolve();
                });
            })).then(() => new Promise(resolve => {
                app.model.qtHoTroHocPhi.delete({ shcc: req.body.shcc }, () => {
                    resolve();
                });
            })).then(() => new Promise(resolve => {
                app.model.qtKeoDaiCongTac.delete({ shcc: req.body.shcc }, () => {
                    resolve();
                });
            })).then(() => new Promise(resolve => {
                app.model.qtKhenThuongAll.delete({ shcc: req.body.shcc }, () => {
                    resolve();
                });
            })).then(() => new Promise(resolve => {
                app.model.qtKyLuat.delete({ shcc: req.body.shcc }, () => {
                    resolve();
                });
            })).then(() => new Promise(resolve => {
                app.model.qtKyYeu.delete({ shcc: req.body.shcc }, () => {
                    resolve();
                });
            })).then(() => new Promise(resolve => {
                app.model.qtLamViecNgoai.delete({ shcc: req.body.shcc }, () => {
                    resolve();
                });
            })).then(() => new Promise(resolve => {
                app.model.qtLuong.delete({ shcc: req.body.shcc }, () => {
                    resolve();
                });
            })).then(() => new Promise(resolve => {
                app.model.qtNghiKhongLuong.delete({ shcc: req.body.shcc }, () => {
                    resolve();
                });
            })).then(() => new Promise(resolve => {
                app.model.qtNghiPhep.delete({ shcc: req.body.shcc }, () => {
                    resolve();
                });
            })).then(() => new Promise(resolve => {
                app.model.qtNghiThaiSan.delete({ shcc: req.body.shcc }, () => {
                    resolve();
                });
            })).then(() => new Promise(resolve => {
                app.model.qtNghiViec.delete({ shcc: req.body.shcc }, () => {
                    resolve();
                });
            })).then(() => new Promise(resolve => {
                app.model.tccbToChucKhac.delete({ shcc: req.body.shcc }, () => {
                    resolve();
                });
            })).then(() => new Promise(resolve => {
                app.model.trinhDoNgoaiNgu.delete({ shcc: req.body.shcc }, () => {
                    resolve();
                });
            })).then(() => new Promise(resolve => {
                app.model.qtBaiVietKhoaHoc.delete({ shcc: req.body.shcc }, () => {
                    resolve();
                });
            })).then(() => new Promise(resolve => {
                app.model.qtBangPhatMinh.delete({ shcc: req.body.shcc }, () => {
                    resolve();
                });
            })).then(() => new Promise(resolve => {
                app.model.qtHuongDanLuanVan.delete({ shcc: req.body.shcc }, () => {
                    resolve();
                });
            })).then(() => new Promise(resolve => {
                app.model.qtNghienCuuKhoaHoc.delete({ shcc: req.body.shcc }, () => {
                    resolve();
                });
            })).then(() => new Promise(resolve => {
                app.model.sachGiaoTrinh.delete({ shcc: req.body.shcc }, () => resolve());
            })).then(() => {
                res.send({ error });
            });
        });
    });


    app.getCanBoProfile = (res, canBo) => {
        let result = app.clone(canBo),
            curTime = new Date().getTime();
        new Promise(resolve => {
            app.model.fwUser.get({ email: canBo.email }, (error, user) => {
                result = app.clone(canBo, { image: user?.image || '' });
                resolve(result);
            });
        }).then((result) => new Promise(resolve => {
            app.model.quanHeCanBo.getQhByShcc(canBo.shcc, (error, quanHeCanBo) => {
                if (error) {
                    res.send({ error: 'Lỗi khi lấy thông tin quan hệ gia đình cán bộ !' });
                } else {
                    result = app.clone(result, { quanHeCanBo: quanHeCanBo?.rows || [] });
                }
                resolve(result);
            });
        })).then((result) => new Promise(resolve => {
            app.model.dmDonVi.get({ ma: canBo.maDonVi, kichHoat: 1 }, (error, item) => {
                if (error) {
                    res.send({ error: 'Lỗi khi lấy thông tin đơn vị cán bộ !' });
                } else if (item == null) {
                    result = app.clone(result, { tenDonVi: '' });
                } else {
                    result = app.clone(result, { tenDonVi: item.ten });
                }
                resolve(result);
            });
        })).then((result) => new Promise(resolve => {
            app.model.tccbToChucKhac.getAll({ shcc: canBo.shcc }, (error, toChucKhac) => {
                if (error) {
                    res.send({ error: 'Lỗi khi lấy thông tin tổ chức chính trị - xã hội, nghề nghiệp cán bộ !' });
                } else {
                    result = app.clone(result, { toChucKhac: toChucKhac || [] });
                }
                resolve(result);
            });
        })).then((result) => new Promise(resolve => {
            app.model.qtDaoTao.getCurrentOfStaff(canBo.shcc, curTime, (error, daoTaoCurrent) => {
                if (error) {
                    res.send({ error: 'Lỗi khi lấy thông tin đào tạo hiện tại!' });
                } else if (daoTaoCurrent == null || daoTaoCurrent.length == 0) {
                    result = app.clone(result, { daoTaoCurrent: [] });
                } else {
                    result = app.clone(result, { daoTaoCurrent: daoTaoCurrent.rows });
                }
                resolve(result);
            });
        })).then((result) => new Promise(resolve => {
            app.model.qtDaoTao.getHV(canBo.shcc, (error, daoTaoBoiDuong) => {
                if (error) {
                    res.send({ error: 'Lỗi khi lấy thông tin đào tạo, bồi dưỡng!' });
                } else {
                    result = app.clone(result, { daoTaoBoiDuong: daoTaoBoiDuong.rows || [] });
                }
                resolve(result);
            });
        })).then((result) => new Promise(resolve => {
            app.model.trinhDoNgoaiNgu.getAll({ shcc: canBo.shcc }, (error, trinhDoNN) => {
                if (error) {
                    res.send({ error: 'Lỗi khi lấy thông tin trình độ ngoại ngữ cán bộ !' });
                }
                else {
                    result = app.clone(result, { trinhDoNN: trinhDoNN || [] });
                }
                resolve(result);
            });
        })).then((result) => new Promise(resolve => {
            let chucVuChinhQuyen = [], chucVuDoanThe = [];
            app.model.qtChucVu.getByShcc(canBo.shcc, (error, chucVu) => {
                if (error) {
                    res.send({ error: 'Lỗi khi lấy thông tin quá trình chức vụ!' });
                } else {
                    chucVuChinhQuyen = chucVu.rows.filter(i => i.loaiChucVu == 1);
                    chucVuDoanThe = chucVu.rows.filter(i => i.loaiChucVu != 1);
                    result = app.clone(result, { chucVuChinhQuyen, chucVuDoanThe });
                }
                resolve(result);
            });
        })).then((result) => new Promise(resolve => {
            app.model.qtHopDongDonViTraLuong.get({ shcc: canBo.shcc }, 'ngayKyHopDong,loaiHopDong', 'NGAY_KY_HOP_DONG DESC', (error, dvtl) => {
                if (error) {
                    res.send({ error: 'Lỗi khi lấy thông tin hợp đồng đơn vị!' });
                } else if (dvtl) {
                    result = app.clone(result, { hopDongCanBo: 'DVTL', hopDongCanBoNgay: new Date(dvtl.ngayKyHopDong).setHours(0, 0, 0), loaiHopDongCanBo: dvtl.loaiHopDong });
                    resolve(result);
                } else
                    resolve(result);
            });
        })).then((result) => new Promise(resolve => {
            app.model.qtHopDongTrachNhiem.get({ nguoiDuocThue: canBo.shcc }, 'ngayKyHopDong', 'NGAY_KY_HOP_DONG DESC', (error, tn) => {
                if (error) {
                    res.send({ error: 'Lỗi khi lấy thông tin hợp đồng trách nhiệm!' });
                } else if (tn) {
                    let ngayKyHopDong = new Date(tn.ngayKyHopDong).setHours(0, 0, 0);
                    if (result.hopDongCanBoNgay && result.hopDongCanBoNgay < ngayKyHopDong) {
                        result = app.clone(result, { hopDongCanBo: 'TN', hopDongCanBoNgay: ngayKyHopDong, loaiHopDongCanBo: '' });
                    } resolve(result);
                } else
                    resolve(result);
            });
        })).then((result) => new Promise(resolve => {
            app.model.qtHopDongLaoDong.get({ nguoiDuocThue: canBo.shcc }, 'ngayKyHopDong,loaiHopDong', 'NGAY_KY_HOP_DONG DESC', (error, hdld) => {
                if (error) {
                    res.send({ error: 'Lỗi khi lấy thông tin hợp đồng lao động !' });
                } else if (hdld) {
                    let ngayKyHopDong = new Date(hdld.ngayKyHopDong).setHours(0, 0, 0);
                    if (result.hopDongCanBoNgay && result.hopDongCanBoNgay < ngayKyHopDong) {
                        result = app.clone(result, { hopDongCanBo: 'LĐ', hopDongCanBoNgay: ngayKyHopDong, loaiHopDongCanBo: hdld.loaiHopDong });
                    } resolve(result);
                } else
                    resolve(result);
            });
        })).then((result) => new Promise(resolve => {
            app.model.qtHopDongVienChuc.get({ nguoiDuocThue: canBo.shcc }, 'ngayKyHopDong,loaiHopDong', 'NGAY_KY_HOP_DONG DESC', (error, hdvc) => {
                if (error) {
                    res.send({ error: 'Lỗi khi lấy thông tin hợp đồng làm việc !' });
                } else if (hdvc) {
                    let ngayKyHopDong = new Date(hdvc.ngayKyHopDong).setHours(0, 0, 0);
                    if (result.hopDongCanBoNgay && result.hopDongCanBoNgay < ngayKyHopDong) {
                        result = app.clone(result, { hopDongCanBo: 'VC', hopDongCanBoNgay: ngayKyHopDong, loaiHopDongCanBo: hdvc.loaiHopDong });
                    } resolve(result);
                } else
                    resolve(result);
            });
        })).then((result) => {
            if (!result.hopDongCanBo || result.hopDongCanBo == '') {
                result.loaiHopDongCanBo = '00';
                result.hopDongCanBo = '00';
            }
            res.send({ item: result });
        });
    };

    // USER APIs ------------------------------------------------------------------------------------------------------------------------------------
    app.get('/api/staff-profile/:email', (req, res) => {
        app.model.canBo.get({ email: req.params.email }, (error, canBo) => {
            if (error || canBo == null) {
                res.send({ error });
            } else {
                app.getCanBoProfile(res, canBo);
            }
        });
    });

    app.get('/api/can-bo-ky/:shcc', checkGetStaffPermission, (req, res) => {
        app.model.canBo.getCanBoBenA(req.params.shcc, (error, item) => res.send({ error, item }));
    });

    app.get('/api/staff/get-ly-lich/:shcc', app.permission.check('staff:login'), (req, res) => {
        let shcc = app.model.canBo.validShcc(req, req.params.shcc);
        if (shcc) {
            app.model.canBo.getLyLich(shcc, (error, item) => {
                if (error || !item || !item.rows || !item.rows.length || !item.rows[0]) {
                    res.send({ error });
                } else {
                    let canBo = item.rows[0],
                        { qtChucVu, qtDaoTao, qtHocTapCongTac, quanHeGiaDinh, toChucKhac } = item;
                    let chucVuKiemNhiems = qtChucVu.filter(item => !item.chucVuChinh);
                    qtDaoTao.map(item => {
                        item.batDau = app.date.dateTimeFormat(new Date(item.batDau), item.batDauType);
                        item.ketThuc = item.ketThuc ? (item.ketThuc == -1 ? ' - nay' : ' - ' + app.date.dateTimeFormat(new Date(item.ketThuc), item.ketThucType)) : '';
                        item.tenTrinhDo = item.tenTrinhDo || item.trinhDo || '';
                        item.tenHinhThuc = item.tenHinhThuc || '';
                        item.coSo = item.coSo || '';
                        return item;
                    });

                    const getMaxDaoTao = (ten) => {
                        let data = qtDaoTao.filter(item => item.chuyenNganh == ten);
                        if (!data.length) return '';
                        else return data.reduce((prev, cur) => {
                            return (prev.batDau > cur.batDau && prev.ketThuc != -1) ? prev : cur;
                        });
                    };

                    let llct = getMaxDaoTao('Lý luận chính trị'),
                        qlnn = getMaxDaoTao('Quản lý nhà nước'),
                        tinHoc = getMaxDaoTao('Tin học');
                    if (!qtHocTapCongTac.length) {
                        qtHocTapCongTac = [{
                            batDau: '',
                            ketThuc: '',
                            noiDung: ''
                        }];
                    }
                    else qtHocTapCongTac.map(item => {
                        item.batDau = app.date.dateTimeFormat(new Date(item.batDau), item.batDauType);
                        item.ketThuc = item.ketThuc == -1 ? 'nay' : app.date.dateTimeFormat(new Date(item.ketThuc), item.ketThucType);
                        return item;
                    });

                    quanHeGiaDinh.map(item => {
                        item.namSinh = new Date(item.namSinh).getFullYear();
                        item.ngheNghiep = item.ngheNghiep || '';
                        item.noiCongTac = item.noiCongTac || '';
                        return item;
                    });
                    if (!toChucKhac.length) {
                        toChucKhac = [{
                            tenToChuc: '',
                            ngayThamGia: '',
                            moTa: ''
                        }];
                    } else toChucKhac.map(item => {
                        item.ngayThamGia = item.ngayThamGia ? app.date.dateTimeFormat(new Date(item.ngayThamGia), 'dd/mm/yyyy') : '';
                    });
                    const type = req.query.type;
                    const source = app.path.join(__dirname, 'resource', type == 'cc' ? 'Mau-2C-BNV-2008.docx' : 'HSVC.docx');
                    const data = {
                        HO_TEN: (canBo.ho + ' ' + canBo.ten).toUpperCase(),
                        otherName: '',
                        cmnd: canBo.cmnd || '',
                        ngayCap: app.date.viDateFormat(new Date(canBo.ngayCapCmnd)),
                        dob: new Date(canBo.ngaySinh).getDate(),
                        mob: new Date(canBo.ngaySinh).getMonth() + 1,
                        yob: new Date(canBo.ngaySinh).getFullYear(),
                        sex: canBo.gioiTinh,
                        nsXa: canBo.xaNoiSinh ? canBo.xaNoiSinh + ',' : '',
                        nsHuyen: canBo.huyenNoiSinh ? canBo.huyenNoiSinh + ',' : '',
                        nsTinh: canBo.tinhNoiSinh ? canBo.tinhNoiSinh : '',
                        qqXa: canBo.xaNguyenQuan ? canBo.xaNguyenQuan + ',' : '',
                        qqHuyen: canBo.huyenNguyenQuan ? canBo.huyenNguyenQuan + ',' : '',
                        qqTinh: canBo.tinhNguyenQuan ? canBo.tinhNguyenQuan : '',
                        hienTai: (canBo.soNhaHienTai ? canBo.soNhaHienTai + ', ' : '')
                            + (canBo.xaHienTai ? canBo.xaHienTai + ', ' : '')
                            + (canBo.huyenHienTai ? canBo.huyenHienTai + ', ' : '')
                            + (canBo.tinhHienTai ? canBo.tinhHienTai : ''),
                        thuongTru: (canBo.soNhaThuongTru ? canBo.soNhaThuongTru + ', ' : '')
                            + (canBo.xaThuongTru ? canBo.xaThuongTru + ', ' : '')
                            + (canBo.huyenThuongTru ? canBo.huyenThuongTru + ', ' : '')
                            + (canBo.tinhThuongTru ? canBo.tinhThuongTru : ''),
                        ngheTuyen: canBo.ngheTuyen || '',
                        ngayTuyen: canBo.ngayTuyen ? app.date.viDateFormat(new Date(canBo.ngayTuyen)) : '',
                        coQuanTuyen: canBo.coQuanTuyen || 'Đại học KHXH&NV HCM',
                        maNgach: canBo.maNgach || '',
                        tenNgach: canBo.tenNgach || '',
                        bacLuong: canBo.bacLuong || '',
                        heSoLuong: canBo.heSoLuong ? Number(canBo.heSoLuong).toFixed(2) : '',
                        ngayHuongLuong: canBo.ngayHuongLuong ? app.date.viDateFormat(new Date(canBo.ngayHuongLuong)) : '',
                        danToc: canBo.danToc || '',
                        tonGiao: canBo.tonGiao || '',
                        phuCapChucVu: qtChucVu[0]?.phuCapChucVu || '',
                        chucVu: qtChucVu[0]?.chucVu || '',
                        donVi: qtChucVu[0]?.donVi || '',
                        chucVuKiemNhiem: chucVuKiemNhiems.length ? chucVuKiemNhiems.map(item => `${item.chucVu} - ${item.donVi}`).join(', ') : '',
                        phoThong: canBo.phoThong || '',
                        hocVi: canBo.hocVi || '',
                        ngayVaoDang: canBo.ngayVaoDang ? app.date.viDateFormat(new Date(canBo.ngayVaoDang)) : '',
                        ngayVaoDangChinhThuc: canBo.ngayVaoDangChinhThuc ? app.date.viDateFormat(new Date(canBo.ngayVaoDangChinhThuc)) : '',
                        ngayNhapNgu: canBo.ngayNhapNgu ? app.date.viDateFormat(new Date(canBo.ngayNhapNgu)) : '',
                        ngayXuatNgu: canBo.ngayXuatNgu ? app.date.viDateFormat(new Date(canBo.ngayXuatNgu)) : '',
                        quanHam: canBo.quanHam || '',
                        soTruong: canBo.soTruong || '',
                        sucKhoe: canBo.sucKhoe || '',
                        chieuCao: canBo.chieuCao || '',
                        canNang: canBo.canNang || '',
                        nhomMau: canBo.nhomMau || '',
                        hangThuongBinh: canBo.hangThuongBinh || '',
                        giaDinhChinhSach: canBo.giaDinhChinhSach || '',
                        bhxh: canBo.soBaoHiemXaHoi || '',
                        toChucKhac,
                        qtDaoTao,
                        llct: llct.tenTrinhDo || '',
                        tinHoc: tinHoc.tenTrinhDo || '',
                        qlnn: qlnn.tenTrinhDo || '',
                        qtHocTapCongTac,
                        ngoaiNgu: canBo.ngoaiNgu || '',
                        quanHe: quanHeGiaDinh.filter(i => i.loai == 0),
                        quanHeInLaw: quanHeGiaDinh.filter(i => i.loai == 1),
                        danhHieu: ''
                    };
                    app.docx.generateFile(source, data, (error, data) => {
                        if (error)
                            res.send({ error });
                        else
                            res.send({ data });
                    });
                }
            });
        } else res.send({ error: 'No permission' });
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
                            emailCaNhan: canBo.emailCaNhan ? canBo.emailCaNhan : ''
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
                        } else if (firstMst.length == 2) {
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
                            res.send({ error, data });
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
                                    loiCamDoan: worksheet.getCell('FI' + index).value
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
                                                namCap: namCap
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
                                                sanPham: sanPham
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

    app.get('/api/staff/get-all-chuyen-nganh', app.permission.check('staff:read'), (req, res) => {
        app.model.canBo.getAll({
            statement: 'lower(chuyenNganh) LIKE (:searchTerm)',
            parameter: {
                searchTerm: `%${req.query.condition || ''}%`
            }
        }, 'chuyenNganh', null, (error, items) => res.send({ error, items }));
    });
    app.get('/api/staff/download-excel/:filter/:searchTerm', checkGetStaffPermission, (req, res) => {
        let searchTerm = req.params.searchTerm;
        if (searchTerm == 'null') searchTerm = '';

        app.model.canBo.download(req.params.filter, searchTerm, (error, result) => {
            if (error || !result) {
                res.send({ error });
            } else {
                const workbook = app.excel.create(),
                    worksheet = workbook.addWorksheet('Sheet1');
                new Promise(resolve => {
                    let cells = [
                        // Table name: TCHC_CAN_BO { ten, ho, phai, dienThoaiCaNhan, email, ngaySinh, ngayBatDauCongTac, ngayCbgd, ngayBienChe, ngayNghi, ngach, heSoLuong, bacLuong, mocNangLuong, ngayHuongLuong, tyLeVuotKhung, maChucVu, chucVuDoanThe, chucVuDang, chucVuKiemNhiem, hoKhau, diaChiHienTai, danToc, tonGiao, dangVien, maDonVi, phucLoi, nhaGiaoNhanDan, nhaGiaoUuTu, ghiChu, shcc, emailCaNhan, biDanh, dienThoaiBaoTin, ngheNghiepCu, cmnd, cmndNgayCap, cmndNoiCap, chucVuKhac, quocGia, chucDanh, trinhDoPhoThong, hocVi, chuyenNganh, sucKhoe, canNang, chieuCao, ngayNhapNgu, ngayXuatNgu, quanHamCaoNhat, hangThuongBinh, giaDinhChinhSach, danhHieu, maXaNoiSinh, maHuyenNoiSinh, maTinhNoiSinh, maXaNguyenQuan, maHuyenNguyenQuan, maTinhNguyenQuan, ngayVaoDang, ngayVaoDangChinhThuc, noiDangDb, noiDangCt, ngayVaoDoan, noiVaoDoan, soTheDang, soTruong, nhomMau, soBhxh, doanVien, namChucDanh, namHocVi, noiSinh, queQuan, thuongTruMaHuyen, thuongTruMaTinh, thuongTruMaXa, thuongTruSoNha, hienTaiMaHuyen, hienTaiMaTinh, hienTaiMaXa, hienTaiSoNha, canBoCanBo, canBoCanBoNgay, userModified, lastModified, dangNghiThaiSan, ngayBatDauNghiThaiSan, ngayKetThucNghiThaiSan, congDoan, ngayVaoCongDoan, maTheBhyt, noiKhamChuaBenhBanDau, quyenLoiKhamChuaBenh, dangNghiKhongHuongLuong, ngayBatDauNghiKhongHuongLuong, ngayKetThucNghiKhongHuongLuong, lyDoNghiKhongHuongLuong, doiTuongBoiDuongKienThucQpan, ngayBatDauBhxh, ngayKetThucBhxh, tuNhanXet, tinhTrangBoiDuong, namBoiDuong, khoaBoiDuong, trinhDoChuyenMon, namTotNghiep, phuCapChucVu, tyLePhuCapThamNien, tyLePhuCapUuDai, loaiDoiTuongBoiDuong, loaiHopDong, cuNhan, thacSi, tienSi, chuyenNganhChucDanh, coSoChucDanh }
                        { cell: 'A1', value: 'STT', bold: true, border: '1234' },
                        { cell: 'B1', value: 'Mã số VC&NLD', bold: true, border: '1234' },
                        { cell: 'C1', value: 'Họ', bold: true, border: '1234' },
                        { cell: 'D1', value: 'Tên', bold: true, border: '1234' },
                        { cell: 'E1', value: 'Giới tính', bold: true, border: '1234' },
                        { cell: 'F1', value: 'Ngày sinh', bold: true, border: '1234' },
                        { cell: 'G1', value: 'Quê quán', bold: true, border: '1234' },
                        { cell: 'H1', value: 'Dân tộc', bold: true, border: '1234' },
                        { cell: 'I1', value: 'Tôn giáo', bold: true, border: '1234' },
                        { cell: 'J1', value: 'Chức vụ', bold: true, border: '1234' },
                        { cell: 'K1', value: 'Bổ nhiệm ngày', bold: true, border: '1234' },
                        { cell: 'L1', value: 'Đơn vị công tác', bold: true, border: '1234' },
                        { cell: 'M1', value: 'Năm bắt đầu công tác', bold: true, border: '1234' },
                        { cell: 'N1', value: 'Chức danh nghề nghiệp', bold: true, border: '1234' },
                        { cell: 'O1', value: 'Mã ngạch', bold: true, border: '1234' },
                        { cell: 'P1', value: 'Hệ số lương hiện hữu', bold: true, border: '1234' },
                        { cell: 'Q1', value: 'Bậc trong ngạch', bold: true, border: '1234' },
                        { cell: 'R1', value: 'Phụ cấp thâm niên vượt khung', bold: true, border: '1234' },
                        { cell: 'S1', value: 'Thời điểm tính nâng bậc lương lần sau', bold: true, border: '1234' },
                        { cell: 'T1', value: 'Phụ cấp chức vụ', bold: true, border: '1234' },
                        { cell: 'U1', value: 'Trình độ chuyên môn', bold: true, border: '1234' },
                        { cell: 'V1', value: 'Quốc gia tốt nghiệp', bold: true, border: '1234' },
                        { cell: 'W1', value: 'Chuyên ngành', bold: true, border: '1234' },
                        { cell: 'X1', value: 'Năm đạt học vị TS', bold: true, border: '1234' },
                        { cell: 'Y1', value: 'Chức danh khoa học', bold: true, border: '1234' },
                        { cell: 'Z1', value: 'Năm bổ nhiệm', bold: true, border: '1234' },
                        { cell: 'AA1', value: 'Ngành chuyên môn', bold: true, border: '1234' },
                        { cell: 'AB1', value: 'Danh hiệu nhà giáo (NGND, NGUT)', bold: true, border: '1234' },
                        { cell: 'AC1', value: 'Biên chế', bold: true, border: '1234' },
                        { cell: 'AD1', value: 'Ngày vào biên chế', bold: true, border: '1234' },
                        { cell: 'AE1', value: 'Đảng viên', bold: true, border: '1234' },
                        { cell: 'AF1', value: 'Ghi chú', bold: true, border: '1234' },
                        { cell: 'AG1', value: 'Số CMND', bold: true, border: '1234' },
                        { cell: 'AH1', value: 'Ngày cấp', bold: true, border: '1234' },
                        { cell: 'AI1', value: 'Nơi cấp', bold: true, border: '1234' },
                    ];
                    result.rows.forEach((item, index) => {
                        cells.push({ cell: 'A' + (index + 2), border: '1234', number: index + 1 });
                        cells.push({ cell: 'B' + (index + 2), border: '1234', value: item.shcc });
                        cells.push({ cell: 'C' + (index + 2), border: '1234', value: item.ho });
                        cells.push({ cell: 'D' + (index + 2), border: '1234', value: item.ten });
                        cells.push({ cell: 'E' + (index + 2), border: '1234', value: item.phai == '01' ? 'Nam' : 'Nữ' });
                        cells.push({ cell: 'F' + (index + 2), alignment: 'center', border: '1234', value: item.ngaySinh ? app.date.dateTimeFormat(new Date(item.ngaySinh), 'dd/mm/yyyy') : '' });
                        cells.push({ cell: 'G' + (index + 2), border: '1234', value: item.queQuan });
                        cells.push({ cell: 'H' + (index + 2), border: '1234', value: item.tenDanToc });
                        cells.push({ cell: 'I' + (index + 2), border: '1234', value: item.tenTonGiao });
                        cells.push({ cell: 'J' + (index + 2), border: '1234', value: item.chucVuChinh });
                        cells.push({ cell: 'K' + (index + 2), alignment: 'center', border: '1234', value: item.boNhiemNgay ? app.date.dateTimeFormat(new Date(item.boNhiemNgay), 'dd/mm/yyyy') : '' });
                        cells.push({ cell: 'L' + (index + 2), border: '1234', value: item.tenDonVi });
                        cells.push({ cell: 'M' + (index + 2), border: '1234', value: item.ngayBatDauCongTac ? app.date.dateTimeFormat(new Date(item.ngayBatDauCongTac), 'dd/mm/yyyy') : '' });
                        cells.push({ cell: 'N' + (index + 2), border: '1234', value: item.tenChucDanhNgheNghiep });
                        cells.push({ cell: 'O' + (index + 2), border: '1234', value: item.ngach });
                        cells.push({ cell: 'P' + (index + 2), border: '1234', value: item.heSoLuong });
                        cells.push({ cell: 'Q' + (index + 2), border: '1234', value: item.bacLuong });
                        cells.push({ cell: 'R' + (index + 2), border: '1234', value: item.tyLeVuotKhung ? item.tyLeVuotKhung.toString() + '%' : '' });
                        cells.push({ cell: 'S' + (index + 2), border: '1234', value: item.mocNangLuong ? app.date.dateTimeFormat(new Date(item.mocNangLuong), 'dd/mm/yyyy') : '' });
                        cells.push({ cell: 'T' + (index + 2), border: '1234', value: item.phuCapChucVu });
                        cells.push({ cell: 'U' + (index + 2), border: '1234', value: item.hocVi ? item.hocVi : item.trinhDoPhoThong });
                        cells.push({ cell: 'V' + (index + 2), border: '1234', value: item.danhSahcQuocGiaHocViNoiTotNghiep });
                        cells.push({ cell: 'W' + (index + 2), border: '1234', value: item.chuyenNganh });
                        cells.push({ cell: 'X' + (index + 2), border: '1234', value: item.namHocVi ? app.date.dateTimeFormat(new Date(item.namHocVi), 'yyyy') : '' });
                        cells.push({ cell: 'Y' + (index + 2), border: '1234', value: item.hocHam });
                        cells.push({ cell: 'Z' + (index + 2), border: '1234', value: item.namChucDanh ? app.date.dateTimeFormat(new Date(item.namChucDanh), 'yyyy') : '' });
                        cells.push({ cell: 'AA' + (index + 2), border: '1234', value: item.chuyenNganhChucDanh });
                        cells.push({ cell: 'AB' + (index + 2), border: '1234', value: item.danhHieu });
                        cells.push({ cell: 'AC' + (index + 2), border: '1234', value: item.ngayBienChe ? 'X' : '' });
                        cells.push({ cell: 'AD' + (index + 2), border: '1234', value: (item.ngayBienChe && item.ngayBienChe != 1) ? app.date.dateTimeFormat(new Date(item.ngayBienChe), 'dd/mm/yyyy') : '' });
                        cells.push({ cell: 'AE' + (index + 2), border: '1234', value: item.dangVien ? 'X' : '' });
                        cells.push({ cell: 'AF' + (index + 2), border: '1234', value: item.ghiChu });
                        cells.push({ cell: 'AG' + (index + 2), border: '1234', value: item.cmnd });
                        cells.push({ cell: 'AH' + (index + 2), border: '1234', value: item.cmndNgayCap ? app.date.dateTimeFormat(new Date(item.cmndNgayCap), 'dd/mm/yyyy') : '' });
                        cells.push({ cell: 'AI' + (index + 2), border: '1234', value: item.cmndNoiCap });
                    });
                    resolve(cells);
                }).then((cells) => {
                    app.excel.write(worksheet, cells);
                    app.excel.attachment(workbook, res, 'DANH_SACH_CAN_BO.xlsx');
                }).catch((error) => {
                    res.send({ error });
                });
            }
        });
    });

    app.get('/api/staff/by-email/:email', app.permission.check('staff:read'), (req, res) => {
        app.model.canBo.get({ email: req.params.email }, (error, item) => res.send({ error, item }));
    });

    app.post('/api/staff/quan-he', app.permission.check('staff:login'), (req, res) => {
        let shcc = app.model.canBo.validShcc(req, req.body.shcc);
        if (shcc) {
            let data = { ...req.body.data, shcc };
            app.model.quanHeCanBo.create(data, (error, item) => res.send({ error, item }));
        } else res.send({ error: 'No permission' });
    });

    app.put('/api/staff/quan-he', app.permission.check('staff:login'), (req, res) => {
        let shcc = app.model.canBo.validShcc(req, req.body.shcc);
        shcc ? app.model.quanHeCanBo.update({ id: req.body.id }, req.body.changes, (error, item) => res.send({ error, item })) : res.send({ error: 'No permission' });
    });

    app.delete('/api/staff/quan-he', app.permission.check('staff:login'), (req, res) => {
        let shcc = app.model.canBo.validShcc(req, req.body.shcc);
        shcc ? app.model.quanHeCanBo.delete({ id: req.body.id }, (error) => res.send(error)) : res.send({ error: 'No permission' });
    });

    app.get('/api/staff/download-monthly-report', checkGetStaffPermission, (req, res) => {
        const workbook = app.excel.create(),
            worksheet = workbook.addWorksheet('Sheet1');
        const promiseCalDonVi = new Promise((resolve) => {
            let cells = [{ cell: 'A1', value: 'Thống kê Đơn vị thuộc Trường', border: '1234', bold: true }];
            cells.push({ cell: 'B1', value: 'Số lượng', border: '1234', bold: true });
            app.model.dmDonVi.getAll((error, data) => {
                data = data.groupBy('maPl');
                cells.push({ cell: 'A2', value: 'Phòng chức năng, Thư viện, Bảo tàng, CS.TĐ', border: '1234' });
                cells.push({ cell: 'B2', number: data['2']?.length, border: '1234' });
                cells.push({ cell: 'A3', value: 'Khoa', border: '1234' });
                cells.push({ cell: 'B3', number: data['1']?.length, border: '1234' });
                cells.push({ cell: 'A4', value: 'Bộ môn', border: '1234' });
                cells.push({ cell: 'B4', number: data['5']?.length, border: '1234' });
                cells.push({ cell: 'A5', value: 'Trung tâm', border: '1234' });
                cells.push({ cell: 'B5', number: data['3']?.length, border: '1234' });
                cells.push({ cell: 'A6', value: 'Công ty', border: '1234' });
                cells.push({ cell: 'B6', number: data['6']?.length, border: '1234' });
                cells.push({ cell: 'A7', value: 'Đoàn thể', border: '1234' });
                cells.push({ cell: 'B7', number: data['4']?.length, border: '1234' });
                resolve(cells);
            });
        });

        const promiseCalBoMon = new Promise((resolve) => {
            let cells = [{ cell: 'A8', value: 'Thống kê Đơn vị thuộc Phòng/Khoa/Trung tâm', border: '1234', bold: true }];
            app.model.dmBoMon.getAll((error, data) => {
                data = data.groupBy('maPl');
                cells.push({ cell: 'A9', value: 'Bộ môn thuộc Khoa/Trung tâm', border: '1234' });
                cells.push({ cell: 'B9', number: data['1']?.length, border: '1234' });
                cells.push({ cell: 'A10', value: 'Phòng thuộc Khoa', border: '1234' });
                cells.push({ cell: 'B10', number: data['2']?.length, border: '1234' });
                cells.push({ cell: 'A11', value: 'Bộ Trung tâm thuộc Khoa/Phòng', border: '1234' });
                cells.push({ cell: 'B11', number: data['3']?.length, border: '1234' });
                resolve(cells);
            });
        });

        const promiseCalVCQL = new Promise((resolve) => {
            let cells = [{ cell: 'A13', value: 'Thống kê viên chức quản lí', border: '1234', bold: true }];
            cells.push({ cell: 'B13', value: 'Số lượng', border: '1234', bold: true });
            cells.push({ cell: 'C13', value: 'Không tính kiêm nhiệm', border: '1234', bold: true });
            let calVCQLCapTruong = 0;
            let calVCQLCapTruongKhongKiemNhiem = 0;
            let calVCQLCapKhoa = 0;
            let calVCQLCapKhoaKhongKiemNhiem = 0;
            app.model.qtChucVu.getAll((error, data) => {
                data.forEach((item) => {
                    if (item.maBoMon == null) calVCQLCapTruong++;
                    if (item.maBoMon == null && item.chucVuChinh == 1) calVCQLCapTruongKhongKiemNhiem++;
                    if (item.maBoMon) calVCQLCapKhoa++;
                    if (item.maBoMon && item.chucVuChinh == 1) calVCQLCapKhoaKhongKiemNhiem++;
                });
                cells.push({ cell: 'A14', value: 'VCQL cấp đơn vị thuộc trường', border: '1234' });
                cells.push({ cell: 'B14', number: calVCQLCapTruong, border: '1234' });
                cells.push({ cell: 'C14', number: calVCQLCapTruongKhongKiemNhiem, border: '1234' });
                cells.push({ cell: 'A15', value: 'VCQL cấp đơn vị thuộc phòng, ban, khoa, bộ môn, trung tâm', border: '1234' });
                cells.push({ cell: 'B15', number: calVCQLCapKhoa, border: '1234' });
                cells.push({ cell: 'C15', number: calVCQLCapKhoaKhongKiemNhiem, border: '1234' });
                cells.push({ cell: 'A16', value: 'Tổng cộng', border: '1234', bold: true });
                cells.push({ cell: 'B16', number: calVCQLCapTruong + calVCQLCapKhoa, border: '1234', bold: true });
                cells.push({ cell: 'C16', number: calVCQLCapTruongKhongKiemNhiem + calVCQLCapKhoaKhongKiemNhiem, border: '1234', bold: true });
                resolve(cells);
            });
        });

        const promiseCalCanBo = new Promise(resolve => {
            let cells = [{ cell: 'A18', value: 'Loại hình biên chế/hợp đồng', border: '1234', bold: true }];
            cells.push({ cell: 'B18', value: 'Số lượng', border: '1234', bold: true });
            cells.push({ cell: 'C18', value: 'Tỷ lệ (%)', border: '1234', bold: true });
            cells.push({ cell: 'D18', value: 'Số lượng nữ', border: '1234', bold: true });
            cells.push({ cell: 'E18', value: 'Tỷ lệ (%)', border: '1234', bold: true });
            let calBienChe = 0;
            let calHopDong = 0;
            let calBienCheNu = 0;
            let calHopDongNu = 0;
            app.model.canBo.getAll({
                statement: 'ngayNghi IS NULL',
                parameter: {}
            }, (error, data) => {
                data.forEach((item) => {
                    if (item.ngayBienChe) {
                        calBienChe++;
                        if (item.phai == '02') calBienCheNu++;
                    } else {
                        calHopDong++;
                        if (item.phai == '02') calHopDongNu++;
                    }
                });
                let total = calBienChe + calHopDong;
                cells.push({ cell: 'A19', value: 'Biên chế', border: '1234' });
                cells.push({ cell: 'B19', number: calBienChe, border: '1234' });
                cells.push({ cell: 'C19', value: Number.parseFloat(calBienChe * 100 / total).toFixed(2), border: '1234' });
                cells.push({ cell: 'D19', number: calBienCheNu, border: '1234' });
                cells.push({ cell: 'E19', value: Number.parseFloat(calBienCheNu * 100 / (calBienCheNu + calHopDongNu)).toFixed(2), border: '1234' });
                cells.push({ cell: 'A20', value: 'Hợp đồng', border: '1234' });
                cells.push({ cell: 'B20', number: calHopDong, border: '1234' });
                cells.push({ cell: 'C20', value: Number.parseFloat(calHopDong * 100 / total).toFixed(2), border: '1234' });
                cells.push({ cell: 'D20', number: calHopDongNu, border: '1234' });
                cells.push({ cell: 'E20', value: Number.parseFloat(calHopDongNu * 100 / (calBienCheNu + calHopDongNu)).toFixed(2), border: '1234' });
                cells.push({ cell: 'A21', value: 'Tổng cộng', border: '1234', bold: true });
                cells.push({ cell: 'B21', number: total, border: '1234', bold: true });
                cells.push({ cell: 'C21', value: 100.00, border: '1234', bold: true });
                cells.push({ cell: 'D21', number: calBienCheNu + calHopDongNu, border: '1234', bold: true });
                cells.push({ cell: 'E21', value: 100.00, border: '1234', bold: true });
                resolve(cells);
            });
        });

        const promiseCalChucDanhNgheNghiep = new Promise(resolve => {
            let cells = [{ cell: 'A23', value: 'Cơ cấu', border: '1234', bold: true }];
            cells.push({ cell: 'B23', value: 'Số lượng', border: '1234', bold: true });
            cells.push({ cell: 'C23', value: 'Tỷ lệ (%)', border: '1234', bold: true });
            cells.push({ cell: 'D23', value: 'Số lượng nữ', border: '1234', bold: true });
            cells.push({ cell: 'E23', value: 'Tỷ lệ (%)', border: '1234', bold: true });
            let listNhom = [0, 0, 0, 0, 0];
            let listNhomNu = [0, 0, 0, 0, 0];
            let chuyenVienDaoTao = 0, chuyenVienDaoTaoNu = 0;
            app.model.canBo.getAll({
                statement: 'ngayNghi IS NULL',
                parameter: {}
            }, (error, data) => {
                const traverse = (index = 0) => {
                    if (index >= data.length) {
                        let total = listNhom[0] + listNhom[1] + listNhom[2] + listNhom[3] + listNhom[4],
                            totalNu = listNhomNu[0] + listNhomNu[1] + listNhomNu[2] + listNhomNu[3] + listNhomNu[4];
                        cells.push({ cell: 'A24', value: 'Giảng viên', border: '1234' });
                        cells.push({ cell: 'B24', number: listNhom[0], border: '1234' });
                        cells.push({ cell: 'C24', value: Number.parseFloat(listNhom[0] * 100 / total).toFixed(2), border: '1234' });
                        cells.push({ cell: 'D24', number: listNhomNu[0], border: '1234' });
                        cells.push({ cell: 'E24', value: Number.parseFloat(listNhomNu[0] * 100 / totalNu).toFixed(2), border: '1234' });

                        cells.push({ cell: 'A25', value: 'Nghiên cứu viên', border: '1234' });
                        cells.push({ cell: 'B25', number: listNhom[1], border: '1234' });
                        cells.push({ cell: 'C25', value: Number.parseFloat(listNhom[1] * 100 / total).toFixed(2), border: '1234' });
                        cells.push({ cell: 'D25', number: listNhomNu[1], border: '1234' });
                        cells.push({ cell: 'E25', value: Number.parseFloat(listNhomNu[1] * 100 / totalNu).toFixed(2), border: '1234' });

                        cells.push({ cell: 'A26', value: 'Chuyên viên phục vụ đào tạo và NCKH', border: '1234' });
                        cells.push({ cell: 'B26', number: chuyenVienDaoTao, border: '1234' });
                        cells.push({ cell: 'C26', value: Number.parseFloat(chuyenVienDaoTao * 100 / total).toFixed(2), border: '1234' });
                        cells.push({ cell: 'D26', number: chuyenVienDaoTaoNu, border: '1234' });
                        cells.push({ cell: 'E26', value: Number.parseFloat(chuyenVienDaoTaoNu * 100 / totalNu).toFixed(2), border: '1234' });

                        cells.push({ cell: 'A27', value: 'Chuyên viên hành chính và nhân viên phục vụ', border: '1234' });
                        cells.push({ cell: 'B27', number: (total - chuyenVienDaoTao - listNhom[0] - listNhom[1]), border: '1234' });
                        cells.push({ cell: 'C27', value: Number.parseFloat((total - chuyenVienDaoTao - listNhom[0] - listNhom[1]) * 100 / total).toFixed(2), border: '1234' });
                        cells.push({ cell: 'D27', number: (totalNu - chuyenVienDaoTaoNu - listNhomNu[0] - listNhomNu[1]), border: '1234' });
                        cells.push({ cell: 'E27', value: Number.parseFloat((totalNu - chuyenVienDaoTaoNu - listNhomNu[0] - listNhomNu[1]) * 100 / totalNu).toFixed(2), border: '1234' });

                        cells.push({ cell: 'A28', value: 'Tổng', border: '1234', bold: true });
                        cells.push({ cell: 'B28', number: total, border: '1234', bold: true });
                        cells.push({ cell: 'C28', value: 100.00, border: '1234', bold: true });
                        cells.push({ cell: 'D28', number: totalNu, border: '1234', bold: true });
                        cells.push({ cell: 'E28', value: 100.00, border: '1234', bold: true });
                        resolve(cells);
                        return;
                    }
                    app.model.dmNgachCdnn.get({ ma: data[index].ngach }, (error, itemNgach) => {
                        if (itemNgach) {
                            if (itemNgach.nhom && itemNgach.nhom <= 5) {
                                let nhom = itemNgach.nhom;
                                listNhom[nhom - 1] += 1;
                                if (data[index].phai == '02') listNhomNu[nhom - 1] += 1;
                            }
                            if (data[index].ngach == '01.003') {
                                if (data[index].isCvdt == 1) {
                                    chuyenVienDaoTao += 1;
                                    if (data[index].phai == '02') chuyenVienDaoTaoNu += 1;
                                }
                            }
                        }
                        traverse(index + 1);
                    });
                };
                traverse();
            });
        });

        const promiseCalTrinhDoCanBo = new Promise(resolve => {
            let cells = [{ cell: 'A30', value: 'Trình độ VC, NLĐ', border: '1234', bold: true }];
            cells.push({ cell: 'B30', value: 'Số lượng', border: '1234', bold: true });
            cells.push({ cell: 'C30', value: 'Tỷ lệ (%)', border: '1234', bold: true });
            cells.push({ cell: 'D30', value: 'Số lượng nữ', border: '1234', bold: true });
            cells.push({ cell: 'E30', value: 'Tỷ lệ (%)', border: '1234', bold: true });
            app.model.canBo.getAll({
                statement: 'ngayNghi IS NULL',
                parameter: {}
            }, (error, data) => {
                let dataHocVi = data.groupBy('hocVi');
                let dataChucDanh = data.groupBy('chucDanh');
                ['01', '02', '03', '04', '05'].forEach((key,) => {
                    if (!(key in dataHocVi)) {
                        dataHocVi[key] = [];
                    }
                });
                ['01', '02'].forEach((key,) => {
                    if (!(key in dataChucDanh)) {
                        dataChucDanh[key] = [];
                    }
                });
                let dataHocViNu = {};
                let dataChucDanhNu = {};
                let total = data.length;
                let totalNu = 0;
                for (const [key, list] of Object.entries(dataHocVi)) {
                    dataHocViNu[key] = 0;
                    list.forEach((item) => {
                        if (item.phai == '02') {
                            dataHocViNu[key] += 1;
                            totalNu += 1;
                        }
                    });
                }
                for (const [key, list] of Object.entries(dataChucDanh)) {
                    dataChucDanhNu[key] = 0;
                    list.forEach((item) => {
                        if (item.phai == '02') dataChucDanhNu[key] += 1;
                    });
                }
                cells.push({ cell: 'A31', value: 'Giáo sư', border: '1234' });
                cells.push({ cell: 'B31', number: dataChucDanh['01'].length, border: '1234' });
                cells.push({ cell: 'C31', value: Number.parseFloat(dataChucDanh['01'].length * 100 / total).toFixed(2), border: '1234' });
                cells.push({ cell: 'D31', number: dataChucDanhNu['01'], border: '1234' });
                cells.push({ cell: 'E31', value: Number.parseFloat(dataChucDanhNu['01'] * 100 / totalNu).toFixed(2), border: '1234' });

                cells.push({ cell: 'A32', value: 'Phó giáo sư', border: '1234' });
                cells.push({ cell: 'B32', number: dataChucDanh['02'].length, border: '1234' });
                cells.push({ cell: 'C32', value: Number.parseFloat(dataChucDanh['02'].length * 100 / total).toFixed(2), border: '1234' });
                cells.push({ cell: 'D32', number: dataChucDanhNu['02'], border: '1234' });
                cells.push({ cell: 'E32', value: Number.parseFloat(dataChucDanhNu['02'] * 100 / totalNu).toFixed(2), border: '1234' });

                cells.push({ cell: 'A33', value: 'Tiến sĩ + Tiến sĩ khoa học (không bao gồm GS, PGS)', border: '1234' });
                cells.push({ cell: 'B33', number: (dataHocVi['01'].length + dataHocVi['02'].length - dataChucDanh['01'].length - dataChucDanh['02'].length), border: '1234' });
                cells.push({ cell: 'C33', value: Number.parseFloat((dataHocVi['01'].length + dataHocVi['02'].length - dataChucDanh['01'].length - dataChucDanh['02'].length) * 100 / total).toFixed(2), border: '1234' });
                cells.push({ cell: 'D33', number: (dataHocViNu['01'] + dataHocViNu['02'] - dataChucDanhNu['01'] - dataChucDanhNu['02']), border: '1234' });
                cells.push({ cell: 'E33', value: Number.parseFloat((dataHocViNu['01'] + dataHocViNu['02'] - dataChucDanhNu['01'] - dataChucDanhNu['02']) * 100 / totalNu).toFixed(2), border: '1234' });

                cells.push({ cell: 'A34', value: 'Thạc sĩ', border: '1234' });
                cells.push({ cell: 'B34', number: dataHocVi['03'].length, border: '1234' });
                cells.push({ cell: 'C34', value: Number.parseFloat(dataHocVi['03'].length * 100 / total).toFixed(2), border: '1234' });
                cells.push({ cell: 'D34', number: dataHocViNu['03'], border: '1234' });
                cells.push({ cell: 'E34', value: Number.parseFloat(dataHocViNu['03'] * 100 / totalNu).toFixed(2), border: '1234' });

                cells.push({ cell: 'A35', value: 'Cử nhân', border: '1234' });
                cells.push({ cell: 'B35', number: dataHocVi['04'].length, border: '1234' });
                cells.push({ cell: 'C35', value: Number.parseFloat(dataHocVi['04'].length * 100 / total).toFixed(2), border: '1234' });
                cells.push({ cell: 'D35', number: dataHocViNu['04'], border: '1234' });
                cells.push({ cell: 'E35', value: Number.parseFloat(dataHocViNu['04'] * 100 / totalNu).toFixed(2), border: '1234' });

                cells.push({ cell: 'A36', value: 'Kỹ sư', border: '1234' });
                cells.push({ cell: 'B36', number: dataHocVi['05'].length, border: '1234' });
                cells.push({ cell: 'C36', value: Number.parseFloat(dataHocVi['05'].length * 100 / total).toFixed(2), border: '1234' });
                cells.push({ cell: 'D36', number: dataHocViNu['05'], border: '1234' });
                cells.push({ cell: 'E36', value: Number.parseFloat(dataHocViNu['05'] * 100 / totalNu).toFixed(2), border: '1234' });

                let remain = total;
                remain -= dataHocVi['01'].length;
                remain -= dataHocVi['02'].length;
                remain -= dataHocVi['03'].length;
                remain -= dataHocVi['04'].length;
                remain -= dataHocVi['05'].length;

                let remainNu = totalNu;
                remainNu -= dataHocViNu['01'];
                remainNu -= dataHocViNu['02'];
                remainNu -= dataHocViNu['03'];
                remainNu -= dataHocViNu['04'];
                remainNu -= dataHocViNu['05'];

                cells.push({ cell: 'A37', value: 'Còn lại', border: '1234' });
                cells.push({ cell: 'B37', number: remain, border: '1234' });
                cells.push({ cell: 'C37', value: Number.parseFloat(remain * 100 / total).toFixed(2), border: '1234' });
                cells.push({ cell: 'D37', number: remainNu, border: '1234' });
                cells.push({ cell: 'E37', value: Number.parseFloat(remainNu * 100 / totalNu).toFixed(2), border: '1234' });

                cells.push({ cell: 'A38', value: 'Tổng', border: '1234', bold: true });
                cells.push({ cell: 'B38', number: total, border: '1234', bold: true });
                cells.push({ cell: 'C38', value: 100.00, border: '1234', bold: true });
                cells.push({ cell: 'D38', number: totalNu, border: '1234', bold: true });
                cells.push({ cell: 'E38', value: 100.00, border: '1234', bold: true });
                resolve(cells);
            });
        });

        const promiseCalTrinhDoGiangVien = new Promise(resolve => {
            let cells = [{ cell: 'A40', value: 'Trình độ giảng viên', border: '1234', bold: true }];
            cells.push({ cell: 'B40', value: 'Số lượng', border: '1234', bold: true });
            cells.push({ cell: 'C40', value: 'Tỷ lệ (%)', border: '1234', bold: true });
            cells.push({ cell: 'D40', value: 'Số lượng nữ', border: '1234', bold: true });
            cells.push({ cell: 'E40', value: 'Tỷ lệ (%)', border: '1234', bold: true });
            app.model.canBo.getAll({
                statement: 'ngayNghi IS NULL AND ngach IN (\'V.07.01.03\', \'15.109\', \'15.110\', \'V.07.01.01\', \'V.07.01.02\', \'15.111\')',
                parameter: {}
            }, (error, data) => {
                let dataHocVi = data.groupBy('hocVi');
                let dataChucDanh = data.groupBy('chucDanh');
                ['01', '02', '03', '04'].forEach((key,) => {
                    if (!(key in dataHocVi)) {
                        dataHocVi[key] = [];
                    }
                });
                ['01', '02'].forEach((key,) => {
                    if (!(key in dataChucDanh)) {
                        dataChucDanh[key] = [];
                    }
                });
                let dataHocViNu = {};
                let dataChucDanhNu = {};
                let total = data.length;
                let totalNu = 0;
                for (const [key, list] of Object.entries(dataHocVi)) {
                    dataHocViNu[key] = 0;
                    list.forEach((item) => {
                        if (item.phai == '02') {
                            dataHocViNu[key] += 1;
                            totalNu += 1;
                        }
                    });
                }
                for (const [key, list] of Object.entries(dataChucDanh)) {
                    dataChucDanhNu[key] = 0;
                    list.forEach((item) => {
                        if (item.phai == '02') dataChucDanhNu[key] += 1;
                    });
                }
                cells.push({ cell: 'A41', value: 'Giáo sư', border: '1234' });
                cells.push({ cell: 'B41', number: dataChucDanh['01'].length, border: '1234' });
                cells.push({ cell: 'C41', value: Number.parseFloat(dataChucDanh['01'].length * 100 / total).toFixed(2), border: '1234' });
                cells.push({ cell: 'D41', number: dataChucDanhNu['01'], border: '1234' });
                cells.push({ cell: 'E41', value: Number.parseFloat(dataChucDanhNu['01'] * 100 / totalNu).toFixed(2), border: '1234' });

                cells.push({ cell: 'A42', value: 'Phó giáo sư', border: '1234' });
                cells.push({ cell: 'B42', number: dataChucDanh['02'].length, border: '1234' });
                cells.push({ cell: 'C42', value: Number.parseFloat(dataChucDanh['02'].length * 100 / total).toFixed(2), border: '1234' });
                cells.push({ cell: 'D42', number: dataChucDanhNu['02'], border: '1234' });
                cells.push({ cell: 'E42', value: Number.parseFloat(dataChucDanhNu['02'] * 100 / totalNu).toFixed(2), border: '1234' });

                cells.push({ cell: 'A43', value: 'Tiến sĩ + Tiến sĩ khoa học (không bao gồm GS, PGS)', border: '1234' });
                cells.push({ cell: 'B43', number: (dataHocVi['01'].length + dataHocVi['02'].length - dataChucDanh['01'].length - dataChucDanh['02'].length), border: '1234' });
                cells.push({ cell: 'C43', value: Number.parseFloat((dataHocVi['01'].length + dataHocVi['02'].length - dataChucDanh['01'].length - dataChucDanh['02'].length) * 100 / total).toFixed(2), border: '1234' });
                cells.push({ cell: 'D43', number: (dataHocViNu['01'] + dataHocViNu['02'] - dataChucDanhNu['01'] - dataChucDanhNu['02']), border: '1234' });
                cells.push({ cell: 'E43', value: Number.parseFloat((dataHocViNu['01'] + dataHocViNu['02'] - dataChucDanhNu['01'] - dataChucDanhNu['02']) * 100 / totalNu).toFixed(2), border: '1234' });

                cells.push({ cell: 'A44', value: 'Thạc sĩ', border: '1234' });
                cells.push({ cell: 'B44', number: dataHocVi['03'].length, border: '1234' });
                cells.push({ cell: 'C44', value: Number.parseFloat(dataHocVi['03'].length * 100 / total).toFixed(2), border: '1234' });
                cells.push({ cell: 'D44', number: dataHocViNu['03'], border: '1234' });
                cells.push({ cell: 'E44', value: Number.parseFloat(dataHocViNu['03'] * 100 / totalNu).toFixed(2), border: '1234' });

                cells.push({ cell: 'A45', value: 'Cử nhân', border: '1234' });
                cells.push({ cell: 'B45', number: dataHocVi['04'].length, border: '1234' });
                cells.push({ cell: 'C45', value: Number.parseFloat(dataHocVi['04'].length * 100 / total).toFixed(2), border: '1234' });
                cells.push({ cell: 'D45', number: dataHocViNu['04'], border: '1234' });
                cells.push({ cell: 'E45', value: Number.parseFloat(dataHocViNu['04'] * 100 / totalNu).toFixed(2), border: '1234' });

                cells.push({ cell: 'A46', value: 'Tổng', border: '1234', bold: true });
                cells.push({ cell: 'B46', number: total, border: '1234', bold: true });
                cells.push({ cell: 'C46', value: 100.00, border: '1234', bold: true });
                cells.push({ cell: 'D46', number: totalNu, border: '1234', bold: true });
                cells.push({ cell: 'E46', value: 100.00, border: '1234', bold: true });
                resolve(cells);
            });
        });
        const promiseUpdateNhanSu = new Promise(resolve => {
            let currentDate = new Date();
            currentDate.setDate(1);
            currentDate.setMonth(currentDate.getMonth() - 1);
            let monthYear = currentDate.getMonth() + '/' + currentDate.getFullYear();
            let cells = [{ cell: 'A48', value: 'Cập nhật tình hình về nhân sự trong Tháng ' + monthYear, border: '1234', bold: true }];
            cells.push({ cell: 'B48', value: 'Số lượng', border: '1234', bold: true });
            cells.push({ cell: 'C48', value: 'Ghi chú', border: '1234', bold: true });
            cells.push({ cell: 'A49', value: 'Tuyển dụng', border: '1234' });
            cells.push({ cell: 'A50', value: 'Chuyển về trường', border: '1234' });
            cells.push({ cell: 'A51', value: 'Nghỉ việc, chấm dứt hợp đồng', border: '1234' });
            cells.push({ cell: 'A52', value: 'Nghỉ hưu', border: '1234' });
            cells.push({ cell: 'A53', value: 'Chuyển công tác', border: '1234' });
            cells.push({ cell: 'A54', value: 'Xóa tên', border: '1234' });
            resolve(cells);
        });

        const promiseCalcCongTac = new Promise(resolve => {
            let currentDate = new Date();
            currentDate.setDate(1);
            currentDate.setMonth(currentDate.getMonth() - 1);
            let monthYear = currentDate.getMonth() + '/' + currentDate.getFullYear();
            let cells = [{ cell: 'A56', value: 'Quyết định cử đi học trong Tháng ' + monthYear, border: '1234', bold: true }];
            cells.push({ cell: 'B56', value: 'Nước ngoài', border: '1234', bold: true });
            cells.push({ cell: 'C56', value: 'Trong nước', border: '1234', bold: true });
            cells.push({ cell: 'A57', value: 'Tiến sĩ', border: '1234' });
            cells.push({ cell: 'A58', value: 'Thạc sĩ', border: '1234' });
            cells.push({ cell: 'A60', value: 'Báo cáo kết quả học tập trong Tháng ' + monthYear, border: '1234', bold: true });
            cells.push({ cell: 'B60', value: 'Nước ngoài', border: '1234', bold: true });
            cells.push({ cell: 'C60', value: 'Trong nước', border: '1234', bold: true });
            cells.push({ cell: 'A61', value: 'Tiến sĩ', border: '1234' });
            cells.push({ cell: 'A62', value: 'Thạc sĩ', border: '1234' });
            resolve(cells);
        });
        Promise.all([promiseCalDonVi, promiseCalVCQL, promiseCalCanBo, promiseCalBoMon, promiseCalChucDanhNgheNghiep, promiseCalTrinhDoCanBo, promiseCalTrinhDoGiangVien, promiseUpdateNhanSu, promiseCalcCongTac]).then((values) => {
            values = [].concat(...values);
            app.excel.write(worksheet, values);
            app.excel.attachment(workbook, res, 'BAO_CAO_HANG_THANG.xlsx');
        }).catch((error) => {
            res.send({ error });
        });
    });
};