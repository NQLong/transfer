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

    app.get('/user/dao-tao/thoi-khoa-bieu', app.permission.orCheck('dtThoiKhoaBieu:read', 'dtThoiKhoaBieu:manage'), app.templates.admin);


    // APIs -----------------------------------------------------------------------------------------------------------------------------------------
    app.get('/api/dao-tao/thoi-khoa-bieu/page/:pageNumber/:pageSize', app.permission.orCheck('dtThoiKhoaBieu:read', 'dtThoiKhoaBieu:manage'), (req, res) => {
        const pageNumber = parseInt(req.params.pageNumber),
            pageSize = parseInt(req.params.pageSize),
            searchTerm = typeof req.query.condition === 'string' ? req.query.condition : '';
        const user = req.session.user, permissions = user.permissions;
        let donVi = '';
        if (!permissions.includes('dtThoiKhoaBieu:read')) {
            if (user.staff?.maDonVi) donVi = user.maDonVi;
            else return res.send({ error: 'Permission denied!' });
        }
        app.model.dtThoiKhoaBieu.searchPage(pageNumber, pageSize, donVi, searchTerm, (error, page) => {
            if (error || page == null) {
                res.send({ error });
            } else {
                const { totalitem: totalItem, pagesize: pageSize, pagetotal: pageTotal, pagenumber: pageNumber, rows: list, thoigianphancong } = page;
                const pageCondition = searchTerm;
                res.send({ error, page: { totalItem, pageSize, pageTotal, pageNumber, pageCondition, list, thoiGianPhanCong: thoigianphancong } });
            }
        });
    });

    app.get('/api/dao-tao/thoi-khoa-bieu/all', app.permission.check('user:login'), (req, res) => {
        const condition = req.query.condition || {};
        Object.keys(condition).forEach(key => { condition[key] === '' ? condition[key] = null : ''; });
        app.model.dtThoiKhoaBieu.getAll(condition, '*', 'id ASC ', (error, items) => res.send({ error, items }));
    });

    app.get('/api/dao-tao/thoi-khoa-bieu/item/:id', app.permission.check('user:login'), (req, res) => {
        app.model.dtThoiKhoaBieu.get({ id: req.params.id }, (error, item) => res.send({ error, item }));
    });

    app.post('/api/dao-tao/thoi-khoa-bieu', app.permission.check('dtThoiKhoaBieu:write'), async (req, res) => {
        let item = req.body.item || [];
        const thoiGianMoMon = await app.model.dtThoiGianMoMon.getActive();
        let { nam, hocKy } = (item.nam && item.hocKy) ? item : thoiGianMoMon;
        const onCreate = (index, monHoc) => new Promise(resolve => {
            const save = (i, m) => {
                if (i > parseInt(m.soNhom)) {
                    resolve(m);
                    return;
                }
                app.model.dtThoiKhoaBieu.get({ maMonHoc: m.maMonHoc, nhom: i, hocKy: m.hocKy, soTiet: m.soTiet }, (error, tkb) => {
                    if (!error && !tkb) {
                        m.nhom = i;
                        for (let i = 1; i <= m.soBuoiTuan; i++) {
                            app.model.dtThoiKhoaBieu.create({ ...m, nam, hocKy, soTiet: m.soTietBuoi, buoi: i }, () => { });
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
        });
    });

    app.put('/api/dao-tao/thoi-khoa-bieu', app.permission.check('dtThoiKhoaBieu:write'), (req, res) => {
        let changes = req.body.changes, id = req.body.id;
        if (changes.thu) {
            let { tietBatDau, thu, soTiet, phong } = changes;
            let condition = {
                tietBatDau,
                day: thu,
                soTiet
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
                                else res.send({ error: `Phòng ${changes.phong} không trống vào thứ ${changes.thu}, tiết ${changes.tietBatDau} - ${changes.tietBatDau + changes.soTiet - 1}` });
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
        if (condition.id) app.model.dtThoiKhoaBieu.update(condition, changes);
        if (typeof condition == 'object') {
            let { nam, hocKy, maMonHoc, khoaDangKy, maNganh } = condition;
            app.model.dtThoiKhoaBieu.update({ maMonHoc, nam, hocKy, khoaDangKy, maNganh }, changes, (error, item) => res.send({ error, item }));
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

    //Quyền của đơn vị------------------------------------------------------------------------------------------
    app.assignRoleHooks.addRoles('daoTao', { id: 'dtThoiKhoaBieu:manage', text: 'Đào tạo: Phân công giảng dạy' });

    app.permissionHooks.add('staff', 'checkRoleDTPhanCongGiangDay', (user, staff) => new Promise(resolve => {
        if (staff.donViQuanLy && staff.donViQuanLy.length && user.permissions.includes('faculty:login')) {
            app.permissionHooks.pushUserPermission(user, 'dtThoiKhoaBieu:manage');
        }
        resolve();
    }));
};