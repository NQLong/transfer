module.exports = app => {
    const menu = {
        parentMenu: app.parentMenu.category,
        menus: {
            4021: { title: 'Đối tượng cán bộ', link: '/user/danh-muc/doi-tuong-can-bo' },
        },
    };
    app.permission.add(
        { name: 'dmDoiTuongCanBo:read', menu },
        { name: 'dmDoiTuongCanBo:write' },
        { name: 'dmDoiTuongCanBo:delete' },
    );
    app.get('/user/danh-muc/doi-tuong-can-bo', app.permission.check('dmDoiTuongCanBo:read'), app.templates.admin);

    // APIs ----------------------------------------------------------------------------------------------------------------------------------------
    app.get('/api/danh-muc/doi-tuong-can-bo/page/:pageNumber/:pageSize', app.permission.check('user:login'), (req, res) => {
        const pageNumber = parseInt(req.params.pageNumber),
            pageSize = parseInt(req.params.pageSize);
        app.model.dmDoiTuongCanBo.getPage(pageNumber, pageSize, {}, (error, page) => res.send({ error, page }));
    });

    app.get('/api/danh-muc/doi-tuong-can-bo/all', app.permission.check('user:login'), (req, res) => {
        const condition = req.query.condition || {};
        app.model.dmDoiTuongCanBo.getAll(condition, '*', 'ma', (error, items) => res.send({ error, items }));
    });

    app.get('/api/danh-muc/doi-tuong-can-bo/item/:ma', app.permission.check('user:login'), (req, res) => {
        app.model.dmDoiTuongCanBo.get(req.params.ma, (error, item) => res.send({ error, item }));
    });

    app.post('/api/danh-muc/doi-tuong-can-bo', app.permission.check('dmDoiTuongCanBo:write'), (req, res) => {
        app.model.dmDoiTuongCanBo.create(req.body.item, (error, item) => res.send({ error, item }));
    });

    app.put('/api/danh-muc/doi-tuong-can-bo', app.permission.check('dmDoiTuongCanBo:write'), (req, res) => {
        app.model.dmDoiTuongCanBo.update({ ma: req.body.ma }, req.body.changes, (error, items) => res.send({ error, items }));
    });

    app.delete('/api/danh-muc/doi-tuong-can-bo', app.permission.check('dmDoiTuongCanBo:delete'), (req, res) => {
        app.model.dmDoiTuongCanBo.delete({ ma: req.body.ma }, error => res.send({ error }));
    });
};