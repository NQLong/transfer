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
            // console.log(promiseList);
            // await Promise.all(promiseList);
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

    // Export xlsx
    app.get('/api/dao-tao/thoi-khoa-bieu/download-excel', app.permission.check('dtThoiKhoaBieu:export'), async (req, res) => {
        try {
            let filter = app.parse(req.query.filter || {});
            filter = app.stringify(filter, '');
            let data = await app.model.dtThoiKhoaBieu.searchPage(1, 1000000, filter, '');
            const workBook = app.excel.create();
            const ws = workBook.addWorksheet('Thoi khoa bieu');

            ws.columns = [
                { header: 'STT', key: 'stt', width: 5 },
                { header: 'MÃ', key: 'ma', width: 10 },
                { header: 'MÔN HỌC', key: 'monHoc', width: 40 },
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
                { header: 'MÃ NGÀNH', key: 'maNganh', width: 20 },
                { header: 'NGÀNH', key: 'nganh', width: 20 },
                { header: 'GIẢNG VIÊN', key: 'giangVien', width: 30 }
            ];
            ws.getRow(1).alignment = { ...ws.getRow(1).alignment, vertical: 'middle', wrapText: true };
            ws.getRow(1).font = { name: 'Times New Roman' };
            // ws.getRow(1).font = {
            //     name: 'Times New Roman',
            //     family: 4,
            //     size: 12,
            //     bold: true,
            //     color: { argb: 'FF000000' }
            // };

            const list = data.rows;
            list.forEach((item, index) => {
                ws.addRow({
                    stt: index + 1,
                    ma: item.maMonHoc,
                    monHoc: `${app.parse(item.tenMonHoc).vi}`,
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
                    maNganh: item.maNganh,
                    nganh: item.tenNganh,
                    giangVien: item.tenGiangVien,
                }, index === 0 ? 'n' : 'i');

                if (index === 0) {
                    ws.getRow(2).alignment = { ...ws.getRow(2).alignment, vertical: 'middle', wrapText: true };
                    ws.getRow(2).font = { name: 'Times New Roman' };
                    // ws.getCell('D' + 2).alignment = { ...ws.getRow(2).alignment, horizontal: 'center' };
                }
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

};
