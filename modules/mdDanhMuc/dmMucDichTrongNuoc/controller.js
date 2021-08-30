module.exports = app => {
    const menu = {
        parentMenu: app.parentMenu.category,
        menus: {
            2018: { title: 'Mục Đích Trong Nước', link: '/user/danh-muc/muc-dich-trong-nuoc' },
        },
    };
    app.permission.add(
        { name: 'dmMucDichTrongNuoc:read', menu },
        { name: 'dmMucDichTrongNuoc:write' },
        { name: 'dmMucDichTrongNuoc:delete' },
    );
    app.get('/user/danh-muc/muc-dich-trong-nuoc', app.permission.check('dmMucDichTrongNuoc:read'), app.templates.admin);

    // APIs -----------------------------------------------------------------------------------------------------------------------------------------
    app.get('/api/danh-muc/muc-dich-trong-nuoc/page/:pageNumber/:pageSize', app.permission.check('user:login'), (req, res) => {
        let pageNumber = parseInt(req.params.pageNumber),
            pageSize = parseInt(req.params.pageSize),
            condition = { statement: null };
        if (req.query.condition) {
            condition = {
                statement: 'lower(ma) LIKE :searchText OR lower(moTa) LIKE :searchText',
                parameter: { searchText: `%${req.query.condition.toLowerCase()}%` },
            }
        }
        app.model.dmMucDichTrongNuoc.getPage(pageNumber, pageSize, condition, (error, page) => res.send({ error, page }));
    });

    app.get('/api/danh-muc/muc-dich-trong-nuoc/all', app.permission.check('user:login'), (req, res) => {
        app.model.dmMucDichTrongNuoc.getAll((error, items) => res.send({ error, items }));
    });

    app.get('/api/danh-muc/muc-dich-trong-nuoc/item/:ma', app.permission.check('user:login'), (req, res) => {
        app.model.dmMucDichTrongNuoc.get({ ma: req.params.ma }, (error, item) => res.send({ error, item }));
    });

    app.post('/api/danh-muc/muc-dich-trong-nuoc', app.permission.check('dmMucDichTrongNuoc:write'), (req, res) => {
        app.model.dmMucDichTrongNuoc.create(req.body.item, (error, item) => res.send({ error, item }));
    });

    app.put('/api/danh-muc/muc-dich-trong-nuoc', app.permission.check('dmMucDichTrongNuoc:write'), (req, res) => {
        app.model.dmMucDichTrongNuoc.update({ ma: req.body.ma }, req.body.changes, (error, items) => res.send({ error, items }));
    });

    app.delete('/api/danh-muc/muc-dich-trong-nuoc', app.permission.check('dmMucDichTrongNuoc:delete'), (req, res) => {
        app.model.dmMucDichTrongNuoc.delete({ ma: req.body.ma }, errors => res.send({ errors }));
    });
};