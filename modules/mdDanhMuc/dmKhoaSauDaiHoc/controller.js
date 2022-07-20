module.exports = app => {
    const menu = {
        parentMenu: app.parentMenu.category,
        menus: {
            4103: { title: 'Khoa Sau đại học', link: '/user/danh-muc/khoa-sau-dai-hoc' },
        },
    };
    app.permission.add(
        { name: 'dmKhoaSdh:read', menu },
        { name: 'dmKhoaSdh:write' },
        { name: 'dmKhoaSdh:delete' },
    );
    app.get('/user/danh-muc/khoa-sau-dai-hoc', app.permission.check('dmKhoaSdh:read'), app.templates.admin);

    // APIs -----------------------------------------------------------------------------------------------------------------------------------------
    app.get('/api/danh-muc/khoa-sau-dai-hoc/page/:pageNumber/:pageSize', app.permission.check('user:login'), (req, res) => {
        const pageNumber = parseInt(req.params.pageNumber),
            pageSize = parseInt(req.params.pageSize);
        let condition = { statement: null };
        if (req.query.condition) {
            condition = {
                statement: 'lower(ten) LIKE :searchText',
                parameter: { searchText: `%${req.query.condition.toLowerCase()}%` },
            };
            if (req.query.kichHoat) {
                condition.statement += ' AND kichHoat = :kichHoat';
                condition.parameter.kichHoat = req.query.kichHoat;
            }
        } else if (req.query.kichHoat) {
            condition = {
                statement: 'kichHoat = :kichHoat',
                parameter: { kichHoat: req.query.kichHoat }
            };
        }

        app.model.dmKhoaSauDaiHoc.getPage(pageNumber, pageSize, condition, '*', 'ma', (error, page) => res.send({ error, page }));
    });

    app.get('/api/danh-muc/khoa-sau-dai-hoc/all', app.permission.check('user:login'), (req, res) => {
        app.model.dmKhoaSauDaiHoc.getAll((error, items) => res.send({ error, items }));
    });

    app.get('/api/danh-muc/khoa-sau-dai-hoc/item/:ma', app.permission.check('user:login'), (req, res) => {
        app.model.dmKhoaSauDaiHoc.get({ma: req.params.ma}, (error, item) => res.send({ error, item }));
    });

    app.post('/api/danh-muc/khoa-sau-dai-hoc', app.permission.check('dmKhoaSdh:write'), (req, res) => {
        app.model.dmKhoaSauDaiHoc.create(req.body.item, (error, item) => res.send({ error, item }));
    });

    app.put('/api/danh-muc/khoa-sau-dai-hoc', app.permission.check('dmKhoaSdh:write'), (req, res) => {
        app.model.dmKhoaSauDaiHoc.update({ ma: req.body.ma }, req.body.changes, (error, item) => res.send({ error, item }));
    });

    app.delete('/api/danh-muc/khoa-sau-dai-hoc', app.permission.check('dmKhoaSdh:delete'), (req, res) => {
        app.model.dmKhoaSauDaiHoc.delete({ ma: req.body.ma }, errors => res.send({ errors }));
    });
};