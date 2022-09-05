module.exports = app => {
    const menu = {
        parentMenu: app.parentMenu.category,
        menus: {
            4007: { title: 'Giờ học', link: '/user/danh-muc/ca-hoc' },
        },
    };
    const menuDaoTao = {
        parentMenu: app.parentMenu.daoTao,
        menus: {
            7010: { title: 'Giờ học', link: '/user/dao-tao/ca-hoc', groupIndex: 2 },
        },
    };
    app.permission.add(
        { name: 'dmCaHoc:read', menu },
        { name: 'dtCaHoc:read', menu: menuDaoTao },
        { name: 'dmCaHoc:write' },
        { name: 'dmCaHoc:delete' },
    );

    app.permissionHooks.add('staff', 'addRolesCaHoc', (user, staff) => new Promise(resolve => {
        if (staff.maDonVi && staff.maDonVi == '33') {
            app.permissionHooks.pushUserPermission(user, 'dtCaHoc:read', 'dmCaHoc:write', 'dmCaHoc:delete');
            resolve();
        } else resolve();
    }));



    app.get('/user/danh-muc/ca-hoc', app.permission.check('dmCaHoc:read'), app.templates.admin);
    app.get('/user/dao-tao/ca-hoc', app.permission.check('dtCaHoc:read'), app.templates.admin);

    // APIs -----------------------------------------------------------------------------------------------------------------------------------------
    app.get('/api/danh-muc/ca-hoc/page/:pageNumber/:pageSize', app.permission.orCheck('dmCaHoc:read', 'dtCaHoc:read'), (req, res) => {
        const pageNumber = parseInt(req.params.pageNumber),
            pageSize = parseInt(req.params.pageSize);
        app.model.dmCaHoc.getPage(pageNumber, pageSize, {}, (error, page) => {
            res.send({ error, page });
        });
    });

    app.get('/api/danh-muc/ca-hoc/all', app.permission.orCheck('dmCaHoc:read', 'dtCaHoc:read'), (req, res) => {
        app.model.dmCaHoc.getAll({}, '*', 'maCoSo,thoiGianBatDau', (error, items) => res.send({ error, items }));
    });

    app.get('/api/danh-muc/ca-hoc/all-condition', app.permission.orCheck('dmCaHoc:read', 'dtCaHoc:read'), async (req, res) => {
        try {
            let maCoSo = req.query.maCoSo || '';
            let items = await app.model.dmCaHoc.getAll({ maCoSo, kichHoat: 1 });
            res.send({ items });
        } catch (error) {
            res.send({ error });
        }

    });

    app.get('/api/danh-muc/ca-hoc/item/:_id', app.permission.orCheck('dmCaHoc:read', 'dtCaHoc:read'), (req, res) => {
        app.model.dmCaHoc.get(req.params._id, (error, item) => res.send({ error, item }));
    });

    app.post('/api/danh-muc/ca-hoc', app.permission.check('dmCaHoc:write'), (req, res) => {
        app.model.dmCaHoc.create(req.body.item, (error, item) => res.send({ error, item }));
    });

    app.put('/api/danh-muc/ca-hoc', app.permission.check('dmCaHoc:write'), (req, res) => {
        let changes = app.clone(req.body.changes);
        app.model.dmCaHoc.update({ ma: req.body._id }, changes, (error, items) => res.send({ error, items }));
    });

    app.delete('/api/danh-muc/ca-hoc', app.permission.check('dmCaHoc:delete'), (req, res) => {
        app.model.dmCaHoc.delete({ ma: req.body._id }, error => res.send({ error }));
    });
};