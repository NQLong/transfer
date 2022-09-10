module.exports = app => {
    const menu = {
        parentMenu: app.parentMenu.sdh,
        menus: {
            7003: {
                title: 'Chương trình đào tạo',
                link: '/user/sau-dai-hoc/chuong-trinh-dao-tao', icon: 'fa-university', backgroundColor: '#384C46'
            },
        },
    };
    app.permission.add(
        { name: 'sdhChuongTrinhDaoTao:read', menu },
        { name: 'sdhChuongTrinhDaoTao:manage', menu },
        { name: 'sdhChuongTrinhDaoTao:write' },
        { name: 'sdhChuongTrinhDaoTao:delete' },
    );

    app.permissionHooks.add('staff', 'addRoleSdhChuongTrinhDaoTao', (user, staff) => new Promise(resolve => {
        if (staff.maDonVi && staff.maDonVi == '37') {
            app.permissionHooks.pushUserPermission(user, 'sdhChuongTrinhDaoTao:read', 'sdhChuongTrinhDaoTao:write', 'sdhChuongTrinhDaoTao:delete');
            resolve();
        } else resolve();
    }));

    app.get('/user/sau-dai-hoc/chuong-trinh-dao-tao', app.permission.orCheck('sdhChuongTrinhDaoTao:read', 'sdhChuongTrinhDaoTao:manage'), app.templates.admin);
    app.get('/user/sau-dai-hoc/chuong-trinh-dao-tao/:ma', app.permission.orCheck('sdhChuongTrinhDaoTao:write', 'sdhChuongTrinhDaoTao:manage'), app.templates.admin);

    // APIs -----------------------------------------------------------------------------------------------------------------------------------------
    app.get('/api/sau-dai-hoc/chuong-trinh-dao-tao/page/:pageNumber/:pageSize', app.permission.orCheck('sdhChuongTrinhDaoTao:read', 'sdhChuongTrinhDaoTao:manage'), (req, res) => {
        let pageNumber = parseInt(req.params.pageNumber),
            pageSize = parseInt(req.params.pageSize),
            searchTerm = typeof req.query.searchTerm == 'string' ? req.query.searchTerm : '';
        const user = req.session.user, permissions = user.permissions;
        let donVi = req.query.donViFilter;
        if (!permissions.includes('sdhChuongTrinhDaoTao:read')) {
            if (user.staff.maDonVi) donVi = user.staff.maDonVi;
            else return res.send({ error: 'Permission denied!' });
        }
        let listLoaiHinhDaoTao = permissions.filter(item => item.includes('quanLyDaoTao')).map(item => item.split(':')[1]).toString();
        const { namDaoTao, heDaoTaoFilter } = req.query;
        if (listLoaiHinhDaoTao.includes('manager')) listLoaiHinhDaoTao = '';
        const filter = JSON.stringify({ donVi, namDaoTao, listLoaiHinhDaoTao, heDaoTaoFilter });
        app.model.sdhKhungDaoTao.searchPage(pageNumber, pageSize, searchTerm, filter, (error, result) => {
            if (error) res.send({ error });
            else {
                const { totalitem: totalItem, pagesize: pageSize, pagetotal: pageTotal, pagenumber: pageNumber, rows: list } = result;
                let pageCondition = {
                    searchTerm,
                    donViFilter: donVi
                };
                if (namDaoTao) {
                    pageCondition = { ...pageCondition, namDaoTao, heDaoTaoFilter };
                }
                res.send({ error, page: { totalItem, pageSize, pageTotal, pageNumber, list, pageCondition } });
            }
        });
    });

    app.get('/api/sau-dai-hoc/chuong-trinh-dao-tao', app.permission.orCheck('sdhChuongTrinhDaoTao:read', 'sdhChuongTrinhDaoTao:manage'), (req, res) => {
        app.model.sdhChuongTrinhDaoTao.getAll(req.query.condition, '*', 'id ASC', (error, items) => res.send({ error, items }));
    });

    app.get('/api/sau-dai-hoc/chuong-trinh-dao-tao/all-nam-dao-tao/', app.permission.orCheck('sdhChuongTrinhDaoTao:read', 'sdhChuongTrinhDaoTao:manage'), (req, res) => {
        const { maKhoa } = req.query;
        const condition = maKhoa ? { maKhoa } : {};
        app.model.sdhCauTrucKhungDaoTao.getAllNamDaoTao(condition, 'id, namDaoTao', 'namDaoTao ASC', (error, items) => res.send({ error, items }));
    });

    // app.get('/api/sau-dai-hoc/chuong-trinh-dao-tao/all-mon-hoc', app.permission.orCheck('sdhChuongTrinhDaoTao:read', 'sdhChuongTrinhDaoTao:manage'), async (req, res) => {
    //     try {
    //         let { khoaSv, maNganh, loaiHinhDaoTao, bacDaoTao } = req.query.condition;
    //         let thoiGianMoMon = await app.model.sdhThoiGianMoMon.getActive();
    //         //Lấy tất cả CTDT của ngành đó trong năm (e.g, Ngành Báo chí có 2 chuyên ngành vào năm 2022: Báo điện tử, Báo chính thống --> Lấy hết)
    //         thoiGianMoMon = thoiGianMoMon.find(item => item.loaiHinhDaoTao == loaiHinhDaoTao && item.bacDaoTao == bacDaoTao);
    //         let item = await app.model.sdhCauTrucKhungDaoTao.get({ khoa: khoaSv });
    //         const items = await app.model.sdhKhungDaoTao.getAll({ namDaoTao: item.id, maNganh, loaiHinhDaoTao, bacDaoTao });
    //         if (!items.length) throw 'Không có chương trình đào tạo nào của hệ này';
    //         let listPromise = items.map(item => {
    //             return new Promise(resolve =>
    //                 app.model.sdhChuongTrinhDaoTao.getAll({
    //                     statement: 'maKhungDaoTao = :maKhungDaoTao AND khoa != 33 AND khoa != 32',
    //                     parameter: { maKhungDaoTao: item.id }
    //                 }, (error, listMonHocCtdt) => {
    //                     listMonHocCtdt.forEach(monHocCTDT => monHocCTDT.chuyenNganh = item.chuyenNganh);
    //                     resolve(listMonHocCtdt || []);
    //                 }));
    //         });
    //         const danhSachMonMo = await app.model.dtDanhSachMonMo.getAll({ nam: item.id, maNganh, hocKy: thoiGianMoMon.hocKy });
    //         let danhSachMonMoChung = danhSachMonMo.filter(item => !item.chuyenNganh || item.chuyenNganh == '');
    //         // danhSachMonMoChuyenNganh = danhSachMonMo.filter(item => item.chuyenNganh && item.chuyenNganh != '');
    //         // const danhSachChuyenNganh = await app.model.dtDanhSachChuyenNganh.getAll({ namHoc: item.id });
    //         // let chuyenNganhMapper = {};
    //         // danhSachChuyenNganh.forEach(item => chuyenNganhMapper[item.id] = item.ten);

    //         Promise.all(listPromise).then(listMonHocCtdt => {
    //             let listMonHoc = listMonHocCtdt.flat().map(item => {
    //                 item.maNganh = maNganh;
    //                 return item;
    //             });
    //             let listMonHocChung = listMonHoc.filter((value, index, self) =>
    //                 index === self.findIndex((t) => (
    //                     t.maMonHoc === value.maMonHoc && t.tinhChatMon === 0
    //                 ))
    //             ).map(item => {
    //                 item.isMo = danhSachMonMoChung.map(item => item.maMonHoc).includes(item.maMonHoc);
    //                 if (item.isMo) {
    //                     ['soLop', 'soTietBuoi', 'soBuoiTuan', 'soLuongDuKien'].forEach(textBox => item[textBox] = danhSachMonMoChung.find(monChung => monChung.maMonHoc == item.maMonHoc)[textBox]);
    //                 }
    //                 item.chuyenNganh = '';
    //                 return item;
    //             });
    //             // let monTheoChuyenNganh = listMonHoc
    //             //     .filter(item => item.tinhChatMon == 1)
    //             //     .map(item => {
    //             //         item.isMo = danhSachMonMoChuyenNganh.map(item => item.maMonHoc).includes(item.maMonHoc);
    //             //         // item.tenChuyenNganh = chuyenNganhMapper[item.chuyenNganh];
    //             //         if (item.isMo) {
    //             //             ['soLop', 'soTietBuoi', 'soBuoiTuan', 'soLuongDuKien'].forEach(textBox => item[textBox] = JSON.parse(danhSachMonMoChuyenNganh.find(monChuyenNganh => monChuyenNganh.maMonHoc == item.maMonHoc)[textBox]));
    //             //             item.currentCn = JSON.parse(danhSachMonMoChuyenNganh.find(monChuyenNganh => monChuyenNganh.maMonHoc == item.maMonHoc)['chuyenNganh']);
    //             //         }
    //             //         return item;
    //             //     });
    //             // let tmp = monTheoChuyenNganh.reduce((prev, curr) => {
    //             //     delete curr.id;
    //             //     if (prev.some(item => item.maMonHoc == curr.maMonHoc)) {
    //             //         let element = prev.find(item => item.maMonHoc == curr.maMonHoc);
    //             //         element.chuyenNganh = [...element.chuyenNganh, curr.chuyenNganh];
    //             //         element.tenChuyenNganh = [...element.tenChuyenNganh, curr.tenChuyenNganh];
    //             //     } else {
    //             //         curr.chuyenNganh = [curr.chuyenNganh];
    //             //         curr.tenChuyenNganh = [curr.tenChuyenNganh];
    //             //         prev.push(curr);
    //             //     }
    //             //     return prev;
    //             // }, []);
    //             res.send({ listMonHocChung });
    //         });
    //     } catch (error) {
    //         res.send({ error });
    //     }
    // });


    app.get('/api/sau-dai-hoc/khung-dao-tao/:ma', app.permission.orCheck('sdhChuongTrinhDaoTao:read', 'sdhChuongTrinhDaoTao:manage'), (req, res) => {
        const condition = req.query.condition || {};
        Object.keys(condition).forEach(key => { condition[key] === '' ? condition[key] = null : ''; });
        app.model.sdhKhungDaoTao.get(condition, '*', 'id ASC', (error, items) => res.send({ error, items }));
    });

    app.get('/api/sau-dai-hoc/khung-dao-tao/item/:id', app.permission.orCheck('sdhChuongTrinhDaoTao:read', 'sdhChuongTrinhDaoTao:manage'), async (req, res) => {
        try {
            let item = await app.model.sdhKhungDaoTao.get({ id: req.params.id }, '*', 'id ASC');
            let cauTrucKhung = await app.model.sdhCauTrucKhungDaoTao.get({ id: item.namDaoTao });
            res.send({ item, cauTrucKhung });
        } catch (error) {
            res.send({ error });
        }
    });

    app.post('/api/sau-dai-hoc/chuong-trinh-dao-tao', app.permission.orCheck('sdhChuongTrinhDaoTao:write', 'sdhChuongTrinhDaoTao:manage'), (req, res) => {
        let dataKhung = req.body.item.data, dataMon = req.body.item.items || [];
        const condition = {
            statement: 'namDaoTao = :namDaoTao AND maNganh = :maNganh AND (chuyenNganh is NULL OR chuyenNganh = \'\' OR chuyenNganh = :chuyenNganh)',
            parameter: {
                namDaoTao: dataKhung.namDaoTao, maNganh: dataKhung.maNganh, chuyenNganh: dataKhung.chuyenNganh
            }
        };
        app.model.sdhKhungDaoTao.get(condition, (error, createdCTDT) => {
            if (!error && !createdCTDT) {
                app.model.sdhKhungDaoTao.create(dataKhung, (error, item) => {
                    if (!error) {
                        const create = (index = 0) => {
                            if (index == dataMon.length) {
                                res.send({ error, item, warning: (!dataMon || !dataMon.length) ? 'Chưa có môn học nào được chọn' : null });
                            } else {
                                dataMon[index].maKhungDaoTao = item.id;
                                delete dataMon[index].id;
                                app.model.sdhChuongTrinhDaoTao.create(dataMon[index], (error, item1) => {
                                    if (error || !item1) res.send({ error });
                                    else create(index + 1);
                                });
                            }
                        };
                        create();
                    } else res.send({ error });
                });
            } else res.send({ error: 'Chuyên ngành/Ngành đã tồn tại!' });
        });

    });

    app.put('/api/sau-dai-hoc/chuong-trinh-dao-tao', app.permission.orCheck('sdhChuongTrinhDaoTao:write', 'sdhChuongTrinhDaoTao:manage'), async (req, res) => {
        let id = req.body.id, changes = req.body.changes;
        const updateCTDT = (listMonHoc) => new Promise((resolve, reject) => {
            app.model.sdhChuongTrinhDaoTao.delete({ maKhungDaoTao: id }, (error) => {
                if (error) reject(error);
                else {
                    const newCTDT = [];
                    const update = (index = 0) => {
                        if (index == listMonHoc.length) {
                            resolve(newCTDT);
                        } else {
                            let monHoc = listMonHoc[index];
                            monHoc.maKhungDaoTao = parseInt(id);
                            delete monHoc.id;
                            app.model.sdhChuongTrinhDaoTao.create(monHoc, (error, item) => {
                                if (error || !item) reject(error);
                                else {
                                    newCTDT.push(item);
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
            let listMonHocCTDT = await updateCTDT(changes.items || []);
            app.model.sdhKhungDaoTao.update({ id }, changes.data, (error, item) => res.send({ error, item: app.clone(item, { listMonHocCTDT }) }));
        } catch (error) {
            res.send({ error });
        }
    });

    app.delete('/api/sau-dai-hoc/chuong-trinh-dao-tao', app.permission.orCheck('sdhChuongTrinhDaoTao:delete', 'sdhChuongTrinhDaoTao:manage'), (req, res) => {
        app.model.sdhChuongTrinhDaoTao.delete({ id: req.body.id }, errors => res.send({ errors }));
    });

    // //Phân quyền ------------------------------------------------------------------------------------------
    // app.assignRoleHooks.addRoles('daoTao', { id: 'sdhChuongTrinhDaoTao:manage', text: 'Đào tạo: Quản lý Chương trình đào tạo' });

    // app.permissionHooks.add('staff', 'checkRoleDTQuanLyCTDT', (user, staff) => new Promise(resolve => {
    //     if (staff.donViQuanLy && staff.donViQuanLy.length && user.permissions.includes('faculty:login')) {
    //         app.permissionHooks.pushUserPermission(user, 'sdhChuongTrinhDaoTao:manage');
    //     }
    //     resolve();
    // }));

    // app.permissionHooks.add('assignRole', 'checkRoleDTQuanLyCTDT', (user, assignRoles) => new Promise(resolve => {
    //     const inScopeRoles = assignRoles.filter(role => role.nhomRole == 'daoTao');
    //     inScopeRoles.forEach(role => {
    //         if (role.tenRole == 'sdhChuongTrinhDaoTao:manage') {
    //             app.permissionHooks.pushUserPermission(user, 'sdhChuongTrinhDaoTao:manage', 'dMonHoc:manage', 'dtNganhDaoTao:manage');
    //         }
    //     });
    //     resolve();
    // }));

    app.get('/api/sau-dai-hoc/chuong-trinh-dao-tao/download-word/:id', app.permission.check('sdhChuongTrinhDaoTao:read'), async (req, res) => {
        if (req.params && req.params.id) {
            const id = req.params.id;
            let kdt = await app.model.sdhKhungDaoTao.get({ id }, '*', 'id ASC');
            const { maNganh, tenNganh, trinhDoDaoTao,
                bacDaoTao, thoiGianDaoTao, tenVanBang, namDaoTao, maKhoa
            } = kdt;
            let khoa = await app.model.dmKhoaSauDaiHoc.get({ ma: maKhoa });
            let bac = await app.model.dmHocSdh.get({ ma: bacDaoTao });
            let ctkdt = await app.model.sdhCauTrucKhungDaoTao.get({ id: namDaoTao }, '*', 'id ASC');
            const mucCha = JSON.parse(ctkdt.mucCha || '{}');
            const mucCon = JSON.parse(ctkdt.mucCon || '{}');
            const chuongTrinhDaoTao = { parents: mucCha?.chuongTrinhDaoTao, childs: mucCon?.chuongTrinhDaoTao };
            const ctdt = [];
            let monHocs = await app.model.sdhChuongTrinhDaoTao.getAll({ maKhungDaoTao: id }, '*', 'id ASC');
            let sumLt = monHocs.map(item => item.tinChiLyThuyet).reduce((prev, cur) => prev + cur, 0),
                sumTh = monHocs.map(item => item.tinChiThucHanh).reduce((prev, cur) => prev + cur, 0),
                sumTong = sumLt + sumTh;
            const pushMhToObj = (idKkt, idKhoi, obj) => {
                monHocs.forEach(monHoc => {
                    if ((idKkt && idKhoi && monHoc.maKhoiKienThucCon == idKkt && monHoc.maKhoiKienThuc == idKhoi) || (idKhoi && !idKkt && monHoc.maKhoiKienThuc == idKhoi)) {
                        const { maMonHoc, tenMonHoc, loaiMonHoc, tinChiLyThuyet, tinChiThucHanh } = monHoc;
                        const loaiMonHocStr = loaiMonHoc == 0 ? 'Bắt buộc' : 'Tự chọn';
                        obj.mh.push({ maMonHoc, tenMonHoc, loaiMonHoc: loaiMonHocStr, tinChiLyThuyet, tinChiThucHanh, tongTinChi: tinChiLyThuyet + tinChiThucHanh });
                    }
                });
            };
            Object.keys(chuongTrinhDaoTao.parents).forEach((key, idx) => {
                const khoi = chuongTrinhDaoTao.parents[key];
                const { id: idKhoi, text } = khoi;
                const tmpCtdt = {
                    stt: idx + 1,
                    name: text,
                    mh: [],
                };
                if (chuongTrinhDaoTao.childs[key]) {
                    ctdt.push(tmpCtdt);
                    chuongTrinhDaoTao.childs[key].forEach(kkt => {
                        const { id: idKkt, value } = kkt;
                        const tmpCtdt = {
                            stt: '',
                            name: value.text,
                            mh: [],
                        };
                        pushMhToObj(idKkt, idKhoi, tmpCtdt);
                        ctdt.push(tmpCtdt);
                    });
                } else {
                    pushMhToObj(null, idKhoi, tmpCtdt);
                    ctdt.push(tmpCtdt);
                }
            });
            const source = app.path.join(__dirname, 'resource', 'ctdt_word.docx');
            new Promise(resolve => {
                const data = {
                    tenNganhVi: JSON.parse(tenNganh).vi,
                    tenNganhEn: JSON.parse(tenNganh).en,
                    maNganh,
                    trinhDoDaoTao,
                    bacDaoTao: bac.ten,
                    tenKhoa: khoa.ten,
                    thoiGianDaoTao, sumLt, sumTh, sumTong,
                    tenVanBangVi: JSON.parse(tenVanBang).vi,
                    tenVanBangEn: JSON.parse(tenVanBang).en,
                    ctdt,
                };
                resolve(data);
            }).then((data) => {
                app.docx.generateFile(source, data, (error, data) => {
                    res.send({ error, data });
                });
            });
        } else {
            res.send({ error: 'No permission' });
        }
    });
};