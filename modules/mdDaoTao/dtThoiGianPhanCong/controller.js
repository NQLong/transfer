module.exports = app => {

    app.permission.add(
        'dtThoiGianPhanCong:read', 'dtThoiGianPhanCong:write', 'dtThoiGianPhanCong:delete'
    );

    app.post('/api/dao-tao/thoi-gian-phan-cong', app.permission.check('dtThoiGianPhanCong:write'), async (req, res) => {
        let data = req.body.data,
            thoiGianMoMon = await app.model.dtThoiGianMoMon.getActive();
        app.model.dtThoiGianPhanCong.create({ ...data, nam: thoiGianMoMon.nam, hocKy: thoiGianMoMon.hocKy }, (error, item) => res.send({ error, item }));
    });
};