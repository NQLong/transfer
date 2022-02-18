module.exports = app => {
    const menuStaff = {
        parentMenu: app.parentMenu.user,
        menus: {
            1021: { title: 'Danh sách cán bộ thuộc đơn vị', link: '/user/danh-sach-can-bo-thuoc-don-vi', icon: 'fa-user-circle-o', backgroundColor: '#eb9834', groupIndex: 0 },
        },
    };

    app.permission.add(
        { name: 'quanLy:login', menu: menuStaff },
    );
    app.get('/user/danh-sach-can-bo-thuoc-don-vi', app.permission.check('quanLy:login'), app.templates.admin);
};