module.exports = app => {
    app.permission.add(
        { name: 'dmChuongTrinh:read' },
        { name: 'dmChuongTrinh:write' },
        { name: 'dmChuongTrinh:delete' },
    );
    // APIs -----------------------------------------------------------------------------------------------------------------------------------------
    app.get('/api/danh-muc/khcn-chuong-trinh', app.permission.check('dmChuongTrinh:read'), (req, res) => {
        app.model.dmKhcnChuongTrinh.getAll((error, items) => {
            res.send({ error, items });
        });
        
    });
    app.get('/api/danh-muc/khcn-chuong-trinh/:ma', app.permission.check('dmChuongTrinh:read'), (req, res) => {
        app.model.dmKhcnChuongTrinh.get({ ma: req.params.ma }, (error, item) => res.send({ error, item }));
    });
};