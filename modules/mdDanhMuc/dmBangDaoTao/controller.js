module.exports = app => {
    const menu = {
        parentMenu: app.parentMenu.category,
        menus: {
            4080: { title: 'Bằng đào tạo', link: '/user/dm-bang-dao-tao' },
        },
    };
    app.permission.add(
        { name: 'dmBangDaoTao:read', menu },
        'dmBangDaoTao:write', 'dmBangDaoTao:delete', 'dmBangDaoTao:upload',
    );
    app.get('/user/dm-bang-dao-tao', app.permission.check('dmBangDaoTao:read'), app.templates.admin);
    app.get('/user/dm-bang-dao-tao/upload', app.permission.check('dmBangDaoTao:write'), app.templates.admin);

    // APIs -----------------------------------------------------------------------------------------------------------------------------------------
    app.get('/api/dm-bang-dao-tao/page/:pageNumber/:pageSize', app.permission.check('user:login'), (req, res) => {
        let pageNumber = parseInt(req.params.pageNumber),
            pageSize = parseInt(req.params.pageSize),
            condition = { statement: null };
        if (req.query.condition) {
            condition = {
                statement: 'lower(ma) LIKE :searchText OR lower(ten) LIKE :searchText OR lower(tenTiengAnh) LIKE :searchText',
                parameter: { searchText: `%${req.query.condition.toLowerCase()}%` },
            };
        }
        app.model.dmBangDaoTao.getPage(pageNumber, pageSize, condition, (error, page) => res.send({ error, page }));
    });

    app.get('/api/dm-bang-dao-tao/all', app.permission.check('user:login'), (req, res) => {
        app.model.dmBangDaoTao.getAll((error, items) => res.send({ error, items }));
    });

    app.get('/api/dm-bang-dao-tao/item/:ma', app.permission.check('user:login'), (req, res) => {
        app.model.dmBangDaoTao.get({ ma: req.params.ma }, (error, item) => res.send({ error, item }));
    });

    app.post('/api/dm-bang-dao-tao', app.permission.check('dmBangDaoTao:write'), (req, res) => {
        app.model.dmBangDaoTao.create(req.body.item, (error, item) => res.send({ error, item }));
    });

    app.put('/api/dm-bang-dao-tao', app.permission.check('dmBangDaoTao:write'), (req, res) => {
        app.model.dmBangDaoTao.update({ ma: req.body.ma }, req.body.changes, (error, items) => res.send({ error, items }));
    });

    app.delete('/api/dm-bang-dao-tao', app.permission.check('dmBangDaoTao:delete'), (req, res) => {
        app.model.dmBangDaoTao.delete({ ma: req.body.ma }, errors => res.send({ errors }));
    });
};