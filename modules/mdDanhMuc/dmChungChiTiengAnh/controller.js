module.exports = app => {
    const menu = {
        parentMenu: app.parentMenu.category,
        menus: {
            12: { title: 'Chứng chỉ Anh Văn', link: '/user/danh-muc/chung-chi-tieng-anh' },
        },
    };
    app.permission.add(
        { name: 'dmChungChiTiengAnh:read', menu },
        { name: 'dmChungChiTiengAnh:write' },
        { name: 'dmChungChiTiengAnh:delete' },
    );
    app.get('/user/danh-muc/chung-chi-tieng-anh', app.permission.check('dmChungChiTiengAnh:read'), app.templates.admin);

    // APIs -----------------------------------------------------------------------------------------------------------------------------------------
    app.get('/api/danh-muc/chung-chi-tieng-anh/page/:pageNumber/:pageSize', app.permission.check('user:login'), (req, res) => {
        const pageNumber = parseInt(req.params.pageNumber),
            pageSize = parseInt(req.params.pageSize);
        app.model.oispChungChiTiengAnh.getPage(pageNumber, pageSize, {}, (error, page) => {
            res.send({ error, page });
        });
    });

    app.get('/api/danh-muc/chung-chi-tieng-anh/all', app.permission.check('user:login'), (req, res) => {
        app.model.oispChungChiTiengAnh.getAll((error, items) => res.send({ error, items }));
    });

    app.get('/api/danh-muc/chung-chi-tieng-anh/item/:ma', app.permission.check('user:login'), (req, res) => {
        app.model.oispChungChiTiengAnh.get({ ma: req.params.ma }, (error, item) => res.send({ error, item }));
    });

    app.post('/api/danh-muc/chung-chi-tieng-anh', app.permission.check('dmChungChiTiengAnh:write'), (req, res) => {
        app.model.oispChungChiTiengAnh.create(req.body.item, (error, item) => res.send({ error, item }));
    });

    app.put('/api/danh-muc/chung-chi-tieng-anh', app.permission.check('dmChungChiTiengAnh:write'), (req, res) => {
        let changes = app.clone(req.body.changes);
        app.model.oispChungChiTiengAnh.update({ ma: req.body.ma }, changes, (error, items) => res.send({ error, items }));
    });

    app.delete('/api/danh-muc/chung-chi-tieng-anh', app.permission.check('dmChungChiTiengAnh:delete'), (req, res) => {
        app.model.oispChungChiTiengAnh.delete({ ma: req.body.ma }, error => res.send({ error }));
    });
};