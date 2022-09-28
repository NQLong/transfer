module.exports = app => {

    const menu = {
        parentMenu: app.parentMenu.user,
        menus: {
            1054: { title: 'Văn phòng điện tử', link: '/user/van-phong-dien-tu', icon: 'fa-desktop', backgroundColor: '#de602f', groupIndex: 5 },
        },
    };

    app.get('/user/van-phong-dien-tu', app.permission.check('staff:login'), app.templates.admin);
    app.permission.add({ name: 'staff:login', menu });
};