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
        { name: 'dtThoiKhoaBieu:read', menu },
    );

    app.get('/user/dao-tao/lich-day-hoc', app.permission.check('dtThoiKhoaBieu:read'), app.templates.admin);

};