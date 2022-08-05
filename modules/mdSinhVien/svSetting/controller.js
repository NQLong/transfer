module.exports = app => {
    const menu = {
        parentMenu: app.parentMenu.students,
        menus: {
            6102: { title: 'Cấu hình', link: '/user/students/setting', pin: true, icon: 'fa-sliders' },
        },
    };

    app.permission.add(
        { name: 'student:manage', menu },
    );

    app.get('/user/students/setting', app.permission.check('student:manage'), app.templates.admin);

    app.get('/api/students/setting/keys', app.permission.orCheck('student:manage', 'student:login'), async (req, res) => {
        try {
            const { keys } = req.query;
            const items = await app.model.svSetting.getValue(...keys);
            res.send({ items });
        } catch (error) {
            res.send({ error });
        }
    });

    app.get('/api/students/setting/all', app.permission.check('student:manage'), async (req, res) => {
        app.model.svSetting.getAll({}, (error, items) => res.send({ error, items }));
    });

    app.put('/api/students/setting', app.permission.check('student:manage'), async (req, res) => {
        const { changes } = req.body;
        app.model.svSetting.setValue(changes, error => res.send({ error }));
    });
};