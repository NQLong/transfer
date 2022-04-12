module.exports = app => {
    const menu = {
        parentMenu: app.parentMenu.category,
        menus: {
           4101: { title: 'Nghỉ phép', link: '/user/danh-muc/nghi-phep' },
        },
    };
    app.permission.add(
        { name: 'dmNghiPhep:read', menu },
        { name: 'dmNghiPhep:write' },
        { name: 'dmNghiPhep:delete' },
    );
    app.get('/user/danh-muc/nghi-phep', app.permission.check('dmNghiPhep:read'), app.templates.admin);

    // APIs -----------------------------------------------------------------------------------------------------------------------------------------
    app.get('/api/danh-muc/nghi-phep/page/:pageNumber/:pageSize', app.permission.check('user:login'), (req, res) => {
        let pageNumber = parseInt(req.params.pageNumber),
            pageSize = parseInt(req.params.pageSize),
            condition = { statement: null };
        if (req.query.condition) {
            condition = {
                statement: 'lower(ma) LIKE :searchText OR lower(ten) LIKE :searchText',
                parameter: { searchText: `%${req.query.condition.toLowerCase()}%` },
            };
        }
        app.model.dmNghiPhep.getPage(pageNumber, pageSize, condition, (error, page) => res.send({ error, page }));
    });

    app.get('/api/danh-muc/nghi-phep/all', app.permission.check('user:login'), (req, res) => {
        const condition = req.query.condition || {};
        app.model.dmNghiPhep.getAll(condition, (error, items) => res.send({ error, items }));
    });

    app.get('/api/danh-muc/nghi-phep/item/:ma', app.permission.check('user:login'), (req, res) => {
        app.model.dmNghiPhep.get({ ma: req.params.ma }, (error, item) => res.send({ error, item }));
    });

    app.post('/api/danh-muc/nghi-phep', app.permission.check('dmNghiPhep:write'), (req, res) => {
        let newData = req.body.item;
        app.model.dmNghiPhep.create(newData, (error, item) => res.send({ error, item }));
    });

    app.put('/api/danh-muc/nghi-phep', app.permission.check('dmNghiPhep:write'), (req, res) => {
        let changes = app.clone(req.body.changes);
        app.model.dmNghiPhep.update({ ma: req.body.ma }, changes, (error, items) => res.send({ error, items }));
    });

    app.delete('/api/danh-muc/nghi-phep', app.permission.check('dmNghiPhep:delete'), (req, res) => {
        app.model.dmNghiPhep.delete({ ma: req.body.ma }, error => res.send({ error }));
    });
};