module.exports = app => {
    const menu = {
        parentMenu: app.parentMenu.category,
        menus: { 4076: { title: 'Trình độ ngoại ngữ', link: '/user/danh-muc/trinh-do-ngoai-ngu' } },
    };
    app.permission.add(
        { name: 'dmTrinhDoNgoaiNgu:read', menu },
        { name: 'dmTrinhDoNgoaiNgu:write' },
        { name: 'dmTrinhDoNgoaiNgu:delete' },
    );

    app.get('/user/danh-muc/trinh-do-ngoai-ngu', app.permission.check('dmTrinhDoNgoaiNgu:read'), app.templates.admin);

    // APIs -----------------------------------------------------------------------------------------------------------------------------------------
    app.get('/api/danh-muc/trinh-do-ngoai-ngu/page/:pageNumber/:pageSize', app.permission.check('user:login'), (req, res) => {
        let pageNumber = parseInt(req.params.pageNumber),
            pageSize = parseInt(req.params.pageSize),
            condition = { statement: null };
        if (req.query.condition) {
            condition = {
                statement: 'lower(ma) LIKE :searchText OR lower(ten) LIKE :searchText',
                parameter: { searchText: `%${req.query.condition.toLowerCase()}%` },
            };
        }        
        app.model.dmTrinhDoNgoaiNgu.getPage(pageNumber, pageSize, condition, (error, page) => res.send({ error, page }));
    });

    app.get('/api/danh-muc/trinh-do-ngoai-ngu/all', app.permission.check('user:login'), (req, res) => {
        const condition = req.query.condition || {};
        app.model.dmTrinhDoNgoaiNgu.getAll(condition, '*', 'ma', (error, items) => res.send({ error, items }));
    });

    app.get('/api/danh-muc/trinh-do-ngoai-ngu/item/:ma', app.permission.check('user:login'), (req, res) => {
        app.model.dmTrinhDoNgoaiNgu.get(req.params.ma, (error, item) => res.send({ error, item }));
    });

    app.post('/api/danh-muc/trinh-do-ngoai-ngu', app.permission.check('dmTrinhDoNgoaiNgu:write'), (req, res) => {
        const newItem = req.body.dmTrinhDoNgoaiNgu;
        app.model.dmTrinhDoNgoaiNgu.get({ ma: newItem.ma }, (error, item) => {
            if (item) {
                res.send({ error: { exist: true, message: 'Trình độ ngoại ngữ ' + newItem.ma + ' đã tồn tại' } });
            } else if (error) {
                res.send({ error });
            } else {
                app.model.dmTrinhDoNgoaiNgu.create(newItem, (error, item) => res.send({ error, item }));
            }
        });
    });

    app.put('/api/danh-muc/trinh-do-ngoai-ngu', app.permission.check('dmTrinhDoNgoaiNgu:write'), (req, res) => {
        app.model.dmTrinhDoNgoaiNgu.update({ ma: req.body.ma }, req.body.changes, (error, item) => res.send({ error, item }));
    });

    app.delete('/api/danh-muc/trinh-do-ngoai-ngu', app.permission.check('dmTrinhDoNgoaiNgu:delete'), (req, res) => {
        app.model.dmTrinhDoNgoaiNgu.delete({ ma: req.body.ma }, error => res.send({ error }));
    });
};