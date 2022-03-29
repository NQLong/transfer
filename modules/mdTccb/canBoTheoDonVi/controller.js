module.exports = app => {
    const menuStaff = {
        parentMenu: app.parentMenu.user,
        menus: {
            1021: { title: 'Danh sách cán bộ thuộc đơn vị', link: '/user/danh-sach-can-bo-thuoc-don-vi', icon: 'fa-user-circle-o', backgroundColor: '#e30000', pin: true },
        },
    };

    app.permission.add(
        { name: 'manager:read', menu: menuStaff },
    );
    app.get('/user/danh-sach-can-bo-thuoc-don-vi', app.permission.check('manager:read'), app.templates.admin);

    //Manager hook -------------------------------------------------------------------------------------------------

    //Check role mangagers
    app.permissionHooks.add('staff', 'manager', async (user) => {
        user.staff.donViQuanLy = await app.initChucVu(user, ['013', '005', '003', '016', '009', '007']);
        new Promise((resolve) => {
            app.permissionHooks.pushUserPermission(user, 'manager:read', 'manager:write');
            resolve();
        });
    });
};