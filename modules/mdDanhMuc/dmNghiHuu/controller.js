module.exports = app => {
    app.get('/api/danh-muc/nghi-huu/get-nghi-huu', app.permission.check('user:login'), (req, res) => {
        const data = {
            phai: req.query.phai,
            ngaySinh: new Date(parseInt(req.query.ngaySinh)),
        };
        app.model.dmNghiHuu.getTuoiNghiHuu(data, (error, item) => res.send({ error, item }));
    });
};