module.exports = app => {
    const menu = {
        parentMenu: app.parentMenu.category,
        menus: {
            4086: { title: 'Loại doanh nghiệp', link: '/user/dm-loai-doanh-nghiep' },
        },
    };
    app.permission.add(
        { name: 'dmLoaiDoanhNghiep:read', menu },
        { name: 'dmLoaiDoanhNghiep:write' },
        { name: 'dmLoaiDoanhNghiep:delete' },
    );

    app.get('/user/dm-loai-doanh-nghiep', app.permission.check('dmLoaiDoanhNghiep:read'), app.templates.admin);

    // APIs ----------------------------------------------------------------------------------------------------------------------------------------
    app.get('/api/dm-loai-doanh-nghiep/page/:pageNumber/:pageSize', app.permission.check('user:login'), (req, res) => {
        const pageNumber = parseInt(req.params.pageNumber),
            pageSize = parseInt(req.params.pageSize);
        app.model.dmLoaiDoanhNghiep.getPage(pageNumber, pageSize, {}, (error, page) => res.send({ error, page }));
    });

    app.get('/api/dm-loai-doanh-nghiep/all', app.permission.check('user:login'), (req, res) => {
        app.model.dmLoaiDoanhNghiep.getAll({}, '*', 'id', (error, items) => res.send({ error, items }));
    });

    app.get('/api/dm-loai-doanh-nghiep/item/:id', app.permission.check('user:login'), (req, res) => {
        app.model.dmLoaiDoanhNghiep.get({ id: req.params.id }, (error, item) => res.send({ error, item }));
    });

    app.post('/api/dm-loai-doanh-nghiep', app.permission.check('dmLoaiDoanhNghiep:write'), (req, res) => {
        app.model.dmLoaiDoanhNghiep.create(req.body.item, (error, item) => res.send({ error, item }));
    });

    app.put('/api/dm-loai-doanh-nghiep', app.permission.check('dmLoaiDoanhNghiep:write'), (req, res) => {
        app.model.dmLoaiDoanhNghiep.update({ id: req.body.id }, req.body.changes, (error, items) => res.send({ error, items }));
    });

    app.delete('/api/dm-loai-doanh-nghiep', app.permission.check('dmLoaiDoanhNghiep:delete'), (req, res) => {
        app.model.dmLoaiDoanhNghiep.delete({ id: req.body.id }, error => res.send({ error }));
    });
};