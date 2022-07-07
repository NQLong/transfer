module.exports = (app) => {
    const menu = {
        parentMenu: app.parentMenu.finance,
        menus: { 5004: { title: 'Loại phí', link: '/user/finance/loai-phi' } },
    };

    app.permission.add(
        { name: 'tcLoaiPhi:read', menu },
        { name: 'tcLoaiPhi:write' },
        { name: 'tcLoaiPhi:delete' },
    );

    app.get('/user/finance/loai-phi', app.permission.check('tcLoaiPhi:read'), app.templates.admin);

    // API ---------------------------------------------------------------------------------------------------
    app.get('/api/finance/loai-phi/page/:pageNumber/:pageSize', app.permission.check('tcLoaiPhi:read'), async (req, res) => {
        try {
            const pageNumber = parseInt(req.params.pageNumber),
                pageSize = parseInt(req.params.pageSize);
            let condition = { statement: null };
            if (req.query.condition) {
                condition = {
                    statement: 'lower(ten) LIKE: searchText',
                    parameter: { searchText: `%${req.query.condition.toLowerCase()}%` },
                };
            }
            let page = await app.model.tcLoaiPhi.getPage(pageNumber, pageSize, condition, '*', 'ten');
            res.send({ page });
        } catch (error) {
            res.send({ error });
        }
    });

    app.get('/api/finance/loai-phi/all', app.permission.check('tcLoaiPhi:read'), async (req, res) => {
        try {
            let items = await app.model.tcLoaiPhi.getAll();
            res.send({ items });
        } catch (error) {
            res.send({ error });
        }
    });

    app.get('/api/finance/loai-phi/item/:id', app.permission.check('tcLoaiPhi:read'), async (req, res) => {
        try {
            const item = await app.model.tcLoaiPhi.get({ id: req.params.id });
            res.send({ item });
        } catch (error) {
            res.send({ error });
        }
    });

    app.post('/api/finance/loai-phi', app.permission.check('tcLoaiPhi:write'), async (req, res) => {
        try {
            let item = await app.model.tcLoaiPhi.create(req.body.data);
            res.send({ item });
        } catch (error) {
            res.send({ error });
        }
    });

    app.put('/api/finance/loai-phi', app.permission.check('tcLoaiPhi:write'), async (req, res) => {
        try {
            let item = await app.model.tcLoaiPhi.update({ id: req.body.id }, req.body.changes);
            res.send({ item });
        } catch (error) {
            res.send({ error });
        }
    });

    app.delete('/api/finance/loai-phi', app.permission.check('tcLoaiPhi:delete'), async (req, res) => {
        try {
            await app.model.tcLoaiPhi.delete({ id: req.body.id });
            res.end();
        } catch (error) {
            res.send({ error });
        }
    });

};