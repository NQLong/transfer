module.exports = app => {
    const menuStaff = {
        parentMenu: app.parentMenu.user,
        menus: {
            1002: { title: 'Cán bộ thuộc đơn vị', link: '/user/cbtdv', icon: 'fa-address-card-o', backgroundColor: '#8bc34a', groupIndex: 0 },
        },
    };

    app.permission.add(
        { name: 'staff:login', menu: menuStaff },
    );
    app.get('/user/cbtdv', app.permission.check('staff:login'), app.templates.admin);
};