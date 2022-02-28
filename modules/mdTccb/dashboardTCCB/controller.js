module.exports = app => {
    const menu = {
        parentMenu: app.parentMenu.tccb,
        menus: {
            3001: { title: 'Dashboard', link: '/user/tccb/dashboard', icon: 'fa-bar-chart', backgroundColor: '#f5c842', groupIndex: 0 },
        },
    };

    app.permission.add(
        { name: 'staff:read', menu },
        { name: 'staff:write' },
        { name: 'staff:delete' },
    );

    app.get('/user/tccb/dashboard', app.permission.check('staff:read'), app.templates.admin);

    app.get('/api/tccb/dashboard/total-gender', app.permission.check('staff:read'), (req, res) => {
        app.model.canBo.tccbDasboardTotalGender((error, data) => res.send({ error, data: data.rows[0] }));
    });
};