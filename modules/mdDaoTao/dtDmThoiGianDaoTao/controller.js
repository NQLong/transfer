module.exports = app => {
    const menu = {
        parentMenu: app.parentMenu.daoTao,
        menus: {
            7020: {
                title: 'Thời gian đào tạo', link: '/user/dao-tao/thoi-gian-dao-tao', groupIndex: '2',
            }
        }
    };

    app.permission.add(
        { name: 'dtDmThoiGianDaoTao:read', menu },
        'dtDmThoiGianDaoTao:write', 'dtDmThoiGianDaoTao:delete'
    );

    app.get('/user/dao-tao/thoi-gian-dao-tao', app.permission.orCheck('dtDmThoiGianDaoTao:read', 'dtChuongTrinhDaoTao:soNamnage'), app.templates.admin);

    app.permissionHooks.add('staff', 'addRolesDtThoiGian', (user, staff) => new Promise(resolve => {
        if (staff.maDonVi && staff.maDonVi == '33') {
            app.permissionHooks.pushUserPermission(user, 'dtDmThoiGianDaoTao:read', 'dtDmThoiGianDaoTao:write', 'dtDmThoiGianDaoTao:delete');
            resolve();
        } else resolve();
    }));

    app.get('/api/dao-tao/thoi-gian-dao-tao/all', app.permission.check('dtDmThoiGianDaoTao:read'), (req, res) => {
        let searchTerm = `%${req.query.condition || ''}%`;
        app.model.dtDmThoiGianDaoTao.getAll({
            statement: 'soNam LIKE :searchTerm',
            parameter: { searchTerm }
        }, (error, items) => res.send({ error, items }));
    });

    app.get('/api/dao-tao/thoi-gian-dao-tao/item/:soNam', app.permission.orCheck('dtDmThoiGianDaoTao:read', 'dtChuongTrinhDaoTao:soNamnage'), (req, res) => {
        app.model.dtDmThoiGianDaoTao.get({ soNam: req.params.soNam }, (error, item) => {
            res.send({ error, item });
        });
    });

    app.post('/api/dao-tao/thoi-gian-dao-tao', app.permission.check('dtDmThoiGianDaoTao:write'), (req, res) =>
        app.model.dtDmThoiGianDaoTao.create(req.body.data, (error, item) => res.send({ error, item })));

    app.put('/api/dao-tao/thoi-gian-dao-tao', app.permission.check('dtDmThoiGianDaoTao:write'), (req, res) =>
        app.model.dtDmThoiGianDaoTao.update({ soNam: req.body.soNam }, req.body.changes || {}, (error, item) => res.send({ error, item })));

    app.delete('/api/dao-tao/thoi-gian-dao-tao', app.permission.check('dtDmThoiGianDaoTao:delete'), (req, res) =>
        app.model.dtDmThoiGianDaoTao.delete({ soNam: req.body.soNam }, error => res.send({ error })));
};