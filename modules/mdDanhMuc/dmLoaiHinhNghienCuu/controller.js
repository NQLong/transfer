module.exports = app => {
    const menu = {
        parentMenu: app.parentMenu.category,
        menus: {
            41: { title: 'Loại hình nghiên cứu', link: '/user/danh-muc/loai-hinh-nghien-cuu' },
        },
    };
    app.permission.add(
        { name: 'dmLoaiHinhNghienCuu:read', menu },
        { name: 'dmLoaiHinhNghienCuu:write' },
        { name: 'dmLoaiHinhNghienCuu:delete' },
    );
    app.get('/user/danh-muc/loai-hinh-nghien-cuu', app.permission.check('dmLoaiHinhNghienCuu:read'), app.templates.admin);

    // APIs -----------------------------------------------------------------------------------------------------------------------------------------
    app.get('/api/danh-muc/loai-hinh-nghien-cuu/page/:pageNumber/:pageSize', app.permission.check('user:login'), (req, res) => {
        const pageNumber = parseInt(req.params.pageNumber),
            pageSize = parseInt(req.params.pageSize);
        app.model.dmLoaiHinhNghienCuu.getPage(pageNumber, pageSize, {}, (error, page) => res.send({ error, page }));
    });

    app.get('/api/danh-muc/loai-hinh-nghien-cuu/all', app.permission.check('user:login'), (req, res) => {
        const condition = req.query.condition || {};
        Object.keys(condition).forEach(key => { condition[key] === '' ? condition[key] = null : ''; });
        app.model.dmLoaiHinhNghienCuu.getAll(condition, '*', 'ma', (error, items) => res.send({ error, items }));
    });

    app.get('/api/danh-muc/loai-hinh-nghien-cuu/item/:ma', app.permission.check('user:login'), (req, res) => {
        app.model.dmLoaiHinhNghienCuu.get({ ma: req.params.ma }, '*', 'ma', (error, item) => res.send({ error, item }));
    });

    app.post('/api/danh-muc/loai-hinh-nghien-cuu', app.permission.check('dmLoaiHinhNghienCuu:write'), (req, res) => {
        app.model.dmLoaiHinhNghienCuu.create(req.body.item, (error, item) => res.send({ error, item }));
    });

    app.put('/api/danh-muc/loai-hinh-nghien-cuu', app.permission.check('dmLoaiHinhNghienCuu:write'), (req, res) => {
        app.model.dmLoaiHinhNghienCuu.update({ ma: req.body.ma }, req.body.changes, (error, items) => res.send({ error, items }));
    });

    app.delete('/api/danh-muc/loai-hinh-nghien-cuu', app.permission.check('dmLoaiHinhNghienCuu:delete'), (req, res) => {
        app.model.dmLoaiHinhNghienCuu.delete({ ma: req.body.ma }, errors => res.send({ errors }));
    });
};