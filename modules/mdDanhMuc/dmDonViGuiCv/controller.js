module.exports = app => {
    const menu = {
        parentMenu: app.parentMenu.category,
        menus: {
            4084: { title: 'Đơn vị gửi công văn', link: '/user/danh-muc/don-vi-gui-cong-van' },
        },
    };
    app.permission.add(
        { name: 'dmDonViGuiCv:read', menu },
        { name: 'dmDonViGuiCv:write' },
        { name: 'dmDonViGuiCv:delete' },
        { name: 'dmDonViGuiCv:upload' },
    );

    app.get('/user/danh-muc/don-vi-gui-cong-van', app.permission.check('dmDonViGuiCv:read'), app.templates.admin);
    //app.get('/user/danh-muc/don-vi/upload', app.permission.check('dmDonViGuiCv:write'), app.templates.admin);

    // APIs ----------------------------------------------------------------------------------------------------------------------------------------
    app.get('/api/danh-muc/don-vi-gui-cong-van/page/:pageNumber/:pageSize', (req, res) => {
        const pageNumber = parseInt(req.params.pageNumber),
            pageSize = parseInt(req.params.pageSize);
        let condition = { statement: null };
        let statement = ['ten']
            .map(i => `lower(${i}) LIKE :searchText`).join(' OR ');

        statement += ' AND KICH_HOAT = 1';
        if (req.query.condition) {
            condition = {
                statement,
                parameter: { searchText: `%${req.query.condition.toLowerCase()}%` },
            };
        }
        app.model.dmDonViGuiCv.getPage(pageNumber, pageSize, condition, (error, page) => {
            res.send({ error, page });
        });
    });

    app.get('/api/danh-muc/don-vi-gui-cong-van/all', app.permission.check('user:login'), (req, res) => {
        app.model.dmDonViGuiCv.getAll((error, items) => res.send({ error, items }));
    });

    app.get('/api/danh-muc/don-vi-gui-cong-van/item/:id', app.permission.check('user:login'), (req, res) => {
        app.model.dmDonViGuiCv.get({ id: req.params.id }, (error, item) => res.send({ error, item }));
    });

    app.post('/api/danh-muc/don-vi-gui-cong-van', app.permission.check('dmDonViGuiCv:write'), (req, res) => {
        let data = req.body.item;
        let postData = {
            ten: data.ten,
            kichHoat: data.kichHoat
        };
        app.model.dmDonViGuiCv.create(postData, (error, item) => { res.send({ error, item });});
    });

    app.put('/api/danh-muc/don-vi-gui-cong-van', app.permission.check('dmDonViGuiCv:write'), (req, res) => {
        const { id, ten, kichHoat } = req.body.changes;
        let putData = {
            kichHoat
        };
        if (ten) putData.ten = ten;
        app.model.dmDonViGuiCv.update({ id }, putData, (error, items) => { res.send({ error, items }); });
    });

    app.delete('/api/danh-muc/don-vi-gui-cong-van', app.permission.check('dmDonViGuiCv:delete'), (req, res) => {
        app.model.dmDonViGuiCv.delete({ id: req.body.id }, error => res.send({ error }));
    });
};