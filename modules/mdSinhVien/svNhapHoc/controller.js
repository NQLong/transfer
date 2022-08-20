module.exports = app => {
    const mySecretCode = '$qL9F5rM5ab70zpF',
        mySecretPassword = 'ctsv#2022';

    app.permission.add({ name: 'ctsvNhapHoc:write' });
    app.permissionHooks.add('staff', 'addRoleCtsvNhapHoc', (user, staff) => new Promise(resolve => {
        if (staff.maDonVi && staff.maDonVi == 32) {
            app.permissionHooks.pushUserPermission(user, 'ctsvNhapHoc:write');
            resolve();
        } else resolve();
    }));

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

            await app.model.svNhapHoc.create({ mssv: dataNhapHoc.mssv, thaoTac: 'R', ghiChu: '', email: req.session.user.email, timeModified: new Date().getTime() });
            res.send({ dataNhapHoc });
        } catch (error) {
            res.send({ error });
        }
    });

    app.post('/api/ctsv/nhap-hoc/set-svnh-data', app.permission.check('student:write', 'ctsvNhapHoc:write'), async (req, res) => {
        try {
            const user = req.session.user;
            let data = req.body.data;
            let { mssv, thaoTac } = data, timeModified = new Date().getTime();
            if (thaoTac == 'A' || thaoTac == 'D') {
                await app.model.fwStudents.update({ mssv }, { ngayNhapHoc: thaoTac == 'A' ? timeModified : -1 });
            }
            await app.model.svNhapHoc.create({ mssv, thaoTac, ghiChu: '', email: user.email, timeModified });
            res.end();
        } catch (error) {
            res.send({ error });
        }
    });
};