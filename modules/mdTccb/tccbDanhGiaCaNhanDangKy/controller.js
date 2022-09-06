module.exports = app => {
    const menu = {
        parentMenu: app.parentMenu.tccb,
        menus: {
            3038: { title: 'Cá nhân đăng ký', link: '/user/tccb/ca-nhan-dang-ky', icon: 'fa-pencil', backgroundColor: '#2a99b8', groupIndex: 6 }
        }
    };
    app.permission.add(
        { name: 'staff:login', menu },
    );
    app.get('/user/tccb/ca-nhan-dang-ky', app.permission.check('staff:login'), app.templates.admin);
    app.get('/user/tccb/ca-nhan-dang-ky/:nam', app.permission.check('staff:login'), app.templates.admin);

    app.get('/api/tccb/danh-gia/ca-nhan-dang-ky/danh-gia-nam/all', app.permission.check('staff:login'), (req, res) => {
        app.model.tccbDanhGiaNam.getAll({}, '*', 'nam DESC', (error, items) => res.send({ error, items }));
    });

    const checkDangKyHopLe = async (shcc, idNhom) => {
        const canBo = await app.model.canBo.get({ shcc });
        const condition = {
            statement: '',
            parameter: {}
        };
        let isNgach = false;
        if (canBo.ngach) {
            condition.statement += 'maChucDanh LIKE :ngach';
            condition.parameter.ngach = `%${canBo.ngach}%`;
            isNgach = true;
        }
        if (canBo.chucDanh) {
            if (isNgach) {
                condition.statement += ' OR maChucDanh LIKE :chucDanh OR maChucDanh LIKE :chucDanhStart';
            } else {
                condition.statement += 'maChucDanh LIKE :chucDanh OR maChucDanh LIKE :chucDanhStart';
            }
            condition.parameter.chucDanh = `%,${canBo.chucDanh}%`;
            condition.parameter.chucDanhStart = `${canBo.chucDanh}%`;
        }
        condition.statement = `(${condition.statement}) AND idNhom = :idNhom`;
        condition.parameter.idNhom = idNhom;
        let item = await app.model.tccbDinhMucCongViecGvVaNcv.get(condition);
        return item ? true : false;
    };

    app.get('/api/tccb/danh-gia/ca-nhan-dang-ky/all-by-year', app.permission.check('staff:login'), async (req, res) => {
        try {
            const nam = parseInt(req.query.nam), shcc = req.session.user.shcc;
            const canBo = await app.model.canBo.get({ shcc });
            if (!canBo.ngach && !canBo.chucDanh) {
                return res.send({ items: [] });
            }
            let listNhom = await app.model.tccbNhomDanhGiaNhiemVu.getAll({ nam, kichHoat: 1 }, '*', 'thuTu ASC');
            const condition = {
                statement: '',
                parameter: {
                    listIdNhom: listNhom.map(item => item.id)
                }
            };
            let isNgach = false;
            if (canBo.ngach) {
                condition.statement += 'maChucDanh LIKE :ngach';
                condition.parameter.ngach = `%${canBo.ngach}%`;
                isNgach = true;
            }
            if (canBo.chucDanh) {
                if (isNgach) {
                    condition.statement += ' OR maChucDanh LIKE :chucDanh OR maChucDanh LIKE :chucDanhStart';
                } else {
                    condition.statement += 'maChucDanh LIKE :chucDanh OR maChucDanh LIKE :chucDanhStart';
                }
                condition.parameter.chucDanh = `%,${canBo.chucDanh}%`;
                condition.parameter.chucDanhStart = `${canBo.chucDanh}%`;
            }
            condition.statement = `(${condition.statement}) AND idNhom IN (:listIdNhom)`;
            let items = await app.model.tccbDinhMucCongViecGvVaNcv.getAll(condition);
            if (items.length == 0) {
                return res.send({ items: [] });
            }
            listNhom = listNhom.filter(nhom => {
                const index = items.findIndex(item => item.idNhom == nhom.id);
                return !(index == -1);
            });
            items = await app.model.tccbDinhMucCongViecGvVaNcv.getAll({ statement: 'idNhom IN (:listIdNhom)', parameter: { listIdNhom: listNhom.map(item => item.id) } }, '*', 'id');
            let [listCaNhanDangKy, listNgach, listChucDanhKhoaHoc] = await Promise.all([
                app.model.tccbDanhGiaCaNhanDangKy.getAll({ statement: 'shcc = :shcc AND idNhomDangKy IN (:listIdNhom)', parameter: { shcc, listIdNhom: listNhom.map(item => item.id) } }, 'id,idNhomDangKy,dangKy'),
                app.model.dmNgachCdnn.getAll(),
                app.model.dmChucDanhKhoaHoc.getAll(),
            ]);
            const listChucDanh = listNgach.concat(listChucDanhKhoaHoc);
            items = items.map(item => {
                const itemChucDanhIds = item.maChucDanh.split(',');
                const chucDanhs = itemChucDanhIds.map(ma => {
                    const index = listChucDanh.findIndex(chucDanh => chucDanh.ma == ma);
                    return index == -1 ? '' : listChucDanh[index].ten;
                });
                return {
                    ...item,
                    chucDanhs: chucDanhs.join('; '),
                };
            });
            listNhom = listNhom.map(nhom => {
                const submenus = items.filter(item => item.idNhom == nhom.id);
                const index = listCaNhanDangKy.findIndex(caNhan => caNhan.idNhomDangKy == nhom.id);
                if (index == -1) {
                    return {
                        nhom,
                        id: null,
                        submenus,
                    };
                }
                return {
                    nhom,
                    ...listCaNhanDangKy[index],
                    submenus,
                };
            });
            res.send({ items: listNhom });
        } catch (error) {
            res.send({ error });
        }
    });

    app.post('/api/tccb/danh-gia/ca-nhan-dang-ky', app.permission.check('staff:login'), async (req, res) => {
        try {
            const shcc = req.session.user.shcc, newItem = req.body.item, idNhom = parseInt(req.body.idNhom);
            if (!(await checkDangKyHopLe(shcc, idNhom))) {
                return res.send({ error: 'Bạn không có quyền đăng ký nhóm này' });
            }
            const { nam } = await app.model.tccbNhomDanhGiaNhiemVu.get({ id: idNhom, kichHoat: 1 });
            if (!nam) {
                return res.send({ error: 'Đăng ký không thành công' });
            }
            const { nldBatDauDangKy, nldKetThucDangKy } = await app.model.tccbDanhGiaNam.get({ nam });
            if (nldBatDauDangKy > Date.now() || Date.now() > nldKetThucDangKy) {
                res.send({ error: 'Thời gian đăng ký không phù hợp' });
            } else {
                newItem.shcc = req.session.user.shcc;
                newItem.idNhomDangKy = idNhom;
                const item = await app.model.tccbDanhGiaCaNhanDangKy.create(newItem);
                res.send({ item, nam });
            }
        } catch (error) {
            res.send({ error });
        }
    });

    app.put('/api/tccb/danh-gia/ca-nhan-dang-ky', app.permission.check('staff:login'), async (req, res) => {
        try {
            const shcc = req.session.user.shcc, id = parseInt(req.body.id), changes = req.body.changes, idNhom = parseInt(req.body.idNhom);
            if (!(await checkDangKyHopLe(shcc, idNhom))) {
                return res.send({ error: 'Bạn không có quyền đăng ký nhóm này' });
            }
            const { nam } = await app.model.tccbNhomDanhGiaNhiemVu.get({ id: idNhom, kichHoat: 1 });
            if (!nam) {
                return res.send({ error: 'Đăng ký không thành công' });
            }
            const { nldBatDauDangKy, nldKetThucDangKy } = await app.model.tccbDanhGiaNam.get({ nam });
            if (nldBatDauDangKy > Date.now() || Date.now() > nldKetThucDangKy) {
                res.send({ error: 'Thời gian đăng ký không phù hợp' });
            } else {
                const item = await app.model.tccbDanhGiaCaNhanDangKy.update({ id, shcc: req.session.user.shcc }, changes);
                res.send({ item, nam });
            }
        } catch (error) {
            res.send({ error });
        }
    });
};