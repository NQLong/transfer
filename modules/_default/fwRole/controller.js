module.exports = app => {
    const menu = {
        parentMenu: app.parentMenu.setting,
        menus: { 2080: { title: 'Vai trò', link: '/user/role' } }
    };
    app.permission.add(
        { name: 'role:read', menu },
        { name: 'role:write', menu },
        { name: 'role:delete', menu },
    );
    app.get('/user/role', app.permission.check('role:read'), app.templates.admin);

    const getActivedRoles = done => app.model.fwRole.getAll({ active: 1 }, (error, roles) => {
        if (error == null && roles) {
            if (app.isDebug) {
                app.roles = roles;
            }
            done && done();
        }
    });
    app.readyHooks.add('readyRole', {
        ready: () => app.dbConnection != null && app.model != null && app.model.fwRole != null,
        run: () => getActivedRoles(),
    });

    // APIs -----------------------------------------------------------------------------------------------------------------------------------------
    app.get('/api/role/all', app.permission.check('role:read'), (req, res) => {
        let condition = { statement: null };
        if (req.query.condition) {
            condition = {
                statement: 'lower(name) LIKE: searchText',
                parameter: { searchText: `%${req.query.condition.toLowerCase()}%` }
            };
        }
        app.model.fwRole.getAll(condition, (error, items) => res.send({ error, items }));
    });

    app.get('/api/role/page/:pageNumber/:pageSize', app.permission.check('role:read'), (req, res) => {
        const pageNumber = parseInt(req.params.pageNumber),
            pageSize = parseInt(req.params.pageSize);
        app.model.fwRole.getPage(pageNumber, pageSize, {}, (error, page) => {
            if (page) {
                page.permissionList = app.permission.all();
                if (page.list) {
                    page.list.forEach(item => {
                        if (item.permission) item.permission = item.permission.split(',');
                    });
                }
            }
            res.send({ error, page });
        });
    });

    app.get('/api/role/item/:id', app.permission.check('role:read'), (req, res) => {
        app.model.fwRole.get({ id: req.params.id }, (error, item) => {
            if (item && item.permission) item.permission = item.permission.split(',');
            res.send({ error, item });
        });
    });

    app.post('/api/role', app.permission.check('role:write'), (req, res) => {
        let role = req.body.role;
        delete role.id;
        if (role.permission && typeof role.permission == 'object') role.permission = role.permission.toString();
        app.model.fwRole.create(role, (error, item) => {
            getActivedRoles(() => app.isDebug && app.io.emit('debug-role-changed', app.roles));
            res.send({ error, item });
        });
    });

    app.put('/api/role', app.permission.check('role:write'), (req, res) => {
        if (req.body.changes == null || req.body.id == null) {
            res.send({ error: 'Change nothing!' });
        } else {
            let changes = app.clone(req.body.changes),
                condition = { id: Number(req.body.id) };
            app.model.fwRole.get(condition, (error, role) => {
                if (error) {
                    res.send({ error: 'System has errors!' });
                } else if (role == null) {
                    res.send({ error: 'Invalid Id!' });
                } else {
                    delete changes.id;
                    if (role.isDefault && (changes.active == 0 || changes.active == '0')) delete changes.active;
                    if (role.name == 'admin') {
                        delete changes.name;
                        changes.active = 1;
                    }
                    if (changes.permission && typeof changes.permission == 'object') changes.permission = changes.permission.toString();

                    if ((changes.isDefault == 1 || changes.isDefault == '1') && (role.isDefault == null || role.isDefault == 0)) {
                        changes.isDefault = 1;
                        changes.active = 1;
                        app.model.fwRole.update({}, { isDefault: 0 }, error =>
                            error ? res.send({ error }) : app.model.fwRole.update(condition, changes, (error, item) => res.send({ error, item })));
                    } else {
                        delete changes.isDefault;
                        app.model.fwRole.update(condition, changes, (error, item) => res.send({ error, item }));
                    }
                }
            });
        }
    });

    app.delete('/api/role', app.permission.check('role:delete'), (req, res) => {
        app.model.fwRole.delete({ id: req.body.id }, error => {
            getActivedRoles(() => app.isDebug && app.io.emit('debug-role-changed', app.roles));
            res.send({ error });
        });
    });
};