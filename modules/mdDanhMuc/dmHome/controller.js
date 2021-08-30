module.exports = app => {
    app.get('/user/category', app.permission.check('staff:login'), app.templates.admin);
}