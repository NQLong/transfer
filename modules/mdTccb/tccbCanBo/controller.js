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

    app.assignRoleHooks.addRoles('quanLyDonVi', { id: 'manager:read', text: 'Phân quyền cho nhân sự đơn vị' });

    app.assignRoleHooks.addHook('quanLyDonVi', async (req, roles) => {
        const userPermissions = req.session.user ? req.session.user.permissions : [];
        if (req.query.nhomRole && req.query.nhomRole == 'quanLyDonVi' && userPermissions.includes('manager:write')) {
            const assignRolesList = app.assignRoleHooks.get('quanLyDonVi').map(item => item.id);
            return roles && roles.length && assignRolesList.contains(roles);
        }
    });

    app.permissionHooks.add('assignRole', 'checkRoleQuanLyDonVi', (user, assignRoles) => new Promise(resolve => {
        const inScopeRoles = assignRoles.filter(role => role.nhomRole == 'quanLyDonVi');
        inScopeRoles.forEach(role => {
            if (role.tenRole == 'manager:read') {
                app.permissionHooks.pushUserPermission(user, 'manager:read', 'manager:write', 'fwAssignRole:read', 'fwAssignRole:write');
                user.staff.donViQuanLy = user.staff.donViQuanLy && user.staff.donViQuanLy.length ? user.staff.donViQuanLy.push({ maDonVi: user.staff.maDonVi, isManager: true }) : [{ maDonVi: user.staff.maDonVi, isManager: true }];
            }
        });
        resolve();
    }));

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

    // Hook--------------------------------------------------------------------------------------------------------------------------------------------------------
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

    app.put('/api/user/staff', app.permission.check('staff:read'), (req, res) => {
        app.model.canBo.update({ email: req.body.email }, req.body.changes, (error, item) => res.send({ error, item }));
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