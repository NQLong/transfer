module.exports = app => {
    app.get('/api/content/all', app.permission.check('component:read'), (req, res) => {
        let user = req.session.user,
            condition = {
                maDonVi: user.permissions.includes('website:manage') ? '0' : user.maDonVi
            };
        app.model.homeContent.getAll(condition, (error, items) => res.send({ error, items }));
    });

    app.get('/api/content/item/:id', (req, res) => {
        app.model.homeContent.get({ id: req.params.id }, (error, item) => res.send({ error, item }));
    });

    app.post('/api/content', app.permission.check('component:read'), (req, res) => {
        let user = req.session.user,
            template = { title: 'Tiêu đề', content: '', active: 0 };
        template.maDonVi = user.permissions.includes('website:manage') ? '0' : (user.maDonVi ? user.maDonVi : -1);
        app.model.homeContent.create(template, (error, item) => res.send({ error, item }));
    });

    app.put('/api/content', app.permission.check('component:read'), (req, res) => {
        let user = req.session.user;
        app.model.homeContent.get({ id: req.body.id }, (error, itemHomeContent) => {
            if (itemHomeContent.maDonVi != user.maDonVi && !user.permissions.includes('website:manage')) {
                res.send({ error: 'You do not have permission' });
            } else
                app.model.homeContent.update({ id: req.body.id }, req.body.changes, (error, item) => res.send({ error, item }));
        });
    });

    app.delete('/api/content', app.permission.check('component:read'), (req, res) => {
        let user = req.session.user;
        app.model.homeContent.get({ id: req.body.id }, (error, itemHomeContent) => {
            if (itemHomeContent.maDonVi != user.maDonVi && !user.permissions.includes('website:manage')) {
                res.send({ error: 'You do not have permission' });
            } else
                app.model.homeContent.delete({ id: req.body.id }, error => res.send({ error }));
        });
    });
    // Hook upload images ---------------------------------------------------------------------------------------------------------------------------
    app.fs.createFolder(app.path.join(app.publicPath, '/img/content'));
    app.uploadHooks.add('uploadContentCkEditor', (req, fields, files, params, done) => {
        let permissions = req.session.user.permissions;
        if (permissions.includes('website:write') || permissions.includes('website:manage') || permissions.includes('component:write'))
            app.permission.has(req, () => app.uploadCkEditorImage('content', fields, files, params, done), done, 'component:read');
    });
};