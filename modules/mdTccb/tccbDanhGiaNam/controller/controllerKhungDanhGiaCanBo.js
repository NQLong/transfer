module.exports = app => {
    // APIs -----------------------------------------------------------------------------------------------------------------------------------------
    // app.get('/api/tccb/danh-gia/cau-truc-khung-danh-gia-can-bo/page/:pageNumber/:pageSize', app.permission.check('tccbDanhGiaNam:manage'), async (req, res) => {
    //     const pageNumber = parseInt(req.params.pageNumber),
    //         pageSize = parseInt(req.params.pageSize),
    //         condition = req.query.condition || {};
    //     app.model.tccbKhungDanhGiaCanBo.getPage(pageNumber, pageSize, condition, '*', 'THU_TU ASC', (error, page) => res.send({ error, page }));
    // });

    app.get('/api/tccb/danh-gia/cau-truc-khung-danh-gia-can-bo/all', app.permission.check('tccbDanhGiaNam:manage'), (req, res) => {
        const condition = req.query.condition || {};
        app.model.tccbKhungDanhGiaCanBo.getAll(condition, '*', 'THU_TU ASC', (error, items) => res.send({ error, items }));
    });

    app.get('/api/tccb/danh-gia/cau-truc-khung-danh-gia-can-bo/item/:id', app.permission.check('tccbDanhGiaNam:manage'), (req, res) => {
        app.model.tccbKhungDanhGiaCanBo.get({ id: req.params.id }, (error, item) => res.send({ error, item }));
    });

    app.post('/api/tccb/danh-gia/cau-truc-khung-danh-gia-can-bo', app.permission.check('tccbDanhGiaNam:write'), (req, res) => {
        const newItem = req.body.item;
        app.model.tccbKhungDanhGiaCanBo.create(newItem, (error, item) => {
            res.send({ error, item });
        });
    });

    app.put('/api/tccb/danh-gia/cau-truc-khung-danh-gia-can-bo', app.permission.check('tccbDanhGiaNam:write'), (req, res) => {
        app.model.tccbKhungDanhGiaCanBo.update({ id: req.body.id }, req.body.changes, (error, item) => res.send({ error, item }));
    });

    app.delete('/api/tccb/danh-gia/cau-truc-khung-danh-gia-can-bo', app.permission.check('tccbDanhGiaNam:delete'), (req, res) => {
        app.model.tccbKhungDanhGiaCanBo.delete({ id: req.body.id }, error => res.send({ error }));
    });

    app.put('/api/tccb/danh-gia/cau-truc-khung-danh-gia-can-bo/thu-tu', app.permission.check('tccbDanhGiaNam:write'), (req, res) => {
        let id = Number(req.body.id),
            thuTu = Number(req.body.thuTu),
            nam = Number(req.body.nam);
        if (id && thuTu) {
            app.model.tccbKhungDanhGiaCanBo.get({ id }, (error, item) => {
                if (item) {
                    const isUp = item.thuTu > thuTu ? 1 : 0;
                    app.model.tccbKhungDanhGiaCanBo.updateThuTu(id, thuTu, isUp, nam, error => res.send({ error }));
                } else {
                    res.send({ error });
                }
            });
        } else {
            res.send({ error: 'Invalid parameters!' });
        }
    });
};