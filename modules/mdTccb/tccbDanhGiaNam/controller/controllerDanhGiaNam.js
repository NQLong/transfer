module.exports = app => {
    const menu = {
        parentMenu: app.parentMenu.tccb,
        menus: {
            3034: { title: 'Đánh giá', link: '/user/tccb/danh-gia', icon: 'fa-user-times', backgroundColor: '#2a99b8', groupIndex: 6 }
        }
    };
    app.permission.add(
        { name: 'tccbDanhGiaNam:read', menu },
        { name: 'tccbDanhGiaNam:write' },
        { name: 'tccbDanhGiaNam:delete' }
    );
    app.get('/user/tccb/danh-gia', app.permission.check('tccbDanhGiaNam:read'), app.templates.admin);
    app.get('/user/tccb/danh-gia/:nam', app.permission.check('tccbDanhGiaNam:read'), app.templates.admin);

    // APIs -----------------------------------------------------------------------------------------------------------------------------------------
    app.get('/api/tccb/danh-gia/page/:pageNumber/:pageSize', app.permission.check('user:login'), (req, res) => {
        const pageNumber = parseInt(req.params.pageNumber),
            pageSize = parseInt(req.params.pageSize),
            condition = req.query.condition || {};
        app.model.tccbDanhGiaNam.getPage(pageNumber, pageSize, condition, (error, page) => res.send({ error, page }));
    });

    app.get('/api/tccb/danh-gia/all', app.permission.check('user:login'), (req, res) => {
        app.model.tccbDanhGiaNam.getAll({}, '*', 'id', (error, items) => res.send({ error, items }));
    });

    app.get('/api/tccb/danh-gia/item/:id', app.permission.check('user:login'), (req, res) => {
        app.model.tccbDanhGiaNam.get({ id: req.params.id }, (error, item) => res.send({ error, item }));
    });

    app.post('/api/tccb/danh-gia', app.permission.check('tccbDanhGiaNam:write'), (req, res) => {
        const newItem = req.body.item;
        app.model.tccbDanhGiaNam.get({ nam: Number(newItem.nam) }, (error, item) => {
            if (!error && item) res.send({ error: 'Năm đánh giá đã tồn tại' });
            else app.model.tccbDanhGiaNam.create(newItem, (error, item) => {
                res.send({ error, item });
            });
        });
    });

    app.put('/api/tccb/danh-gia', app.permission.check('tccbDanhGiaNam:write'), (req, res) => {
        app.model.tccbDanhGiaNam.update({ id: req.body.id }, req.body.changes, (error, item) => res.send({ error, item }));
    });

    app.delete('/api/tccb/danh-gia', app.permission.check('tccbDanhGiaNam:delete'), (req, res) => {
        app.model.tccbDanhGiaNam.get({ id: req.body.id }, (error, item) => {
            app.model.tccbKhungDanhGiaCanBo.delete({ nam: Number(item.nam) }, error => {
                if (!error) app.model.tccbDanhGiaNam.delete({ id: req.body.id }, error => res.send({ error }));
                else res.send({ error });
            });
        });
    });

    app.post('/api/tccb/danh-gia/clone', app.permission.check('tccbDanhGiaNam:write'), (req, res) => {
        const id = req.body.id,
            newItem = req.body.newItem;
        const cloneKhungDanhGiaCanBo = (index, list) => {
            if (index == list.length) {
                app.model.tccbDanhGiaNam.create(newItem, (error, item) => {
                    res.send({ error, item });
                });
            }
            else {
                app.model.tccbKhungDanhGiaCanBo.create({ ...list[index] }, () => {
                    cloneKhungDanhGiaCanBo(index + 1, list);
                });
            }
        };
        app.model.tccbDanhGiaNam.get({ nam: Number(newItem.nam) }, (error, item) => {
            if (!error && item) res.send({ error: 'Năm đánh giá đã tồn tại' });
            else app.model.tccbDanhGiaNam.get({ id }, (error, item) => {
                app.model.tccbKhungDanhGiaCanBo.getAll({ nam: item.nam }, (error, itemsCanBo) => {
                    const cloneCanBo = itemsCanBo.map(canBo => { 
                        delete canBo.id;
                        return { ...canBo, nam: Number(newItem.nam) }; 
                    });
                    cloneKhungDanhGiaCanBo(0, cloneCanBo);
                });
            });
        });
    });
};