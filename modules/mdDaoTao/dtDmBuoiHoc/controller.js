module.exports = app => {
    const menu = {
        parentMenu: app.parentMenu.daoTao,
        menus: {
            8017: {
                title: 'Buổi Học', groupIndex: 2,
                link: '/user/dao-tao/buoi-hoc'
            },
        },
    };

    app.permission.add(
        { name: 'dtDmBuoiHoc:read', menu },
        { name: 'dtDmBuoiHoc:manage', menu },
        { name: 'dtChuongTrinhDaoTao:manage', menu },
        { name: 'dtDmBuoiHoc:write' },
        { name: 'dtDmBuoiHoc:delete' },
    );

    app.permissionHooks.add('staff', 'addRolesDtDmBuoiHoc', (user, staff) => new Promise(resolve => {
        if (staff.maDonVi && staff.maDonVi == '33') {
            app.permissionHooks.pushUserPermission(user, 'dtDmBuoiHoc:read', 'dtDmBuoiHoc:write', 'dtDmBuoiHoc:delete');
            resolve();
        } else resolve();
    }));


    //     // APIs -----------------------------------------------------------------------------------------------------------------------------------------
    app.get('/user/dao-tao/buoi-hoc', app.permission.orCheck('dtDmBuoiHoc:read', 'dtChuongTrinhDaoTao:manage'), app.templates.admin);

    app.get('/api/dao-tao/buoi-hoc/all', app.permission.orCheck('dtDmBuoiHoc:read', 'dtChuongTrinhDaoTao:manage'), (req, res) => {
        app.model.dtDmBuoiHoc.getAll({}, '*', 'id asc', (error, items) => {
            res.send({ error, items });
        });
    });

    app.post('/api/dao-tao/buoi-hoc', app.permission.orCheck('dtDmBuoiHoc:write', 'dtChuongTrinhDaoTao:manage'), (req, res) => {
        app.model.dtDmBuoiHoc.create(req.body.data, (error, item) => res.send({ error, item }));
    });

    app.delete('/api/dao-tao/buoi-hoc', app.permission.orCheck('dtDmBuoiHoc:delete', 'dtChuongTrinhDaoTao:manage'), (req, res) => {
        app.model.dtDmBuoiHoc.delete({ id: req.body.id }, error => res.send({ error }));
    });

    app.put('/api/dao-tao/buoi-hoc', app.permission.orCheck('dtDmBuoiHoc:write', 'dtChuongTrinhDaoTao:manage'), (req, res) => {
        let changes = req.body.changes;
        app.model.dtDmBuoiHoc.update({ id: req.body.id }, changes, (error, item) => res.send({ error, item }));
    });
};
