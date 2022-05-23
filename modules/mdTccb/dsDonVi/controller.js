module.exports = app => {
    const menu = {
        parentMenu: app.parentMenu.tccb,
        menus: {
            3032: { title: 'Danh sách đơn vị trường', link: '/user/tccb/danh-sach-don-vi', icon: 'fa-list', backgroundColor: '#0CA0AE', pin: true },
        },
    };

    app.permission.add(
        { name: 'tccbDanhSachDonVi:read', menu },
    );

    app.get('/user/tccb/danh-sach-don-vi', app.permission.check('tccbDanhSachDonVi:read'), app.templates.admin);
};