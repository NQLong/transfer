module.exports = app => {
    const menu = {
        parentMenu: app.parentMenu.daoTao,
        menus: {
            7002: { title: 'Danh sách môn học mở trong học kỳ', link: '/user/dao-tao/dang-ky-mo-mon', icon: 'fa-paper-plane-o', backgroundColor: '#8E9763', groupIndex: 1 },
        },
    };
    app.permission.add(
        { name: 'dtDangKyMoMon:read', menu },
        { name: 'dtDangKyMoMon:manage', menu },
        { name: 'dtDangKyMoMon:write' },
        { name: 'dtDangKyMoMon:delete' },
    );

    app.get('/user/dao-tao/dang-ky-mo-mon', app.permission.orCheck('dtDangKyMoMon:read', 'dtDangKyMoMon:manage'), app.templates.admin);
    app.get('/user/dao-tao/dang-ky-mo-mon/:id', app.permission.orCheck('dtDangKyMoMon:read', 'dtDangKyMoMon:manage'), app.templates.admin);

    //APIs-----------------------------------------------------------------------------------------------------------------------------------------------------

    app.get('/api/dao-tao/dang-ky-mo-mon/page/:pageNumber/:pageSize', app.permission.orCheck('dtDangKyMoMon:read', 'dtDangKyMoMon:manage'), (req, res) => {
        let pageNumber = parseInt(req.params.pageNumber),
            pageSize = parseInt(req.params.pageSize),
            searchTerm = typeof req.query.searchTerm === 'string' ? req.query.searchTerm : '';
        let donViFilter = req.query.donViFilter,
            donVi = req.session.user.staff ? req.session.user.staff.maDonVi : null;

        if (req.session.user.permissions.exists(['dtDangKyMoMon:read'])) donVi = donViFilter || null;
        app.model.dtDangKyMoMon.searchPage(pageNumber, pageSize, donVi, searchTerm, async (error, page) => {
            if (error || page == null) {
                res.send({ error });
            } else {
                let thoiGianMoMon = await app.model.dtThoiGianMoMon.getActive();
                const { totalitem: totalItem, pagesize: pageSize, pagetotal: pageTotal, pagenumber: pageNumber, rows: list } = page;
                const pageCondition = searchTerm;
                res.send({ error, page: { totalItem, pageSize, pageTotal, pageNumber, pageCondition, list, thoiGianMoMon: thoiGianMoMon || {} } });
            }
        });
    });

    app.get('/api/dao-tao/get-chuong-trinh-du-kien/all', app.permission.orCheck('dtDangKyMoMon:read', 'dtDsMonMo:read', 'dtDangKyMoMon:manage', 'dtDsMonMo:manage'), async (req, res) => {
        let thoiGianMoMon = await app.model.dtThoiGianMoMon.getActive();
        let yearth = req.query.yearth,
            year = thoiGianMoMon.nam - yearth,
            semester = thoiGianMoMon.hocKy + yearth * 2;
        // donVi = req.session.user.staff ? req.session.user.staff.maDonVi : '';
        app.model.dtKhungDaoTao.get({ namDaoTao: year }, (error, item) => {
            if (error) {
                res.send({ error: `Lỗi lấy CTDT năm ${year}` });
                return;
            } else if (!item) {
                res.send({ error: `Năm ${year} không tồn tại CTDT nào!` });
                return;
            } else {
                let condition = {
                    statement: 'maKhungDaoTao = (:id) AND hocKyDuKien = (:semester)',
                    parameter: { id: item.id, semester }
                };
                app.model.dtChuongTrinhDaoTao.getAll(condition, (error, items) => {
                    if (error) {
                        res.send({ error });
                        return;
                    } else {
                        res.send({ item: app.clone({}, { items, ctdt: item, thoiGianMoMon }) });
                    }
                });
            }
        });
    });

    app.post('/api/dao-tao/dang-ky-mo-mon', app.permission.orCheck('dtDangKyMoMon:manage', 'dtDangKyMoMon:write'), async (req, res) => {
        let thoiGianMoMon = await app.model.dtThoiGianMoMon.getActive(),
            hocKy = thoiGianMoMon.hocKy,
            nam = thoiGianMoMon.nam;
        let data = req.body.data;
        if (data.nam != nam || data.hocKy != hocKy) {
            res.send({ error: 'Không thuộc thời gian đăng ký hiện tại' });
            return;
        } else {
            app.model.dtDangKyMoMon.get({
                nam, hocKy, maNganh: data.maNganh
            }, (error, item) => {
                if (!error && item) res.send({ error: `Mã ngành ${data.maNganh} đã được tạo trong HK${hocKy} - năm ${nam}` });
                else app.model.dtDangKyMoMon.create(data, (error, item) => res.send({ error, item }));
            });
        }
    });

    app.put('/api/dao-tao/dang-ky-mo-mon', app.permission.orCheck('dtDangKyMoMon:manage', 'dtDangKyMoMon:write'), async (req, res) => {
        let thoiGianMoMon = await app.model.dtThoiGianMoMon.getActive(),
            hocKy = thoiGianMoMon.hocKy,
            nam = thoiGianMoMon.nam;
        let { data, id } = req.body;
        if (!data.nam || !data.hocKy || data.nam != nam || data.hocKy != hocKy) {
            res.send({ error: 'Không thuộc thời gian đăng ký hiện tại' });
            return;
        } else {
            const updateDanhSachMonMo = (list) => new Promise((resolve, reject) => {
                app.model.dtDanhSachMonMo.delete({ maDangKy: id }, (error) => {
                    if (error) reject(error);
                    else {
                        const newDanhSach = [];
                        const update = (index = 0) => {
                            if (index == list.length) {
                                resolve();
                            } else {
                                let monHoc = list[index];
                                delete monHoc.id;
                                app.model.dtDanhSachMonMo.create(monHoc, (error, item) => {
                                    if (error || !item) reject(error);
                                    else {
                                        newDanhSach.push(item);
                                        update(index + 1);
                                    }
                                });
                            }
                        };
                        update();
                    }
                });
            });
            try {
                data.data && data.data.length ? await updateDanhSachMonMo(data.data) : [];
                app.model.dtDangKyMoMon.update({ id }, { thoiGian: new Date().getTime() }, (error, item) => res.send({ error, item }));
            } catch (error) {
                res.send({ error });
            }
        }
    });

    // app.post('/api/dao-tao/dang-ky-mo-mon', app.permission.orCheck('dtDangKyMoMon:manage', 'dtDangKyMoMon:write'), async (req, res) => {
    //     let thoiGianMoMon = await app.model.dtThoiGianMoMon.getActive(),
    //         hocKy = thoiGianMoMon.hocKy,
    //         nam = thoiGianMoMon.nam;
    //     let data = req.body.data,
    //         khoa = req.session.user.staff ? req.session.user.staff.maDonVi : null,
    //         dangKyMoMonData = { nam, hocKy, khoa };
    //     if (!khoa) res.send({ error: 'You don\'t have permission' });
    //     else app.model.dtDangKyMoMon.get(dangKyMoMonData, (error, item) => {
    //         if (!error && item) res.send({ error: `Khoa/Bộ môn đã đăng ký cho học kỳ ${hocKy} - năm ${nam}` });
    //         else {
    //             dangKyMoMonData.thoiGian = new Date().getTime();
    //             app.model.dtDangKyMoMon.create(dangKyMoMonData, (error, item) => {
    //                 const create = (index = 0) => {
    //                     if (index == data.length) {
    //                         res.send({ item });
    //                     } else {
    //                         delete data[index].id;
    //                         data[index].nam = nam;
    //                         data[index].maDangKy = item.id;
    //                         app.model.dtDanhSachMonMo.create(data[index], (error, item1) => {
    //                             if (error || !item1) {
    //                                 res.send({ error });
    //                                 return;
    //                             }
    //                             else create(index + 1);
    //                         });
    //                     }
    //                 };
    //                 if (!error && item) create();
    //                 else res.send({ error });
    //             });
    //         }
    //     });
    // });


    //Phân quyền cho đơn vị ---------------------------------------------------------------------------------------------------------------
    app.assignRoleHooks.addRoles('daoTao', { id: 'dtDangKyMoMon:manage', text: 'Đào tạo: Quản lý Mở môn' });

    app.permissionHooks.add('staff', 'checkRoleDTDangKyMoMon', (user, staff) => new Promise(resolve => {
        if (staff.donViQuanLy && staff.donViQuanLy.length && user.permissions.includes('faculty:login')) {
            app.permissionHooks.pushUserPermission(user, 'dtDangKyMoMon:manage');
        }
        resolve();
    }));

    //Gán quyền ----------------------------------------------------------------------------
    app.permissionHooks.add('assignRole', 'checkRoleDTDangKyMoMon', (user, assignRoles) => new Promise(resolve => {
        const inScopeRoles = assignRoles.filter(role => role.nhomRole == 'daoTao');
        inScopeRoles.forEach(role => {
            if (role.tenRole == 'dtDangKyMoMon:manage') {
                app.permissionHooks.pushUserPermission(user, 'dtDangKyMoMon:manage');
            }
        });
        resolve();
    }));
};