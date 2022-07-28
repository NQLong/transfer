module.exports = app => {
    const menu = {
        parentMenu: app.parentMenu.category,
        menus: {
            4105: { title: 'Môn học Sau đại học', link: '/user/danh-muc/mon-hoc-sdh' },
        },
    };
    app.permission.add(
        { name: 'dmMonHocSdh:read', menu },
        { name: 'dmMonHocSdh:write' },
        { name: 'dmMonHocSdh:delete' },
    );
    app.get('/user/danh-muc/mon-hoc-sdh', app.permission.check('dmMonHocSdh:read'), app.templates.admin);

    // APIs -----------------------------------------------------------------------------------------------------------------------------------------
    app.get('/api/danh-muc/mon-hoc-sdh/page/:pageNumber/:pageSize', app.permission.check('user:login'), (req, res) => {
        const pageNumber = parseInt(req.params.pageNumber),
            pageSize = parseInt(req.params.pageSize);
        let condition = { statement: null };
        if (req.query.condition) {
            condition = {
                statement: 'lower(tenTiengViet) LIKE :searchText',
                parameter: { searchText: `%${req.query.condition.toLowerCase()}%` },
            };
            if (req.query.kichHoat) {
                condition.statement += ' AND kichHoat = :kichHoat';
                condition.parameter.kichHoat = req.query.kichHoat;
            }
            if (req.query.maKhoaSdh) {
                condition.statement += ' AND maKhoa = :maKhoa';
                condition.parameter.maKhoa = req.query.maKhoaSdh;
            }
        } else if (req.query.kichHoat) {
            condition = {
                statement: 'kichHoat = :kichHoat',
                parameter: { kichHoat: req.query.kichHoat }
            };
            if (req.query.maKhoaSdh) {
                condition.statement += ' AND khoaSdh = :maKhoa';
                condition.parameter.maKhoa = req.query.maKhoaSdh;
            }
        } else if (req.query.maKhoaSdh) {
            condition = {
                khoaSdh: req.query.maKhoaSdh
            };
        }

        app.model.dmMonHocSdh.getPage(pageNumber, pageSize, condition, (error, page) => res.send({ error, page }));
    });

    app.get('/api/danh-muc/mon-hoc-sdh/all', app.permission.check('user:login'), (req, res) => {
        app.model.dmMonHocSdh.getAll((error, items) => res.send({ error, items }));
    });

    app.get('/api/danh-muc/mon-hoc-sdh/item/:ma', app.permission.check('user:login'), (req, res) => {
        app.model.dmMonHocSdh.get({maNganh: req.params.ma}, (error, item) => res.send({ error, item }));
    });

    app.post('/api/danh-muc/mon-hoc-sdh', app.permission.check('dmMonHocSdh:write'), (req, res) => {
        app.model.dmMonHocSdh.create(req.body.item, (error, item) => res.send({ error, item }));
    });

    app.put('/api/danh-muc/mon-hoc-sdh', app.permission.check('dmMonHocSdh:write'), (req, res) => {
        app.model.dmMonHocSdh.update({ maNganh: req.body.ma }, req.body.changes, (error, item) => res.send({ error, item }));
    });

    app.delete('/api/danh-muc/mon-hoc-sdh', app.permission.check('dmMonHocSdh:delete'), (req, res) => {
        app.model.dmMonHocSdh.delete({ maNganh: req.body.ma }, errors => res.send({ errors }));
    });
};