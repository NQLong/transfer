module.exports = app => {
    const menu = {
        parentMenu: app.parentMenu.category,
        menus: {
            4085: { title: 'Loại công văn', link: '/user/danh-muc/loai-cong-van' },
        },
    };
    app.permission.add(
        { name: 'dmLoaiCongVan:read', menu },
        { name: 'dmLoaiCongVan:write' },
        { name: 'dmLoaiCongVan:delete' },
        { name: 'dmLoaiCongVan:upload' },
    );

    app.get('/user/danh-muc/loai-cong-van', app.permission.check('dmLoaiCongVan:read'), app.templates.admin);
    //app.get('/user/danh-muc/don-vi/upload', app.permission.check('dmLoaiCongVan:write'), app.templates.admin);

    // APIs ----------------------------------------------------------------------------------------------------------------------------------------
    app.get('/api/danh-muc/loai-cong-van/page/:pageNumber/:pageSize', (req, res) => {
        const pageNumber = parseInt(req.params.pageNumber),
            pageSize = parseInt(req.params.pageSize);
        let condition = { statement: null };
        const statement = ['ten']
            .map(i => `lower(${i}) LIKE :searchText`).join(' OR ');
        if (req.query.condition) {
            condition = {
                statement,
                parameter: { searchText: `%${req.query.condition.toLowerCase()}%` },
            };
        }
        app.model.dmLoaiCongVan.getPage(pageNumber, pageSize, condition, (error, page) => {
            res.send({ error, page });
        });
    });

    app.get('/api/danh-muc/loai-cong-van/all', app.permission.check('user:login'), (req, res) => {
        app.model.dmLoaiCongVan.getAll((error, items) => res.send({ error, items }));
    });

    app.get('/api/danh-muc/loai-cong-van/item/:id', app.permission.check('user:login'), (req, res) => {
        app.model.dmLoaiCongVan.get({ id: req.params.id }, (error, item) => res.send({ error, item }));
    });

    app.post('/api/danh-muc/loai-cong-van', app.permission.check('dmLoaiCongVan:write'), (req, res) => {
        let data = req.body.item;
        let postData = {
            ten: data.ten,
            tenVietTat: data.tenVietTat,
            kichHoat: data.kichHoat
        };
        app.model.dmLoaiCongVan.create(postData, (error, item) => { res.send({ error, item });});
    });

    app.put('/api/danh-muc/loai-cong-van', app.permission.check('dmLoaiCongVan:write'), (req, res) => {
        const { ten, tenVietTat, kichHoat } = req.body.changes;
        let putData = {
            kichHoat: parseInt(kichHoat)
        };
        if (ten) putData.ten = ten;
        if (tenVietTat) putData.tenVietTat = tenVietTat;

        app.model.dmLoaiCongVan.update({ id: req.body.id }, putData, (error, items) => {
            res.send({ error, items }); 
        });
    });

    app.delete('/api/danh-muc/loai-cong-van', app.permission.check('dmLoaiCongVan:delete'), (req, res) => {
        app.model.dmLoaiCongVan.delete({ id: req.body.id }, error => res.send({ error }));
    });
};
