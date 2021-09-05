module.exports = app => {
    const menu = {
        parentMenu: app.parentMenu.category,
        menus: {
            2168: { title: 'Dân tộc', link: '/user/danh-muc/dan-toc' },
        },
    };
    app.permission.add(
        { name: 'dmDanToc:read', menu },
        { name: 'dmDanToc:write' },
        { name: 'dmDanToc:delete' },
    );
    app.get('/user/danh-muc/dan-toc', app.permission.check('dmDanToc:read'), app.templates.admin);

    // APIs -----------------------------------------------------------------------------------------------------------------------------------------
    app.get('/api/danh-muc/dan-toc/page/:pageNumber/:pageSize', app.permission.check('user:login'), (req, res) => {
        const pageNumber = parseInt(req.params.pageNumber),
            pageSize = parseInt(req.params.pageSize);
        let condition = { statement: null };
        const statement = ['ma', 'ten'].map(i => `lower(${i}) LIKE :searchText`).join(' OR ');
        if (req.query.condition) {
            condition = {
                statement,
                parameter: { searchText: `%${req.query.condition.toLowerCase()}%` },
            };
        }
        app.model.dmDanToc.getPage(pageNumber, pageSize, condition, '*', 'ma', (error, page) => res.send({ error, page }));
    });

    app.get('/api/danh-muc/dan-toc/all', app.permission.check('user:login'), (req, res) => {
        app.model.dmDanToc.getAll((error, items) => res.send({ error, items }));
    });

    app.get('/api/danh-muc/dan-toc/item/:ma', app.permission.check('user:login'), (req, res) => {
        app.model.dmDanToc.get(req.params.ma, (error, item) => res.send({ error, item }));
    });

    app.post('/api/danh-muc/dan-toc', app.permission.check('dmDanToc:write'), (req, res) => {
        app.model.dmDanToc.create(req.body.item, (error, item) => res.send({ error, item }));
    });

    app.put('/api/danh-muc/dan-toc', app.permission.check('dmDanToc:write'), (req, res) => {
        app.model.dmDanToc.update({ ma: req.body.ma }, req.body.changes, (error, items) => res.send({ error, items }));
    });

    app.delete('/api/danh-muc/dan-toc', app.permission.check('dmDanToc:delete'), (req, res) => {
        app.model.dmDanToc.delete({ ma: req.body.ma }, errors => res.send({ errors }));
    });
};