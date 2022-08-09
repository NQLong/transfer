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
        { name: 'dtThoiKhoaBieu:write' },
        { name: 'dtThoiKhoaBieu:delete' }
    );

    app.permissionHooks.add('staff', 'addRolesDtThoiKhoaBieu', (user, staff) => new Promise(resolve => {
        if (staff.maDonVi && staff.maDonVi == '33') {
            app.permissionHooks.pushUserPermission(user, 'dtThoiKhoaBieu:read', 'dtThoiKhoaBieu:write', 'dtThoiKhoaBieu:delete');
            resolve();
        } else resolve();
    }));

    app.get('/user/dao-tao/thoi-khoa-bieu', app.permission.orCheck('dtThoiKhoaBieu:read', 'dtThoiKhoaBieu:manage'), app.templates.admin);

    // APIs -----------------------------------------------------------------------------------------------------------------------------------------
    app.get('/api/dao-tao/thoi-khoa-bieu/page/:pageNumber/:pageSize', app.permission.orCheck('dtThoiKhoaBieu:read', 'dtThoiKhoaBieu:manage'), async (req, res) => {
        try {
            // app.messageQueue.send('Test queue', 'Alo');

            // app.messageQueue.consume('Test queue', (message) => {
            //     console.log(message);
            // });


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
            filter = app.stringify(app.clone(filter, { donVi }));

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
                { loaiHinhDaoTao, bacDaoTao, maNganh } = settings;
            thoiGianMoMon = thoiGianMoMon.find(item => item.loaiHinhDaoTao == loaiHinhDaoTao && item.bacDaoTao == bacDaoTao);
            let { nam, hocKy } = (item.nam && item.hocKy) ? item : thoiGianMoMon;
            for (let index = 0; index < item.length; index++) {
                let monHoc = item[index];
                delete monHoc.id;
                let { maMonHoc, loaiMonHoc, khoaSv, chuyenNganh, soTietBuoi, soBuoiTuan, soLuongDuKien, soLop } = monHoc;
                ['chuyenNganh', 'soTietBuoi', 'soBuoiTuan', 'soLuongDuKien'].forEach(key => delete monHoc[key]);
                const tkb = await app.model.dtThoiKhoaBieu.get({ maMonHoc, loaiMonHoc, khoaSinhVien: khoaSv, maNganh, loaiHinhDaoTao, bacDaoTao });
                if (!tkb) {
                    if (chuyenNganh) {
                        if (Array.isArray(chuyenNganh) && chuyenNganh.every(item => typeof item == 'object')) {
                            for (let index = 0; index < parseInt(chuyenNganh.length); index++) {
                                let soTiet = parseInt(soTietBuoi[index]), soBuoi = parseInt(soBuoiTuan[index]), sldk = parseInt(soLuongDuKien[index]), chNg = chuyenNganh[index];
                                if (soBuoi > 1) {
                                    for (let buoi = 1; buoi <= parseInt(soBuoi); buoi++) {
                                        app.model.dtThoiKhoaBieu.create({ ...monHoc, nhom: index + 1, buoi, nam, hocKy, soTietBuoi: soTiet, chuyenNganh: chNg.toString(), soLuongDuKien: sldk, loaiHinhDaoTao, bacDaoTao, soBuoiTuan: soBuoi });
                                    }
                                } else {
                                    app.model.dtThoiKhoaBieu.create({ ...monHoc, nhom: index + 1, buoi: 1, nam, hocKy, soTietBuoi: soTiet, chuyenNganh: chNg.toString(), soLuongDuKien: sldk, loaiHinhDaoTao, bacDaoTao, soBuoiTuan: soBuoi });
                                }
                            }
                        } else {
                            soLop = parseInt(soLop);
                            for (let nhom = 1; nhom <= parseInt(soLop); nhom++) {
                                let soBuoi = parseInt(soBuoiTuan);
                                if (soBuoi > 1) {
                                    for (let buoi = 1; buoi <= parseInt(soBuoi); buoi++) {
                                        app.model.dtThoiKhoaBieu.create({ ...monHoc, nhom, buoi, nam, hocKy, soTietBuoi: parseInt(soTietBuoi), chuyenNganh: chuyenNganh.toString(), soLuongDuKien: parseInt(soLuongDuKien), loaiHinhDaoTao, bacDaoTao, soBuoiTuan: parseInt(soBuoiTuan) });
                                    }
                                } else app.model.dtThoiKhoaBieu.create({ ...monHoc, nhom, buoi: 1, nam, hocKy, soTietBuoi: parseInt(soTietBuoi), chuyenNganh: chuyenNganh.toString(), soLuongDuKien: parseInt(soLuongDuKien), loaiHinhDaoTao, bacDaoTao, soBuoiTuan: parseInt(soBuoiTuan) });
                            }
                        }
                    } else {
                        soLop = parseInt(soLop);
                        for (let nhom = 1; nhom <= soLop; nhom++) {
                            let soBuoi = parseInt(soBuoiTuan);
                            if (soBuoi > 1) {
                                for (let buoi = 1; buoi <= soBuoi; buoi++) {
                                    app.model.dtThoiKhoaBieu.create({ ...monHoc, nhom, buoi, nam, hocKy, soTietBuoi: parseInt(soTietBuoi), soLuongDuKien: parseInt(soLuongDuKien), loaiHinhDaoTao, bacDaoTao, soBuoiTuan: parseInt(soBuoiTuan) });
                                }
                            } else app.model.dtThoiKhoaBieu.create({ ...monHoc, nhom, buoi: 1, nam, hocKy, soTietBuoi: parseInt(soTietBuoi), soLuongDuKien: parseInt(soLuongDuKien), loaiHinhDaoTao, bacDaoTao, soBuoiTuan: parseInt(soBuoiTuan) });
                        }
                    }
                }
            }
            res.end();
        } catch (error) {
            res.send({ error });
        }
    });

    app.post('/api/dao-tao/thoi-khoa-bieu/create-multiple', app.permission.check('dtThoiKhoaBieu:write'), async (req, res) => {
        try {
            let { data, settings } = req.body;
            for (let index = 0; index < data.length; index++) {
                let item = data[index],
                    maNganh = item.maNganh,
                    chuyenNganh = item.chuyenNganh || [],
                    soBuoiTuan = item.soBuoiTuan;
                for (let buoi = 1; buoi <= parseInt(soBuoiTuan); buoi++) {
                    const tkbItem = await app.model.dtThoiKhoaBieu.create(app.clone(item, settings, { nhom: index + 1 }));
                    for (const nganhItem of maNganh) {
                        if (chuyenNganh.length) {
                            for (const chuyenNganhItem of chuyenNganh) {
                                let idNganh = chuyenNganhItem ? `${nganhItem}&&${chuyenNganhItem}` : nganhItem;
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
            console.log(error);
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

    app.put('/api/dao-tao/thoi-khoa-bieu-condition', app.permission.orCheck('dtThoiKhoaBieu:write', 'dtThoiKhoaBieu:manage'), (req, res) => {
        let { condition, changes } = req.body;
        if (typeof condition == 'number') app.model.dtThoiKhoaBieu.update(condition, changes, (error, item) => res.send({ error, item }));
        else if (typeof condition == 'object') {
            let { nam, hocKy, maMonHoc, loaiHinhDaoTao, bacDaoTao } = condition;
            app.model.dtThoiKhoaBieu.update({ maMonHoc, nam, hocKy, loaiHinhDaoTao, bacDaoTao }, changes, (error, item) => {
                res.send({ error, item });
            });
        }
        else app.model.dtThoiKhoaBieu.update({ id: condition }, changes, (error, item) => res.send({ error, item }));
    });

    app.delete('/api/dao-tao/thoi-khoa-bieu', app.permission.check('dtThoiKhoaBieu:delete'), (req, res) => {
        app.model.dtThoiKhoaBieu.delete({ id: req.body.id }, errors => res.send({ errors }));
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

    //Quyền của đơn vị------------------------------------------------------------------------------------------
    app.assignRoleHooks.addRoles('daoTao', { id: 'dtThoiKhoaBieu:manage', text: 'Đào tạo: Phân công giảng dạy' });

    app.permissionHooks.add('staff', 'checkRoleDTPhanCongGiangDay', (user, staff) => new Promise(resolve => {
        if (staff.donViQuanLy && staff.donViQuanLy.length && user.permissions.includes('faculty:login')) {
            app.permissionHooks.pushUserPermission(user, 'dtThoiKhoaBieu:manage');
        }
        resolve();
    }));

};