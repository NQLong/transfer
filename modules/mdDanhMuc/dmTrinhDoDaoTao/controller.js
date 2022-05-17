module.exports = app => {
    const menu = {
        parentMenu: app.parentMenu.category,
        menus: {
            4082: { title: 'Trình độ đào tạo, bồi dưỡng cán bộ', link: '/user/danh-muc/trinh-do-dao-tao' },
        },
    };
    app.permission.add(
        { name: 'dmTrinhDoDaoTao:read', menu },
        'dmTrinhDoDaoTao:write', 'dmTrinhDoDaoTao:delete', 'dmTrinhDoDaoTao:upload',
    );
    app.get('/user/danh-muc/trinh-do-dao-tao', app.permission.check('dmTrinhDoDaoTao:read'), app.templates.admin);

    // APIs -----------------------------------------------------------------------------------------------------------------------------------------
    app.get('/api/danh-muc/trinh-do-dao-tao/page/:pageNumber/:pageSize', app.permission.check('user:login'), (req, res) => {
        let pageNumber = parseInt(req.params.pageNumber),
            pageSize = parseInt(req.params.pageSize),
            condition = { statement: null };
        if (req.query.condition) {
            condition = {
                statement: 'lower(ma) LIKE :searchText OR lower(ten) LIKE :searchText OR lower(tenTiengAnh) LIKE :searchText',
                parameter: { searchText: `%${req.query.condition.toLowerCase()}%` },
            };
        }
        app.model.dmTrinhDoDaoTao.getPage(pageNumber, pageSize, condition, (error, page) => res.send({ error, page }));
    });

    app.get('/api/danh-muc/trinh-do-dao-tao/filter/:loai/:pageNumber/:pageSize', app.permission.check('staff:login'), (req, res) => {
        let pageNumber = parseInt(req.params.pageNumber),
            pageSize = parseInt(req.params.pageSize),
            loai = req.params.loai,
            condition = {};
        if (req.query.condition) {
            if (loai != '00') {
                condition = {
                    statement: 'lower(ma) LIKE :searchText OR lower(ten) LIKE :searchText AND loai =:loai',
                    parameter: { searchText: `%${req.query.condition.toLowerCase()}%`, loai },
                };
            } else {
                condition = {
                    statement: 'lower(ma) LIKE :searchText OR lower(ten) LIKE :searchText',
                    parameter: { searchText: `%${req.query.condition.toLowerCase()}%` },
                };
            }
        } else {
            if (loai != '00') {
                condition = {
                    statement: 'loai = :loai',
                    parameter: { loai },
                };
            }
        }
        app.model.dmTrinhDoDaoTao.getPage(pageNumber, pageSize, condition, (error, page) => res.send({ error, page }));
    });

    app.get('/api/danh-muc/trinh-do-dao-tao/all', app.permission.check('user:login'), (req, res) => {
        app.model.dmTrinhDoDaoTao.getAll((error, items) => res.send({ error, items }));
    });

    app.get('/api/danh-muc/trinh-do-dao-tao/item/:ma', app.permission.check('user:login'), (req, res) => {
        app.model.dmTrinhDoDaoTao.get({ ma: req.params.ma }, (error, item) => res.send({ error, item }));
    });

    app.post('/api/danh-muc/trinh-do-dao-tao', app.permission.check('dmTrinhDoDaoTao:write'), (req, res) => {
        app.model.dmTrinhDoDaoTao.create(req.body.item, (error, item) => res.send({ error, item }));
    });

    app.put('/api/danh-muc/trinh-do-dao-tao', app.permission.check('dmTrinhDoDaoTao:write'), (req, res) => {
        app.model.dmTrinhDoDaoTao.update({ ma: req.body.ma }, req.body.changes, (error, items) => res.send({ error, items }));
    });

    app.delete('/api/danh-muc/trinh-do-dao-tao', app.permission.check('dmTrinhDoDaoTao:delete'), (req, res) => {
        app.model.dmTrinhDoDaoTao.delete({ ma: req.body.ma }, errors => res.send({ errors }));
    });
};