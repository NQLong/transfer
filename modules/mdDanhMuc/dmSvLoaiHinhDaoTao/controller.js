module.exports = app => {
    const menu = {
        parentMenu: app.parentMenu.category,
        menus: {
            4093: { title: 'Loại hình đào tạo', subTitle: 'Đào tạo', link: '/user/danh-muc/loai-hinh-dao-tao' },
        },
    };
    const menuDaoTao = {
        parentMenu: app.parentMenu.daoTao,
        menus: {
            9010: { title: 'Loại hình đào tạo', link: '/user/dao-tao/loai-hinh-dao-tao', groupIndex: 2, icon: 'fa-tasks' },
        },
    };
    app.permission.add(
        { name: 'dmSvLoaiHinhDaoTao:read', menu },
        { name: 'dtSvLoaiHinhDaoTao:read', menu: menuDaoTao },
        { name: 'dmSvLoaiHinhDaoTao:write' },
        { name: 'dmSvLoaiHinhDaoTao:delete' },
    );
    app.get('/user/danh-muc/loai-hinh-dao-tao', app.permission.check('dmSvLoaiHinhDaoTao:read'), app.templates.admin);
    app.get('/user/dao-tao/loai-hinh-dao-tao', app.permission.check('dtSvLoaiHinhDaoTao:read'), app.templates.admin);

    // APIs -----------------------------------------------------------------------------------------------------------------------------------------
    app.get('/api/danh-muc/loai-hinh-dao-tao/page/:pageNumber/:pageSize', app.permission.orCheck('dmSvLoaiHinhDaoTao:read', 'dtSvLoaiHinhDaoTao:read'), (req, res) => {
        const pageNumber = parseInt(req.params.pageNumber),
            pageSize = parseInt(req.params.pageSize);
        app.model.dmSvLoaiHinhDaoTao.getPage(pageNumber, pageSize, {}, (error, page) => res.send({ error, page }));
    });

    app.get('/api/danh-muc/loai-hinh-dao-tao/item/:ma', app.permission.check('user:login'), (req, res) => {
        app.model.dmSvLoaiHinhDaoTao.get({ ma: req.params.ma }, (error, item) => res.send({ error, item }));
    });

    app.post('/api/danh-muc/loai-hinh-dao-tao', app.permission.check('dmSvLoaiHinhDaoTao:write'), (req, res) => {
        let data = req.body.data;
        app.model.dmSvLoaiHinhDaoTao.get({ ma: data.ma }, (error, item) => {
            if (!error && item) {
                res.send({ error: 'Mã đã tồn tại' });
            } else {
                app.model.dmSvLoaiHinhDaoTao.create(req.body.data, (error, item) => res.send({ error, item }));
            }
        });
    });

    app.put('/api/danh-muc/loai-hinh-dao-tao', app.permission.check('dmSvLoaiHinhDaoTao:write'), (req, res) => {
        const changes = req.body.changes || {};
        app.model.dmSvLoaiHinhDaoTao.update({ ma: req.body.ma }, changes, (error, item) => res.send({ error, item }));
    });

    app.delete('/api/danh-muc/loai-hinh-dao-tao', app.permission.check('dmSvLoaiHinhDaoTao:delete'), (req, res) => {
        app.model.dmSvLoaiHinhDaoTao.delete({ ma: req.body.ma }, errors => res.send({ errors }));
    });
};