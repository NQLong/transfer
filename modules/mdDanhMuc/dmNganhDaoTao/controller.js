module.exports = app => {
    const menu = {
        parentMenu: app.parentMenu.category,
        menus: {
            2153: { title: 'Ngành đào tạo', link: '/user/danh-muc/nganh-dao-Tao' },
        },
    };
    app.permission.add(
        { name: 'dmNganhDaoTao:read', menu },
        { name: 'dmNganhDaoTao:write' },
        { name: 'dmNganhDaoTao:delete' },
    );
    app.get('/user/danh-muc/nganh-dao-Tao', app.permission.check('dmNganhDaoTao:read'), app.templates.admin);

    // APIs -----------------------------------------------------------------------------------------------------------------------------------------
    app.get('/api/danh-muc/nganh-dao-Tao/page/:pageNumber/:pageSize', app.permission.check('user:login'), (req, res) => {
        const pageNumber = parseInt(req.params.pageNumber),
            pageSize = parseInt(req.params.pageSize);
        let condition = { statement: null };
        if (req.query.condition) {
            condition = {
                statement: 'lower(ten) LIKE :searchText',
                parameter: { searchText: `%${req.query.condition.toLowerCase()}%` },
            }
        }
        app.model.dmNganhDaoTao.getPage(pageNumber, pageSize, condition, (error, page) => res.send({ error, page }));
    });

    app.get('/api/danh-muc/nganh-dao-Tao/all', app.permission.check('user:login'), (req, res) => {
        app.model.dmNganhDaoTao.getAll((error, items) => res.send({ error, items }));
    });

    app.get('/api/danh-muc/nganh-dao-Tao/item/:_id', app.permission.check('user:login'), (req, res) => {
        app.model.dmNganhDaoTao.get(req.params._id, (error, items) => res.send({ error, items }));
    });

    app.post('/api/danh-muc/nganh-dao-Tao', app.permission.check('dmNganhDaoTao:write'), (req, res) => {
        app.model.dmNganhDaoTao.create(req.body.item, (error, item) => res.send({ error, item }));
    });

    app.put('/api/danh-muc/nganh-dao-Tao', app.permission.check('dmNganhDaoTao:write'), (req, res) => {
        app.model.dmNganhDaoTao.update({ ma: req.body._id }, req.body.changes, (error, items) => res.send({ error, items }));
    });

    app.delete('/api/danh-muc/nganh-dao-Tao', app.permission.check('dmNganhDaoTao:delete'), (req, res) => {
        app.model.dmNganhDaoTao.delete({ ma: req.body._id }, errors => res.send({ errors }));
    });
};