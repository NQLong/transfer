module.exports = (app) => {
    const menu = {
        parentMenu: app.parentMenu.hcth,
        menus: {
            531: { title: 'Công văn đi', link: '/user/hcth/cong-van-di', icon: 'fa-caret-square-o-left', backgroundColor: '#00aa00' },
        },
    };
    app.permission.add({ name: 'staff:login', menu });
    app.get('/user/hcth/cong-van-den', app.permission.check('staff:login'), app.templates.admin);
};
