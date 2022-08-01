module.exports = app => {
    const menu = {
        parentMenu: app.parentMenu.finance,
        menus: {
            5001: { title: 'Cấu hình', link: '/user/finance/setting' },
        },
    };
    const adminMenu = {
        parentMenu: app.parentMenu.finance,
        menus: {
            5002: { title: 'Cấu hình Admin', link: '/user/finance/admin-setting' },
        },
    };
    app.permission.add({ name: 'tcSetting:manage', menu }, { name: 'tcSetting:classify', menu: adminMenu }, 'tcSetting:write', 'tcSetting:delete');
    app.permissionHooks.add('staff', 'addRolesTcSetting', (user, staff) => new Promise(resolve => {
        if (staff.maDonVi && staff.maDonVi == '34') {
            app.permissionHooks.pushUserPermission(user, 'tcSetting:manage', 'tcSetting:write', 'tcSetting:delete');
            resolve();
        } else resolve();
    }));

    app.get('/user/finance/setting', app.permission.check('tcSetting:manage'), app.templates.admin);
    app.get('/user/finance/admin-setting', app.permission.check('tcSetting:classify'), app.templates.admin);

    //APIs ------------------------------------------------------------------------------------------------------------------------------------------
    app.get('/api/finance/setting/all', app.permission.check('tcSetting:classify'), async (req, res) => {
        app.model.tcSetting.getAll({}, (error, items) => res.send({ error, items }));
    });

    app.get('/api/finance/setting/keys', app.permission.check('tcSetting:manage'), async (req, res) => {
        const { keys } = req.query;

        app.model.tcSetting.getAll({
            statement: 'key IN (:keys)',
            parameter: { keys: keys.split(',') }
        }, (error, items) => res.send({ error, items }));
    });

    // app.get('/api/finance/setting', app.permission.check('tcSetting:manage'), async (req, res) => {
    //     const { key } = req.body;
    //     app.model.tcSetting.get({ key }, (error, item) => res.send({ error, item }));
    // });

    app.put('/api/finance/setting', app.permission.check('tcSetting:write'), async (req, res) => {
        const { changes } = req.body;
        app.model.tcSetting.setValue(changes, error => res.send({ error }));
    });

    app.delete('/api/finance/setting', app.permission.check('tcSetting:delete'), async (req, res) => {
        const { key } = req.body;
        app.model.tcSetting.delete({ key }, error => res.send({ error }));
    });
};