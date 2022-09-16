module.exports = app => {
    const menu = {
        parentMenu: app.parentMenu.user,
        menus: {
            1002: { title: 'Cá nhân đăng ký', link: '/user/danh-gia/ca-nhan-dang-ky', icon: 'fa-pencil', backgroundColor: '#fecc2c', groupIndex: 6 }
        }
    };
    app.permission.add(
        { name: 'staff:login', menu },
    );
    app.get('/user/danh-gia/ca-nhan-dang-ky', app.permission.check('staff:login'), app.templates.admin);
    app.get('/user/danh-gia/ca-nhan-dang-ky/:nam', app.permission.check('staff:login'), app.templates.admin);

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
            const item = await app.model.tccbDanhGiaNam.get({ nam });
            if (!item) {
                return res.send({ items: [] });
            }
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
                app.model.tccbDanhGiaCaNhanDangKy.getAll({ shcc, nam }, 'id,idNhomDangKy'),
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
                let dangKy = index == -1 ? 0 : 1;
                return { nhom, submenus, dangKy };
            });
            const { approvedDonVi } = await app.model.tccbDanhGiaPheDuyetDonVi.get({ nam, shcc });
            res.send({ items: listNhom, approvedDonVi });
        } catch (error) {
            res.send({ error });
        }
    });

    app.post('/api/tccb/danh-gia/ca-nhan-dang-ky', app.permission.check('staff:login'), async (req, res) => {
        try {
            const shcc = req.session.user.shcc, newItem = req.body.item, idNhom = parseInt(req.body.idNhom);
            if (newItem.dangKy == 0) {
                throw 'Bạn phải đăng ký ít nhất một nhóm';
            }
            const [checkHopLe, nhom] = await Promise.all([
                checkDangKyHopLe(shcc, idNhom),
                app.model.tccbNhomDanhGiaNhiemVu.get({ id: idNhom, kichHoat: 1 }, 'nam')
            ]);
            if (!checkHopLe) {
                return res.send({ error: 'Bạn không có quyền đăng ký nhóm này' });
            }
            const nam = nhom.nam;
            if (!nam) {
                return res.send({ error: 'Đăng ký không thành công' });
            }
            let [item, itemPheDuyet] = await Promise.all([
                app.model.tccbDanhGiaCaNhanDangKy.get({ shcc, nam }),
                app.model.tccbDanhGiaPheDuyetDonVi.get({ shcc, nam })
            ]);

            if (itemPheDuyet && itemPheDuyet.approvedDonVi == 'Không đồng ý') {
                item = await app.model.tccbDanhGiaCaNhanDangKy.update({ id: item.id }, { idNhomDangKy: idNhom });
                const { id } = await app.model.tccbDanhGiaPheDuyetDonVi.get({ shcc, nam });
                await app.model.tccbDanhGiaPheDuyetDonVi.update(id, { timeDangKy: Date.now(), idNhomDangKy: idNhom, approvedDonVi: null });
                res.send({ item, nam });
            } else {
                const { nldBatDauDangKy, nldKetThucDangKy } = await app.model.tccbDanhGiaNam.get({ nam });
                if (nldBatDauDangKy > Date.now() || Date.now() > nldKetThucDangKy) {
                    throw 'Thời gian đăng ký không phù hợp';
                }
                if (item) {
                    item = await app.model.tccbDanhGiaCaNhanDangKy.update({ id: item.id }, { idNhomDangKy: idNhom });
                    const { id } = await app.model.tccbDanhGiaPheDuyetDonVi.get({ shcc, nam });
                    await app.model.tccbDanhGiaPheDuyetDonVi.update(id, { timeDangKy: Date.now(), idNhomDangKy: idNhom });
                    res.send({ item, nam });
                } else {
                    newItem.shcc = shcc;
                    newItem.idNhomDangKy = idNhom;
                    newItem.nam = nam;
                    delete newItem.dangKy;
                    item = await app.model.tccbDanhGiaCaNhanDangKy.create(newItem);
                    await app.model.tccbDanhGiaPheDuyetDonVi.create({ shcc, timeDangKy: Date.now(), idNhomDangKy: idNhom, nam });
                    res.send({ item, nam });
                }
            }
        } catch (error) {
            res.send({ error });
        }
    });
};