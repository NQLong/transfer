module.exports = app => {
    const menu = {
        parentMenu: app.parentMenu.category,
        menus: {
            47: { title: 'Mục đích đi nước ngoài', link: '/user/danh-muc/muc-dich-nuoc-ngoai' },
        },
    };
    app.permission.add(
        { name: 'dmMucDichNuocNgoai:read', menu },
        { name: 'dmMucDichNuocNgoai:write' },
        { name: 'dmMucDichNuocNgoai:delete' },
    );
    app.get('/user/danh-muc/muc-dich-nuoc-ngoai', app.permission.check('dmMucDichNuocNgoai:read'), app.templates.admin);

    // APIs -----------------------------------------------------------------------------------------------------------------------------------------
    app.get('/api/danh-muc/muc-dich-nuoc-ngoai/page/:pageNumber/:pageSize', app.permission.check('user:login'), (req, res) => {
        const pageNumber = parseInt(req.params.pageNumber),
            pageSize = parseInt(req.params.pageSize);
        let condition = { statement: null };
        if (req.query.condition) {
            condition = {
                statement: 'lower(ma) LIKE :searchText OR lower(moTa) LIKE :searchText',
                parameter: { searchText: `%${req.query.condition.toLowerCase()}%` },
            };
        }
        app.model.dmMucDichNuocNgoai.getPage(pageNumber, pageSize, condition, (error, page) => res.send({ error, page }));
    });

    app.get('/api/danh-muc/muc-dich-nuoc-ngoai/all', app.permission.check('user:login'), (req, res) => {
        const condition = req.query.condition || {};
        app.model.dmMucDichNuocNgoai.getAll(condition, '*', 'ma', (error, items) => res.send({ error, items }));
    });

    app.get('/api/danh-muc/muc-dich-nuoc-ngoai/item/:ma', app.permission.check('user:login'), (req, res) => {
        app.model.dmMucDichNuocNgoai.get({ ma: req.params.ma }, (error, item) => res.send({ error, item }));
    });

    app.post('/api/danh-muc/muc-dich-nuoc-ngoai', app.permission.check('dmMucDichNuocNgoai:write'), (req, res) => {
        app.model.dmMucDichNuocNgoai.create(req.body.item, (error, item) => res.send({ error, item }));
    });

    app.put('/api/danh-muc/muc-dich-nuoc-ngoai', app.permission.check('dmMucDichNuocNgoai:write'), (req, res) => {
        app.model.dmMucDichNuocNgoai.update({ ma: req.body.ma }, req.body.changes, (error, items) => res.send({ error, items }));
    });

    app.delete('/api/danh-muc/muc-dich-nuoc-ngoai', app.permission.check('dmMucDichNuocNgoai:delete'), (req, res) => {
        app.model.dmMucDichNuocNgoai.delete({ ma: req.body.ma }, errors => res.send({ errors }));
    });
};