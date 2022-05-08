
module.exports = app => {
    const MA_PDT = 33;
    app.get('/api/dao-tao/danh-sach-mon-mo/all', app.permission.orCheck('dtDangKyMoMon:read', 'dtDangKyMoMon:manage'), async (req, res) => {
        let thoiGianMoMon = await app.model.dtThoiGianMoMon.getActive(),
            yearth = req.query.yearth,
            hocKy = thoiGianMoMon.hocKy + yearth * 2,
            nam = thoiGianMoMon.nam,
            id = req.query.id;
        // khoa = req.session.user.staff ? req.session.user.staff.maDonVi : null;
        let condition = id ? { id } : { nam, hocKy };
        app.model.dtDangKyMoMon.get(condition, (error, dotDangKy) => {
            if (error) {
                res.send({ error });
                return;
            } else {
                let thoiGianDangKy = dotDangKy.thoiGian || null;
                let year = thoiGianMoMon.nam - yearth,
                    semester = thoiGianMoMon.hocKy + yearth * 2;
                app.model.dtCauTrucKhungDaoTao.get({ namDaoTao: year }, (error, cauTrucKhung) => {
                    if (error) {
                        res.send({ error: `Lỗi lấy dữ liệu năm ${year}` });
                        return;
                    } else if (!cauTrucKhung) {
                        res.send({ warning: `Chưa có dữ liệu năm ${year}`, item: { dotDangKy, thoiGianMoMon, items: [], ctdt: [] } });
                        // return;
                    }
                    app.model.dtKhungDaoTao.get({ namDaoTao: cauTrucKhung.id, maNganh: dotDangKy.maNganh }, (error, item) => {
                        if (error) {
                            res.send({ error: `Lỗi lấy CTDT năm ${year}` }); return;
                        } else if (!item && cauTrucKhung) {
                            res.send({ warning: `Năm ${year} không tồn tại CTDT nào!`, item: { items: [], ctdt: [], dotDangKy, thoiGianMoMon } }); return;
                        } else {
                            app.model.dtDanhSachMonMo.getAll({ maDangKy: id, hocKy }, (error, items) => {
                                if (error) { res.send({ error }); return; } else {
                                    if (!items.length) {
                                        let condition = {
                                            statement: 'maKhungDaoTao = (:id) AND hocKyDuKien = (:semester)',
                                            parameter: { id: item.id, semester }
                                        };
                                        !thoiGianDangKy && app.model.dtChuongTrinhDaoTao.getAll(condition, (error, items) => {
                                            if (error) {
                                                res.send({ error });
                                                return;
                                            } else {
                                                res.send({ item: app.clone({}, { items: items.filter(item => item.khoa != MA_PDT), ctdt: item, thoiGianMoMon, dotDangKy }) });
                                            }
                                        });
                                    }
                                    else res.send({ item: { items, ctdt: item, dotDangKy, thoiGianMoMon } });
                                }
                            });
                        }
                    });
                });

            }
        });

    });

    app.post('/api/dao-tao/danh-sach-mon-mo', app.permission.orCheck('dtDangKyMoMon:write', 'dtDangKyMoMon:manage'), async (req, res) => {
        let thoiGianMoMon = await app.model.dtThoiGianMoMon.getActive(),
            hocKy = thoiGianMoMon.hocKy,
            nam = thoiGianMoMon.nam;
        let data = req.body.data;
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
        create();
    });

    app.get('/api/dao-tao/danh-sach-mon-mo/get-current', app.permission.orCheck('dtDangKyMoMon:read', 'dtDangKyMoMon:manage'), async (req, res) => {
        let thoiGianMoMon = await app.model.dtThoiGianMoMon.getActive(),
            idDangKyMoMon = req.query.id;
        const condition = { ...thoiGianMoMon, idDangKyMoMon };
        app.model.dtDanhSachMonMo.getCurrent(app.stringify(condition), (error, item) => {
            // res.send({ error, item });
            res.send({ error, danhSachMonMo: item.rows, chuongTrinhDaoTao: item.chuongTrinhDaoTao, thoiGianMoMon, thongTinKhoaNganh: item.thongTin[0] });
        });
    });

    app.post('/api/dao-tao/danh-sach-mon-mo/create-current', app.permission.orCheck('dtDangKyMoMon:write', 'dtDangKyMoMon:manage'), async (req, res) => {
        const data = req.body.data,
            thoiGianMoMon = await app.model.dtThoiGianMoMon.getActive(),
            now = new Date().getTime();
        let { batDau, ketThuc, hocKy, nam } = thoiGianMoMon;
        if (now < batDau || now > ketThuc) {
            res.send({ error: 'Không thuộc thời gian cho phép thao tác' });
        }
        else app.model.dtDanhSachMonMo.create({ ...data, hocKy, nam }, (error, item) => {
            res.send({ error, item: { ...item, khoaSinhVien: data.khoaSinhVien } });
        });
    });

    app.delete('/api/dao-tao/danh-sach-mon-mo/current', app.permission.orCheck('dtDangKyMoMon:delete', 'dtDangKyMoMon:manage'), async (req, res) => {
        const id = req.body.id,
            thoiGianMoMon = await app.model.dtThoiGianMoMon.getActive(),
            now = new Date().getTime();
        let { batDau, ketThuc } = thoiGianMoMon;
        console.log(id);
        if (now < batDau || now > ketThuc) {
            res.send({ error: 'Không thuộc thời gian cho phép thao tác' });
        }
        else app.model.dtDanhSachMonMo.delete({ id }, (error, item) => {
            res.send({ error, item });
        });
    });

};