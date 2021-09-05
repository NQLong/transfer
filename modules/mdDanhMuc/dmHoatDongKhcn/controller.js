module.exports = app => {
    const menu = {
        parentMenu: app.parentMenu.category,
        // menus: { 2200: { title: 'Danh mục hoạt động KH&CN', link: '/user/khcn/dm-hoat-dong-khcn' } },
    };
    app.permission.add(
        { name: 'dmHoatDongKhcn:read', menu },
        { name: 'dmHoatDongKhcn:write' },
        { name: 'dmHoatDongKhcn:delete' },
    );
    app.get('/user/khcn/dm-hoat-dong-khcn', app.permission.check('dmHoatDongKhcn:read'), app.templates.admin);

    // APIs -----------------------------------------------------------------------------------------------------------------------------------------
    app.get('/api/khcn/dm-hoat-dong-khcn/page/:pageNumber/:pageSize', app.permission.check('staff:login'), (req, res) => {
        const pageNumber = parseInt(req.params.pageNumber),
            pageSize = parseInt(req.params.pageSize);
        let searchTerm = { statement: null };
        if (req.query.condition) {
            searchTerm = {
                statement: 'lower(ma) LIKE :searchText OR lower(ten) LIKE :searchText',
                parameter: { searchText: `%${req.query.condition.toLowerCase()}%` },
            };
        }
        app.model.dmHoatDongKhcn.getPage(pageNumber, pageSize, searchTerm, (error, page) => {
            res.send({ error, page });
        });
    });

    app.get('/api/khcn/dm-hoat-dong-khcn/all', app.permission.check('staff:login'), (req, res) => {
        app.model.dmHoatDongKhcn.getAll((error, items) => res.send({ error, items }));
    });

    app.post('/api/khcn/dm-hoat-dong-khcn', app.permission.check('dmHoatDongKhcn:write'), (req, res) => {
        const newItem = req.body.dmHoatDongKhcn;
        app.model.dmHoatDongKhcn.create(newItem, (error, item) => { res.send({ error, item }); });
    });

    app.put('/api/khcn/dm-hoat-dong-khcn', app.permission.check('dmHoatDongKhcn:write'), (req, res) => {
        let newItem = req.body.changes;
        app.model.dmHoatDongKhcn.update({ ma: req.body.ma }, newItem, (error, item) => {
            res.send({ error, item });
        });
    });

    app.delete('/api/khcn/dm-hoat-dong-khcn', app.permission.check('dmHoatDongKhcn:delete'), (req, res) => {
        app.model.dmHoatDongKhcn.delete({ ma: req.body.ma }, error => res.send({ error }));
    });
};