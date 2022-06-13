module.exports = app => {
    const menu = {
        parentMenu: app.parentMenu.category,
        menus: {
            4102: { title: 'Tiếp nhận về nước', link: '/user/danh-muc/tiep-nhan-ve-nuoc' },
        },
    };
    app.permission.add(
        { name: 'dmTiepNhanVeNuoc:read', menu },
        { name: 'dmTiepNhanVeNuoc:write' },
        { name: 'dmTiepNhanVeNuoc:delete' },
    );
    app.get('/user/danh-muc/tiep-nhan-ve-nuoc', app.permission.check('dmTiepNhanVeNuoc:read'), app.templates.admin);

    // APIs -----------------------------------------------------------------------------------------------------------------------------------------
    app.get('/api/danh-muc/tiep-nhan-ve-nuoc/page/:pageNumber/:pageSize', app.permission.check('user:login'), (req, res) => {
        let pageNumber = parseInt(req.params.pageNumber),
            pageSize = parseInt(req.params.pageSize),
            condition = { statement: null };
        if (req.query.condition) {
            condition = {
                statement: 'lower(ma) LIKE :searchText OR lower(ten) LIKE :searchText',
                parameter: { searchText: `%${req.query.condition.toLowerCase()}%` },
            };
        }
        app.model.dmTiepNhanVeNuoc.getPage(pageNumber, pageSize, condition, (error, page) => res.send({ error, page }));
    });

    app.get('/api/danh-muc/tiep-nhan-ve-nuoc/all', app.permission.check('user:login'), (req, res) => {
        const condition = req.query.condition || {};
        app.model.dmTiepNhanVeNuoc.getAll(condition, (error, items) => res.send({ error, items }));
    });

    app.post('/api/danh-muc/tiep-nhan-ve-nuoc', app.permission.check('dmTiepNhanVeNuoc:write'), (req, res) => {
        let newData = req.body.item;
        app.model.dmTiepNhanVeNuoc.create(newData, (error, item) => res.send({ error, item }));
    });

    app.put('/api/danh-muc/tiep-nhan-ve-nuoc', app.permission.check('dmTiepNhanVeNuoc:write'), (req, res) => {
        let changes = app.clone(req.body.changes);
        app.model.dmTiepNhanVeNuoc.update({ ma: req.body.ma }, changes, (error, items) => res.send({ error, items }));
    });

    app.delete('/api/danh-muc/tiep-nhan-ve-nuoc', app.permission.check('dmTiepNhanVeNuoc:delete'), (req, res) => {
        app.model.dmTiepNhanVeNuoc.delete({ ma: req.body.ma }, error => res.send({ error }));
    });

    app.get('/api/danh-muc/tiep-nhan-ve-nuoc/item/:ma', app.permission.check('user:login'), (req, res) => {
        app.model.dmTiepNhanVeNuoc.get({ ma: req.params.ma }, (error, item) => res.send({ error, item }));
    });

};