module.exports = app => {
    const menu = {
        parentMenu: app.parentMenu.category,
        menus: {
            39: { title: 'Lĩnh vực kinh doanh', link: '/user/danh-muc/linh-vuc-kinh-doanh' },
        },
    };
    app.permission.add(
        { name: 'dmLinhVucKinhDoanh:read', menu },
        { name: 'dmLinhVucKinhDoanh:write' },
        { name: 'dmLinhVucKinhDoanh:delete' },
    );
    app.get('/user/danh-muc/linh-vuc-kinh-doanh', app.permission.check('dmLinhVucKinhDoanh:read'), app.templates.admin);

    // APIs -----------------------------------------------------------------------------------------------------------------------------------------
    app.get('/api/danh-muc/linh-vuc-kinh-doanh/page/:pageNumber/:pageSize', app.permission.check('user:login'), (req, res) => {
        let pageNumber = parseInt(req.params.pageNumber),
            pageSize = parseInt(req.params.pageSize),
            condition = { statement: null };
        console.log(req.query.condition);
        if (req.query.condition) {
            condition = {
                statement: 'lower(ten) LIKE :searchText OR lower(mo_ta) LIKE :searchText',
                parameter: { searchText: `%${req.query.condition.toLowerCase()}%` },
            };
        }
        app.model.dmLinhVucKinhDoanh.getPage(pageNumber, pageSize, condition, (error, page) => res.send({ error, page }));
    });

    app.get('/api/danh-muc/linh-vuc-kinh-doanh/all', app.permission.check('user:login'), (req, res) => {
        const condition = req.query.condition || {};
        app.model.dmLinhVucKinhDoanh.getAll(condition, (error, items) => res.send({ error, items }));
    });

    app.get('/api/danh-muc/linh-vuc-kinh-doanh/item/:ma', app.permission.check('user:login'), (req, res) => {
        app.model.dmLinhVucKinhDoanh.get({ ma: req.params.ma }, (error, item) => res.send({ error, item }));
    });

    app.post('/api/danh-muc/linh-vuc-kinh-doanh', app.permission.check('dmLinhVucKinhDoanh:write'), (req, res) => {
        app.model.dmLinhVucKinhDoanh.create(req.body.item, (error, item) => res.send({ error, item }));
    });

    app.put('/api/danh-muc/linh-vuc-kinh-doanh', app.permission.check('dmLinhVucKinhDoanh:write'), (req, res) => {
        app.model.dmLinhVucKinhDoanh.update({ ma: req.body.ma }, req.body.changes, (error, items) => res.send({ error, items }));
    });

    app.delete('/api/danh-muc/linh-vuc-kinh-doanh', app.permission.check('dmLinhVucKinhDoanh:delete'), (req, res) => {
        app.model.dmLinhVucKinhDoanh.delete({ ma: req.body.ma }, errors => res.send({ errors }));
    });
};