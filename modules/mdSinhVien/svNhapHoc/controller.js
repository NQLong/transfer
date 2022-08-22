module.exports = app => {

    const menu = {
        parentMenu: app.parentMenu.students,
        menus: {
            6103: { title: 'Nhập học', link: '/user/students/nhap-hoc', icon: 'fa-bookmark', backgroundColor: '#fcba03' },
        },
    };


    const mySecretCode = '$qL9F5rM5ab70zpF',
        mySecretPassword = 'ctsv#2022';

    app.permission.add({ name: 'ctsvNhapHoc:write', menu });

    // Temp
    app.permissionHooks.add('staff', 'addRoleCtsvNhapHoc', (user, staff) => new Promise(resolve => {
        if (staff.maDonVi && staff.maDonVi == 32) {
            app.permissionHooks.pushUserPermission(user, 'ctsvNhapHoc:write');
            resolve();
        } else resolve();
    }));

    app.get('/user/students/nhap-hoc', app.permission.check('ctsvNhapHoc:write'), app.templates.admin);

    app.post('/api/ctsv/nhap-hoc/login', async (req, res) => {
        try {
            const data = req.body.data;
            const { email, password, secretCode } = data;

            if (!email || !password || !secretCode || secretCode != mySecretCode || password != mySecretPassword) throw 'Permission denied!';
            let user = await app.model.fwUser.get({ email });
            if (!user) user = await app.model.fwUser.create({ email, active: 1 });
            if (!user) throw 'System error!';

            app.updateSessionUser(null, user, sessionUser => {
                if ((sessionUser.permissions || []).contains(['student:write', 'ctsvNhapHoc:write'])) {
                    req.session.user = sessionUser;
                    req.session.save();
                    res.send({ user: sessionUser });
                } else res.send({ error: 'Permission denied!' });
            });
        } catch (error) {
            res.send({ error });
        }
    });

    app.post('/api/ctsv/nhap-hoc/get-data', app.permission.check('student:write', 'ctsvNhapHoc:write'), async (req, res) => {
        try {
            const secretCode = req.body.secretCode, mssv = req.body.mssv;
            if (secretCode == mySecretCode) {
                const config = await app.model.tcSetting.getValue('hocPhiNamHoc', 'hocPhiHocKy');
                let dataNhapHoc = await app.model.svNhapHoc.getData(mssv, app.utils.stringify(config, ''));
                dataNhapHoc = dataNhapHoc.rows ? dataNhapHoc.rows[0] : {};
                if (dataNhapHoc.ngayNhapHoc === null) {
                    return res.send({ error: 'Hồ sơ không hợp lệ' });
                } else if (dataNhapHoc.ngayNhapHoc == -1) {
                    dataNhapHoc.ngayNhapHoc = null;
                    dataNhapHoc.tinhTrang = 'Chờ xác nhận nhập học';
                } else {
                    dataNhapHoc.tinhTrang = 'Đã xác nhận nhập học';
                }

                await app.model.svNhapHoc.create({ mssv: dataNhapHoc.mssv, thaoTac: 'S', ghiChu: '', email: req.session.user.email, timeModified: new Date().getTime() });
                res.send({ dataNhapHoc });
            } else {
                res.send({ error: 'Permission denied!' });
            }
        } catch (error) {
            res.send({ error });
        }
    });

    app.post('/api/ctsv/nhap-hoc/set-data', app.permission.check('student:write', 'ctsvNhapHoc:write'), async (req, res) => {
        try {
            const user = req.session.user;
            let data = req.body.data;
            let { mssv, thaoTac, ghiChu, secretCode } = data, timeModified = new Date().getTime();
            if (secretCode == mySecretCode) {
                if (thaoTac == 'A' || thaoTac == 'D') {
                    await app.model.fwStudents.update({ mssv }, { ngayNhapHoc: thaoTac == 'A' ? timeModified : -1 });
                }
                await app.model.svNhapHoc.create({ mssv, thaoTac, ghiChu, email: user.email, timeModified });
                res.end();
            } else {
                res.send({ error: 'Permission denied!' });
            }
        } catch (error) {
            res.send({ error });
        }
    });

    app.post('/api/ctsv/nhap-hoc/check-svnh-data', app.permission.check('student:write', 'ctsvNhapHoc:write'), async (req, res) => {
        try {
            const mssv = req.body.mssv;
            const config = await app.model.tcSetting.getValue('hocPhiNamHoc', 'hocPhiHocKy'),
                timeModified = Date.now();

            let dataNhapHoc = await app.model.svNhapHoc.getData(mssv, app.utils.stringify(config, ''));
            dataNhapHoc = dataNhapHoc.rows ? dataNhapHoc.rows[0] : {};
            let cauHinhNhapHoc = await app.model.svCauHinhNhapHoc.get({}, '*', 'id DESC');
            if (!cauHinhNhapHoc) res.send({ error: 'Vui lòng liên hệ người quản lý nhập học' });
            else {
                const { khoaSinhVien, heDaoTao, thoiGianBatDau, thoiGianKetThuc } = cauHinhNhapHoc,
                    { loaiHinhDaoTao, namTuyenSinh } = dataNhapHoc;
                if (timeModified < thoiGianBatDau || timeModified > thoiGianKetThuc) res.send({ error: 'Không thuộc thời gian thao tác' });
                else if (!heDaoTao.split(',').includes(loaiHinhDaoTao) || khoaSinhVien != namTuyenSinh) {
                    dataNhapHoc.tinhTrang = 'Không thuộc đối tượng nhập học!';
                    dataNhapHoc.ngayNhapHoc = null;
                    dataNhapHoc.invalid = true;
                    await app.model.svNhapHoc.create({ mssv: dataNhapHoc.mssv, thaoTac: 'R', ghiChu: '', email: req.session.user.email, timeModified: new Date().getTime() });
                    res.send({ dataNhapHoc });
                } else {
                    if (dataNhapHoc.ngayNhapHoc === null) {
                        dataNhapHoc.tinhTrang = 'Sinh viên chưa cập nhật thông tin cá nhân trực tuyến!';
                    } else if (dataNhapHoc.ngayNhapHoc == -1) {
                        dataNhapHoc.ngayNhapHoc = null;
                        dataNhapHoc.tinhTrang = 'Chờ xác nhận nhập học';
                    } else {
                        dataNhapHoc.tinhTrang = 'Đã xác nhận nhập học';
                    }
                    await app.model.svNhapHoc.create({ mssv: dataNhapHoc.mssv, thaoTac: 'R', ghiChu: '', email: req.session.user.email, timeModified: new Date().getTime() });
                    res.send({ dataNhapHoc });
                }
            }
        } catch (error) {
            res.send({ error });
        }
    });

    app.post('/api/ctsv/nhap-hoc/set-svnh-data', app.permission.check('student:write', 'ctsvNhapHoc:write'), async (req, res) => {
        try {
            const user = req.session.user;
            let data = req.body.data;
            let { mssv, thaoTac } = data, timeModified = new Date().getTime();
            const student = await app.model.fwStudents.get({ mssv });
            if (!student) res.send({ error: 'Không tìm thấy sinh viên' });
            else {
                let cauHinhNhapHoc = await app.model.svCauHinhNhapHoc.get({}, '*', 'id DESC');
                if (!cauHinhNhapHoc) res.send({ error: 'Vui lòng liên hệ người quản lý nhập học' });
                else {
                    const { khoaSinhVien, heDaoTao, thoiGianBatDau, thoiGianKetThuc } = cauHinhNhapHoc,
                        { loaiHinhDaoTao, namTuyenSinh } = student;
                    if (!heDaoTao.split(',').includes(loaiHinhDaoTao) || khoaSinhVien != namTuyenSinh) {
                        res.send({ error: 'Không thuộc đối tượng nhập học!' });
                    } else if (timeModified < thoiGianBatDau || timeModified > thoiGianKetThuc) res.send({ error: 'Không thuộc thời gian thao tác' });
                    else {
                        if (thaoTac == 'A' || thaoTac == 'D') {
                            await app.model.fwStudents.update({ mssv }, { ngayNhapHoc: thaoTac == 'A' ? timeModified : -1 });
                        }
                        await app.model.svNhapHoc.create({ mssv, thaoTac, ghiChu: '', email: user.email, timeModified });
                        res.end();
                    }
                }
            }
        } catch (error) {
            res.send({ error });
        }
    });

    app.post('/api/ctsv/cau-hinh-nhap-hoc', app.permission.check('ctsvNhapHoc:adminNhapHoc'), async (req, res) => {
        try {
            let data = req.body.data;
            let warn = await app.model.svCauHinhNhapHoc.get({}, '*', 'id DESC');
            if (!!warn && !parseInt(data.ghiDe)) res.send({ warn });
            else {
                let item = await app.model.svCauHinhNhapHoc.create(app.clone(data, {
                    userModified: req.session.user.email,
                    timeModified: Date.now()
                }));
                if (item) res.send({ item });
                else res.send({ error: 'Database error!' });
            }
        } catch (error) {
            res.send({ error });
        }
    });

    app.get('/api/ctsv/cau-hinh-nhap-hoc', app.permission.check('ctsvNhapHoc:write'), async (req, res) => {
        try {
            let item = await app.model.svCauHinhNhapHoc.get({}, '*', 'id DESC');
            res.send({ item });
        } catch (error) {
            res.send({ error });
        }
    });

    //Phân quyền cho đơn vị ------------------------------------------------------------------------------
    app.assignRoleHooks.addRoles('ctsvNhapHoc', { id: 'ctsvNhapHoc:adminNhapHoc', text: 'CTSV - Nhập học: Chuyên viên quản lý cấu hình' }, { id: 'ctsvNhapHoc:write', text: 'CTSV - Nhập học: Chuyên viên xử lý nhập học' });


    app.assignRoleHooks.addHook('ctsvNhapHoc', async (req, roles) => {
        const userPermissions = req.session.user ? req.session.user.permissions : [];
        if (req.query.nhomRole && req.query.nhomRole == 'ctsvNhapHoc' && userPermissions.includes('manager:write')) {
            const assignRolesList = app.assignRoleHooks.get('ctsvNhapHoc').map(item => item.id);
            return roles && roles.length && assignRolesList.contains(roles);
        }
    });

    app.permissionHooks.add('staff', 'checkRoleAdminNhapHoc', (user, staff) => new Promise(resolve => {
        if (staff.donViQuanLy && staff.donViQuanLy.length && staff.maDonVi == '32') {
            app.permissionHooks.pushUserPermission(user, 'ctsvNhapHoc:adminNhapHoc', 'ctsvNhapHoc:write');
        }
        resolve();
    }));

    app.permissionHooks.add('assignRole', 'checkRoleAdminNhapHoc', (user, assignRoles) => new Promise(resolve => {
        const inScopeRoles = assignRoles.filter(role => role.nhomRole == 'ctsvNhapHoc');
        inScopeRoles.forEach(role => {
            if (role.tenRole == 'ctsvNhapHoc:adminNhapHoc') {
                app.permissionHooks.pushUserPermission(user, 'ctsvNhapHoc:adminNhapHoc');
            } else if (role.tenRole == 'ctsvNhapHoc:write') {
                app.permissionHooks.pushUserPermission(user, 'ctsvNhapHoc:write');
            }
        });
        resolve();
    }));
};