module.exports = app => {
    const menu = {
        parentMenu: app.parentMenu.category,
        menus: {
            4099: { title: 'Loại hình đào tạo', link: '/user/danh-muc/loai-hinh-dao-tao' },
        },
    };
    app.permission.add(
        { name: 'dmLoaiHinhDaoTao:read', menu },
        { name: 'dmLoaiHinhDaoTao:write' },
        { name: 'dmLoaiHinhDaoTao:delete' },
    );
    app.get('/user/danh-muc/loai-hinh-dao-tao', app.permission.check('dmLoaiHinhDaoTao:read'), app.templates.admin);

    // APIs -----------------------------------------------------------------------------------------------------------------------------------------
    app.get('/api/danh-muc/loai-hinh-dao-tao/page/:pageNumber/:pageSize', app.permission.check('user:login'), (req, res) => {
        const pageNumber = parseInt(req.params.pageNumber),
            pageSize = parseInt(req.params.pageSize);
        let condition = { statement: null };
        const statement = ['ma', 'ten'].map(i => `lower(${i}) LIKE :searchText`).join(' OR ');
        if (req.query.condition) {
            condition = {
                statement,
                parameter: { searchText: `%${req.query.condition.toLowerCase()}%` },
            };
        }
        app.model.dmLoaiHinhDaoTao.getPage(pageNumber, pageSize, condition, '*', 'ten', (error, page) => res.send({ error, page }));
    });

    app.get('/api/danh-muc/loai-hinh-dao-tao/all', app.permission.check('user:login'), (req, res) => {
        app.model.dmLoaiHinhDaoTao.getAll((error, items) => res.send({ error, items }));
    });

    app.get('/api/danh-muc/loai-hinh-dao-tao/item/:ma', app.permission.check('user:login'), (req, res) => {
        app.model.dmLoaiHinhDaoTao.get({ma: req.params.ma}, (error, item) => res.send({ error, item }));
    });

    app.post('/api/danh-muc/loai-hinh-dao-tao', app.permission.check('dmLoaiHinhDaoTao:write'), (req, res) => {
        app.model.dmLoaiHinhDaoTao.create(req.body.item, (error, item) => res.send({ error, item }));
    });

    app.put('/api/danh-muc/loai-hinh-dao-tao', app.permission.check('dmLoaiHinhDaoTao:write'), (req, res) => {
        app.model.dmLoaiHinhDaoTao.update({ ma: req.body.ma }, req.body.changes, (error, items) => res.send({ error, items }));
    });

    app.delete('/api/danh-muc/loai-hinh-dao-tao', app.permission.check('dmLoaiHinhDaoTao:delete'), (req, res) => {
        app.model.dmLoaiHinhDaoTao.delete({ ma: req.body.ma }, errors => res.send({ errors }));
    });
};