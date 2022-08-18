module.exports = app => {
    const menu = {
        parentMenu: app.parentMenu.category,
        menus: {
            4014: { title: 'Cơ sở trường đại học', link: '/user/danh-muc/co-so' },
        },
    };

    const menuDt = {
        parentMenu: app.parentMenu.daoTao,
        menus: {
            7021: { title: 'Cơ sở', link: '/user/dao-tao/co-so', groupIndex: 2 },
        },
    };
    app.permission.add(
        { name: 'dmCoSo:read', menu },
        { name: 'dtCoSo:read', menu: menuDt },
        { name: 'dmCoSo:write' },
        { name: 'dmCoSo:delete' },
    );
    app.get('/user/danh-muc/co-so', app.permission.check('dmCoSo:read'), app.templates.admin);
    app.get('/user/dao-tao/co-so', app.permission.check('dtCoSo:read'), app.templates.admin);

    app.permissionHooks.add('staff', 'addRoleCoSo', (user, staff) => new Promise(resolve => {
        if (staff.maDonVi && staff.maDonVi == '33') {
            app.permissionHooks.pushUserPermission(user, 'dmCoSo:write', 'dtCoSo:read', 'dmCoSo:delete');
            resolve();
        } else resolve();
    }));
    // APIs ----------------------------------------------------------------------------------------------------------------------------------------
    app.get('/api/danh-muc/co-so/page/:pageNumber/:pageSize', app.permission.check('user:login'), (req, res) => {
        const pageNumber = parseInt(req.params.pageNumber),
            pageSize = parseInt(req.params.pageSize);
        app.model.dmCoSo.getPage(pageNumber, pageSize, {}, (error, page) => {
            res.send({ error, page });
        });
    });

    app.get('/api/danh-muc/co-so/all', app.permission.check('staff:login'), (req, res) => {
        app.model.dmCoSo.getAll((error, items) => res.send({ error, items }));
    });

    app.get('/api/danh-muc/co-so/item/:ma', app.permission.check('user:login'), (req, res) => {
        app.model.dmCoSo.get({ ma: req.params.ma }, (error, item) => res.send({ error, item }));
    });

    app.post('/api/danh-muc/co-so', app.permission.check('dmCoSo:write'), (req, res) => {
        app.model.dmCoSo.create(req.body.item, (error, item) => res.send({ error, item }));
    });

    app.put('/api/danh-muc/co-so', app.permission.check('dmCoSo:write'), (req, res) => {
        app.model.dmCoSo.update({ ma: req.body.ma }, req.body.changes, (error, items) => res.send({ error, items }));
    });

    app.delete('/api/danh-muc/co-so', app.permission.check('dmCoSo:delete'), (req, res) => {
        app.model.dmCoSo.delete({ ma: req.body.ma }, error => res.send({ error }));
    });
};