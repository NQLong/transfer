module.exports = app => {
    const menu = {
        parentMenu: app.parentMenu.category,
        menus: {
            33: { title: 'Hình thức kỷ luật', link: '/user/dm-hinh-thuc-ky-luat' },
        },
    };
    app.permission.add(
        { name: 'dmHinhThucKyLuat:read', menu },
        { name: 'dmHinhThucKyLuat:write' },
        { name: 'dmHinhThucKyLuat:delete' },
    );
    app.get('/user/dm-hinh-thuc-ky-luat', app.permission.check('dmHinhThucKyLuat:read'), app.templates.admin);

    // APIs -----------------------------------------------------------------------------------------------------------------------------------------
    app.get('/api/dm-hinh-thuc-ky-luat/page/:pageNumber/:pageSize', app.permission.check('user:login'), (req, res) => {
        const pageNumber = parseInt(req.params.pageNumber),
            pageSize = parseInt(req.params.pageSize);
        let condition = { statement: null };
        if (req.query.condition) {
            condition = {
                statement: 'lower(ma) LIKE :searchText OR lower(dien_giai) LIKE :searchText',
                parameter: { searchText: `%${req.query.condition.toLowerCase()}%` },
            };
        }
        app.model.dmHinhThucKyLuat.getPage(pageNumber, pageSize, condition, (error, page) => res.send({ error, page }));
    });

    app.get('/api/dm-hinh-thuc-ky-luat/all', app.permission.check('user:login'), (req, res) => {
        app.model.dmHinhThucKyLuat.getAll({}, '*', 'ma', (error, items) => res.send({ error, items }));
    });

    app.get('/api/dm-hinh-thuc-ky-luat/item/:_id', app.permission.check('user:login'), (req, res) => {
        app.model.dmHinhThucKyLuat.get(req.params._id, (error, item) => res.send({ error, item }));
    });

    app.post('/api/dm-hinh-thuc-ky-luat', app.permission.check('dmHinhThucKyLuat:write'), (req, res) => {
        app.model.dmHinhThucKyLuat.create(req.body.item, (error, item) => res.send({ error, item }));
    });

    app.put('/api/dm-hinh-thuc-ky-luat', app.permission.check('dmHinhThucKyLuat:write'), (req, res) => {
        app.model.dmHinhThucKyLuat.update({ ma: req.body.ma }, req.body.changes, (error, items) => res.send({ error, items }));
    });

    app.delete('/api/dm-hinh-thuc-ky-luat', app.permission.check('dmHinhThucKyLuat:delete'), (req, res) => {
        app.model.dmHinhThucKyLuat.delete({ ma: req.body.ma }, error => res.send({ error }));
    });
};