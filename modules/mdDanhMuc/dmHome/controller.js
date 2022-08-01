module.exports = app => {
    app.get('/user/category', app.permission.check('category:read'), app.templates.admin);
    app.get('/user/tccb', app.permission.check('staff:read'), app.templates.admin);
    app.get('/user', app.permission.orCheck('staff:login', 'developer:login'), app.templates.admin);
    app.get('/user', app.permission.check('student:login'), app.templates.admin);
    app.get('/user/settings', app.permission.check('system:settings'), app.templates.admin);
    app.get('/user/truyen-thong', app.permission.check('user:login'), app.templates.admin);
    app.get('/user/library', app.permission.orCheck('staff:login', 'developer:login'), app.templates.admin);
    // app.get('/user/khcn', app.permission.orCheck('staff:login','developer:login'), app.templates.admin);
    app.get('/user/hoc-phi', app.permission.check('student:login'), app.templates.admin);
    app.get('/user/hcth', app.permission.orCheck('staff:login', 'developer:login'), app.templates.admin);
    app.get('/user/students', app.permission.orCheck('staff:login', 'developer:login'), app.templates.admin);
    app.get('/user/dao-tao', app.permission.orCheck('staff:login', 'developer:login'), app.templates.admin);
    app.get('/user/sau-dai-hoc', app.permission.orCheck('sdh:manage', 'developer:login'), app.templates.admin);
};