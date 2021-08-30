module.exports = app => {
    const menu = {
        parentMenu: app.parentMenu.category,
        menus: {
            2017: { title: 'Kinh phí nước ngoài', link: '/user/danh-muc/kinh-phi-nuoc-ngoai' },
        },
    };
    app.permission.add(
        { name: 'dmKinhPhiNuocNgoai:read', menu },
        { name: 'dmKinhPhiNuocNgoai:write' },
        { name: 'dmKinhPhiNuocNgoai:delete' },
    );
    app.get('/user/danh-muc/kinh-phi-nuoc-ngoai', app.permission.check('dmKinhPhiNuocNgoai:read'), app.templates.admin);

    // APIs -----------------------------------------------------------------------------------------------------------------------------------------
    app.get('/api/danh-muc/kinh-phi-nuoc-ngoai/page/:pageNumber/:pageSize', app.permission.check('user:login'), (req, res) => {
        const pageNumber = parseInt(req.params.pageNumber),
            pageSize = parseInt(req.params.pageSize);
        let condition = { statement: null };
        if (req.query.condition) {
            condition = {
                statement: 'lower(ma) LIKE :searchText OR lower(ten) LIKE :searchText',
                parameter: { searchText: `%${req.query.condition.toLowerCase()}%` },
            }
        }
        app.model.dmKinhPhiNuocNgoai.getPage(pageNumber, pageSize, condition, (error, page) => res.send({ error, page }));
    });

    app.get('/api/danh-muc/kinh-phi-nuoc-ngoai/all', app.permission.check('user:login'), (req, res) => {
        const condition = req.query.condition || {};
        app.model.dmKinhPhiNuocNgoai.getAll(condition, '*', 'ma', (error, items) => res.send({ error, items }));
    });

    app.get('/api/danh-muc/kinh-phi-nuoc-ngoai/item/:ma', app.permission.check('user:login'), (req, res) => {
        app.model.dmKinhPhiNuocNgoai.get({ ma: req.params.ma }, (error, item) => res.send({ error, item }));
    });

    app.post('/api/danh-muc/kinh-phi-nuoc-ngoai', app.permission.check('dmKinhPhiNuocNgoai:write'), (req, res) => {
        app.model.dmKinhPhiNuocNgoai.create(req.body.item, (error, item) => res.send({ error, item }));
    });

    app.put('/api/danh-muc/kinh-phi-nuoc-ngoai', app.permission.check('dmKinhPhiNuocNgoai:write'), (req, res) => {
        app.model.dmKinhPhiNuocNgoai.update({ ma: req.body.ma }, req.body.changes, (error, items) => res.send({ error, items }));
    });

    app.delete('/api/danh-muc/kinh-phi-nuoc-ngoai', app.permission.check('dmKinhPhiNuocNgoai:delete'), (req, res) => {
        app.model.dmKinhPhiNuocNgoai.delete({ ma: req.body.ma }, errors => res.send({ errors }));
    });
};