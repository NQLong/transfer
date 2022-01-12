module.exports = app => {
    const menu = {
        parentMenu: app.parentMenu.category,
        menus: { 4030: { title: 'KHCN đơn vị chủ quản', link: '/user/danh-muc/khcn-don-vi-chu-quan' } },
    };
    app.permission.add(
        { name: 'dmKhcnDonViChuQuan:read', menu },
        { name: 'dmKhcnDonViChuQuan:write' },
        { name: 'dmKhcnDonViChuQuan:delete' },
    );
    app.get('/user/danh-muc/khcn-don-vi-chu-quan', app.permission.check('dmKhcnDonViChuQuan:read'), app.templates.admin);

    // APIs -----------------------------------------------------------------------------------------------------------------------------------------
    app.get('/api/danh-muc/khcn-don-vi-chu-quan/page/:pageNumber/:pageSize', app.permission.check('staff:login'), (req, res) => {
        let pageNumber = parseInt(req.params.pageNumber),
            pageSize = parseInt(req.params.pageSize);
        let searchTerm = { statement: null };
        if (req.query.condition) {
            searchTerm = {
                statement: 'lower(ma) LIKE :searchText OR lower(ten) LIKE :searchText',
                parameter: { searchText: `%${req.query.condition.toLowerCase()}%` },
            };
        }
        app.model.dmKhcnDonViChuQuan.getPage(pageNumber, pageSize, searchTerm, (error, page) => {
            res.send({ error, page });
        });
    });
    app.get('/api/danh-muc/khcn-don-vi-chu-quan', app.permission.check('staff:login'), (req, res) => {
        app.model.dmKhcnDonViChuQuan.getAll((error, items) => {
            res.send({ error, items });
        });
        
    });
    app.get('/api/danh-muc/khcn-don-vi-chu-quan/item/:ma', app.permission.check('dmKhcnDonViChuQuan:read'), (req, res) => {
        app.model.dmKhcnDonViChuQuan.get({ ma: req.params.ma }, (error, item) => res.send({ error, item }));
    });

    app.post('/api/danh-muc/khcn-don-vi-chu-quan', app.permission.check('dmKhcnDonViChuQuan:write'), (req, res) => {
        const changes = req.body.changes;
        app.model.dmKhcnDonViChuQuan.create(changes, (error, item) => { res.send({ error, item }); });
    });

    app.put('/api/danh-muc/khcn-don-vi-chu-quan', app.permission.check('dmKhcnDonViChuQuan:write'), (req, res) => {
        let newItem = req.body.changes;
        app.model.dmKhcnDonViChuQuan.update({ ma: req.body.ma }, newItem, (error, item) => {
            res.send({ error, item });
        });
    });

    app.delete('/api/danh-muc/khcn-don-vi-chu-quan', app.permission.check('dmKhcnDonViChuQuan:write'), (req, res) => {
        app.model.dmKhcnDonViChuQuan.delete({ ma: req.body.ma }, error => res.send({ error }));
    });
};