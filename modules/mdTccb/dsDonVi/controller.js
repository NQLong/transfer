module.exports = app => {
    const menu = {
        parentMenu: app.parentMenu.tccb,
        menus: {
            3032: { title: 'Danh sách đơn vị trường', link: '/user/tccb/danh-sach-don-vi', icon: 'fa-list', backgroundColor: '#0CA0AE', pin: true },
        },
    };

    app.permission.add(
        { name: 'tccbDSDV:manage', menu },
    );

    app.permissionHooks.add('staff', 'addRoleDsdvTccb', (user, staff) => new Promise(resolve => {
        if (staff.maDonVi && staff.maDonVi == '30') {
            app.permissionHooks.pushUserPermission(user, 'tccbDSDV:manage');
            resolve();
        } else resolve();
    }));

    app.get('/user/tccb/danh-sach-don-vi', app.permission.check('tccbDSDV:manage'), app.templates.admin);
};