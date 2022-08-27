module.exports = app => {
    const menu = {
        parentMenu: app.parentMenu.tccb,
        menus: {
            3034: { title: 'Đánh giá', link: '/user/tccb/danh-gia', icon: 'fa-user-times', backgroundColor: '#2a99b8', groupIndex: 6 }
        }
    };
    app.permission.add(
        { name: 'tccbDanhGiaNam:read', menu },
        { name: 'tccbDanhGiaNam:write' },
        { name: 'tccbDanhGiaNam:delete' },
    );
    app.get('/user/tccb/danh-gia', app.permission.check('tccbDanhGiaNam:read'), app.templates.admin);
    app.get('/user/tccb/danh-gia/:nam', app.permission.check('tccbDanhGiaNam:read'), app.templates.admin);

    // APIs -----------------------------------------------------------------------------------------------------------------------------------------
    app.get('/api/tccb/danh-gia/page/:pageNumber/:pageSize', app.permission.check('user:login'), (req, res) => {
        const pageNumber = parseInt(req.params.pageNumber),
            pageSize = parseInt(req.params.pageSize),
            condition = req.query.condition || {};
        app.model.tccbDanhGiaNam.getPage(pageNumber, pageSize, condition, (error, page) => res.send({ error, page }));
    });

    app.get('/api/tccb/danh-gia/all', app.permission.check('user:login'), (req, res) => {
        const condition = req.query.condition || {};
        app.model.tccbDanhGiaNam.getAll(condition, '*', 'id', (error, items) => res.send({ error, items }));
    });

    app.get('/api/tccb/danh-gia/item/:id', app.permission.check('user:login'), (req, res) => {
        app.model.tccbDanhGiaNam.get({ id: req.params.id }, (error, item) => res.send({ error, item }));
    });

    app.post('/api/tccb/danh-gia', app.permission.check('tccbDanhGiaNam:write'), (req, res) => {
        const newItem = req.body.item;
        app.model.tccbDanhGiaNam.get({ nam: Number(newItem.nam) }, (error, item) => {
            if (!error && item) {
                res.send({ error: 'Năm đánh giá đã tồn tại' });
            } else {
                app.model.tccbDanhGiaNam.create(newItem, (error, item) => {
                    res.send({ error, item });
                });
            }
        });
    });

    app.put('/api/tccb/danh-gia', app.permission.check('tccbDanhGiaNam:write'), (req, res) => {
        app.model.tccbDanhGiaNam.update({ id: req.body.id }, req.body.changes, (error, item) => res.send({ error, item }));
    });

    app.delete('/api/tccb/danh-gia', app.permission.check('tccbDanhGiaNam:delete'), async (req, res) => {
        try {
            const item = await app.model.tccbDanhGiaNam.get({ id: req.body.id });
            const nam = Number(item.nam);
            await Promise.all([
                app.model.tccbKhungDanhGiaCanBo.delete({ nam }),
                app.model.tccbKhungDanhGiaDonVi.delete({ nam }),
                app.model.tccbDiemThuong.delete({ nam }),
                app.model.tccbDiemTru.delete({ nam }),
                app.model.tccbTyLeDiem.delete({ nam }),
                app.model.tccbDanhGiaNam.delete({ id: req.body.id }),
            ]);
        } catch (error) {
            res.send({ error });
        }
    });

    app.post('/api/tccb/danh-gia/clone', app.permission.check('tccbDanhGiaNam:write'), async (req, res) => {
        const id = req.body.id,
            newItem = req.body.newItem;

        const cloneTyLeDiem = (index, list, oldNam) => {
            if (index == list.length) {
                app.model.tccbDanhGiaNam.create(newItem, (error, item) => {
                    res.send({ error, item });
                });
            } else {
                app.model.tccbTyLeDiem.create({ ...list[index] }, () => {
                    cloneTyLeDiem(index + 1, list, oldNam);
                });
            }
        };

        const cloneDiemTru = (index, list, oldNam) => {
            if (index == list.length) {
                app.model.tccbTyLeDiem.getAll({ nam: oldNam }, (error, itemsTyLeDiem) => {
                    itemsTyLeDiem = itemsTyLeDiem.map(item => {
                        delete item.id;
                        delete item.nam;
                        return {
                            nam: Number(newItem.nam),
                            ...item,
                        };
                    });
                    cloneTyLeDiem(0, itemsTyLeDiem, oldNam);
                });
            } else {
                app.model.tccbDiemTru.create({ ...list[index] }, () => {
                    cloneDiemTru(index + 1, list, oldNam);
                });
            }
        };

        const cloneDiemThuong = (index, list, oldNam) => {
            if (index == list.length) {
                app.model.tccbDiemTru.getAll({ nam: oldNam }, (error, itemsDiemTru) => {
                    itemsDiemTru = itemsDiemTru.map(item => {
                        delete item.id;
                        delete item.nam;
                        return {
                            nam: Number(newItem.nam),
                            ...item,
                        };
                    });
                    cloneDiemTru(0, itemsDiemTru, oldNam);
                });
            } else {
                app.model.tccbDiemThuong.create({ ...list[index] }, () => {
                    cloneDiemThuong(index + 1, list, oldNam);
                });
            }
        };

        const cloneKhungDanhGiaDonViCon = (indexCha, index, submenus, list, oldNam) => {
            if (index == submenus.length) {
                cloneKhungDanhGiaDonViCha(indexCha + 1, list, oldNam);
            } else {
                app.model.tccbKhungDanhGiaDonVi.create({ ...submenus[index] }, () => {
                    cloneKhungDanhGiaDonViCon(indexCha, index + 1, submenus, list, oldNam);
                });
            }
        };

        const cloneKhungDanhGiaDonViCha = (index, list, oldNam) => {
            if (index == list.length) {
                app.model.tccbDiemThuong.getAll({ nam: oldNam }, (error, itemsDiemThuong) => {
                    itemsDiemThuong = itemsDiemThuong.map(item => {
                        delete item.id;
                        delete item.nam;
                        return {
                            nam: Number(newItem.nam),
                            ...item,
                        };
                    });
                    cloneDiemThuong(0, itemsDiemThuong, oldNam);
                });
            } else {
                delete list[index].id;
                let submenus = list[index].submenus;
                delete list[index].submenus;
                app.model.tccbKhungDanhGiaDonVi.create({ ...list[index] }, (error, newItem) => {
                    submenus = submenus.map(item => {
                        delete item.id;
                        delete item.parentId;
                        return { ...item, parentId: newItem.id };
                    });
                    cloneKhungDanhGiaDonViCon(index, 0, submenus, list, oldNam);
                });
            }
        };

        const cloneKhungDanhGiaCanBo = (index, list, oldNam) => {
            if (index == list.length) {
                app.model.tccbKhungDanhGiaDonVi.getAll({ nam: oldNam }, (error, itemsDonVi) => {
                    const cloneDonVi = itemsDonVi.map(donVi => {
                        delete donVi.nam;
                        return { ...donVi, nam: Number(newItem.nam) };
                    });
                    let parentItems = cloneDonVi.filter(item => !item.parentId);
                    parentItems = parentItems.map(parent => ({ ...parent, submenus: cloneDonVi.filter(item => item.parentId == parent.id) }));
                    cloneKhungDanhGiaDonViCha(0, parentItems, oldNam);
                });
            } else {
                app.model.tccbKhungDanhGiaCanBo.create({ ...list[index] }, () => {
                    cloneKhungDanhGiaCanBo(index + 1, list, oldNam);
                });
            }
        };

        app.model.tccbDanhGiaNam.get({ nam: Number(newItem.nam) }, (error, item) => {
            if (item) {
                res.send({ error: 'Năm đánh giá đã tồn tại' });
            } else {
                app.model.tccbDanhGiaNam.get({ id }, (error, item) => {
                    app.model.tccbKhungDanhGiaCanBo.getAll({ nam: item.nam }, (error, itemsCanBo) => {
                        const cloneCanBo = itemsCanBo.map(canBo => {
                            delete canBo.id;
                            delete canBo.nam;
                            return { ...canBo, nam: Number(newItem.nam) };
                        });
                        cloneKhungDanhGiaCanBo(0, cloneCanBo, item.nam);
                    });
                });
            }
        });
    });
};