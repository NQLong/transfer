module.exports = app => {
    const menu = {
        parentMenu: app.parentMenu.daoTao,
        menus: {
            7023: {
                title: 'Thứ', groupIndex: 2,
                link: '/user/dao-tao/thu'
            },
        },
    };

    app.permission.add(
        { name: 'dtDmThu:manage', menu },
        { name: 'dtDmThu:write' },
        { name: 'dtDmThu:delete' },
    );

    app.permissionHooks.add('staff', 'addRolesDtDmThu', (user, staff) => new Promise(resolve => {
        if (staff.maDonVi && staff.maDonVi == '33') {
            app.permissionHooks.pushUserPermission(user, 'dtDmThu:manage', 'dtDmThu:write', 'dtDmThu:delete');
            resolve();
        } else resolve();
    }));

    app.get('/user/dao-tao/thu', app.permission.check('dtDmThu:manage'), app.templates.admin);

    //     // APIs -----------------------------------------------------------------------------------------------------------------------------------------

    app.get('/api/dao-tao/thu/all', app.permission.check('dtDmThu:manage'), (req, res) => {
        app.model.dtDmThu.getAll({}, '*', '', (error, items) => {
            res.send({ error, items });
        });
    });

    app.post('/api/dao-tao/thu', app.permission.check('dtDmThu:write'), (req, res) => {
        app.model.dtDmThu.create(req.body.data, (error, item) => res.send({ error, item }));
    });

    app.delete('/api/dao-tao/thu', app.permission.check('dtDmThu:delete'), (req, res) => {
        app.model.dtDmThu.delete({ ma: req.body.ma }, error => res.send({ error }));
    });

    app.put('/api/dao-tao/thu', app.permission.check('dtDmThu:write'), (req, res) => {
        app.model.dtDmThu.update({ ma: req.body.ma }, req.body.changes, (error, item) => res.send({ error, item }));
    });
};
