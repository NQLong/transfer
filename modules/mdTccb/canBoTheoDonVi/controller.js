module.exports = app => {
    const menuStaff = {
        parentMenu: app.parentMenu.user,
        menus: {
            1021: { title: 'Cán bộ thuộc đơn vị', link: '/user/cbtdv', icon: 'fa-user-circle-o', backgroundColor: '#eb9834', groupIndex: 0 },
        },
    };

    app.permission.add(
        { name: 'quanLy:login', menu: menuStaff },
    );
    app.get('/user/cbtdv', app.permission.check('quanLy:login'), app.templates.admin);
};