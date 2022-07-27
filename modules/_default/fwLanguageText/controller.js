module.exports = app => {
    const menu = {
        parentMenu: app.parentMenu.setting,
        menus: {
            2085: { title: 'Ngôn ngữ hiển thị', link: '/user/ngon-ngu-hien-thi', icon: 'fa-edit', backgroundColor: '#db3741' }
        }
    };
    app.permission.add({ name: 'developer:login', menu });

    app.get('/user/ngon-ngu-hien-thi', app.permission.check('developer:login'), app.templates.admin);
};