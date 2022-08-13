module.exports = app => {
    const menu = {
        parentMenu: app.parentMenu.category,
        menus: {
            4072: { title: 'Tòa nhà', link: '/user/danh-muc/toa-nha' },
        },
    };

    const menuDaoTao = {
        parentMenu: app.parentMenu.daoTao,
        menus: {
            7009: { title: 'Tòa nhà', link: '/user/dao-tao/toa-nha', groupIndex: 2 },
        },
    };
    app.permission.add(
        { name: 'dmToaNha:read', menu },
        { name: 'dtToaNha:read', menu: menuDaoTao },
        { name: 'dmToaNha:write' },
        { name: 'dmToaNha:delete' },
    );
    app.get('/user/danh-muc/toa-nha', app.permission.check('dmToaNha:read'), app.templates.admin);
    app.get('/user/dao-tao/toa-nha', app.permission.check('dtToaNha:read'), app.templates.admin);

    app.permissionHooks.add('staff', 'addRolesToaNha', (user, staff) => new Promise(resolve => {
        if (staff.maDonVi && staff.maDonVi == '33') {
            app.permissionHooks.pushUserPermission(user, 'dtToaNha:read');
            resolve();
        } else resolve();
    }));
    // APIs -----------------------------------------------------------------------------------------------------------------------------------------
    app.get('/api/danh-muc/toa-nha/page/:pageNumber/:pageSize', app.permission.orCheck('dmToaNha:read', 'dtToaNha:read'), (req, res) => {
        const pageNumber = parseInt(req.params.pageNumber),
            pageSize = parseInt(req.params.pageSize);
        app.model.dmToaNha.getPage(pageNumber, pageSize, {}, (error, page) => res.send({ error, page }));
    });

    app.get('/api/danh-muc/toa-nha/all', app.permission.orCheck('dmToaNha:read', 'dtToaNha:read'), (req, res) => {
        const condition = req.query.condition || {};
        Object.keys(condition).forEach(key => { condition[key] === '' ? condition[key] = null : ''; });
        app.model.dmToaNha.getAll(condition, '*', 'ten ASC', (error, items) => res.send({ error, items }));
    });

    app.get('/api/danh-muc/toa-nha/item/:ma', app.permission.orCheck('dmToaNha:read', 'dtToaNha:read'), (req, res) => {
        app.model.dmToaNha.get({ ma: req.params.ma }, (error, item) => res.send({ error, item }));
    });

    app.post('/api/danh-muc/toa-nha', app.permission.check('dmToaNha:write'), (req, res) => {
        app.model.dmToaNha.create(req.body.item, (error, item) => res.send({ error, item }));
    });

    app.put('/api/danh-muc/toa-nha', app.permission.check('dmToaNha:write'), (req, res) => {
        app.model.dmToaNha.update({ ma: req.body.ma }, req.body.changes, (error, items) => res.send({ error, items }));
    });

    app.delete('/api/danh-muc/toa-nha', app.permission.check('dmToaNha:delete'), (req, res) => {
        app.model.dmToaNha.delete({ ma: req.body.ma }, errors => res.send({ errors }));
    });
};