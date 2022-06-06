module.exports = app => {
    const menu = {
        parentMenu: app.parentMenu.finance,
        menus: {
            5001: { title: 'Cấu hình', link: '/user/finance/settings' },
        },
    };
    app.permission.add({ name: 'tcSettings:read', menu }, 'tcSettings:write', 'tcSettings:delete');

    app.get('/user/finance/settings', app.permission.check('tcSettings:read'), app.templates.admin);

    //APIs ------------------------------------------------------------------------------------------------------------------------------------------
    app.get('/api/finance/settings', app.permission.check('tcSettings:read'), async (req, res) => {
        app.model.tcSetting.getAll({}, (error, items) => res.send({ error, items }));
    });
};