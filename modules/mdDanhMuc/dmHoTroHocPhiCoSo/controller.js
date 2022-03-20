module.exports = app => {
    const menu = {
        parentMenu: app.parentMenu.category,
        menus: {
            4085: { title: 'Hỗ trợ học phí - cơ cở đào tạo', link: '/user/danh-muc/ho-tro-hoc-phi-co-so' }
        }
    };
    app.permission.add(
        { name: 'dmHoTroHocPhiCoSo:read', menu },
        { name: 'dmHoTroHocPhiCoSo:write' },
        { name: 'dmHoTroHocPhiCoSo:delete' }
    );
    app.get('/user/danh-muc/ho-tro-hoc-phi-co-so', app.permission.check('dmHoTroHocPhiCoSo:read'), app.templates.admin);

    // APIs -----------------------------------------------------------------------------------------------------------------------------------------
    app.get('/api/danh-muc/ho-tro-hoc-phi-co-so/page/:pageNumber/:pageSize', app.permission.check('user:login'), (req, res) => {
        let pageNumber = parseInt(req.params.pageNumber),
            pageSize = parseInt(req.params.pageSize),
            condition = { statement: null };
        if (req.query.condition) {
            condition = {
                statement: 'lower(ma) LIKE :searchText OR lower(ten) LIKE :searchText',
                parameter: { searchText: `%${req.query.condition.toLowerCase()}%` }
            };
        }
        app.model.dmHoTroHocPhiCoSo.getPage(pageNumber, pageSize, condition, (error, page) => res.send({ error, page }));
    });

    app.get('/api/danh-muc/ho-tro-hoc-phi-co-so/all', app.permission.check('user:login'), (req, res) => {
        const condition = req.query.condition || {};
        app.model.dmHoTroHocPhiCoSo.getAll(condition, (error, items) => res.send({ error, items }));
    });

    app.get('/api/danh-muc/ho-tro-hoc-phi-co-so/item/:ma', app.permission.check('user:login'), (req, res) => {
        app.model.dmHoTroHocPhiCoSo.get({ ma: req.params.ma }, (error, item) => res.send({ error, item }));
    });

    app.post('/api/danh-muc/ho-tro-hoc-phi-co-so', app.permission.check('dmHoTroHocPhiCoSo:write'), (req, res) => {
        let newData = req.body.item;
        app.model.dmHoTroHocPhiCoSo.create(newData, (error, item) => res.send({ error, item }));
    });

    app.put('/api/danh-muc/ho-tro-hoc-phi-co-so', app.permission.check('dmHoTroHocPhiCoSo:write'), (req, res) => {
        let changes = app.clone(req.body.changes);
        app.model.dmHoTroHocPhiCoSo.update({ ma: req.body.ma }, changes, (error, items) => res.send({ error, items }));
    });

    app.delete('/api/danh-muc/ho-tro-hoc-phi-co-so', app.permission.check('dmHoTroHocPhiCoSo:delete'), (req, res) => {
        app.model.dmHoTroHocPhiCoSo.delete({ ma: req.body.ma }, error => res.send({ error }));
    });
};