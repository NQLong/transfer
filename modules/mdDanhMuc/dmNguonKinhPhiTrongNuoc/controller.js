module.exports = app => {
    const menu = {
        parentMenu: app.parentMenu.category,
        menus: {
            2090: { title: 'Nguồn kinh phí trong nước', link: '/user/danh-muc/nguon-kinh-phi-trong-nuoc' },
        },
    };
    app.permission.add(
        { name: 'dmNguonKinhPhiTrongNuoc:read', menu },
        { name: 'dmNguonKinhPhiTrongNuoc:write' },
        { name: 'dmNguonKinhPhiTrongNuoc:delete' },
    );
    app.get('/user/danh-muc/nguon-kinh-phi-trong-nuoc', app.permission.check('dmNguonKinhPhiTrongNuoc:read'), app.templates.admin);

    // APIs -----------------------------------------------------------------------------------------------------------------------------------------
    app.get('/api/danh-muc/nguon-kinh-phi-trong-nuoc/page/:pageNumber/:pageSize', app.permission.check('user:login'), (req, res) => {
        const pageNumber = parseInt(req.params.pageNumber),
            pageSize = parseInt(req.params.pageSize);
        let condition = { statement: null };
        if (req.query.condition) {
            condition = {
                statement: 'lower(ma) LIKE :searchText OR lower(moTa) LIKE :searchText',
                parameter: { searchText: `%${req.query.condition.toLowerCase()}%` },
            }
        }
        app.model.dmNguonKinhPhiTrongNuoc.getPage(pageNumber, pageSize, condition, (error, page) => res.send({ error, page }));
    });

    app.get('/api/danh-muc/nguon-kinh-phi-trong-nuoc/all', app.permission.check('user:login'), (req, res) => {
        app.model.dmNguonKinhPhiTrongNuoc.getAll((error, items) => res.send({ error, items }));
    });

    app.get('/api/danh-muc/nguon-kinh-phi-trong-nuoc/item/:ma', app.permission.check('user:login'), (req, res) => {
        app.model.dmNguonKinhPhiTrongNuoc.get({ ma: req.params.ma }, (error, item) => res.send({ error, item }));
    });

    app.post('/api/danh-muc/nguon-kinh-phi-trong-nuoc', app.permission.check('dmNguonKinhPhiTrongNuoc:write'), (req, res) => {
        app.model.dmNguonKinhPhiTrongNuoc.create(req.body.item, (error, item) => res.send({ error, item }));
    });

    app.put('/api/danh-muc/nguon-kinh-phi-trong-nuoc', app.permission.check('dmNguonKinhPhiTrongNuoc:write'), (req, res) => {
        app.model.dmNguonKinhPhiTrongNuoc.update({ ma: req.body.ma }, req.body.changes, (error, items) => res.send({ error, items }));
    });

    app.delete('/api/danh-muc/nguon-kinh-phi-trong-nuoc', app.permission.check('dmNguonKinhPhiTrongNuoc:delete'), (req, res) => {
        app.model.dmNguonKinhPhiTrongNuoc.delete({ ma: req.body.ma }, errors => res.send({ errors }));
    });
};