module.exports = app => {
    const menu = {
        parentMenu: app.parentMenu.category,
        menus: {
            4010: { title: 'Chức danh chuyên môn', link: '/user/danh-muc/chuc-danh-chuyen-mon' },
        },
    };
    app.permission.add(
        { name: 'dmChucDanhChuyenMon:read', menu },
        { name: 'dmChucDanhChuyenMon:write' },
        { name: 'dmChucDanhChuyenMon:delete' },
    );
    app.get('/user/danh-muc/chuc-danh-chuyen-mon', app.permission.check('dmChucDanhChuyenMon:read'), app.templates.admin);

    // APIs -----------------------------------------------------------------------------------------------------------------------------------------
    app.get('/api/danh-muc/chuc-danh-chuyen-mon/page/:pageNumber/:pageSize', app.permission.check('staff:login'), (req, res) => {
        let pageNumber = parseInt(req.params.pageNumber),
            pageSize = parseInt(req.params.pageSize),
            condition = { statement: null };
        if (req.query.condition) {
            condition = {
                statement: 'lower(ma) LIKE :searchText OR lower(ten) LIKE :searchText',
                parameter: { searchText: `%${req.query.condition.toLowerCase()}%` },
            };
        }
        app.model.dmChucDanhChuyenMon.getPage(pageNumber, pageSize, condition, (error, page) => res.send({ error, page }));
    });

    app.get('/api/danh-muc/chuc-danh-chuyen-mon/all', app.permission.check('staff:login'), (req, res) => {
        const condition = req.query.condition || {};
        app.model.dmChucDanhChuyenMon.getAll(condition, (error, items) => res.send({ error, items }));
    });

    app.post('/api/danh-muc/chuc-danh-chuyen-mon', app.permission.check('dmChucDanhChuyenMon:write'), (req, res) => {
        app.model.dmChucDanhChuyenMon.create(req.body.item, (error, item) => res.send({ error, item }));
    });

    app.put('/api/danh-muc/chuc-danh-chuyen-mon', app.permission.check('dmChucDanhChuyenMon:write'), (req, res) => {
        let changes = app.clone(req.body.changes);
        app.model.dmChucDanhChuyenMon.update({ ma: req.body.ma }, changes, (error, items) => res.send({ error, items }));
    });

    app.delete('/api/danh-muc/chuc-danh-chuyen-mon', app.permission.check('dmChucDanhChuyenMon:delete'), (req, res) => {
        app.model.dmChucDanhChuyenMon.delete({ ma: req.body.ma }, error => res.send({ error }));
    });

    app.get('/api/danh-muc/chuc-danh-chuyen-mon/item/:ma', app.permission.check('user:login'), (req, res) => {
        app.model.dmChucDanhChuyenMon.get({ ma: req.params.ma }, (error, item) => res.send({ error, item }));
    });
};