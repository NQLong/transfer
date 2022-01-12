module.exports = app => {
    const menu = {
        parentMenu: app.parentMenu.category,
        menus: {
            4079: { title: 'Vị trí tuyển dụng', link: '/user/danh-muc/vi-tri-tuyen-dung' },
        },
    };
    app.permission.add(
        { name: 'dmViTriTuyenDung:read', menu },
        { name: 'dmViTriTuyenDung:write' },
        { name: 'dmViTriTuyenDung:delete' },
    );
    app.get('/user/danh-muc/vi-tri-tuyen-dung', app.permission.check('dmViTriTuyenDung:read'), app.templates.admin);

    // APIs -----------------------------------------------------------------------------------------------------------------------------------------
    app.get('/api/danh-muc/vi-tri-tuyen-dung/page/:pageNumber/:pageSize', app.permission.check('user:login'), (req, res) => {
        let pageNumber = parseInt(req.params.pageNumber),
            pageSize = parseInt(req.params.pageSize),
            condition = { statement: null };
        if (req.query.condition) {
            condition = {
                statement: 'lower(ma) LIKE :searchText OR lower(ten) LIKE :searchText',
                parameter: { searchText: `%${req.query.condition.toLowerCase()}%` },
            };
        }        
        app.model.dmViTriTuyenDung.getPage(pageNumber, pageSize, condition, (error, page) => res.send({ error, page }));
    });

    app.get('/api/danh-muc/vi-tri-tuyen-dung/all', app.permission.check('user:login'), (req, res) => {
        app.model.dmViTriTuyenDung.getAll((error, items) => res.send({ error, items }));
    });

    app.get('/api/danh-muc/vi-tri-tuyen-dung/item/:ma', app.permission.check('user:login'), (req, res) => {
        app.model.dmViTriTuyenDung.get({ ma: req.params.ma }, (error, item) => res.send({ error, item }));
    });

    app.post('/api/danh-muc/vi-tri-tuyen-dung', app.permission.check('dmViTriTuyenDung:write'), (req, res) => {
        app.model.dmViTriTuyenDung.create(req.body.item, (error, item) => res.send({ error, item }));
    });

    app.put('/api/danh-muc/vi-tri-tuyen-dung', app.permission.check('dmViTriTuyenDung:write'), (req, res) => {
        app.model.dmViTriTuyenDung.update({ ma: req.body.ma }, req.body.changes, (error, items) => res.send({ error, items }));
    });

    app.delete('/api/danh-muc/vi-tri-tuyen-dung', app.permission.check('dmViTriTuyenDung:delete'), (req, res) => {
        app.model.dmViTriTuyenDung.delete({ ma: req.body.ma }, errors => res.send({ errors }));
    });
};