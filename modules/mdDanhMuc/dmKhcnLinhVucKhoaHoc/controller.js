module.exports = app => {
    app.permission.add(
        { name: 'dmLinhVucKhoaHoc:read' },
        { name: 'dmLinhVucKhoaHoc:write' },
        { name: 'dmLinhVucKhoaHoc:delete' },
    );
    // APIs -----------------------------------------------------------------------------------------------------------------------------------------
    app.get('/api/danh-muc/khcn-linh-vuc-khoa-hoc', app.permission.check('dmLinhVucKhoaHoc:read'), (req, res) => {
        app.model.dmKhcnLinhVucKhoaHoc.getAll((error, items) => {
            res.send({ error, items })
        });
        
    });
    app.get('/api/danh-muc/khcn-linh-vuc-khoa-hoc/:ma', app.permission.check('dmLinhVucKhoaHoc:read'), (req, res) => {
        app.model.dmKhcnLinhVucKhoaHoc.get({ ma: req.params.ma }, (error, item) => res.send({ error, item }));
    });
};