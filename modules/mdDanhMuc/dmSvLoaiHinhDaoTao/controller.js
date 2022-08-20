module.exports = app => {
    const menu = {
        parentMenu: app.parentMenu.category,
        menus: {
            4093: { title: 'Hệ đào tạo', subTitle: 'Đào tạo', link: '/user/danh-muc/he-dao-tao' },
        },
    };
    const menuDaoTao = {
        parentMenu: app.parentMenu.daoTao,
        menus: {
            7018: { title: 'Hệ đào tạo', link: '/user/dao-tao/he-dao-tao', groupIndex: 2 },
        },
    };
    app.permission.add(
        { name: 'dmSvLoaiHinhDaoTao:read', menu },
        { name: 'dtSvLoaiHinhDaoTao:read', menu: menuDaoTao },
        { name: 'dmSvLoaiHinhDaoTao:write' },
        { name: 'dmSvLoaiHinhDaoTao:delete' },
    );

    app.permissionHooks.add('staff', 'addRolesLoaiHinhDaoTao', (user, staff) => new Promise(resolve => {
        if (staff.maDonVi && staff.maDonVi == '33') {
            app.permissionHooks.pushUserPermission(user, 'dtSvLoaiHinhDaoTao:read');
            resolve();
        } else resolve();
    }));

    app.get('/user/danh-muc/he-dao-tao', app.permission.check('dmSvLoaiHinhDaoTao:read'), app.templates.admin);
    app.get('/user/dao-tao/he-dao-tao', app.permission.check('dtSvLoaiHinhDaoTao:read'), app.templates.admin);

    // APIs -----------------------------------------------------------------------------------------------------------------------------------------
    app.get('/api/danh-muc/he-dao-tao/page/:pageNumber/:pageSize', app.permission.check('staff:login'), (req, res) => {
        const pageNumber = parseInt(req.params.pageNumber),
            pageSize = parseInt(req.params.pageSize);
        app.model.dmSvLoaiHinhDaoTao.getPage(pageNumber, pageSize, {}, (error, page) => res.send({ error, page }));
    });

    app.get('/api/danh-muc/he-dao-tao/filter', app.permission.orCheck('dmSvLoaiHinhDaoTao:read', 'dtSvLoaiHinhDaoTao:read'), async (req, res) => {
        let permissions = req.session.user.permissions;
        let listLoaiHinhDaoTao = permissions.filter(item => item.includes('quanLyDaoTao')).map(item => item.split(':')[1]);
        let items = [];
        if (permissions.includes('quanLyDaoTao:manager')) {
            items = await app.model.dmSvLoaiHinhDaoTao.getAll();
        } else items = await app.model.dmSvLoaiHinhDaoTao.getAll({
            statement: 'ma IN (:listLoaiHinhDaoTao)',
            parameter: { listLoaiHinhDaoTao }
        });
        res.send({ items });
    });

    app.get('/api/danh-muc/he-dao-tao/all', app.permission.check('user:login'), (req, res) => {
        app.model.dmSvLoaiHinhDaoTao.getAll({ kichHoat: 1 }, (error, items) => res.send({ error, items }));
    });

    app.get('/api/danh-muc/he-dao-tao/item/:ma', app.permission.check('user:login'), (req, res) => {
        app.model.dmSvLoaiHinhDaoTao.get({ ma: req.params.ma }, (error, item) => res.send({ error, item }));
    });

    app.post('/api/danh-muc/he-dao-tao', app.permission.check('dmSvLoaiHinhDaoTao:write'), (req, res) => {
        let data = req.body.data;
        app.model.dmSvLoaiHinhDaoTao.get({ ma: data.ma }, (error, item) => {
            if (!error && item) {
                res.send({ error: 'Mã đã tồn tại' });
            } else {
                app.model.dmSvLoaiHinhDaoTao.create(req.body.data, (error, item) => res.send({ error, item }));
            }
        });
    });

    app.put('/api/danh-muc/he-dao-tao', app.permission.check('dmSvLoaiHinhDaoTao:write'), (req, res) => {
        const changes = req.body.changes || {};
        app.model.dmSvLoaiHinhDaoTao.update({ ma: req.body.ma }, changes, (error, item) => res.send({ error, item }));
    });

    app.delete('/api/danh-muc/he-dao-tao', app.permission.check('dmSvLoaiHinhDaoTao:delete'), (req, res) => {
        app.model.dmSvLoaiHinhDaoTao.delete({ ma: req.body.ma }, errors => res.send({ errors }));
    });
};