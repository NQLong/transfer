module.exports = app => {
    const menu = {
        parentMenu: app.parentMenu.category,
        menus: {
            2052: { title: 'Lương đi nước ngoài', link: '/user/danh-muc/luong-di-nuoc-ngoai' },
        },
    };
    app.permission.add(
        { name: 'dmLuongDiNuocNgoai:read', menu },
        { name: 'dmLuongDiNuocNgoai:write' },
        { name: 'dmLuongDiNuocNgoai:delete' },
    );
    app.get('/user/danh-muc/luong-di-nuoc-ngoai', app.permission.check('dmLuongDiNuocNgoai:read'), app.templates.admin);

    // APIs -----------------------------------------------------------------------------------------------------------------------------------------
    app.get('/api/danh-muc/luong-di-nuoc-ngoai/page/:pageNumber/:pageSize', app.permission.check('user:login'), (req, res) => {
        let pageNumber = parseInt(req.params.pageNumber),
            pageSize = parseInt(req.params.pageSize),
            condition = { statement: null };
        if (req.query.condition) {
            condition = {
                statement: 'lower(ma) LIKE :searchText OR lower(moTa) LIKE :searchText OR lower(ghiChu) LIKE :searchText',
                parameter: { searchText: `%${req.query.condition.toLowerCase()}%` },
            }
        }
        app.model.dmLuongDiNuocNgoai.getPage(pageNumber, pageSize, condition, (error, page) => res.send({ error, page }));
    });

    app.get('/api/danh-muc/luong-di-nuoc-ngoai/all', app.permission.check('user:login'), (req, res) => {
        const condition = req.query.condition || {};
        app.model.dmLuongDiNuocNgoai.getAll(condition, (error, items) => res.send({ error, items }));
    });

    app.get('/api/danh-muc/luong-di-nuoc-ngoai/item/:ma', app.permission.check('user:login'), (req, res) => {
        app.model.dmLuongDiNuocNgoai.get({ ma: req.params.ma }, (error, items) => res.send({ error, items }));
    });

    app.post('/api/danh-muc/luong-di-nuoc-ngoai', app.permission.check('dmLuongDiNuocNgoai:write'), (req, res) => {
        app.model.dmLuongDiNuocNgoai.create(req.body.item, (error, item) => res.send({ error, item }));
    });

    app.put('/api/danh-muc/luong-di-nuoc-ngoai', app.permission.check('dmLuongDiNuocNgoai:write'), (req, res) => {
        app.model.dmLuongDiNuocNgoai.update({ ma: req.body.ma }, req.body.changes, (error, items) => res.send({ error, items }));
    });

    app.delete('/api/danh-muc/luong-di-nuoc-ngoai', app.permission.check('dmLuongDiNuocNgoai:delete'), (req, res) => {
        app.model.dmLuongDiNuocNgoai.delete({ ma: req.body.ma }, errors => res.send({ errors }));
    });
};