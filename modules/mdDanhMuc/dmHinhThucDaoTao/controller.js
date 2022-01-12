module.exports = app => {
    const menu = {
        parentMenu: app.parentMenu.category,
        menus: { 4026: { title: 'Hình thức đào tạo', link: '/user/danh-muc/hinh-thuc-dao-tao' } },
    };
    app.permission.add(
        { name: 'dmHinhThucDaoTao:read', menu },
        { name: 'dmHinhThucDaoTao:write' },
        { name: 'dmHinhThucDaoTao:delete' },
    );

    app.get('/user/danh-muc/hinh-thuc-dao-tao', app.permission.check('dmHinhThucDaoTao:read'), app.templates.admin);

    // APIs -----------------------------------------------------------------------------------------------------------------------------------------
    app.get('/api/danh-muc/hinh-thuc-dao-tao/page/:pageNumber/:pageSize', app.permission.check('user:login'), (req, res) => {
        const pageNumber = parseInt(req.params.pageNumber),
            pageSize = parseInt(req.params.pageSize);
        let condition = { statement: null };
        if (req.query.condition) {
            condition = {
                statement: 'lower(ma) LIKE :searchText OR lower(ten) LIKE :searchText',
                parameter: { searchText: `%${req.query.condition.toLowerCase()}%` },
            };
        }
        app.model.dmHinhThucDaoTao.getPage(pageNumber, pageSize, condition, (error, page) => res.send({ error, page }));
    });

    app.get('/api/danh-muc/hinh-thuc-dao-tao/all', app.permission.check('user:login'), (req, res) => {
        app.model.dmHinhThucDaoTao.getAll({}, '*', 'ma', (error, items) => res.send({ error, items }));
    });

    app.get('/api/danh-muc/hinh-thuc-dao-tao/item/:ma', app.permission.check('user:login'), (req, res) => {
        app.model.dmHinhThucDaoTao.get({ ma: req.params.ma }, (error, item) => res.send({ error, item }));
    });

    app.post('/api/danh-muc/hinh-thuc-dao-tao', app.permission.check('dmHinhThucDaoTao:write'), (req, res) => {
        const newItem = req.body.dmHinhThucDaoTao;
        app.model.dmHinhThucDaoTao.get({ ma: newItem.ma }, (error, item) => {
            if (item) {
                res.send({ error: { exist: true, message: 'Hình thức đào tạo ' + newItem.ma.toString() + ' đã tồn tại' } });
            } else if (error) {
                res.send({ error });
            } else {
                app.model.dmHinhThucDaoTao.create(newItem, (error, item) => res.send({ error, item }));
            }
        });
    });

    app.put('/api/danh-muc/hinh-thuc-dao-tao', app.permission.check('dmHinhThucDaoTao:write'), (req, res) => {
        app.model.dmHinhThucDaoTao.update({ ma: req.body.ma }, req.body.changes, (error, item) => res.send({ error, item }));
    });

    app.delete('/api/danh-muc/hinh-thuc-dao-tao', app.permission.check('dmHinhThucDaoTao:delete'), (req, res) => {
        app.model.dmHinhThucDaoTao.delete({ ma: req.body.ma }, error => res.send({ error }));
    });
};