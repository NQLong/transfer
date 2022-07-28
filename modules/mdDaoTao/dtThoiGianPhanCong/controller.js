module.exports = app => {

    app.permission.add(
        'dtThoiGianPhanCong:write', 'dtThoiGianPhanCong:delete'
    );

    app.permissionHooks.add('staff', 'addRolesDtThoiGianPhanCong', (user, staff) => new Promise(resolve => {
        if (staff.maDonVi && staff.maDonVi == '33') {
            app.permissionHooks.pushUserPermission(user, 'dtThoiGianPhanCong:write', 'dtThoiGianPhanCong:delete');
            resolve();
        } else resolve();
    }));


    app.post('/api/dao-tao/thoi-gian-phan-cong', app.permission.check('dtThoiGianPhanCong:write'), async (req, res) => {
        let data = req.body.data,
            thoiGianMoMon = await app.model.dtThoiGianMoMon.getActive();
        app.model.dtThoiGianPhanCong.create({ ...data, nam: thoiGianMoMon.nam, hocKy: thoiGianMoMon.hocKy }, (error, item) => res.send({ error, item }));
    });
};