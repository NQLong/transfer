module.exports = app => {
    const menu = {
        parentMenu: app.parentMenu.category,
        menus: {
            2400: { title: 'Khen thưởng loại đối tượng', link: '/user/danh-muc/khen-thuong-loai-doi-tuong' },
        },
    };
    app.permission.add(
        { name: 'dmKhenThuongLoaiDoiTuong:read', menu },
        { name: 'dmKhenThuongLoaiDoiTuong:write' },
        { name: 'dmKhenThuongLoaiDoiTuong:delete' },
    );
    app.get('/user/danh-muc/khen-thuong-loai-doi-tuong', app.permission.check('dmKhenThuongLoaiDoiTuong:read'), app.templates.admin);
    app.get('/user/danh-muc/khen-thuong-loai-doi-tuong/upload', app.permission.check('staff:login'), app.templates.admin);

    // APIs -----------------------------------------------------------------------------------------------------------------------------------------
    app.get('/api/danh-muc/khen-thuong-loai-doi-tuong/page/:pageNumber/:pageSize', app.permission.check('user:login'), (req, res) => {
        let pageNumber = parseInt(req.params.pageNumber),
            pageSize = parseInt(req.params.pageSize),
            condition = { statement: null };
        if (req.query.condition) {
            condition = {
                statement: 'lower(ma) LIKE :searchText OR lower(ten) LIKE :searchText',
                parameter: { searchText: `%${req.query.condition.toLowerCase()}%` },
            };
        }
        app.model.dmKhenThuongLoaiDoiTuong.getPage(pageNumber, pageSize, condition, (error, page) => res.send({ error, page }));
    });

    app.get('/api/danh-muc/khen-thuong-loai-doi-tuong/all', app.permission.check('user:login'), (req, res) => {
        const condition = req.query.condition || {};
        app.model.dmKhenThuongLoaiDoiTuong.getAll(condition, (error, items) => res.send({ error, items }));
    });

    app.post('/api/danh-muc/khen-thuong-loai-doi-tuong', app.permission.check('dmKhenThuongLoaiDoiTuong:write'), (req, res) => {
        let newData = req.body.item;
        app.model.dmKhenThuongLoaiDoiTuong.create(newData, (error, item) => res.send({ error, item }));
    });

    app.put('/api/danh-muc/khen-thuong-loai-doi-tuong', app.permission.check('dmKhenThuongLoaiDoiTuong:write'), (req, res) => {
        let changes = app.clone(req.body.changes);
        app.model.dmKhenThuongLoaiDoiTuong.update({ ma: req.body.ma }, changes, (error, items) => res.send({ error, items }));
    });

    app.delete('/api/danh-muc/khen-thuong-loai-doi-tuong', app.permission.check('dmKhenThuongLoaiDoiTuong:delete'), (req, res) => {
        app.model.dmKhenThuongLoaiDoiTuong.delete({ ma: req.body.ma }, error => res.send({ error }));
    });

};