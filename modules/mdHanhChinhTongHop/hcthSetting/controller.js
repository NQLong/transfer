module.exports = app => {

    const menu = {
        parentMenu: app.parentMenu.hcth,
        menus: {
            504: { title: 'Cấu hình', link: '/user/hcth/setting', icon: 'fa-cog', backgroundColor: '#1488db'},
        },
    };

    app.permission.add({ name: 'hcthSetting:read', menu }, 'hcthSetting:write', 'hcthSetting:delete');

    app.get('/user/hcth/setting', app.permission.check('hcthSetting:read'), app.templates.admin);

    //APIs ------------------------------------------------------------------------------------------------------------------------------------------
    app.get('/api/hcth/setting/all', app.permission.check('hcthSetting:read'), async (req, res) => {
        app.model.hcthSetting.getAll({}, (error, items) => res.send({ error, items }));
    });

    app.get('/api/hcth/setting', app.permission.check('hcthSetting:read'), async (req, res) => {
        const { key } = req.body;
        app.model.hcthSetting.get({ key }, (error, item) => res.send({ error, item }));
    });

    app.put('/api/hcth/setting', app.permission.check('hcthSetting:write'), async (req, res) => {
        const { changes } = req.body;
        app.model.hcthSetting.setValue(changes, error => res.send({ error }));
    });

    app.delete('/api/hcth/setting', app.permission.check('hcthSetting:delete'), async (req, res) => {
        const { key } = req.body;
        app.model.hcthSetting.delete({ key }, error => res.send({ error }));
    });

};