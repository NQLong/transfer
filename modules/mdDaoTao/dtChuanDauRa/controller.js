module.exports = app => {
    const menu = {
        parentMenu: app.parentMenu.daoTao,
        menus: {
            7016: {
                title: 'Chuẩn đầu ra', groupIndex: 2,
                link: '/user/dao-tao/chuan-dau-ra'
            },
        },
    };

    app.permission.add(
        { name: 'dtChuanDauRa:read', menu },
        { name: 'dtChuanDauRa:manage', menu },
        { name: 'dtChuongTrinhDaoTao:manage', menu },
        { name: 'dtChuanDauRa:write' },
        { name: 'dtChuanDauRa:delete' },
    );

    app.permissionHooks.add('staff', 'addRolesDtChuanDauRa', (user, staff) => new Promise(resolve => {
        if (staff.maDonVi && staff.maDonVi == '33') {
            app.permissionHooks.pushUserPermission(user, 'dtChuanDauRa:read', 'dtChuanDauRa:write', 'dtChuanDauRa:delete');
            resolve();
        } else resolve();
    }));


    //     // APIs -----------------------------------------------------------------------------------------------------------------------------------------
    app.get('/user/dao-tao/chuan-dau-ra', app.permission.orCheck('dtChuanDauRa:read', 'dtChuongTrinhDaoTao:manage'), app.templates.admin);

    app.get('/api/dao-tao/chuan-dau-ra/all', app.permission.orCheck('dtChuanDauRa:read', 'dtChuongTrinhDaoTao:manage'), (req, res) => {
        app.model.dtChuanDauRa.getAll({}, '*', 'thangDoMin asc', (error, items) => {
            res.send({ error, items });
        });
    });

    app.post('/api/dao-tao/chuan-dau-ra', app.permission.orCheck('dtChuanDauRa:write', 'dtChuongTrinhDaoTao:manage'), (req, res) => {
        app.model.dtChuanDauRa.create(req.body.data, (error, item) => res.send({ error, item }));
    });

    app.delete('/api/dao-tao/chuan-dau-ra', app.permission.orCheck('dtChuanDauRa:delete', 'dtChuongTrinhDaoTao:manage'), (req, res) => {
        app.model.dtChuanDauRa.delete({ id: req.body.id }, error => res.send({ error }));
    });

    app.put('/api/dao-tao/chuan-dau-ra', app.permission.orCheck('dtChuanDauRa:write', 'dtChuongTrinhDaoTao:manage'), (req, res) => {
        let changes = req.body.changes;
        app.model.dtChuanDauRa.update({ id: req.body.id }, changes, (error, item) => res.send({ error, item }));
    });
};
