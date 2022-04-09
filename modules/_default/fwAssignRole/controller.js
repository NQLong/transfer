module.exports = app => {
    // APIs -----------------------------------------------------------------------------------------------------------------------------------------
    app.permission.add(
        { name: 'fwAssignRole:read' },
        { name: 'fwAssignRole:write' },
    );

    app.get('/api/assign-role/:nguoiDuocGan', app.permission.check('fwAssignRole:read'), (req, res) => {
        app.model.fwAssignRole.getCurrentRoles(req.params.nguoiDuocGan, req.query.nhomRole, (error, result) => {
            if (error) {
                res.send({ error });
            } else {
                res.send({ items: result.rows });
            }
        });
    });

    app.get('/api/assign-role/list/:nhomRole', app.permission.check('fwAssignRole:read'), (req, res) => {
        const items = app.assignRoleHooks.get(req.params.nhomRole);
        res.send({ items });
    });

    app.post('/api/assign-role', app.permission.check('fwAssignRole:write'), (req, res) => {
        let item = req.body.assignRole;
        const roles = [item.tenRole];
        app.assignRoleHooks.check(req, roles).then(() => { // Được thông qua
            if (item.tenRole && typeof item.tenRole == 'object') item.tenRole = item.tenRole.toString();
            app.model.fwAssignRole.create(item, (error, item) => res.send({ error, item }));
        }).catch(error => res.send({ error }));
    });

    app.put('/api/assign-role', app.permission.check('fwAssignRole:write'), (req, res) => {
        let { item } = req.body;
        const roles = [item.tenRole];
        app.assignRoleHooks.check(req, roles).then(() => {
            if (item.tenRole && typeof item.tenRole == 'object') item.tenRole = item.tenRole.toString();
            app.model.fwAssignRole.update({ id: req.body.id }, item, (error, item) => res.send({ error, item }));
        }).catch(error => res.send({ error }));
    });

    app.delete('/api/assign-role', app.permission.check('fwAssignRole:write'), (req, res) => {
        let { item } = req.body;
        const roles = [item.tenRole];
        app.assignRoleHooks.check(req, roles).then(() => {
            app.model.fwAssignRole.delete({ id: item.id }, error => res.send({ error }));
        }).catch(error => res.send({ error }));
    });
};