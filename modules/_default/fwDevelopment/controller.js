module.exports = app => {
    if (app.isDebug) {
        const menu = {
            parentMenu: app.parentMenu.setting,
            menus: {
                1007: { title: 'AdminPage Wiki', link: '/user/admin-page-wiki', icon: 'fa-code', backgroundColor: '#61DBFB' }
            }
        };

        app.permission.add({ name: 'user:login', menu });
        app.get('/user/admin-page-wiki', app.templates.admin);
        app.get('/user/admin-page-wiki/admin-page-support', app.templates.admin);
    }
};