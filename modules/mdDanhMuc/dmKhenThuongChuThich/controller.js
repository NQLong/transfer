module.exports = app => {
    const menu = {
        parentMenu: app.parentMenu.category,
        menus: {
            2401: { title: 'Khen thưởng chú thích', link: '/user/danh-muc/khen-thuong-chu-thich' },
        },
    };
    app.permission.add(
        { name: 'dmKhenThuongChuThich:read', menu },
        { name: 'dmKhenThuongChuThich:write' },
        { name: 'dmKhenThuongChuThich:delete' },
    );
    app.get('/user/danh-muc/khen-thuong-chu-thich', app.permission.check('dmKhenThuongChuThich:read'), app.templates.admin);
    app.get('/user/danh-muc/khen-thuong-chu-thich/upload', app.permission.check('staff:login'), app.templates.admin);

    // APIs -----------------------------------------------------------------------------------------------------------------------------------------
    app.get('/api/danh-muc/khen-thuong-chu-thich/page/:pageNumber/:pageSize', app.permission.check('user:login'), (req, res) => {
        let pageNumber = parseInt(req.params.pageNumber),
            pageSize = parseInt(req.params.pageSize),
            condition = { statement: null };
        if (req.query.condition) {
            condition = {
                statement: 'lower(ma) LIKE :searchText OR lower(ten) LIKE :searchText',
                parameter: { searchText: `%${req.query.condition.toLowerCase()}%` },
            };
        }
        app.model.dmKhenThuongChuThich.getPage(pageNumber, pageSize, condition, (error, page) => res.send({ error, page }));
    });

    app.get('/api/danh-muc/khen-thuong-chu-thich/all', app.permission.check('user:login'), (req, res) => {
        const condition = req.query.condition || {};
        app.model.dmKhenThuongChuThich.getAll(condition, (error, items) => res.send({ error, items }));
    });

    app.get('/api/danh-muc/khen-thuong-chu-thich/edit/:ma', app.permission.check('user:login'), (req, res) => {
        app.model.dmKhenThuongChuThich.get({ma: req.params.ma}, (error, item) => res.send({ error, item }));
    });

    app.post('/api/danh-muc/khen-thuong-chu-thich', app.permission.check('dmKhenThuongChuThich:write'), (req, res) => {
        let newData = req.body.item;
        app.model.dmKhenThuongChuThich.create(newData, (error, item) => res.send({ error, item }));
    });

    app.put('/api/danh-muc/khen-thuong-chu-thich', app.permission.check('dmKhenThuongChuThich:write'), (req, res) => {
        let changes = app.clone(req.body.changes);
        app.model.dmKhenThuongChuThich.update({ ma: req.body.ma }, changes, (error, items) => res.send({ error, items }));
    });

    app.delete('/api/danh-muc/khen-thuong-chu-thich', app.permission.check('dmKhenThuongChuThich:delete'), (req, res) => {
        app.model.dmKhenThuongChuThich.delete({ ma: req.body.ma }, error => res.send({ error }));
    });
};