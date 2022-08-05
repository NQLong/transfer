
module.exports = app => {
    app.post('/api/dao-tao/danh-sach-mon-mo', app.permission.orCheck('dtDangKyMoMon:write', 'dtDangKyMoMon:manage'), async (req, res) => {
        try {
            let thoiGianMoMon = await app.model.dtThoiGianMoMon.getActive();
            let { loaiHinhDaoTao, bacDaoTao } = req.body;
            thoiGianMoMon = thoiGianMoMon.find(item => item.loaiHinhDaoTao == loaiHinhDaoTao && item.bacDaoTao == bacDaoTao);
            const { hocKy, nam, batDau, ketThuc } = thoiGianMoMon,
                now = new Date().getTime();
            let { data, maNganh } = req.body;
            if (now < batDau || now > ketThuc) {
                throw 'Không thuộc thời gian cho phép thao tác';
            }
            app.model.dtDanhSachMonMo.delete({ maNganh, nam, hocKy });
            for (let index = 0; index < data.length; index++) {
                let item = data[index];
                delete item.id;
                item.nam = nam;
                item.hocKy = hocKy;
                if (item.chuyenNganh) {
                    if (item.chuyenNganh.length == 1) {
                        item.chuyenNganh = JSON.stringify(item.chuyenNganh);
                    }
                    else if (item.chuyenNganh.length && item.monChuyenNganh) {
                        item.chuyenNganh = {};
                        let data = item.monChuyenNganh;
                        ['soTietBuoi', 'soBuoiTuan', 'soLuongDuKien', 'chuyenNganh'].forEach(key => {
                            item[key] = JSON.stringify(data[key]);
                        });
                    } else {
                        item.chuyenNganh = JSON.stringify(item.chuyenNganh);
                    }
                }
                app.model.dtDanhSachMonMo.create(item);
            }
            res.end();
        } catch (error) {
            res.send({ error });
        }
    });

    app.get('/api/dao-tao/danh-sach-mon-mo/current', app.permission.orCheck('dtDangKyMoMon:write', 'dtDangKyMoMon:manage'), async (req, res) => {
        try {
            let thoiGianMoMon = await app.model.dtThoiGianMoMon.getActive(),
                idDangKyMoMon = req.query.id,
                user = req.session.user,
                permissions = user.permissions;
            const dangKyMoMon = await app.model.dtDangKyMoMon.get({ id: idDangKyMoMon });
            let { loaiHinhDaoTao, bacDaoTao } = dangKyMoMon;
            let currentThoiGianMoMon = thoiGianMoMon.find(item => item.loaiHinhDaoTao == loaiHinhDaoTao && item.bacDaoTao == bacDaoTao);
            let listLoaiHinhDaoTao = permissions.filter(item => item.includes('quanLyDaoTao')).map(item => item.split(':')[1]);

            if (!listLoaiHinhDaoTao.includes('manager') && permissions.includes('dtDangKyMoMon:read')) {
                if (!listLoaiHinhDaoTao.includes(loaiHinhDaoTao)) throw 'No permission!';
            }
            if (!currentThoiGianMoMon || currentThoiGianMoMon.loaiHinhDaoTao != loaiHinhDaoTao) throw 'Hệ đào tạo không có thời gian đăng ký mở môn';
            const listChuyenNganh = await app.model.dtDanhSachChuyenNganh.getAll({ nganh: dangKyMoMon.maNganh, namHoc: currentThoiGianMoMon.nam }),
                chuyenNganhMapper = {};
            listChuyenNganh.forEach(item => chuyenNganhMapper[item.id] = item.ten);
            const condition = { ...currentThoiGianMoMon, idDangKyMoMon };
            const item = await app.model.dtDanhSachMonMo.getCurrent(app.stringify(condition));
            res.send({
                danhSachMonMo: item.rows.map(row => {
                    ['soTietBuoi', 'soBuoiTuan', 'soLuongDuKien', 'chuyenNganh'].forEach(key => {
                        row[key] = JSON.parse(row[key]);
                    });
                    if (row.chuyenNganh && Array.isArray(row.chuyenNganh)) {
                        if (row.chuyenNganh.length > 1) {
                            row.tenChuyenNganh = row.chuyenNganh.map(item => {
                                item = Array.isArray(item) ? item.map(maNganh => chuyenNganhMapper[maNganh]) : chuyenNganhMapper[item];
                                return item;
                            });
                        } else {
                            row.chuyenNganh = row.chuyenNganh[0];
                            row.tenChuyenNganh = chuyenNganhMapper[row.chuyenNganh];
                        }
                    }
                    return row;
                }), chuongTrinhDaoTao: item.chuongTrinhDaoTao, thoiGianMoMon: currentThoiGianMoMon, thongTinKhoaNganh: item.thongTin[0]
            });
        } catch (error) {
            res.send({ error });
        }
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