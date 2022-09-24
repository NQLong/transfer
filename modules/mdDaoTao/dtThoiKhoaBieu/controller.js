module.exports = app => {
    const menu = {
        parentMenu: app.parentMenu.daoTao,
        menus: {
            7001: {
                title: 'Thời khóa biểu', groupIndex: 1,
                link: '/user/dao-tao/thoi-khoa-bieu', icon: 'fa-calendar', backgroundColor: '#1ca474'
            }
        }
    };
    app.permission.add(
        { name: 'dtThoiKhoaBieu:read', menu },
        { name: 'dtThoiKhoaBieu:manage', menu },
        'dtThoiKhoaBieu:write',
        'dtThoiKhoaBieu:delete',
        'dtThoiKhoaBieu:export',
        'dtThoiKhoaBieu:import',

    );

    app.permissionHooks.add('staff', 'addRolesDtThoiKhoaBieu', (user, staff) => new Promise(resolve => {
        if (staff.maDonVi && staff.maDonVi == '33') {
            app.permissionHooks.pushUserPermission(user, 'dtThoiKhoaBieu:read', 'dtThoiKhoaBieu:write', 'dtThoiKhoaBieu:delete', 'dtThoiKhoaBieu:export', 'dtThoiKhoaBieu:import');
            resolve();
        } else resolve();
    }));

    app.get('/user/dao-tao/thoi-khoa-bieu', app.permission.orCheck('dtThoiKhoaBieu:read', 'dtThoiKhoaBieu:manage'), app.templates.admin);
    app.get('/user/dao-tao/import-thoi-khoa-bieu', app.permission.check('dtThoiKhoaBieu:import'), app.templates.admin);
    app.get('/user/dao-tao/thoi-khoa-bieu/auto-generate', app.permission.check('dtThoiKhoaBieu:read'), app.templates.admin);
    app.get('/user/dao-tao/thoi-khoa-bieu/tra-cuu', app.permission.orCheck('dtThoiKhoaBieu:read', 'dtThoiKhoaBieu:manage'), app.templates.admin);

    // APIs -----------------------------------------------------------------------------------------------------------------------------------------
    app.get('/api/dao-tao/thoi-khoa-bieu/page/:pageNumber/:pageSize', app.permission.orCheck('dtThoiKhoaBieu:read', 'dtThoiKhoaBieu:manage'), async (req, res) => {
        try {
            const _pageNumber = parseInt(req.params.pageNumber),
                _pageSize = parseInt(req.params.pageSize),
                searchTerm = typeof req.query.condition === 'string' ? req.query.condition : '';
            const user = req.session.user, permissions = user.permissions;
            let filter = req.query.filter || {},
                donVi = filter.donVi || '';
            if (!permissions.includes('dtThoiKhoaBieu:read')) {
                if (user.staff?.maDonVi) donVi = user.maDonVi;
                else throw 'Permission denied!';
            }
            filter = app.utils.stringify(app.clone(filter, { donVi }));

            let page = await app.model.dtThoiKhoaBieu.searchPage(_pageNumber, _pageSize, filter, searchTerm);
            const { totalitem: totalItem, pagesize: pageSize, pagetotal: pageTotal, pagenumber: pageNumber, rows: list, thoigianphancong } = page;
            const pageCondition = searchTerm;
            res.send({ page: { totalItem, pageSize, pageTotal, pageNumber, pageCondition, list, thoiGianPhanCong: thoigianphancong } });
        } catch (error) {
            res.send({ error });
        }
    });

    app.get('/api/dao-tao/thoi-khoa-bieu/all', app.permission.check('user:login'), (req, res) => {
        const condition = req.query.condition || {};
        Object.keys(condition).forEach(key => { condition[key] === '' ? condition[key] = null : ''; });
        app.model.dtThoiKhoaBieu.getAll(condition, '*', 'id ASC ', (error, items) => res.send({ error, items }));
    });

    app.get('/api/dao-tao/thoi-khoa-bieu/item/:id', app.permission.check('user:login'), (req, res) => {
        app.model.dtThoiKhoaBieu.get({ id: req.params.id }, (error, item) => res.send({ error, item }));
    });

    app.post('/api/dao-tao/thoi-khoa-bieu/multiple', app.permission.check('dtThoiKhoaBieu:write'), async (req, res) => {
        try {
            let item = req.body.item || [],
                settings = req.body.settings;
            let thoiGianMoMon = await app.model.dtThoiGianMoMon.getActive(),
                { loaiHinhDaoTao, bacDaoTao } = settings;
            thoiGianMoMon = thoiGianMoMon.find(item => item.loaiHinhDaoTao == loaiHinhDaoTao && item.bacDaoTao == bacDaoTao);
            let { nam, hocKy } = (item.nam && item.hocKy) ? item : thoiGianMoMon;
            for (let index = 0; index < item.length; index++) {
                let monHoc = item[index];
                delete monHoc.id;
                let { maMonHoc, loaiMonHoc, khoaSv, chuyenNganh, soTietBuoi, soBuoiTuan, soLuongDuKien, soLop, maNganh } = monHoc;
                ['chuyenNganh', 'soTietBuoi', 'soBuoiTuan', 'soLuongDuKien'].forEach(key => delete monHoc[key]);
                const tkb = await app.model.dtThoiKhoaBieu.get({ maMonHoc, loaiMonHoc, khoaSinhVien: khoaSv, maNganh, loaiHinhDaoTao, bacDaoTao });
                if (!tkb) {
                    if (chuyenNganh) {
                        if (Array.isArray(chuyenNganh) && chuyenNganh.every(item => typeof item == 'object')) {
                            for (let index = 0; index < parseInt(chuyenNganh.length); index++) {
                                let soTiet = parseInt(soTietBuoi[index]), soBuoi = parseInt(soBuoiTuan[index]), sldk = parseInt(soLuongDuKien[index]), chNg = chuyenNganh[index];
                                if (soBuoi > 1) {
                                    for (let buoi = 1; buoi <= parseInt(soBuoi); buoi++) {
                                        let item = await app.model.dtThoiKhoaBieu.create({ ...monHoc, nhom: index + 1, buoi, nam, hocKy, soTietBuoi: soTiet, soLuongDuKien: sldk, loaiHinhDaoTao, bacDaoTao, soBuoiTuan: soBuoi });
                                        if (item) {
                                            for (const nganh of chNg) {
                                                let idNganh = `${maNganh}##${nganh}`;
                                                await app.model.dtThoiKhoaBieuNganh.create({ idThoiKhoaBieu: item.id, idNganh });
                                            }
                                        }
                                    }
                                } else {
                                    let item = await app.model.dtThoiKhoaBieu.create({ ...monHoc, nhom: index + 1, buoi: 1, nam, hocKy, soTietBuoi: soTiet, soLuongDuKien: sldk, loaiHinhDaoTao, bacDaoTao, soBuoiTuan: soBuoi });
                                    if (item) {
                                        for (const nganh of chNg) {
                                            let idNganh = `${maNganh}##${nganh}`;
                                            await app.model.dtThoiKhoaBieuNganh.create({ idThoiKhoaBieu: item.id, idNganh });
                                        }
                                    }
                                }
                            }
                        } else {
                            soLop = parseInt(soLop);
                            for (let nhom = 1; nhom <= parseInt(soLop); nhom++) {
                                let soBuoi = parseInt(soBuoiTuan);
                                if (soBuoi > 1) {
                                    for (let buoi = 1; buoi <= parseInt(soBuoi); buoi++) {
                                        let item = await app.model.dtThoiKhoaBieu.create({ ...monHoc, nhom, buoi, nam, hocKy, soTietBuoi: parseInt(soTietBuoi), chuyenNganh: chuyenNganh.toString(), soLuongDuKien: parseInt(soLuongDuKien), loaiHinhDaoTao, bacDaoTao, soBuoiTuan: parseInt(soBuoiTuan) });
                                        if (item) {
                                            await app.model.dtThoiKhoaBieuNganh.create({ idThoiKhoaBieu: item.id, idNganh: `${maNganh}##${chuyenNganh}` });
                                        }
                                    }
                                } else {
                                    let item = await app.model.dtThoiKhoaBieu.create({ ...monHoc, nhom, buoi: 1, nam, hocKy, soTietBuoi: parseInt(soTietBuoi), chuyenNganh: chuyenNganh.toString(), soLuongDuKien: parseInt(soLuongDuKien), loaiHinhDaoTao, bacDaoTao, soBuoiTuan: parseInt(soBuoiTuan) });
                                    if (item) {
                                        await app.model.dtThoiKhoaBieuNganh.create({ idThoiKhoaBieu: item.id, idNganh: `${maNganh}##${chuyenNganh}` });
                                    }
                                }
                            }
                        }
                    } else {
                        soLop = parseInt(soLop);
                        for (let nhom = 1; nhom <= soLop; nhom++) {
                            let soBuoi = parseInt(soBuoiTuan);
                            if (soBuoi > 1) {
                                for (let buoi = 1; buoi <= soBuoi; buoi++) {
                                    let item = await app.model.dtThoiKhoaBieu.create({ ...monHoc, nhom, buoi, nam, hocKy, soTietBuoi: parseInt(soTietBuoi), soLuongDuKien: parseInt(soLuongDuKien), loaiHinhDaoTao, bacDaoTao, soBuoiTuan: parseInt(soBuoiTuan) });
                                    if (item) {
                                        await app.model.dtThoiKhoaBieuNganh.create({ idThoiKhoaBieu: item.id, idNganh: maNganh });
                                    }
                                }
                            } else {
                                let item = await app.model.dtThoiKhoaBieu.create({ ...monHoc, nhom, buoi: 1, nam, hocKy, soTietBuoi: parseInt(soTietBuoi), soLuongDuKien: parseInt(soLuongDuKien), loaiHinhDaoTao, bacDaoTao, soBuoiTuan: parseInt(soBuoiTuan) });
                                if (item) {
                                    await app.model.dtThoiKhoaBieuNganh.create({ idThoiKhoaBieu: item.id, idNganh: maNganh });
                                }
                            }
                        }
                    }
                }
            }
            await app.model.dtDangKyMoMon.update({ id: settings.idMoMon }, { isDuyet: 1, thoiGian: new Date().getTime() });
            res.end();
        } catch (error) {
            console.log(error);
            res.send({ error });
        }
    });

    app.post('/api/dao-tao/thoi-khoa-bieu/check-if-exist', app.permission.check('dtThoiKhoaBieu:write'), async (req, res) => {
        try {
            let data = req.body.data;
            const { maMonHoc, bacDaoTao, loaiHinhDaoTao, nam, hocKy, khoaSinhVien } = data;
            let checkItems = await app.model.dtThoiKhoaBieu.getAll({ maMonHoc, bacDaoTao, loaiHinhDaoTao, nam, hocKy, khoaSinhVien }, 'maMonHoc,nhom');
            if (checkItems.length) {
                checkItems = checkItems.map(item => parseInt(item.nhom));
                let maxNhomCurrent = Math.max(...checkItems);
                res.send({ warning: `Môn học đã có ${maxNhomCurrent} lớp cho hệ ${loaiHinhDaoTao}, khoá ${khoaSinhVien}`, maxNhomCurrent });
            }
            else res.end();
        } catch (error) {
            res.send({ error });
        }
    });

    app.post('/api/dao-tao/thoi-khoa-bieu/create-multiple', app.permission.check('dtThoiKhoaBieu:write'), async (req, res) => {
        try {
            let { data, settings } = req.body;
            let startIndex = parseInt(settings.startIndex);
            for (let index = startIndex; index - startIndex < data.length; index++) {
                let item = data[index - startIndex],
                    maNganh = item.maNganh,
                    chuyenNganh = item.chuyenNganh || [],
                    soBuoiTuan = item.soBuoiTuan;
                for (let buoi = 1; buoi <= parseInt(soBuoiTuan); buoi++) {
                    const tkbItem = await app.model.dtThoiKhoaBieu.create(app.clone(item, settings, { nhom: index + 1 }));
                    for (const nganhItem of maNganh) {
                        if (chuyenNganh.length) {
                            for (const chuyenNganhItem of chuyenNganh) {
                                let idNganh = chuyenNganhItem ? `${nganhItem}##${chuyenNganhItem}` : nganhItem;
                                await app.model.dtThoiKhoaBieuNganh.create({ idThoiKhoaBieu: tkbItem.id, idNganh });
                            }
                        } else {
                            await app.model.dtThoiKhoaBieuNganh.create({ idThoiKhoaBieu: tkbItem.id, idNganh: nganhItem });
                        }
                    }
                }
            }
            res.end();
        } catch (error) {
            console.error(error);
            res.send({ error });
        }
    });

    app.post('/api/dao-tao/thoi-khoa-bieu', app.permission.check('dtThoiKhoaBieu:write'), async (req, res) => {
        let item = req.body.item || [],
            settings = req.body.settings;
        let thoiGianMoMon = await app.model.dtThoiGianMoMon.getActive(),
            { loaiHinhDaoTao, bacDaoTao } = settings;
        thoiGianMoMon = thoiGianMoMon.find(item => item.loaiHinhDaoTao == loaiHinhDaoTao && item.bacDaoTao == bacDaoTao);
        let { nam, hocKy } = (item.nam && item.hocKy) ? item : thoiGianMoMon;

        const onCreate = (index, monHoc) => new Promise((resolve, reject) => {
            const save = (i, m) => {
                if (i > parseInt(m.soLop)) {
                    resolve(m);
                    return;
                }
                app.model.dtThoiKhoaBieu.get({ maMonHoc: m.maMonHoc, nhom: i, hocKy: m.hocKy, soTietBuoi: m.soTietBuoi, loaiHinhDaoTao, bacDaoTao, khoaSinhVien: m.khoaSinhVien }, (error, tkb) => {
                    if (error) reject(error);
                    else if (!tkb) {
                        m.nhom = i;
                        delete m.id;
                        for (let i = 1; i <= m.soBuoiTuan; i++) {
                            ({ ...m, nam, hocKy, soTietBuoi: m.soTietBuoi, buoi: i, loaiHinhDaoTao, bacDaoTao }, (error, item) => {
                                if (error || !item) reject(error);
                            });
                        }
                    }
                    save(i + 1, m);
                });
            };
            save(index, monHoc);
        });
        let listPromise = item.map(monHoc => item = onCreate(1, monHoc));
        Promise.all(listPromise).then((values) => {
            res.send({ item: values });
        }).catch(error => res.send({ error }));
    });

    app.put('/api/dao-tao/thoi-khoa-bieu', app.permission.check('dtThoiKhoaBieu:write'), (req, res) => {
        let changes = req.body.changes, id = req.body.id;
        if (changes.thu) {
            let { tietBatDau, thu, soTietBuoi, phong } = changes;
            let condition = {
                tietBatDau,
                day: thu,
                soTietBuoi
            };
            app.model.dtThoiKhoaBieu.get({ id }, (error, item) => {
                if (error) {
                    res.send({ error });
                    return;
                } else {
                    if (tietBatDau == item.tietBatDau && thu == item.thu && phong == item.phong) {
                        app.model.dtThoiKhoaBieu.update({ id }, req.body.changes, (error, item) => res.send({ error, item }));
                    } else {
                        app.model.dtThoiKhoaBieu.getAll({
                            statement: 'phong = :phong AND id != :id',
                            parameter: { phong, id }
                        }, (error, items) => {
                            if (error) {
                                res.send({ error });
                                return;
                            } else {
                                if (app.model.dtThoiKhoaBieu.isAvailabledRoom(changes.phong, items, condition)) app.model.dtThoiKhoaBieu.update({ id: req.body.id }, req.body.changes, (error, item) => res.send({ error, item }));
                                else res.send({ error: `Phòng ${changes.phong} không trống vào thứ ${changes.thu}, tiết ${changes.tietBatDau} - ${changes.tietBatDau + changes.soTietBuoi - 1}` });
                            }
                        });
                    }
                }
            });
        }
        else app.model.dtThoiKhoaBieu.update({ id: req.body.id }, req.body.changes, (error, item) => res.send({ error, item }));
    });

    app.put('/api/dao-tao/thoi-khoa-bieu-condition', app.permission.orCheck('dtThoiKhoaBieu:write', 'dtThoiKhoaBieu:manage'), async (req, res) => {
        try {
            let { condition, changes } = req.body,
                { tietBatDau, soTietBuoi, thu } = changes;
            tietBatDau = parseInt(tietBatDau);
            soTietBuoi = parseInt(soTietBuoi);
            thu = parseInt(thu);
            if (!isNaN(condition)) {
                let nganh = await app.model.dtThoiKhoaBieuNganh.get({ idThoiKhoaBieu: condition }),
                    idNganh = nganh.idNganh;

                // Check xem id ngành có trống hay không.
                let listIdTkb = await app.model.dtThoiKhoaBieuNganh.getAll({ idNganh });
                listIdTkb = listIdTkb.filter(item => item.idThoiKhoaBieu != condition).map(item => item.idThoiKhoaBieu);
                if (listIdTkb.length) {
                    let listHocPhanNganh = await app.model.dtThoiKhoaBieu.getAll({
                        statement: 'id IN (:listIdTkb)',
                        parameter: { listIdTkb }
                    }, 'thu,tietBatDau,soTietBuoi,phong');
                    if (listHocPhanNganh.some(item => item.thu == thu
                        && (
                            (tietBatDau <= (parseInt(item.tietBatDau) + parseInt(item.soTietBuoi) - 1)
                                && tietBatDau >= parseInt(item.tietBatDau)) ||
                            ((tietBatDau + soTietBuoi - 1) >= parseInt(item.tietBatDau)
                                && (tietBatDau + soTietBuoi - 1) <= (parseInt(item.tietBatDau) + parseInt(item.soTietBuoi) - 1))
                        )
                    )) {
                        throw 'Trùng thời gian môn khác của ngành/chuyên ngành';
                    }
                }
                if (changes.phong) {
                    let hocPhan = await app.model.dtThoiKhoaBieu.get({ id: condition }),
                        { nam, hocKy } = hocPhan;

                    let listCurrentRoom = await app.model.dtThoiKhoaBieu.getAll({
                        statement: 'nam = :nam AND hocKy = :hocKy AND phong = :phong AND thu IS NOT NULL AND tietBatDau IS NOT NULL',
                        parameter: { nam, hocKy, phong: changes.phong }
                    });
                    if (listCurrentRoom.length && listCurrentRoom.some(item => item.thu == thu
                        && (
                            (tietBatDau <= (parseInt(item.tietBatDau) + parseInt(item.soTietBuoi) - 1)
                                && tietBatDau >= parseInt(item.tietBatDau)) ||
                            ((tietBatDau + soTietBuoi - 1) >= parseInt(item.tietBatDau)
                                && (tietBatDau + soTietBuoi - 1) <= (parseInt(item.tietBatDau) + parseInt(item.soTietBuoi) - 1))
                        )
                    )) {
                        throw `Phòng ${changes.phong} bị trùng giờ`;
                    }
                }

                // let giangVien, troGiang;
                // if (changes.giangVien) {
                //     giangVien = changes.giangVien;
                //     delete changes.giangVien;
                // }
                // if (changes.troGiang) {
                //     troGiang = changes.troGiang;
                //     delete changes.troGiang;
                // }

                ['thu', 'tietBatDau', 'soTietBuoi', 'soLuongDuKien'].forEach(key => {
                    if (!changes[key]) changes[key] = '';
                });

                let item = await app.model.dtThoiKhoaBieu.update({ id: condition }, changes);

                // let allGvItem = await app.model.dtThoiKhoaBieuGiangVien.getAll({ idThoiKhoaBieu: item.id, type: 'GV' });
                // for (let exitsGvItem of allGvItem) {
                //     if (!giangVien.includes(exitsGvItem.giangVien)) app.model.dtThoiKhoaBieuGiangVien.delete({ idThoiKhoaBieu: item.id, giangVien: exitsGvItem.giangVien, type: 'GV' });
                //     else giangVien.splice(giangVien.indexOf(exitsGvItem.giangVien), 1);
                // }
                // if (giangVien && giangVien.length > 0) {
                //     for (let gvItem of giangVien) {
                //         await app.model.dtThoiKhoaBieuGiangVien.create({ idThoiKhoaBieu: item.id, giangVien: gvItem, type: 'GV' });
                //     }
                // }

                // let allTgItem = await app.model.dtThoiKhoaBieuGiangVien.getAll({ idThoiKhoaBieu: item.id, type: 'TG' });
                // for (let exitsTgItem of allTgItem) {
                //     if (!troGiang.includes(exitsTgItem.giangVien)) app.model.dtThoiKhoaBieuGiangVien.delete({ idThoiKhoaBieu: item.id, giangVien: exitsTgItem.giangVien, type: 'TG' });
                //     else troGiang.splice(troGiang.indexOf(exitsTgItem.giangVien), 1);
                // }
                // if (troGiang && troGiang.length > 0) {
                //     for (let tgItem of troGiang) {
                //         await app.model.dtThoiKhoaBieuGiangVien.create({ idThoiKhoaBieu: item.id, giangVien: tgItem, type: 'TG' });
                //     }
                // }
                if ((changes.maNganh && changes.maNganh.length) || (changes.chuyenNganh && changes.chuyenNganh.length)) {
                    await app.model.dtThoiKhoaBieuNganh.delete({ idThoiKhoaBieu: condition });
                    if (changes.maNganh) {
                        for (let idNganh of changes.maNganh) {
                            await app.model.dtThoiKhoaBieuNganh.create({ idThoiKhoaBieu: condition, idNganh });
                        }
                    }
                    if (changes.chuyenNganh) {
                        for (let idChuyenNganh of changes.chuyenNganh) {
                            let chuyenNganh = await app.model.dtDanhSachChuyenNganh.get({ id: idChuyenNganh });
                            await app.model.dtThoiKhoaBieuNganh.create({ idThoiKhoaBieu: condition, idNganh: `${chuyenNganh.nganh}%${idChuyenNganh}` });
                        }
                    }

                }
                res.send({ item });
            }
            else if (typeof condition == 'object') {
                let { nam, hocKy, maMonHoc, loaiHinhDaoTao, bacDaoTao, khoaSinhVien } = condition;
                let item = await app.model.dtThoiKhoaBieu.update({ maMonHoc, nam, hocKy, loaiHinhDaoTao, bacDaoTao, khoaSinhVien }, changes);
                res.send({ item });
            }
        } catch (error) {
            console.log(error);
            res.send({ error });
        }

    });

    app.put('/api/dao-tao/thoi-khoa-bieu/update-check', app.permission.check('dtThoiKhoaBieu:write'), async (req, res) => {
        try {
            let id = req.body.id;
            if (typeof id == 'object') {
                const item = await app.model.dtThoiKhoaBieu.update({
                    statement: 'id in (:id)',
                    parameter: { id }
                }, { isMo: Number(req.body.isMo) });
                res.send({ item });
            } else {
                const item = await app.model.dtThoiKhoaBieu.update({ id }, { isMo: Number(req.body.isMo) });
                res.send({ item });
            }


        } catch (error) {
            res.send({ error });
        }
    });

    app.delete('/api/dao-tao/thoi-khoa-bieu', app.permission.check('dtThoiKhoaBieu:delete'), (req, res) => {
        try {
            app.model.dtThoiKhoaBieuGiangVien.delete({ idThoiKhoaBieu: req.body.id });
            app.model.dtThoiKhoaBieu.delete({ id: req.body.id });
            app.model.dtThoiKhoaBieuNganh.delete({ idThoiKhoaBieu: req.body.id });
            res.end();
        } catch (error) {
            res.send({ error });
        }
    });

    app.delete('/api/dao-tao/thoi-khoa-bieu/condition', app.permission.check('dtThoiKhoaBieu:delete'), (req, res) => {
        try {
            let listChosen = req.body.listChosen.map(item => parseInt(item));
            let condition1 = {
                statement: 'id IN (:listChosen)',
                parameter: { listChosen }
            }, condition2 = {
                statement: 'idThoiKhoaBieu IN (:listChosen)',
                parameter: { listChosen }
            };
            app.model.dtThoiKhoaBieu.delete(condition1);
            app.model.dtThoiKhoaBieuNganh.delete(condition2);
            res.end();
        } catch (error) {
            console.error(error);
            res.send({ error });
        }
    });

    app.get('/api/dao-tao/init-schedule', app.permission.check('dtThoiKhoaBieu:write'), (req, res) => {
        let ngayBatDau = req.query.ngayBatDau;
        app.model.dtThoiKhoaBieu.init(ngayBatDau, (status) => res.send(status));
    });

    app.get('/api/dao-tao/get-schedule', app.permission.check('dtThoiKhoaBieu:read'), async (req, res) => {
        let phong = req.query.phong;
        const thoiGianMoMon = await app.model.dtThoiGianMoMon.getActive();
        let listNgayLe = await app.model.dmNgayLe.getAllNgayLeTrongNam(thoiGianMoMon.khoa);
        app.model.dtThoiKhoaBieu.getCalendar(phong, thoiGianMoMon.nam, thoiGianMoMon.hocKy, (error, items) => {
            res.send({ error, items: items?.rows || [], listNgayLe });
        });
    });

    app.post('/api/dao-tao/gen-schedule', app.permission.check('dtThoiKhoaBieu:read'), app.model.dtThoiKhoaBieu.autoGenSched);
    //Hook upload -------------------------------------------------------------------------------
    app.uploadHooks.add('DtThoiKhoaBieuData', (req, fields, files, params, done) =>
        app.permission.has(req, () => dtThoiKhoaBieuImportData(fields, files, done), done, 'dtThoiKhoaBieu:write')
    );
    const dtThoiKhoaBieuImportData = async (fields, files, done) => {
        let worksheet = null;
        if (fields.userData && fields.userData[0] && fields.userData[0] == 'DtThoiKhoaBieuData' && files.DtThoiKhoaBieuData && files.DtThoiKhoaBieuData.length) {
            const srcPath = files.DtThoiKhoaBieuData[0].path;
            let workbook = app.excel.create();
            workbook = await app.excel.readFile(srcPath);
            if (workbook) {
                app.fs.deleteFile(srcPath);
                worksheet = workbook.getWorksheet(1);
                if (worksheet) {
                    const items = [];
                    const duplicateDatas = [];
                    let index = 2;
                    try {
                        while (true) {
                            if (!worksheet.getCell('A' + index).value) {
                                done({ items, duplicateDatas });
                                break;
                            } else {
                                // const bacDaoTao = worksheet.getCell('R' + index).value;
                                // const loaiHinhDaoTao= worksheet.getCell('S'+index).value;
                                const khoaSinhVien = parseInt(worksheet.getCell('Q' + index).value);
                                const namStr = worksheet.getCell('R' + index).value;
                                const nam = await app.model.dtCauTrucKhungDaoTao.get({ namDaoTao: namStr }, 'id');
                                const hocKy = parseInt(worksheet.getCell('S' + index).value);
                                const maMonHocStr = worksheet.getCell('C' + index).value;
                                const maMonHoc = await app.model.dtChuongTrinhDaoTao.get({ tenMonHoc: maMonHocStr, kichHoat: 1 }, 'maMonHoc');
                                const khoaDangKyStr = worksheet.getCell('N' + index).value;
                                const khoaDangKy = await app.model.dmDonVi.get({ ten: khoaDangKyStr }, 'ma');
                                const soLop = worksheet.getCell('T' + index).value;
                                const soTietBuoi = parseInt(worksheet.getCell('H' + index).value);
                                const soBuoiTuan = parseInt(worksheet.getCell('U' + index).value);
                                const soLuongDuKien = parseInt(worksheet.getCell('I' + index).value);
                                const tenNganh = worksheet.getCell('J' + index).value;
                                const maNganh = await app.model.dtNganhDaoTao.get({ tenNganh: tenNganh, kickHoat: 1 }, '*');

                                // const giangVien = worksheet.getCell('U'+index).value;


                                const row = { tenNganh, khoaSinhVien, nam: nam.id, hocKy, maMonHocStr, maMonHoc: maMonHoc.maMonHoc, khoaDangKy: khoaDangKy.ma, khoaDangKyStr, soLop, soTietBuoi, soBuoiTuan, soLuongDuKien, maNganh: maNganh.maNganh, namStr };
                                items.push(row);
                                index++;

                            }
                        }
                    } catch (error) {
                        console.error(error);
                        done({ error });
                    }
                } else {
                    done({ error: 'No worksheet!' });
                }
            } else done({ error: 'No workbook!' });
        }
    };


    app.post('/api/dao-tao/thoi-khoa-bieu/get-by-config', app.permission.check('dtThoiKhoaBieu:write'), async (req, res) => {
        try {
            const { config } = req.body,
                dataFree = await app.model.dtThoiKhoaBieu.getFree(JSON.stringify(config));
            let { rows: dataCanGen, hocphandaxep: dataCurrent } = dataFree;
            res.send({ dataCanGen, dataCurrent });
        } catch (error) {
            console.error(error);
            res.send({ error });
        }

    });

    app.put('/api/dao-tao/thoi-khoa-bieu/save-gen-data', app.permission.check('dtThoiKhoaBieu:write'), async (req, res) => {
        try {
            let data = req.body.data;
            for (const item of data) {
                let id = parseInt(item.id);
                delete item.id;
                item.userModified = req.session.user.email;
                item.lastModified = Date.now();
                await app.model.dtThoiKhoaBieu.update({ id }, item);
            }
            res.end();
        } catch (error) {
            res.send({ error });
        }
    });

    app.post('/api/dao-tao/thoi-khoa-bieu/generate-time', app.permission.check('dtThoiKhoaBieu:write'), app.model.dtThoiKhoaBieu.getDataGenerateSchedule);

    app.post('/api/dao-tao/thoi-khoa-bieu/generate-room-end-date', app.permission.check('dtThoiKhoaBieu:write'), app.model.dtThoiKhoaBieu.getDataRoomAndEndDate);

    // Export xlsx
    // Get data Nganh
    app.get('/api/dao-tao/thoi-khoa-bieu/download-template', app.permission.orCheck('dtThoiKhoaBieu:export', 'dtThoiKhoaBieu:import'), async (req, res) => {
        //Get data Khoa bo mon
        let khoaBoMon = await app.model.dmDonVi.getAll({ kichHoat: 1 }, 'ten');
        khoaBoMon = khoaBoMon.map(ele => ele.ten);
        //Get data Nganh
        let nganhDaoTao = await app.model.dtNganhDaoTao.getAll({ kichHoat: 1 }, 'tenNganh');
        nganhDaoTao = nganhDaoTao.map(ele => ele.tenNganh);
        //Get mon hoc
        let monHoc = await app.model.dtChuongTrinhDaoTao.getAll({ kichHoat: 1 }, '*');
        monHoc = monHoc.map(ele => ele.tenMonHoc);
        //Get Cau truc dao tao
        let ctDaoTao = await app.model.dtCauTrucKhungDaoTao.getAll({}, '*');
        const nam = ctDaoTao.map(ele => ele.namDaoTao);
        const khoa = ctDaoTao.map(ele => ele.khoa);

        const workBook = app.excel.create();
        const ws = workBook.addWorksheet('Thoi_khoa_bieu_Template');
        const defaultColumns = [
            { header: 'STT', key: 'stt', width: 5 },
            { header: 'MÃ', key: 'ma', width: 20 },
            { header: 'MÔN HỌC', key: 'monHoc', width: 20 },
            { header: 'TỰ CHỌN', key: 'tuChon', width: 20 },
            { header: 'TỔNG TIẾT', key: 'tongTiet', width: 20 },
            { header: 'THỨ', key: 'thu', width: 25 },
            { header: 'TIẾT BẮT ĐẦU', key: 'tietBatDau', width: 25 },
            { header: 'SỐ TIẾT', key: 'soTiet', width: 25 },
            { header: 'SLDK', key: 'sldk', width: 25 },
            { header: 'NGÀNH', key: 'nganh', width: 20 },
            { header: 'CHUYÊN NGÀNH', key: 'chuyenNganh', width: 25 },
            { header: 'NGÀY BẮT ĐẦU', key: 'ngayBatDau', width: 25 },
            { header: 'NGÀY KẾT THÚC', key: 'ngayKetThuc', width: 25 },
            { header: 'KHOA/BỘ MÔN', key: 'khoa', width: 20 },
            { header: 'GIẢNG VIÊN', key: 'giangVien', width: 25 },
            { header: 'TRỢ GIẢNG', key: 'troGiang', width: 25 },
            { header: 'KHOÁ SV', key: 'khoaSV', width: 25 },
            { header: 'NĂM HỌC', key: 'nam', width: 25 },
            { header: 'HỌC KỲ', key: 'hocKy', width: 25 },
            { header: 'NHÓM', key: 'nhom', width: 25 },
            { header: 'SỐ BUỔI TRÊN TUẦN', key: 'buoiTrenTuan', width: 25 },

        ];
        ws.columns = defaultColumns;
        const { dataRange: khoaBM } = workBook.createRefSheet('Khoa_Bo_Mon', khoaBoMon);
        const { dataRange: nganhHoc } = workBook.createRefSheet('Nganh', nganhDaoTao);
        const { dataRange: mon } = workBook.createRefSheet('Mon_Hoc', monHoc);
        const { dataRange: khoaHoc } = workBook.createRefSheet('Khoa_Hoc', khoa);
        const { dataRange: namHoc } = workBook.createRefSheet('Nam_Hoc', nam);

        const rows = ws.getRows(2, 1000);
        rows.forEach((row) => {
            row.getCell('monHoc').dataValidation = { type: 'list', allowBlank: true, formulae: [mon] };
            row.getCell('nganh').dataValidation = { type: 'list', allowBlank: true, formulae: [nganhHoc] };
            row.getCell('khoa').dataValidation = { type: 'list', allowBlank: true, formulae: [khoaBM] };
            row.getCell('nam').dataValidation = { type: 'list', allowBlank: true, formulae: [namHoc] };
            row.getCell('khoaSV').dataValidation = { type: 'list', allowBlank: true, formulae: [khoaHoc] };
        });
        app.excel.attachment(workBook, res, 'Thoi_khoa_bieu_Template.xlsx');

    });

    app.get('/api/dao-tao/thoi-khoa-bieu/download-excel', app.permission.check('dtThoiKhoaBieu:export'), async (req, res) => {
        try {
            let filter = app.utils.parse(req.query.filter || {});
            filter = app.utils.stringify(filter, '');
            let data = await app.model.dtThoiKhoaBieu.searchPage(1, 1000000, filter, '');
            const workBook = app.excel.create();
            const ws = workBook.addWorksheet('Thoi khoa bieu');

            ws.columns = [
                { header: 'STT', key: 'stt', width: 5 },
                { header: 'BẬC', key: 'bacDaoTao', width: 5 },
                { header: 'HỆ', key: 'loaiHinhDaoTao', width: 5 },
                { header: 'KHOÁ SV', key: 'khoaSinhVien', width: 7 },
                { header: 'NĂM HỌC', key: 'namDaoTao', width: 10 },
                { header: 'HK', key: 'hocKy', width: 5 },
                { header: 'MÃ', key: 'ma', width: 10 },
                { header: 'MÔN HỌC', key: 'monHoc', width: 30 },
                { header: 'TỰ CHỌN', key: 'tuChon', width: 10 },
                { header: 'LỚP', key: 'lop', width: 10 },
                { header: 'TỔNG TIẾT', key: 'tongTiet', width: 10 },
                { header: 'PHÒNG', key: 'phong', width: 10 },
                { header: 'THỨ', key: 'thu', width: 10 },
                { header: 'TIẾT BẮT ĐẦU', key: 'tietBatDau', width: 10 },
                { header: 'SỐ TIẾT', key: 'soTiet', width: 10 },
                { header: 'SLDK', key: 'sldk', width: 10 },
                { header: 'NGÀY BẮT ĐẦU', key: 'ngayBatDau', width: 20 },
                { header: 'NGÀY KẾT THÚC', key: 'ngayKetThuc', width: 20 },
                { header: 'KHOA/BỘ MÔN', key: 'khoa', width: 30 },
                { header: 'NGÀNH', key: 'tenNganh', width: 50 },
                { header: 'GIẢNG VIÊN', key: 'giangVien', width: 30 },
                { header: 'TRỢ GIẢNG', key: 'giangVien', width: 30 },
                { header: 'SỐ BUỔI TRÊN TUẦN', key: 'soBuoiTuan', width: 5 }
            ];

            const list = data.rows;
            list.forEach((item, index) => {
                ws.addRow({
                    ...item,
                    stt: index + 1,
                    ma: `${item.maMonHoc}_${item.nhom}`,
                    monHoc: `${app.utils.parse(item.tenMonHoc).vi}`,
                    tuChon: item.loaiMonHoc ? 'x' : '',
                    lop: item.nhom,
                    tongTiet: item.tongTiet,
                    phong: item.phong,
                    thu: item.thu,
                    tietBatDau: item.tietBatDau,
                    soTiet: item.soTiet,
                    sldk: item.soLuongDuKien,
                    ngayBatDau: item.ngayBatDau ? app.date.dateTimeFormat(new Date(Number(item.ngayBatDau)), 'dd/mm/yyyy') : '',
                    ngayKetThuc: item.ngayKetThuc ? app.date.dateTimeFormat(new Date(Number(item.ngayKetThuc)), 'dd/mm/yyyy') : '',
                    khoa: item.tenKhoaDangKy,
                    giangVien: item.listGiangVien?.split(',').map(gvItem => gvItem.split('_')[1]).join('\n'),
                    troGiang: item.listTroGiang?.split(',').map(tgItem => tgItem.split('_')[1]).join('\n'),
                    tenNganh: item.tenNganh.replaceAll('&&', '\n').replaceAll('%', ': '),
                }, index === 0 ? 'n' : 'i');
            });

            let fileName = 'THOI_KHOA_BIEU.xlsx';
            app.excel.attachment(workBook, res, fileName);
        } catch (error) {
            console.error(error);
            res.send({ error });
        }
    });

    //Quyền của đơn vị------------------------------------------------------------------------------------------
    app.assignRoleHooks.addRoles('daoTao', { id: 'dtThoiKhoaBieu:manage', text: 'Đào tạo: Phân công giảng dạy' });

    app.permissionHooks.add('staff', 'checkRoleDTPhanCongGiangDay', (user, staff) => new Promise(resolve => {
        if (staff.donViQuanLy && staff.donViQuanLy.length && user.permissions.includes('faculty:login')) {
            app.permissionHooks.pushUserPermission(user, 'dtThoiKhoaBieu:manage');
        }
        resolve();
    }));

    //Tra cứu phòng trống------------------------------------------------------------------------------------------

    app.get('/api/dao-tao/thoi-khoa-bieu/tra-cuu', app.permission.check('dtThoiKhoaBieu:manage'), async (req, res) => {
        try {
            let allFreeRoom = {};
            let busyRoom = {};
            //check coSo
            let coSo = await app.model.dmCoSo.get({ ma: parseInt(req.query.maCoSo) });
            if (!coSo) res.send({ error: 'Không tìm thấy cơ sở' });
            else {
                let listToaNha = await app.model.dmToaNha.getAll({ coSo: parseInt(req.query.maCoSo), kichHoat: 1 }, 'ma, ten');
                if (!listToaNha || !listToaNha.length) res.send({ items: [] });
                else {
                    let toaNhaCondition = listToaNha.map(item => item.ma);
                    let condition = {
                        statement: 'toaNha IN (:toaNhaCondition)',
                        parameter: {
                            toaNhaCondition: toaNhaCondition
                        }
                    };
                    if (req.query.condition) {
                        condition = {
                            statement: 'lower(ten) LIKE :searchText AND toaNha IN (:toaNhaCondition)',
                            parameter: {
                                searchText: `%${req.query.condition.toLowerCase()}%`,
                                toaNhaCondition: toaNhaCondition
                            }
                        };
                    }
                    allFreeRoom = await app.model.dmPhong.getAll(condition, 'ten, sucChua, toaNha', 'ten asc');
                    allFreeRoom = allFreeRoom.map(room => ({ ...room, tenToaNha: listToaNha.find(item => item.ma === room.toaNha).ten }));
                    if (!allFreeRoom || !allFreeRoom.length) res.send({ items: [] });

                }
                let currTime = new Date().getTime();

                let roomCondition = {
                    statement: 'thu= :thu AND ngayBatDau <= :currTime AND ngayKetThuc >= :currTime AND isMo =1 AND (:nam IS NOT NULL OR nam =\'\' OR nam = :nam) AND (:hocKy IS NOT NULL OR hocKy =\'\' OR hocKy = :hocKy) AND (:loaiHinh IS NOT NULL OR loaiHinhDaoTao =\'\' OR loaiHinhDaoTao = :loaiHinh)',
                    parameter: { thu: parseInt(req.query.thu), currTime: parseInt(currTime), nam: req.query.nam ? parseInt(req.query.nam) : '', hocKy: req.query.hocKy ? parseInt(req.query.hocKy) : '', loaiHinh: req.query.loaiHinh }
                };
                busyRoom = await app.model.dtThoiKhoaBieu.getAll(roomCondition, 'maMonHoc, nhom, hocKy, phong, ngayBatDau, giangVien, tietBatDau,soTietBuoi, ngayKetThuc,loaiHinhDaoTao, khoaSinhVien');
                let caHoc = await app.model.dmCaHoc.getAll({ maCoSo: req.query.maCoSo, kichHoat: 1 }, 'ten');
                let listCaHoc = caHoc.map(item => parseInt(item.ten));
                listCaHoc.sort(function (a, b) { return a - b; });
                allFreeRoom = allFreeRoom.map(item => ({ ...item, available: [...listCaHoc] }));
            }
            if (busyRoom) {
                for (const tkb of busyRoom) {
                    let phong = allFreeRoom.find(item => item.ten == tkb.phong);
                    phong[tkb.tietBatDau] = { ...tkb };
                    for (let i = tkb.tietBatDau; i < (tkb.tietBatDau + tkb.soTietBuoi); i++) {
                        let index = phong.available.indexOf(i);
                        if (index != -1) {
                            phong.available.splice(index, 1);
                        }
                    }

                }
            }
            res.send({ items: allFreeRoom });
        } catch (error) {
            console.error(error);
            res.send({ error });
        }

    });

};
