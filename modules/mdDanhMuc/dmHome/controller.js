module.exports = app => {
    app.get('/user/category', app.permission.check('category:read'), app.templates.admin);
    app.get('/user/tccb', app.permission.check('staff:login'), app.templates.admin);
    app.get('/user/settings', app.permission.check('system:settings'), app.templates.admin);
    app.get('/user/truyen-thong', app.permission.check('staff:login'), app.templates.admin);
};