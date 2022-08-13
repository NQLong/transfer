module.exports = app => {
    const menu = {
        parentMenu: app.parentMenu.category,
        menus: {
            4087: { title: 'Bậc đào tạo', subTitle: 'Đào tạo', link: '/user/danh-muc/bac-dao-tao' },
        },
    };
    const menuDaoTao = {
        parentMenu: app.parentMenu.daoTao,
        menus: {
            7017: { title: 'Bậc đào tạo ', link: '/user/dao-tao/bac-dao-tao', groupIndex: 2 },
        },
    };
    app.permission.add(
        { name: 'dmSvBacDaoTao:read', menu },
        { name: 'dtSvBacDaoTao:read', menu: menuDaoTao },
        { name: 'dmSvBacDaoTao:write' },
        { name: 'dmSvBacDaoTao:delete' },
    );

    app.permissionHooks.add('staff', 'addRolesBacDaoTao', (user, staff) => new Promise(resolve => {
        if (staff.maDonVi && staff.maDonVi == '33') {
            app.permissionHooks.pushUserPermission(user, 'dtSvBacDaoTao:read');
            resolve();
        } else resolve();
    }));

    app.get('/user/danh-muc/bac-dao-tao', app.permission.check('dmSvBacDaoTao:read'), app.templates.admin);
    app.get('/user/dao-tao/bac-dao-tao', app.permission.check('dtSvBacDaoTao:read'), app.templates.admin);

    // APIs -----------------------------------------------------------------------------------------------------------------------------------------
    app.get('/api/danh-muc/bac-dao-tao/page/:pageNumber/:pageSize', app.permission.orCheck('dmSvBacDaoTao:read', 'dtSvBacDaoTao:read'), (req, res) => {
        const pageNumber = parseInt(req.params.pageNumber),
            pageSize = parseInt(req.params.pageSize);
        let condition = { statement: null };
        if (req.query.condition) {
            condition = {
                statement: 'lower(tenBac) LIKE :searchText OR lower(maBac) LIKE :searchText',
                parameter: { searchText: `%${req.query.condition.toLowerCase()}%` },
            };
        }
        app.model.dmSvBacDaoTao.getPage(pageNumber, pageSize, condition, (error, page) => res.send({ error, page }));
    });

    app.get('/api/danh-muc/bac-dao-tao/item/:maBac', app.permission.orCheck('staff:login', 'dtSvBacDaoTao:read'), (req, res) => {
        app.model.dmSvBacDaoTao.get({ maBac: req.params.maBac }, (error, item) => res.send({ error, item }));
    });

    app.post('/api/danh-muc/bac-dao-tao', app.permission.check('dmSvBacDaoTao:write'), (req, res) => {
        let data = req.body.data;
        app.model.dmSvBacDaoTao.get({ maBac: data.maBac }, (error, item) => {
            if (!error && item) {
                res.send({ error: 'Mã bậc đã tồn tại' });
            } else {
                app.model.dmSvBacDaoTao.create(req.body.data, (error, item) => res.send({ error, item }));
            }
        });
    });

    app.put('/api/danh-muc/bac-dao-tao', app.permission.check('dmSvBacDaoTao:write'), (req, res) => {
        app.model.dmSvBacDaoTao.update({ maBac: req.body.maBac }, req.body.changes, (error, item) => res.send({ error, item }));
    });

    app.delete('/api/danh-muc/bac-dao-tao', app.permission.check('dmSvBacDaoTao:delete'), (req, res) => {
        app.model.dmSvBacDaoTao.delete({ maBac: req.body.maBac }, errors => res.send({ errors }));
    });
};