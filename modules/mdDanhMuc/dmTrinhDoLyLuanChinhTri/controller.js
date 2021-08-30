module.exports = app => {
    const menu = {
        parentMenu: app.parentMenu.category,
        menus: {
            2061: { title: 'Trình độ Lý luận chính trị', link: '/user/danh-muc/trinh-do-ly-luan-chinh-tri' },
        },
    };
    app.permission.add(
        { name: 'dmTrinhDoLyLuanChinhTri:read', menu },
        { name: 'dmTrinhDoLyLuanChinhTri:write' },
        { name: 'dmTrinhDoLyLuanChinhTri:delete' },
    );
    app.get('/user/danh-muc/trinh-do-ly-luan-chinh-tri', app.permission.check('dmTrinhDoLyLuanChinhTri:read'), app.templates.admin);

    // APIs -----------------------------------------------------------------------------------------------------------------------------------------
    app.get('/api/danh-muc/trinh-do-ly-luan-chinh-tri/page/:pageNumber/:pageSize', app.permission.check('user:login'), (req, res) => {
        const pageNumber = parseInt(req.params.pageNumber),
            pageSize = parseInt(req.params.pageSize);
        app.model.dmTrinhDoLyLuanChinhTri.getPage(pageNumber, pageSize, {}, (error, page) => res.send({ error, page }));
    });

    app.get('/api/danh-muc/trinh-do-ly-luan-chinh-tri/all', app.permission.check('user:login'), (req, res) => {
        const condition = req.query.condition || {};
        app.model.dmTrinhDoLyLuanChinhTri.getAll(condition, '*', 'ma', (error, items) => res.send({ error, items }));
    });

    app.get('/api/danh-muc/trinh-do-ly-luan-chinh-tri/item/:ma', app.permission.check('user:login'), (req, res) => {
        app.model.dmTrinhDoLyLuanChinhTri.get(req.params.ma, (error, item) => res.send({ error, item }));
    });

    app.post('/api/danh-muc/trinh-do-ly-luan-chinh-tri', app.permission.check('dmTrinhDoLyLuanChinhTri:write'), (req, res) => {
        app.model.dmTrinhDoLyLuanChinhTri.create(req.body.item, (error, item) => res.send({ error, item }));
    });

    app.put('/api/danh-muc/trinh-do-ly-luan-chinh-tri', app.permission.check('dmTrinhDoLyLuanChinhTri:write'), (req, res) => {
        app.model.dmTrinhDoLyLuanChinhTri.update({ ma: req.body.ma }, req.body.changes, (error, items) => res.send({ error, items }));
    });

    app.delete('/api/danh-muc/trinh-do-ly-luan-chinh-tri', app.permission.check('dmTrinhDoLyLuanChinhTri:delete'), (req, res) => {
        app.model.dmTrinhDoLyLuanChinhTri.delete({ ma: req.body.ma }, errors => res.send({ errors }));
    });
};