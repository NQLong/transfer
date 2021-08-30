module.exports = app => {
    app.permission.add(
        { name: 'dmDonViChuQuan:read' },
        { name: 'dmDonViChuQuan:write' },
        { name: 'dmDonViChuQuan:delete' },
    );
    // APIs -----------------------------------------------------------------------------------------------------------------------------------------
    app.get('/api/danh-muc/khcn-don-vi-chu-quan', app.permission.check('dmDonViChuQuan:read'), (req, res) => {
        app.model.dmKhcnDonViChuQuan.getAll((error, items) => {
            res.send({ error, items })
        });
        
    });
};