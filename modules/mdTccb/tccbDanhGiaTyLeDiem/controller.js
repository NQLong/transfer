module.exports = app => {
    // APIs -----------------------------------------------------------------------------------------------------------------------------------------
    // app.get('/api/tccb/danh-gia/ty-le-diem/page/:pageNumber/:pageSize', app.permission.check('tccbDanhGiaNam:manage'), (req, res) => {
    //     const pageNumber = parseInt(req.params.pageNumber),
    //         pageSize = parseInt(req.params.pageSize),
    //         condition = req.query.condition || {};
    //     app.model.tccbTyLeDiem.getPage(pageNumber, pageSize, condition, (error, page) => res.send({ error, page }));
    // });

    app.get('/api/tccb/danh-gia/ty-le-diem/all', app.permission.check('tccbDanhGiaNam:manage'), async (req, res) => {
        try {
            const condition = req.query.condition || {};
            let items = await app.model.tccbTyLeDiem.getAll(condition, '*', 'id');
            const dmChucVu = await app.model.dmChucVu.getAll();
            items = items.map(item => {
                const maChucVus = item.maChucVu.split(',');
                const tenChucVu = dmChucVu.filter(chucVu => maChucVus.includes(chucVu.ma)).map(chucVu => chucVu.ten).join('; ');
                return {
                    ...item,
                    tenChucVu
                };
            });
            res.send({ items });
        } catch (error) {
            res.send({ error });
        }
    });

    app.get('/api/tccb/danh-gia/ty-le-diem/item/:id', app.permission.check('tccbDanhGiaNam:manage'), (req, res) => {
        app.model.tccbTyLeDiem.get({ id: req.params.id }, (error, item) => res.send({ error, item }));
    });

    app.post('/api/tccb/danh-gia/ty-le-diem', app.permission.check('tccbDanhGiaNam:write'), (req, res) => {
        const newItem = req.body.item;
        app.model.tccbTyLeDiem.create(newItem, (error, item) => {
            res.send({ error, item });
        });
    });

    app.put('/api/tccb/danh-gia/ty-le-diem', app.permission.check('tccbDanhGiaNam:write'), (req, res) => {
        app.model.tccbTyLeDiem.update({ id: req.body.id }, req.body.changes, (error, item) => res.send({ error, item }));
    });

    app.delete('/api/tccb/danh-gia/ty-le-diem', app.permission.check('tccbDanhGiaNam:delete'), (req, res) => {
        app.model.tccbTyLeDiem.delete({ id: req.body.id }, error => res.send({ error }));
    });
};