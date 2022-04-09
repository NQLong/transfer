// eslint-disable-next-line no-unused-vars
module.exports = app => {

    const menu = {
        parentMenu: app.parentMenu.truyenThong,
        menus: {
            6020: { title: 'Doanh nghiệp', link: '/user/truyen-thong/doanh-nghiep', icon: 'fa-university', backgroundColor: '#ffb300', groupIndex: 4 }
        }
    };

    // const companyMenu = {
    //     parentMenu: app.parentMenu.user,
    //     menus: {
    //         1631: { title: 'Doanh nghiệp', link: '/user/doanh-nghiep/list', icon: 'fa-briefcase', backgroundColor: '#ffb300', groupIndex: 0 }
    //     }
    // };

    app.permission.add(
        { name: 'dnDoanhNghiep:read', menu },
        { name: 'dnDoanhNghiep:manage', menu },
        { name: 'dnDoanhNghiep:write' },
        { name: 'dnDoanhNghiep:delete' }
    );

    app.get('/user/truyen-thong/doanh-nghiep', app.permission.orCheck('dnDoanhNghiep:read', 'dnDoanhNghiep:manage'), app.templates.admin);
    app.get('/user/truyen-thong/doanh-nghiep/edit/:doanhNghiepId', app.permission.orCheck('dnDoanhNghiep:read', 'dnDoanhNghiep:manage'), app.templates.admin);
    app.get('/doanh-nghiep/:hiddenShortName', app.templates.home);

    // APIs Admin Doanh nghiep -----------------------------------------------------------------------------------------
    app.get('/api/doi-ngoai/doanh-nghiep/page/:pageNumber/:pageSize', app.permission.orCheck('dnDoanhNghiep:read', 'dnDoanhNghiep:manage'), (req, res) => {
        const pageNumber = parseInt(req.params.pageNumber),
            pageSize = parseInt(req.params.pageSize);
        const searchTerm = req.query.condition ? req.query.condition.searchText.toLowerCase() || '' : '';
        const user = req.session.user, permissions = user.permissions;
        let maDonVi = '';
        if (!permissions.includes('dnDoanhNghiep:read')) { // Chỉ quản lý doanh nghiệp trong đơn vị
            if (user.maDonVi) maDonVi = user.maDonVi;
            else return res.send({ error: 'Permission denied!' });
        }

        app.model.dnDoanhNghiep.searchPage(pageNumber, pageSize, searchTerm, maDonVi, (error, page) => {
            const { totalitem: totalItem, pagesize: pageSize, pagetotal: pageTotal, pagenumber: pageNumber, rows: list } = page;
            res.send({ error, page: { totalItem, pageSize, pageTotal, pageNumber, list } });
        });
    });

    app.get('/api/doi-ngoai/doanh-nghiep/item/:id', app.permission.check('user:login'), (req, res) => {
        app.model.dnDoanhNghiep.get({ id: req.params.id }, (error, item) => {
            app.model.dnLinhVucKinhDoanh.getAll({ idDoanhNghiep: req.params.id }, (error1, listLV) => {
                item.listLV = listLV || [];
                app.model.dnLoaiDoanhNghiep.getAll({ doanhNghiep: req.params.id }, (error2, listLoaiDoanhNghiep) => {
                    item.listLoaiDoanhNghiep = listLoaiDoanhNghiep || [];
                    res.send({ error, item });
                });
            });
        });
    });

    app.post('/api/doi-ngoai/doanh-nghiep', app.permission.orCheck('dnDoanhNghiep:write', 'dnDoanhNghiep:manage'), (req, res) => {
        const user = req.session.user, permissions = user.permissions;
        let newData = req.body.item;
        if (!permissions.includes('dnOoanhNghiep:write')) { // Chỉ quản lý doanh nghiệp trong đơn vị
            if (user.maDonVi) newData.donViPhuTrach = user.maDonVi;
            else return res.send({ error: 'Permission denied!' });
        }
        const hiddenShortName = app.toEngWord(newData.tenVietTat).toLowerCase().replaceAll(' ', '-');
        newData.hiddenShortName = hiddenShortName;
        app.model.dnDoanhNghiep.get({ hiddenShortName }, (error, item) => {
            if (error) {
                res.send({ error });
            } else if (item) {
                res.send({ duplicateShortName: true });
            } else {
                newData.hiddenShortName = hiddenShortName;
                let linhVuc = newData.linhVucs, loai = newData.listLoaiDoanhNghiep;
                app.model.dnDoanhNghiep.create(newData, (error, item) => {
                    if (!error) {
                        const create = (index = 0) => {
                            if (index == linhVuc.length) {
                                res.send({ error, id: item.id });
                            } else {
                                app.model.dnLinhVucKinhDoanh.create({ linhVuc: linhVuc[index], idDoanhNghiep: item.id }, (error, item1) => {
                                    if (error || !item1) res.send({ error });
                                    else {
                                        app.model.dnLoaiDoanhNghiep.create({ loai: Number(loai[index]), doanhNghiep: item.id }, (error, item2) => {
                                            if (error || !item2) res.send({ error });
                                            else create(index + 1);
                                        });
                                    }
                                });
                            }
                        };
                        create();
                    } else res.send({ error });
                });
            }
        });
    });

    app.put('/api/doi-ngoai/doanh-nghiep', app.permission.orCheck('dnDoanhNghiep:write', 'dnDoanhNghiep:manage'), async (req, res) => {
        const changes = req.body.changes, id = req.body.id;
        const user = req.session.user, permissions = user.permissions;
        let updateCondition = { id: req.body.id };
        if (!permissions.includes('dnOoanhNghiep:write')) { // Chỉ quản lý doanh nghiệp trong đơn vị
            if (user.maDonVi) {
                updateCondition.donViPhuTrach = user.maDonVi;
                delete changes.donViPhuTrach;
            }
            else return res.send({ error: 'Permission denied!' });
        }
        const updateLoaiDoanhNghiep = (listLoaiDoanhNghiep) => new Promise((resolve, reject) => {
            app.model.dnLoaiDoanhNghiep.delete({ doanhNghiep: id }, (error) => {
                if (error) reject(error);
                else {
                    const newLoaiDoanhNghiep = [];
                    const update = (index = 0) => {
                        if (index == listLoaiDoanhNghiep.length) {
                            resolve(newLoaiDoanhNghiep);
                        } else {
                            app.model.dnLoaiDoanhNghiep.create({ loai: listLoaiDoanhNghiep[index], doanhNghiep: id }, (error, item) => {
                                if (error || !item) reject(error);
                                else {
                                    newLoaiDoanhNghiep.push(item);
                                    update(index + 1);
                                }
                            });
                        }
                    };
                    update();
                }
            });
        });

        const updateLinhVucKinhDoanh = (linhVucs) => new Promise((resolve, reject) => {
            app.model.dnLinhVucKinhDoanh.delete({ idDoanhNghiep: id }, (error) => {
                if (error) reject(error);
                else {
                    const newLinhVucs = [];
                    const update = (index = 0) => {
                        if (index == linhVucs.length) {
                            resolve(newLinhVucs);
                        } else {
                            app.model.dnLinhVucKinhDoanh.create({ linhVuc: linhVucs[index], idDoanhNghiep: id }, (error, item) => {
                                if (error || !item) reject(error);
                                else {
                                    newLinhVucs.push(item);
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
            let listLV = changes.linhVucs && changes.linhVucs.length ? await updateLinhVucKinhDoanh(changes.linhVucs) : [],
                listLoaiDoanhNghiep = changes.listLoaiDoanhNghiep && changes.listLoaiDoanhNghiep.length ? await updateLoaiDoanhNghiep(changes.listLoaiDoanhNghiep) : [];
            if (changes.tenVietTat) {
                const hiddenShortName = app.toEngWord(changes.tenVietTat).toLowerCase().replaceAll(' ', '-');
                app.model.dnDoanhNghiep.getAll({ hiddenShortName }, (error, items) => {
                    if (error) {
                        res.send({ error });
                    } else if (items && items.length > 1) {
                        res.send({ duplicateShortName: true });
                    } else if (items && items.length == 1 && items[0].id != req.body.id) {
                        res.send({ duplicateShortName: true });
                    } else {
                        changes.hiddenShortName = hiddenShortName;
                        app.model.dnDoanhNghiep.update(updateCondition, changes, (error, item) => res.send({ error, item: app.clone(item, { listLV, listLoaiDoanhNghiep }) }));
                    }
                });
            } else {
                app.model.dnDoanhNghiep.update(updateCondition, changes, (error, item) => res.send({ error, item: app.clone(item, { listLV, listLoaiDoanhNghiep }) }));
            }
        } catch (error) {
            res.send({ error });
        }
    });


    app.delete('/api/doi-ngoai/doanh-nghiep', app.permission.check('dnDoanhNghiep:delete'), (req, res) => {
        app.model.dnLinhVucKinhDoanh.delete({ idDoanhNghiep: req.body.id }, error => {
            if (error) {
                res.send({ error });
            } else {
                app.model.dnDoanhNghiep.get({ id: req.body.id }, (error, item) => {
                    if (error) {
                        res.send({ error: 'Không tìm thấy doanh nghiệp' });
                    } else {
                        if (item.image) app.deleteImage(item.image);
                        app.model.dnDoanhNghiep.delete({ id: req.body.id }, (error) => {
                            res.send({ error });
                        });
                    }
                });
            }
        });
    });

    //Upload Hook-------------------------------------------------------------------------------------------------------
    app.createFolder(app.path.join(app.publicPath, 'img', 'dnDoanhNghiep'));

    const uploadDoanhNghiepLogo = (req, fields, files, param, done) => {
        if (fields.userData && fields.userData[0].startsWith('dnDoanhNghiep:') && files.doanhNghiepLogo && files.doanhNghiepLogo.length > 0) {
            app.uploadComponentImage(req, 'dnDoanhNghiep', app.model.dnDoanhNghiep, { id: fields.userData[0].substring(14) }, files.doanhNghiepLogo[0].path, done);
        }
    };

    app.uploadHooks.add('uploadDoanhNghiepLogo', (req, fields, files, params, done) => {
        app.permission.has(req, () => uploadDoanhNghiepLogo(req, fields, files, params, done), done, 'dnDoanhNghiep:write');
    });

    app.uploadHooks.add('uploadDnDoanhNghiepCkEditor', (req, fields, files, params, done) =>
        app.permission.has(req, () => app.uploadCkEditorImage('dnDoanhNghiep', fields, files, params, done), done, 'dnDoanhNghiep:write'));

    app.uploadHooks.add('uploadDoanhNghiepLogoManager', (req, fields, files, params, done) => {
        app.permission.has(req, () => uploadDoanhNghiepLogo(req, fields, files, params, done), done, 'dnDoanhNghiep:manage');
    });

    app.uploadHooks.add('uploadDnDoanhNghiepCkEditorManager', (req, fields, files, params, done) =>
        app.permission.has(req, () => app.uploadCkEditorImage('dnDoanhNghiep', fields, files, params, done), done, 'dnDoanhNghiep:manage'));


    // APIs Home page-----------------------------------------------------------------------------------------------------------------
    app.get('/user/doi-ngoai/doanh-nghiep/item/:id', (req, res) => {
        app.model.dnDoanhNghiep.get({ id: req.params.id, kichHoat: 1 }, 'id, quocGia, tenVietTat, tenDayDu, linhVucKinhDoanh, moTa, namThanhLap, theManh, diaChi, email, phone, image, website', 'id', (error, item) => {
            if (error || !item) {
                res.send({ error });
            } else {
                if (item.quocGia || item.linhVucKinhDoanh) {
                    app.model.dmQuocGia.get({ maCode: item.quocGia }, (error, quocGia) => {
                        if ((error || !quocGia) && !item.linhVucKinhDoanh) {
                            res.send({ item });
                        } else {
                            if (quocGia) {
                                item.tenQuocGia = JSON.stringify({ vi: quocGia.tenQuocGia, en: quocGia.country });
                                if (item.linhVucKinhDoanh) {
                                    let linhVucKinhDoanh = item.linhVucKinhDoanh.split(',');
                                    app.model.dnDoanhNghiep.getLinhVucKinhDoanh(linhVucKinhDoanh, (error, tenCacLinhVuc) => {
                                        item.tenCacLinhVuc = tenCacLinhVuc;
                                        res.send({ item });
                                    });
                                } else {
                                    res.send({ item });
                                }
                            }
                        }
                    });
                } else {
                    res.send({ item });
                }
            }
        });
    });

    app.get('/user/doi-ngoai/doanh-nghiep/doitac/:hiddenShortName', (req, res) => {
        new Promise((resolve, reject) => {
            app.model.dnDoanhNghiep.get({ hiddenShortName: req.params.hiddenShortName }, 'id, quocGia, tenVietTat, tenDayDu, moTa, namThanhLap, theManh, diaChi, email, phone, image, website', 'id', (error, item) => {
                if (error || !item) {
                    reject(error);
                } else {
                    if (item.quocGia || item.linhVucKinhDoanh) {
                        app.model.dmQuocGia.get({ maCode: item.quocGia }, (error, quocGia) => {
                            if ((error || !quocGia) && !item.linhVucKinhDoanh) {
                                resolve(item);
                            } else {
                                if (quocGia) {
                                    item.tenQuocGia = JSON.stringify({ vi: quocGia.tenQuocGia, en: quocGia.country });
                                    app.model.dnLinhVucKinhDoanh.getAll({ idDoanhNghiep: item.id }, (error, linhVucKinhDoanh) => {
                                        if (error) reject(error);
                                        else {
                                            const condition = {
                                                statement: 'ma IN (:linhVucKinhDoanh)',
                                                parameter: { linhVucKinhDoanh: (linhVucKinhDoanh || []).map(item => item.linhVuc) }
                                            };
                                            app.model.dmLinhVucKinhDoanh.getAll(condition, 'ten', null, (error, items) => {
                                                item.tenCacLinhVuc = items;
                                                resolve(item);
                                            });
                                        }
                                    });
                                }
                            }
                        });
                    } else {
                        resolve(item);
                    }
                }
            });
        }).then(company => {
            res.send({ item: company });
            // app.model.dnKyKetDoiTac.getAll({ doanhNghiepId: company.id }, (error, items) => {
            //     if (error) {
            //         reject(error);
            //     } else {
            //         if (items.length) {
            //             const condition = {
            //                 statement: 'id IN (:ids) AND kichHoat=1',
            //                 parameter: {
            //                     ids: items.map(item => item.idKyKet)
            //                 }
            //             };
            //
            //             app.model.dnKyKet.getAll(condition, (error, items) => {
            //                 company.listKyKet = !error && items ? items : [];
            //                 resolve(company);
            //             });
            //         } else {
            //             company.listKyKet = [];
            //             resolve(company);
            //         }
            //     }
            // });
        }).catch(error => res.send({ error }));
    });

    app.get('/user/doi-ngoai/doanh-nghiep/all', (req, res) => {
        app.model.dnDoanhNghiep.searchAll(req.query.loaiThanhPhan, 1, '', (error, result) => {
            res.send({ error, items: result && result.rows || [] });
        });
    });

    // Phân quyền cho các đơn vị ------------------------------------------------------------------------------------------------------------------------
    app.assignRoleHooks.addRoles('quanLyDonVi', { id: 'dnDoanhNghiep:manage', text: 'Quản lý doanh nghiệp' });
    app.assignRoleHooks.addHook('quanLyDonVi', (req, roles) => new Promise(resolve => {
        if (req.session.user && req.session.user.permissions && req.session.user.permissions.includes('manager:write')) {
            const assignRolesList = app.assignRoleHooks.get('quanLyDonVi').map(item => item.id);
            resolve(roles && roles.length && assignRolesList.contains(roles));
        }
    }));

    app.permissionHooks.add('staff', 'checkRoleQuanLyDoanhNghiep', (user, staff) => new Promise(resolve => {
        if (staff.donViQuanLy && staff.donViQuanLy.length) {
            app.permissionHooks.pushUserPermission(user, 'dnDoanhNghiep:manage');
        }
        resolve();
    }));

    app.permissionHooks.add('assignRole', 'checkRoleQuanLyDoanhNghiep', (user, assignRoles) => new Promise(resolve => {
        const inScopeRoles = assignRoles.filter(role => role.nhomRole == 'quanLyDonVi');
        inScopeRoles.forEach(role => {
            if (role.tenRole == 'dnDoanhNghiep:manage') {
                app.permissionHooks.pushUserPermission(user, 'dnDoanhNghiep:manage');
            }
        });
        resolve();
    }));
};