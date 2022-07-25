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
    app.permission.add({ name: 'TcSetting:read', menu }, { name: 'TcSetting:classify', menu: adminMenu }, 'TcSetting:write', 'TcSetting:delete');

    app.get('/user/finance/setting', app.permission.check('TcSetting:read'), app.templates.admin);
    app.get('/user/finance/admin-setting', app.permission.check('TcSetting:classify'), app.templates.admin);

    //APIs ------------------------------------------------------------------------------------------------------------------------------------------
    app.get('/api/finance/setting/all', app.permission.check('TcSetting:classify'), async (req, res) => {
        app.model.tcSetting.getAll({}, (error, items) => res.send({ error, items }));
    });

    app.get('/api/finance/setting/keys', app.permission.check('TcSetting:read'), async (req, res) => {
        const { keys } = req.query;

        app.model.tcSetting.getAll({
            statement: 'key IN (:keys)',
            parameter: { keys: keys.split(',') }
        }, (error, items) => res.send({ error, items }));
    });

    // app.get('/api/finance/setting', app.permission.check('TcSetting:read'), async (req, res) => {
    //     const { key } = req.body;
    //     app.model.tcSetting.get({ key }, (error, item) => res.send({ error, item }));
    // });

    app.put('/api/finance/setting', app.permission.check('TcSetting:write'), async (req, res) => {
        const { changes } = req.body;
        app.model.tcSetting.setValue(changes, error => res.send({ error }));
    });

    app.delete('/api/finance/setting', app.permission.check('TcSetting:delete'), async (req, res) => {
        const { key } = req.body;
        app.model.tcSetting.delete({ key }, error => res.send({ error }));
    });
};