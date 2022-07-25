module.exports = app => {
    const menu = {
        parentMenu: app.parentMenu.category,
        menus: {
            4104: { title: 'Ngành Sau đại học', link: '/user/danh-muc/nganh-sau-dai-hoc' },
        },
    };
    app.permission.add(
        { name: 'dmNganhSdh:read', menu },
        { name: 'dmNganhSdh:write' },
        { name: 'dmNganhSdh:delete' },
    );
    app.get('/user/danh-muc/nganh-sau-dai-hoc', app.permission.check('dmNganhSdh:read'), app.templates.admin);

    // APIs -----------------------------------------------------------------------------------------------------------------------------------------
    app.get('/api/danh-muc/nganh-sau-dai-hoc/page/:pageNumber/:pageSize', app.permission.check('user:login'), (req, res) => {
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
                condition.statement += ' AND maKhoa = :maKhoa';
                condition.parameter.maKhoa = req.query.maKhoaSdh;
            }
        } else if (req.query.maKhoaSdh) {
            condition = {
                maKhoa: req.query.maKhoaSdh
            };
        }

        app.model.dmNganhSauDaiHoc.getPage(pageNumber, pageSize, condition, (error, page) => res.send({ error, page }));
    });

    app.get('/api/danh-muc/nganh-sau-dai-hoc/all', app.permission.check('user:login'), (req, res) => {
        app.model.dmNganhSauDaiHoc.getAll((error, items) => res.send({ error, items }));
    });

    app.get('/api/danh-muc/nganh-sau-dai-hoc/item/:ma', app.permission.check('user:login'), (req, res) => {
        app.model.dmNganhSauDaiHoc.get({maNganh: req.params.ma}, (error, item) => res.send({ error, item }));
    });

    app.post('/api/danh-muc/nganh-sau-dai-hoc', app.permission.check('dmNganhSdh:write'), (req, res) => {
        app.model.dmNganhSauDaiHoc.create(req.body.item, (error, item) => res.send({ error, item }));
    });

    app.put('/api/danh-muc/nganh-sau-dai-hoc', app.permission.check('dmNganhSdh:write'), (req, res) => {
        app.model.dmNganhSauDaiHoc.update({ maNganh: req.body.ma }, req.body.changes, (error, item) => res.send({ error, item }));
    });

    app.delete('/api/danh-muc/nganh-sau-dai-hoc', app.permission.check('dmNganhSdh:delete'), (req, res) => {
        app.model.dmNganhSauDaiHoc.delete({ maNganh: req.body.ma }, errors => res.send({ errors }));
    });
};