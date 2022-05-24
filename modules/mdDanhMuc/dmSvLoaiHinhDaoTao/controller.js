module.exports = app => {
    const menu = {
        parentMenu: app.parentMenu.daoTao,
        menus: {
            9011: { title: 'Loại hình đào tạo', groupIndex: 2, link: '/user/danh-muc/dao-tao/loai-hinh-dao-tao' },
        },
    };
    app.permission.add(
        { name: 'dmSvLoaiHinhDaoTao:read', menu },
        { name: 'dmSvLoaiHinhDaoTao:write' },
        { name: 'dmSvLoaiHinhDaoTao:delete' },
    );
    app.get('/user/danh-muc/dao-tao/loai-hinh-dao-tao', app.permission.check('dmSvLoaiHinhDaoTao:read'), app.templates.admin);

    // APIs -----------------------------------------------------------------------------------------------------------------------------------------
    app.get('/api/danh-muc/dao-tao/loai-hinh-dao-tao/page/:pageNumber/:pageSize', app.permission.check('user:login'), (req, res) => {
        const pageNumber = parseInt(req.params.pageNumber),
            pageSize = parseInt(req.params.pageSize);
        app.model.dmSvLoaiHinhDaoTao.getPage(pageNumber, pageSize, {}, (error, page) => res.send({ error, page }));
    });

    app.get('/api/danh-muc/dao-tao/loai-hinh-dao-tao/item/:ma', app.permission.check('user:login'), (req, res) => {
        app.model.dmSvLoaiHinhDaoTao.get({ ma: req.params.ma }, (error, item) => res.send({ error, item }));
    });

    app.post('/api/danh-muc/dao-tao/loai-hinh-dao-tao', app.permission.check('dmSvLoaiHinhDaoTao:write'), (req, res) => {
        let data = req.body.data;
        app.model.dmSvLoaiHinhDaoTao.get({ ma: data.ma }, (error, item) => {
            if (!error && item) {
                res.send({ error: 'Mã đã tồn tại' });
            } else {
                app.model.dmSvLoaiHinhDaoTao.create(req.body.data, (error, item) => res.send({ error, item }));
            }
        });
    });

    app.put('/api/danh-muc/dao-tao/loai-hinh-dao-tao', app.permission.check('dmSvLoaiHinhDaoTao:write'), (req, res) => {
        const changes = req.body.changes || {};
        app.model.dmSvLoaiHinhDaoTao.update({ ma: req.body.ma }, changes, (error, item) => res.send({ error, item }));
    });

    app.delete('/api/danh-muc/dao-tao/loai-hinh-dao-tao', app.permission.check('dmSvLoaiHinhDaoTao:delete'), (req, res) => {
        app.model.dmSvLoaiHinhDaoTao.delete({ ma: req.body.ma }, errors => res.send({ errors }));
    });
};