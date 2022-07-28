module.exports = app => {
    const menu = {
        parentMenu: app.parentMenu.daoTao,
        menus: {
            7011: {
                title: 'Lịch dạy học', groupIndex: 1,
                link: '/user/dao-tao/lich-day-hoc', icon: 'fa-calendar-check-o', backgroundColor: '#366384'
            }
        }
    };
    app.permission.add(
        { name: 'dtThoiKhoaBieu:manage', menu },
    );

    app.permissionHooks.add('staff', 'addRolesDtTkb', (user, staff) => new Promise(resolve => {
        if (staff.maDonVi && staff.maDonVi == '33') {
            app.permissionHooks.pushUserPermission(user, 'dtThoiKhoaBieu:manage');
            resolve();
        } else resolve();
    }));


    app.get('/user/dao-tao/lich-day-hoc', app.permission.check('dtThoiKhoaBieu:manage'), app.templates.admin);

};