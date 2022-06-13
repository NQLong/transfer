
module.exports = app => {
    app.post('/api/dao-tao/danh-sach-mon-mo', app.permission.orCheck('dtDangKyMoMon:write', 'dtDangKyMoMon:manage'), async (req, res) => {
        let thoiGianMoMon = await app.model.dtThoiGianMoMon.getActive(),
            { hocKy, nam, batDau, ketThuc } = thoiGianMoMon,
            now = new Date().getTime();
        let { data, maNganh } = req.body;
        if (now < batDau || now > ketThuc) {
            res.send({ error: 'Không thuộc thời gian cho phép thao tác' });
            return;
        }
        const create = (index = 0) => {
            if (index == data.length) {
                res.send('Done');
            } else {
                delete data[index].id;
                data[index].nam = nam;
                data[index].hocKy = hocKy;
                app.model.dtDanhSachMonMo.create(data[index], (error, item1) => {
                    if (error || !item1) res.send({ error });
                    else create(index + 1);
                });
            }
        };
        app.model.dtDanhSachMonMo.delete({ maNganh, nam, hocKy }, (error) => {
            if (error) res.send({ error });
            else {
                create();
            }
        });
    });

    app.get('/api/dao-tao/danh-sach-mon-mo/current', app.permission.orCheck('dtDangKyMoMon:read', 'dtDangKyMoMon:manage'), async (req, res) => {
        let thoiGianMoMon = await app.model.dtThoiGianMoMon.getActive(),
            idDangKyMoMon = req.query.id;
        const condition = { ...thoiGianMoMon, idDangKyMoMon };
        app.model.dtDanhSachMonMo.getCurrent(app.stringify(condition), (error, item) => {
            // res.send({ error, item });
            res.send({ error, danhSachMonMo: item.rows, chuongTrinhDaoTao: item.chuongTrinhDaoTao, thoiGianMoMon, thongTinKhoaNganh: item.thongTin[0] });
        });
    });

    app.post('/api/dao-tao/danh-sach-mon-mo/current', app.permission.orCheck('dtDangKyMoMon:write', 'dtDangKyMoMon:manage'), async (req, res) => {
        const data = req.body.data,
            thoiGianMoMon = await app.model.dtThoiGianMoMon.getActive(),
            now = new Date().getTime();
        let { batDau, ketThuc, hocKy, nam } = thoiGianMoMon;
        if (now < batDau || now > ketThuc) {
            res.send({ error: 'Không thuộc thời gian cho phép thao tác' });
        }
        else app.model.dtDanhSachMonMo.create({ ...data, hocKy, nam }, (error, item) => {
            res.send({ error, item });
        });
    });

    app.delete('/api/dao-tao/danh-sach-mon-mo/current', app.permission.orCheck('dtDangKyMoMon:delete', 'dtDangKyMoMon:manage'), async (req, res) => {
        const id = req.body.id,
            thoiGianMoMon = await app.model.dtThoiGianMoMon.getActive(),
            now = new Date().getTime();
        let { batDau, ketThuc } = thoiGianMoMon;
        if (now < batDau || now > ketThuc) {
            res.send({ error: 'Không thuộc thời gian cho phép thao tác' });
        }
        else app.model.dtDanhSachMonMo.delete({ id }, (error, item) => {
            res.send({ error, item });
        });
    });

};