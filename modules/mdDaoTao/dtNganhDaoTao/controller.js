module.exports = app => {
    const menu = {
        parentMenu: app.parentMenu.daoTao,
        menus: {
            7003: {
                title: 'Danh sách Ngành đào tạo', groupIndex: 0,
                icon: 'fa-cube', backgroundColor: '#b36154',
                link: '/user/dao-tao/nganh-dao-tao'
            },
        },
    };

    app.permission.add(
        { name: 'dtNganhDaoTao:read', menu },
        { name: 'dtChuongTrinhDaoTao:manage', menu },
        { name: 'dtNganhDaoTao:write' },
        { name: 'dtNganhDaoTao:delete' },
    );
    app.get('/user/dao-tao/nganh-dao-tao', app.permission.orCheck('dtNganhDaoTao:read', 'dtChuongTrinhDaoTao:manage'), app.templates.admin);

    // APIs -----------------------------------------------------------------------------------------------------------------------------------------
    app.get('/api/dao-tao/nganh-dao-tao/page/:pageNumber/:pageSize', app.permission.orCheck('dtNganhDaoTao:read', 'dtChuongTrinhDaoTao:manage'), (req, res) => {
        const pageNumber = parseInt(req.params.pageNumber),
            pageSize = parseInt(req.params.pageSize);
        const user = req.session.user, permissions = user.permissions;
        let donVi = req.query.donViFilter;
        if (!permissions.includes('dtChuongTrinhDaoTao:read')) {
            if (user.staff.maDonVi) donVi = user.staff.maDonVi;
            else return res.send({ error: 'Permission denied!' });
        }
        app.model.dtNganhDaoTao.getPage(pageNumber, pageSize, {
            statement: '(:donVi) IS NULL OR khoa = (: donVi)',
            parameter: { donVi }
        }, '*', 'khoa', (error, page) => res.send({ error, page }));
    });

    app.get('/api/dao-tao/nganh-dao-tao/item/:maNganh', app.permission.orCheck('dtNganhDaoTao:read', 'dtChuongTrinhDaoTao:manage'), (req, res) => {
        app.model.dtNganhDaoTao.get({ maNganh: req.params.maNganh }, (error, item) => res.send({ error, item }));
    });

    app.get('/api/dao-tao/nganh-dao-tao/filter', app.permission.orCheck('dtNganhDaoTao:read', 'dtChuongTrinhDaoTao:manage'), (req, res) => {
        console.log(req.query);
        app.model.dtNganhDaoTao.getAll(
            {
                statement: '(:khoa IS NULL OR khoa = :khoa) AND (lower(tenNganh) LIKE :searchText OR lower(maNganh) LIKE :searchText)',
                parameter: {
                    khoa: req.query.donVi,
                    searchText: `%${req.query.condition || ''}%`
                }
            }, (error, items) => res.send({ error, items }));
    });

    app.post('/api/dao-tao/nganh-dao-tao', app.permission.check('dtNganhDaoTao:write'), (req, res) => {
        let data = req.body.data;
        app.model.dtNganhDaoTao.get({ maNganh: data.maNganh }, (error, item) => {
            if (!error && item) {
                res.send({ error: 'Mã đã tồn tại' });
            } else {
                app.model.dtNganhDaoTao.create(req.body.data, (error, item) => res.send({ error, item }));
            }
        });
    });

    app.put('/api/dao-tao/nganh-dao-tao', app.permission.check('dtNganhDaoTao:write'), (req, res) => {
        const changes = req.body.changes || {};
        app.model.dtNganhDaoTao.update({ maNganh: req.body.maNganh }, changes, (error, item) => res.send({ error, item }));
    });

    app.delete('/api/dao-tao/nganh-dao-tao', app.permission.check('dtNganhDaoTao:delete'), (req, res) => {
        app.model.dtNganhDaoTao.delete({ maNganh: req.body.maNganh }, errors => res.send({ errors }));
    });
};