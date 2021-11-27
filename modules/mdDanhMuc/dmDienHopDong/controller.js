module.exports = app => {
    const menu = {
        parentMenu: app.parentMenu.category,
        menus: {
            2190: { title: 'Diện hợp đồng', link: '/user/danh-muc/dien-hop-dong' },
        },
    };
    app.permission.add(
        { name: 'dmDienHopDong:read', menu },
        { name: 'dmDienHopDong:write' },
        { name: 'dmDienHopDong:delete' },
    );
    app.get('/user/danh-muc/dien-hop-dong', app.permission.check('dmDienHopDong:read'), app.templates.admin);

    // APIs -----------------------------------------------------------------------------------------------------------------------------------------
    app.get('/api/danh-muc/dien-hop-dong/page/:pageNumber/:pageSize', app.permission.check('user:login'), (req, res) => {
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
        app.model.dmDienHopDong.getPage(pageNumber, pageSize, condition, '*', 'ma', (error, page) => res.send({ error, page }));
    });

    app.get('/api/danh-muc/dien-hop-dong/all', app.permission.check('user:login'), (req, res) => {
        app.model.dmDienHopDong.getAll((error, items) => res.send({ error, items }));
    });

    app.get('/api/danh-muc/dien-hop-dong/item/:ma', app.permission.check('user:login'), (req, res) => {
        app.model.dmDienHopDong.get(req.params.ma, (error, item) => res.send({ error, item }));
    });

    app.post('/api/danh-muc/dien-hop-dong', app.permission.check('dmDienHopDong:write'), (req, res) => {
        app.model.dmDienHopDong.create(req.body.item, (error, item) => res.send({ error, item }));
    });

    app.put('/api/danh-muc/dien-hop-dong', app.permission.check('dmDienHopDong:write'), (req, res) => {
        app.model.dmDienHopDong.update({ ma: req.body.ma }, req.body.changes, (error, items) => res.send({ error, items }));
    });

    app.delete('/api/danh-muc/dien-hop-dong', app.permission.check('dmDienHopDong:delete'), (req, res) => {
        app.model.dmDienHopDong.delete({ ma: req.body.ma }, errors => res.send({ errors }));
    });
};